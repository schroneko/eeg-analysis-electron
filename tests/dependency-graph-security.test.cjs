const test=require("node:test");const assert=require("node:assert/strict");const lock=require("../package-lock.json");test("Electron download dependency graph removes vulnerable cache and braces",()=>{for(const name of ["http-cache-semantics","braces"]){assert.equal(Object.keys(lock.packages).some(p=>p.endsWith("node_modules/"+name)),false,name)}});

test("all locked minimatch copies meet the security minimum", () => {
  const copies = Object.entries(lock.packages).filter(([name]) =>
    name.endsWith("node_modules/minimatch")
  );
  assert.ok(copies.length > 0);
  for (const [name, pkg] of copies) {
    const [major, minor, patch] = pkg.version.split(".").map(Number);
    assert.ok(major > 11 || (major === 11 && (minor > 0 || patch >= 1)),
      `${name}: ${pkg.version}`);
  }
});

test("packaging dependencies support minimatch 11 file filters", async () => {
  const fs = require("node:fs/promises");
  const os = require("node:os");
  const path = require("node:path");
  const asar = require("@electron/asar");
  const dirCompare = require("dir-compare");
  const glob = require("glob");
  const { FileList } = require("filelist");
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "minimatch-security-"));
  try {
    const source = path.join(tmp, "source");
    const other = path.join(tmp, "other");
    await fs.mkdir(path.join(source, "nested"), { recursive: true });
    await fs.mkdir(other);
    await fs.writeFile(path.join(source, "nested", "data.txt"), "fixture");
    await fs.writeFile(path.join(source, "skip.txt"), "skip");
    const expected = ["nested/data.txt", "skip.txt"];
    assert.deepEqual(glob.sync("**/*.txt", { cwd: source }).sort(), expected);
    const asyncMatches = await new Promise((resolve, reject) =>
      glob("**/*.txt", { cwd: source }, (error, matches) =>
        error ? reject(error) : resolve(matches)));
    assert.deepEqual(asyncMatches.sort(), expected);
    const files = new FileList();
    files.include(path.join(source, "**", "*.txt"));
    files.exclude(path.join(source, "**/skip.txt"));
    assert.deepEqual(files.toArray(), [path.join(source, "nested", "data.txt")]);
    const comparison = dirCompare.compareSync(source, other, {
      includeFilter: "*.txt", excludeFilter: "skip.txt"
    });
    assert.ok(comparison.diffSet.some(entry => entry.name1 === "data.txt"));
    assert.ok(!comparison.diffSet.some(entry => entry.name1 === "skip.txt"));
    for (const [index, options] of [{ unpack: "*.txt" }, { unpackDir: "**/nested" }].entries()) {
      const archive = path.join(tmp, `fixture-${index}.asar`);
      await asar.createPackageWithOptions(source, archive, options);
      assert.equal(asar.statFile(archive, "nested/data.txt").unpacked, true);
    }
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
});
