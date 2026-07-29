from pathlib import Path

from flask import Flask, request, render_template_string, Response

app = Flask(__name__)

page1_PATH = Path(__file__).with_name("page1.html")
page2_PATH = Path(__file__).with_name("page2.html")
LOGIN_JS_PATH = Path(__file__).with_name("login.js")


@app.route("/web1", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        print("POST")
        return render_template_string(page2_PATH.read_text(encoding="utf-8"))
    return render_template_string(page1_PATH.read_text(encoding="utf-8"))


@app.route("/login.js")
def login_js():
    return Response(
        LOGIN_JS_PATH.read_text(encoding="utf-8"), mimetype="application/javascript"
    )


if __name__ == "__main__":
    app.run(debug=True, port=5500)
