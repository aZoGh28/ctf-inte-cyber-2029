/* CS29 Map - moteur de rendu partage (joueur = lecture, admin = edition) */
(function () {
  var SVGNS = "http://www.w3.org/2000/svg";
  var I = function (b) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + b + '</svg>'; };
  var D = 'fill="currentColor" stroke="none"';
  var ICONS = {
    terminal: I('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>'),
    search: I('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'),
    code: I('<path d="M8.5 8.5L4.5 12l4 3.5M15.5 8.5l4 3.5-4 3.5"/>'),
    lock: I('<rect x="4.5" y="11" width="15" height="9" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>'),
    wifi: I('<path d="M4.5 12.5a11 11 0 0 1 15 0M7.5 15.7a6.5 6.5 0 0 1 9 0"/><circle cx="12" cy="19" r="1.3" ' + D + '/>'),
    syringe: I('<path d="M17 2l5 5M20 4l-8.5 8.5M14 6l4 4"/><path d="M11.5 8.5L3 17v4h4l8.5-8.5"/><path d="M6 14l3 3"/>'),
    image: I('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.6"/><path d="M21 15l-5-4-8 7"/>'),
    list: I('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.3" ' + D + '/><circle cx="4.5" cy="12" r="1.3" ' + D + '/><circle cx="4.5" cy="18" r="1.3" ' + D + '/>'),
    usercheck: I('<circle cx="10" cy="8" r="3.6"/><path d="M3.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 12l2 2 3.5-3.5"/>'),
    bug: I('<rect x="8" y="8" width="8" height="11" rx="4"/><path d="M12 5v3M9.5 8L7 5.5M14.5 8L17 5.5M8 12H4M20 12h-4M8 16l-2.5 2.5M16 16l2.5 2.5"/>'),
    share: I('<circle cx="6" cy="12" r="2.5"/><circle cx="17" cy="6" r="2.5"/><circle cx="17" cy="18" r="2.5"/><path d="M8.2 10.9l6.5-3.6M8.2 13.1l6.5 3.6"/>'),
    trash: I('<path d="M4 7h16M9.5 11v6M14.5 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    hash: I('<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>'),
    cpu: I('<rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>'),
    flag: I('<path d="M5.5 21V4M5.5 4h11l-2 4 2 4h-11"/>'),
    check: I('<path d="M4 12l5 5L20 6" stroke-width="2.6"/>'),
  };
  function ico(k) { return ICONS[k] || ICONS.search; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function compile(cfg) {
    var branches = cfg.branches || [];
    var N = Math.max(branches.length, 1);
    var maxLen = 0; branches.forEach(function (b) { maxLen = Math.max(maxLen, (b.nodes || []).length); });
    var nodes = [];
    nodes.push({ key: "__start", kind: "start", loc: { type: "start" }, challenge: (cfg.start || {}).challenge, icon: (cfg.start || {}).icon || "terminal", label: (cfg.start || {}).label || "Depart", row: 0, requires: [] });
    branches.forEach(function (b, bi) {
      (b.nodes || []).forEach(function (nd, i) {
        nodes.push({ key: "b" + bi + "n" + i, loc: { type: "node", bi: bi, ni: i }, challenge: nd.challenge, icon: nd.icon || "search", label: nd.label || nd.challenge || "", row: i + 1, col: bi, requires: [i === 0 ? "__start" : "b" + bi + "n" + (i - 1)] });
      });
    });
    var lastKeys = branches.map(function (b, bi) { var L = (b.nodes || []).length; return L ? "b" + bi + "n" + (L - 1) : "__start"; });
    nodes.push({ key: "__finish", kind: "finish", loc: { type: "finish" }, challenge: (cfg.finish || {}).challenge, icon: (cfg.finish || {}).icon || "flag", label: (cfg.finish || {}).label || "Arrivee", row: maxLen + 2, requires: lastKeys });
    return { nodes: nodes, cols: N, maxLen: maxLen, title: cfg.title || "Parcours" };
  }

  function computeStates(nodes, apiList) {
    var solved = {}; apiList.forEach(function (c) { if (c.solved_by_me) solved[c.name] = true; });
    var byKey = {}; nodes.forEach(function (n) { byKey[n.key] = n; });
    var st = {};
    nodes.forEach(function (n) {
      if (n.challenge && solved[n.challenge]) st[n.key] = "solved";
      else if ((n.requires || []).every(function (rk) { var r = byKey[rk]; return r && r.challenge && solved[r.challenge]; })) st[n.key] = "open";
      else st[n.key] = "locked";
    });
    return st;
  }
  function dots(state) { var f = state === "solved" ? 3 : (state === "open" ? 1 : 0), cls = state === "solved" ? "done" : "on", s = ""; for (var k = 0; k < 3; k++) s += '<i class="' + (k < f ? cls : "") + '"></i>'; return '<div class="cs-dots">' + s + "</div>"; }

  function renderMap(root, cfg, apiList, opts) {
    opts = opts || {};
    var edit = !!opts.edit, cb = opts.cb || {};
    var comp = compile(cfg), nodes = comp.nodes, N = comp.cols;
    var api = {}; apiList.forEach(function (c) { api[c.name] = c; });
    var states = computeStates(nodes, apiList);
    var solvedCount = nodes.filter(function (n) { return states[n.key] === "solved"; }).length;

    root.className = "cs-adv-root-inner" + (edit ? " edit" : " fullbleed");
    root.innerHTML =
      '<div class="cs-adv-head"><div class="cs-adv-eyebrow">CS29 &middot; Parcours</div>' +
      '<div class="cs-adv-title">' + esc(comp.title) + "</div>" +
      '<div class="cs-adv-progress"><b>' + solvedCount + "</b> / " + nodes.length + " epreuves</div></div>" +
      '<div class="cs-tree"><svg class="cs-svg"></svg></div>';
    var tree = root.querySelector(".cs-tree"), svg = root.querySelector(".cs-svg");

    var lastNodeRow = comp.maxLen;      // derniere rangee de noeuds reels
    var ghostRow = comp.maxLen + 1;     // rangee "+ noeud" (edition)
    var finishRow = comp.maxLen + 2;

    for (var r = 0; r <= finishRow; r++) {
      if (r === ghostRow && !edit) continue;
      var rowNodes = nodes.filter(function (n) { return n.row === r; });
      var solo = rowNodes.length === 1 && (rowNodes[0].kind === "start" || rowNodes[0].kind === "finish");
      var row = document.createElement("div");
      row.className = "cs-row" + (solo ? " solo" : "");
      if (!solo) row.style.gridTemplateColumns = "repeat(" + N + ",1fr)";
      if (solo) { var cell = document.createElement("div"); cell.appendChild(nodeEl(rowNodes[0], edit ? "open" : states[rowNodes[0].key])); row.appendChild(cell); }
      else if (r === ghostRow) {
        for (var c = 0; c < N; c++) row.appendChild(ghostCell(c));
      } else {
        for (var c2 = 0; c2 < N; c2++) {
          var n = rowNodes.find(function (x) { return x.col === c2; });
          var cd = document.createElement("div"); if (n) cd.appendChild(nodeEl(n, edit ? "open" : states[n.key])); row.appendChild(cd);
        }
      }
      tree.appendChild(row);
      if (r < finishRow) { var g = document.createElement("div"); g.className = "cs-rowgap"; tree.appendChild(g); }
    }

    function drawLinks() {
      var tr = tree.getBoundingClientRect(), W = tree.clientWidth, H = tree.clientHeight;
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      function ctr(key) { var p = tree.querySelector('[data-key="' + key + '"]'); if (!p) return null; var b = p.getBoundingClientRect(); return { x: b.left - tr.left + b.width / 2, y: b.top - tr.top + b.height / 2, h: b.height }; }
      nodes.forEach(function (n) {
        (n.requires || []).forEach(function (rk) {
          var a = ctr(rk), b = ctr(n.key); if (!a || !b) return;
          var x1 = a.x, y1 = a.y + a.h / 2 - 2, x2 = b.x, y2 = b.y - b.h / 2 + 2, my = (y1 + y2) / 2;
          var p = document.createElementNS(SVGNS, "path");
          p.setAttribute("d", "M" + x1 + " " + y1 + " C" + x1 + " " + my + " " + x2 + " " + my + " " + x2 + " " + y2);
          var s = states[n.key];
          p.setAttribute("class", "cs-link" + (s === "solved" ? " is-solved" : (s === "open" ? " is-open" : "")));
          svg.appendChild(p);
        });
      });
    }
    requestAnimationFrame(drawLinks);
    if (window.ResizeObserver) new ResizeObserver(drawLinks).observe(tree); else window.addEventListener("resize", drawLinks);

    var legend = document.createElement("div"); legend.className = "cs-legend";
    legend.innerHTML = '<span><i class="l-solved"></i>Validee</span><span><i class="l-open"></i>Accessible</span><span><i class="l-lock"></i>Verrouillee</span>';
    root.appendChild(legend);

    function ghostCell(col) {
      var cell = document.createElement("div");
      var branch = (cfg.branches || [])[col];
      var g = document.createElement("div"); g.className = "cs-ghost";
      g.innerHTML = '<button class="cs-addnode" title="Ajouter un noeud">+</button>' +
        '<button class="cs-delbranch">supprimer branche</button>';
      g.querySelector(".cs-addnode").addEventListener("click", function () { cb.addNode && cb.addNode(col); });
      g.querySelector(".cs-delbranch").addEventListener("click", function () { cb.delBranch && cb.delBranch(col); });
      cell.appendChild(g);
      return cell;
    }

    function nodeEl(n, st) {
      var el = document.createElement("button"); el.type = "button"; el.className = "cs-node is-" + st;
      var chk = st === "solved";
      if (n.kind === "start" || n.kind === "finish") {
        var pod = '<span class="cs-podium ' + n.kind + '"><span class="cs-pod"></span>' +
          '<span class="cs-tile" data-key="' + n.key + '">' + ico(n.icon) + "</span>" +
          (chk ? '<span class="cs-podbadge">' + ICONS.check + "</span>" : "") + "</span>";
        var sign = '<span class="cs-sign ' + n.kind + '">' + esc((n.label || (n.kind === "start" ? "Depart" : "Arrivee")).toUpperCase()) + "</span>";
        el.innerHTML = n.kind === "start" ? sign + pod : pod + sign;
      } else {
        el.innerHTML = '<span class="cs-plat"><span class="cs-base"></span>' +
          '<span class="cs-disc" data-key="' + n.key + '">' + ico(n.icon) +
          (chk ? '<span class="cs-chk">' + ICONS.check + "</span>" : "") + "</span></span>" +
          '<div class="cs-label">' + esc(n.label) + "</div>" + dots(st);
      }
      if (edit) {
        el.addEventListener("click", function () { cb.editNode && cb.editNode(n.loc); });
      } else if ((st === "open" || st === "solved") && n.challenge && api[n.challenge]) {
        var id = api[n.challenge].id, name = n.challenge;
        el.addEventListener("click", function () { opts.onOpen && opts.onOpen(id, name); });
      }
      return el;
    }
  }

  window.CS29Map = { renderMap: renderMap, ICONS: ICONS, ICON_KEYS: Object.keys(ICONS).filter(function (k) { return k !== "check"; }) };
})();
