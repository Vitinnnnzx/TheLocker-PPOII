from flask import Blueprint, jsonify, render_template, request
from flask_login import login_required, current_user
from .auth.db.database import get_connection
from werkzeug.security import generate_password_hash

perfil = Blueprint("perfil", __name__)


@perfil.route("/perfil/dados", methods=["GET"])
@login_required
def pegar_dados_perfil():

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                u.id,
                u.nome,
                u.email,
                u.tipo,
                a.data_nascimento,
                a.cidade,
                a.estado,
                a.modalidade,
                a.posicao,
                a.bio,
                a.foto
            FROM usuario u
            LEFT JOIN atleta a
                ON u.id = a.usuario_id
            WHERE u.id = %s
        """, (current_user.id,))

        usuario = cursor.fetchone()

        if not usuario:
            return jsonify({"erro": "Usuário não encontrado."}), 404

        return jsonify({
            "id": usuario[0],
            "nome": usuario[1],
            "email": usuario[2],
            "tipo": usuario[3],
            "data_nascimento": usuario[4],
            "cidade": usuario[5],
            "estado": usuario[6],
            "modalidade": usuario[7],
            "posicao": usuario[8],
            "bio": usuario[9],
            "foto": usuario[10]
        }), 200

    finally:
        cursor.close()
        conn.close()

@perfil.route("/perfil/times", methods=["GET"])
@login_required
def pegar_times():

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                t.id,
                t.nome,
                t.cidade,
                t.estado,
                t.escudo,
                at.data_entrada,
                at.data_saida
            FROM atleta_time at

            JOIN atleta a
                ON at.atleta_id = a.id

            JOIN time t
                ON at.time_id = t.id

            WHERE a.usuario_id = %s

            ORDER BY at.data_entrada DESC
        """, (current_user.id,))

        times = cursor.fetchall()

        resultado = []

        for time in times:
            resultado.append({
                "id": time[0],
                "nome": time[1],
                "cidade": time[2],
                "estado": time[3],
                "escudo": time[4],
                "data_entrada": time[5],
                "data_saida": time[6]
            })

        return jsonify(resultado), 200

    finally:
        cursor.close()
        conn.close()

@perfil.route("/perfil/seguidores", methods=["GET"])
@login_required
def pegar_meus_seguidores():

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                u.id,
                u.nome,
                u.email,
                a.foto
            FROM seguidor s

            JOIN usuario u
                ON s.seguidor_id = u.id

            LEFT JOIN atleta a
                ON u.id = a.usuario_id

            WHERE s.seguido_id = %s

            ORDER BY s.data_seguimento DESC
        """, (current_user.id,))

        seguidores = cursor.fetchall()

        resultado = []

        for usuario in seguidores:
            resultado.append({
                "id": usuario[0],
                "nome": usuario[1],
                "email": usuario[2],
                "foto": usuario[3]
            })

        return jsonify(resultado), 200

    finally:
        cursor.close()
        conn.close()

@perfil.route("/perfil/seguindo", methods=["GET"])
@login_required
def pegar_meu_seguindo():

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                u.id,
                u.nome,
                u.email,
                a.foto
            FROM seguidor s

            JOIN usuario u
                ON s.seguido_id = u.id

            LEFT JOIN atleta a
                ON u.id = a.usuario_id

            WHERE s.seguidor_id = %s

            ORDER BY s.data_seguimento DESC
        """, (current_user.id,))

        seguindo = cursor.fetchall()

        resultado = []

        for usuario in seguindo:
            resultado.append({
                "id": usuario[0],
                "nome": usuario[1],
                "email": usuario[2],
                "foto": usuario[3]
            })

        return jsonify(resultado), 200

    finally:
        cursor.close()
        conn.close()
@perfil.route("/perfil/usuario/<int:usuario_id>", methods=["GET"])
def pagina_perfil_usuario(usuario_id):
    return render_template(
        "perfil-usuario.html",
        usuario_id=usuario_id
    )
@perfil.route("/perfil/usuario/<int:usuario_id>/dados", methods=["GET"])
def pegar_perfil_usuario(usuario_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                u.id,
                u.nome,
                u.tipo,
                a.data_nascimento,
                a.cidade,
                a.estado,
                a.modalidade,
                a.posicao,
                a.bio,
                a.foto
            FROM usuario u
            LEFT JOIN atleta a
                ON u.id = a.usuario_id
            WHERE u.id = %s
        """, (usuario_id,))

        usuario = cursor.fetchone()

        if not usuario:
            return jsonify({"erro": "Usuário não encontrado."}), 404

        cursor.execute("""
            SELECT COUNT(*)
            FROM seguidor
            WHERE seguido_id = %s
        """, (usuario_id,))

        seguidores = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*)
            FROM seguidor
            WHERE seguidor_id = %s
        """, (usuario_id,))

        seguindo = cursor.fetchone()[0]

        return jsonify({
            "id": usuario[0],
            "nome": usuario[1],
            "tipo": usuario[2],
            "data_nascimento": usuario[3],
            "cidade": usuario[4],
            "estado": usuario[5],
            "modalidade": usuario[6],
            "posicao": usuario[7],
            "bio": usuario[8],
            "foto": usuario[9],
            "seguidores": seguidores,
            "seguindo": seguindo
        }), 200

    finally:
        cursor.close()
        conn.close()
@perfil.route("/perfil/time/<int:time_id>", methods=["GET"])
def pagina_perfil_time(time_id):
    return render_template(
        "perfil-time.html",
        time_id=time_id
    )

@perfil.route("/perfil/time/<int:time_id>/dados", methods=["GET"])
def pegar_perfil_time(time_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                id,
                nome,
                cidade,
                estado,
                escudo
            FROM time
            WHERE id = %s
        """, (time_id,))

        time = cursor.fetchone()

        if not time:
            return jsonify({"erro": "Time não encontrado."}), 404

        cursor.execute("""
            SELECT
                u.id,
                u.nome,
                a.modalidade,
                a.posicao,
                a.foto
            FROM atleta_time at

            JOIN atleta a
                ON at.atleta_id = a.id

            JOIN usuario u
                ON a.usuario_id = u.id

            WHERE at.time_id = %s
            ORDER BY u.nome
        """, (time_id,))

        atletas = cursor.fetchall()

        return jsonify({
            "id": time[0],
            "nome": time[1],
            "cidade": time[2],
            "estado": time[3],
            "escudo": time[4],
            "atletas": [
                {
                    "id": atleta[0],
                    "nome": atleta[1],
                    "modalidade": atleta[2],
                    "posicao": atleta[3],
                    "foto": atleta[4]
                }
                for atleta in atletas
            ]
        }), 200

    finally:
        cursor.close()
        conn.close()

@perfil.route("/perfil/seguir/<int:usuario_id>", methods=["POST"])
@login_required
def seguir_usuario(usuario_id):

    if usuario_id == current_user.id:
        return jsonify({
            "erro": "Você não pode seguir a si mesmo."
        }), 400

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO seguidor (seguidor_id, seguido_id)
            VALUES (%s, %s)
            ON CONFLICT (seguidor_id, seguido_id)
            DO NOTHING
        """, (current_user.id, usuario_id))

        conn.commit()

        return jsonify({
            "mensagem": "Usuário seguido com sucesso."
        }), 201

    finally:
        cursor.close()
        conn.close()

@perfil.route("/perfil/seguir/<int:usuario_id>", methods=["DELETE"])
@login_required
def deixar_de_seguir(usuario_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            DELETE FROM seguidor
            WHERE seguidor_id = %s
            AND seguido_id = %s
        """, (current_user.id, usuario_id))

        conn.commit()

        return jsonify({
            "mensagem": "Você deixou de seguir este usuário."
        }), 200

    finally:
        cursor.close()
        conn.close()
@perfil.route("/perfil/seguindo/<int:usuario_id>", methods=["GET"])
@login_required
def verificar_seguindo(usuario_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT 1
            FROM seguidor
            WHERE seguidor_id = %s
            AND seguido_id = %s
        """, (current_user.id, usuario_id))

        seguindo = cursor.fetchone() is not None

        return jsonify({
            "seguindo": seguindo
        }), 200

    finally:
        cursor.close()
        conn.close()

@perfil.route("/perfil/<int:usuario_id>/seguidores", methods=["GET"])
def pegar_seguidores_de_usuario(usuario_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                u.id,
                u.nome,
                a.foto
            FROM seguidor s
            JOIN usuario u
                ON s.seguidor_id = u.id
            LEFT JOIN atleta a
                ON u.id = a.usuario_id
            WHERE s.seguido_id = %s
            ORDER BY s.data_seguimento DESC
        """, (usuario_id,))

        seguidores = cursor.fetchall()

        return jsonify([
            {
                "id": usuario[0],
                "nome": usuario[1],
                "foto": usuario[2]
            }
            for usuario in seguidores
        ]), 200

    finally:
        cursor.close()
        conn.close()

@perfil.route("/perfil/<int:usuario_id>/seguindo", methods=["GET"])
def pegar_seguindo_de_usuario(usuario_id):

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                u.id,
                u.nome,
                a.foto
            FROM seguidor s
            JOIN usuario u
                ON s.seguido_id = u.id
            LEFT JOIN atleta a
                ON u.id = a.usuario_id
            WHERE s.seguidor_id = %s
            ORDER BY s.data_seguimento DESC
        """, (usuario_id,))

        seguindo = cursor.fetchall()

        return jsonify([
            {
                "id": usuario[0],
                "nome": usuario[1],
                "foto": usuario[2]
            }
            for usuario in seguindo
        ]), 200

    finally:
        cursor.close()
        conn.close()

@perfil.route("/perfil/config", methods=["PUT"])
@login_required
def atualizar_perfil():

    dados = request.get_json()

    nome = dados.get("nome")
    email = dados.get("email")
    foto = dados.get("foto")
    bio = dados.get("bio")
    data_nascimento = dados.get("data_nascimento")
    cidade = dados.get("cidade")
    estado = dados.get("estado")
    modalidade = dados.get("modalidade")
    posicao = dados.get("posicao")
    senha = dados.get("senha")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE usuario
            SET nome = COALESCE(%s, nome),
                email = COALESCE(%s, email)
            WHERE id = %s
        """, (nome, email, current_user.id))

        cursor.execute("""
            SELECT id
            FROM atleta
            WHERE usuario_id = %s
        """, (current_user.id,))

        atleta = cursor.fetchone()

        if atleta:
            cursor.execute("""
                UPDATE atleta
                SET foto = COALESCE(%s, foto),
                    bio = COALESCE(%s, bio),
                    data_nascimento = COALESCE(%s, data_nascimento),
                    cidade = COALESCE(%s, cidade),
                    estado = COALESCE(%s, estado),
                    modalidade = COALESCE(%s, modalidade),
                    posicao = COALESCE(%s, posicao)
                WHERE usuario_id = %s
            """, (
                foto,
                bio,
                data_nascimento,
                cidade,
                estado,
                modalidade,
                posicao,
                current_user.id
            ))

        if senha:
            senha_hash = generate_password_hash(senha)

            cursor.execute("""
                UPDATE usuario
                SET senha = %s
                WHERE id = %s
            """, (senha_hash, current_user.id))

        conn.commit()

        return jsonify({
            "mensagem": "Perfil atualizado com sucesso!"
        }), 200

    except Exception:
        conn.rollback()

        return jsonify({
            "erro": "Erro ao atualizar perfil."
        }), 500

    finally:
        cursor.close()
        conn.close()