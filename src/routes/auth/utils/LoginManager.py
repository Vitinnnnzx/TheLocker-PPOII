from flask_login import LoginManager
from ..db.database import get_connection
from .User import User
from flask import render_template

login_manager = LoginManager()

@login_manager.user_loader
def carregar_usuario(user_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT id, nome, email, tipo FROM usuario WHERE id = %s",
            (user_id,)
        )

        user = cursor.fetchone()
        if user:
            return User(user[0], user[1], user[2], user[3])
        return None

    finally:
        cursor.close()
        conn.close()

@login_manager.unauthorized_handler
def unauthorized():
    return render_template("errors-page/page401.html"), 401