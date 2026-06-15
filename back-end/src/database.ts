import { Database } from "bun:sqlite";

const db = new Database("thelocker.db");

// ─── CRIAÇÃO DAS TABELAS ──────────────────────────────────────────────────────

db.run(`
  CREATE TABLE IF NOT EXISTS usuario (
    id_usuario      TEXT PRIMARY KEY,
    nome_completo   TEXT NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    senha           TEXT NOT NULL,
    tipo_usuario    TEXT CHECK (tipo_usuario IN ('atleta', 'recrutador', 'admin')),
    data_nascimento TEXT,
    cidade          TEXT,
    estado          TEXT,
    pais            TEXT,
    telefone        TEXT,
    genero          TEXT,
    criado_em       TEXT DEFAULT (datetime('now')),
    atualizado_em   TEXT DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS mensagens_chat (
    id_mensagem     TEXT PRIMARY KEY,
    id_remetente    TEXT,
    id_destinatario TEXT,
    conteudo        TEXT NOT NULL,
    enviada_em      TEXT DEFAULT (datetime('now')),
    lida            INTEGER DEFAULT 0,
    FOREIGN KEY (id_remetente)    REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_destinatario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS eventos (
    id_evento     TEXT PRIMARY KEY,
    titulo        TEXT NOT NULL,
    descricao     TEXT,
    modalidade    TEXT,
    data_evento   TEXT,
    localizacao   TEXT,
    id_criador    TEXT,
    criado_em     TEXT DEFAULT (datetime('now')),
    atualizado_em TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_criador) REFERENCES usuario(id_usuario) ON DELETE SET NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS perfis_atletas (
    id_perfil       TEXT PRIMARY KEY,
    id_usuario      TEXT UNIQUE,
    posicao         TEXT,
    altura          REAL,
    peso            REAL,
    biografia       TEXT,
    clube_atual     TEXT,
    is_premium      INTEGER DEFAULT 0,
    foto_perfil_url TEXT,
    criado_em       TEXT DEFAULT (datetime('now')),
    atualizado_em   TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS highlights (
    id_highlight TEXT PRIMARY KEY,
    id_usuario   TEXT,
    titulo       TEXT,
    descricao    TEXT,
    video_url    TEXT NOT NULL,
    enviado_em   TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS estatisticas_atletas (
    id_estatistica    TEXT PRIMARY KEY,
    id_perfil         TEXT UNIQUE,
    partidas_jogadas  INTEGER DEFAULT 0,
    gols_marcados     INTEGER DEFAULT 0,
    assistencias      INTEGER DEFAULT 0,
    velocidade_maxima REAL,
    criado_em         TEXT DEFAULT (datetime('now')),
    atualizado_em     TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_perfil) REFERENCES perfis_atletas(id_perfil) ON DELETE CASCADE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS endosso (
    id_endosso        TEXT PRIMARY KEY,
    id_usuario_autor  TEXT,
    id_atleta_destino TEXT,
    habilidade        TEXT NOT NULL,
    criado_em         TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_usuario_autor)  REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (id_atleta_destino) REFERENCES usuario(id_usuario) ON DELETE CASCADE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS habilidade (
    id_habilidade TEXT PRIMARY KEY,
    id_perfil     TEXT,
    modalidade    TEXT NOT NULL,
    criado_em     TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (id_perfil) REFERENCES perfis_atletas(id_perfil) ON DELETE CASCADE
  )
`);

console.log("✅ Tabelas criadas com sucesso!");

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type UsuarioDoDb = {
  id_usuario: string;
  nome_completo: string;
  email: string;
  senha: string;
  tipo_usuario: string;
  data_nascimento: string | null;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  telefone: string | null;
  genero: string | null;
  criado_em: string;
  atualizado_em: string;
};

type PerfilDoDb = {
  id_perfil: string;
  id_usuario: string;
  posicao: string | null;
  altura: number | null;
  peso: number | null;
  biografia: string | null;
  clube_atual: string | null;
  is_premium: number;
  foto_perfil_url: string | null;
  criado_em: string;
  atualizado_em: string;
};

// ─── QUERIES PREPARADAS: USUARIO ─────────────────────────────────────────────

const selectUsuarioPorEmail = db.prepare("SELECT * FROM usuario WHERE email = ? LIMIT 1");
const selectUsuarioPorId    = db.prepare("SELECT * FROM usuario WHERE id_usuario = ? LIMIT 1");
const inserirUsuario        = db.prepare(`
  INSERT INTO usuario (id_usuario, nome_completo, email, senha, tipo_usuario, data_nascimento, cidade, estado)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

// ─── QUERIES PREPARADAS: PERFIL ───────────────────────────────────────────────

const inserirPerfil     = db.prepare("INSERT INTO perfis_atletas (id_perfil, id_usuario) VALUES (?, ?)");
const selectPerfilPorId = db.prepare("SELECT * FROM perfis_atletas WHERE id_usuario = ? LIMIT 1");

// ─── QUERIES PREPARADAS: ESTATÍSTICAS ────────────────────────────────────────

const inserirEstatistica = db.prepare("INSERT INTO estatisticas_atletas (id_estatistica, id_perfil) VALUES (?, ?)");

// ─── CLASSE: USUARIO ──────────────────────────────────────────────────────────

export class Usuario {
  public id: string = "";
  public nomeCompleto: string = "";
  public email: string = "";
  public senha: string = "";
  public tipoUsuario: string = "";
  public cidade: string | null = null;
  public estado: string | null = null;

  private constructor() {}

  static criar(
    id: string,
    nomeCompleto: string,
    email: string,
    senhaHash: string,
    tipoUsuario: string,
    dataNascimento: string | null,
    cidade: string | null,
    estado: string | null
  ): Usuario {
    inserirUsuario.run(id, nomeCompleto, email, senhaHash, tipoUsuario, dataNascimento, cidade, estado);

    const usuario = new Usuario();
    usuario.id = id;
    usuario.nomeCompleto = nomeCompleto;
    usuario.email = email;
    usuario.senha = senhaHash;
    usuario.tipoUsuario = tipoUsuario;
    usuario.cidade = cidade;
    usuario.estado = estado;
    return usuario;
  }

  static buscarPorEmail(email: string): Usuario | null {
    const linha = selectUsuarioPorEmail.get(email) as UsuarioDoDb | null;
    if (!linha) return null;

    const usuario = new Usuario();
    usuario.id = linha.id_usuario;
    usuario.nomeCompleto = linha.nome_completo;
    usuario.email = linha.email;
    usuario.senha = linha.senha;
    usuario.tipoUsuario = linha.tipo_usuario;
    usuario.cidade = linha.cidade;
    usuario.estado = linha.estado;
    return usuario;
  }

  static buscarPorId(id: string): Usuario | null {
    const linha = selectUsuarioPorId.get(id) as UsuarioDoDb | null;
    if (!linha) return null;

    const usuario = new Usuario();
    usuario.id = linha.id_usuario;
    usuario.nomeCompleto = linha.nome_completo;
    usuario.email = linha.email;
    usuario.senha = linha.senha;
    usuario.tipoUsuario = linha.tipo_usuario;
    usuario.cidade = linha.cidade;
    usuario.estado = linha.estado;
    return usuario;
  }
}

// ─── CLASSE: PERFIL ───────────────────────────────────────────────────────────

export class Perfil {
  public id: string = "";
  public idUsuario: string = "";
  public posicao: string | null = null;
  public altura: number | null = null;
  public peso: number | null = null;
  public biografia: string | null = null;
  public clubeAtual: string | null = null;
  public isPremium: boolean = false;
  public fotoPerfil: string | null = null;

  private constructor() {}

  static criar(idPerfil: string, idUsuario: string): Perfil {
    inserirPerfil.run(idPerfil, idUsuario);

    const perfil = new Perfil();
    perfil.id = idPerfil;
    perfil.idUsuario = idUsuario;
    return perfil;
  }

  static buscarPorUsuario(idUsuario: string): Perfil | null {
    const linha = selectPerfilPorId.get(idUsuario) as PerfilDoDb | null;
    if (!linha) return null;

    const perfil = new Perfil();
    perfil.id = linha.id_perfil;
    perfil.idUsuario = linha.id_usuario;
    perfil.posicao = linha.posicao;
    perfil.altura = linha.altura;
    perfil.peso = linha.peso;
    perfil.biografia = linha.biografia;
    perfil.clubeAtual = linha.clube_atual;
    perfil.isPremium = linha.is_premium === 1;
    perfil.fotoPerfil = linha.foto_perfil_url;
    return perfil;
  }
}

// ─── CLASSE: ESTATISTICA ──────────────────────────────────────────────────────

export class Estatistica {
  public id: string = "";
  public idPerfil: string = "";

  private constructor() {}

  static criar(idEstatistica: string, idPerfil: string): Estatistica {
    inserirEstatistica.run(idEstatistica, idPerfil);

    const estatistica = new Estatistica();
    estatistica.id = idEstatistica;
    estatistica.idPerfil = idPerfil;
    return estatistica;
  }
}

export default db;
