const fs = require('fs');
const path = require('path');

const semestersDir = path.join(__dirname, '..', '..', 'semesters');
const outDir = path.join(__dirname, '..', '..', 'assets', 'data');
const outFile = path.join(outDir, 'courses.json');

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true });
}

function build() {
  const result = {};

  if (!fs.existsSync(semestersDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
    console.log('No semesters/ directory found — wrote empty courses.json');
    return;
  }

  const semesters = fs.readdirSync(semestersDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort(naturalSort);

  for (const semester of semesters) {
    const semPath = path.join(semestersDir, semester);
    const courses = fs.readdirSync(semPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort(naturalSort);

    const courseList = [];
    for (const course of courses) {
      const coursePath = path.join(semPath, course);
      const files = fs.readdirSync(coursePath)
        .filter(f => f.endsWith('.html'))
        .sort(naturalSort);

      courseList.push({ name: course, files });
    }

    result[semester] = courseList;
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
  console.log('Written ' + Object.keys(result).length + ' semesters to ' + outFile);
}

build();
