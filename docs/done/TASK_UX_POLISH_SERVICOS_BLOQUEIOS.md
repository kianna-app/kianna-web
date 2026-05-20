-  Aperfeiçoe, detalhe e melhore esta Task.
-  
- E gere uma task card em .txt para a uma IA implementar. 
- - Buscar plugins que já implementam calendários para economizar no código. 
- - Utilizar os padrões de cores do Projeto. 
- - Ser responsivo com uma ótima usabilidade no Mobile. 
- - Ter um layout Moderno. Priorizar a experiência do usuário. 
- - Assuma que a IA já conhece o projeto que está se referindo. 
- - Caso tenha alguma ambiguidade ou dúvida perguntar.

Itens abaixo são melhorias de design / UX 

---

## 1. Listagem de Serviços (`/dashboard/servicos`)

Arquivos prováveis:
- `src/app/features/dashboard/pages/servicos/servicos.component.ts`
- `src/app/features/dashboard/pages/servicos/servicos.component.html`
- `src/app/features/dashboard/pages/servicos/servicos.component.scss`

Objetivo: visual mais moderno, responsivo, com mais informações úteis e melhor UX.

Possíveis melhorias a discutir:
- [ ] Reorganizar layout dos cards/itens (hierarquia visual clara: nome, modalidade, duração, preço).
- [ ] Adicionar badges visuais para modalidade (presencial / domiciliar / online) com ícone + cor.
- [ ] Indicador visual mais forte para serviços inativos (overlay, opacidade, label "Inativo").
- [ ] Ações (editar / excluir / ativar) em hover no desktop, sempre visíveis em mobile.
- [ ] Empty state ilustrado quando ainda não há serviços.
- [ ] Skeleton mais alinhado ao card final (evitar layout shift).
- [ ] Responsividade: grid de 1/2/3 colunas conforme largura.
- [ ] Considerar exibir contagem de agendamentos no mês por serviço (se útil).
- [ ] Considerar mostrar última edição / data de criação.

---

## 2. Modal "Novo bloqueio" (`add-bloqueio-dialog.component.ts`)

Arquivo: `src/app/features/dashboard/pages/horarios/bloqueios/add-bloqueio-dialog.component.ts`

### 2.1 Feedback visual / validação
- [ ] Campo **Data**: quando vazio ou inválido, mostrar `mat-error` abaixo do campo
      (atualmente só desabilita o botão sem indicar o porquê).
- [ ] Campo **Data**: marcar como `required`, usar `#dataRef="ngModel"` ou migrar para
      Reactive Forms (consistente com `servico-dialog.component.ts`).
- [ ] Campo **Hora início / Hora fim**: usar `mat-error` em vez de snackbar para
      validações inline ("hora fim deve ser maior", "preencher os dois").
- [ ] Catch genérico do `salvar()` deve exibir a mensagem real do backend
      (ex: 400 com motivo), não "Erro ao salvar bloqueio".

### 2.2 Layout
- [ ] Padronizar espaçamento vertical entre campos (atualmente `gap: 8px`,
      pequeno demais comparado a outros dialogs do app).
- [ ] Padronizar largura/altura dos campos `mat-form-field` data/hora
      (uniformizar com servico-dialog).
- [ ] Padronizar botões do footer:
  - "Cancelar" usa `.btn-ghost`, "Salvar" usa `.btn-primary`.
  - Avaliar usar Material `mat-button` / `mat-raised-button` como
    nos outros dialogs do app, ou levar `.btn-primary` para todos (consistência).
- [ ] Tipo de bloqueio (radio "Dia inteiro / Período específico"):
      avaliar transformar em `MatButtonToggle` para visual mais limpo.

---

## 3. Lista de bloqueios agendados

Arquivos prováveis:
- `src/app/features/dashboard/pages/horarios/bloqueios/*` (lista que renderiza
  os bloqueios futuros consumidos do `BloqueiosStore`).

Objetivo: visual mais moderno, responsivo, mais informações.

Possíveis melhorias a discutir:
- [ ] Agrupar bloqueios por mês quando houver muitos.
- [ ] Mostrar dia da semana ao lado da data (ex: "Sex, 19/mai").
- [ ] Para "Dia inteiro" usar badge/chip ao invés de texto livre.
- [ ] Mostrar duração em horas quando for bloqueio parcial (ex: "2h").
- [ ] Empty state ilustrado quando não há bloqueios futuros.
- [ ] Ações (excluir, editar futuro) acessíveis e claras em mobile.
- [ ] Skeleton enquanto carrega.

---

## 4. Outros (descobertos durante os testes)

- [ ] F6 — Backend offline: garantir que o `apiErrorInterceptor` produz um
      snackbar "Sem conexão" amigável (testar com backend down).
- [ ] F6 — Token expirado: validar que o fluxo de `invalidarSessao('expirou')`
      mostra snackbar e redireciona corretamente.

---

## Sugestão de priorização

1. **Alta**: 2.1 (feedback visual no modal bloqueio) — fix de UX que já bloqueou usuário em teste.
2. **Média**: 2.2 (padronização do modal) — coerência com o restante do app.
3. **Média**: 1 (listagem serviços) — área mais usada.
4. **Baixa**: 3 (listagem bloqueios) — funcionalidade menos frequente.


Excluir serviço: A mensagem que chega ao usuário é diferente da esperada.
  A mensagem recebida: Erro ao excluir serviço. Tente novamente.
  A mensagem esperada: Não é possível excluir: serviço possui agendamentos vinculados.


Atualizar Botões:
  Buscar botões de Salvar, Entrar, Criar, Atualizar, Editar, Confirmar, Adicionar e outra ação do tipo e padronizar o tipo e a cor para verde igual ao "+ Adiciona bloqueio". 

  Botões de Excluir: Padronizar as cores e formatos igual ao botão "x Recusar"

