# Inté Cybersécurité 2029 - CTF

Plateforme CTF de l'inté cybersécurité (CentraleSupélec, promo 2029), basée sur
[CTFd](https://github.com/CTFd/CTFd) (licence Apache 2.0).

Ce dépôt contient le code CTFd + les personnalisations de l'inté. Les **flags**,
mots de passe et la base de données ne sont **pas** versionnés (voir `.gitignore`
et le dossier `secret/` ignoré).

## Personnalisations incluses

- `landing.html` : contenu de la page d'accueil (injecté dans la page `index` de CTFd).
- `custom_header.html` : CSS custom (cartes de challenges, scoreboard, footer masqué),
  injecté dans `Config > Theme > Header`. Adaptatif clair/sombre via les variables Bootstrap.
- `wsl-setup.sh` / `wsl-run.sh` : installation et lancement sous WSL2 (Linux ARM64).

## Déploiement local (WSL2 recommandé sur Windows ARM64)

Docker Desktop étant cassé sur cette machine (bug Inference manager ARM64), on lance
CTFd nativement dans WSL2 Ubuntu.

```bash
# 1. Installation (clone, venv, dépendances)
bash wsl-setup.sh

# 2. Initialisation de la base + lancement (gunicorn + gevent, port 8000)
bash wsl-run.sh
```

Puis compléter l'assistant sur http://localhost:8000 (nom de l'event + compte admin).

## Injecter les personnalisations

Depuis le dossier du projet, avec le venv actif :

```bash
python set_index.py     # page d'accueil <- landing.html
python inject_css.py    # CSS custom   <- custom_header.html
```

## Contenu (flags) : non versionné

La création des challenges se fait via des scripts placés dans `secret/`
(ignoré par git, car ils contiennent les flags). Pour sauvegarder/migrer le
contenu réel, utiliser l'export intégré de CTFd : `Admin > Config > Backup > Export`.

## Convention de flag

Tous les flags de l'inté ont la forme : `CS29{...}`

## Exposition publique (tunnel)

URL publique temporaire via Cloudflare quick tunnel :

```bash
cloudflared tunnel --url http://localhost:8000
```
