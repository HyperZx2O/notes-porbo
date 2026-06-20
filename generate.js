const fs = require("fs"), path = require("path");
const semesters = fs.readdirSync(".").filter(d => /^\d-\d$/.test(d) && fs.statSync(d).isDirectory());
const data = {};
for (const sem of semesters) {
  data[sem] = fs.readdirSync(sem).filter(d => fs.statSync(path.join(sem, d)).isDirectory()).map(d => ({
    name: d,
    files: fs.readdirSync(path.join(sem, d)).filter(f => f.endsWith(".html"))
  }));
}
const js = `const COURSES = ${JSON.stringify(data, null, 2)};\n`;
const main = fs.readFileSync("assets/js/main.js", "utf8");
fs.writeFileSync("assets/js/main.js", main.replace(/const COURSES =[\s\S]*?};/, js));
console.log("Config regenerated from folders.");
