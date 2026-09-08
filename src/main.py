import os
from flask import Flask
from dotenv import load_dotenv
from .routes.pages import app_pages
from .routes.auth.auth import auth
from .routes.postagens import postagens
from .routes.busca import busca
from .routes.perfil import perfil
from .routes.times import times
from .routes.auth.utils.LoginManager import login_manager

load_dotenv()

app = Flask(__name__, template_folder="../public/", static_folder="../public/static")
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key-troque-em-producao")

app.register_blueprint(app_pages)
app.register_blueprint(auth)
app.register_blueprint(postagens)
app.register_blueprint(busca)
app.register_blueprint(perfil)
app.register_blueprint(times)

login_manager.init_app(app)
login_manager.login_view = "pages.login"

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=6767)