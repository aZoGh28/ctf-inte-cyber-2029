# -*- coding: utf-8 -*-
from CTFd import create_app

app = create_app()
with app.app_context():
    from CTFd.models import db, Pages

    ROUTE = "aventure"
    TITLE = "L'aventure"
    CONTENT = '<div id="cs-adv-root"></div>'

    p = Pages.query.filter_by(route=ROUTE).first()
    if not p:
        p = Pages(title=TITLE, route=ROUTE, content=CONTENT, draft=False)
        db.session.add(p)
    else:
        p.title = TITLE
        p.content = CONTENT
        p.draft = False

    # Format HTML si le champ existe
    if hasattr(p, "format"):
        p.format = "html"
    # Reserve aux comptes connectes (la carte lit la progression de l'utilisateur)
    if hasattr(p, "auth_required"):
        p.auth_required = True

    db.session.commit()

    try:
        from CTFd.cache import clear_config, clear_pages
        clear_config(); clear_pages()
    except Exception as e:
        print("cache skip: " + str(e))

    print("PAGE_OK route=/" + p.route + " title=" + p.title + " id=" + str(p.id))
