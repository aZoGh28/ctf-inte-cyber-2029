# -*- coding: utf-8 -*-
from CTFd import create_app

app = create_app()
with app.app_context():
    from CTFd.models import Users, Challenges

    print("=== USERS ===")
    for u in Users.query.all():
        print("id=" + str(u.id) + " name=" + str(u.name) + " type=" + str(u.type) + " email=" + str(u.email))
    print("=== CHALLENGES ===")
    for c in Challenges.query.all():
        print("id=" + str(c.id) + " name=" + str(c.name) + " cat=" + str(c.category) + " state=" + str(c.state))
