# -*- coding: utf-8 -*-
import io
from CTFd import create_app

app = create_app()
with app.app_context():
    from CTFd.utils import set_config
    with io.open("custom_footer.html", "r", encoding="utf-8") as f:
        block = f.read().strip()
    set_config("theme_footer", block)  # overwrite complet
    try:
        from CTFd.cache import clear_config
        clear_config()
    except Exception as e:
        print("cache skip: " + str(e))
    print("THEME_FOOTER_MAJ len=" + str(len(block)))
