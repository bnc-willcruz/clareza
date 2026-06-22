# Roadmap

## Princípio

Cada passo gera valor sozinho mesmo se o projeto parar nele — e cada um alimenta o seguinte. Nada de construir 3 meses para ver o primeiro resultado.

## Fases do modelo de negócio

| Fase | Modelo | Receita | Período |
|------|--------|---------|---------|
| **1** | Serviço piloto | R$ 3k–15k / projeto | 0–6 meses |
| **2** | Assinatura + CS | R$ 500–2.500/mês | 6–18 meses |
| **3** | Plataforma self-serve | Escala | 18 meses+ |

## Sequência técnica (piloto Dolce Vita)

- [x] **Régua de fechamento manual** — templates de mensagem no WhatsApp que estruturam o dado na origem
- [x] **Captura semi-automática** — formulário que parseia a mensagem `/fechar` e grava no banco
- [x] **Banco de dados estruturado** — aba Geral com numeração, id de cliente, margem automáticos
- [x] **Painel vivo** — KPIs, entregas, pendências, segmentos e top clientes em tempo real
- [ ] **Landing page** — conversão de tráfego orgânico em conversa qualificada
- [ ] **Banco de imagens** — catálogo precificado com metadados (ativo de dados + SEO + treino)
- [ ] **Briefing semanal automatizado** — síntese gerada por IA toda segunda
- [ ] **Copiloto no WhatsApp** — sugestões de resposta (não substitui o humano)
- [ ] **Especialista embarcado** — chat que responde sobre o negócio com contexto real

## Níveis de automação da captura

| Nível | Como | Custo | Quando |
|-------|------|-------|--------|
| 1 | Apps Script + cola manual | R$ 0/mês | Agora (validação) |
| 2 | API não-oficial (Z-API + n8n) | ~R$ 100/mês | >20 pedidos/mês |
| 3 | API oficial Meta | R$ 600+/mês | Produto multi-cliente |

## Framework de construção contínua de contexto

Quatro fontes alimentam o contexto de qualquer PME — o que muda por negócio são as fontes, não a estrutura:

1. **Relacionamento** — clientes, histórico, conversas (WhatsApp)
2. **Produção/operação** — o que foi feito, custo, tempo
3. **Canal digital** — posts, engajamento, conversão
4. **Decisão** — o que foi decidido e por quê

O framework é o núcleo do método. As integrações são a camada técnica que varia por cliente.
