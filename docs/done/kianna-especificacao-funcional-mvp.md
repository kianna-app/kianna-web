# Kianna — Especificação Funcional do Fluxo de Agendamento (MVP)

## Visão Geral

**Kianna** é um micro SaaS de agendamento online via WhatsApp para profissionais autônomos brasileiros.

O sistema permite que clientes solicitem horários através de uma página pública compartilhável, enquanto o profissional gerencia confirmações, recusas e reagendamentos manualmente através do painel administrativo.

---

# Objetivos do MVP

- Permitir solicitação de agendamentos sem criação de conta
- Simplificar o fluxo para clientes mobile
- Permitir controle manual do profissional
- Centralizar comunicação via WhatsApp
- Disponibilizar página pública compartilhável
- Possuir arquitetura simples e escalável para evolução futura

---

# Fluxo do Cliente

## Fluxo principal

```text
Selecionar serviço
→ Selecionar data
→ Selecionar horário
→ Informar nome e WhatsApp
→ Revisar informações
→ Enviar solicitação
→ Exibir confirmação
```

---

# Fluxo do Profissional

## Fluxo principal

```text
Recebe solicitação pendente
→ Analisa agenda
→ Confirma OU recusa
→ Cliente recebe atualização via WhatsApp
```

---

# Página Pública (`/:slug`)

## Requisitos

- SSR obrigatório
- Página pública sem login
- Meta tags dinâmicas
- Open Graph dinâmico
- URL compartilhável
- Mobile-first
- Página leve
- Busca de serviços
- Serviços ativos apenas

---

# Estrutura dos Serviços

## Regras

- 1 serviço = 1 duração
- 1 serviço = 1 preço
- 1 serviço = 1 modalidade
- Duração fixa
- Profissional pode editar duração manualmente
- Preço é apenas informativo
- Serviços desativados somem imediatamente da página pública
- Ordem automática de exibição

---

# Configuração de Agenda

## Configurações disponíveis

### Permitir múltiplos agendamentos simultâneos

Tipo:
```text
switch
```

Comportamento:
- Desabilitado:
  - apenas 1 atendimento confirmado por horário
- Habilitado:
  - múltiplas solicitações podem existir no mesmo horário
  - profissional decide manualmente quais confirmar

---

# Disponibilidade

## Regras

- Timezone configurável por profissional
- Antecedência mínima padrão: 24h
- Disponibilidade configurável por dia específico
- Possibilidade de múltiplos intervalos no mesmo dia
- Pausa global entre atendimentos
- Slots calculados em tempo real
- Apenas agendamentos confirmados bloqueiam horários

---

# Exemplos de Disponibilidade

## Exemplo simples

```text
Segunda:
08h às 18h
```

## Exemplo com múltiplos intervalos

```text
Segunda:
08h às 12h
14h às 18h
```

---

# Bloqueios de Agenda

## Tipos de bloqueio

### Bloqueio por data

Exemplo:
```text
15/05/2026
```

### Agenda lotada

Ação:
```text
Marcar dia como lotado
```

Efeito:
- Nenhum horário é exibido ao cliente naquele dia

---

# Horários Disponíveis

## Regras

- Horários exibidos com base na duração do serviço
- Horários calculados em tempo real
- Horários indisponíveis não aparecem
- Serviços sem horários disponíveis exibem mensagem informativa

Mensagem:
```text
Sem horários disponíveis
```

---

# Dados Coletados do Cliente

## Campos obrigatórios

- Nome
- WhatsApp

## Validação

- Número válido
- DDD obrigatório
- Utilizado para notificações e confirmação

---

# Fluxo de Solicitação

## Comportamento

Ao finalizar:
- sistema NÃO confirma automaticamente
- sistema cria solicitação pendente

Mensagem exibida:
```text
Solicitação enviada
```

---

# Status do Agendamento

## Status disponíveis

```text
pendente
confirmado
recusado
cancelado
reagendado
finalizado
nao_compareceu
```

---

# Regras dos Status

## pendente

- Criado após solicitação do cliente
- Não bloqueia horário

## confirmado

- Bloqueia horário
- Envia confirmação via WhatsApp

## recusado

- Necessário informar motivo

## reagendado

- Agendamento antigo permanece salvo
- Novo agendamento é criado

## finalizado

- Alterado automaticamente após término do horário

## nao_compareceu

- Alterado manualmente pelo profissional

---

# Reagendamento

## Regras

- Cliente e profissional podem iniciar reagendamento
- Cliente recebe link para selecionar novo horário
- Agendamento antigo permanece salvo
- Novo agendamento é criado

---

# Cancelamento

## Regras

- Apenas profissional cancela
- Histórico é mantido
- Cancelamento não remove registro

---

# Notificações WhatsApp

## Eventos

- Agendamento confirmado
- Agendamento recusado
- Agendamento reagendado
- Lembrete automático
- Confirmação de presença

---

# Confirmação de Presença

## Fluxo

Mensagem enviada:
```text
1 para confirmar presença
2 para cancelar
```

---

# Lembretes

## Configuração inicial

- 24h antes do atendimento

---

# Painel do Profissional

# Dashboard Inicial

## Exibir

- Próximos agendamentos
- Solicitações pendentes

---

# Agenda

## Visualizações

- Lista
- Calendário

---

# Ordenação

## Pendentes

Ordenação por:
```text
horário do atendimento
```

---

# Gestão de Agendamentos

## Ações disponíveis

- Confirmar
- Recusar
- Reagendar
- Cancelar
- Editar
- Criar manualmente

---

# Edição Manual

## Campos editáveis

- Serviço
- Data
- Horário
- Nome
- WhatsApp

---

# Notificações do Painel

## MVP

- Badge de solicitações pendentes

---

# CRM

## MVP

Não haverá:
- histórico do cliente
- métricas avançadas
- CRM

---

# Estrutura Multiempresa

## MVP

```text
1 conta = 1 empresa
```

---

# Estrutura Multiprofissional

## Futuro

- múltiplos profissionais por conta
- cada profissional possuirá agenda própria

---

# Plano Gratuito

## Regras

- Limite de 20 agendamentos por mês
- Agendamentos com status "não compareceu" continuam contabilizando

---

# Regras Técnicas

## SSR

Obrigatório para:
- SEO
- compartilhamento
- Open Graph

---

# Slug Redirect

## Regras

Se slug não encontrado:
```text
verificar tabela slug_redirects
→ se existir: redirect
→ se não existir: 404
```

---

# Estratégia Técnica de Disponibilidade

## MVP

- Cálculo em tempo real
- Sem cache complexo
- Sem reserva temporária de slot
- Sem lock distribuído

---

# Decisões Estratégicas do Produto

## O Kianna NÃO é

```text
agenda automática rígida
```

## O Kianna É

```text
agenda flexível com confirmação humana
```

---

# MVP — Escopo Inicial

## Incluído

- Página pública SSR
- Solicitação de agendamento
- Confirmação manual
- Disponibilidade configurável
- WhatsApp transacional
- Painel administrativo básico
- Reagendamento
- Bloqueios de agenda

---

# Pós-MVP

## Futuro

- CRM
- Multiempresa
- Múltiplos profissionais
- Métricas
- Faturamento
- Push notifications
- Analytics avançado
- Agenda compartilhada
