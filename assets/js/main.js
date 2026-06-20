/* Hallmark · component: course config + render
 * genre: editorial · theme: Brutal
 * states: default · hover · focus-visible · active (tab)
 */

const COURSES = {
  "1-1": [
    { name: "CSE 4105 - Computing For Engineers", files: ["final.html", "notes1.html", "notes2.html"] },
    { name: "CSE 4107 - Structured Programming I", files: ["final.html"] },
    { name: "HUM 4147 - Technology, Environment & Society", files: ["final.html"] },
    { name: "Math 4141 - Geometry & Differential Calculus", files: ["geometry.html"] },
    { name: "PHY 4141 - Physics I", files: ["final.html"] },
  ],
  "1-2": [
    { name: "CHEM 4241 - Chemistry", files: [] },
    { name: "CSE 4203 - Discrete Mathematics", files: ["midterm.html"] },
    { name: "CSE 4205 - Digital Logic Design", files: [] },
    { name: "HUM 4241 - Islamic History Science and Culture", files: ["midterm.html"] },
    { name: "HUM 4242 - Arabic II", files: [] },
    { name: "MATH 4241 - Integral Calculus and Differential Equations", files: ["midterm.html"] },
    { name: "PHY 4241 - Physics II", files: ["midterm.html"] },
  ],
};

const DEFAULT_SEMESTER = "1-1";
let currentSemester = DEFAULT_SEMESTER;

function getCourseDir(semester, courseName) {
  return semester + "/" + courseName;
}

function renderFileRow(course, file, semester) {
  const dir = getCourseDir(semester, course.name);
  const href = dir + "/" + file;
  const label = file.replace(/\.html$/, "").replace(/-/g, " ");

  const row = document.createElement("div");
  row.className = "file-row";

  const a = document.createElement("a");
  a.className = "file-link";
  a.href = href;
  a.textContent = label;

  const dl = document.createElement("a");
  dl.className = "file-download";
  dl.href = href;
  dl.download = "";
  dl.setAttribute("aria-label", "Download " + label);
  dl.title = "Download";

  row.appendChild(a);
  row.appendChild(dl);
  return row;
}

function renderCourseCard(course, semester) {
  const card = document.createElement("div");
  card.className = "course-card";
  card.dataset.courseName = course.name.toLowerCase();

  const header = document.createElement("div");
  header.className = "course-card-header";
  header.setAttribute("role", "button");
  header.setAttribute("tabindex", "0");
  header.setAttribute("aria-expanded", "false");

  const title = document.createElement("h3");
  title.textContent = course.name;

  const toggle = document.createElement("span");
  toggle.className = "course-card-toggle";
  toggle.textContent = "+";

  header.appendChild(title);
  header.appendChild(toggle);

  const filesWrap = document.createElement("div");
  filesWrap.className = "course-files";

  const inner = document.createElement("div");
  inner.className = "course-files-inner";

  course.files.forEach(function (file) {
    const row = renderFileRow(course, file, semester);
    inner.appendChild(row);
  });

  filesWrap.appendChild(inner);
  card.appendChild(header);
  card.appendChild(filesWrap);

  function toggleExpanded() {
    const isExpanded = card.classList.toggle("expanded");
    header.setAttribute("aria-expanded", isExpanded.toString());
  }

  header.addEventListener("click", function (e) {
    if (e.target.closest(".file-link")) return;
    toggleExpanded();
  });

  header.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleExpanded();
    }
  });

  return card;
}

function renderDashboard(semester) {
  const container = document.getElementById("dashboard");
  const courseList = COURSES[semester];
  const grid = document.createElement("div");
  grid.className = "course-grid";
  grid.id = "course-grid";

  courseList.forEach(function (course) {
    const card = renderCourseCard(course, semester);
    grid.appendChild(card);
  });

  container.innerHTML = "";

  const header = document.createElement("div");
  header.className = "dashboard-header";

  const heading = document.createElement("h2");
  heading.textContent = "Semester " + semester + " — Courses";

  const sub = document.createElement("p");
  sub.textContent = courseList.length + " courses \u00B7 click to expand";

  header.appendChild(heading);
  header.appendChild(sub);
  container.appendChild(header);

  const noResults = document.createElement("div");
  noResults.className = "no-results";
  noResults.id = "no-results";
  const noP = document.createElement("p");
  noP.textContent = "No courses match your search.";
  noResults.appendChild(noP);
  container.appendChild(noResults);

  container.appendChild(grid);
}

function filterCourses(query) {
  query = query.toLowerCase().trim();
  const cards = document.querySelectorAll(".course-card");
  let visibleCount = 0;

  cards.forEach(function (card) {
    const name = card.dataset.courseName || "";
    const fileLinks = card.querySelectorAll(".file-row");
    let fileMatch = false;
    fileLinks.forEach(function (link) {
      const text = link.textContent.toLowerCase();
      if (text.includes(query)) fileMatch = true;
    });

    const nameMatch = name.includes(query);
    if (!query || nameMatch || fileMatch) {
      card.style.display = "";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  const noResults = document.getElementById("no-results");
  if (noResults) {
    noResults.classList.toggle("visible", query !== "" && visibleCount === 0);
  }
}

function switchSemester(semester) {
  currentSemester = semester;
  localStorage.setItem("sem", semester);
  renderDashboard(semester);

  document.querySelectorAll(".semester-tab").forEach(function (tab) {
    tab.classList.toggle("active", tab.dataset.semester === semester);
  });

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = "";
    searchInput.focus();
  }
}

function init() {
  var saved = localStorage.getItem("sem");
  var semester = saved && COURSES[saved] ? saved : DEFAULT_SEMESTER;
  switchSemester(semester);

  var tabs = document.querySelectorAll(".semester-tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      switchSemester(tab.dataset.semester);
    });
  });

  var searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterCourses(this.value);
    });
  }
}

document.addEventListener("DOMContentLoaded", init);
