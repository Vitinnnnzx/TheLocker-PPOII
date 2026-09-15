# TheLocker

Rede social esportiva desenvolvida com **Flask** e **PostgreSQL**, voltada para conectar atletas e times.

## Pré-requisitos

Antes de executar o projeto, tenha instalado:

- Python 3.12+
- PostgreSQL
- `pip`
- `venv` (normalmente já acompanha o Python)

## Estrutura principal

```text
TheLocker-PPOII/
├── src/
│   ├── main.py
│   └── routes/
│       ├── pages.py
│       ├── auth/
│       │   ├── auth.py
│       │   ├── db/
│       │   │   └── database.py
│       │   └── utils/
│       │       ├── LoginManager.py
│       │       └── User.py
│       ├── postagens.py
│       ├── busca.py
│       ├── perfil.py
│       └── times.py
├── commands/
│   ├── usuario.txt
│   ├── atleta.txt
│   ├── time.txt
│   ├── atleta-time.txt
│   ├── publicacao.txt
│   ├── curtida.txt
│   ├── comentarios.txt
│   └── seguidor.txt
└── public/
    └── ...
```

O arquivo `src/main.py` cria a aplicação Flask, carrega as variáveis do `.env`, registra as Blueprints e inicia o servidor na porta `6767`.

## 1. Clonar o projeto

```bash
git clone <URL_DO_REPOSITORIO>
cd TheLocker-PPOII
```

Caso já tenha o projeto localmente, apenas entre na pasta:

```bash
cd TheLocker-PPOII
```

## 2. Criar o ambiente virtual

Linux/macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

## 3. Instalar as dependências

O projeto usa atualmente:

- Flask
- Flask-Login
- psycopg2
- python-dotenv
- Werkzeug

Instale com:

```bash
pip install flask flask-login psycopg2-binary python-dotenv werkzeug
```

> O projeto atual não possui um `requirements.txt`. Recomenda-se criar um depois da instalação para facilitar a configuração em outras máquinas.

Para gerar:

```bash
pip freeze > requirements.txt
```

Em uma instalação futura, será possível usar:

```bash
pip install -r requirements.txt
```

## 4. Configurar o PostgreSQL

Crie um banco de dados no PostgreSQL.

Exemplo:

```sql
CREATE DATABASE thelocker;
```

Depois, execute os arquivos SQL presentes na pasta `commands/`.

A ordem recomendada é:

```text
1. usuario.txt
2. atleta.txt
3. time.txt
4. atleta-time.txt
5. publicacao.txt
6. curtida.txt
7. comentarios.txt
8. seguidor.txt
```

Isso respeita as dependências das chaves estrangeiras entre as tabelas.

## 5. Criar o arquivo `.env`

Na raiz do projeto, crie:

```text
.env
```

Preencha com os dados do PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=thelocker
DB_USER=postgres
DB_PASSWORD=sua_senha
SECRET_KEY=sua_chave_secreta
```

O projeto lê essas variáveis através do `python-dotenv`.

### Importante

Não envie o `.env` para o GitHub.

Adicione ao `.gitignore`:

```gitignore
.env
.venv/
__pycache__/
```

## 6. Executar o projeto

Como o projeto usa imports relativos (`from .routes...`), execute o módulo a partir da raiz do projeto:

```bash
python -m src.main
```

O servidor será iniciado em:

```text
http://127.0.0.1:6767
```

Como o código usa:

```python
app.run(debug=True, host="0.0.0.0", port=6767)
```

também é possível acessar pela rede local usando o IP da máquina, por exemplo:

```text
http://192.168.x.x:6767
```

## 7. Executar em modo desenvolvimento

O projeto já inicia com:

```python
debug=True
```

Por isso, durante o desenvolvimento, erros do Flask aparecem no terminal e o servidor possui recarregamento automático.

Para parar o servidor:

```text
Ctrl + C
```

## 8. Rotas principais

### Páginas

```text
GET /
GET /login
GET /criar-conta
GET /inicio
GET /perfil
GET /config
GET /criar-time
GET /time-perfil
```

### Autenticação

```text
POST /criar-conta
POST /login
GET  /logout
```

### Postagens

As rotas da Blueprint `postagens` controlam criação, consulta, curtidas e comentários.

### Perfil

A Blueprint `perfil` controla dados do próprio usuário, perfis de outros usuários, seguidores, seguindo e informações relacionadas a times.

### Times

A Blueprint `times` controla a criação da conta do time, consulta do próprio time e gerenciamento dos atletas.

## 9. Testar a API com Thunder Client

Para testar uma rota JSON, selecione:

```text
Body → JSON
```

### Criar conta de atleta

```http
POST http://localhost:6767/criar-conta
```

```json
{
  "nome": "Pedro",
  "email": "pedro@email.com",
  "senha": "123456",
  "tipo": "atleta"
}
```

### Login

```http
POST http://localhost:6767/login
```

```json
{
  "email": "pedro@email.com",
  "senha": "123456"
}
```

### Criar time

```http
POST http://localhost:6767/time
```

```json
{
  "nome": "Camboriú Futebol Clube",
  "email": "camboriufc@email.com",
  "senha": "123456",
  "cidade": "Camboriú",
  "estado": "SC",
  "escudo": "https://exemplo.com/escudo.png"
}
```

## 10. Problemas comuns

### `ModuleNotFoundError` ao executar

Não rode:

```bash
python src/main.py
```

Use:

```bash
python -m src.main
```

Isso mantém os imports relativos do projeto funcionando corretamente.

### Erro de conexão com PostgreSQL

Confira no `.env`:

```env
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

Também confirme se o PostgreSQL está em execução.

Linux:

```bash
sudo systemctl status postgresql
```

Para iniciar:

```bash
sudo systemctl start postgresql
```

### `pg_config.h: No such file or directory`

O projeto pode usar `psycopg2-binary` para evitar a compilação do `psycopg2`:

```bash
pip install psycopg2-binary
```

## 11. Fluxo básico de execução

```text
Usuário
   ↓
Frontend / Thunder Client
   ↓
Flask (src/main.py)
   ↓
Blueprint correspondente
   ↓
PostgreSQL
   ↓
Resposta JSON ou página HTML
```

## 12. Criar uma instalação limpa

Para reproduzir o ambiente em outra máquina:

```bash
git clone <URL_DO_REPOSITORIO>
cd TheLocker-PPOII
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Depois:

1. Criar o banco PostgreSQL.
2. Executar os arquivos SQL da pasta `commands/`.
3. Criar o `.env`.
4. Iniciar com `python -m src.main`.

## 13. Build / produção

Atualmente o projeto **não possui uma etapa de build própria** no código enviado. O funcionamento atual é baseado no servidor de desenvolvimento do Flask:

```bash
python -m src.main
```

Para produção, o recomendado é futuramente usar um servidor WSGI, como Gunicorn, e separar as configurações de desenvolvimento e produção.

---

## Resumo rápido

```bash
# 1. Ambiente
python3 -m venv .venv
source .venv/bin/activate

# 2. Dependências
pip install flask flask-login psycopg2-binary python-dotenv werkzeug

# 3. Configurar
# criar .env
# criar banco PostgreSQL
# executar commands/*.txt

# 4. Rodar
python -m src.main
```
