#!/usr/bin/env node
/**
 * Lotto Global — Production Build Script
 * Transpiles JSX → JS, swaps React dev → prod, removes Babel standalone,
 * minifies assets, and outputs to dist/
 */
import { promises as fs } from "fs";
import { join, dirname, basename, extname } from "path";
import { fileURLToPath } from "url";
import * as esbuild from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = __dirname;
const OUT = join(__dirname, "dist");

const REACT_PROD = [
  `https://unpkg.com/react@18.3.1/umd/react.production.min.js`,
  `https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js`,
];

const REACT_DEV_PATTERNS = [
  /https:\/\/unpkg\.com\/react@.*?\/umd\/react\.development\.js/,
  /https:\/\/unpkg\.com\/react-dom@.*?\/umd\/react-dom\.development\.js/,
];

const BABEL_PATTERN = /https:\/\/unpkg\.com\/@babel\/standalone@.*?\/babel\.min\.js/;

async function clean() {
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });
}

async function transpileJsx() {
  const files = await fs.readdir(SRC);
  const jsxFiles = files.filter((f) => f.endsWith(".jsx"));
  const HOOKS = ["useState", "useEffect", "useRef", "useMemo", "useCallback"];
  for (const file of jsxFiles) {
    const inPath = join(SRC, file);
    const outPath = join(OUT, file.replace(/\.jsx$/, ".js"));

    let code = await fs.readFile(inPath, "utf8");
    const usesHooks = HOOKS.some((h) => code.includes(h));
    const hasReactImport = /=[\s]*React[;\s]/.test(code) || /from\s+['"]react['"]/.test(code);
    if (usesHooks && !hasReactImport) {
      code = `const {useState,useEffect,useRef,useMemo,useCallback}=React;\n${code}`;
    }

    await esbuild.build({
      stdin: { contents: code, loader: "jsx", resolveDir: SRC },
      outfile: outPath,
      format: "iife",
      jsxFactory: "React.createElement",
      jsxFragment: "React.Fragment",
      minify: true,
      target: "es2020",
    });
    console.log(`  ✓ ${file} → dist/${basename(outPath)}`);
  }
}

async function buildLandingBundle() {
  // Viral Launch page needs all scripts in one scope
  // Concatenate source files, then transpile as one unit
  const order = ["data.js", "image-slot.js", "components.jsx", "viral.jsx", "viral-b.jsx"];
  let bundleSrc = "";
  for (const file of order) {
    const path = join(SRC, file);
    try {
      const content = await fs.readFile(path, "utf8");
      bundleSrc += content + "\n";
    } catch (e) {
      console.log(`  ⚠️  ${file} not found for bundle`);
    }
  }

  // Deduplicate React hook declarations — strip existing ones, add one at top
  bundleSrc = bundleSrc.replace(/const\s*\{\s*useState[^}]+\}\s*=\s*React;\s*\n?/g, "");
  const HOOKS = ["useState", "useEffect", "useRef", "useMemo", "useCallback"];
  const usesHooks = HOOKS.some((h) => bundleSrc.includes(h));
  if (usesHooks) {
    bundleSrc = `const {useState,useEffect,useRef,useMemo,useCallback}=React;\n${bundleSrc}`;
  }

  const outPath = join(OUT, "viral-bundle.js");
  await esbuild.build({
    stdin: { contents: bundleSrc, loader: "jsx", resolveDir: SRC },
    outfile: outPath,
    format: "iife",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    minify: true,
    target: "es2020",
  });
  console.log(`  ✓ viral-bundle.js (landing page bundle)`);
}

async function copyStatic() {
  const files = await fs.readdir(SRC, { withFileTypes: true });
  for (const ent of files) {
    const srcPath = join(SRC, ent.name);
    const dstPath = join(OUT, ent.name);
    if (ent.name === "dist") continue;
    if (ent.name.endsWith(".jsx")) continue;
    if (ent.name === "build.mjs") continue;
    if (ent.name === "package.json") continue;
    if (ent.name === "node_modules") continue;
    if (ent.name === ".git") continue;

    if (ent.isDirectory()) {
      await fs.cp(srcPath, dstPath, { recursive: true });
      console.log(`  ✓ ${ent.name}/ → dist/${ent.name}/`);
    } else {
      // Minify .css files
      if (ent.name.endsWith(".css")) {
        const css = await fs.readFile(srcPath, "utf8");
        const result = await esbuild.transform(css, { loader: "css", minify: true });
        await fs.writeFile(dstPath, result.code);
        console.log(`  ✓ ${ent.name} → dist/${ent.name} (minified)`);
      } else {
        await fs.copyFile(srcPath, dstPath);
        console.log(`  ✓ ${ent.name} → dist/${ent.name}`);
      }
    }
  }
}

async function processHtml() {
  const files = await fs.readdir(SRC);
  const htmlFiles = files.filter((f) => f.endsWith(".html"));
  for (const file of htmlFiles) {
    let html = await fs.readFile(join(SRC, file), "utf8");

    // Replace React development URLs with production (and remove stale integrity)
    REACT_DEV_PATTERNS.forEach((pat, i) => {
      html = html.replace(pat, REACT_PROD[i]);
    });
    html = html.replace(/integrity="[^"]*"\s+(crossorigin="anonymous")/g, '$1');
    html = html.replace(/\s+integrity="[^"]*"/g, '');

    // Remove Babel standalone script tag
    html = html.replace(
      /<script[^>]*src="https:\/\/unpkg\.com\/@babel\/standalone@[^"]*"[^>]*><\/script>\n?/g,
      ""
    );

    // Replace type="text/babel" src="*.jsx" with src="*.js"
    html = html.replace(
      /<script\s+type="text\/babel"\s+src="([^"]+)\.jsx"><\/script>/g,
      '<script src="$1.js"></script>'
    );

    // Landing page: replace individual scripts with bundle
    if (file === "Viral Launch.html") {
      html = html.replace(
        /<script[^>]*src="data\.js"[^>]*><\/script>\s*<script[^>]*src="image-slot\.js"[^>]*><\/script>\s*<script[^>]*src="components\.js"[^>]*><\/script>\s*<script[^>]*src="viral\.js"[^>]*><\/script>\s*<script[^>]*src="viral-b\.js"[^>]*><\/script>/,
        '<script src="viral-bundle.js"></script>'
      );
    }

    await fs.writeFile(join(OUT, file), html);
    console.log(`  ✓ ${file} → dist/${file}`);
  }
}

async function build() {
  console.log("\n🏗️  Lotto Global — Production Build\n");
  await clean();
  await transpileJsx();
  await copyStatic();
  await buildLandingBundle();
  await processHtml();
  console.log("\n✅ Build complete: ./dist/\n");
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
