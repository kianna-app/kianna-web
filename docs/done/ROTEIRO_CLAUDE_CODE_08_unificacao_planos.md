# ROTEIRO CLAUDE CODE — 08: Unificação de Planos + Troca no Admin

**Herda:** `ROTEIRO_CLAUDE_CODE_00_base_comum.md`.
**Origem:** falhas 3.1–3.4 do teste de 24/05. **Prioridade: a mais alta da leva** — bloqueia o teste de upgrade e a futura integração de pagamento.

**Problema confirmado nos testes:** há três fontes de verdade desalinhadas para planos. O resumo de código cita `gratuito/basico/profissional`; a tela de Upgrade mostra `Essencial/Pro/Studio`; o header exibe "Gratuito". O profissional não consegue trocar de plano para testar.

---

## Passo 0 — Mapear antes de mexer (obrigatório)

Inspecionar e documentar todas as fontes onde "plano" aparece hoje:
1. No banco (tabela/enum/coluna de plano em `profissionais` ou tabela de planos).
2. No backend (DTOs, enums, lógica de limites por plano).
3. No frontend (header, tela de upgrade, qualquer guard de limite).
Listar os nomes/identificadores usados em cada lugar. Sem isso, a unificação chuta.

## Passo 1 — Fonte única de verdade

- Definir **um** catálogo canônico de planos, usado por backend e frontend. Identificadores estáveis (ex.: `essencial`, `pro`, `studio`) separados do rótulo de exibição ("Essencial", "Pro", "Studio").
- Catálogo canônico (do V3):

| id | rótulo | preço | limites |
|---|---|---|---|
| `essencial` | Essencial | R$ 49/mês | `[[LIMITES_ESSENCIAL]]` |
| `pro` | Pro | R$ 179/mês | `[[LIMITES_PRO]]` |
| `studio` | Studio | R$ 299/mês | `[[LIMITES_STUDIO]]` |

- **Limites por plano:** se já existem números reais no código, usar; se divergem ou faltam, marcar `[[ ]]` e NÃO inventar — limites viram promessa comercial. (Decisão de negócio do usuário.)
- **Plano inicial / "Gratuito":** o header mostra "Gratuito" mas o catálogo do V3 não tem plano grátis (o teste grátis do V3 é trial do Essencial/Pro, não um plano permanente). **AMBIGUIDADE A RESOLVER, não decidir:** se existe um estado "sem plano/trial" ele precisa estar no catálogo explicitamente (ex.: `trial`) com rótulo e tratamento próprios; se "Gratuito" era resquício do modelo antigo, remover. Deixar isso sinalizado para o usuário decidir, e enquanto isso representar o estado atual de forma consistente nas três camadas.

## Passo 2 — Alinhar as três camadas

- Backend, header e tela de upgrade passam a ler do mesmo catálogo. Migração de dados se os registros existentes usam os nomes antigos (`basico`→`pro`? mapear com o usuário — **não adivinhar** o de-para; se ambíguo, perguntar).
- Header mostra o rótulo correto do plano real do profissional.
- Tela de upgrade marca o plano atual corretamente (corrige 3.2) e mostra os outros como upgrade.

## Passo 3 — Botão de troca de plano no Admin

- No `/admin`, na gestão do profissional, adicionar ação **"Alterar plano"**: seleciona o plano do catálogo e salva. Real e reaproveitável (será útil na fase de validação manual e mesmo após o Stripe).
- Sob `AdminGuard`. Logar a mudança (observabilidade: quem mudou, de/para, quando).
- Isso resolve 3.2/3.4 (não conseguir trocar para testar) sem depender do Stripe.

## Passo 4 — Ação de contato no card Pro (3.3)

- O teste esperava "Falar com a Kianna" no card Pro e não achou. Confirmar a intenção do card (CTA de contato/upgrade) e implementar a ação esperada — ou alinhar o roteiro de upgrade (02) ao que o card deve fazer. Se a ação correta hoje é "iniciar upgrade (stub)", então renomear/ajustar para não prometer um canal de contato inexistente. **Se houver dúvida sobre o que o botão deve fazer, perguntar — não inventar um fluxo de contato.**

## Critérios de aceite

- [ ] Mapeamento das fontes de plano documentado.
- [ ] Catálogo único de planos consumido por backend + header + upgrade.
- [ ] Header, plano atual e upgrade exibem o MESMO plano de forma consistente.
- [ ] Estado "Gratuito/trial" resolvido explicitamente (ou levado ao usuário se ambíguo).
- [ ] Limites reais ou `[[placeholder]]`, sem números inventados.
- [ ] Botão "Alterar plano" no admin, sob guard, logado, funcional.
- [ ] Card Pro (3.3) com ação correta e honesta.
- [ ] Migração de dados feita com de-para confirmado (não adivinhado).
- [ ] Build verde.

## Fora de escopo
- Integração de pagamento real (Stripe) — task futura. A troca é manual via admin por enquanto.
