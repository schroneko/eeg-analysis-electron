// dir-compare 4.2.0 still calls the pre-v9 minimatch default export.
// Keep its public filtering API working with the security override.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const manifest = require.resolve("dir-compare/package.json");
assert.equal(require(manifest).version, "4.2.0", "Review the minimatch compatibility fix after upgrading dir-compare");
const target = path.join(path.dirname(manifest), "build/src/FilterHandler/defaultFilterHandler.js");
let source = fs.readFileSync(target, "utf8");
for (const [before, after] of [
  ['__importDefault(require("minimatch"))', 'require("minimatch")'],
  ['(0, minimatch_1.default)', '(0, minimatch_1.minimatch)'],
]) {
  assert.ok(source.includes(before) || source.includes(after), "Unexpected dir-compare source; review compatibility fix");
  source = source.replace(before, after);
}
fs.writeFileSync(target, source);

// glob 7 (used by temp/rimraf in the Windows installer) expects RegExp
// segments. minimatch 11 exposes Matcher segments with pattern/test instead.
const globManifest = require.resolve("glob/package.json", {
  paths: [path.dirname(require.resolve("rimraf/package.json"))],
});
assert.equal(require(globManifest).version, "7.2.3", "Review the minimatch compatibility fix after upgrading glob");
for (const filename of ["glob.js", "sync.js"]) {
  const target = path.join(path.dirname(globManifest), filename);
  let source = fs.readFileSync(target, "utf8");
  for (const [before, after] of [
    ["var rawGlob = pn._glob", "var rawGlob = pn._glob || pn.pattern"],
    ["e.match(pn)", "pn.test(e)"],
  ]) {
    assert.ok(source.includes(before) || source.includes(after), "Unexpected glob source; review compatibility fix");
    if (!source.includes(after)) source = source.replaceAll(before, after);
  }
  fs.writeFileSync(target, source);
}
