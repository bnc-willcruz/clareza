/**
 * ════════════════════════════════════════════════════════════
 *  CLAREZA × DOLCE VITA — Captura + Painel Vivo v3
 * ════════════════════════════════════════════════════════════
 *  Duas telas no mesmo app:
 *  • LINK/exec            → formulário de captura (cola /fechar)
 *  • LINK/exec?p=painel   → painel vivo lendo a aba Geral
 *
 *  Para atualizar a instalação existente:
 *  1. Ctrl+A → Delete → cola este arquivo inteiro → Ctrl+S
 *  2. Implantar → Gerenciar implantações → ✏️ → Nova versão → Implantar
 *  (o link continua o mesmo)
 * ════════════════════════════════════════════════════════════
 */

const ABA = 'Geral';
const MARGEM_PADRAO = 0.75;

/** Teste rápido */
function testarConexao() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA);
  if (!aba) throw new Error('Aba "' + ABA + '" não encontrada.');
  const d = getDadosPainel();
  Logger.log('OK! ' + d.totalPedidos + ' pedidos reais. GMV do mês: R$ ' + d.gmvMes.toFixed(2) +
    '. Pendências: R$ ' + d.pendenciasTotal.toFixed(2) + '. Próximo n_pedido: ' + proximoNumeroPedido_(aba));
}

/** ── HELPERS ── */
function toDate_(v) {
  if (v instanceof Date && !isNaN(v)) return v;
  const m = String(v).trim().match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (!m) return null;
  const ano = m[3].length === 2 ? '20' + m[3] : m[3];
  return new Date(parseInt(ano), parseInt(m[2]) - 1, parseInt(m[1]));
}

function toNum_(v) {
  if (typeof v === 'number') return v;
  const s = String(v).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function fmtBR_(n) {
  return n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function proximoNumeroPedido_(aba) {
  const valores = aba.getRange(2, 6, Math.max(aba.getLastRow() - 1, 1), 1).getValues();
  let maxN = 0;
  valores.forEach(function(v) {
    const s = String(v[0]).trim();
    const m = s.match(/00\.(\d+)/);
    if (m) maxN = Math.max(maxN, parseInt(m[1]));
    else if (/^\d+([.,]\d+)?$/.test(s)) maxN = Math.max(maxN, Math.round(parseFloat(s.replace(',', '.'))));
  });
  return '00.' + (maxN + 1);
}

function buscarOuCriarIdCliente_(aba, nomeCliente) {
  const dados = aba.getRange(2, 7, Math.max(aba.getLastRow() - 1, 1), 2).getValues();
  const nomeNorm = nomeCliente.trim().toLowerCase();
  let maxId = 0;
  for (let i = 0; i < dados.length; i++) {
    const id = parseInt(dados[i][0]);
    const nome = String(dados[i][1]).trim().toLowerCase();
    if (!isNaN(id)) maxId = Math.max(maxId, id);
    if (nome && nome === nomeNorm) return { id: dados[i][0], existente: true };
  }
  return { id: maxId + 1, existente: false };
}

function parseFechar_(texto) {
  const t = texto || '';
  const out = {};
  const itens = t.match(/🍪[^\n]*\n([\s\S]*?)(?=\n\s*🎨|\n\s*🔢|\n\s*💰|$)/);
  out.itens = itens ? itens[1].replace(/\*/g, '').trim().replace(/\n/g, ' · ') : '';
  const cores = t.match(/🎨[^:]*:\s*([^\n]+)/);
  out.cores = cores ? cores[1].replace(/\*/g, '').trim() : '';
  const qtd = t.match(/🔢[^:]*:\s*(\d+)/);
  out.qtd_total = qtd ? qtd[1] : '';
  const valor = t.match(/💰[^R]*R\$\s*([\d.,]+)/);
  out.valor_total = valor ? valor[1].trim() : '';
  const ret = t.match(/📅[^:]*:\s*([^\n]+)/);
  out.data_retirada = ret ? ret[1].replace(/\*/g, '').trim() : '';
  return out;
}

/** ── LEITURA DO BANCO (para o painel) ── */
function getDadosPainel() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA);
  const raw = aba.getRange(2, 1, Math.max(aba.getLastRow() - 1, 1), 20).getValues();

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const mesAtual = hoje.getMonth(), anoAtual = hoje.getFullYear();

  const pedidos = [];
  raw.forEach(function(r) {
    const cliente = String(r[7]).trim();
    if (!cliente) return; // ignora linhas fantasma
    pedidos.push({
      dataPedido: toDate_(r[0]),
      dataEntrega: toDate_(r[1]),
      cliente: cliente,
      segmento: String(r[8]).trim() || 'Outro',
      tema: String(r[9]).trim(),
      valor: toNum_(r[11]),
      pagamento: String(r[14]).trim(),
      dataP2: String(r[17]).trim(),
      valorP2: toNum_(r[18])
    });
  });

  // KPIs do mês (competência = data de entrega)
  let gmvMes = 0, pedidosMes = 0, gmvAno = 0;
  pedidos.forEach(function(p) {
    if (p.dataEntrega) {
      if (p.dataEntrega.getFullYear() === anoAtual) gmvAno += p.valor;
      if (p.dataEntrega.getMonth() === mesAtual && p.dataEntrega.getFullYear() === anoAtual) {
        gmvMes += p.valor; pedidosMes++;
      }
    }
  });

  // Próximas entregas
  const proximas = pedidos
    .filter(function(p) { return p.dataEntrega && p.dataEntrega >= hoje; })
    .sort(function(a, b) { return a.dataEntrega - b.dataEntrega; })
    .slice(0, 6)
    .map(function(p) {
      const dias = Math.round((p.dataEntrega - hoje) / 86400000);
      return {
        cliente: p.cliente, tema: p.tema, segmento: p.segmento,
        data: Utilities.formatDate(p.dataEntrega, Session.getScriptTimeZone(), 'dd/MM'),
        dias: dias, valor: fmtBR_(p.valor)
      };
    });

  // Pendências de pagamento
  const pendencias = [];
  let pendenciasTotal = 0;
  pedidos.forEach(function(p) {
    if (/^pendente$/i.test(p.pagamento)) {
      pendencias.push({ cliente: p.cliente, tema: p.tema, valor: fmtBR_(p.valor), tipo: 'Total em aberto' });
      pendenciasTotal += p.valor;
    } else if (/pendente/i.test(p.dataP2) && p.valorP2 > 0) {
      pendencias.push({ cliente: p.cliente, tema: p.tema, valor: fmtBR_(p.valorP2), tipo: '2ª parcela' });
      pendenciasTotal += p.valorP2;
    }
  });

  // Receita por segmento (últimos 12 meses)
  const umAnoAtras = new Date(hoje); umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);
  const segMap = {};
  pedidos.forEach(function(p) {
    if (p.dataEntrega && p.dataEntrega >= umAnoAtras) {
      segMap[p.segmento] = (segMap[p.segmento] || 0) + p.valor;
    }
  });
  const segTotal = Object.keys(segMap).reduce(function(s, k) { return s + segMap[k]; }, 0) || 1;
  const segmentos = Object.keys(segMap)
    .map(function(k) { return { nome: k, valor: segMap[k], pct: Math.round(segMap[k] / segTotal * 100) }; })
    .sort(function(a, b) { return b.valor - a.valor; })
    .slice(0, 6)
    .map(function(s) { return { nome: s.nome, valor: fmtBR_(s.valor), pct: s.pct }; });

  // Top clientes (histórico completo)
  const cliMap = {};
  pedidos.forEach(function(p) {
    if (!cliMap[p.cliente]) cliMap[p.cliente] = { n: 0, total: 0 };
    cliMap[p.cliente].n++; cliMap[p.cliente].total += p.valor;
  });
  const topClientes = Object.keys(cliMap)
    .map(function(k) { return { nome: k, n: cliMap[k].n, total: cliMap[k].total }; })
    .sort(function(a, b) { return b.total - a.total; })
    .slice(0, 5)
    .map(function(c) { return { nome: c.nome, n: c.n, total: fmtBR_(c.total) }; });

  return {
    atualizado: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM 'às' HH:mm"),
    totalPedidos: pedidos.length,
    gmvMes: gmvMes, gmvMesFmt: fmtBR_(gmvMes),
    gmvAnoFmt: fmtBR_(gmvAno),
    pedidosMes: pedidosMes,
    proximas: proximas,
    pendencias: pendencias,
    pendenciasTotal: pendenciasTotal,
    pendenciasTotalFmt: fmtBR_(pendenciasTotal),
    segmentos: segmentos,
    topClientes: topClientes
  };
}

/** ── ROTAS ── */
function doGet(e) {
  const pagina = (e && e.parameter && e.parameter.p) || 'form';
  const base = ScriptApp.getService().getUrl(); // URL absoluta do /exec
  const html = (pagina === 'painel' ? HTML_PAINEL : HTML_FORM).replace(/__URL__/g, base);
  const titulo = pagina === 'painel' ? 'Painel Dolce Vita' : 'Registrar Pedido';
  return HtmlService.createHtmlOutput(html)
    .setTitle(titulo)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function previewPedido(textoColado) { return parseFechar_(textoColado); }

function salvarPedido(d) {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA);
  const hoje = new Date();
  const tz = Session.getScriptTimeZone();
  const dataPedido = Utilities.formatDate(hoje, tz, 'dd/MM/yyyy');

  let dataEntrega = (d.data_entrega || '').trim();
  let ano = '', dia = '', mes = '';
  const m = dataEntrega.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) {
    dia = ('0' + m[1]).slice(-2);
    mes = ('0' + m[2]).slice(-2);
    ano = m[3].length === 4 ? m[3].slice(-2) : m[3];
    dataEntrega = dia + '/' + mes + '/' + (m[3].length === 2 ? '20' + m[3] : m[3]);
  }

  const nPedido = proximoNumeroPedido_(aba);
  const cliente = buscarOuCriarIdCliente_(aba, d.cliente || '');
  const valorNum = parseFloat(String(d.valor_total).replace(/\./g, '').replace(',', '.')) || 0;
  const valorLiquido = valorNum * MARGEM_PADRAO;
  const fmtCel = function(v) { return ' R$  ' + fmtBR_(v) + ' '; };

  const pagto = d.pagamento || 'Pendente';
  let dataP1 = '', valorP1 = '', dataP2 = '', valorP2 = '';
  if (pagto === 'Integral') { dataP1 = dataPedido; }
  else if (pagto === 'Sinal') {
    dataP1 = dataPedido;
    valorP1 = 'R$ ' + fmtBR_(valorNum / 2);
    dataP2 = 'Pendente';
    valorP2 = 'R$ ' + fmtBR_(valorNum / 2);
  }

  const linha = [
    dataPedido, dataEntrega, ano, dia, mes,
    nPedido, cliente.id, (d.cliente || '').trim(),
    d.segmento || '', d.tema || '', d.logistica || '',
    fmtCel(valorNum), '75%', fmtCel(valorLiquido),
    pagto, dataP1, valorP1, dataP2, valorP2, ano
  ];

  // Grava logo abaixo do último pedido REAL, ignorando linhas fantasma
  const colF = aba.getRange(2, 6, Math.max(aba.getLastRow() - 1, 1), 1).getValues();
  let ultimaReal = 1;
  for (let i = 0; i < colF.length; i++) {
    if (String(colF[i][0]).trim() !== '') ultimaReal = i + 2;
  }
  aba.getRange(ultimaReal + 1, 6).setNumberFormat('@'); // n_pedido como texto
  aba.getRange(ultimaReal + 1, 1, 1, linha.length).setValues([linha]);

  return { ok: true, n_pedido: nPedido, cliente_existente: cliente.existente, id_cliente: cliente.id };
}

/** ════════════════ INTERFACE: FORMULÁRIO ════════════════ */
const HTML_FORM = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
:root { --cream:#faf6f0; --parchment:#f2ebe0; --biscuit:#e8d5b8; --caramel:#c49a5a;
  --cacao:#3d2a18; --espresso:#1e1208; --glace:#d4657a; --glace-lt:#fdf0f3;
  --sage:#5a8a5a; --muted:#8a6e54; --border:#e0d0ba; }
* { box-sizing:border-box; margin:0; padding:0; font-family:Georgia,serif; }
body { background:var(--cream); color:var(--cacao); padding-bottom:3rem; }
.header { background:var(--espresso); padding:1.2rem 1.4rem 1rem; display:flex; justify-content:space-between; align-items:center; }
.header h1 { font-size:1.1rem; font-weight:400; color:var(--cream); }
.header h1 em { color:var(--glace); }
.header a { color:var(--caramel); font-size:0.7rem; text-decoration:none; }
.body { padding:1rem 1.2rem; max-width:520px; margin:0 auto; }
label { display:block; font-size:0.66rem; color:var(--muted); margin:0.8rem 0 3px; text-transform:uppercase; letter-spacing:0.08em; }
textarea, input, select { width:100%; background:white; border:1px solid var(--border);
  border-radius:6px; padding:0.6rem 0.75rem; font-size:0.85rem; color:var(--cacao); outline:none; }
textarea:focus, input:focus, select:focus { border-color:var(--glace); }
textarea { min-height:130px; line-height:1.5; }
.btn { width:100%; border:none; border-radius:8px; padding:0.85rem; font-size:0.92rem;
  cursor:pointer; margin-top:1rem; font-style:italic; }
.btn-primary { background:var(--espresso); color:var(--cream); }
.btn-confirm { background:var(--glace); color:white; }
.hidden { display:none; }
.preview-title { font-size:0.78rem; color:var(--glace); margin:1rem 0 0.2rem; font-style:italic; }
.row2 { display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; }
.success { text-align:center; padding:2.5rem 1rem; }
.success .icon { font-size:3rem; }
.success h2 { font-weight:400; margin-top:0.8rem; }
.success p { font-size:0.8rem; color:var(--muted); margin-top:0.4rem; line-height:1.6; }
.success .npedido { font-family:monospace; color:var(--glace); font-size:1.1rem; }
</style>
</head>
<body>
<div class="header">
  <h1>Registrar pedido <em>Dolce Vita</em></h1>
  <a href="__URL__?p=painel" target="_top">📊 Painel →</a>
</div>

<div class="body" id="etapa1">
  <label>Mensagem /fechar (cola aqui)</label>
  <textarea id="texto" placeholder="Que alegria! 🥰 Recapitulando seu pedido:&#10;🍪 ...&#10;💰 R$ ..."></textarea>
  <button class="btn btn-primary" onclick="fazerPreview()">Ler mensagem →</button>
</div>

<div class="body hidden" id="etapa2">
  <div class="preview-title">✨ Confere e completa:</div>
  <div class="row2">
    <div><label>Cliente *</label><input id="f_cliente"></div>
    <div><label>Entrega * (dd/mm/aaaa)</label><input id="f_entrega" placeholder="14/06/2026"></div>
  </div>
  <div class="row2">
    <div><label>Segmento *</label>
      <select id="f_segmento">
        <option value="">--</option>
        <option>Aniversário</option><option>Baby</option><option>Batismo</option>
        <option>Topo de bolo</option><option>Empresarial</option><option>Natal</option>
        <option>Páscoa</option><option>Linha Café</option><option>Dia das Mães</option>
        <option>Dia dos Profs</option><option>Religioso</option><option>Outro</option>
      </select>
    </div>
    <div><label>Tema</label><input id="f_tema" placeholder="ex: Moana"></div>
  </div>
  <div class="row2">
    <div><label>Valor total (R$) *</label><input id="f_valor" placeholder="186,00"></div>
    <div><label>Pagamento</label>
      <select id="f_pagto"><option>Sinal</option><option>Integral</option><option>Pendente</option></select>
    </div>
  </div>
  <label>Logística / taxa entrega (opcional)</label>
  <input id="f_logistica" placeholder="deixe vazio se retirada">
  <button class="btn btn-confirm" onclick="salvar()">🍪 Salvar na planilha</button>
</div>

<div class="body hidden" id="etapa3">
  <div class="success">
    <div class="icon">🍪</div>
    <h2>Pedido registrado!</h2>
    <p>Número do pedido: <span class="npedido" id="np"></span><br><span id="cliente-info"></span></p>
    <button class="btn btn-primary" onclick="location.reload()">Registrar outro</button>
    <button class="btn btn-confirm" onclick="window.top.location='__URL__?p=painel'">📊 Ver painel</button>
  </div>
</div>

<script>
function fazerPreview() {
  const texto = document.getElementById('texto').value;
  if (!texto.trim()) return alert('Cola a mensagem primeiro 🙂');
  google.script.run.withSuccessHandler(function(d) {
    document.getElementById('f_valor').value = d.valor_total || '';
    if (d.data_retirada) {
      const m = d.data_retirada.match(/(\\d{1,2}\\/\\d{1,2})/);
      if (m) document.getElementById('f_entrega').value = m[1] + '/' + new Date().getFullYear();
    }
    document.getElementById('etapa1').classList.add('hidden');
    document.getElementById('etapa2').classList.remove('hidden');
  }).previewPedido(texto);
}
function salvar() {
  const dados = {
    cliente: v('f_cliente'), data_entrega: v('f_entrega'), segmento: v('f_segmento'),
    tema: v('f_tema'), valor_total: v('f_valor'), pagamento: v('f_pagto'), logistica: v('f_logistica')
  };
  if (!dados.cliente || !dados.data_entrega || !dados.valor_total || !dados.segmento)
    return alert('Preenche cliente, entrega, segmento e valor 🙂');
  google.script.run.withSuccessHandler(function(r) {
    document.getElementById('np').textContent = r.n_pedido;
    document.getElementById('cliente-info').textContent = r.cliente_existente
      ? 'Cliente já conhecida (id ' + r.id_cliente + ') — histórico mantido ✓'
      : 'Cliente nova cadastrada com id ' + r.id_cliente + ' ✓';
    document.getElementById('etapa2').classList.add('hidden');
    document.getElementById('etapa3').classList.remove('hidden');
  }).salvarPedido(dados);
}
function v(id) { return document.getElementById(id).value; }
</script>
</body>
</html>`;

/** ════════════════ INTERFACE: PAINEL VIVO ════════════════ */
const HTML_PAINEL = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
:root { --cream:#faf6f0; --parchment:#f2ebe0; --biscuit:#e8d5b8; --caramel:#c49a5a;
  --cacao:#3d2a18; --espresso:#1e1208; --glace:#d4657a; --glace-lt:#fdf0f3;
  --sage:#5a8a5a; --sage-lt:#eaf2ea; --amber:#c47a1e; --muted:#8a6e54;
  --dim:#c4ae96; --border:#e0d0ba; }
* { box-sizing:border-box; margin:0; padding:0; font-family:Georgia,serif; }
body { background:var(--cream); color:var(--cacao); padding-bottom:3rem; }
.header { background:var(--espresso); padding:1.2rem 1.4rem 1rem;
  display:flex; justify-content:space-between; align-items:center; }
.header h1 { font-size:1.1rem; font-weight:400; color:var(--cream); }
.header h1 em { color:var(--glace); }
.header-right { text-align:right; }
.header a { color:var(--caramel); font-size:0.7rem; text-decoration:none; display:block; }
.atualizado { font-size:0.6rem; color:var(--caramel); opacity:0.7; font-family:monospace; }
.body { padding:1rem 1.2rem; max-width:560px; margin:0 auto; }
.loading { text-align:center; padding:4rem 1rem; color:var(--muted); font-style:italic; }
.kpis { display:grid; grid-template-columns:1fr 1fr; gap:0.6rem; margin-bottom:1.2rem; }
.kpi { background:white; border:1px solid var(--border); border-radius:8px; padding:0.85rem 1rem; }
.kpi.pink { border-top:3px solid var(--glace); }
.kpi.green { border-top:3px solid var(--sage); }
.kpi.amber { border-top:3px solid var(--amber); }
.kpi.cacao { border-top:3px solid var(--caramel); }
.kpi-l { font-size:0.58rem; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted); margin-bottom:4px; }
.kpi-v { font-family:monospace; font-size:1.15rem; color:var(--cacao); }
.kpi-v.pink { color:var(--glace); }
.kpi-v.green { color:var(--sage); }
h2 { font-size:0.95rem; font-weight:400; margin:1.4rem 0 0.6rem; color:var(--cacao); }
.card { background:white; border:1px solid var(--border); border-radius:8px;
  padding:0.7rem 0.9rem; margin-bottom:0.5rem; display:flex;
  justify-content:space-between; align-items:center; gap:0.6rem; }
.card.alerta { border-left:4px solid var(--glace); background:var(--glace-lt); }
.card.entrega { border-left:4px solid var(--sage); }
.card.hoje { border-left:4px solid var(--amber); background:#fdf6e8; }
.c-nome { font-size:0.8rem; font-weight:600; color:var(--cacao); }
.c-sub { font-size:0.68rem; color:var(--muted); margin-top:1px; }
.c-right { text-align:right; flex-shrink:0; }
.c-valor { font-family:monospace; font-size:0.78rem; color:var(--glace); font-weight:600; }
.c-dias { font-size:0.6rem; color:var(--muted); }
.badge-hoje { background:var(--amber); color:white; font-size:0.55rem;
  padding:2px 6px; border-radius:3px; text-transform:uppercase; letter-spacing:0.08em; }
.seg-row { display:flex; align-items:center; gap:8px; margin-bottom:0.55rem; }
.seg-nome { width:110px; font-size:0.7rem; color:var(--muted); flex-shrink:0; }
.seg-track { flex:1; background:var(--parchment); border-radius:3px; height:8px; overflow:hidden; }
.seg-fill { height:100%; background:var(--glace); border-radius:3px; }
.seg-val { width:90px; text-align:right; font-family:monospace; font-size:0.65rem; color:var(--cacao); flex-shrink:0; }
table { width:100%; border-collapse:collapse; font-size:0.75rem; background:white;
  border:1px solid var(--border); border-radius:8px; overflow:hidden; }
th { text-align:left; padding:0.5rem 0.7rem; font-size:0.58rem; letter-spacing:0.1em;
  text-transform:uppercase; color:var(--muted); background:var(--parchment); font-weight:400; }
td { padding:0.5rem 0.7rem; border-top:1px solid var(--parchment); color:var(--muted); }
td.hi { color:var(--cacao); font-weight:600; }
td.num { font-family:monospace; text-align:right; color:var(--glace); }
.vazio { font-size:0.75rem; color:var(--dim); font-style:italic; padding:0.5rem 0; }
.refresh { width:100%; background:var(--espresso); color:var(--cream); border:none;
  border-radius:8px; padding:0.7rem; font-size:0.8rem; font-style:italic;
  cursor:pointer; margin-top:1.5rem; font-family:Georgia,serif; }
</style>
</head>
<body>
<div class="header">
  <h1>Painel <em>Dolce Vita</em></h1>
  <div class="header-right">
    <a href="__URL__" target="_top">🍪 Registrar pedido →</a>
    <div class="atualizado" id="atualizado"></div>
  </div>
</div>

<div class="body">
  <div class="loading" id="loading">Assando os números... 🍪</div>
  <div id="conteudo" style="display:none">

    <div class="kpis">
      <div class="kpi pink">
        <div class="kpi-l">Vendas do mês</div>
        <div class="kpi-v pink" id="k-gmv"></div>
      </div>
      <div class="kpi cacao">
        <div class="kpi-l">Pedidos do mês</div>
        <div class="kpi-v" id="k-pedidos"></div>
      </div>
      <div class="kpi green">
        <div class="kpi-l">Vendas do ano</div>
        <div class="kpi-v green" id="k-ano"></div>
      </div>
      <div class="kpi amber">
        <div class="kpi-l">A receber (pendências)</div>
        <div class="kpi-v" id="k-pend" style="color:var(--amber)"></div>
      </div>
    </div>

    <h2>📅 Próximas entregas</h2>
    <div id="entregas"></div>

    <h2>💰 Pagamentos a receber</h2>
    <div id="pendencias"></div>

    <h2>🍪 Vendas por segmento — últimos 12 meses</h2>
    <div id="segmentos" style="background:white;border:1px solid var(--border);border-radius:8px;padding:0.9rem"></div>

    <h2>⭐ Melhores clientes</h2>
    <table>
      <thead><tr><th>Cliente</th><th>Pedidos</th><th style="text-align:right">Total</th></tr></thead>
      <tbody id="clientes"></tbody>
    </table>

    <button class="refresh" onclick="carregar()">↻ Atualizar painel</button>
  </div>
</div>

<script>
function carregar() {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('conteudo').style.display = 'none';
  google.script.run.withSuccessHandler(render).getDadosPainel();
}

function render(d) {
  document.getElementById('atualizado').textContent = 'atualizado ' + d.atualizado;
  document.getElementById('k-gmv').textContent = 'R$ ' + d.gmvMesFmt;
  document.getElementById('k-pedidos').textContent = d.pedidosMes;
  document.getElementById('k-ano').textContent = 'R$ ' + d.gmvAnoFmt;
  document.getElementById('k-pend').textContent = 'R$ ' + d.pendenciasTotalFmt;

  // entregas
  const ent = document.getElementById('entregas');
  ent.innerHTML = d.proximas.length ? '' : '<div class="vazio">Nenhuma entrega futura registrada</div>';
  d.proximas.forEach(function(p) {
    const hoje = p.dias === 0;
    ent.innerHTML += '<div class="card ' + (hoje ? 'hoje' : 'entrega') + '">' +
      '<div><div class="c-nome">' + p.cliente + (hoje ? ' <span class="badge-hoje">hoje</span>' : '') + '</div>' +
      '<div class="c-sub">' + (p.tema || p.segmento) + '</div></div>' +
      '<div class="c-right"><div class="c-valor">R$ ' + p.valor + '</div>' +
      '<div class="c-dias">' + p.data + (hoje ? '' : ' · em ' + p.dias + 'd') + '</div></div></div>';
  });

  // pendências
  const pen = document.getElementById('pendencias');
  pen.innerHTML = d.pendencias.length ? '' : '<div class="vazio">Tudo recebido — nenhuma pendência 🎉</div>';
  d.pendencias.forEach(function(p) {
    pen.innerHTML += '<div class="card alerta">' +
      '<div><div class="c-nome">' + p.cliente + '</div>' +
      '<div class="c-sub">' + (p.tema || '') + ' · ' + p.tipo + '</div></div>' +
      '<div class="c-valor">R$ ' + p.valor + '</div></div>';
  });

  // segmentos
  const seg = document.getElementById('segmentos');
  seg.innerHTML = '';
  d.segmentos.forEach(function(s) {
    seg.innerHTML += '<div class="seg-row"><div class="seg-nome">' + s.nome + '</div>' +
      '<div class="seg-track"><div class="seg-fill" style="width:' + s.pct + '%"></div></div>' +
      '<div class="seg-val">R$ ' + s.valor + '</div></div>';
  });

  // clientes
  const cli = document.getElementById('clientes');
  cli.innerHTML = '';
  d.topClientes.forEach(function(c) {
    cli.innerHTML += '<tr><td class="hi">' + c.nome + '</td><td>' + c.n + '</td>' +
      '<td class="num">R$ ' + c.total + '</td></tr>';
  });

  document.getElementById('loading').style.display = 'none';
  document.getElementById('conteudo').style.display = 'block';
}

carregar();
</script>
</body>
</html>`;
