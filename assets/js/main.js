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
    { name: "MATH 4241 - Integral Calculus and Differential Equations", files: ["midterm.html"] },
    { name: "PHY 4241 - Physics II", files: ["midterm.html"] },
  ],
};

const DEFAULT_SEMESTER = "1-1";
let currentSemester = DEFAULT_SEMESTER;
let activeCardIndex = -1;

function getCourseDir(semester, courseName) {
  return "semesters/" + semester + "/" + courseName;
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

function switchSemester(semester) {
  currentSemester = semester;
  localStorage.setItem("sem", semester);
  renderDashboard(semester);

  document.querySelectorAll(".semester-tab").forEach(function (tab) {
    tab.classList.toggle("active", tab.dataset.semester === semester);
  });
}

/* ─── Search modal ─── */

var SearchModal = {
  overlay: null,
  input: null,
  body: null,
  activeIndex: -1,
  results: [],

  build: function () {
    if (this.overlay) return;
    var o = document.createElement("div");
    o.className = "search-modal-overlay";
    o.id = "search-modal-overlay";
    o.innerHTML =
      '<div class="search-modal-panel">'
      + '<div class="search-modal-head">'
      + '<input type="text" class="search-modal-input" id="search-modal-input" placeholder="Search courses and files…" autocomplete="off" spellcheck="false">'
      + '<button class="search-modal-close" id="search-modal-close" aria-label="Close search">&times;</button>'
      + '</div>'
      + '<div class="search-modal-body" id="search-modal-body"></div>'
      + '</div>';
    document.body.appendChild(o);
    this.overlay = o;
    this.input = document.getElementById("search-modal-input");
    this.body = document.getElementById("search-modal-body");

    var self = this;
    document.getElementById("search-modal-close").addEventListener("click", function () { self.close(); });
    o.addEventListener("click", function (e) { if (e.target === o) self.close(); });

    this.input.addEventListener("input", function () { self.search(this.value); });

    this.input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { self.close(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); self.navigate(1); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); self.navigate(-1); return; }
      if (e.key === "Enter") { e.preventDefault(); self.openActive(); return; }
    });
  },

  open: function () {
    this.build();
    this.search("");
    this.overlay.classList.add("open");
    document.body.classList.add("no-scroll");
    setTimeout(function (self) { self.input.focus(); }, 50, this);
    this.activeIndex = -1;
  },

  close: function () {
    if (!this.overlay || !this.overlay.classList.contains("open")) return;
    this.overlay.classList.remove("open");
    this.input.value = "";
    this.body.innerHTML = "";
    document.body.classList.remove("no-scroll");
    this.activeIndex = -1;
  },

  search: function (query) {
    query = query.trim().toLowerCase();
    this.results = [];

    if (!query) {
      this.body.innerHTML = "";
      return;
    }

    Object.keys(COURSES).forEach(function (sem) {
      COURSES[sem].forEach(function (course) {
        var courseMatch = course.name.toLowerCase().includes(query);
        course.files.forEach(function (file) {
          var fileMatch = file.toLowerCase().includes(query);
          if (courseMatch || fileMatch) {
            this.results.push({
              semester: sem,
              course: course.name,
              file: file,
              href: getCourseDir(sem, course.name) + "/" + file,
              matchType: fileMatch ? "file" : "course",
            });
          }
        }, this);
      }, this);
    }, this);

    this.renderResults(query);
  },

  renderResults: function (query) {
    if (this.results.length === 0) {
      this.body.innerHTML = '<div class="search-no-results">No results found</div>';
      this.activeIndex = -1;
      return;
    }

    var html = "";
    var q = query.toLowerCase();
    for (var i = 0; i < this.results.length; i++) {
      var r = this.results[i];
      var nameLabel = r.file.replace(/\.html$/, "").replace(/-/g, " ");
      var nameHighlighted = highlightText(nameLabel, q);
      var courseHighlighted = highlightText(r.course, q);
      html += '<a class="search-result" data-index="' + i + '" href="' + r.href + '">'
        + '<span class="search-result-path">' + r.semester + ' / ' + r.course + '</span>'
        + '<span class="search-result-name">' + nameHighlighted + '</span>'
        + '</a>';
    }
    this.body.innerHTML = html;
    this.activeIndex = -1;

    var self = this;
    this.body.querySelectorAll(".search-result").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        self.body.querySelectorAll(".search-result").forEach(function (e) { e.classList.remove("active"); });
        this.classList.add("active");
        self.activeIndex = parseInt(this.dataset.index);
      });
    });
  },

  navigate: function (dir) {
    var items = this.body.querySelectorAll(".search-result");
    if (!items.length) return;
    items.forEach(function (e) { e.classList.remove("active"); });
    if (this.activeIndex < 0) {
      this.activeIndex = dir > 0 ? 0 : items.length - 1;
    } else {
      this.activeIndex = Math.max(0, Math.min(items.length - 1, this.activeIndex + dir));
    }
    items[this.activeIndex].classList.add("active");
    items[this.activeIndex].scrollIntoView({ block: "nearest" });
  },

  openActive: function () {
    var items = this.body.querySelectorAll(".search-result");
    if (this.activeIndex >= 0 && this.activeIndex < items.length) {
      window.location.href = items[this.activeIndex].href;
    }
  },
};

function highlightText(text, query) {
  if (!query) return escapeHtml(text);
  var lower = text.toLowerCase();
  var idx = lower.indexOf(query);
  if (idx === -1) return escapeHtml(text);
  return escapeHtml(text.slice(0, idx))
    + "<mark>" + escapeHtml(text.slice(idx, idx + query.length)) + "</mark>"
    + escapeHtml(text.slice(idx + query.length));
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
    searchInput.addEventListener("click", function () {
      SearchModal.open();
    });
    searchInput.addEventListener("focus", function () {
      this.blur();
      SearchModal.open();
    });
  }

  document.addEventListener("keydown", function (e) {
    var isOpen = document.getElementById("search-modal-overlay")
      && document.getElementById("search-modal-overlay").classList.contains("open");
    if (isOpen) return;

    var target = e.target;
    var isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      SearchModal.open();
      return;
    }

    if (!isInput && e.key === "/") {
      e.preventDefault();
      SearchModal.open();
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
  overlay.style.display = "";
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
  var overlay = document.getElementById("changelog-overlay");
  overlay.style.display = "";
  overlay.classList.remove("open");
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

init();

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    var so = document.getElementById("search-modal-overlay");
    if (so && so.classList.contains("open")) { SearchModal.close(); return; }
    var o = document.getElementById("changelog-overlay");
    if (o && o.classList.contains("open")) closeChangelog();
  }
});
