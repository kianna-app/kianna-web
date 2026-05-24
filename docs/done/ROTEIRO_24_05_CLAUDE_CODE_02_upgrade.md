# ROTEIRO CLAUDE CODE — 02: Página de Upgrade de Plano

**Herda:** `ROTEIRO_CLAUDE_CODE_00_base_comum.md`.
**Objetivo:** Criar a página de **Upgrade/seleção de plano**, seguindo o **layout da imagem de referência**, mas com os **planos e preços do V3**. Deixar pronta para integração futura com plataforma de pagamento (sem integrar agora).

---

## Layout (seguir a imagem de referência)

Estrutura vertical, centralizada, minimalista, accent da marca:

1. **Título** grande + subtítulo curto (ex.: "Escolha o plano ideal para você" / subtítulo de apoio).
2. **Seletor de organização/contexto** no topo (card com avatar + nome + slug `/{slug}`), como na referência. Se o app tem só um contexto por profissional, pode exibir como leitura (não precisa ser dropdown funcional se não houver múltiplas orgs).
3. **Lista de planos** em cards selecionáveis (radio), um por linha:
   - Nome do plano, descrição curta, preço à direita.
   - **Chips de limites** por plano (ícones + número), no estilo da referência (ex.: profissionais / serviços / agendamentos por mês).
   - **Card expansível:** ao expandir, mostrar a lista completa de itens que o plano contempla (requisito explícito). Recolhido por padrão; expande sob demanda.
4. **Legenda dos ícones** dos chips (como na referência).
5. Link "ver detalhes/comparar planos" (opcional, pode rolar para a comparação).
6. **Botão primário "Continuar"** (accent), fixo/visível.

## Planos e preços (V3 — NÃO usar os da imagem)

A imagem é só referência de **layout**. Os planos são os do resumo V3:

| Plano | Preço | Destaque |
|---|---|---|
| Essencial | R$ 49/mês | Agenda + página pública, **SEM WhatsApp** |
| Pro | R$ 179/mês | Tudo + **WhatsApp completo** (coração do produto) |
| Studio | R$ 299/mês | Pro + múltiplos profissionais + relatórios |

- Os **limites/chips por plano** (nº de profissionais, serviços, agendamentos/mês): se já houver definição real, usar; senão, marcar `[[LIMITE_*]]` como placeholder — **não inventar números** que possam virar promessa comercial.
- Destacar o **WhatsApp** como o diferencial do Pro para cima.
- Marcar visualmente o **plano atual** do profissional (ex.: badge "Seu plano atual") e qual seria o upgrade.

## Pronto para pagamento futuro (NÃO integrar agora)

- Estruturar o clique em "Continuar" para chamar um ponto único de "iniciar upgrade" (ex.: um service `PlanoService.iniciarUpgrade(planoId)`), hoje com implementação stub/mock que apenas registra a intenção (e mostra feedback "em breve" ou similar).
- Modelar os planos como dados (id, nome, preço, limites, features) num único lugar reutilizável — facilita ligar ao Stripe depois (Stripe está no backlog V3).
- Deixar **TODO** comentado claro onde a integração de pagamento entra. Não criar contas/SDK de pagamento nesta sessão.

## Backend

- Endpoint para listar planos disponíveis e o plano atual do profissional.
- (Sem cobrança real.) Endpoint stub para registrar intenção de upgrade, logado (observabilidade).

## Critérios de aceite

- [ ] Layout fiel à referência (organização + cards de plano + chips + legenda + botão Continuar).
- [ ] Planos = Essencial/Pro/Studio com preços do V3; **não** os da imagem.
- [ ] Cards expansíveis com a lista de itens de cada plano.
- [ ] WhatsApp destacado como diferencial do Pro+.
- [ ] Plano atual sinalizado.
- [ ] Limites como dado real ou `[[placeholder]]`, sem números inventados.
- [ ] Ponto único de "iniciar upgrade" (stub) + TODO de pagamento; planos modelados como dado reutilizável.
- [ ] Responsivo/mobile-first; estados tratados.
- [ ] Build sem erros.
