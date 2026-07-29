/* CS29 Map - cote admin : la carte joueur + edition, dans /admin/challenges */
(function () {
  if (!/^\/admin\/challenges\/?$/.test(window.location.pathname)) return;

  var cfg = null, CHALS = [], root = null, statusEl = null;
  function csrf() { try { return window.init.csrfNonce; } catch (e) { return ""; } }
  function getJSON(u) { return fetch(u, { headers: { Accept: "application/json" }, credentials: "same-origin" }).then(function (r) { return r.json(); }); }
  function esc(s) { return String(s == null ? "" : s).replace(/"/g, "&quot;").replace(/</g, "&lt;"); }

  function render() {
    window.CS29Map.renderMap(root, cfg, [], {
      edit: true,
      cb: { addBranch: addBranch, delBranch: delBranch, addNode: addNode, delNode: delNode, editNode: openEditor },
    });
  }
  function addBranch() { cfg.branches.push({ name: "Branche " + (cfg.branches.length + 1), nodes: [] }); render(); }
  function delBranch(bi) { if (confirm("Supprimer cette branche et ses noeuds ?")) { cfg.branches.splice(bi, 1); render(); } }
  function addNode(bi) { cfg.branches[bi].nodes.push({ challenge: "", label: "Nouveau", icon: "search" }); render(); openEditor({ type: "node", bi: bi, ni: cfg.branches[bi].nodes.length - 1 }); }
  function delNode(bi, ni) { cfg.branches[bi].nodes.splice(ni, 1); render(); }
  function target(loc) { return loc.type === "start" ? cfg.start : (loc.type === "finish" ? cfg.finish : cfg.branches[loc.bi].nodes[loc.ni]); }

  function openEditor(loc) {
    var obj = target(loc);
    var sel = { challenge: obj.challenge || "", label: obj.label || "", icon: obj.icon || "search" };
    var ICONS = window.CS29Map.ICONS, KEYS = window.CS29Map.ICON_KEYS;
    var title = loc.type === "start" ? "Depart" : (loc.type === "finish" ? "Arrivee" : "Noeud");

    var overlay = document.createElement("div"); overlay.className = "cs-modal";
    var chalOpts = '<option value="">-- aucun --</option>' + CHALS.map(function (n) { return '<option value="' + esc(n) + '"' + (n === sel.challenge ? " selected" : "") + ">" + n + "</option>"; }).join("");
    if (sel.challenge && CHALS.indexOf(sel.challenge) === -1) chalOpts += '<option value="' + esc(sel.challenge) + '" selected>' + sel.challenge + " (introuvable)</option>";
    var picker = KEYS.map(function (k) { return '<button type="button" class="cs-ic-opt' + (k === sel.icon ? " active" : "") + '" data-k="' + k + '" title="' + k + '">' + ICONS[k] + "</button>"; }).join("");

    overlay.innerHTML =
      '<div class="cs-modal-card">' +
        "<h5>Editer : " + title + "</h5>" +
        '<div class="cs-prev"><span class="cs-prev-disc">' + ICONS[sel.icon] + '</span><span class="cs-prev-label">' + (esc(sel.label) || "&nbsp;") + "</span></div>" +
        '<label>Challenge lie</label><select class="form-control mb-2" id="m-chal">' + chalOpts + "</select>" +
        '<label>Nom affiche</label><input class="form-control mb-2" id="m-label" value="' + esc(sel.label) + '">' +
        "<label>Icone</label><div class=\"cs-iconpick\">" + picker + "</div>" +
        '<div class="btn-row">' +
          (loc.type === "node" ? '<button class="btn btn-outline-danger" id="m-del">Supprimer le noeud</button>' : "<span></span>") +
          '<div><button class="btn btn-light" id="m-cancel">Annuler</button> <button class="btn btn-primary" id="m-ok">Valider</button></div>' +
        "</div>" +
      "</div>";
    document.body.appendChild(overlay);

    var prevDisc = overlay.querySelector(".cs-prev-disc"), prevLabel = overlay.querySelector(".cs-prev-label");
    var close = function () { overlay.remove(); };
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    overlay.querySelector("#m-cancel").addEventListener("click", close);
    overlay.querySelector("#m-chal").addEventListener("change", function () {
      sel.challenge = this.value;
      if (!sel.label) { sel.label = this.value; overlay.querySelector("#m-label").value = this.value; prevLabel.textContent = this.value; }
    });
    overlay.querySelector("#m-label").addEventListener("input", function () { sel.label = this.value; prevLabel.textContent = this.value || " "; });
    overlay.querySelectorAll(".cs-ic-opt").forEach(function (b) {
      b.addEventListener("click", function () {
        sel.icon = this.getAttribute("data-k");
        overlay.querySelectorAll(".cs-ic-opt").forEach(function (x) { x.classList.remove("active"); });
        this.classList.add("active");
        prevDisc.innerHTML = ICONS[sel.icon];
      });
    });
    overlay.querySelector("#m-ok").addEventListener("click", function () {
      obj.challenge = sel.challenge; obj.label = sel.label || sel.challenge; obj.icon = sel.icon;
      close(); render();
    });
    if (loc.type === "node") overlay.querySelector("#m-del").addEventListener("click", function () { cfg.branches[loc.bi].nodes.splice(loc.ni, 1); close(); render(); });
  }

  function save() {
    statusEl.textContent = "Enregistrement..."; statusEl.className = "small text-muted ml-1";
    fetch("/api/v1/cs29map", { method: "POST", headers: { "Content-Type": "application/json", "CSRF-Token": csrf() }, credentials: "same-origin", body: JSON.stringify(cfg) })
      .then(function (r) { return r.json(); })
      .then(function (j) { statusEl.textContent = j.success ? "Carte enregistree." : ("Erreur : " + (j.error || "?")); statusEl.className = "small ml-1 " + (j.success ? "text-success" : "text-danger"); })
      .catch(function () { statusEl.textContent = "Erreur reseau"; statusEl.className = "small ml-1 text-danger"; });
  }

  function inject() {
    if (!window.CS29Map) { setTimeout(inject, 60); return; }
    if (document.getElementById("cs-adm-wrap")) return;
    var wrap = document.createElement("div"); wrap.id = "cs-adm-wrap"; wrap.style.cssText = "margin:0 0 26px;";
    wrap.innerHTML =
      '<div class="cs-editbar">' +
        '<span class="cs-editbar-t">Carte du parcours</span>' +
        '<input id="cs-title" class="form-control form-control-sm" placeholder="Titre de la carte">' +
        '<button id="cs-addb" class="btn btn-outline-primary btn-sm">+ Branche</button>' +
        '<button id="cs-save" class="btn btn-success btn-sm">Enregistrer</button>' +
        '<a href="/challenges" target="_blank" class="btn btn-outline-secondary btn-sm">Voir cote joueur</a>' +
        '<span id="cs-st" class="small text-muted ml-1"></span>' +
      "</div>" +
      '<p class="text-muted small mb-2">Clique un noeud pour le relier a un challenge et choisir son icone. Utilise les + pour ajouter noeud / branche.</p>' +
      '<div id="cs-adv-root"></div>';
    var jumbo = document.querySelector(".jumbotron");
    if (jumbo && jumbo.parentNode) jumbo.parentNode.insertBefore(wrap, jumbo.nextSibling);
    else (document.querySelector("main") || document.body).prepend(wrap);

    root = wrap.querySelector("#cs-adv-root");
    statusEl = wrap.querySelector("#cs-st");
    wrap.querySelector("#cs-save").addEventListener("click", save);
    wrap.querySelector("#cs-addb").addEventListener("click", addBranch);

    Promise.all([getJSON("/api/v1/cs29map"), getJSON("/api/v1/challenges?view=admin")]).then(function (res) {
      cfg = (res[0] && res[0].data) || { title: "", start: {}, finish: {}, branches: [] };
      if (!cfg.start) cfg.start = {}; if (!cfg.finish) cfg.finish = {}; if (!cfg.branches) cfg.branches = [];
      CHALS = ((res[1] && res[1].data) || []).map(function (c) { return c.name; });
      var t = wrap.querySelector("#cs-title"); t.value = cfg.title || ""; t.addEventListener("input", function () { cfg.title = this.value; });
      render();
    }).catch(function () { root.innerHTML = '<div class="text-danger">Impossible de charger la carte.</div>'; });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject); else inject();
})();
