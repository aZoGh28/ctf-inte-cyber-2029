from CTFd import create_app
from CTFd.utils import get_config

app = create_app()
with app.app_context():
    from CTFd.models import Users, Challenges
    print("SETUP_DONE=" + str(bool(get_config("setup"))))
    print("ADMINS=" + str(Users.query.filter_by(type="admin").count()))
    print("CHALLENGES=" + str(Challenges.query.count()))
