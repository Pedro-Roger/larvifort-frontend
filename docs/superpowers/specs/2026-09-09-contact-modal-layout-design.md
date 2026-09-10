# Design: layout e telefone das modais de contato

## Objetivo

Corrigir a distribuição visual das modais de criação e edição de contatos e
eliminar o seletor duplicado de DDI no telefone.

## Experiência aprovada

- O formulário usa duas colunas em telas desktop e uma coluna em telas menores.
- Nome/razão social, endereço e observações ocupam toda a largura disponível.
- E-mail, telefone, cidade/UF e demais campos curtos ocupam células do grid sem
  sobreposição ou coluna estreita.
- O DDI é um input curto, editável e iniciado com `55`; a apresentação inclui o
  prefixo `+`, sem dropdown ou opções repetidas.
- O número do telefone permanece em input separado e o payload continua sendo
  salvo no formato composto usado atualmente, como `+55 11 98765-4321`.
- O mesmo comportamento e a mesma organização visual são aplicados em
  `NovoContatoModal` e `EditarContatoModal`.

## Componentes e dados

As alterações ficam restritas às duas modais existentes. O estado continuará
separando `phoneCountry` e `phoneNumber`, com normalização do DDI para aceitar
apenas dígitos e preservar o valor padrão `55`. A leitura da modal de edição
continuará reconhecendo telefones já salvos com `+DDI`.

## Validação

- Executar `npm run typecheck`.
- Executar `npm run build`.
- Inspecionar a modal em desktop e em viewport estreita, verificando que todos
  os campos permanecem alinhados e que o DDI pode ser digitado sem duplicação.
