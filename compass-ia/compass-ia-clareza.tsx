import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, RotateCcw, CheckCircle2, AlertTriangle, XCircle, Check, Sparkles, ShieldCheck, Wand2, Users } from "lucide-react";

const TASK_CRITERIA = [
  {
    id: "t1",
    code: "T1",
    title: "Personalização e interação",
    question: "O resultado precisa ser ajustado a um contexto específico (uma pessoa, uma situação, um momento)?",
    help: "Pense: o conteúdo final muda dependendo de detalhes específicos (para quem é, quando é, qual é a situação) — ou seria sempre basicamente o mesmo texto?",
    options: [
      { value: 1, label: "Seria sempre o mesmo, independente do contexto" },
      { value: 2, label: "Mudaria um pouco, com pequenos ajustes" },
      { value: 3, label: "Mudaria bastante, dependendo do contexto específico" },
    ],
  },
  {
    id: "t2",
    code: "T2",
    title: "Volume de material de apoio",
    question: "Para fazer essa tarefa bem, é preciso ler ou cruzar várias informações, fontes ou registros?",
    help: "Pense: alguém precisaria juntar informação de vários lugares (documentos, conversas, anotações, históricos) para responder isso com qualidade?",
    options: [
      { value: 1, label: "Não — cabe na cabeça, sem precisar consultar nada" },
      { value: 2, label: "Um pouco — uma ou duas fontes curtas bastam" },
      { value: 3, label: "Sim — muita coisa pra juntar e resumir" },
    ],
  },
  {
    id: "t3",
    code: "T3",
    title: "Criatividade",
    question: "O resultado esperado são ideias, textos ou opções novas — não um número ou fato exato?",
    help: "Pense: existe 'a' resposta certa (um número, uma data, um sim/não), ou várias respostas diferentes poderiam ser igualmente boas?",
    options: [
      { value: 1, label: "Existe uma resposta certa e objetiva" },
      { value: 2, label: "Tem um pouco dos dois" },
      { value: 3, label: "Várias respostas diferentes podem ser boas" },
    ],
  },
  {
    id: "t4",
    code: "T4",
    title: "Exemplos de referência",
    question: "Você tem exemplos prontos de como ficaria um resultado bom nessa tarefa?",
    help: "Pense: existe algo feito antes — por você ou por outra pessoa — que sirva de modelo do que é 'bom'?",
    options: [
      { value: 1, label: "Não, seria a primeira vez" },
      { value: 2, label: "Tem algo, mas espalhado ou meio antigo" },
      { value: 3, label: "Sim, temos bons exemplos guardados e organizados" },
    ],
  },
];

const PRACTICAL_CRITERIA = [
  {
    id: "p1",
    code: "P1",
    title: "Dados sensíveis",
    question: "Para fazer essa tarefa, seria preciso compartilhar informações sigilosas (suas, de outras pessoas ou de uma organização)?",
    help: "Pense em nomes, documentos pessoais, dados de saúde, contratos, números financeiros, informações privadas ou estratégicas.",
    options: [
      { value: 1, label: "Sim, e não temos uma ferramenta segura para isso" },
      { value: 2, label: "Sim, mas temos uma ferramenta com proteção adequada" },
      { value: 3, label: "Não, nada sensível envolvido" },
    ],
  },
  {
    id: "p2",
    code: "P2",
    title: "Clareza sobre o que é 'certo'",
    question: "Você sabe descrever o que torna o resultado bom ou ruim nessa tarefa?",
    help: "Pense: se você recebesse o resultado pronto, conseguiria dizer rapidamente o que está certo e o que precisa mudar — ou seria difícil definir isso?",
    options: [
      { value: 1, label: "Difícil definir — é bem subjetivo, depende do dia" },
      { value: 2, label: "Mais ou menos — tenho algumas referências/regras em mente" },
      { value: 3, label: "Fácil — tenho critérios claros do que funciona" },
    ],
  },
  {
    id: "p3",
    code: "P3",
    title: "O que acontece se a IA errar?",
    question: "Se a resposta vier errada (e a pessoa confiar nela), o estrago seria grande?",
    help: "Pense no impacto de UM erro — e lembre que, se a ferramenta for usada muitas vezes, esse mesmo erro pode se repetir.",
    options: [
      { value: 1, label: "Grande — pode custar dinheiro, gerar problema ou quebrar confiança" },
      { value: 2, label: "Médio — dá pra corrigir, mas é incômodo" },
      { value: 3, label: "Pequeno — fácil de notar e corrigir, sem maiores danos" },
    ],
  },
  {
    id: "p4",
    code: "P4",
    title: "Como saber se deu certo",
    question: "Você sabe como vai medir se a IA está fazendo essa tarefa melhor (ou igual) do que é feito hoje?",
    help: "Pense: existe algo hoje para comparar — tempo gasto, qualidade, custo — ou seria 'no olho'?",
    options: [
      { value: 1, label: "Não, ainda não pensei nisso" },
      { value: 2, label: "Tenho uma ideia, mas não é formal" },
      { value: 3, label: "Sim, sei exatamente o que comparar" },
    ],
  },
];

const ALL_CRITERIA = [...TASK_CRITERIA, ...PRACTICAL_CRITERIA];

// Extra question for the HBR-style quadrant (knowledge type)
const KNOWLEDGE_QUESTION = {
  id: "k1",
  code: "K1",
  title: "Tipo de conhecimento exigido",
  question: "Se você desse essa tarefa para duas pessoas diferentes, o resultado esperado seria parecido — baseado em dados ou regras claras? Ou cada uma faria diferente, usando julgamento próprio?",
  help: "Pense: existe um jeito 'certo' de fazer, que qualquer pessoa treinada chegaria perto — ou o resultado depende de experiência, intuição e contexto de quem faz?",
  options: [
    { value: "explicit", label: "Seria parecido — existe um jeito 'certo', baseado em dados ou regras" },
    { value: "tacit", label: "Cada um faria diferente — depende de julgamento, experiência, contexto" },
  ],
};

// HBR quadrant definitions
const HBR_QUADRANTS = {
  no_regrets: {
    name: "No Regrets",
    namePt: "Sem arrependimentos",
    icon: Sparkles,
    color: "#0E7490",
    mode: "Pode rodar com IA sozinha, sem revisão caso a caso. O foco é ganhar velocidade e escala — não precisão perfeita.",
    examples: "Triagem inicial de currículos, resumo de reuniões, respostas a dúvidas recorrentes de clientes.",
  },
  creative_catalyst: {
    name: "Creative Catalyst",
    namePt: "Catalisador criativo",
    icon: Wand2,
    color: "#6B5CA5",
    mode: "Use a IA para gerar várias opções (textos, ideias, variações) — a escolha e o refinamento final continuam sendo humanos.",
    examples: "Rascunhos de campanhas, variações de copy, primeiras versões de design ou roteiro.",
  },
  quality_control: {
    name: "Quality Control",
    namePt: "Controle de qualidade",
    icon: ShieldCheck,
    color: "#C98A2C",
    mode: "A IA faz o trabalho pesado, mas a revisão humana é obrigatória em 100% dos casos antes de qualquer coisa seguir adiante.",
    examples: "Minutas de contrato, código de produção, due diligence de documentos.",
  },
  human_first: {
    name: "Human-First",
    namePt: "Humano primeiro",
    icon: Users,
    color: "#0F766E",
    mode: "A IA tem papel apenas de apoio — pesquisa, dados, rascunho inicial. A decisão final é, e continua sendo, humana.",
    examples: "Definição de estratégia, contratação de lideranças, decisões em crises.",
  },
};

function getHbrQuadrant(knowledgeType, p3Score) {
  const highErrorCost = p3Score === 1; // P3 = 1 means "big impact if wrong"
  if (knowledgeType === "explicit") {
    return highErrorCost ? "quality_control" : "no_regrets";
  } else {
    return highErrorCost ? "human_first" : "creative_catalyst";
  }
}

function ScoreBar({ value, max = 12, label, color }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">{label}</span>
        <span className="text-sm font-mono text-slate-700">{value} / {max}</span>
      </div>
      <div className="h-2 w-full bg-slate-200 rounded-none overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function AIFeasibilityTool() {
  // step: -1 = intro, 0..7 = the 8 main questions, 8 = result, 9 = bonus question, 10 = bonus result
  const [step, setStep] = useState(-1);
  const [taskName, setTaskName] = useState("");
  const [answers, setAnswers] = useState({});
  const [knowledgeAnswer, setKnowledgeAnswer] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const [savedThisResult, setSavedThisResult] = useState(false);
  // Lead capture (Clareza.ia)
  const [leadEmail, setLeadEmail] = useState("");
  const [leadStatus, setLeadStatus] = useState("idle"); // idle | sent
  function submitLead() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(leadEmail)) return;
    // PLACEHOLDER: integre aqui um serviço (ex.: Formspree) para receber o e-mail.
    // Ex.: fetch("https://formspree.io/f/SEU_ID", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email: leadEmail, caso: taskName }) })
    setLeadStatus("sent");
  }

  const totalSteps = ALL_CRITERIA.length;
  const isIntro = step === -1;
  const isResult = step === totalSteps;
  const isBonusQuestion = step === totalSteps + 1;
  const isBonusResult = step === totalSteps + 2;
  const current = !isIntro && !isResult && !isBonusQuestion && !isBonusResult ? ALL_CRITERIA[step] : null;

  const taskScore = TASK_CRITERIA.reduce((sum, c) => sum + (answers[c.id] || 0), 0);
  const practicalScore = PRACTICAL_CRITERIA.reduce((sum, c) => sum + (answers[c.id] || 0), 0);

  const taskMax = TASK_CRITERIA.length * 3;
  const practicalMax = PRACTICAL_CRITERIA.length * 3;

  // find weakest practical criterion (lowest score = highest risk)
  const lowestPractical = PRACTICAL_CRITERIA.reduce((min, c) => {
    const score = answers[c.id] || 0;
    if (min === null || score < min.score) return { ...c, score };
    return min;
  }, null);

  const anyPracticalCritical = PRACTICAL_CRITERIA.some((c) => (answers[c.id] || 0) === 1);
  const taskFit = taskScore / taskMax;

  let verdict, verdictColor, VerdictIcon, verdictText, verdictShort;
  if (anyPracticalCritical) {
    verdict = "Não recomendado sem mitigação";
    verdictShort = "ainda não — mitigue antes";
    verdictColor = "#0F766E";
    VerdictIcon = XCircle;
    verdictText = `Pelo menos um critério prático está em alerta crítico (${lowestPractical.code} — ${lowestPractical.title}). Antes de seguir, trate esse ponto especificamente — caso contrário, o risco supera o ganho, independente de quão adequada a tarefa pareça nos critérios T1–T4.`;
  } else if (taskFit < 0.5) {
    verdict = "Provavelmente não é o caso de uso ideal";
    verdictShort = "baixa prioridade agora";
    verdictColor = "#C98A2C";
    VerdictIcon = AlertTriangle;
    verdictText = "A tarefa não tem muita afinidade com o que IA generativa faz bem (pouca personalização, pouco texto a sintetizar, pouca criatividade, poucos exemplos). Pode haver soluções mais simples e baratas — automação por regras, planilha, checklist. Vale revisitar se a percepção mudar com o tempo.";
  } else if (practicalScore / practicalMax >= 0.75) {
    verdict = "Viável — bom caso para IA generativa";
    verdictShort = "pronto para escalar";
    verdictColor = "#0E7490";
    VerdictIcon = CheckCircle2;
    verdictText = "A tarefa tem boa afinidade com IA generativa e os riscos práticos estão sob controle. Ainda assim, defina desde já o que é 'sucesso' (P4) e mantenha algum nível de revisão, especialmente nas primeiras semanas.";
  } else {
    verdict = "Viável com mitigação";
    verdictShort = "viável, com ajustes";
    verdictColor = "#C98A2C";
    VerdictIcon = AlertTriangle;
    verdictText = `A tarefa tem boa afinidade com IA generativa, mas existem pontos de atenção nos critérios práticos — principalmente em ${lowestPractical.code} (${lowestPractical.title}). Vale seguir, desde que esse ponto receba uma salvaguarda específica (revisão humana, RAG com fonte confiável, escopo limitado, etc.).`;
  }

  const recommendations = [];
  if ((answers.p1 || 0) <= 2) {
    recommendations.push("Privacidade (P1): use ferramentas com proteção de dados (ex. planos enterprise que não usam conversas para treinar modelos) ou anonimize informações sensíveis antes de enviar.");
  }
  if ((answers.p2 || 0) <= 2) {
    recommendations.push("Alinhamento (P2): defina por escrito o que é uma 'resposta boa', teste com um grupo piloto pequeno e faça 'red-teaming' — tente ativamente quebrar o sistema antes de lançar.");
  }
  if ((answers.p3 || 0) <= 2) {
    recommendations.push("Custo do erro (P3): restrinja a IA a responder apenas com base em fontes verificadas (RAG), instrua-a a admitir incerteza em vez de inventar respostas, e mantenha revisão humana em casos de maior impacto.");
  }
  if ((answers.p4 || 0) <= 2) {
    recommendations.push("Critério de sucesso (P4): antes de lançar, escreva contra o que você vai comparar — tempo atual do processo manual, taxa de erro humana, custo por interação — para poder avaliar o piloto de forma objetiva.");
  }
  if ((answers.t2 || 0) >= 3) {
    recommendations.push("Bom uso de T2: aproveite RAG (Retrieval Augmented Generation) para conectar a IA à sua base de documentos em vez de depender só do conhecimento geral do modelo.");
  }
  if ((answers.t1 || 0) >= 3 && (answers.t4 || 0) >= 3) {
    recommendations.push("T1 + T4 fortes: vale investir em um system prompt bem definido com exemplos (few-shot) — provavelmente já entrega resultado sólido sem precisar de fine-tuning.");
  }

  // HBR quadrant (only computable once p3 is answered)
  const hbrQuadrantKey = knowledgeAnswer ? getHbrQuadrant(knowledgeAnswer, answers.p3 || 0) : null;
  const hbrQuadrant = hbrQuadrantKey ? HBR_QUADRANTS[hbrQuadrantKey] : null;

  function setAnswer(value) {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  }

  function next() {
    if (step < totalSteps) setStep(step + 1);
  }
  function back() {
    if (step > -1) setStep(step - 1);
  }
  function reset() {
    setStep(-1);
    setAnswers({});
    setKnowledgeAnswer(null);
    setTaskName("");
    setSavedThisResult(false);
    setSaveStatus("idle");
  }

  // Save an anonymous record of the result once the user reaches the result screen
  useEffect(() => {
    if (!isResult || savedThisResult) return;
    setSaveStatus("saving");
    const record = {
      timestamp: new Date().toISOString(),
      taskDescription: taskName.slice(0, 300),
      scores: { ...answers },
      taskScore,
      practicalScore,
      verdict,
    };
    const key = `response:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    (async () => {
      try {
        const result = await window.storage.set(key, JSON.stringify(record), true);
        setSaveStatus(result ? "saved" : "error");
      } catch (e) {
        setSaveStatus("error");
      } finally {
        setSavedThisResult(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResult]);

  return (
    <div className="min-h-screen w-full bg-[#F7FAF9] text-[#0B3D3A] flex items-start justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 border-b border-[#0B3D3A]/15 pb-5">
          <div className="flex items-center gap-2.5 mb-3">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="flex-shrink-0">
              <rect x="1" y="1" width="26" height="26" rx="7" stroke="#0B3D3A" strokeWidth="1.5" />
              <path d="M19 9L15.5 15.5L9 19L12.5 12.5L19 9Z" fill="#0F766E" />
            </svg>
            <span className="text-base font-semibold tracking-tight">Compass.ia</span>
          </div>
          <h1 className=" text-3xl sm:text-4xl leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
            Vale usar IA (ChatGPT, Claude) nesse caso de uso?
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-lg">
            Responda 8 perguntas simples sobre o caso de uso que você tem em mente e receba um diagnóstico
            com recomendações específicas sobre onde ferramentas como ChatGPT ou Claude ajudam — e onde exigem cuidado.
          </p>
          <p className="mt-2 text-xs text-slate-500 max-w-lg">
            Para qualquer pessoa avaliando se vale usar IA em um caso de uso do dia a dia — sem jargão técnico.
          </p>
        </div>

        {/* Progress */}
        {!isIntro && !isResult && !isBonusQuestion && !isBonusResult && (
          <div className="mb-6 flex items-center gap-2">
            {ALL_CRITERIA.map((c, i) => (
              <div
                key={c.id}
                className="h-1 flex-1 rounded-none"
                style={{
                  backgroundColor:
                    i < step ? "#0B3D3A" : i === step ? "#0F766E" : "#0B3D3A22",
                }}
              />
            ))}
          </div>
        )}

        {/* INTRO */}
        {isIntro && (
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-[#0B3D3A]/10 p-6">
              <label className="block text-xs uppercase tracking-wider text-slate-500 font-medium mb-2">
                Descreva o caso de uso que você está avaliando
              </label>
              <textarea
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Ex.: Responder dúvidas de clientes sobre status de pedidos via WhatsApp"
                className="w-full border border-[#0B3D3A]/20 bg-[#FFFFFF] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/40 resize-none"
                rows={3}
              />
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                Isso não muda o cálculo — é só para você manter o foco em um caso de uso concreto enquanto responde.
                As próximas 8 perguntas avaliam duas dimensões: se a IA{" "}
                <strong>consegue</strong> fazer bem esse caso de uso, e se ela <strong>deve</strong> ser usada,
                considerando os riscos envolvidos.
              </p>
            </div>
            <button
              onClick={() => setStep(0)}
              style={{ backgroundColor: "#0F766E", color: "#FFFFFF" }}
              className="w-full flex items-center justify-center gap-2 px-5 py-4 text-base font-semibold transition-colors hover:opacity-90"
            >
              Começar avaliação <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* QUESTION (1-8) */}
        {current && (
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-[#0B3D3A]/10 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-mono font-semibold px-2 py-0.5 border"
                  style={{
                    borderColor: current.code.startsWith("T") ? "#0E7490" : "#0F766E",
                    color: current.code.startsWith("T") ? "#0E7490" : "#0F766E",
                  }}
                >
                  {current.code}
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-500">
                  {current.code.startsWith("T") ? "Critério de tarefa" : "Critério prático"}
                </span>
              </div>
              <h2 className=" text-xl sm:text-2xl mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                {current.title}
              </h2>
              <p className="text-sm text-slate-700 mb-1">{current.question}</p>
              <p className="text-xs text-slate-500 italic mb-4">{current.help}</p>

              <div className="flex flex-col gap-3">
                {current.options.map((opt) => {
                  const selected = answers[current.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setAnswer(opt.value)}
                      style={
                        selected
                          ? { backgroundColor: "#0F766E", borderColor: "#0F766E", color: "#FFFFFF" }
                          : { backgroundColor: "#FFFFFF", borderColor: "rgba(33,32,28,0.12)", color: "#334155" }
                      }
                      className="text-left text-sm px-4 py-3.5 border-2 transition-all flex items-center gap-3 hover:opacity-90"
                    >
                      <span
                        style={
                          selected
                            ? { borderColor: "#FFFFFF", backgroundColor: "#FFFFFF" }
                            : { borderColor: "rgba(33,32,28,0.25)", backgroundColor: "transparent" }
                        }
                        className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      >
                        {selected && <Check size={12} strokeWidth={3} style={{ color: "#0F766E" }} />}
                      </span>
                      <span className={selected ? "font-semibold" : ""}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={back}
                className="flex items-center gap-1 text-sm text-slate-600 hover:text-[#0B3D3A] px-2 py-2"
              >
                <ChevronLeft size={16} /> Voltar
              </button>
              <button
                onClick={next}
                disabled={answers[current.id] === undefined}
                className="flex items-center gap-2 bg-[#0B3D3A] text-[#F7FAF9] px-5 py-3 text-sm font-medium hover:bg-[#155e56] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {step === totalSteps - 1 ? "Ver resultado" : "Próxima"} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* RESULT (main diagnosis) */}
        {isResult && (
          <div className="flex flex-col gap-5">
            {taskName && (
              <div className="text-xs uppercase tracking-wider text-slate-500">
                Caso de uso avaliado: <span className="text-slate-700 font-medium">{taskName}</span>
              </div>
            )}

            <div className="bg-white border border-[#0B3D3A]/10 p-6">
              <div className="flex items-start gap-3 mb-4">
                <VerdictIcon size={28} style={{ color: verdictColor }} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Veredito</p>
                  <h2 className=" text-2xl leading-tight" style={{ fontFamily: "'Inter', sans-serif", color: verdictColor }}>
                    {verdict}
                  </h2>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-5">{verdictText}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <ScoreBar value={taskScore} max={taskMax} label="Afinidade da tarefa com IA" color="#0E7490" />
                <ScoreBar value={practicalScore} max={practicalMax} label="Segurança para usar IA" color="#0F766E" />
              </div>

              <div className="border-t border-[#0B3D3A]/10 pt-4">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Detalhe por critério</p>
                <div className="flex flex-col gap-1.5">
                  {ALL_CRITERIA.map((c) => {
                    const score = answers[c.id] || 0;
                    const color = score === 3 ? "#0E7490" : score === 2 ? "#C98A2C" : "#0F766E";
                    return (
                      <div key={c.id} className="flex items-center gap-3 text-sm">
                        <span className="font-mono text-xs text-slate-500 w-7">{c.code}</span>
                        <span className="flex-1 text-slate-700">{c.title}</span>
                        <span
                          className="w-6 h-6 flex items-center justify-center text-xs font-mono font-semibold text-white"
                          style={{ backgroundColor: color }}
                        >
                          {score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="bg-white border border-[#0B3D3A]/10 p-6">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">Recomendações específicas</p>
                <ul className="flex flex-col gap-3">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-slate-700 leading-relaxed pl-4 border-l-2" style={{ borderColor: "#0F766E" }}>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lead capture + Clareza CTA */}
            <div className="p-6" style={{ backgroundColor: "#0F766E" }}>
              {leadStatus !== "sent" ? (
                <>
                  <h3 className="text-lg font-semibold text-white mb-1">Receba este diagnóstico e os próximos passos</h3>
                  <p className="text-sm text-white/80 mb-4 leading-relaxed">
                    Deixe seu e-mail para receber um resumo do resultado e materiais sobre como aplicar IA na sua operação.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="flex-1 px-4 py-3 text-sm bg-white/95 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/60"
                    />
                    <button
                      onClick={submitLead}
                      style={{ backgroundColor: "#0B3D3A", color: "#FFFFFF" }}
                      className="px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Receber resultado
                    </button>
                  </div>
                  <p className="text-xs text-white/60 mt-2">Sem spam. Você pode cancelar quando quiser.</p>
                </>
              ) : (
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={22} className="text-white flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Pronto!</h3>
                    <p className="text-sm text-white/85 leading-relaxed mb-4">
                      Quer ir além do diagnóstico? Agende uma conversa de 30 minutos para mapear onde a IA gera valor na sua operação.
                    </p>
                    <a
                      href="https://cal.com/clareza-will/diagnostico"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "#FFFFFF", color: "#0F766E" }}
                    >
                      Agendar diagnóstico gratuito
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Bonus teaser */}
            <div className="bg-white border-2 border-dashed p-6" style={{ borderColor: "#0B3D3A22" }}>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Bônus — 1 pergunta extra</p>
              <h3 className=" text-lg mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                Que tipo de tarefa é essa — e como a IA deveria participar dela?
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                Esse diagnóstico te disse <em>se</em> vale a pena. Mais uma pergunta (baseada num
                framework recente publicado pela Harvard Business Review) te diz <em>como</em> a IA
                deveria operar nessa tarefa: sozinha, como apoio criativo, com revisão obrigatória, ou
                só como suporte a uma decisão humana.
              </p>
              <button
                onClick={() => setStep(totalSteps + 1)}
                style={{ backgroundColor: "#0B3D3A", color: "#F7FAF9" }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors hover:opacity-90"
              >
                Responder pergunta bônus <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={reset}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#0B3D3A] px-2 py-2"
              >
                <RotateCcw size={15} /> Avaliar outra tarefa
              </button>
              <button
                onClick={() => setStep(totalSteps - 1)}
                className="flex items-center gap-1 text-sm text-slate-600 hover:text-[#0B3D3A] px-2 py-2"
              >
                <ChevronLeft size={16} /> Revisar respostas
              </button>
            </div>
          </div>
        )}

        {/* BONUS QUESTION (knowledge type) */}
        {isBonusQuestion && (
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-[#0B3D3A]/10 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-mono font-semibold px-2 py-0.5 border"
                  style={{ borderColor: "#6B5CA5", color: "#6B5CA5" }}
                >
                  {KNOWLEDGE_QUESTION.code}
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-500">
                  Pergunta bônus — tipo de tarefa
                </span>
              </div>
              <h2 className=" text-xl sm:text-2xl mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                {KNOWLEDGE_QUESTION.title}
              </h2>
              <p className="text-sm text-slate-700 mb-1">{KNOWLEDGE_QUESTION.question}</p>
              <p className="text-xs text-slate-500 italic mb-4">{KNOWLEDGE_QUESTION.help}</p>

              <div className="flex flex-col gap-3">
                {KNOWLEDGE_QUESTION.options.map((opt) => {
                  const selected = knowledgeAnswer === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setKnowledgeAnswer(opt.value)}
                      style={
                        selected
                          ? { backgroundColor: "#6B5CA5", borderColor: "#6B5CA5", color: "#FFFFFF" }
                          : { backgroundColor: "#FFFFFF", borderColor: "rgba(33,32,28,0.12)", color: "#334155" }
                      }
                      className="text-left text-sm px-4 py-3.5 border-2 transition-all flex items-center gap-3 hover:opacity-90"
                    >
                      <span
                        style={
                          selected
                            ? { borderColor: "#FFFFFF", backgroundColor: "#FFFFFF" }
                            : { borderColor: "rgba(33,32,28,0.25)", backgroundColor: "transparent" }
                        }
                        className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      >
                        {selected && <Check size={12} strokeWidth={3} style={{ color: "#6B5CA5" }} />}
                      </span>
                      <span className={selected ? "font-semibold" : ""}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(totalSteps)}
                className="flex items-center gap-1 text-sm text-slate-600 hover:text-[#0B3D3A] px-2 py-2"
              >
                <ChevronLeft size={16} /> Voltar ao diagnóstico
              </button>
              <button
                onClick={() => setStep(totalSteps + 2)}
                disabled={knowledgeAnswer === null}
                className="flex items-center gap-2 bg-[#0B3D3A] text-[#F7FAF9] px-5 py-3 text-sm font-medium hover:bg-[#155e56] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Ver resultado combinado <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* BONUS RESULT (combined diagnosis) */}
        {isBonusResult && hbrQuadrant && (
          <div className="flex flex-col gap-5">
            {taskName && (
              <div className="text-xs uppercase tracking-wider text-slate-500">
                Caso de uso avaliado: <span className="text-slate-700 font-medium">{taskName}</span>
              </div>
            )}

            {/* Combined headline */}
            <div className="bg-white border border-[#0B3D3A]/10 p-6">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Diagnóstico combinado</p>
              <h2 className=" text-2xl leading-tight mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                <span style={{ color: verdictColor }}>{verdict}</span>
                <span className="text-slate-400"> + </span>
                <span style={{ color: hbrQuadrant.color }}>{hbrQuadrant.name}</span>
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed mb-5">
                O primeiro diagnóstico disse se essa tarefa <strong>está pronta</strong> ({verdictShort}).
                A pergunta bônus diz <strong>como a IA deve operar</strong> nela, segundo um framework
                recente publicado pela Harvard Business Review.
              </p>

              <div className="bg-[#FFFFFF] border border-[#0B3D3A]/10 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <hbrQuadrant.icon size={18} style={{ color: hbrQuadrant.color }} />
                  <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: hbrQuadrant.color }}>
                    {hbrQuadrant.name} — {hbrQuadrant.namePt}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-3">{hbrQuadrant.mode}</p>
                <p className="text-xs text-slate-500 italic">Exemplos típicos: {hbrQuadrant.examples}</p>
              </div>
            </div>

            {/* Combined recommendation */}
            <div className="bg-white border-2 p-6" style={{ borderColor: verdictColor }}>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Recomendação final</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {verdict === "Não recomendado sem mitigação" && (
                  <>Antes de qualquer coisa, resolva o ponto crítico apontado no diagnóstico original
                  ({lowestPractical.code} — {lowestPractical.title}). Mesmo depois de resolvido, pelo
                  tipo de tarefa, o modo de operação correto é: <strong>{hbrQuadrant.mode.toLowerCase()}</strong></>
                )}
                {verdict === "Provavelmente não é o caso de uso ideal" && (
                  <>Essa tarefa não tem prioridade agora — pode haver soluções mais simples (regra,
                  planilha, checklist). Se isso mudar, lembre-se que, pelo tipo de tarefa, o modo de
                  operação correto seria: <strong>{hbrQuadrant.mode.toLowerCase()}</strong></>
                )}
                {verdict === "Viável com mitigação" && (
                  <>Vale seguir, desde que o ponto de atenção do diagnóstico original
                  ({lowestPractical.code} — {lowestPractical.title}) receba uma salvaguarda específica.
                  E pelo tipo de tarefa, o modo de operação correto é: <strong>{hbrQuadrant.mode.toLowerCase()}</strong></>
                )}
                {verdict === "Viável — bom caso para IA generativa" && (
                  <>Essa tarefa está pronta para escalar. E pelo tipo de tarefa, o modo de operação
                  correto é: <strong>{hbrQuadrant.mode.toLowerCase()}</strong></>
                )}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(totalSteps + 1)}
                className="flex items-center gap-1 text-sm text-slate-600 hover:text-[#0B3D3A] px-2 py-2"
              >
                <ChevronLeft size={16} /> Revisar resposta bônus
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#0B3D3A] px-2 py-2"
              >
                <RotateCcw size={15} /> Avaliar outra tarefa
              </button>
            </div>
          </div>
        )}

        <div className="mt-10 pt-4 border-t border-[#0B3D3A]/10 text-[11px] text-slate-400 leading-relaxed">
          Compass.ia — diagnóstico de viabilidade para uso de IA generativa. Metodologia inspirada em
          frameworks de avaliação de tarefas e riscos usados em programas de Harvard Kennedy School sobre
          IA generativa, com um complemento opcional baseado no framework publicado na Harvard Business
          Review ("The Gen AI Playbook for Organizations", Anand & Wu, 2025). Os critérios são guias de
          julgamento, não regras absolutas — revise sua avaliação periodicamente conforme as capacidades
          de IA evoluem.
        </div>
      </div>
    </div>
  );
}
