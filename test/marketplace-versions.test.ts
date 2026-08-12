import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * marketplace.json advertises a version per plugin, but release-please only
 * rewrites each plugin's own plugin.json. Before this was wired up, 8 of 9
 * entries had been frozen at 1.0.0 while the plugins moved on — so the
 * marketplace served version numbers that were simply wrong.
 *
 * These tests guard both halves: the versions agree today, and every published
 * plugin still has the release-please config that keeps them agreeing.
 */

const MANIFEST_PATH = ".claude-plugin/marketplace.json";

const marketplace = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
const releaseConfig = JSON.parse(
	await readFile("release-please-config.json", "utf8"),
);

const published: {
	name: string;
	version: string;
	source: string;
	description: string;
}[] = marketplace.plugins;

const pluginManifest = (name: string) =>
	readFile(join("plugins", name, ".claude-plugin", "plugin.json"), "utf8").then(
		JSON.parse,
	);

describe("marketplace.json agrees with each plugin.json", () => {
	test.each(
		published.map((p) => [p.name] as const),
	)("%s advertises the version it actually ships", async (name) => {
		const manifest = await pluginManifest(name);
		const entry = published.find((p) => p.name === name);
		expect(entry?.version).toBe(manifest.version);
	});

	/**
	 * Version was not the only field that drifted. Nothing syncs `description`
	 * either, and three plugins had diverged — git-workflow still read "and
	 * more" in its plugin.json long after marketplace.json described the real
	 * skill set, while sitegraph's marketplace entry was a truncated copy.
	 * Whichever file is edited, the browse text and the installed text must
	 * still say the same thing.
	 */
	test.each(
		published.map((p) => [p.name] as const),
	)("%s describes itself the same way in both files", async (name) => {
		const manifest = await pluginManifest(name);
		const entry = published.find((p) => p.name === name);
		expect(entry?.description).toBe(manifest.description);
	});
});

describe("release-please keeps them in sync", () => {
	const packages = Object.entries<{
		component?: string;
		"extra-files"?: { jsonpath?: string; path?: string; type?: string }[];
	}>(releaseConfig.packages);

	test("every published plugin has a release-please package", () => {
		const components = new Set(packages.map(([, p]) => p.component));
		const missing = published
			.map((p) => p.name)
			.filter((n) => !components.has(n));
		expect(missing).toEqual([]);
	});

	test("no release-please package points at a plugin that was removed", () => {
		const names = new Set(published.map((p) => p.name));
		const dangling = packages
			.map(([, p]) => p.component)
			.filter((c): c is string => !!c && !names.has(c));
		expect(dangling).toEqual([]);
	});

	test.each(
		published.map((p) => [p.name] as const),
	)("%s updates its marketplace.json entry on release", (name) => {
		const pkg = packages.find(([, p]) => p.component === name)?.[1];
		const extra = pkg?.["extra-files"]?.find(
			(f) => f.path === `/${MANIFEST_PATH}`,
		);

		expect(extra).toBeDefined();
		// A leading slash is repo-root-relative; "../" is rejected outright by
		// release-please's addPath (strategies/base.js).
		expect(extra?.path?.startsWith("/")).toBe(true);
		expect(extra?.type).toBe("json");
		// The filter selects exactly this plugin's entry, not an array index,
		// so reordering marketplace.json cannot point the update elsewhere.
		expect(extra?.jsonpath).toBe(`$.plugins[?(@.name=='${name}')].version`);
	});

	test.each(
		published.map((p) => [p.name] as const),
	)("%s still rewrites its own plugin.json", (name) => {
		const pkg = packages.find(([, p]) => p.component === name)?.[1];
		const own = pkg?.["extra-files"]?.find(
			(f) => f.path === ".claude-plugin/plugin.json",
		);
		expect(own?.jsonpath).toBe("$.version");
	});
});

describe("plugin sources resolve", () => {
	test.each(
		published.map((p) => [p.name, p.source] as const),
	)("%s source path exists", async (name, source) => {
		expect(source).toBe(`./plugins/${name}`);
		const manifest = await readFile(
			join("plugins", name, ".claude-plugin", "plugin.json"),
			"utf8",
		);
		expect(JSON.parse(manifest).name).toBe(name);
	});
});
