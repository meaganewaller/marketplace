#!/usr/bin/env bun
/**
 * sitegraph rebuild-nav
 *
 * Walks a site root and treats the directory tree itself as the navigation
 * graph: every subdirectory is a section, every *.html file is a page. It
 * (re)writes the auto-generated <head> link, nav rail, breadcrumb, and
 * pager blocks inside every discovered page, plus a full sitemap page at
 * the site root — using only marker-delimited blocks so hand-authored
 * content is never touched.
 *
 * Zero dependencies: Bun/Node built-ins only, no network access, no build
 * step. A file is only written back if its generated content changed, so
 * reruns produce clean, minimal diffs.
 *
 * Usage:
 *   bun run build-nav.ts [site-root] [--check]
 *
 * --check   Dry run: report what would change, write nothing, exit 1 if
 *           anything is out of date. Useful for catching hand-edited
 *           marker blocks in CI.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

const MARKETPLACE_REPO = "meaganewaller/marketplace";
const KERNEL_CSS_PATH = "plugins/sitegraph/assets/kernel.css";

interface Config {
	title: string;
	cssUrl: string | null;
	sitemapFile: string;
	sitemapTitle: string;
	ignore: string[];
}

interface PageNode {
	type: "page";
	fsPath: string;
	order: string;
	title: string;
}

interface DirNode {
	type: "dir";
	fsPath: string;
	order: string;
	title: string;
	indexPage: PageNode | null;
	children: GraphNode[];
}

type GraphNode = PageNode | DirNode;

interface Counts {
	updated: number;
	unchanged: number;
}

const DEFAULT_IGNORE = [".git", ".claude", "node_modules", ".DS_Store"];

async function main() {
	const args = process.argv.slice(2);
	const checkOnly = args.includes("--check");
	const siteRootArg = args.find((a) => !a.startsWith("--")) ?? ".";
	const siteRoot = resolve(siteRootArg);

	const config = await loadOrInitConfig(siteRoot, checkOnly);
	const sitemapPath = join(siteRoot, config.sitemapFile);
	const cssUrl = config.cssUrl ?? (await derivePinnedCssUrl());

	const warnings: string[] = [];
	const tree = await buildTree(
		siteRoot,
		siteRoot,
		sitemapPath,
		config,
		warnings,
	);
	const pages = flattenPages(tree);
	const counts: Counts = { updated: 0, unchanged: 0 };

	const sitemapHtml = renderSitemapPage(tree, pages, config, cssUrl);
	await writeIfChanged(sitemapPath, sitemapHtml, checkOnly, counts);

	for (const page of pages) {
		if (page.fsPath === sitemapPath) continue;
		let original: string;
		try {
			original = await readFile(page.fsPath, "utf8");
		} catch (err) {
			warnings.push(
				`${relative(siteRoot, page.fsPath)}: could not read file (${(err as Error).message})`,
			);
			continue;
		}
		const rewritten = rewritePage(
			original,
			page,
			tree,
			sitemapPath,
			cssUrl,
			warnings,
			siteRoot,
		);
		await writeIfChanged(page.fsPath, rewritten, checkOnly, counts);
	}

	const verb = checkOnly ? "would update" : "updated";
	console.log(
		`sitegraph: ${pages.length} page(s) discovered, ${counts.updated} ${verb}, ${counts.unchanged} unchanged`,
	);
	for (const warning of warnings) console.warn(`sitegraph warning: ${warning}`);

	if (checkOnly && counts.updated > 0) process.exitCode = 1;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

async function loadOrInitConfig(
	siteRoot: string,
	checkOnly: boolean,
): Promise<Config> {
	const configPath = join(siteRoot, "sitegraph.config.json");
	try {
		const raw = await readFile(configPath, "utf8");
		const parsed = JSON.parse(raw);
		return {
			title: parsed.title ?? humanize(basename(siteRoot)),
			cssUrl: parsed.cssUrl ?? null,
			sitemapFile: parsed.sitemapFile ?? "sitemap.html",
			sitemapTitle: parsed.sitemapTitle ?? "Sitemap",
			ignore: Array.isArray(parsed.ignore) ? parsed.ignore : DEFAULT_IGNORE,
		};
	} catch {
		const defaults: Config = {
			title: humanize(basename(siteRoot)),
			cssUrl: null,
			sitemapFile: "sitemap.html",
			sitemapTitle: "Sitemap",
			ignore: DEFAULT_IGNORE,
		};
		if (!checkOnly) {
			await writeFile(
				configPath,
				`${JSON.stringify(defaults, null, 2)}\n`,
				"utf8",
			);
		}
		return defaults;
	}
}

async function derivePinnedCssUrl(): Promise<string> {
	const pluginJsonPath = join(
		import.meta.dir,
		"..",
		"..",
		"..",
		".claude-plugin",
		"plugin.json",
	);
	const raw = await readFile(pluginJsonPath, "utf8");
	const { version } = JSON.parse(raw);
	return `https://cdn.jsdelivr.net/gh/${MARKETPLACE_REPO}@sitegraph-v${version}/${KERNEL_CSS_PATH}`;
}

// ---------------------------------------------------------------------------
// Tree building
// ---------------------------------------------------------------------------

async function buildTree(
	dir: string,
	siteRoot: string,
	sitemapPath: string,
	config: Config,
	warnings: string[],
): Promise<DirNode> {
	const entries = await readdir(dir, { withFileTypes: true });
	const children: GraphNode[] = [];
	let indexPage: PageNode | null = null;

	for (const entry of entries.sort((a, b) => naturalCompare(a.name, b.name))) {
		if (entry.name.startsWith(".") || config.ignore.includes(entry.name))
			continue;
		const fsPath = join(dir, entry.name);

		if (entry.isDirectory()) {
			const child = await buildTree(
				fsPath,
				siteRoot,
				sitemapPath,
				config,
				warnings,
			);
			children.push(child);
			continue;
		}

		if (!entry.isFile() || !/\.html?$/i.test(entry.name)) continue;

		const page = await buildPageNode(fsPath, sitemapPath, config, warnings);
		children.push(page);
		if (/^index\.html?$/i.test(entry.name)) indexPage = page;
	}

	return {
		type: "dir",
		fsPath: dir,
		order: basename(dir),
		title: indexPage ? indexPage.title : humanize(basename(dir) || dir),
		indexPage,
		children,
	};
}

async function buildPageNode(
	fsPath: string,
	sitemapPath: string,
	config: Config,
	warnings: string[],
): Promise<PageNode> {
	const fallback = humanize(basename(fsPath).replace(/\.html?$/i, ""));

	if (fsPath === sitemapPath) {
		return {
			type: "page",
			fsPath,
			order: basename(fsPath),
			title: config.sitemapTitle,
		};
	}

	try {
		const html = await readFile(fsPath, "utf8");
		return {
			type: "page",
			fsPath,
			order: basename(fsPath),
			title: extractTitle(html, fallback),
		};
	} catch (err) {
		warnings.push(
			`${basename(fsPath)}: could not read for title extraction (${(err as Error).message})`,
		);
		return { type: "page", fsPath, order: basename(fsPath), title: fallback };
	}
}

function flattenPages(node: GraphNode, acc: PageNode[] = []): PageNode[] {
	if (node.type === "page") {
		acc.push(node);
		return acc;
	}
	for (const child of node.children) flattenPages(child, acc);
	return acc;
}

function collectAncestors(
	root: DirNode,
	targetFsPath: string,
	chain: DirNode[] = [],
): DirNode[] | null {
	const nextChain = [...chain, root];
	for (const child of root.children) {
		if (child.type === "page" && child.fsPath === targetFsPath)
			return nextChain;
		if (child.type === "dir") {
			const found = collectAncestors(child, targetFsPath, nextChain);
			if (found) return found;
		}
	}
	return null;
}

function findDir(root: DirNode, dirPath: string): DirNode | null {
	if (root.fsPath === dirPath) return root;
	for (const child of root.children) {
		if (child.type === "dir") {
			const found = findDir(child, dirPath);
			if (found) return found;
		}
	}
	return null;
}

// ---------------------------------------------------------------------------
// Rewriting a single page
// ---------------------------------------------------------------------------

function rewritePage(
	original: string,
	page: PageNode,
	root: DirNode,
	sitemapPath: string,
	cssUrl: string,
	warnings: string[],
	siteRoot: string,
): string {
	const fromDir = dirname(page.fsPath);
	const ancestors = collectAncestors(root, page.fsPath) ?? [root];
	const currentDirs = new Set(ancestors.map((a) => a.fsPath));
	const relLabel = relative(siteRoot, page.fsPath);

	let html = original;

	html = tryInject(
		html,
		"head",
		`<link rel="stylesheet" href="${escapeAttr(cssUrl)}">`,
		/<head[^>]*>/i,
		"after",
		warnings,
		relLabel,
	);

	const rail = renderRail(root, fromDir, currentDirs, page.fsPath);
	const breadcrumb = renderBreadcrumb(ancestors, page, fromDir);
	html = tryInject(
		html,
		"nav",
		`${rail}\n<div class="sitegraph-page">\n${breadcrumb}`,
		/<body[^>]*>/i,
		"after",
		warnings,
		relLabel,
	);

	const parentDir = findDir(root, fromDir);
	const siblings = parentDir
		? parentDir.children.filter(
				(c): c is PageNode =>
					c.type === "page" &&
					c.fsPath !== sitemapPath &&
					!/^index\.html?$/i.test(basename(c.fsPath)),
			)
		: [];
	const { prev, next } = findPrevNext(siblings, page.fsPath);
	const footer = renderFooter(prev, next, fromDir, sitemapPath);
	html = tryInject(
		html,
		"footer",
		`${footer}\n</div>`,
		/<\/body>/i,
		"before",
		warnings,
		relLabel,
	);

	return html;
}

function findPrevNext(
	siblings: PageNode[],
	currentFsPath: string,
): { prev: PageNode | null; next: PageNode | null } {
	const sorted = [...siblings].sort((a, b) => naturalCompare(a.order, b.order));
	const idx = sorted.findIndex((p) => p.fsPath === currentFsPath);
	if (idx === -1) return { prev: null, next: null };
	return { prev: sorted[idx - 1] ?? null, next: sorted[idx + 1] ?? null };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function renderRail(
	root: DirNode,
	fromDir: string,
	currentDirs: Set<string>,
	currentFile: string | null,
): string {
	const items = renderChildren(root, fromDir, currentDirs, currentFile);
	return [
		'<nav id="sitegraph-rail" aria-label="Site navigation">',
		'<details class="sitegraph-rail-toggle" open>',
		`<summary class="sitegraph-rail-title">${escapeHtml(root.title)}</summary>`,
		`<ul>${items}</ul>`,
		"</details>",
		"</nav>",
	].join("\n");
}

function renderChildren(
	node: DirNode,
	fromDir: string,
	currentDirs: Set<string>,
	currentFile: string | null,
): string {
	const sorted = [...node.children].sort((a, b) =>
		naturalCompare(a.order, b.order),
	);
	return sorted
		.map((child) => renderNode(child, fromDir, currentDirs, currentFile))
		.join("");
}

function renderNode(
	node: GraphNode,
	fromDir: string,
	currentDirs: Set<string>,
	currentFile: string | null,
): string {
	if (node.type === "page") {
		if (/^index\.html?$/i.test(basename(node.fsPath))) return "";
		const isCurrent = node.fsPath === currentFile;
		const href = relHref(fromDir, node.fsPath);
		const attrs = isCurrent
			? ' aria-current="page" class="sitegraph-current"'
			: "";
		return `<li><a href="${href}"${attrs}>${escapeHtml(node.title)}</a></li>`;
	}

	const isOpen = currentDirs.has(node.fsPath);
	const label = node.indexPage
		? `<a href="${relHref(fromDir, node.indexPage.fsPath)}"${
				node.indexPage.fsPath === currentFile
					? ' aria-current="page" class="sitegraph-current"'
					: ""
			}>${escapeHtml(node.title)}</a>`
		: `<span>${escapeHtml(node.title)}</span>`;
	const childItems = renderChildren(node, fromDir, currentDirs, currentFile);
	if (!childItems) return "";
	return `<li><details${isOpen ? " open" : ""}><summary>${label}</summary><ul>${childItems}</ul></details></li>`;
}

function renderBreadcrumb(
	ancestors: DirNode[],
	page: PageNode,
	fromDir: string,
): string {
	const crumbs = ancestors.map((dir) => {
		if (dir.indexPage?.fsPath === page.fsPath)
			return `<span aria-current="page">${escapeHtml(dir.title)}</span>`;
		return dir.indexPage
			? `<a href="${relHref(fromDir, dir.indexPage.fsPath)}">${escapeHtml(dir.title)}</a>`
			: `<span>${escapeHtml(dir.title)}</span>`;
	});
	if (!ancestors.some((dir) => dir.indexPage?.fsPath === page.fsPath)) {
		crumbs.push(`<span aria-current="page">${escapeHtml(page.title)}</span>`);
	}
	const sep = '<span class="sitegraph-breadcrumb-sep">/</span>';
	return `<nav class="sitegraph-breadcrumb" aria-label="Breadcrumb">${crumbs.join(sep)}</nav>`;
}

function renderFooter(
	prev: PageNode | null,
	next: PageNode | null,
	fromDir: string,
	sitemapPath: string,
): string {
	const prevHtml = prev
		? `<a class="sitegraph-prev" href="${relHref(fromDir, prev.fsPath)}">← ${escapeHtml(prev.title)}</a>`
		: "<span></span>";
	const nextHtml = next
		? `<a class="sitegraph-next" href="${relHref(fromDir, next.fsPath)}">${escapeHtml(next.title)} →</a>`
		: "<span></span>";
	return [
		'<footer class="sitegraph-footer">',
		`<nav class="sitegraph-pager" aria-label="Sequential navigation">${prevHtml}${nextHtml}</nav>`,
		`<p class="sitegraph-meta">Navigation generated from the folder structure by sitegraph. Edit page content freely; rerun rebuild-nav after adding, moving, or removing pages. <a href="${relHref(fromDir, sitemapPath)}">Full sitemap</a>.</p>`,
		"</footer>",
	].join("\n");
}

function renderSitemapPage(
	root: DirNode,
	pages: PageNode[],
	config: Config,
	cssUrl: string,
): string {
	const fromDir = root.fsPath;
	const tree = renderFullTree(root, fromDir);
	const pageCount = pages.length;
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(config.sitemapTitle)} — ${escapeHtml(config.title)}</title>
<!-- sitegraph:head:start -->
<link rel="stylesheet" href="${escapeAttr(cssUrl)}">
<!-- sitegraph:head:end -->
</head>
<body>
<!-- sitegraph:nav:start -->
${renderRail(root, fromDir, new Set([root.fsPath]), null)}
<div class="sitegraph-page">
<nav class="sitegraph-breadcrumb" aria-label="Breadcrumb"><span aria-current="page">${escapeHtml(config.sitemapTitle)}</span></nav>
<!-- sitegraph:nav:end -->
<h1>${escapeHtml(config.sitemapTitle)}</h1>
<p>${pageCount} page(s) across the site, generated from the folder structure. This file is fully generated — do not hand-edit it, rerun rebuild-nav instead.</p>
<div class="sitegraph-full-tree">
<ul>${tree}</ul>
</div>
<!-- sitegraph:footer:start -->
<footer class="sitegraph-footer">
<p class="sitegraph-meta">Generated by sitegraph.</p>
</footer>
</div>
<!-- sitegraph:footer:end -->
</body>
</html>
`;
}

function renderFullTree(node: DirNode, fromDir: string): string {
	const sorted = [...node.children].sort((a, b) =>
		naturalCompare(a.order, b.order),
	);
	return sorted
		.map((child) => {
			if (child.type === "page") {
				if (/^index\.html?$/i.test(basename(child.fsPath))) return "";
				return `<li><a href="${relHref(fromDir, child.fsPath)}">${escapeHtml(child.title)}</a></li>`;
			}
			const label = child.indexPage
				? `<a href="${relHref(fromDir, child.indexPage.fsPath)}">${escapeHtml(child.title)}</a>`
				: `<span>${escapeHtml(child.title)}</span>`;
			const inner = renderFullTree(child, fromDir);
			if (!inner) return "";
			return `<li><details open><summary>${label}</summary><ul>${inner}</ul></details></li>`;
		})
		.join("");
}

// ---------------------------------------------------------------------------
// Marker injection
// ---------------------------------------------------------------------------

function tryInject(
	html: string,
	tag: string,
	block: string,
	anchor: RegExp,
	position: "after" | "before",
	warnings: string[],
	fileLabel: string,
): string {
	try {
		return injectBlock(html, tag, block, anchor, position);
	} catch {
		warnings.push(
			`${fileLabel}: no <${position === "after" ? "head/body" : "/body"}> anchor found for "${tag}" block — skipped`,
		);
		return html;
	}
}

function injectBlock(
	html: string,
	tag: string,
	block: string,
	anchor: RegExp,
	position: "after" | "before",
): string {
	const startMarker = `<!-- sitegraph:${tag}:start -->`;
	const endMarker = `<!-- sitegraph:${tag}:end -->`;
	const wrapped = `${startMarker}\n${block}\n${endMarker}`;
	const markerRe = new RegExp(
		`${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}`,
	);

	if (markerRe.test(html)) return html.replace(markerRe, wrapped);
	if (!anchor.test(html)) throw new Error(`no anchor for ${tag}`);

	return position === "after"
		? html.replace(anchor, (m) => `${m}\n${wrapped}`)
		: html.replace(anchor, (m) => `${wrapped}\n${m}`);
}

// ---------------------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------------------

function naturalCompare(a: string, b: string): number {
	const runs = /(\d+)|(\D+)/g;
	const ax = a.match(runs) ?? [];
	const bx = b.match(runs) ?? [];
	const len = Math.max(ax.length, bx.length);
	for (let i = 0; i < len; i++) {
		const av = ax[i] ?? "";
		const bv = bx[i] ?? "";
		if (av === bv) continue;
		const an = Number(av);
		const bn = Number(bv);
		if (!Number.isNaN(an) && !Number.isNaN(bn) && av !== "" && bv !== "")
			return an - bn;
		return av < bv ? -1 : 1;
	}
	return 0;
}

function humanize(name: string): string {
	const stripped = name.replace(/^\d+[-_]+/, "");
	const words = stripped
		.replace(/[-_]+/g, " ")
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	if (words.length === 0) return name;
	return words
		.map((w) =>
			w === w.toUpperCase() && w.length > 1
				? w
				: w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
		)
		.join(" ");
}

function extractTitle(html: string, fallback: string): string {
	const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
	if (titleMatch) {
		const text = stripTags(titleMatch[1]).trim();
		if (text) return text;
	}
	const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
	if (h1Match) {
		const text = stripTags(h1Match[1]).trim();
		if (text) return text;
	}
	return fallback;
}

function stripTags(s: string): string {
	return decodeEntities(s.replace(/<[^>]+>/g, ""));
}

function decodeEntities(s: string): string {
	return s
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'")
		.replace(/&nbsp;/g, " ");
}

function escapeHtml(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
	return escapeHtml(s).replace(/"/g, "&quot;");
}

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function relHref(fromDir: string, toFile: string): string {
	const rel = relative(fromDir, toFile).split(sep).join("/");
	return rel.split("/").map(encodeURIComponent).join("/");
}

// ---------------------------------------------------------------------------
// I/O
// ---------------------------------------------------------------------------

async function writeIfChanged(
	path: string,
	content: string,
	checkOnly: boolean,
	counts: Counts,
): Promise<void> {
	let existing: string | null = null;
	try {
		existing = await readFile(path, "utf8");
	} catch {
		existing = null;
	}
	if (existing === content) {
		counts.unchanged++;
		return;
	}
	counts.updated++;
	if (!checkOnly) await writeFile(path, content, "utf8");
}

main().catch((err) => {
	console.error(`sitegraph: ${(err as Error).message}`);
	process.exit(1);
});
