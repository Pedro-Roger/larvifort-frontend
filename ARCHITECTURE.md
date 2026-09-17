# Architecture

## Stack

- **Project:** `larvifort-crm`
- **Runtime:** Next.js App Router com React e TypeScript.
- **UI:** Tailwind CSS, componentes próprios e ícones Phosphor.
- **API:** backend LarviFort separado em `lavifort-API`, exposto com prefixo `/api/v1`.
- **Deployment:** frontend publicado na Vercel em `www.larvifort.online`; backend publicado separadamente no VPS LarviFort nesse servidor  aqui ssh root@187.127.51.135
- **Auth:** autenticação via cookie/token validada no frontend por proxy/guard e no backend por rotas protegidas.
- **Realtime:** quadro pode consumir eventos via WebSocket quando disponível.

## Product Boundaries

O `larvifort-crm` é o frontend operacional do CRM 360. Ele não deve ser tratado como uma landing page nem como painel decorativo.

Responsabilidades principais:

- Operação diária de clientes, empresas, contatos, agenda, pedidos, tarefas, quadro, metas e métricas.
- Auditoria do trabalho: responsável, data, status, cliente, pedido, compromisso, progresso e histórico.
- Visualização de dados reais vindos da API ou estados vazios honestos.
- Composição de dashboard e métricas para análise operacional.
- Configuração de regras e automações que reduzem trabalho manual.

Responsabilidades fora deste repositório:

- Persistência, regras de domínio e migrations ficam no `lavifort-API`.
- Deploy e saúde do backend devem ser validados no VPS correto antes de assumir que uma mudança está em produção.
- Banco de dados, migrations e containers não devem ser alterados por este frontend.

## Modules

- **Dashboard:** visão personalizável da operação, sem mocks de produção.
- **Agenda:** visitas, reuniões e compromissos vinculados ao trabalho da equipe.
- **Quadro:** tarefas, compromissos, pedidos, subtarefas, responsáveis, prazos e progresso.
- **Pedidos:** criação e acompanhamento de pedidos com cliente, quantidade, entrega, endereço, observação, valor e card automático quando configurado.
- **Métricas:** comparações entre fontes reais do sistema, usando eixos configuráveis.
- **Metas:** definição e acompanhamento de objetivos operacionais.
- **Empresas e Clientes:** cadastro e relacionamento comercial/operacional.
- **Configurações:** integrações futuras, pedidos, automações e opções de plataforma.

## Design Rules

- Evitar aparência genérica de “design de IA”.
- Revisar telas relevantes contra a referência `https://github.com/petergyang/no-ai-slop`.
- Preferir hierarquia clara, espaçamento consistente, textos objetivos e ações evidentes.
- Não usar gradientes, cards, slogans ou métricas sem função operacional clara.
- Estados vazios devem explicar o que falta e qual ação resolve.
- Recursos “em breve” devem parecer inativos, não funcionalidades parcialmente quebradas.

## Engineering Rules

- Não usar mocks como dados de produção.
- Preservar dados reais, autenticação e módulos existentes.
- Manter lógica de integração em `src/services` e evitar regras complexas escondidas em componentes visuais.
- Validar mudanças com `npm run lint` e `npm run build`; quando aplicável, usar `npm run typecheck` e testes específicos.
- Não commitar segredos, `.env` sensível ou artefatos temporários.
- Alterações que dependem de backend devem ser coordenadas com `lavifort-API` e validadas em rota real.
- Deploy de frontend não prova deploy de backend; validar cada superfície separadamente.
