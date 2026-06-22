/* Hallmark · component: course config + render
 * genre: editorial · theme: Brutal
 * states: default · hover · focus-visible · active (tab)
 */

let COURSES = null;

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

  var star = document.createElement("button");
  star.className = "bookmark-star";
  var bmId = "native:" + semester + "/" + course.name + "/" + file;
  if (BookmarkManager.isBookmarked(bmId)) { star.textContent = "\u2605"; star.classList.add("active"); }
  else star.textContent = "\u2606";
  star.setAttribute("aria-label", "Bookmark " + label);
  star.addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (BookmarkManager.isBookmarked(bmId)) {
      BookmarkManager.remove(bmId);
      star.textContent = "\u2606";
      star.classList.remove("active");
    } else {
      BookmarkManager.add({
        id: bmId,
        type: "native",
        semester: semester,
        courseName: course.name,
        fileName: file,
        label: label,
        href: href
      });
      star.textContent = "\u2605";
      star.classList.add("active");
    }
  });
  row.appendChild(star);

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

  addDriveButton(card, course, semester);

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
  if (!COURSES) return;
  currentSemester = semester;
  localStorage.setItem("sem", semester);
  renderDashboard(semester);
  document.querySelectorAll(".semester-tab").forEach(function (tab) {
    tab.classList.toggle("active", tab.dataset.semester === semester);
  });
}

function loadCourses() {
  var container = document.getElementById('dashboard');
  container.innerHTML = '<div class="loading-state">Loading…</div>';
  fetch('assets/data/courses.json').then(function(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function(data) {
    COURSES = data;
    var saved = localStorage.getItem('sem');
    var semester = saved && COURSES[saved] ? saved : DEFAULT_SEMESTER;
    switchSemester(semester);
    DriveClient.init();
  }).catch(function(err) {
    container.innerHTML = '<div class="loading-state error">Failed to load courses. <button onclick="location.reload()">Reload</button></div>';
    console.error('Failed to load courses:', err);
  });
}

function setupUI() {
  var tabs = document.querySelectorAll(".semester-tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () { switchSemester(tab.dataset.semester); });
  });

  var searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("click", function () { SearchModal.open(); });
    searchInput.addEventListener("focus", function () { this.blur(); SearchModal.open(); });
  }

  document.addEventListener("keydown", function (e) {
    var isOpen = document.getElementById("search-modal-overlay")
      && document.getElementById("search-modal-overlay").classList.contains("open");
    if (isOpen) return;
    var target = e.target;
    var isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); SearchModal.open(); return; }
    if (!isInput && e.key === "/") { e.preventDefault(); SearchModal.open(); return; }
    if (isInput && e.key === "Escape") { target.blur(); return; }
    var cards = document.querySelectorAll(".course-card:not([style*=\"display: none\"])");
    if (!cards.length) return;
    if (e.key === "j" || e.key === "J") {
      e.preventDefault(); setActiveCard(activeCardIndex < 0 ? 0 : Math.min(activeCardIndex + 1, cards.length - 1));
    }
    if (e.key === "k" || e.key === "K") {
      e.preventDefault(); setActiveCard(activeCardIndex < 0 ? cards.length - 1 : Math.max(activeCardIndex - 1, 0));
    }
    if (e.key === "Enter" && activeCardIndex >= 0) {
      var activeCard = document.querySelector(".course-card.active");
      if (activeCard && !isInput) { e.preventDefault(); if (typeof activeCard.toggleExpand === "function") activeCard.toggleExpand(); }
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var so = document.getElementById("search-modal-overlay");
      if (so && so.classList.contains("open")) { SearchModal.close(); return; }
      var bo = document.getElementById("bookmark-overlay");
      if (bo && bo.classList.contains("open")) { closeBookmarks(); return; }
      var o = document.getElementById("changelog-overlay");
      if (o && o.classList.contains("open")) closeChangelog();
      var dm = document.querySelector(".drive-modal-overlay.open");
      if (dm && typeof DriveModal !== 'undefined') {
        var preview = dm.querySelector(".drive-modal-panel.preview");
        if (preview) { DriveModal._renderList(); return; }
        DriveModal.close();
      }
    }
  });

  document.addEventListener('drive:change', function() {
    var btn = document.getElementById('drive-btn');
    if (btn) btn.classList.toggle('connected', DriveClient.isConnected());
    var sem = localStorage.getItem('sem') || DEFAULT_SEMESTER;
    if (COURSES && COURSES[sem]) switchSemester(sem);
  });
}

function setupChangelog() {
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
  overlay.addEventListener("click", function (e) { if (e.target === this) closeChangelog(); });
}

function init() {
  setupUI();
  setupChangelog();
  setupStats();
  setupBookmarks();
  loadCourses();
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

    if (!COURSES) return;

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

/* ─── BookmarkManager ─── */

var BookmarkManager = (function() {
  var KEY = 'notesporbo:bookmarks';
  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch(e) { return []; }
  }
  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }
  return {
    getAll: getAll,
    add: function(b) {
      var list = getAll();
      list.unshift(b);
      save(list);
    },
    remove: function(id) {
      save(getAll().filter(function(b) { return b.id !== id; }));
    },
    isBookmarked: function(id) {
      return getAll().some(function(b) { return b.id === id; });
    }
  };
})();

/* ─── DriveClient ─── */
// ponytail: API key lives in GitHub secret, not in source.
// A daily Action (fetch-drive.yml) crawls the public Drive folder
// and writes assets/data/drive-files.json. This module just fetches that.

var DriveClient = (function() {
  var ready = false, files = null, refreshedAt = null;

  return {
    isConnected: function() { return ready; },
    getRefreshedAt: function() { return refreshedAt; },
    getRawFiles: function() { return files; },
    init: function(cb) {
      fetch('assets/data/drive-files.json').then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function(data) {
        // ponytail: handle both wrapped and bare array format
        files = data.files || data;
        refreshedAt = data._refreshedAt || null;
        ready = true;
        document.dispatchEvent(new CustomEvent('drive:change'));
        if (cb) cb();
      }).catch(function(err) {
        console.error('Drive files not available:', err.message);
        if (cb) cb();
      });
    },
    // ponytail: matches course folder name anywhere in the path
    // (semester folder names like '1-1 CSE\'24' don't match the '1-1' key)
    getFilesForCourse: function(semester, courseName) {
      if (!files) return [];
      return files.filter(function(f) {
        return f._path.indexOf('/' + courseName + '/') >= 0 && f._hasGroup;
      });
    }
  };
})();

function addDriveButton(card, course, semester) {
  if (!DriveClient.isConnected()) return;
  var driveFiles = DriveClient.getFilesForCourse(semester, course.name);
  if (!driveFiles.length) return;
  var localNames = (course.files || []).map(function(f) { return f.replace(/\.\w+$/, ''); });
  driveFiles = driveFiles.filter(function(f) {
    return localNames.indexOf(f.name.replace(/\.\w+$/, '')) === -1;
  });
  if (!driveFiles.length) return;
  var groups = {}, order = [];
  driveFiles.forEach(function(f) {
    var idx = f._path.indexOf('/' + course.name + '/');
    var relative = idx >= 0 ? f._path.substring(idx + course.name.length + 2) : '';
    var lastSlash = relative.lastIndexOf('/');
    var g = lastSlash >= 0 ? relative.substring(0, lastSlash) : '';
    if (!groups[g]) { groups[g] = []; order.push(g); }
    groups[g].push(f);
  });
  var right = card.querySelector('.course-card-right');
  if (!right) return;
  var btn = document.createElement('button');
  btn.className = 'drive-card-btn';
  btn.setAttribute('aria-label', 'Open Drive files');
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true"><polygon points="24,4 8,30 40,30" fill="currentColor"/><polygon points="8,30 16,44 32,44 24,30" fill="currentColor" opacity="0.65"/><polygon points="40,30 32,44 24,30" fill="currentColor" opacity="0.35"/></svg>';
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    DriveModal.open(course.name, groups, order);
  });
  var toggle = right.querySelector('.course-card-toggle');
  if (toggle) right.insertBefore(btn, toggle);
  else right.appendChild(btn);
}

/* ─── DriveModal ─── */
var DriveModal = {
  overlay: null,
  _name: null,
  _groups: null,
  _order: null,
  _collapsed: {},
  _openIcon: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="M2 10L10 2M7 2h3v3"/></svg>',

  open: function(courseName, groups, order) {
    this._name = courseName;
    this._groups = groups;
    this._order = order;
    this._collapsed = {};
    this._ensure();
    this._renderList();
    this.overlay.classList.add('open');
    document.body.classList.add('no-scroll');
  },

  close: function() {
    if (!this.overlay || !this.overlay.classList.contains('open')) return;
    this.overlay.classList.remove('open');
    document.body.classList.remove('no-scroll');
    this._name = null;
    this._groups = null;
    this._order = null;
    this._collapsed = {};
  },

  _ensure: function() {
    if (this.overlay) return;
    var o = document.createElement('div');
    o.className = 'drive-modal-overlay';
    o.innerHTML =
      '<div class="drive-modal-panel">'
      + '<div class="drive-modal-head">'
      + '<h3 class="drive-modal-title"></h3>'
      + '<button class="drive-modal-close" aria-label="Close">&times;</button>'
      + '</div>'
      + '<div class="drive-modal-body"></div>'
      + '</div>';
    document.body.appendChild(o);
    this.overlay = o;
    var self = this;
    o.querySelector('.drive-modal-close').addEventListener('click', function() { self.close(); });
    o.addEventListener('click', function(e) { if (e.target === o) self.close(); });
  },

  _renderList: function() {
    if (!this.overlay || !this._name) return;
    this.overlay.querySelector('.drive-modal-title').textContent = 'Drive — ' + this._name;
    this.overlay.querySelector('.drive-modal-panel').classList.remove('preview');
    var body = this.overlay.querySelector('.drive-modal-body');
    body.className = 'drive-modal-body';
    body.innerHTML = '';
    var self = this;

    // Build tree from flat _group paths
    var tree = { name: '', files: [], children: {} };
    this._order.forEach(function(key) {
      self._groups[key].forEach(function(f) {
        if (!key) { tree.files.push(f); return; }
        var parts = key.split('/');
        var node = tree;
        parts.forEach(function(p) {
          if (!node.children[p]) node.children[p] = { name: p, files: [], children: {} };
          node = node.children[p];
        });
        node.files.push(f);
      });
    });

    // Start all folders collapsed
    (function fn(node, prefix) {
      Object.keys(node.children).sort().forEach(function(name) {
        var p = prefix ? prefix + '/' + name : name;
        self._collapsed[p] = true;
        fn(node.children[name], p);
      });
    }(tree, ''));

    // Ungrouped root-level files
    tree.files.forEach(function(f) {
      var row = document.createElement('div');
      row.className = 'drive-modal-file-wrap';
      var a = document.createElement('a');
      a.className = 'drive-modal-file';
      a.href = '#';
      a.textContent = f.name.replace(/\.\w+$/, '').replace(/-/g, ' ');
      var badge = document.createElement('span');
      badge.className = 'drive-modal-badge';
      if (f.mimeType === 'application/pdf') badge.textContent = 'PDF';
      else if (f.mimeType.indexOf('image/') === 0) badge.textContent = 'IMG';
      else if (f.mimeType.indexOf('video/') === 0) badge.textContent = 'VID';
      else badge.textContent = 'FILE';
      a.appendChild(badge);
      a.addEventListener('click', function(e) { e.preventDefault(); self._preview(f); });
      var openLink = document.createElement('a');
      openLink.className = 'drive-modal-open';
      openLink.href = 'https://drive.google.com/file/d/' + f.id + '/view';
      openLink.target = '_blank';
      openLink.rel = 'noopener noreferrer';
      openLink.innerHTML = self._openIcon;
      openLink.setAttribute('aria-label', 'Open in Drive');
      openLink.addEventListener('click', function() {
        if (window.goatcounter) goatcounter.count({event: true, path: '/drive/' + f.id + '/open', title: f.name});
      });
      var star = document.createElement('button');
      star.className = 'bookmark-star';
      var bmId = 'drive:' + f.id;
      if (BookmarkManager.isBookmarked(bmId)) { star.textContent = '\u2605'; star.classList.add('active'); }
      else star.textContent = '\u2606';
      star.setAttribute('aria-label', 'Bookmark ' + (f.name.replace(/\.\w+$/, '').replace(/-/g, ' ')));
      star.addEventListener('click', function(e) {
        e.stopPropagation();
        if (BookmarkManager.isBookmarked(bmId)) {
          BookmarkManager.remove(bmId);
          star.textContent = '\u2606';
          star.classList.remove('active');
        } else {
          BookmarkManager.add({
            id: bmId, type: 'drive', fileId: f.id,
            name: f.name, mimeType: f.mimeType,
            label: f.name.replace(/\.\w+$/, '').replace(/-/g, ' '),
            path: f._path || ''
          });
          star.textContent = '\u2605';
          star.classList.add('active');
        }
      });
      row.appendChild(a);
      row.appendChild(openLink);
      row.appendChild(star);
      body.appendChild(row);
    });

    // Folder tree
    var names = Object.keys(tree.children).sort();
    names.forEach(function(name) {
      self._renderNode(body, tree.children[name], 0, name);
    });
  },

  _renderNode: function(container, node, depth, path) {
    var self = this;
    var collapsed = self._collapsed[path];

    var h = document.createElement('div');
    h.className = 'drive-modal-group' + (collapsed ? ' collapsed' : '');
    h.style.paddingLeft = depth === 0 ? 'var(--space-lg)' : 'calc(var(--space-lg) * ' + (depth + 1) + ')';
    h.innerHTML = '<span class="drive-modal-arrow">' + (collapsed ? '▸' : '▾') + '</span> ' + node.name;
    h.addEventListener('click', function() {
      var wrap = h.nextElementSibling;
      var hide = wrap.style.display !== 'none';
      wrap.style.display = hide ? 'none' : '';
      self._collapsed[path] = hide;
      h.classList.toggle('collapsed', hide);
      h.querySelector('.drive-modal-arrow').textContent = hide ? '▸' : '▾';
    });
    container.appendChild(h);

    var wrap = document.createElement('div');
    wrap.className = 'drive-modal-group-content';
    wrap.style.display = collapsed ? 'none' : '';
    container.appendChild(wrap);

    // Files in this folder
    node.files.forEach(function(f) {
      var row = document.createElement('div');
      row.className = 'drive-modal-file-wrap';
      row.style.paddingLeft = 'calc(var(--space-lg) * ' + (depth + 2) + ')';
      var a = document.createElement('a');
      a.className = 'drive-modal-file';
      a.href = '#';
      a.textContent = f.name.replace(/\.\w+$/, '').replace(/-/g, ' ');
      var badge = document.createElement('span');
      badge.className = 'drive-modal-badge';
      if (f.mimeType === 'application/pdf') badge.textContent = 'PDF';
      else if (f.mimeType.indexOf('image/') === 0) badge.textContent = 'IMG';
      else if (f.mimeType.indexOf('video/') === 0) badge.textContent = 'VID';
      else badge.textContent = 'FILE';
      a.appendChild(badge);
      a.addEventListener('click', function(e) { e.preventDefault(); self._preview(f); });
      var openLink = document.createElement('a');
      openLink.className = 'drive-modal-open';
      openLink.href = 'https://drive.google.com/file/d/' + f.id + '/view';
      openLink.target = '_blank';
      openLink.rel = 'noopener noreferrer';
      openLink.innerHTML = self._openIcon;
      openLink.setAttribute('aria-label', 'Open in Drive');
      openLink.addEventListener('click', function() {
        if (window.goatcounter) goatcounter.count({event: true, path: '/drive/' + f.id + '/open', title: f.name});
      });
      var star = document.createElement('button');
      star.className = 'bookmark-star';
      var bmId = 'drive:' + f.id;
      if (BookmarkManager.isBookmarked(bmId)) { star.textContent = '\u2605'; star.classList.add('active'); }
      else star.textContent = '\u2606';
      star.setAttribute('aria-label', 'Bookmark ' + (f.name.replace(/\.\w+$/, '').replace(/-/g, ' ')));
      star.addEventListener('click', function(e) {
        e.stopPropagation();
        if (BookmarkManager.isBookmarked(bmId)) {
          BookmarkManager.remove(bmId);
          star.textContent = '\u2606';
          star.classList.remove('active');
        } else {
          BookmarkManager.add({
            id: bmId, type: 'drive', fileId: f.id,
            name: f.name, mimeType: f.mimeType,
            label: f.name.replace(/\.\w+$/, '').replace(/-/g, ' '),
            path: f._path || ''
          });
          star.textContent = '\u2605';
          star.classList.add('active');
        }
      });
      row.appendChild(a);
      row.appendChild(openLink);
      row.appendChild(star);
      wrap.appendChild(row);
    });

    // Subfolders
    var names = Object.keys(node.children).sort();
    names.forEach(function(name) {
      self._renderNode(wrap, node.children[name], depth + 1, path + '/' + name);
    });
  },

  _preview: function(file) {
    if (!this.overlay) return;
    if (window.goatcounter) goatcounter.count({event: true, path: '/drive/' + file.id, title: file.name});
    this.overlay.querySelector('.drive-modal-panel').classList.add('preview');
    this.overlay.querySelector('.drive-modal-title').textContent = file.name;
    var body = this.overlay.querySelector('.drive-modal-body');
    body.className = 'drive-modal-body drive-modal-body-preview';
    body.innerHTML = '';
    var self = this;
    var actions = document.createElement('div');
    actions.className = 'drive-modal-preview-actions';
    var back = document.createElement('button');
    back.innerHTML = '&larr; Back';
    back.addEventListener('click', function() { self._renderList(); });
    actions.appendChild(back);
    var openDrive = document.createElement('a');
    openDrive.href = 'https://drive.google.com/file/d/' + file.id + '/view';
    openDrive.target = '_blank';
    openDrive.rel = 'noopener noreferrer';
    openDrive.textContent = 'Open in Drive ↗';
    actions.appendChild(openDrive);
    var dl = document.createElement('a');
    dl.href = 'https://drive.google.com/uc?export=download&id=' + file.id;
    dl.target = '_blank';
    dl.rel = 'noopener noreferrer';
    dl.textContent = 'Download';
    actions.appendChild(dl);
    body.appendChild(actions);
    // ponytail: PDF fetch via CORS bypasses Google's CORP: same-site block, then blob URL
    if (file.mimeType === 'application/pdf') {
      var embed = document.createElement('embed');
      embed.className = 'drive-modal-pdf';
      embed.type = 'application/pdf';
      embed.style.minHeight = '400px';
      body.appendChild(embed);
      var url = 'https://drive.google.com/uc?export=download&confirm=t&id=' + file.id;
      fetch(url).then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.blob();
      }).then(function(blob) {
        embed.src = URL.createObjectURL(blob);
      }).catch(function() {
        embed.style.display = 'none';
        var fb = document.createElement('div');
        fb.className = 'drive-modal-fallback';
        fb.innerHTML = 'Preview unavailable. <a href="https://drive.google.com/file/d/' + file.id + '/view" target="_blank" rel="noopener noreferrer">Open in Drive</a>.';
        body.appendChild(fb);
      });
      return;
    }
    if (file.mimeType && file.mimeType.indexOf('image/') === 0) {
      var img = document.createElement('img');
      img.className = 'drive-modal-img';
      img.src = 'https://drive.google.com/uc?export=view&id=' + file.id;
      img.alt = file.name;
      body.appendChild(img);
      return;
    }
    var loading = document.createElement('div');
    loading.className = 'drive-modal-loading';
    loading.textContent = 'Loading preview…';
    body.appendChild(loading);
    var fallback = document.createElement('div');
    fallback.className = 'drive-modal-fallback';
    fallback.style.display = 'none';
    fallback.innerHTML = 'Preview unavailable. <a href="https://drive.google.com/file/d/' + file.id + '/view" target="_blank" rel="noopener noreferrer">Open in Drive</a>.';
    body.appendChild(fallback);
    var iframe = document.createElement('iframe');
    iframe.className = 'drive-modal-iframe';
    iframe.style.display = 'none';
    iframe.src = 'https://drive.google.com/file/d/' + file.id + '/preview';
    iframe.setAttribute('allow', 'autoplay');
    iframe.onload = function() { loading.style.display = 'none'; iframe.style.display = ''; };
    iframe.onerror = function() { loading.style.display = 'none'; fallback.style.display = 'grid'; };
    // ponytail: 15s timeout in case onload/onerror never fires
    setTimeout(function() {
      if (iframe.style.display !== '') { iframe.onerror(); }
    }, 15000);
    body.appendChild(iframe);
  },

  previewFile: function(file) {
    this._ensure();
    this._name = file._path || file.name;
    this._groups = {};
    this._order = [];
    this._collapsed = {};
    this.overlay.classList.add('open');
    document.body.classList.add('no-scroll');
    this._preview(file);
  }
};

/* ─── Stats overlay ─── */

function computeStatsHTML() {
  var files = DriveClient.getRawFiles();
  var refreshedAt = DriveClient.getRefreshedAt();

  if (!files) return '<p class="stats-loading">Drive data not loaded.</p>';

  var total = files.length;
  var pdfs = 0, notes = 0, slides = 0, docs = 0, images = 0, other = 0;
  var semFiles = {};
  var courseFiles = {};
  var latestMod = null, latestModName = '';

  files.forEach(function(f) {
    if (f.mimeType === 'application/pdf') pdfs++;
    else if (f.mimeType.indexOf('image/') === 0) images++;
    else if (f.mimeType === 'text/plain') notes++;
    else if (f.mimeType.indexOf('presentation') >= 0) slides++;
    else if (f.mimeType.indexOf('document') >= 0 || f.mimeType.indexOf('spreadsheet') >= 0) docs++;
    else other++;

    if (f._path) {
      var parts = f._path.split('/');
      if (parts.length > 0) {
        var sem = parts[0];
        semFiles[sem] = (semFiles[sem] || 0) + 1;
      }
    }

    if (f.modifiedTime && (!latestMod || f.modifiedTime > latestMod)) {
      latestMod = f.modifiedTime;
      latestModName = f.name.replace(/\.\w+$/, '').replace(/-/g, ' ');
    }
  });

  var courseCount = 0;
  if (typeof COURSES !== 'undefined' && COURSES) {
    Object.keys(COURSES).forEach(function(sem) {
      courseCount += (COURSES[sem] || []).length;
    });
  }

  var semRows = Object.keys(semFiles).sort().filter(function(sem) {
    return /^\d-\d/.test(sem);
  }).map(function(sem) {
    var shortSem = sem.replace(/ .*/, '');
    return '<div class="stats-row"><span>' + shortSem + '</span><span>' + semFiles[sem] + ' files</span></div>';
  }).join('');

  var freshnessHTML = '';
  if (refreshedAt) {
    var d = new Date(refreshedAt);
    freshnessHTML += '<div class="stats-row"><span>Refreshed</span><span>' + d.toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) + ' ' + d.toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'}) + '</span></div>';
  }
  if (latestMod) {
    var md = new Date(latestMod);
    var now = new Date();
    var diffMs = now - md;
    var diffDays = Math.floor(diffMs / 86400000);
    var diffHours = Math.floor(diffMs / 3600000);
    var ago = diffDays > 0 ? diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago' : diffHours + ' hour' + (diffHours > 1 ? 's' : '') + ' ago';
    freshnessHTML += '<div class="stats-row"><span>Latest mod</span><span>' + latestModName + '</span></div>';
    freshnessHTML += '<div class="stats-row" style="border:none;padding-top:0"><span></span><span class="stats-meta">' + ago + '</span></div>';
  }

  var popularHTML = '<div class="stats-row"><span>Loading popular files…</span><span></span></div>';
  fetch('https://hyperzx20.goatcounter.com/counter//hits.json?event=true')
    .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function(hits) {
      var body = document.getElementById('stats-body');
      if (!body) return;
      var popularEl = body.querySelector('.stats-popular');
      if (!popularEl) return;
      if (!hits || hits.length === 0) {
        popularEl.innerHTML = '<div class="stats-row"><span>No data yet</span><span></span></div>';
        return;
      }
      var html = '';
      var shown = 0;
      hits.forEach(function(h) {
        if (shown >= 5) return;
        if (!h.title || h.count < 1) return;
        shown++;
        html += '<div class="stats-row"><span>' + shown + '. ' + h.title + '</span><span>' + h.count + '×</span></div>';
      });
      if (!html) html = '<div class="stats-row"><span>No data yet</span><span></span></div>';
      popularEl.innerHTML = html;
    })
    .catch(function() {
      var body = document.getElementById('stats-body');
      if (!body) return;
      var popularEl = body.querySelector('.stats-popular');
      if (popularEl) popularEl.innerHTML = '<div class="stats-row"><span>Unavailable</span><span></span></div>';
    });

  return '<div class="stats-section">'
    + '<div class="stats-row"><span>Courses</span><span>' + courseCount + '</span></div>'
    + '<div class="stats-row" style="border:none"><span>Files</span><span>' + total + '</span></div>'
    + '</div>'
    + '<div class="stats-section">'
    + '<h3>By type</h3>'
    + '<div class="stats-row"><span>PDF</span><span>' + pdfs + '</span></div>'
    + '<div class="stats-row"><span>Notes</span><span>' + notes + '</span></div>'
    + '<div class="stats-row"><span>Slides</span><span>' + slides + '</span></div>'
    + '<div class="stats-row"><span>Docs</span><span>' + docs + '</span></div>'
    + '<div class="stats-row" style="border:none"><span>Images</span><span>' + images + '</span></div>'
    + '</div>'
    + '<div class="stats-section">'
    + '<h3>By semester</h3>'
    + semRows
    + '</div>'
    + '<div class="stats-section">'
    + '<h3>Freshness</h3>'
    + freshnessHTML
    + '</div>'
    + '<div class="stats-section">'
    + '<h3>Popular</h3>'
    + '<div class="stats-popular">' + popularHTML + '</div>'
    + '</div>';
}

function setupStats() {
  var overlay = document.createElement('div');
  overlay.className = 'stats-overlay';
  overlay.id = 'stats-overlay';
  overlay.innerHTML = '<div class="stats-panel">'
    + '<div class="stats-head">'
    + '<h2>Stats</h2>'
    + '<button class="stats-close" id="stats-close" aria-label="Close stats">&times;</button>'
    + '</div>'
    + '<div class="stats-body" id="stats-body">'
    + '<p class="stats-loading">Loading stats&hellip;</p>'
    + '</div>'
    + '</div>';
  document.body.appendChild(overlay);
  document.getElementById('stats-btn').addEventListener('click', openStats);
  document.getElementById('stats-close').addEventListener('click', closeStats);
  overlay.addEventListener('click', function(e) { if (e.target === this) closeStats(); });
}

function openStats() {
  document.body.classList.add('no-scroll');
  var overlay = document.getElementById('stats-overlay');
  overlay.style.display = '';
  overlay.classList.add('open');
  var body = document.getElementById('stats-body');
  body.innerHTML = computeStatsHTML();
}

function closeStats() {
  document.body.classList.remove('no-scroll');
  var overlay = document.getElementById('stats-overlay');
  overlay.style.display = '';
  overlay.classList.remove('open');
}

/* ─── Bookmarks ─── */

function getBookmarkBreadcrumb(bm) {
  if (bm.type === 'native') {
    return bm.semester + ' / ' + bm.courseName;
  }
  var parts = bm.path.split('/');
  var sem = parts[0].replace(/ .*/, '');
  var course = parts[1] || '';
  var extra = parts.slice(2, -1).join(' / ');
  return sem + ' / ' + course + (extra ? ' / ' + extra : '');
}

function openBookmarks() {
  document.body.classList.add('no-scroll');
  var overlay = document.getElementById('bookmark-overlay');
  overlay.style.display = '';
  overlay.classList.add('open');
  var body = document.getElementById('bookmark-body');
  var list = BookmarkManager.getAll();
  if (!list.length) {
    body.innerHTML = '<p class="bookmark-empty">No bookmarks yet</p>';
    return;
  }
  var html = '';
  list.forEach(function(bm) {
    var bread = getBookmarkBreadcrumb(bm);
    html += '<div class="bookmark-item">'
      + '<button class="bookmark-star active" data-id="' + bm.id + '">\u2605</button>'
      + '<div class="bookmark-item-body">'
      + '<button class="bookmark-item-name" data-id="' + bm.id + '">' + escapeHtml(bm.label || bm.name) + '</button>'
      + '<div class="bookmark-breadcrumb">' + escapeHtml(bread) + '</div>'
      + '</div>'
      + '</div>';
  });
  body.innerHTML = html;
  body.querySelectorAll('.bookmark-star.active').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = btn.dataset.id;
      BookmarkManager.remove(id);
      openBookmarks();
    });
  });
  body.querySelectorAll('.bookmark-item-name').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = btn.dataset.id;
      var bm = BookmarkManager.getAll().filter(function(b) { return b.id === id; })[0];
      if (!bm) return;
      closeBookmarks();
      if (bm.type === 'native') {
        window.location.href = bm.href;
      } else {
        var files = DriveClient.getRawFiles();
        if (!files) return;
        var found = null;
        files.forEach(function(f) { if (f.id === bm.fileId) found = f; });
        if (found) DriveModal.previewFile(found);
      }
    });
  });
}

function closeBookmarks() {
  document.body.classList.remove('no-scroll');
  var overlay = document.getElementById('bookmark-overlay');
  overlay.style.display = '';
  overlay.classList.remove('open');
}

function setupBookmarks() {
  var overlay = document.createElement('div');
  overlay.className = 'bookmark-overlay';
  overlay.id = 'bookmark-overlay';
  overlay.innerHTML = '<div class="bookmark-panel">'
    + '<div class="bookmark-head">'
    + '<h2>Bookmarks</h2>'
    + '<button class="bookmark-close" id="bookmark-close" aria-label="Close bookmarks">&times;</button>'
    + '</div>'
    + '<div class="bookmark-body" id="bookmark-body">'
    + '<p class="bookmark-loading">Loading bookmarks&hellip;</p>'
    + '</div>'
    + '</div>';
  document.body.appendChild(overlay);
  document.getElementById('bookmarks-btn').addEventListener('click', openBookmarks);
  document.getElementById('bookmark-close').addEventListener('click', closeBookmarks);
  overlay.addEventListener('click', function(e) { if (e.target === this) closeBookmarks(); });
}

// Theme toggle
(function() {
  var html = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  function apply(forceDark) {
    var stored = localStorage.getItem('theme');
    var isDark = forceDark !== undefined ? forceDark
      : stored === 'dark' ? true
      : stored === 'light' ? false
      : mq.matches;
    if (isDark) html.setAttribute('data-theme', 'dark');
    else html.removeAttribute('data-theme');
    if (btn) btn.textContent = isDark ? 'LIGHT' : 'DARK';
  }

  // OS preference change — only when no explicit override
  mq.addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) apply(e.matches);
  });

  apply();
  if (btn) {
    btn.addEventListener('click', function() {
      var dark = html.getAttribute('data-theme') === 'dark';
      if (dark) { localStorage.setItem('theme', 'light'); apply(false); }
      else { localStorage.setItem('theme', 'dark'); apply(true); }
    });
  }
})();

init();

