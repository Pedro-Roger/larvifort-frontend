# Arquitetura Operacional do Loop

Este repositorio e uma unidade independente do loop global.

- `GOAL.md` define o resultado e os criterios de aceite.
- `ARCHITECTURE.md` define limites tecnicos.
- `TASKS.json` e a unica fila executavel; cada iteracao escolhe uma tarefa `pending`.
- `STATE.md` registra tarefa, verificacao e motivo de parada.
- `LOG.md` registra o historico das iteracoes.

O worker implementa uma tarefa coerente por iteracao. O reviewer so aprova com
evidencia de typecheck, lint e build. O loop para por `DONE`, `BLOCKED`, falha
de verificacao ou limite explicito de iteracoes.

Limites: preservar o App Router e os services existentes, consumir a API real
quando o endpoint existir e nao manter mocks em fluxos de producao.
