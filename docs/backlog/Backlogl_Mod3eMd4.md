# Planejamento Estratégico — Melhorias e Ajustes da Plataforma

## Contexto

Este documento organiza, estrutura e detalha os pontos de melhoria identificados na plataforma de agendamento, com foco em:

* Eliminar ambiguidades
* Definir comportamento esperado
* Antecipar problemas técnicos e de UX
* Facilitar a criação de taskcards executáveis
* Permitir implementação orientada por IA (Claude Code)
* Considerar aprendizados da análise estratégica de concorrentes

---

# Objetivo Principal

Criar taskcards claros, executáveis e sem ambiguidades, contendo:

* Contexto funcional
* Objetivo da funcionalidade
* Regras de negócio
* Fluxos esperados
* Possíveis problemas
* Critérios de aceite
* Sugestões de implementação

---

# Diretrizes Gerais

## Antes de implementar qualquer item

* Validar impacto na experiência do usuário
* Considerar escalabilidade futura
* Evitar retrabalho estrutural
* Definir regras de negócio explícitas
* Garantir consistência visual
* Considerar versão mobile
* Validar integração entre módulos

# 6. Cadastro de Profissionais

## Objetivo

Permitir múltiplos profissionais por empresa.

---

## Estrutura Inicial

### Obrigatórios

* Nome

### Opcionais

* Foto
* Descrição
* Contato

---

# Agenda do Profissional

## Pergunta Estratégica

O profissional:

* Possui agenda própria?
  OU
* Utiliza agenda padrão da empresa?

---

## Impacto Técnico

Agenda individual aumenta complexidade:

* Disponibilidade
* Conflito de horários
* Escalabilidade
* Regras de atendimento

---

## Serviços Atendidos

### Problema

Relacionar serviços manualmente pode ser trabalhoso.

# Endereço e Mapa

## Discussão Estratégica

### Opção 1 — Apenas texto

Mais simples e barato.

### Opção 2 — Integração com mapa

Mais profissional.

---

## Perguntas Importantes

* Google Maps é financeiramente viável?
* OpenStreetMap seria melhor?
* Precisamos autocomplete?
* Vale usar ViaCEP/Correios?

# 13. Módulo Admin

## Status

Avaliar se será iniciado agora ou posteriormente.

---

# Objetivo

Painel administrativo da plataforma.

---

# Funcionalidades

## Gestão de usuários

* Criar
* Editar
* Remover
* Permissões

---

## Gestão de planos

* Criar
* Editar
* Desativar

---

## Gestão de serviços

* Categorias
* Especialidades
* Serviços

---

## Logs

* Ações do sistema
* Auditoria

---

## Relatórios

* Receita
* Usuários ativos
* Serviços populares
* Conversão

---

# Riscos Estratégicos

## Se iniciar agora

### Vantagens

* Estrutura mais sólida
* Melhor governança

### Desvantagens

* Aumenta escopo
* Retarda MVP

---

## Sugestão Estratégica

Criar arquitetura preparada para Admin, mas implementar após validação inicial do MVP.

---

# Próximos Passos Recomendados

## Transformar cada seção em

### Taskcard contendo

* Contexto
* Objetivo
* Escopo
* Regras de negócio
* Fluxo
* Casos de erro
* Critérios de aceite
* Dependências técnicas
* Sugestão de implementação

---

# Prioridade Recomendada

## Fase 1 — Core do Produto

* Onboarding
* Link da empresa
* Cadastro de serviço
* Página de agendamento
* Agenda profissional

---

## Fase 2 — Retenção e Gestão

* Dashboard
* Configurações
* Assinaturas

---

## Fase 3 — Escala

* Admin
* Relatórios
* Métricas
* Automação
* Integrações externas
