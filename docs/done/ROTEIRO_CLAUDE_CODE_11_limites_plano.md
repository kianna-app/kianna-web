# ROTEIRO CLAUDE CODE — 11: Correção de Limites por Plano (Sistema Completo)

**Herda:** `ROTEIRO_CLAUDE_CODE_00_base_comum.md`.
**Contexto:** o roteiro 08 unificou o catálogo de planos mas deixou os limites como `[[A DEFINIR]]`. Os limites agora estão definidos (tabela abaixo). O sistema está aplicando validações erradas — o Essencial barra serviços como se o limite fosse zero, o Grátis libera tudo sem restrição. Esta task corrige isso em todo o sistema.

**REGRA DE OURO:** os limites abaixo são decisão de negócio fechada. Não alterar nenhum valor sem instrução explícita do usuário.

---

## Tabela de limites (fonte de verdade — gravar em local único)

| id | Rótulo | Preço | Profissionais | Serviços | Agendamentos/mês | WhatsApp | Relatórios |
|---|---|---|---|---|---|---|---|
| `gratis` | Grátis | R$ 0 | 1 | 3 | 30 | ❌ | ❌ |
| `essencial` | Essencial | R$ 49 | 1 | 15 | 150 | ❌ | ❌ |
| `pro` | Pro | R$ 179 | 1 | ilimitado | ilimitado | ✅ | ❌ |
| `studio` | Studio | R$ 299 | 5 | ilimitado | ilimitado | ✅ | ✅ |

**Ilimitado** = sem verificação de limite (não gravar `999999` — usar `null` ou flag `unlimited: true` para distinguir de um número real).

---

## Passo 0 — Auditar todo o sistema (obrigatório antes de alterar)

Mapear **todos** os pontos onde limites de plano são verificados ou aplicados hoje:

1. Backend: guards, interceptors, services que checam limite antes de criar serviço, agendamento, profissional, ou liberar WhatsApp/relatórios.
2. Frontend: componentes que bloqueiam ação, ocultam botão, ou exibem "limite atingido" — em TODAS as rotas (Serviços, Agendamentos, Profissionais, WhatsApp, Relatórios, qualquer outra).
3. Qualquer valor de limite hardcoded (número mágico no código em vez de vir do catálogo).

Listar tudo encontrado antes de alterar qualquer arquivo.

---

## Passo 1 — Gravar os limites na fonte única

- O catálogo do roteiro 08 já existe. Completar/substituir os `[[A DEFINIR]]` com os valores da tabela acima.
- `ilimitado` representado como `null` ou `unlimited: true` — **não** como número arbitrariamente alto.
- Esta é a **única** fonte que o backend e o frontend leem. Se hoje há valores duplicados em outros lugares, removê-los e apontar para o catálogo.

---

## Passo 2 — Corrigir as validações no backend

Para cada ponto de validação encontrado no Passo 0:

- Ler o limite do catálogo (não hardcoded).
- Tratar `null`/`unlimited` corretamente — nunca barrar uma ação por plano ilimitado.
- **Plano Grátis:** aplicar os limites reais (3 serviços, 30 agendamentos/mês, 1 profissional, sem WhatsApp, sem relatórios). Hoje está liberando tudo — isso é o bug mais urgente.
- **WhatsApp:** bloquear acesso às funcionalidades de WhatsApp para Grátis e Essencial (conexão de instância, envio de notificações). Não apenas ocultar no front — validar no backend.
- **Relatórios:** bloquear para Grátis, Essencial e Pro. Disponível apenas para Studio.
- **Profissionais adicionais:** Studio suporta até 5. Os demais, 1.
- Retornar erro claro e tipado quando o limite é atingido (ex.: `{ code: 'PLAN_LIMIT_REACHED', resource: 'services', limit: 15 }`), para o frontend poder agir de forma específica.

---

## Passo 3 — Corrigir o frontend

- Ler o limite do plano do profissional logado (via o mesmo catálogo/endpoint).
- **Botão "Ver planos" / "Fazer upgrade":** apontar para `/dashboard/upgrade`. Hoje não faz nada — corrigir em todos os lugares onde aparece.
- Quando o backend retornar `PLAN_LIMIT_REACHED`: exibir mensagem clara com o limite atual E um CTA de upgrade ("Seu plano Essencial permite 15 serviços. Faça upgrade para o Pro e tenha serviços ilimitados."). Não apenas "limite atingido" genérico.
- Ocultar/desabilitar funcionalidades de WhatsApp (configuração de instância, toggles de notificação) para Grátis e Essencial, com explicação e CTA de upgrade.
- Ocultar/desabilitar Relatórios para planos que não têm acesso, com CTA de upgrade.
- **Não depender só do frontend para segurança de limite** — o backend valida, o frontend apenas reflete o estado.

---

## Passo 4 — Verificar o plano Grátis especificamente

Por estar liberando tudo, fazer uma verificação explícita:

- Confirmar que a conta com plano `gratis` é barrada ao tentar criar o 4º serviço.
- Confirmar que é barrada ao tentar criar o 31º agendamento no mês.
- Confirmar que não consegue acessar/configurar WhatsApp.
- Confirmar que não consegue acessar Relatórios.
- Confirmar que não consegue adicionar um 2º profissional (Studio exclusivo até 5).

---

## Critérios de aceite

- [ ] Tabela de limites gravada em fonte única; sem `[[A DEFINIR]]` e sem valores hardcoded fora dela.
- [ ] `null`/`unlimited` tratado corretamente — planos Pro e Studio não são barrados por limite de serviços ou agendamentos.
- [ ] Plano Grátis bloqueia ao atingir 3 serviços, 30 agendamentos/mês; sem acesso a WhatsApp ou Relatórios.
- [ ] Plano Essencial bloqueia ao atingir 15 serviços, 150 agendamentos/mês; sem acesso a WhatsApp ou Relatórios.
- [ ] WhatsApp bloqueado no backend (não só oculto no front) para Grátis e Essencial.
- [ ] Relatórios bloqueados para Grátis, Essencial e Pro; disponível apenas para Studio.
- [ ] Mensagem de limite com CTA de upgrade específico (qual recurso, qual limite, qual plano resolve).
- [ ] Botão "Ver planos" aponta para `/dashboard/upgrade` em todos os lugares.
- [ ] Backend retorna erro tipado (`PLAN_LIMIT_REACHED` + recurso + limite).
- [ ] Plano Grátis testado manualmente nos 4 bloqueios (serviços, agendamentos, WhatsApp, relatórios).
- [ ] Build verde; nenhuma regressão nos fluxos que já passavam.

---

## Fora de escopo
- Mudar qualquer limite da tabela acima.
- Integração de pagamento (Stripe) — task futura.
- Criar o fluxo de upgrade em si — o `/dashboard/upgrade` já existe; esta task só garante que o botão aponta pra lá.
