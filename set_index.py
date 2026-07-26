import io
from CTFd import create_app

app = create_app()
with app.app_context():
    from CTFd.models import db, Pages

    with io.open("landing.html", "r", encoding="utf-8") as f:
        html = f.read()

    p = Pages.query.filter_by(route="index").first()
    if not p:
        p = Pages(title="Inté Cybersécurité 2029", route="index", content=html, draft=False)
        db.session.add(p)
    else:
        p.content = html
        p.draft = False
    db.session.commit()

    # Vider le cache de config/pages pour un affichage immediat
    try:
        from CTFd.cache import clear_config, clear_pages
        clear_config()
        clear_pages()
    except Exception as e:
        print("cache clear skip: " + str(e))

    print("INDEX_MAJ len=" + str(len(p.content)))
