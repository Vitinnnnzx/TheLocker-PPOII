from flask import Blueprint, request, jsonify
from .auth.db.database import get_connection

busca = Blueprint("busca", __name__)

@busca.route("/buscar", methods=["GET"])
def buscar():
    texto = request.args.get("texto", "").strip()
    modalidade = request.args.get("modalidade", "").strip()
    posicao = request.args.get("posicao", "").strip()

    conn = get_connection()
    cursor = conn.cursor()

    try:
        query_atletas = """
            SELECT 
                u.id, u.nome, a.modalidade, a.posicao, 
                a.cidade, a.estado, a.foto, a.data_nascimento
            FROM usuario u
            JOIN atleta a ON u.id = a.usuario_id
            WHERE u.tipo = 'atleta'
        """
        params_atleta = []

        if texto:
            query_atletas += " AND u.nome ILIKE %s"
            params_atleta.append(f"%{texto}%")
        if modalidade:
            query_atletas += " AND a.modalidade = %s"
            params_atleta.append(modalidade)
        if posicao:
            query_atletas += " AND a.posicao = %s"
            params_atleta.append(posicao)

        query_atletas += " ORDER BY u.nome LIMIT 50"
        
        cursor.execute(query_atletas, tuple(params_atleta))
        atletas = cursor.fetchall()

        resultado_atletas = []
        for row in atletas:
            resultado_atletas.append({
                "id": row[0],
                "nome": row[1],
                "tipo": "atleta",
                "modalidade": row[2],
                "posicao": row[3],
                "cidade": row[4],
                "estado": row[5],
                "foto": row[6],
                "data_nascimento": row[7]
            })

        # Mantém a pesquisa básica de equipas por nome
        query_times = """
            SELECT id, nome, cidade, estado, escudo
            FROM time
            WHERE 1=1
        """
        params_times = []
        if texto:
            query_times += " AND nome ILIKE %s"
            params_times.append(f"%{texto}%")
            
        cursor.execute(query_times, tuple(params_times))
        times = cursor.fetchall()
        
        resultado_times = []
        for row in times:
            resultado_times.append({
                "id": row[0], "nome": row[1], "tipo": "time",
                "cidade": row[2], "estado": row[3], "escudo": row[4]
            })

        return jsonify({
            "usuarios": resultado_atletas,
            "times": resultado_times
        }), 200

    finally:
        cursor.close()
        conn.close()