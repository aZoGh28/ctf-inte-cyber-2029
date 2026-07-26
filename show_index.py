from CTFd import create_app

app = create_app()
with app.app_context():
    from CTFd.models import Pages

    p = Pages.query.filter_by(route="index").first()
    if not p:
        print("PAS_DE_PAGE_INDEX")
    else:
        print("TITLE=" + str(p.title))
        print("FORMAT=" + str(getattr(p, "format", "n/a")))
        print("DRAFT=" + str(p.draft))
        print("HIDDEN=" + str(getattr(p, "hidden", "n/a")))
        print("=== CONTENT ===")
        print(p.content)
