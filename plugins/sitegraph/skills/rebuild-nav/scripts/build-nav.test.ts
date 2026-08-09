import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
	chmod,
	mkdir,
	mkdtemp,
	readFile,
	rm,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/**
 * Regression tests for build-nav.ts.
 *
 * Every case here maps to a bug that shipped, so each one asserts observable
 * output of the real script rather than an internal function: the script is a
 * CLI with a top-level main(), and all three defects were only visible from
 * the outside anyway.
 */

const SCRIPT = join(import.meta.dir, "build-nav.ts");

// chmod-based tests are meaningless for a user that bypasses permission bits.
const CANNOT_TEST_PERMISSIONS =
	process.platform === "win32" || process.getuid?.() === 0;

interface Run {
	exitCode: number;
	stdout: string;
	stderr: string;
}

async function runNav(siteRoot: string, ...args: string[]): Promise<Run> {
	const proc = Bun.spawn(["bun", "run", SCRIPT, siteRoot, ...args], {
		stdout: "pipe",
		stderr: "pipe",
	});
	const [stdout, stderr] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
	]);
	return { exitCode: await proc.exited, stdout, stderr };
}

/** Write a minimal page; omit the title to exercise the filename fallback. */
async function writePage(path: string, title?: string): Promise<void> {
	await mkdir(dirname(path), { recursive: true });
	await writeFile(
		path,
		[
			"<!DOCTYPE html>",
			'<html lang="en">',
			`<head>${title ? `<title>${title}</title>` : ""}</head>`,
			"<body>",
			"<p>Hand-authored content.</p>",
			"</body>",
			"</html>",
			"",
		].join("\n"),
		"utf8",
	);
}

let site: string;

beforeEach(async () => {
	site = await mkdtemp(join(tmpdir(), "sitegraph-"));
	await writePage(join(site, "index.html"), "Home");
	await writePage(join(site, "audits", "index.html"), "Audits");
	await writePage(join(site, "audits", "2026-q1", "01-intro.html"));
	await writePage(
		join(site, "audits", "2026-q1", "02-findings.html"),
		"Findings",
	);
	await writePage(
		join(site, "audits", "2026-q1", "10-appendix.html"),
		"Appendix",
	);
});

afterEach(async () => {
	await rm(site, { recursive: true, force: true });
});

describe("the sitemap is generated output, not a discovered page", () => {
	test("the page count is stable across reruns", async () => {
		const runs = [await runNav(site), await runNav(site), await runNav(site)];
		for (const run of runs) {
			expect(run.exitCode).toBe(0);
			expect(run.stdout).toContain("5 page(s) discovered");
		}
	});

	test("the sitemap does not list itself", async () => {
		// Two runs on purpose: the sitemap does not exist during the first
		// walk, so self-discovery can only show up from the second run on.
		await runNav(site);
		await runNav(site);
		const sitemap = await readFile(join(site, "sitemap.html"), "utf8");
		expect(sitemap).not.toContain('href="sitemap.html"');
	});

	test("a freshly built site is already clean under --check", async () => {
		await runNav(site);
		const check = await runNav(site, "--check");
		expect(check.exitCode).toBe(0);
		expect(check.stdout).toContain("0 would update");
	});
});

describe("humanize keeps years but strips ordering prefixes", () => {
	test("a four-digit year survives in a section title", async () => {
		await runNav(site);
		const sitemap = await readFile(join(site, "sitemap.html"), "utf8");
		expect(sitemap).toContain(">2026 Q1<");
		expect(sitemap).not.toContain(">Q1<");
	});

	test("the year survives in a page breadcrumb", async () => {
		await runNav(site);
		const findings = await readFile(
			join(site, "audits", "2026-q1", "02-findings.html"),
			"utf8",
		);
		expect(findings).toContain(">2026 Q1<");
	});

	test("a short numeric prefix is still stripped from a filename", async () => {
		await runNav(site);
		const sitemap = await readFile(join(site, "sitemap.html"), "utf8");
		// 01-intro.html has no <title>, so its label comes from humanize().
		expect(sitemap).toContain(">Intro<");
		expect(sitemap).not.toContain(">01 Intro<");
	});
});

describe("I/O failures degrade to warnings", () => {
	test.skipIf(CANNOT_TEST_PERMISSIONS)(
		"an unreadable directory does not abort the whole rebuild",
		async () => {
			const locked = join(site, "locked");
			await mkdir(locked);
			await writePage(join(locked, "secret.html"), "Secret");
			await chmod(locked, 0o000);

			try {
				const run = await runNav(site);

				expect(run.exitCode).toBe(0);
				expect(run.stderr).toContain("could not read directory");

				// Pages outside the unreadable subtree must still be written.
				const home = await readFile(join(site, "index.html"), "utf8");
				expect(home).toContain("<!-- sitegraph:nav:start -->");
				expect(home).toContain("<!-- sitegraph:footer:start -->");
			} finally {
				await chmod(locked, 0o755);
			}
		},
	);

	test("an unreadable page is skipped without failing the run", async () => {
		await writeFile(join(site, "broken.html"), "no head or body here", "utf8");
		const run = await runNav(site);

		expect(run.exitCode).toBe(0);
		expect(run.stderr).toContain("anchor found");
		const home = await readFile(join(site, "index.html"), "utf8");
		expect(home).toContain("<!-- sitegraph:nav:start -->");
	});
});
