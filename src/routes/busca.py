from flask import Blueprint, request, jsonify
from .auth.db.database import get_connection

busca = Blueprint("busca", __name__)


@busca.route("/buscar", methods=["GET"])
def buscar():
    texto = request.args.get("texto", "").strip()

    if not texto:
        return jsonify({
            "usuarios": [],
            "times": []
        }), 200

    conn = get_connection()
    cursor = conn.cursor()

    try:
        busca = f"%{texto}%"

        # Buscar usuários
        cursor.execute("""
            SELECT id, nome, tipo
            FROM usuario
            WHERE nome ILIKE %s
            ORDER BY nome
            LIMIT 20
        """, (busca,))

        usuarios = [
            {
                "id": usuario[0],
                "nome": usuario[1],
                "tipo": usuario[2]
            }
            for usuario in cursor.fetchall()
        ]

        # Buscar times
        cursor.execute("""
            SELECT id, nome, cidade, estado, escudo
            FROM time
            WHERE nome ILIKE %s
            ORDER BY nome
            LIMIT 20
        """, (busca,))

        times = [
            {
                "id": time[0],
                "nome": time[1],
                "cidade": time[2],
                "estado": time[3],
                "escudo": time[4]
            }
            for time in cursor.fetchall()
        ]

        return jsonify({
            "usuarios": usuarios,
            "times": times
        }), 200

    finally:
        cursor.close()
        conn.close()