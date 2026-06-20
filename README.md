# Notes Porbo

Study dashboard for IUT course materials, organized by semester. Built for GitHub Pages.

## Structure

```
1-1/          → Semester 1-1
  Course-X/   → Course folder
    file.html → Study material (quiz, midterm, final, etc.)
1-2/          → Semester 1-2
assets/       → CSS, JS, tokens
  css/
  js/
index.html    → Dashboard
```

## Updating

1. Add or remove folders/files under any semester directory
2. Run `node generate.js` to rebuild the course config
3. Commit and push — GitHub Actions auto-deploys to Pages
