# TheLocker

Rede social esportiva feita com **Flask + PostgreSQL**.

## Pré-requisitos

- Python 3.12+
- PostgreSQL
- pip

## 1. Ambiente virtual

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## 2. Dependências

```bash
pip install flask flask-login psycopg2-binary python-dotenv werkzeug
```

## 3. Banco de dados

Crie o banco:

```sql
CREATE DATABASE thelocker;
```

Depois execute os arquivos SQL da pasta `commands/` na ordem das dependências das tabelas.

## 4. `.env`

Crie um `.env` na raiz:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=thelocker
DB_USER=postgres
DB_PASSWORD=sua_senha
SECRET_KEY=sua_chave
```

## 5. Rodar o projeto

Na raiz do projeto:

```bash
python -m src.main
```

Acesse:

```text
http://127.0.0.1:6767
```
