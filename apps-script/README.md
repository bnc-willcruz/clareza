# Apps Script — Sistema em Produção

`captura-painel.gs` é o sistema completo rodando em produção no piloto Dolce Vita, sobre Google Apps Script + Google Sheets. Custo: R$ 0/mês.

## O que faz

Duas telas no mesmo app web:

- **`/exec`** — formulário de captura: cola a mensagem `/fechar` do WhatsApp, o parser extrai os campos pelos emojis-âncora, grava linha estruturada na planilha
- **`/exec?p=painel`** — painel vivo: KPIs (vendas mês/ano, pendências), próximas entregas, pagamentos a receber, vendas por segmento, top clientes

## Recursos

- Numeração sequencial automática de pedidos (`n_pedido`)
- Reaproveitamento de `id_cliente` (mantém histórico de recorrência)
- Cálculo automático de margem e valor líquido
- Parcelas de sinal preenchidas automaticamente
- Detecção de pendências de pagamento

## Como instalar

1. Abra a planilha de pedidos no Google Sheets
2. Extensões → Apps Script
3. Cole o conteúdo de `captura-painel.gs` → salve
4. Execute `testarConexao` uma vez (autorize)
5. Implantar → Nova implantação → App da Web (executar como você, acesso: qualquer pessoa)
6. Use o link `/exec` (formulário) e `/exec?p=painel` (painel)

> Ao editar o código: salve **e** faça Implantar → Gerenciar implantações → Nova versão. Sem o segundo passo, o link continua servindo o código anterior.

## Esquema da planilha (aba "Geral")

20 colunas: data do pedido, data de entrega, ano/dia/mês, n_pedido, id_cliente, cliente, segmento, tema, logística, valor total, margem, valor líquido, pagamento, datas e valores das parcelas.
