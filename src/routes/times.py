from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from werkzeug.security import generate_password_hash

from ..routes.auth.db.database import get_connection

times = Blueprint("times", __name__)

@times.route("/time", methods=["POST"])
def criar_time():

    dados = request.get_json()

    nome = dados.get("nome")
    email = dados.get("email")
    senha = dados.get("senha")
    cidade = dados.get("cidade")
    estado = dados.get("estado")
    escudo = dados.get("escudo")

    if not nome or not email or not senha:
        return jsonify({
            "erro": "Nome, email e senha são obrigatórios."
        }), 400

    if estado and len(estado) != 2:
        return jsonify({
            "erro": "Estado deve ser a sigla com 2 letras (ex: SC)."
        }), 400

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            SELECT id
            FROM usuario
            WHERE email = %s
        """, (email,))

        if cursor.fetchone():
            return jsonify({
                "erro": "Este email já está cadastrado."
            }), 409

        senha_hash = generate_password_hash(senha)

        cursor.execute("""
            INSERT INTO usuario
                (nome, email, senha, tipo)
            VALUES
                (%s, %s, %s, %s)
            RETURNING id
        """, (
            nome,
            email,
            senha_hash,
            "time"
        ))

        usuario_id = cursor.fetchone()[0]

        cursor.execute("""
            INSERT INTO time
                (nome, usuario_id, cidade, estado, escudo)
            VALUES
                (%s, %s, %s, %s, %s)
            RETURNING id
        """, (
            nome,
            usuario_id,
            cidade,
            estado,
            escudo
        ))

        time_id = cursor.fetchone()[0]

        conn.commit()

        return jsonify({
            "mensagem": "Time criado com sucesso!",
            "usuario_id": usuario_id,
            "time_id": time_id
        }), 201

    except Exception as erro:

        conn.rollback()

        print(erro)

        return jsonify({
            "erro": "Erro ao criar time."
        }), 500

    finally:

        cursor.close()
        conn.close()


@times.route("/time/meu", methods=["GET"])
@login_required
def meu_time():

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            SELECT id
            FROM time
            WHERE usuario_id = %s
        """, (current_user.id,))

        time = cursor.fetchone()

        if not time:
            return jsonify({
                "erro": "Esta conta não é um time."
            }), 404

        return jsonify({
            "time_id": time[0]
        }), 200

    except Exception as erro:

        print(erro)

        return jsonify({
            "erro": "Erro ao buscar o time."
        }), 500

    finally:

        cursor.close()
        conn.close()


@times.route("/time/<int:time_id>/atleta", methods=["POST"])
@login_required
def adicionar_atleta(time_id):

    cursor_conn = get_connection()
    cursor = cursor_conn.cursor()

    try:

        cursor.execute("""
            SELECT usuario_id
            FROM time
            WHERE id = %s
        """, (time_id,))

        time = cursor.fetchone()

        if not time:
            return jsonify({
                "erro": "Time não encontrado."
            }), 404

        if time[0] != current_user.id:
            return jsonify({
                "erro": "Você não tem permissão para administrar este time."
            }), 403

        dados = request.get_json()

        usuario_id = dados.get("usuario_id")

        if not usuario_id:
            return jsonify({
                "erro": "O usuario_id é obrigatório."
            }), 400

        cursor.execute("""
            SELECT id
            FROM atleta
            WHERE usuario_id = %s
        """, (usuario_id,))

        atleta = cursor.fetchone()

        if not atleta:
            return jsonify({
                "erro": "Atleta não encontrado."
            }), 404

        atleta_id = atleta[0]

        cursor.execute("""
            SELECT id
            FROM atleta_time
            WHERE atleta_id = %s
            AND time_id = %s
            AND data_saida IS NULL
        """, (
            atleta_id,
            time_id
        ))

        if cursor.fetchone():
            return jsonify({
                "erro": "Este atleta já está no time."
            }), 409

        cursor.execute("""
            INSERT INTO atleta_time
                (atleta_id, time_id, data_entrada)
            VALUES
                (%s, %s, CURRENT_DATE)
        """, (
            atleta_id,
            time_id
        ))

        cursor_conn.commit()

        return jsonify({
            "mensagem": "Atleta adicionado ao time."
        }), 201

    except Exception as erro:

        cursor_conn.rollback()

        print(erro)

        return jsonify({
            "erro": "Erro ao adicionar atleta."
        }), 500

    finally:

        cursor.close()
        cursor_conn.close()

@times.route(
    "/time/<int:time_id>/atleta/<int:atleta_id>",
    methods=["DELETE"]
)
@login_required
def remover_atleta(time_id, atleta_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            SELECT usuario_id
            FROM time
            WHERE id = %s
        """, (time_id,))

        time = cursor.fetchone()

        if not time:
            return jsonify({
                "erro": "Time não encontrado."
            }), 404

        if time[0] != current_user.id:
            return jsonify({
                "erro": "Você não tem permissão para administrar este time."
            }), 403

        cursor.execute("""
            SELECT id
            FROM atleta_time
            WHERE atleta_id = %s
            AND time_id = %s
            AND data_saida IS NULL
        """, (
            atleta_id,
            time_id
        ))

        registro = cursor.fetchone()

        if not registro:
            return jsonify({
                "erro": "Este atleta não está no time."
            }), 404

        cursor.execute("""
            UPDATE atleta_time
            SET data_saida = CURRENT_DATE
            WHERE atleta_id = %s
            AND time_id = %s
            AND data_saida IS NULL
        """, (
            atleta_id,
            time_id
        ))

        conn.commit()

        return jsonify({
            "mensagem": "Atleta removido do time."
        }), 200

    except Exception as erro:

        conn.rollback()

        print(erro)

        return jsonify({
            "erro": "Erro ao remover atleta."
        }), 500

    finally:

        cursor.close()
        conn.close()

@times.route("/time/<int:time_id>/atletas", methods=["GET"])
def listar_atletas(time_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            SELECT id
            FROM time
            WHERE id = %s
        """, (time_id,))

        if not cursor.fetchone():
            return jsonify({
                "erro": "Time não encontrado."
            }), 404

        cursor.execute("""
            SELECT
                a.id,
                u.id,
                u.nome,
                a.foto,
                a.modalidade,
                a.posicao,
                at.data_entrada
            FROM atleta_time at

            JOIN atleta a
                ON at.atleta_id = a.id

            JOIN usuario u
                ON a.usuario_id = u.id

            WHERE at.time_id = %s
            AND at.data_saida IS NULL

            ORDER BY u.nome
        """, (time_id,))

        atletas = cursor.fetchall()

        resultado = []

        for atleta in atletas:

            resultado.append({
                "atleta_id": atleta[0],
                "usuario_id": atleta[1],
                "nome": atleta[2],
                "foto": atleta[3],
                "modalidade": atleta[4],
                "posicao": atleta[5],
                "data_entrada": atleta[6]
            })

        return jsonify(resultado), 200

    except Exception as erro:

        print(erro)

        return jsonify({
            "erro": "Erro ao listar atletas do time."
        }), 500

    finally:

        cursor.close()
        conn.close()


@times.route("/time/<int:time_id>/historico", methods=["GET"])
def historico_time(time_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            SELECT
                a.id,
                u.id,
                u.nome,
                a.foto,
                at.data_entrada,
                at.data_saida
            FROM atleta_time at

            JOIN atleta a
                ON at.atleta_id = a.id

            JOIN usuario u
                ON a.usuario_id = u.id

            WHERE at.time_id = %s

            ORDER BY at.data_entrada DESC
        """, (time_id,))

        atletas = cursor.fetchall()

        resultado = []

        for atleta in atletas:

            resultado.append({
                "atleta_id": atleta[0],
                "usuario_id": atleta[1],
                "nome": atleta[2],
                "foto": atleta[3],
                "data_entrada": atleta[4],
                "data_saida": atleta[5]
            })

        return jsonify(resultado), 200

    except Exception as erro:

        print(erro)

        return jsonify({
            "erro": "Erro ao buscar histórico do time."
        }), 500

    finally:

        cursor.close()
        conn.close()


@times.route("/time/<int:time_id>", methods=["GET"])
def dados_time(time_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            SELECT
                t.id,
                t.usuario_id,
                t.nome,
                u.email,
                t.cidade,
                t.estado,
                t.escudo,
                u.data_criacao
            FROM time t

            JOIN usuario u
                ON t.usuario_id = u.id

            WHERE t.id = %s
        """, (time_id,))

        time = cursor.fetchone()

        if not time:
            return jsonify({
                "erro": "Time não encontrado."
            }), 404

        return jsonify({
            "id": time[0],
            "usuario_id": time[1],
            "nome": time[2],
            "email": time[3],
            "cidade": time[4],
            "estado": time[5],
            "escudo": time[6],
            "data_criacao": time[7]
        }), 200

    except Exception as erro:

        print(erro)

        return jsonify({
            "erro": "Erro ao buscar dados do time."
        }), 500

    finally:

        cursor.close()
        conn.close()


@times.route("/time/<int:time_id>", methods=["PUT"])
@login_required
def atualizar_time(time_id):

    dados = request.get_json()

    nome = dados.get("nome")
    email = dados.get("email")
    cidade = dados.get("cidade")
    estado = dados.get("estado")
    escudo = dados.get("escudo")

    if estado and len(estado) != 2:
        return jsonify({
            "erro": "Estado deve ser a sigla com 2 letras (ex: SC)."
        }), 400

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            SELECT usuario_id
            FROM time
            WHERE id = %s
        """, (time_id,))

        time = cursor.fetchone()

        if not time:
            return jsonify({
                "erro": "Time não encontrado."
            }), 404

        if time[0] != current_user.id:
            return jsonify({
                "erro": "Você não tem permissão para editar este time."
            }), 403

        if nome or email:

            cursor.execute("""
                UPDATE usuario
                SET
                    nome = COALESCE(%s, nome),
                    email = COALESCE(%s, email)
                WHERE id = %s
            """, (
                nome,
                email,
                current_user.id
            ))

        cursor.execute("""
            UPDATE time
            SET
                nome = COALESCE(%s, nome),
                cidade = COALESCE(%s, cidade),
                estado = COALESCE(%s, estado),
                escudo = COALESCE(%s, escudo)
            WHERE id = %s
        """, (
            nome,
            cidade,
            estado,
            escudo,
            time_id
        ))

        conn.commit()

        return jsonify({
            "mensagem": "Time atualizado com sucesso."
        }), 200

    except Exception as erro:

        conn.rollback()

        print(erro)

        return jsonify({
            "erro": "Erro ao atualizar time."
        }), 500

    finally:

        cursor.close()
        conn.close()

@times.route("/time/<int:time_id>", methods=["DELETE"])
@login_required
def excluir_time(time_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            SELECT usuario_id
            FROM time
            WHERE id = %s
        """, (time_id,))

        time = cursor.fetchone()

        if not time:
            return jsonify({
                "erro": "Time não encontrado."
            }), 404

        usuario_id = time[0]

        if usuario_id != current_user.id:
            return jsonify({
                "erro": "Você não tem permissão para excluir este time."
            }), 403

        cursor.execute("""
            DELETE FROM usuario
            WHERE id = %s
        """, (usuario_id,))

        conn.commit()

        return jsonify({
            "mensagem": "Time excluído com sucesso."
        }), 200

    except Exception as erro:

        conn.rollback()

        print(erro)

        return jsonify({
            "erro": "Erro ao excluir time."
        }), 500

    finally:

        cursor.close()
        conn.close()