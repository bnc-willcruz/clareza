import { useState, useMemo } from "react";

// ── formatters ────────────────────────────────────────────────────────────
const fmtR = (n) =>
  Math.abs(n) >= 1_000_000
    ? `R$ ${(n / 1_000_000).toFixed(1).replace(".", ",")}M`
    : `R$ ${Math.round(n).toLocaleString("pt-BR")}`;
const fmtN = (n) => Math.round(n).toLocaleString("pt-BR");
const fmtX = (n) => `${n.toFixed(1).replace(".", ",")}×`;

const SOM_BASE = 259_776; // 4.8M × 0.99 × 0.30 × 0.18

// ── section label ─────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <div style={{ fontSize: "0.62rem", letterSpacing: "0.18em", color: "#666",
    textTransform: "uppercase", marginBottom: 10 }}>{children}</div>
);

// ── metric card ───────────────────────────────────────────────────────────
const Card = ({ label, value, sub, highlight, warn }) => (
  <div style={{ background: "#161616", border: `1px solid ${highlight ? "#c8a96e44" : warn ? "#9e3a3a44" : "#1e1e1e"}`,
    borderRadius: 4, padding: "1rem" }}>
    <div style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: "#555",
      textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
    <div style={{ fontSize: "clamp(1rem,2.5vw,1.4rem)", fontWeight: 700,
      color: highlight ? "#c8a96e" : warn ? "#c87070" : "#f0ece0",
      fontFamily: "monospace" }}>{value}</div>
    {sub && <div style={{ fontSize: "0.68rem", color: "#444", marginTop: 4 }}>{sub}</div>}
  </div>
);

// ── slider row ────────────────────────────────────────────────────────────
const Slider = ({ label, val, set, min, max, step, display }) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
      <span style={{ fontSize: "0.75rem", color: "#999" }}>{label}</span>
      <span style={{ fontSize: "0.75rem", color: "#c8a96e", fontFamily: "monospace" }}>{display(val)}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={val}
      onChange={(e) => set(parseFloat(e.target.value))}
      style={{ width: "100%", accentColor: "#c8a96e", cursor: "pointer" }} />
  </div>
);

// ── bar chart ─────────────────────────────────────────────────────────────
const BarChart = ({ data, valueKey, colorFn, height = 100 }) => {
  const max = Math.max(...data.map((d) => Math.abs(d[valueKey])));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
      {data.map((d, i) => {
        const v = d[valueKey];
        const pct = max > 0 ? Math.max(2, (Math.abs(v) / max) * (height - 10)) : 2;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div title={`Mês ${d.mes}: ${fmtR(v)}`} style={{
              width: "100%", height: pct, background: colorFn(d, i),
              borderRadius: "2px 2px 0 0", transition: "height 0.3s ease", cursor: "pointer",
            }} />
          </div>
        );
      })}
    </div>
  );
};

// ── tabs ──────────────────────────────────────────────────────────────────
const TABS = ["Mercado", "Unit Economics", "Investimento", "Projeção"];

export default function App() {
  const [tab, setTab] = useState(0);

  // ── market vars ──
  const [preco, setPreco] = useState(750);
  const [fatia, setFatia] = useState(1);
  const [churn, setChurn] = useState(5);
  const [crescimento, setCrescimento] = useState(10);

  // ── unit economics vars ──
  const [cac, setCac] = useState(1200);       // custo aquisição cliente
  const [custoServico, setCustoServico] = useState(150); // COGS por cliente/mês
  const [vendas, setVendas] = useState(8000); // salário vendas/mês
  const [cs, setCs] = useState(6000);         // customer success/mês

  // ── investimento inicial ──
  const [devCost, setDevCost] = useState(40000);
  const [mktLancamento, setMktLancamento] = useState(15000);
  const [runway, setRunway] = useState(6); // meses de reserva

  // ── derived ──────────────────────────────────────────────────────────────
  const clientes0 = Math.round((SOM_BASE * fatia) / 100);
  const mrr0 = clientes0 * preco;

  const margem = preco - custoServico;
  const margemPct = preco > 0 ? (margem / preco) * 100 : 0;
  const ltv = churn > 0 ? margem / (churn / 100) : 0;
  const ltvCac = cac > 0 ? ltv / cac : 0;
  const payback = margem > 0 ? Math.ceil(cac / margem) : 999;

  // opex mensal (fase inicial)
  const opexFixo = vendas + cs + 5000; // infra + admin básico
  const breakEvenClientes = margem > 0 ? Math.ceil(opexFixo / margem) : 999;
  const breakEvenMrr = breakEvenClientes * preco;

  // investimento inicial total
  const reservaOperacional = opexFixo * runway;
  const investTotal = devCost + mktLancamento + reservaOperacional;

  // projeção 24 meses
  const projecao = useMemo(() => {
    let c = 0;
    let caixaAcum = -investTotal;
    const pts = [];
    for (let m = 1; m <= 24; m++) {
      const novos = Math.round(clientes0 * (crescimento / 100) * (m / 24));
      c = Math.max(0, c * (1 - churn / 100) + novos);
      const mrrM = Math.round(c) * preco;
      const custosMes = Math.round(c) * custoServico + opexFixo + novos * cac;
      const lucroMes = mrrM - custosMes;
      caixaAcum += lucroMes;
      pts.push({ mes: m, clientes: Math.round(c), mrr: mrrM,
        lucro: lucroMes, caixa: Math.round(caixaAcum) });
    }
    return pts;
  }, [preco, fatia, churn, crescimento, cac, custoServico, opexFixo, investTotal]);

  const breakEvenMes = projecao.findIndex((p) => p.caixa >= 0);
  const mrrFinal = projecao[23].mrr;
  const clientesFinal = projecao[23].clientes;
  const roiMes24 = investTotal > 0
    ? ((projecao[23].caixa + investTotal) / investTotal) * 100 : 0;

  // ── styles ────────────────────────────────────────────────────────────────
  const root = {
    fontFamily: "'Georgia','Times New Roman',serif",
    background: "#0a0a0a", color: "#f0ece0",
    minHeight: "100vh", padding: "2rem 1.2rem",
    maxWidth: 880, margin: "0 auto",
  };
  const box = {
    background: "#111", border: "1px solid #1e1e1e",
    borderRadius: 4, padding: "1.4rem", marginBottom: "1.2rem",
  };

  return (
    <div style={root}>
      {/* header */}
      <div style={{ marginBottom: "2rem", borderBottom: "1px solid #1e1e1e", paddingBottom: "1.2rem" }}>
        <div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", color: "#555",
          textTransform: "uppercase", marginBottom: 6 }}>Modelo de Negócio</div>
        <h1 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 400,
          margin: 0, lineHeight: 1.2 }}>
          Plataforma de Clareza Decisional<br />
          <span style={{ color: "#c8a96e", fontStyle: "italic" }}>Simulador Completo</span>
        </h1>
      </div>

      {/* tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            padding: "0.4rem 1rem", fontSize: "0.72rem",
            letterSpacing: "0.1em", textTransform: "uppercase",
            background: tab === i ? "#c8a96e" : "#161616",
            color: tab === i ? "#0a0a0a" : "#666",
            border: `1px solid ${tab === i ? "#c8a96e" : "#222"}`,
            borderRadius: 3, cursor: "pointer", fontFamily: "inherit",
          }}>{t}</button>
        ))}
      </div>

      {/* ── TAB 0: MERCADO ── */}
      {tab === 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.8rem", marginBottom: "1.2rem" }}>
            <Card label="TAM — Pequenas empresas" value="4,8M" sub="5-20 funcionários, Brasil" />
            <Card label="SAM — Digitalizadas" value="4,75M" sub="99% do universo" />
            <Card label="SOM — Público real" value={fmtN(SOM_BASE)} sub="conscientes + dispostos a pagar" highlight />
          </div>
          <div style={box}>
            <Label>Variáveis de mercado</Label>
            <div style={{ display: "grid", gap: "1.2rem" }}>
              <Slider label="Preço médio/mês" val={preco} set={setPreco} min={300} max={5000} step={50}
                display={(v) => `R$ ${v.toLocaleString("pt-BR")}`} />
              <Slider label="Fatia do SOM capturada" val={fatia} set={setFatia} min={0.1} max={10} step={0.1}
                display={(v) => `${v.toFixed(1)}%  →  ${fmtN(Math.round(SOM_BASE * v / 100))} clientes`} />
              <Slider label="Churn mensal" val={churn} set={setChurn} min={1} max={15} step={0.5}
                display={(v) => `${v}%`} />
              <Slider label="Crescimento mensal de clientes" val={crescimento} set={setCrescimento} min={1} max={30} step={1}
                display={(v) => `${v}%`} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
            <Card label="MRR — ponto de entrada" value={fmtR(mrr0)} sub={`${fmtN(clientes0)} clientes`} highlight />
            <Card label="ARR — ponto de entrada" value={fmtR(mrr0 * 12)} sub="receita anual" />
            <Card label="MRR — mês 24" value={fmtR(mrrFinal)} sub={`${fmtN(clientesFinal)} clientes projetados`} highlight />
            <Card label="ARR — mês 24" value={fmtR(mrrFinal * 12)} sub={`churn ${churn}% · crescimento ${crescimento}%`} />
          </div>
        </>
      )}

      {/* ── TAB 1: UNIT ECONOMICS ── */}
      {tab === 1 && (
        <>
          <div style={box}>
            <Label>Parâmetros por cliente</Label>
            <div style={{ display: "grid", gap: "1.2rem" }}>
              <Slider label="CAC — Custo de aquisição" val={cac} set={setCac} min={200} max={8000} step={100}
                display={(v) => `R$ ${v.toLocaleString("pt-BR")}`} />
              <Slider label="COGS — Custo de serviço/mês" val={custoServico} set={setCustoServico} min={30} max={600} step={10}
                display={(v) => `R$ ${v}`} />
              <Slider label="Salário time de vendas/mês" val={vendas} set={setVendas} min={3000} max={25000} step={500}
                display={(v) => `R$ ${v.toLocaleString("pt-BR")}`} />
              <Slider label="Salário customer success/mês" val={cs} set={setCs} min={3000} max={20000} step={500}
                display={(v) => `R$ ${v.toLocaleString("pt-BR")}`} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "0.8rem", marginBottom: "1.2rem" }}>
            <Card label="Margem por cliente/mês" value={fmtR(margem)}
              sub={`${margemPct.toFixed(0)}% do MRR`} highlight={margemPct >= 60} warn={margemPct < 40} />
            <Card label="LTV — Valor vitalício" value={fmtR(ltv)}
              sub={`com churn de ${churn}%/mês`} highlight={ltvCac >= 3} />
            <Card label="LTV / CAC" value={fmtX(ltvCac)}
              sub="saudável acima de 3×" highlight={ltvCac >= 3} warn={ltvCac < 2} />
            <Card label="Payback do CAC" value={`${payback} meses`}
              sub="ideal abaixo de 12 meses" highlight={payback <= 12} warn={payback > 18} />
          </div>

          <div style={box}>
            <Label>Break-even operacional</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.8rem" }}>
              <div>
                <div style={{ fontSize: "0.62rem", color: "#555", marginBottom: 4 }}>OPEX fixo/mês</div>
                <div style={{ fontSize: "1.1rem", fontFamily: "monospace", color: "#f0ece0" }}>{fmtR(opexFixo)}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.62rem", color: "#555", marginBottom: 4 }}>Clientes p/ break-even</div>
                <div style={{ fontSize: "1.1rem", fontFamily: "monospace", color: "#c8a96e" }}>{fmtN(breakEvenClientes)}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.62rem", color: "#555", marginBottom: 4 }}>MRR no break-even</div>
                <div style={{ fontSize: "1.1rem", fontFamily: "monospace", color: "#c8a96e" }}>{fmtR(breakEvenMrr)}</div>
              </div>
            </div>
          </div>

          {/* saúde do modelo */}
          <div style={box}>
            <Label>Diagnóstico do modelo</Label>
            <div style={{ display: "grid", gap: "0.6rem" }}>
              {[
                { ok: margemPct >= 60, txt: `Margem bruta ${margemPct.toFixed(0)}% — ideal ≥ 60% para SaaS` },
                { ok: ltvCac >= 3, txt: `LTV/CAC ${fmtX(ltvCac)} — saudável acima de 3×` },
                { ok: payback <= 12, txt: `Payback ${payback} meses — ideal ≤ 12 meses` },
                { ok: churn <= 5, txt: `Churn ${churn}%/mês — crítico manter abaixo de 5%` },
              ].map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: "0.78rem" }}>
                  <span style={{ color: d.ok ? "#6e9e6e" : "#c87070", fontSize: "0.9rem" }}>{d.ok ? "✓" : "✗"}</span>
                  <span style={{ color: d.ok ? "#aaa" : "#c87070" }}>{d.txt}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── TAB 2: INVESTIMENTO ── */}
      {tab === 2 && (
        <>
          <div style={box}>
            <Label>Investimento inicial</Label>
            <div style={{ display: "grid", gap: "1.2rem" }}>
              <Slider label="Desenvolvimento do produto (MVP)" val={devCost} set={setDevCost}
                min={5000} max={200000} step={5000}
                display={(v) => `R$ ${v.toLocaleString("pt-BR")}`} />
              <Slider label="Marketing de lançamento" val={mktLancamento} set={setMktLancamento}
                min={2000} max={80000} step={1000}
                display={(v) => `R$ ${v.toLocaleString("pt-BR")}`} />
              <Slider label="Runway operacional" val={runway} set={setRunway}
                min={3} max={18} step={1}
                display={(v) => `${v} meses → ${fmtR(opexFixo * v)}`} />
            </div>
          </div>

          {/* breakdown */}
          <div style={box}>
            <Label>Composição do investimento total</Label>
            {[
              { nome: "MVP / Produto", val: devCost, cor: "#c8a96e" },
              { nome: "Marketing de lançamento", val: mktLancamento, cor: "#8a6f3e" },
              { nome: `Reserva operacional (${runway}m)`, val: reservaOperacional, cor: "#3a5a3a" },
            ].map((item) => (
              <div key={item.nome} style={{ marginBottom: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.75rem", color: "#999" }}>{item.nome}</span>
                  <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: item.cor }}>{fmtR(item.val)}</span>
                </div>
                <div style={{ background: "#1a1a1a", borderRadius: 2, height: 6 }}>
                  <div style={{ height: "100%", width: `${(item.val / investTotal) * 100}%`,
                    background: item.cor, borderRadius: 2 }} />
                </div>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: "0.8rem", marginTop: "0.4rem",
              display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.8rem", color: "#aaa" }}>TOTAL</span>
              <span style={{ fontSize: "1rem", fontFamily: "monospace", color: "#f0ece0", fontWeight: 700 }}>
                {fmtR(investTotal)}
              </span>
            </div>
          </div>

          {/* retorno */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.8rem" }}>
            <Card label="Break-even caixa" value={breakEvenMes >= 0 ? `Mês ${breakEvenMes + 1}` : "> 24 meses"}
              sub="recuperação do investimento"
              highlight={breakEvenMes >= 0 && breakEvenMes < 18}
              warn={breakEvenMes < 0 || breakEvenMes >= 18} />
            <Card label="Caixa acumulado — mês 24" value={fmtR(projecao[23].caixa)}
              sub="líquido pós-investimento"
              highlight={projecao[23].caixa > 0} warn={projecao[23].caixa < 0} />
            <Card label="ROI — mês 24" value={`${roiMes24.toFixed(0)}%`}
              sub="retorno sobre investimento inicial"
              highlight={roiMes24 > 100} warn={roiMes24 < 0} />
          </div>

          {/* comparativo opções MVP */}
          <div style={{ ...box, marginTop: "1.2rem" }}>
            <Label>Opções de MVP — o que R$ {fmtR(devCost)} compra</Label>
            <div style={{ display: "grid", gap: "0.8rem" }}>
              {[
                { faixa: "R$ 5k–15k", desc: "MVP manual: você + Claude + Notion + Make. Zero código próprio. Piloto com 3-5 clientes.", fit: devCost <= 15000 },
                { faixa: "R$ 15k–40k", desc: "Produto simples: RAG básico, interface web, onboarding semi-manual. 20-50 clientes.", fit: devCost > 15000 && devCost <= 40000 },
                { faixa: "R$ 40k–100k", desc: "Plataforma real: multi-tenant, integrações (WhatsApp, Drive, Notion), painel próprio.", fit: devCost > 40000 && devCost <= 100000 },
                { faixa: "R$ 100k+", desc: "Produto completo com agentes, IA fine-tuned, self-serve onboarding e integrações nativas.", fit: devCost > 100000 },
              ].map((o) => (
                <div key={o.faixa} style={{ display: "flex", gap: 12, padding: "0.7rem",
                  background: o.fit ? "#1a1a12" : "#111",
                  border: `1px solid ${o.fit ? "#c8a96e44" : "#1e1e1e"}`, borderRadius: 3 }}>
                  <div style={{ fontSize: "0.72rem", color: "#c8a96e", fontFamily: "monospace",
                    whiteSpace: "nowrap", minWidth: 90 }}>{o.faixa}</div>
                  <div style={{ fontSize: "0.72rem", color: o.fit ? "#ccc" : "#555" }}>{o.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── TAB 3: PROJEÇÃO ── */}
      {tab === 3 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "0.8rem", marginBottom: "1.2rem" }}>
            <Card label="Investimento total" value={fmtR(investTotal)} sub="capital necessário para entrar" />
            <Card label="Break-even caixa" value={breakEvenMes >= 0 ? `Mês ${breakEvenMes + 1}` : "> 24m"}
              highlight={breakEvenMes >= 0 && breakEvenMes < 18} warn={breakEvenMes < 0 || breakEvenMes >= 18} />
            <Card label="MRR — mês 24" value={fmtR(mrrFinal)} highlight sub={`${fmtN(clientesFinal)} clientes`} />
            <Card label="Caixa líquido — mês 24" value={fmtR(projecao[23].caixa)}
              highlight={projecao[23].caixa > 0} warn={projecao[23].caixa < 0} />
          </div>

          {/* MRR chart */}
          <div style={box}>
            <Label>MRR mensal — 24 meses</Label>
            <BarChart data={projecao} valueKey="mrr" height={110}
              colorFn={(d, i) => {
                if (breakEvenMes >= 0 && i >= breakEvenMes) return "#c8a96e";
                return "#2a2a2a";
              }} />
            <div style={{ display: "flex", justifyContent: "space-between",
              marginTop: 5, fontSize: "0.6rem", color: "#333" }}>
              <span>Mês 1</span><span>Mês 12</span><span>Mês 24</span>
            </div>
            {breakEvenMes >= 0 && (
              <div style={{ fontSize: "0.68rem", color: "#c8a96e", marginTop: 8 }}>
                ↑ Dourado = após break-even caixa (mês {breakEvenMes + 1})
              </div>
            )}
          </div>

          {/* caixa acumulado */}
          <div style={box}>
            <Label>Caixa acumulado — 24 meses</Label>
            <BarChart data={projecao} valueKey="caixa" height={110}
              colorFn={(d) => d.caixa >= 0 ? "#6e9e6e" : "#9e3a3a"} />
            <div style={{ display: "flex", justifyContent: "space-between",
              marginTop: 5, fontSize: "0.6rem", color: "#333" }}>
              <span>Mês 1</span><span>Mês 12</span><span>Mês 24</span>
            </div>
            <div style={{ fontSize: "0.68rem", color: "#555", marginTop: 8 }}>
              Verde = caixa positivo · Vermelho = investimento ainda não recuperado
            </div>
          </div>

          {/* tabela resumo por trimestre */}
          <div style={box}>
            <Label>Resumo trimestral</Label>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem" }}>
                <thead>
                  <tr style={{ color: "#555", borderBottom: "1px solid #222" }}>
                    {["Trimestre","Clientes","MRR","Lucro mês","Caixa acum."].map((h) => (
                      <th key={h} style={{ padding: "0.4rem 0.6rem", textAlign: "right",
                        fontWeight: 400, letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[2, 5, 8, 11, 14, 17, 20, 23].map((idx) => {
                    const d = projecao[idx];
                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid #151515",
                        background: d.caixa >= 0 ? "#111a11" : "transparent" }}>
                        <td style={{ padding: "0.4rem 0.6rem", color: "#666" }}>T{Math.floor(idx / 3) + 1}</td>
                        <td style={{ padding: "0.4rem 0.6rem", textAlign: "right", fontFamily: "monospace", color: "#aaa" }}>{fmtN(d.clientes)}</td>
                        <td style={{ padding: "0.4rem 0.6rem", textAlign: "right", fontFamily: "monospace", color: "#c8a96e" }}>{fmtR(d.mrr)}</td>
                        <td style={{ padding: "0.4rem 0.6rem", textAlign: "right", fontFamily: "monospace",
                          color: d.lucro >= 0 ? "#6e9e6e" : "#c87070" }}>{fmtR(d.lucro)}</td>
                        <td style={{ padding: "0.4rem 0.6rem", textAlign: "right", fontFamily: "monospace",
                          color: d.caixa >= 0 ? "#6e9e6e" : "#c87070" }}>{fmtR(d.caixa)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* footer */}
      <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "1rem", marginTop: "1.5rem",
        fontSize: "0.62rem", color: "#333", lineHeight: 1.6 }}>
        Modelo simplificado para fins de validação. Premissas: SOM = 4,8M PMEs × 99% digitalizadas × 30% conscientes de IA × 18% dispostos a pagar.
        OPEX fixo inclui vendas + CS + infra. CAC aplicado sobre novos clientes por mês.
      </div>
    </div>
  );
}
