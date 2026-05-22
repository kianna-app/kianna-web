# Roteiro para Claude Code — Corrigir notificações no agendamento público

## Contexto do bug

No Kianna, quando um cliente cria um agendamento pela **página pública** (`/:slug`), **nenhuma mensagem de WhatsApp é enviada** — nem para o profissional, nem para o cliente.

Importante para o diagnóstico: as notificações disparadas a partir do **dashboard** (confirmação e cancelamento pelo profissional logado) **funcionam corretamente**. Isso prova que `NotificacoesService` e `ZapiService` estão OK. O problema está **isolado no fluxo público de criação de agendamento**.

## Comportamento desejado (decisão de produto já tomada)

Quando um agendamento é criado pela página pública:
1. O **horário nasce como "solicitação" / pendente** (o profissional ainda precisa aprovar manualmente no dashboard).
2. **No momento da criação**, devem ser enviadas DUAS mensagens de WhatsApp:
   - Ao **profissional**: "Nova solicitação de agendamento" (método `notificarNovaSolicitacao` — JÁ EXISTE no `NotificacoesService`).
   - Ao **cliente**: "Solicitação recebida, aguarde confirmação" (método `notificarSolicitacaoRecebidaCliente` — **NÃO EXISTE AINDA**, precisa ser criado — código abaixo).

## Tarefa 1 — Investigar o endpoint de agendamento público

Localize o controller/service que recebe o POST de criação de agendamento a partir da página pública (rota provavelmente em algo como `/api/public/...` ou `/api/agendamentos` sem auth guard, associada ao `slug` do profissional).

Verifique e relate:
- (a) O endpoint chama `NotificacoesService.notificarNovaSolicitacao(...)` em algum momento após gravar no banco? (Hipótese principal: NÃO chama.)
- (b) Se chama, está dentro de um `try/catch` que engole o erro silenciosamente?
- (c) O `profissional_id` passado para a notificação está correto e corresponde ao dono do `slug`?
- (d) O profissional dono do slug usado no teste tem `wpp_status === 'conectado'` no banco? (O `getWppConfig` retorna `null` silenciosamente se não estiver conectado, sem credenciais, ou se o profissional não for encontrado.)

Antes de aplicar qualquer correção, **relate o que encontrou** em cada item acima.

## Tarefa 2 — Adicionar método de notificação ao cliente

No `NotificacoesService` (arquivo `notificacoes.service.ts`), adicione este novo método. Use `EventoCliente` como tipo do parâmetro (mesmo tipo usado por `notificarConfirmacao`, que já contém `cliente_wpp`, `cliente_nome`, `servico_nome`, `data_hora`, `profissional_id`):

```typescript
// ───── 1b. Nova solicitação → confirma recebimento ao CLIENTE ─────
async notificarSolicitacaoRecebidaCliente(evt: EventoCliente): Promise<void> {
  const wpp = await this.getWppConfig(evt.profissional_id);
  if (!wpp) return;

  const data = this.formatarDataHora(evt.data_hora);
  const msg =
    `📩 *Solicitação recebida!*\n\n` +
    `Olá, ${evt.cliente_nome}!\n` +
    `Recebemos seu pedido de agendamento com ${wpp.nome}.\n\n` +
    `💈 ${evt.servico_nome}\n` +
    `📅 ${data}\n\n` +
    `⏳ Aguarde a confirmação. Você receberá um aviso assim que ${wpp.nome} confirmar.`;

  await this.zapi.enviarTexto(
    wpp.wpp_instance_id,
    wpp.wpp_token,
    evt.cliente_wpp,
    msg,
  );
}
```

## Tarefa 3 — Disparar ambas as notificações no endpoint público

No endpoint público de criação de agendamento, **após a gravação bem-sucedida no banco**, dispare as duas notificações. Requisitos:

- Use `Promise.allSettled` (NÃO `await` sequencial), para que a falha de uma notificação não impeça a outra.
- As notificações **NÃO** devem derrubar a request: se ambas falharem, o agendamento já foi gravado e o cliente deve receber resposta de sucesso. WhatsApp é efeito colateral, não parte crítica da transação.
- Logue falhas das notificações (resultado `rejected` do `allSettled`) para facilitar debug futuro, mas não propague exceção ao cliente.

Exemplo de implementação (adapte os nomes de variáveis ao código real):

```typescript
// ... após gravar o agendamento e ter os dados (profissional_id, cliente_nome, cliente_wpp, servico_nome, data_hora):
const resultados = await Promise.allSettled([
  this.notificacoes.notificarNovaSolicitacao({
    profissional_id,
    cliente_nome,
    servico_nome,
    data_hora,
  }),
  this.notificacoes.notificarSolicitacaoRecebidaCliente({
    profissional_id,
    cliente_nome,
    cliente_wpp,
    servico_nome,
    data_hora,
  }),
]);

resultados
  .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
  .forEach((r) => this.logger.error(`Falha ao notificar agendamento: ${r.reason}`));
```

Confira se o `NotificacoesService` está injetado no controller/service do endpoint público. Se não estiver, injete-o (e garanta que o módulo correspondente importa o módulo que exporta `NotificacoesService`).

## Tarefa 4 — Validação

Após as alterações:
- Garanta que o projeto compila (`npm run build` ou equivalente no backend).
- Confirme que os tipos batem (especialmente que `EventoCliente` tem o campo `cliente_wpp`; se o nome real do campo for outro, ajuste).
- NÃO altere o fluxo do dashboard (confirmação/cancelamento), que já funciona.
- Faça um commit com mensagem descritiva, por exemplo:
  `fix(agendamento): notificar profissional e cliente via WhatsApp ao criar solicitação pública`

## Observações importantes

- O `getWppConfig` falha de forma silenciosa (retorna `null`) em três casos: profissional não encontrado, sem credenciais Z-API, ou `wpp_status !== 'conectado'`. Se durante o teste a notificação não chegar mesmo após o fix, verifique no log qual desses casos ocorreu (já existem `logger.warn`/`logger.debug` nesses pontos — talvez seja necessário elevar o nível de log temporariamente para visualizá-los).
- Não invente endpoints nem renomeie métodos existentes sem necessidade. O objetivo é uma correção cirúrgica.
- Reporte ao final um resumo do que foi alterado e em quais arquivos.