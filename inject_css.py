# -*- coding: utf-8 -*-
import io, re
from CTFd import create_app

app = create_app()
with app.app_context():
    from CTFd.utils import get_config, set_config

    with io.open("custom_header.html", "r", encoding="utf-8") as f:
        block = f.read().strip()

    current = get_config("theme_header") or ""
    # Retire tout ancien <style> contenant notre marqueur, puis reinjecte
    cleaned = re.sub(
        r"<style>\s*/\* CS29-CUSTOM-START \*/.*?/\* CS29-CUSTOM-END \*/\s*</style>",
        "",
        current,
        flags=re.DOTALL,
    ).strip()

    new_header = (cleaned + "\n" + block).strip()
    set_config("theme_header", new_header)

    try:
        from CTFd.cache import clear_config
        clear_config()
    except Exception as e:
        print("cache skip: " + str(e))

    print("THEME_HEADER_MAJ len=" + str(len(new_header)))
    print("CONTIENT_MARQUEUR=" + str("CS29-CUSTOM-START" in (get_config("theme_header") or "")))
