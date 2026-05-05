// ============================================================
// BACKEND LOCAL — MicroERP Desktop (Offline)
//
// Implementa todos os endpoints que o frontend consome:
//   /api/health
//   /api/auth/*       → sem auth real, sempre retorna admin
//   /api/boletos/*
//   /api/entradas/*
//   /api/saidas/*
//   /api/notas/*
//   /api/dashboard/*
//   /api/maquininhas/*
//   /api/configuracoes/*
//
// Dados são persistidos em JSON no AppData do usuário.
// ============================================================

const router  = require('express').Router();
const jwt     = require('jsonwebtoken');
const storage = require('./storage');

const JWT_SECRET = 'microerp-offline-local-secret-2024';

// ── Helper: resposta de sucesso no padrão do frontend ────────
function ok(res, data) {
  res.json({ success: true, data });
}

// ── Helper: erro padronizado ──────────────────────────────────
function err(res, msg, status = 400) {
  res.status(status).json({ success: false, message: msg });
}

// ── Gera token JWT local (sem expiração curta) ────────────────
function gerarToken(usuario) {
  return jwt.sign({ id: usuario.id, email: usuario.email, role: usuario.role }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

const ADMIN_USUARIO = {
  id:      1,
  nome:    'Administrador',
  email:   'admin@local',
  role:    'admin',
  empresa: { id: 1, nome: 'Minha Empresa', slug: 'minha-empresa' },
};

// ═══════════════════════════════════════════════════════════
// HEALTH
// ═══════════════════════════════════════════════════════════
router.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: 'offline' });
});

// ═══════════════════════════════════════════════════════════
// AUTH — sem verificação real, sempre retorna admin
// ═══════════════════════════════════════════════════════════

// Login: aceita qualquer email + senha vazia (ou qualquer senha)
router.post('/auth/login', (req, res) => {
  const { email, senha } = req.body || {};
  // Modo offline: aceita admin / vazio ou qualquer combinação
  const token = gerarToken(ADMIN_USUARIO);

  res.cookie('sf_rt', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
  ok(res, {
    accessToken: token,
    usuario: { id: 1, nome: ADMIN_USUARIO.nome, email: email || 'admin@local' },
    empresa: ADMIN_USUARIO.empresa,
    role: 'admin',
  });
});

// Refresh: sempre retorna novo token (sem verificar cookie)
router.post('/auth/refresh', (req, res) => {
  const token = gerarToken(ADMIN_USUARIO);
  res.cookie('sf_rt', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
  ok(res, { accessToken: token });
});

// Me: retorna dados do admin
router.get('/auth/me', (req, res) => {
  ok(res, ADMIN_USUARIO);
});

// Logout: apenas limpa o cookie
router.post('/auth/logout', (req, res) => {
  res.clearCookie('sf_rt');
  ok(res, { mensagem: 'Logout realizado' });
});

// Cadastro: não aplicável no modo offline
router.post('/auth/registrar', (req, res) => {
  ok(res, {
    accessToken: gerarToken(ADMIN_USUARIO),
    usuario: { id: 1, nome: req.body?.nome_usuario || 'Admin', email: req.body?.email || 'admin@local' },
    empresa: ADMIN_USUARIO.empresa,
    mensagem: 'Conta criada (modo offline)',
  });
});

// ═══════════════════════════════════════════════════════════
// BOLETOS
// ═══════════════════════════════════════════════════════════

router.get('/boletos', (req, res) => {
  let boletos = storage.load('boletos');
  const { status, mes } = req.query;
  if (status) boletos = boletos.filter(b => b.status === status);
  if (mes)    boletos = boletos.filter(b => new Date(b.vencimento).getMonth() + 1 === Number(mes));
  ok(res, boletos);
});

router.post('/boletos', (req, res) => {
  const boletos = storage.load('boletos');
  const novo = { id: storage.nextId(boletos), ...req.body, status: req.body.status || 'pendente' };
  boletos.unshift(novo);
  storage.save('boletos', boletos);
  ok(res, novo);
});

router.put('/boletos/:id', (req, res) => {
  const id = Number(req.params.id);
  const boletos = storage.load('boletos');
  const idx = boletos.findIndex(b => b.id === id);
  if (idx === -1) return err(res, 'Boleto não encontrado', 404);
  boletos[idx] = { ...boletos[idx], ...req.body, id };
  storage.save('boletos', boletos);
  ok(res, boletos[idx]);
});

router.delete('/boletos/:id', (req, res) => {
  const id = Number(req.params.id);
  const boletos = storage.load('boletos').filter(b => b.id !== id);
  storage.save('boletos', boletos);
  ok(res, { id });
});

// ═══════════════════════════════════════════════════════════
// ENTRADAS
// ═══════════════════════════════════════════════════════════

function adaptarEntradaParaFrontend(e) {
  return {
    id:              e.id,
    maquininha_nome: e.maquininha_nome || 'Manual',
    descricao:       e.descricao || '',
    valor_bruto:     e.valor_bruto,
    taxa_aplicada:   e.taxa_percentual || 0,
    valor_taxa:      e.valor_bruto - (e.valor_liquido || e.valor_bruto),
    valor_liquido:   e.valor_liquido || e.valor_bruto,
    data:            e.data,
    observacao:      e.observacao || null,
  };
}

router.get('/entradas', (req, res) => {
  let entradas = storage.load('entradas');
  const { mes, ano } = req.query;
  if (mes) entradas = entradas.filter(e => new Date(e.data).getMonth() + 1 === Number(mes));
  if (ano) entradas = entradas.filter(e => new Date(e.data).getFullYear() === Number(ano));

  ok(res, {
    total: entradas.length,
    items: entradas.map(adaptarEntradaParaFrontend),
  });
});

router.post('/entradas', (req, res) => {
  const entradas = storage.load('entradas');
  const nova = {
    id:              storage.nextId(entradas),
    descricao:       req.body.descricao || '',
    valor_bruto:     req.body.valor_bruto,
    taxa_percentual: 0,
    valor_liquido:   req.body.valor_bruto,
    maquininha_nome: 'Manual',
    data:            req.body.data || new Date().toISOString().split('T')[0],
    observacao:      req.body.observacao || null,
  };
  entradas.unshift(nova);
  storage.save('entradas', entradas);
  ok(res, adaptarEntradaParaFrontend(nova));
});

router.patch('/entradas/:id', (req, res) => {
  const id = Number(req.params.id);
  const entradas = storage.load('entradas');
  const idx = entradas.findIndex(e => e.id === id);
  if (idx === -1) return err(res, 'Entrada não encontrada', 404);
  entradas[idx] = { ...entradas[idx], ...req.body, id };
  storage.save('entradas', entradas);
  ok(res, adaptarEntradaParaFrontend(entradas[idx]));
});

router.delete('/entradas/:id', (req, res) => {
  const id = Number(req.params.id);
  const entradas = storage.load('entradas').filter(e => e.id !== id);
  storage.save('entradas', entradas);
  ok(res, { id });
});

// ═══════════════════════════════════════════════════════════
// SAÍDAS
// ═══════════════════════════════════════════════════════════

function adaptarSaidaParaFrontend(s) {
  return {
    id:              s.id,
    categoria_id:    s.categoria_id || null,
    categoria_nome:  s.categoria || 'Outros',
    descricao:       s.descricao || '',
    valor:           s.valor,
    data:            s.data,
    forma_pagamento: s.forma_pagamento || 'pix',
    observacao:      s.observacao || null,
  };
}

router.get('/saidas', (req, res) => {
  let saidas = storage.load('saidas');
  const { mes, ano } = req.query;
  if (mes) saidas = saidas.filter(s => new Date(s.data).getMonth() + 1 === Number(mes));
  if (ano) saidas = saidas.filter(s => new Date(s.data).getFullYear() === Number(ano));

  ok(res, {
    total: saidas.length,
    items: saidas.map(adaptarSaidaParaFrontend),
  });
});

router.post('/saidas', (req, res) => {
  const saidas = storage.load('saidas');
  const nova = {
    id:              storage.nextId(saidas),
    descricao:       req.body.descricao || '',
    valor:           req.body.valor,
    categoria:       req.body.categoria || 'Outros',
    data:            req.body.data || new Date().toISOString().split('T')[0],
    forma_pagamento: req.body.forma_pagamento || 'pix',
    observacao:      req.body.observacao || null,
  };
  saidas.unshift(nova);
  storage.save('saidas', saidas);
  ok(res, adaptarSaidaParaFrontend(nova));
});

router.patch('/saidas/:id', (req, res) => {
  const id = Number(req.params.id);
  const saidas = storage.load('saidas');
  const idx = saidas.findIndex(s => s.id === id);
  if (idx === -1) return err(res, 'Saída não encontrada', 404);
  saidas[idx] = { ...saidas[idx], ...req.body, id };
  storage.save('saidas', saidas);
  ok(res, adaptarSaidaParaFrontend(saidas[idx]));
});

router.delete('/saidas/:id', (req, res) => {
  const id = Number(req.params.id);
  const saidas = storage.load('saidas').filter(s => s.id !== id);
  storage.save('saidas', saidas);
  ok(res, { id });
});

// ═══════════════════════════════════════════════════════════
// NOTAS FISCAIS
// ═══════════════════════════════════════════════════════════

router.get('/notas', (req, res) => {
  ok(res, storage.load('notas'));
});

router.post('/notas', (req, res) => {
  const notas = storage.load('notas');
  const nova = { id: storage.nextId(notas), ...req.body };
  notas.unshift(nova);
  storage.save('notas', notas);
  ok(res, nova);
});

router.put('/notas/:id', (req, res) => {
  const id = Number(req.params.id);
  const notas = storage.load('notas');
  const idx = notas.findIndex(n => n.id === id);
  if (idx === -1) return err(res, 'Nota não encontrada', 404);
  notas[idx] = { ...notas[idx], ...req.body, id };
  storage.save('notas', notas);
  ok(res, notas[idx]);
});

router.delete('/notas/:id', (req, res) => {
  const id = Number(req.params.id);
  const notas = storage.load('notas').filter(n => n.id !== id);
  storage.save('notas', notas);
  ok(res, { id });
});

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════

router.get('/dashboard/resumo', (req, res) => {
  const mes = Number(req.query.mes) || (new Date().getMonth() + 1);
  const ano = Number(req.query.ano) || new Date().getFullYear();

  const entradas = storage.load('entradas').filter(e => {
    const d = new Date(e.data);
    return d.getMonth() + 1 === mes && d.getFullYear() === ano;
  });
  const saidas = storage.load('saidas').filter(s => {
    const d = new Date(s.data);
    return d.getMonth() + 1 === mes && d.getFullYear() === ano;
  });
  const boletos = storage.load('boletos');
  const notas   = storage.load('notas').filter(n => {
    const d = new Date(n.data_emissao || n.data || '2000-01-01');
    return d.getMonth() + 1 === mes && d.getFullYear() === ano;
  });

  const totalBruto   = entradas.reduce((s, e) => s + (e.valor_bruto  || 0), 0);
  const totalLiquido = entradas.reduce((s, e) => s + (e.valor_liquido || e.valor_bruto || 0), 0);
  const totalSaidas  = saidas.reduce((s, e) => s + (e.valor || 0), 0);
  const boletosPend  = boletos.filter(b => b.status === 'pendente' || b.status === 'atrasado');

  ok(res, {
    entradas: {
      bruto:      totalBruto,
      liquido:    totalLiquido,
      taxa_total: totalBruto - totalLiquido,
    },
    saidas: { total: totalSaidas },
    saldo: {
      valor:     totalLiquido - totalSaidas,
      positivo:  totalLiquido >= totalSaidas,
    },
    boletos: {
      pendentes:      boletosPend.length,
      valor_pendente: boletosPend.reduce((s, b) => s + (b.valor || 0), 0),
    },
    notas: {
      quantidade:  notas.length,
      valor_total: notas.reduce((s, n) => s + (n.valor_total || 0), 0),
    },
  });
});

router.get('/dashboard/evolucao', (req, res) => {
  const meses = Number(req.query.meses) || 6;
  const hoje  = new Date();
  const resultado = [];

  for (let i = meses - 1; i >= 0; i--) {
    const d   = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const mes = d.getMonth() + 1;
    const ano = d.getFullYear();

    const nomesMes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

    const entradas = storage.load('entradas').filter(e => {
      const ed = new Date(e.data);
      return ed.getMonth() + 1 === mes && ed.getFullYear() === ano;
    });
    const saidas = storage.load('saidas').filter(s => {
      const sd = new Date(s.data);
      return sd.getMonth() + 1 === mes && sd.getFullYear() === ano;
    });

    const totalEntradas = entradas.reduce((s, e) => s + (e.valor_liquido || e.valor_bruto || 0), 0);
    const totalSaidas   = saidas.reduce((s, e) => s + (e.valor || 0), 0);

    resultado.push({
      mes:      mes,
      ano:      ano,
      mes_nome: nomesMes[mes - 1],
      entradas: totalEntradas,
      saidas:   totalSaidas,
      saldo:    totalEntradas - totalSaidas,
    });
  }

  ok(res, resultado);
});

router.get('/dashboard/top-despesas', (req, res) => {
  const mes = Number(req.query.mes) || (new Date().getMonth() + 1);
  const ano = Number(req.query.ano) || new Date().getFullYear();

  const saidas = storage.load('saidas').filter(s => {
    const d = new Date(s.data);
    return d.getMonth() + 1 === mes && d.getFullYear() === ano;
  });

  // Agrupa por categoria
  const mapa = {};
  for (const s of saidas) {
    const cat = s.categoria || 'Outros';
    if (!mapa[cat]) mapa[cat] = { categoria: cat, secao: s.secao || 'empresa', total: 0 };
    mapa[cat].total += s.valor || 0;
  }

  const resultado = Object.values(mapa).sort((a, b) => b.total - a.total).slice(0, 5);
  ok(res, resultado);
});

// ═══════════════════════════════════════════════════════════
// MAQUININHAS
// ═══════════════════════════════════════════════════════════

const MAQUININHAS_PADRAO = [
  { id: 1, nome: 'Dinheiro',     tipo: 'dinheiro',     taxa: 0,   ativo: true },
  { id: 2, nome: 'PIX',          tipo: 'pix',           taxa: 0,   ativo: true },
  { id: 3, nome: 'Débito',       tipo: 'debito',        taxa: 1.5, ativo: true },
  { id: 4, nome: 'Crédito',      tipo: 'credito',       taxa: 2.8, ativo: true },
  { id: 5, nome: 'Transferência',tipo: 'transferencia', taxa: 0,   ativo: true },
];

router.get('/maquininhas', (req, res) => {
  const saved = storage.load('maquininhas');
  ok(res, saved.length ? saved : MAQUININHAS_PADRAO);
});

router.post('/maquininhas', (req, res) => {
  const maquininhas = storage.load('maquininhas');
  if (!maquininhas.length) maquininhas.push(...MAQUININHAS_PADRAO);
  const nova = { id: storage.nextId(maquininhas), ...req.body };
  maquininhas.push(nova);
  storage.save('maquininhas', maquininhas);
  ok(res, nova);
});

router.put('/maquininhas/:id', (req, res) => {
  let maquininhas = storage.load('maquininhas');
  if (!maquininhas.length) maquininhas = [...MAQUININHAS_PADRAO];
  const id  = Number(req.params.id);
  const idx = maquininhas.findIndex(m => m.id === id);
  if (idx === -1) return err(res, 'Maquininha não encontrada', 404);
  maquininhas[idx] = { ...maquininhas[idx], ...req.body, id };
  storage.save('maquininhas', maquininhas);
  ok(res, maquininhas[idx]);
});

router.delete('/maquininhas/:id', (req, res) => {
  let maquininhas = storage.load('maquininhas');
  if (!maquininhas.length) maquininhas = [...MAQUININHAS_PADRAO];
  maquininhas = maquininhas.filter(m => m.id !== Number(req.params.id));
  storage.save('maquininhas', maquininhas);
  ok(res, {});
});

// ═══════════════════════════════════════════════════════════
// CONFIGURAÇÕES
// ═══════════════════════════════════════════════════════════

const CONFIG_PADRAO = {
  nome_empresa:        'Minha Empresa',
  moeda:               'BRL',
  tema:                'light',
  alertas_vencimento:  3,
  notificacoes:        true,
};

router.get('/configuracoes', (req, res) => {
  const saved = storage.load('configuracoes');
  ok(res, saved.length ? saved[0] : CONFIG_PADRAO);
});

router.put('/configuracoes', (req, res) => {
  const config = { ...CONFIG_PADRAO, ...req.body };
  storage.save('configuracoes', [config]);
  ok(res, config);
});

// ═══════════════════════════════════════════════════════════
// USUÁRIOS (apenas admin local)
// ═══════════════════════════════════════════════════════════

router.get('/usuarios', (req, res) => {
  ok(res, [{ ...ADMIN_USUARIO, ativo: true }]);
});

// ═══════════════════════════════════════════════════════════
// ESTOQUE / SINCRONIZAR (stubs para evitar 404)
// ═══════════════════════════════════════════════════════════

router.get('/estoque', (req, res)     => ok(res, []));
router.get('/sincronizar', (req, res) => ok(res, { status: 'offline', mensagem: 'Modo offline ativo' }));
router.get('/relatorio',   (req, res) => ok(res, []));

module.exports = router;
