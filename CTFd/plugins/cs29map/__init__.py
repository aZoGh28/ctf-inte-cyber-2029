# -*- coding: utf-8 -*-
"""
CS29 Map : parcours "skill tree" configurable depuis l'admin.

Pas d'onglet separe : un editeur visuel est injecte en haut de la page
Admin > Challenges (via un script admin). La carte cote joueur remplace le
board sur /challenges.

API :
    GET  /api/v1/cs29map  -> config (structure) pour le front (lisible par tous)
    POST /api/v1/cs29map  -> sauvegarde (admin uniquement)
Aucun flag stocke ici (juste la structure).
"""
import json
import os
import time
from random import randint

from flask import (
    Blueprint, request, jsonify, send_from_directory, redirect, url_for,
    render_template_string, session, flash,
)

from CTFd.utils import get_config, set_config
from CTFd.utils.decorators import admins_only
from CTFd.plugins import (
    register_plugin_assets_directory,
    register_plugin_script,
    register_plugin_stylesheet,
    register_admin_plugin_script,
    register_admin_plugin_stylesheet,
    bypass_csrf_protection,
)

CONFIG_KEY = "cs29map_config"

ICONS = [
    "terminal", "search", "code", "lock", "wifi", "syringe", "image",
    "list", "usercheck", "bug", "share", "trash", "flag", "hash", "cpu",
]


def default_config():
    return {
        "title": "La chaine d'attaque",
        "start": {"challenge": "Ton premier flag", "label": "Départ", "icon": "terminal"},
        "finish": {"challenge": "Le trésor", "label": "Arrivée", "icon": "flag"},
        "branches": [
            {"name": "Recon", "nodes": [
                {"challenge": "Reconnaissance", "label": "Reconnaissance", "icon": "search"},
                {"challenge": "Réseaux", "label": "Réseaux", "icon": "wifi"},
                {"challenge": "Énumération", "label": "Énumération", "icon": "list"},
                {"challenge": "Pivoting", "label": "Pivoting", "icon": "share"},
            ]},
            {"name": "Web", "nodes": [
                {"challenge": "Web", "label": "Web", "icon": "code"},
                {"challenge": "Injection", "label": "Injection", "icon": "syringe"},
                {"challenge": "Privilège", "label": "Privilège", "icon": "usercheck"},
                {"challenge": "Maintien d'accès", "label": "Maintien d'accès", "icon": "terminal"},
            ]},
            {"name": "Crypto", "nodes": [
                {"challenge": "Crypto", "label": "Crypto", "icon": "lock"},
                {"challenge": "Stéganographie", "label": "Stéganographie", "icon": "image"},
                {"challenge": "Exploitation", "label": "Exploitation", "icon": "bug"},
                {"challenge": "Cleanup", "label": "Cleanup", "icon": "trash"},
            ]},
        ],
    }


def get_map_config():
    raw = get_config(CONFIG_KEY)
    if not raw:
        return default_config()
    try:
        return json.loads(raw)
    except Exception:
        return default_config()


WEB_DIR = os.path.join(os.path.dirname(__file__), "assets", "web")


def load(app):
    bp = Blueprint("cs29map", __name__)

    # URL propre pour le challenge web : /web1/ (et /web1/page2.html, /web1/login.js ...)
    @bp.route("/web1/", methods=["GET"])
    def cs_site_index():
        return send_from_directory(WEB_DIR, "page1.html")

    @bp.route("/web1/<path:path>", methods=["GET"])
    def cs_site_files(path):
        return send_from_directory(WEB_DIR, path)

    WEB2_CODE = "CS29-R4PIDF1RE"
    WEB2_FLAG = os.environ.get("CS29_WEB2_FLAG", "CS29{REMPLACE_MOI_web2}")
    # Epreuve : la page affiche un calcul "a + b". Le formulaire n'a PAS de champ
    # visible -> le joueur doit decouvrir le parametre POST "result" (F12 / DevTools)
    # et renvoyer la bonne reponse. Il faut reussir WEB2_TARGET calculs d'affilee dans
    # une fenetre de WEB2_WINDOW secondes : infaisable a la main -> il faut automatiser
    # (requests.Session : GET la page, lire a et b, POST result). Compteur stocke en
    # SESSION (cookie) -> par joueur, robuste derriere requests.Session().
    # WEB2_WINDOW est reglable par env pour absorber la latence (RTT prod).
    WEB2_TARGET = int(os.environ.get("CS29_WEB2_TARGET", "10"))
    WEB2_WINDOW = float(os.environ.get("CS29_WEB2_WINDOW", "5"))

    def render_web2():
        a = randint(1, 100)
        b = randint(1, 100)
        session["web2_result"] = a + b
        count = int(session.get("web2_count", 0))
        with open(os.path.join(WEB_DIR, "web2.html"), encoding="utf-8") as fh:
            tpl = fh.read()
        return render_template_string(tpl, a=a, b=b, count=count)

    @bp.route("/web2/", methods=["GET"])
    def cs_web2_index():
        return render_web2()

    @bp.route("/web2/web2.css", methods=["GET"])
    def cs_web2_css():
        return send_from_directory(WEB_DIR, "web2.css")

    @bp.route("/web2/action", methods=["POST"])
    @bypass_csrf_protection
    def cs_web2_action():
        # Etape 2 : renvoyer le code debloque en POST -> le flag
        if request.values.get("code") == WEB2_CODE:
            return WEB2_FLAG

        result = request.form.get("result")
        if result is None:
            session["web2_count"] = 0
            flash("Il manque le parametre POST 'result'.")
            return redirect(url_for("cs29map.cs_web2_index"))

        try:
            correct = int(result) == int(session.get("web2_result", -1))
        except (TypeError, ValueError):
            correct = False

        if not correct:
            session["web2_count"] = 0
            return redirect(url_for("cs29map.cs_web2_index"))

        now = time.time()
        count = int(session.get("web2_count", 0))
        start = float(session.get("web2_start", 0.0))

        if count == 0:
            session["web2_count"] = 1
            session["web2_start"] = now
        elif now - start >= WEB2_WINDOW:
            session["web2_count"] = 0
            flash("Temps ecoule, recommence depuis le debut.")
        else:
            count += 1
            session["web2_count"] = count
            if count >= WEB2_TARGET:
                session["web2_count"] = 0
                return send_from_directory(WEB_DIR, "code.html")

        return redirect(url_for("cs29map.cs_web2_index"))

    @bp.route("/api/v1/cs29map", methods=["GET"])
    def api_get():
        return jsonify({"success": True, "data": get_map_config(), "icons": ICONS})

    @bp.route("/api/v1/cs29map", methods=["POST"])
    @admins_only
    def api_save():
        try:
            data = request.get_json(force=True)
        except Exception:
            return jsonify({"success": False, "error": "JSON invalide"}), 400
        if not isinstance(data, dict) or "branches" not in data:
            return jsonify({"success": False, "error": "Structure invalide"}), 400
        set_config(CONFIG_KEY, json.dumps(data, ensure_ascii=False))
        try:
            from CTFd.cache import clear_config
            clear_config()
        except Exception:
            pass
        return jsonify({"success": True})

    app.register_blueprint(bp)
    register_plugin_assets_directory(app, base_path="/plugins/cs29map/assets/")
    # Cote joueur
    register_plugin_stylesheet("/plugins/cs29map/assets/map.css")
    register_plugin_script("/plugins/cs29map/assets/map.js")
    register_plugin_script("/plugins/cs29map/assets/user.js")
    # Cote admin
    register_admin_plugin_stylesheet("/plugins/cs29map/assets/map.css")
    register_admin_plugin_script("/plugins/cs29map/assets/map.js")
    register_admin_plugin_script("/plugins/cs29map/assets/admin.js")
