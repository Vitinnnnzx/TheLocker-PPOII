from flask import Blueprint, request, jsonify

from src.ai import responder_pergunta


bot_bp = Blueprint("bot", __name__)


@bot_bp.route("/pergunta", methods=["POST"])
def pergunta():

    dados = request.get_json()
    
    mensagem = dados.get("mensagem")
    print(mensagem)
    if not mensagem:
        return jsonify({
            "erro": "Mensagem não informada."
        }), 400

    try:
        resposta = responder_pergunta(mensagem)
        return jsonify({
            "resposta": resposta
        }), 200

    except Exception as erro:

        print(f"Erro: {erro}")

        return jsonify({
            "erro": "Não foi possível gerar uma resposta."
        }), 500
