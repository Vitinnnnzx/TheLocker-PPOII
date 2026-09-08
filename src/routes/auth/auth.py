from flask import Blueprint, request, jsonify, redirect
from flask_login import logout_user, login_user
from werkzeug.security import generate_password_hash, check_password_hash

from .db.database import get_connection
from .utils.User import User

auth = Blueprint("auth", __name__)

@auth.route("/criar-conta", methods=["POST"])
def criar_conta():

    dados = request.get_json()

    nome = dados.get("nome")
    email = dados.get("email")
    senha = dados.get("senha")
    tipo = dados.get("tipo")

    if not nome or not email or not senha or not tipo:
        return jsonify({
            "erro": "Todos os campos são obrigatórios."
        }), 400

    conexao = get_connection()
    cursor = conexao.cursor()

    try:

        cursor.execute(
            """
            SELECT id
            FROM usuario
            WHERE email = %s
            """,
            (email,)
        )

        usuario = cursor.fetchone()

        if usuario:
            return jsonify({
                "erro": "Este email já está cadastrado."
            }), 409

        senha_hash = generate_password_hash(senha)

        cursor.execute(
            """
            INSERT INTO usuario (nome, email, senha, tipo)
            VALUES (%s, %s, %s, %s)
            RETURNING id
            """,
            (nome, email, senha_hash, tipo)
        )

        usuario_id = cursor.fetchone()[0]
        if tipo == "atleta":
            cursor.execute(
            """
                INSERT INTO atleta (usuario_id)
                VALUES (%s)
            """,
            (usuario_id,)
            )
        conexao.commit()

        return jsonify({
            "mensagem": "Conta criada com sucesso!",
            "usuario_id": usuario_id
        }), 201

    except Exception as erro:

        conexao.rollback()

        return jsonify({
            "erro": "Erro ao criar conta."
        }), 500

    finally:

        cursor.close()
        conexao.close()


@auth.route("/login", methods=["POST"])
def login():

    dados = request.get_json()

    email = dados.get("email")
    senha = dados.get("senha")

    if not email or not senha:
        return jsonify({
            "erro": "Email e senha são obrigatórios."
        }), 400

    conexao = get_connection()
    cursor = conexao.cursor()

    try:

        cursor.execute(
            """
            SELECT id, nome, email, senha, tipo
            FROM usuario
            WHERE email = %s
            """,
            (email,)
        )

        usuario = cursor.fetchone()

        if not usuario:
            return jsonify({
                "erro": "Email ou senha incorretos."
            }), 401

        usuario_id = usuario[0]
        nome = usuario[1]
        email = usuario[2]
        senha_hash = usuario[3]
        tipo = usuario[4]

        if not check_password_hash(senha_hash, senha):
            return jsonify({
                "erro": "Email ou senha incorretos."
            }), 401

        login_user(User(usuario_id, nome, email, tipo))

        return jsonify({
            "mensagem": "Login realizado com sucesso!",
            "usuario": {
                "id": usuario_id,
                "nome": nome,
                "email": email,
                "tipo": tipo
            }
        }), 200

    except Exception as erro:

        return jsonify({
            "erro": "Erro ao realizar login."
        }), 500

    finally:

        cursor.close()
        conexao.close()

@auth.route("/logout")
def logout():
    logout_user()
    return redirect("/")