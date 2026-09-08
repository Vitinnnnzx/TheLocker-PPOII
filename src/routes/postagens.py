from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from .auth.db.database import get_connection


postagens = Blueprint("postagens", __name__)


@postagens.route("/postagem", methods=["POST"])
@login_required
def criar_postagem():

    dados = request.get_json(silent=True) or {}

    texto = dados.get("texto")
    imagem = dados.get("imagem")

    if not texto and not imagem:
        return jsonify({
            "erro": "A postagem precisa ter texto ou imagem."
        }), 400

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # BUG original: inseria com atleta_id obtido via subquery em
        # atleta — contas de time (tipo='time') não têm linha em atleta,
        # então a subquery retornava NULL e o INSERT quebrava com um
        # erro de NOT NULL não tratado (sem try/except aqui). Agora
        # publicacao referencia usuario_id diretamente, então tanto
        # atleta quanto time conseguem postar.
        cursor.execute(
            """
            INSERT INTO publicacao (usuario_id, texto, imagem)
            VALUES (%s, %s, %s)
            RETURNING id
            """,
            (current_user.id, texto, imagem)
        )

        postagem_id = cursor.fetchone()[0]

        conn.commit()

        return jsonify({
            "mensagem": "Postagem criada!",
            "id": postagem_id
        }), 201

    except Exception as erro:

        conn.rollback()

        print(erro)

        return jsonify({
            "erro": "Erro ao criar postagem."
        }), 500

    finally:
        cursor.close()
        conn.close()

@postagens.route("/postagens", methods=["GET"])
def pegar_postagens():

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT
                p.id,
                p.texto,
                p.imagem,
                p.data_criacao,
                u.id,
                u.nome,
                u.tipo,
                COALESCE(a.foto, t.escudo) AS foto
            FROM publicacao p
            JOIN usuario u ON p.usuario_id = u.id
            LEFT JOIN atleta a ON a.usuario_id = u.id
            LEFT JOIN time t ON t.usuario_id = u.id
            ORDER BY p.data_criacao DESC
            """
        )

        postagens = cursor.fetchall()

        resultado = []

        for p in postagens:
            resultado.append({
                "id": p[0],
                "texto": p[1],
                "imagem": p[2],
                "data_criacao": p[3],
                "usuario": {
                    "id": p[4],
                    "nome": p[5],
                    "tipo": p[6],
                    "foto": p[7]
                }
            })

        return jsonify(resultado), 200

    except Exception as erro:

        print(erro)

        return jsonify({
            "erro": "Erro ao buscar postagens."
        }), 500

    finally:
        cursor.close()
        conn.close()


@postagens.route("/postagem/<int:postagem_id>/curtir", methods=["POST"])
@login_required
def curtir_postagem(postagem_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id FROM publicacao WHERE id = %s
        """, (postagem_id,))

        if not cursor.fetchone():
            return jsonify({
                "erro": "Postagem não encontrada."
            }), 404

        cursor.execute(
            """
            INSERT INTO curtida (usuario_id, publicacao_id)
            VALUES (%s, %s)
            ON CONFLICT (usuario_id, publicacao_id)
            DO NOTHING
            """,
            (current_user.id, postagem_id)
        )

        conn.commit()

        return jsonify({
            "mensagem": "Postagem curtida!"
        }), 200

    except Exception as erro:

        conn.rollback()

        print(erro)

        return jsonify({
            "erro": "Erro ao curtir postagem."
        }), 500

    finally:
        cursor.close()
        conn.close()

@postagens.route("/usuario", methods=["GET"])
@login_required
def pegar_usuario():

    return jsonify({
        "id": current_user.id,
        "nome": current_user.nome,
        "email": current_user.email,
        "tipo": current_user.tipo
    }), 200


@postagens.route("/postagem/<int:postagem_id>/curtir", methods=["DELETE"])
@login_required
def descurtir_postagem(postagem_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            DELETE FROM curtida
            WHERE usuario_id = %s
            AND publicacao_id = %s
            """,
            (current_user.id, postagem_id)
        )

        conn.commit()

        return jsonify({
            "mensagem": "Curtida removida!"
        }), 200

    except Exception as erro:

        conn.rollback()

        print(erro)

        return jsonify({
            "erro": "Erro ao remover curtida."
        }), 500

    finally:
        cursor.close()
        conn.close()


@postagens.route("/postagem/<int:postagem_id>/comentario", methods=["POST"])
@login_required
def comentar(postagem_id):

    dados = request.get_json(silent=True) or {}
    texto = dados.get("texto")

    if not texto:
        return jsonify({
            "erro": "O comentário não pode estar vazio."
        }), 400

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id FROM publicacao WHERE id = %s
        """, (postagem_id,))

        if not cursor.fetchone():
            return jsonify({
                "erro": "Postagem não encontrada."
            }), 404

        cursor.execute(
            """
            INSERT INTO comentario
                (usuario_id, publicacao_id, texto)
            VALUES (%s, %s, %s)
            RETURNING id
            """,
            (current_user.id, postagem_id, texto)
        )

        comentario_id = cursor.fetchone()[0]

        conn.commit()

        return jsonify({
            "mensagem": "Comentário criado!",
            "id": comentario_id
        }), 201

    except Exception as erro:

        conn.rollback()

        print(erro)

        return jsonify({
            "erro": "Erro ao criar comentário."
        }), 500

    finally:
        cursor.close()
        conn.close()


@postagens.route(
    "/postagem/<int:postagem_id>/comentarios",
    methods=["GET"]
)
def pegar_comentarios(postagem_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT
                c.id,
                c.texto,
                c.data_criacao,
                u.id,
                u.nome
            FROM comentario c
            JOIN usuario u
                ON c.usuario_id = u.id
            WHERE c.publicacao_id = %s
            ORDER BY c.data_criacao ASC
            """,
            (postagem_id,)
        )

        comentarios = cursor.fetchall()

        resultado = []

        for comentario in comentarios:
            resultado.append({
                "id": comentario[0],
                "texto": comentario[1],
                "data_criacao": comentario[2],
                "usuario": {
                    "id": comentario[3],
                    "nome": comentario[4]
                }
            })

        return jsonify(resultado), 200

    except Exception as erro:

        print(erro)

        return jsonify({
            "erro": "Erro ao buscar comentários."
        }), 500

    finally:
        cursor.close()
        conn.close()

@postagens.route("/feed/postagens", methods=["GET"])
@login_required
def pegar_feed():

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # BUG original: o feed dava JOIN atleta a ON p.atleta_id = a.id,
        # então nunca teria funcionado para postagens de times mesmo depois
        # da tabela ser corrigida. Agora acompanha o mesmo esquema de
        # pegar_postagens (usuario_id + LEFT JOIN em atleta/time).
        cursor.execute("""
            SELECT
                p.id,
                p.texto,
                p.imagem,
                p.data_criacao,
                u.id,
                u.nome,
                u.tipo,
                COALESCE(a.foto, t.escudo) AS foto,

                (
                    SELECT COUNT(*)
                    FROM curtida c
                    WHERE c.publicacao_id = p.id
                ) AS curtidas,

                (
                    SELECT COUNT(*)
                    FROM comentario c
                    WHERE c.publicacao_id = p.id
                ) AS comentarios,

                EXISTS (
                    SELECT 1
                    FROM curtida c
                    WHERE c.publicacao_id = p.id
                    AND c.usuario_id = %s
                ) AS curtiu

            FROM publicacao p

            JOIN usuario u
                ON p.usuario_id = u.id

            LEFT JOIN atleta a
                ON a.usuario_id = u.id

            LEFT JOIN time t
                ON t.usuario_id = u.id

            ORDER BY p.data_criacao DESC
        """, (current_user.id,))

        postagens = cursor.fetchall()

        resultado = []

        for postagem in postagens:
            resultado.append({
                "id": postagem[0],
                "texto": postagem[1],
                "imagem": postagem[2],
                "data_criacao": postagem[3],
                "usuario": {
                    "id": postagem[4],
                    "nome": postagem[5],
                    "tipo": postagem[6],
                    "foto": postagem[7]
                },
                "curtidas": postagem[8],
                "comentarios": postagem[9],
                "curtiu": postagem[10]
            })

        return jsonify(resultado), 200

    except Exception as erro:

        print(erro)

        return jsonify({
            "erro": "Erro ao buscar o feed."
        }), 500

    finally:
        cursor.close()
        conn.close()