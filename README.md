# Notes Porbo

<p align="center">
  <img src="banner.png" alt="Notes Porbo Banner" width="100%" style="max-width: 960px;" />
</p>

Study dashboard for IUT course materials, organized by semester. Built for GitHub Pages.

Courses are listed in `assets/data/courses.json`. Adding a new HTML file to a course folder and listing it in `courses.json` makes it appear on the dashboard.

Drive extras are crawled daily via GitHub Actions and served as static JSON — no API key reaches the browser.

## Structure

```
1-1/          → Semester 1-1 course HTML files
1-2/          → Semester 1-2 course HTML files
assets/
  css/        → Styles
  js/         → Dashboard logic (main.js)
  data/       → courses.json, drive-files.json (auto-generated)
.github/
  workflows/  → fetch-drive.yml (daily crawl)
  scripts/    → fetch-drive.js (server-side Drive crawler)
index.html    → Dashboard
404.html      → Not-found page
```
