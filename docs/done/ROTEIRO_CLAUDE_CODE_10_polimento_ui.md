# ROTEIRO CLAUDE CODE — 10: Polimento de UI

**Herda:** `ROTEIRO_CLAUDE_CODE_00_base_comum.md`.
**Origem:** observações 2.2 e 4.1 do teste de 24/05. Cosméticos, baixo risco, agrupados.

---

## A. Badge do sino distorcido (obs. 2.2)

**Problema:** o badge vermelho de contagem sobre o ícone de sino está distorcido / grande demais.

- Ajustar o badge para tamanho proporcional ao ícone: pequeno, circular, alinhado ao canto superior do sino. Não deformar com 1 ou 2+ dígitos.
- Tratar contagem de 2 dígitos e o caso "9+" (ou o limite que o projeto preferir) sem esticar/quebrar o layout.
- Acessível: a contagem deve ser legível e ter rótulo para leitor de tela (ex.: "3 notificações não lidas").
- Seguir cores/tokens do projeto (vermelho de alerta dos tokens, não hardcoded).

## B. Indicador de carregamento do Relatório (obs. 4.1)

**Problema:** o teste esperava um spinner; aparece apenas o texto "Carregando relatório...".

> **Decisão simples, sem ambiguidade de produto:** trocar o texto puro por um indicador de carregamento visual consistente com o resto do app.

- Usar o **mesmo padrão de loading** já adotado em outras telas do projeto (spinner ou skeleton — inspecionar o que já existe e reusar, para consistência). Não introduzir um estilo de loading novo só aqui.
- Se o projeto ainda não tem um componente de loading padrão, criar um mínimo e reutilizável (atende também os requisitos de "código reutilizável" da base comum).
- Manter acessibilidade: `aria-busy` / `role="status"` na região que carrega.

## Critérios de aceite

- [ ] Badge do sino proporcional, circular, sem distorção com 1, 2 ou "9+" dígitos.
- [ ] Badge com rótulo acessível e cores dos tokens.
- [ ] Loading do relatório usando o padrão visual do app (spinner/skeleton reutilizável).
- [ ] Região de carregamento acessível.
- [ ] Build verde; nada além desses dois pontos alterado.
