# -*- coding: utf-8 -*-
from CTFd import create_app

app = create_app()
with app.app_context():
    from CTFd.models import db, Challenges

    to_delete = ["Message inverse", "Base64"]
    for name in to_delete:
        c = Challenges.query.filter_by(name=name).first()
        if c:
            db.session.delete(c)
            db.session.commit()
            print("SUPPRIME " + name)
        else:
            print("ABSENT " + name)

    try:
        from CTFd.cache import clear_challenges, clear_standings
        clear_challenges()
        clear_standings()
    except Exception as e:
        print("cache skip: " + str(e))

    print("--- RESTANT ---")
    for c in Challenges.query.all():
        print("[" + str(c.category) + "] " + str(c.name) + " - " + str(c.value) + " pts")
