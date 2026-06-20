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
let activeCardIndex = -1;

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

function getExpandKey(semester, courseName) {
  return "expand:" + semester + ":" + courseName;
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

  let count = null;
  if (course.files.length > 0) {
    count = document.createElement("span");
    count.className = "course-card-count";
    count.textContent = course.files.length;
  }

  const right = document.createElement("span");
  right.className = "course-card-right";

  if (course.files.length === 0) {
    const badge = document.createElement("span");
    badge.className = "course-card-empty";
    badge.textContent = "EMPTY";
    right.appendChild(badge);
  } else if (count) {
    right.appendChild(count);
  }

  const toggle = document.createElement("span");
  toggle.className = "course-card-toggle";
  toggle.textContent = "+";

  right.appendChild(toggle);
  header.appendChild(title);
  header.appendChild(right);

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

  function syncExpandState(isExpanded) {
    const key = getExpandKey(semester, course.name);
    if (isExpanded) {
      localStorage.setItem(key, "1");
    } else {
      localStorage.removeItem(key);
    }
  }

  card.toggleExpand = function () {
    const isExpanded = card.classList.toggle("expanded");
    header.setAttribute("aria-expanded", isExpanded.toString());
    syncExpandState(isExpanded);
  };

  var saved = localStorage.getItem(getExpandKey(semester, course.name));
  if (saved === "1") {
    card.classList.add("expanded");
    header.setAttribute("aria-expanded", "true");
  }

  header.addEventListener("click", function (e) {
    if (e.target.closest(".file-link") || e.target.closest(".file-download")) return;
    card.toggleExpand();
  });

  header.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      card.toggleExpand();
    }
  });

  return card;
}

function setActiveCard(index) {
  var cards = document.querySelectorAll(".course-card:not([style*=\"display: none\"])");
  cards.forEach(function (c) {
    c.classList.remove("active");
  });
  if (index >= 0 && index < cards.length) {
    activeCardIndex = index;
    cards[index].classList.add("active");
    cards[index].scrollIntoView({ block: "nearest" });
  } else {
    activeCardIndex = -1;
  }
}

function renderDashboard(semester) {
  const container = document.getElementById("dashboard");
  const courseList = COURSES[semester];
  const grid = document.createElement("div");
  grid.className = "course-grid";
  grid.id = "course-grid";

  courseList.forEach(function (course, i) {
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

  activeCardIndex = -1;
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

  document.addEventListener("keydown", function (e) {
    var target = e.target;
    var isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

    if (!isInput && e.key === "/") {
      e.preventDefault();
      var si = document.getElementById("search-input");
      if (si) si.focus();
      return;
    }

    if (isInput && e.key === "Escape") {
      target.blur();
      return;
    }

    var cards = document.querySelectorAll(".course-card:not([style*=\"display: none\"])");
    if (!cards.length) return;

    if (e.key === "j" || e.key === "J") {
      e.preventDefault();
      var next = activeCardIndex < 0 ? 0 : Math.min(activeCardIndex + 1, cards.length - 1);
      setActiveCard(next);
      return;
    }

    if (e.key === "k" || e.key === "K") {
      e.preventDefault();
      var prev = activeCardIndex < 0 ? cards.length - 1 : Math.max(activeCardIndex - 1, 0);
      setActiveCard(prev);
      return;
    }

    if (e.key === "Enter" && activeCardIndex >= 0) {
      var activeCard = document.querySelector(".course-card.active");
      if (activeCard && !isInput) {
        e.preventDefault();
        if (typeof activeCard.toggleExpand === "function") activeCard.toggleExpand();
      }
    }
  });

  /* ─── Create changelog overlay dynamically ─── */
  var overlay = document.createElement("div");
  overlay.className = "changelog-overlay";
  overlay.id = "changelog-overlay";
  overlay.style.display = "none";
  overlay.innerHTML = '<div class="changelog-panel">'
    + '<div class="changelog-head">'
    + '<h2>Changelog</h2>'
    + '<button class="changelog-close" id="changelog-close" aria-label="Close changelog">&times;</button>'
    + '</div>'
    + '<div class="changelog-body" id="changelog-body">'
    + '<p class="changelog-loading">Loading commits&hellip;</p>'
    + '</div>'
    + '</div>';
  document.body.appendChild(overlay);

  document.getElementById("changelog-btn").addEventListener("click", openChangelog);
  document.getElementById("changelog-close").addEventListener("click", closeChangelog);
  overlay.addEventListener("click", function (e) {
    if (e.target === this) closeChangelog();
  });
}

/* ─── Changelog ─── */

function openChangelog() {
  document.body.classList.add("no-scroll");
  var overlay = document.getElementById("changelog-overlay");
  overlay.classList.add("open");
  var body = document.getElementById("changelog-body");
  body.innerHTML = '<p class="changelog-loading">Loading commits…</p>';

  fetch("https://api.github.com/repos/HyperZx2O/notes-porbo/commits?per_page=10")
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (commits) {
      if (!commits || commits.length === 0) {
        body.innerHTML = '<p class="changelog-empty">No commits found.</p>';
        return;
      }
      var html = "";
      commits.forEach(function (c) {
        var msg = c.commit.message.split("\n")[0];
        var date = new Date(c.commit.author.date).toLocaleDateString("en-GB", {
          day: "numeric", month: "short", year: "numeric"
        });
        var author = c.commit.author.name;
        var sha = c.sha.slice(0, 7);
        html += '<div class="changelog-item">'
          + '<div class="changelog-item-msg">' + escapeHtml(msg) + '</div>'
          + '<div class="changelog-item-meta">' + sha + ' \u00B7 ' + author + ' \u00B7 ' + date + '</div>'
          + '</div>';
      });
      body.innerHTML = html;
    })
    .catch(function (err) {
      body.innerHTML = '<p class="changelog-error">Failed to load commits: ' + escapeHtml(err.message) + '</p>';
    });
}

function closeChangelog() {
  document.body.classList.remove("no-scroll");
  document.getElementById("changelog-overlay").classList.remove("open");
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

init();

document.addEventListener("keydown", function (e) {
  var t = e.target;
  if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) return;
  if (e.key === "Escape") {
    var o = document.getElementById("changelog-overlay");
    if (o && o.classList.contains("open")) closeChangelog();
  }
});
