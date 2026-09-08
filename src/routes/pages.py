from flask import render_template, Blueprint
from flask_login import login_required

app_pages = Blueprint("pages", __name__)

@app_pages.route("/")
def index():
    return render_template("index.html")


@app_pages.route("/login")
def login():
    return render_template("login.html")


@app_pages.route("/criar-conta")
def criar_conta():
    return render_template("criar-conta.html")


@app_pages.route("/inicio")
@login_required
def inicio():
    return render_template("inicio.html")


@app_pages.route("/perfil")
@login_required
def perfil():
    return render_template("perfil.html")

@app_pages.route("/config")
@login_required
def config():
    return render_template("config.html")

@app_pages.route("/criar-time")
def criar_time():
    return render_template("criar-time.html")

@app_pages.route("/time-perfil")
@login_required 
def page_time():
    return render_template("time.html")