/* CS29 Map - cote joueur : remplace le board sur /challenges par la carte */
(function () {
  if (!/^\/challenges\/?$/.test(window.location.pathname)) return;

  function urlRoot() { try { if (window.CTFd && CTFd.config && CTFd.config.urlRoot) return CTFd.config.urlRoot; } catch (e) {} return ""; }
  function getJSON(u) { return fetch(urlRoot() + u, { headers: { Accept: "application/json" }, credentials: "same-origin" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  function openChallenge(id, name) {
    try { window.dispatchEvent(new CustomEvent("load-challenge", { detail: id })); }
    catch (e) { window.location.href = urlRoot() + "/challenges#" + encodeURIComponent(name) + "-" + id; }
  }

  function mount() {
    if (!window.CS29Map) { setTimeout(mount, 60); return; }
    var board = document.querySelector('[x-data="ChallengeBoard"]');
    if (!board) { setTimeout(mount, 120); return; }
    document.body.classList.add("cs-map-mode");
    var root = document.getElementById("cs-adv-root");
    if (!root) { root = document.createElement("div"); root.id = "cs-adv-root"; board.parentNode.insertBefore(root, board); }
    var draw = function () {
      Promise.all([getJSON("/api/v1/cs29map"), getJSON("/api/v1/challenges")])
        .then(function (res) { window.CS29Map.renderMap(root, (res[0] && res[0].data) || {}, (res[1] && res[1].data) || [], { edit: false, onOpen: openChallenge }); })
        .catch(function () { root.innerHTML = '<p style="text-align:center;padding:60px 0;color:#94a3b8;">Connecte-toi pour voir le parcours.</p>'; });
    };
    draw();
    window.addEventListener("load-challenges", function () { setTimeout(draw, 400); });
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") draw(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
