# Resumo da Varredura do Sistema Kianna Web

O QUE O SISTEMA FAZ
🔐 Autenticação & Segurança
Login/Cadastro com email e senha via Supabase
Reset de senha
Guards de rota para proteção
Interceptor JWT automático
Session management

📅 Gestão de Agendamentos
Dashboard para visualizar agendamentos pendentes, confirmados, cancelados
CRUD completo de agendamentos
Múltiplos estados de agendamento (13 estados diferentes)
Detalhes individuais de agendamento
Timeline semanal de eventos

🛠️ Configuração de Serviços
CRUD de serviços (criar, editar, deletar)
Limite de serviços por plano
Modalidades: Presencial, Domiciliar, Online
Preço e duração configuráveis

⏰ Horários & Disponibilidade
Configuração de horários por dia da semana
Cálculo automático de slots disponíveis
Bloqueios de horários específicos
Suporte a timezone/fusão horária

📆 Calendário Interativo
Visualização em FullCalendar (week view, day view, list view)
Agendamentos visíveis no calendário
Filtros e interações (semana inicia segunda-feira)

👥 Página de Booking Público
Página dinâmica por slug do profissional
Seletor de serviço → data → horário
Validação de disponibilidade em tempo real
Confirmação de agendamento

🏢 Configurações do Profissional
Dados pessoais (nome, especialidade, bio, foto)
Endereço e dados de contato
Redes sociais
Perfil público
Dados da empresa

🎯 Landing Page Pública
Hero section
Features, como funciona, nichos
Depoimentos
Planos e preços
FAQ
CTA e conversão

📊 Relatórios (Placeholder)
Estrutura para estatísticas
Estrutura para cliente

O QUE ESTÁ FALTANDO / GAPS IDENTIFICADOS
❌ Testes Automatizados
Vitest está instalado mas nenhum teste foi criado
Sem cobertura de testes
Zero spec.ts files

❌ Integração de Pagamento
Stripe mencionado mas não implementado no frontend
Sem payment flow visível
Sem controle de planos/subscriptions efetivamente integrado

❌ Integração WhatsApp (Z-API)
Mencionada como implementação mas não visível no código frontend
Sem notificações automáticas via WhatsApp
Sem confirmação de agendamento por WhatsApp

❌ Notificações
Sem sistema de notificações implementado
Sem push notifications
Sem email transacional (aparentemente)

❌ Relatórios Avançados
Página de Relatórios é placeholder vazio
Sem analytics real
Sem exportação de dados (CSV, PDF)

❌ Gestão de Clientes
Página de Clientes é placeholder vazio
Sem CRUD de clientes
Sem histórico de agendamentos por cliente
Sem contatos/informações de cliente armazenadas

❌ Sistema de Planos/Subscriptions
Limite de serviços é definido em constantes (não dinâmico)
Sem upgrade/downgrade de plano real
Sem validação de limite aplicada dinamicamente
Sem controle de features por plano

❌ API Backend Documentada
Implementação de Z-API/Stripe no backend não é visível
Sem documentação de endpoints
Sem SDK/tipo do backend

## FALTA IMPLEMENTAR

APÓS TASKS APLICADAS

  1. Módulo 4 — WhatsApp Z-API
     (confirmação imediata + lembrete 24h — sem isso o produto não funciona no dia a dia)

PRÉ-LANÇAMENTO OBRIGATÓRIO (mas simples)
  4. Páginas /termos e /privacidade
  5. Deploy: Angular no Vercel + NestJS no Railway
  6. Testar fluxo completo do zero com 2-3 profissionais reais

PÓS-LANÇAMENTO / COM RECEITA
  7. Módulo 6 — Stripe + Pix (cobrança)
  8. Módulo 5 — Clientes e relatórios
  9. Testes automatizados
