import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const page = await readFile(path.join(root, "app", "page.tsx"), "utf8");
const css = await readFile(path.join(root, "app", "globals.css"), "utf8");
const depthScene = await readFile(path.join(root, "app", "components", "FlowerDepthScene.tsx"), "utf8");

test("includes all fourteen flower paintings and the petal atlas", async () => {
  const images = [...page.matchAll(/image:\s*"(\/art\/[^"]+)"/g)].map((match) => match[1]);
  assert.equal(images.length, 14);
  await Promise.all(images.map((image) => access(path.join(root, "public", image))));
  await access(path.join(root, "public", "particles", "petal-atlas.png"));
});

test("provides layered depth, pointer light and bloom motion", () => {
  assert.match(css, /perspective:\s*1300px/);
  assert.match(css, /translateZ\(128px\)/);
  assert.match(css, /radial-gradient\(circle at var\(--mx\) var\(--my\)/);
  assert.match(css, /@keyframes flowerFloat/);
});

test("supports keyboard navigation and reduced motion", () => {
  assert.match(page, /ArrowDown/);
  assert.match(page, /aria-label="十四种花木导航"/);
  assert.match(page, /onAnimationEnd=/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("contains phone layout and bounded particle behavior", () => {
  assert.match(css, /max-width:420px/);
  assert.match(page, /particleLimit[^\n]+\? 28 : 54/);
  assert.match(page, /loading=\{index < 2 \? "eager" : "lazy"\}/);
});

test("renders a bounded WebGL depth scene with mobile fallback", () => {
  assert.match(depthScene, /@react-three\/fiber/);
  assert.match(depthScene, /depthMap/);
  assert.match(depthScene, /uDepth/);
  assert.match(depthScene, /pixelWidth <= 700 \? 58 : 118/);
  assert.match(depthScene, /prefers-reduced-motion: reduce/);
  assert.match(page, /Math\.abs\(active - index\) <= 1/);
  assert.match(css, /webgl-depth-scene\.ready/);
});
