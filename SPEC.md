# Product Specification

## Project

larvifort-crm

## Goal

Construir um CRM 360 para um escritório administrativo que precisa operar, auditar e quantificar o trabalho diário da equipe.

O LarviFort CRM deve ser a central operacional da empresa: clientes, empresas, agenda, pedidos, tarefas, quadro, metas, métricas, responsáveis, prazos, visitas, reuniões e histórico de execução devem ficar conectados em um ambiente único, profissional e funcional.

O foco principal do produto é operação e auditoria do trabalho. A plataforma deve permitir entender o que cada pessoa está fazendo, quando está fazendo, como está fazendo, qual cliente ou pedido está envolvido e qual resultado foi gerado. O sistema também deve dar recursos para que o trabalho seja feito, acompanhado, cobrado e melhorado com clareza.

## Requirements

- O sistema deve funcionar como um CRM 360 para escritório administrativo, centralizando clientes, empresas, contatos, pedidos, compromissos, tarefas, quadro, metas e métricas.
- O produto deve priorizar operação real, acompanhamento de execução e auditoria do trabalho, acima de telas apenas decorativas.
- Cada atividade relevante deve ter responsável, data, contexto, vínculo com cliente/empresa/pedido quando aplicável e histórico rastreável.
- A agenda deve registrar compromissos como visitas e reuniões, e esses compromissos devem aparecer também como atividades no quadro da pessoa responsável.
- O quadro deve organizar tarefas, compromissos, pedidos e subtarefas de forma clara, com progresso, responsável, prazo e status.
- O módulo de pedidos deve permitir criar e acompanhar pedidos com cliente, quantidade, entrega, endereço, observações, valor e vínculo com o quadro operacional.
- O módulo de métricas deve permitir comparar dados reais do sistema, usando as mesmas fontes para qualquer eixo de comparação quando fizer sentido.
- As metas devem ajudar a definir objetivos operacionais e acompanhar o desempenho da equipe com dados verificáveis.
- O sistema deve suportar automações, regras e fluxos configuráveis para reduzir trabalho manual e padronizar a operação.
- O sistema deve permitir auditoria do trabalho: quem fez, quando fez, o que mudou, qual foi o resultado e qual evidência existe.
- O dashboard deve ser personalizável e deve mostrar apenas informações úteis para a operação, sem dados fictícios ou métricas que não venham do sistema.
- O design deve seguir uma linguagem profissional, limpa e consistente com a plataforma, evitando aparência genérica de ferramenta criada por IA.
- As interfaces devem ser objetivas, legíveis, rápidas e úteis para uso diário por equipe administrativa.
- Recursos marcados como “em breve” devem ficar claros para o usuário e não devem parecer funcionalidades ativas.

## Acceptance Criteria

- Todas as telas principais devem usar dados reais da API ou estados vazios honestos; não usar mocks como se fossem dados de produção.
- O sistema deve permitir auditar tarefas, compromissos e pedidos por responsável, data, status, cliente e contexto operacional.
- Criar visita ou reunião deve gerar compromisso na agenda e atividade correspondente no quadro da pessoa responsável.
- Criar pedido deve permitir selecionar cliente, preencher dados existentes automaticamente, informar quantidade, entrega, observação e valor.
- Quando configurado, um pedido deve criar card automaticamente na coluna escolhida do quadro.
- O quadro deve exibir progresso e responsáveis de forma clara, incluindo progresso calculado por subtarefas quando houver.
- Métricas devem permitir comparações entre fontes do sistema, por exemplo visitas mensais versus pedidos ou clientes atendidos no mês.
- Dashboards e métricas devem permitir composição visual útil para análise operacional.
- A navegação deve estar padronizada com a plataforma e usar nomes literais dos módulos, como Pedidos quando o módulo for de pedidos.
- O design final deve ser revisado contra a biblioteca/referência https://github.com/petergyang/no-ai-slop para evitar aparência de “design de IA”, excesso de efeitos genéricos, cards sem propósito, gradientes artificiais e textos decorativos.
- A interface deve parecer um produto profissional pronto para uso interno, com hierarquia visual clara, espaçamento consistente, estados vazios bem escritos e ações evidentes.
- Cada nova funcionalidade deve passar por validação objetiva: build sem erro, lint quando aplicável, fluxo principal testado e evidência de funcionamento local ou em produção.
- Alterações publicadas devem preservar o restante da plataforma e não quebrar módulos existentes.
