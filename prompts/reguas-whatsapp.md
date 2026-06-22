# Réguas de Mensagem — WhatsApp

Templates que estruturam o dado na origem da conversa. Salvos como respostas rápidas no WhatsApp Business. O parser do sistema de captura se ancora nos emojis (🍪 🎨 🔢 💰 📅), então o texto ao redor é livre — o negócio pode personalizar a voz sem quebrar a captura.

## `/oi` — Abertura automática

Coleta tema, ocasião, data e quantidade já no primeiro contato. Inclui mínimo e antecedência para autoqualificar o cliente.

## `/infos` — Pacote de informações

Especificações do produto, tabela de preços por complexidade, local de retirada.

## `/fechar` — Recap de fechamento (a mensagem que vira dado)

A mensagem mais importante. Contém todos os campos que o banco precisa:

```
Que alegria! 🥰 Recapitulando seu pedido:

🍪 Biscoitos:
[lista itemizada]

🎨 Cores principais: [cores]
🔢 Total: [N] biscoitos [com/sem palito]
💰 Valor: R$ [valor]

📅 Retirada: [data] até [hora]
📍 [endereço]

Sinal de 50% via Pix reserva sua data:
💳 Pix: [chave]
```

A chave Pix embutida elimina a fricção do "me manda sua chave" no momento mais quente da venda.

## `/lembrete` — Follow-up 48h

Reabre conversa parada sem soar como cobrança.

## `/agenda` — Follow-up de urgência real

Usa a antecedência real da agenda como urgência legítima (não tática de pressão).

---

## Princípio de design

A régua não muda o comportamento do negócio — captura o que ele já faz. No piloto Dolce Vita, descobrimos que a empreendedora já tinha um funil semi-profissional; o sistema só passou a registrar o que antes se perdia no WhatsApp.
