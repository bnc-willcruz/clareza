# Case: Dolce Vita — IA aplicada a um micro negócio real

## Contexto

A Dolce Vita é um negócio de biscoitos decorados que recebe pedidos por WhatsApp e Instagram. Como em muitas micro e pequenas empresas, a operação era informal: pedidos chegavam em texto livre, sem padrão, e o controle de faturamento, recebíveis e clientes era manual.

## O problema

- Pedidos não estruturados (mensagens soltas de WhatsApp).
- Sem visibilidade de GMV, recebíveis ou comportamento de clientes.
- Tempo gasto em controle manual em vez de produção e vendas.

## A solução

Um sistema que transforma os pedidos não estruturados de WhatsApp em dados estruturados e os serve em um dashboard com:

- **GMV** (faturamento) em tempo real
- **Recebíveis** (o que está pago e o que falta)
- **Análise de clientes** (quem compra, com que frequência)

## O resultado

- Decisão deixou de depender de memória e planilha manual.
- Visibilidade imediata do negócio.
- Tempo liberado da operação manual para vendas e produção.

## Por que isso importa

A Dolce Vita é o ambiente onde a Clareza.ia valida, num negócio real, os modelos operacionais com IA antes de aplicá-los com clientes. É a prova de que a tese — *contexto estruturado é o diferencial* — funciona até no menor dos negócios.

## O sistema em produção

O código real que roda este caso está em [`../apps-script`](../apps-script): um sistema sobre Google Apps Script + Google Sheets (custo R$ 0/mês) que faz o parse das mensagens de fechamento do WhatsApp, grava cada pedido de forma estruturada e serve um painel vivo com GMV, recebíveis, próximas entregas e top clientes.

---

*Os números e exemplos neste case usam dados ilustrativos ou anonimizados para preservar a privacidade do negócio e de seus clientes. O código em `apps-script/` lê os dados reais em tempo de execução da planilha — nenhum dado de cliente fica armazenado no código.*
