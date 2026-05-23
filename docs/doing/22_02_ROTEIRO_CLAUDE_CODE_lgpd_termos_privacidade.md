# ROTEIRO CLAUDE CODE — Páginas LGPD (/termos e /privacidade)

**Objetivo:** Criar as páginas legais `/termos` (Termos de Uso) e `/privacidade` (Política de Privacidade) no app Angular do Kianna, em nível **placeholder funcional** — estrutura completa e juridicamente coerente, com marcadores para preencher depois. Não é a versão jurídica final; é a base navegável que será revisada por advogado antes da cobrança.

> **Nota de contexto para você (Claude Code):** você conhece o sistema. Escolha a melhor implementação dentro do padrão real do projeto (Angular standalone moderno). Este roteiro trava o **conteúdo obrigatório** e os **pontos de atenção do caso Kianna**, mas a forma (estrutura de pastas, design system, como o layout/rodapé já é montado) fica a seu critério, seguindo o que já existe no repo.

---

## Liberdade de implementação (você decide)

- Onde colocar os componentes (siga a convenção de pastas/feature já usada no projeto, ex.: como `/admin` foi estruturado).
- Estilo visual: reaproveite o design system / tokens / componentes de layout existentes. Páginas legais devem ser **legíveis** (largura de leitura confortável, tipografia de corpo de texto, headings claros, âncoras se quiser).
- Standalone components + rotas lazy no `app.routes.ts` (padrão moderno). Use o que já for o padrão do repo.
- Se já existe um componente de "página de conteúdo" ou layout público reaproveitável, use-o em vez de criar do zero.

## Requisitos travados (não pule)

1. **Duas rotas públicas:** `/termos` e `/privacidade`. Acessíveis sem login (são páginas legais).
2. **Links no rodapé** do app (público e/ou dashboard, onde já houver footer) apontando para as duas páginas. Se não houver footer ainda, adicione um mínimo com esses dois links + ano.
3. **Placeholders visíveis e consistentes.** Use um padrão fácil de localizar com busca depois, por exemplo `[[RAZÃO SOCIAL]]`. Lista de marcadores na seção "Placeholders" abaixo. Não invente CNPJ, endereço ou e-mail reais.
4. **Banner/aviso de rascunho** no topo de cada página (um `<aside>` ou box discreto): texto tipo "Documento em elaboração — versão preliminar sujeita a revisão." Fácil de remover depois (deixe um comentário marcando).
5. **Data de "última atualização"** com placeholder `[[DATA_ATUALIZACAO]]`.
6. Conteúdo em **português do Brasil**.

---

## Pontos de atenção específicos do Kianna (importante — não é genérico)

O Kianna não processa só os dados do profissional (cliente direto). Ele processa **dados dos clientes finais** do profissional (nome, telefone, histórico de agendamento) e dispara mensagens via WhatsApp. Isso precisa estar refletido nos textos:

- **Relação controlador/operador:** em relação aos dados dos clientes finais, o profissional tende a ser o **controlador** e o Kianna **operador** (processa em nome dele). A Política de Privacidade precisa deixar esse papel explícito — é o que protege tanto o profissional quanto o Kianna. (Texto pode ser enxuto, mas a seção tem que existir.)
- **Sub-operadores / terceiros que processam dados:** citar que há prestadores que processam dados para operar o serviço — mensageria de WhatsApp e infraestrutura de hospedagem. **NÃO** escrever "Z-API" nem "Railway" nos textos voltados ao usuário (decisão de white-label do projeto: o profissional nunca vê o nome do fornecedor). Use termos genéricos: `[[PROVEDOR DE MENSAGERIA WHATSAPP]]` e `[[PROVEDOR DE INFRAESTRUTURA/HOSPEDAGEM]]`, ou simplesmente "provedores de mensageria e de infraestrutura". Deixe um comentário no código lembrando o motivo (white-label).
- **WhatsApp:** mencionar que o serviço envia notificações via WhatsApp aos clientes finais (confirmação, lembrete, etc.) e que isso depende do número conectado pelo profissional.
- **Transferência internacional:** como provedores podem processar dados fora do Brasil, incluir uma seção curta sobre isso (placeholder, sem afirmar local específico).

---

## Estrutura de conteúdo — Política de Privacidade (`/privacidade`)

Seções mínimas (texto curto por seção é aceitável neste nível placeholder):

1. **Quem somos / Controlador** — identificação do Kianna. Placeholders de razão social, CNPJ, endereço.
2. **Encarregado (DPO)** — nome/contato. Placeholder `[[ENCARREGADO_DPO]]` e `[[EMAIL_DPO]]`.
3. **Quais dados coletamos** — separar: (a) dados do profissional usuário; (b) dados dos clientes finais (nome, telefone, agendamentos) inseridos pelo profissional.
4. **Para que usamos / Finalidades** — operar agenda, página pública, envio de notificações via WhatsApp.
5. **Bases legais (LGPD art. 7º)** — execução de contrato, legítimo interesse, consentimento quando aplicável. Pode ser enxuto.
6. **Papel controlador x operador** — conforme ponto de atenção acima.
7. **Compartilhamento com terceiros / sub-operadores** — provedores de mensageria e infraestrutura (genérico, sem nome de fornecedor).
8. **Transferência internacional** — seção curta, placeholder.
9. **Retenção** — por quanto tempo guardamos. Placeholder de prazo.
10. **Direitos do titular (LGPD art. 18)** — acesso, correção, eliminação, portabilidade, revogação de consentimento; como exercer (e-mail de contato).
11. **Segurança** — medidas em linhas gerais.
12. **Cookies** — se o app usa, mencionar; senão, seção mínima.
13. **Contato** — `[[EMAIL_CONTATO]]`.
14. **Alterações desta política** + data de atualização.

## Estrutura de conteúdo — Termos de Uso (`/termos`)

1. **Aceitação dos termos.**
2. **Descrição do serviço** — agenda, página pública de agendamento, notificações via WhatsApp.
3. **Cadastro e conta** — responsabilidades do profissional sobre a própria conta.
4. **Responsabilidades do profissional sobre dados de terceiros** — o profissional declara ter base legal para inserir dados de seus clientes e para enviar mensagens a eles (importante: alinha com o papel de controlador dele).
5. **Uso aceitável** — proibição de spam / uso indevido da mensageria.
6. **Planos e pagamento** — placeholder; mencionar que valores/condições constam no plano contratado (não fixar preço aqui).
7. **Cancelamento e suspensão.**
8. **Limitação de responsabilidade** — incluindo dependência de serviços de terceiros (WhatsApp pode cair/indisponibilizar).
9. **Propriedade intelectual.**
10. **Alterações dos termos.**
11. **Lei aplicável e foro** — placeholders.
12. **Contato.**

---

## Placeholders (padrão único, fácil de buscar)

Use colchetes duplos para localizar tudo depois com um find:

```
[[RAZÃO SOCIAL]]
[[NOME FANTASIA / KIANNA]]
[[CNPJ]]
[[ENDEREÇO]]
[[EMAIL_CONTATO]]
[[ENCARREGADO_DPO]]
[[EMAIL_DPO]]
[[PRAZO_RETENÇÃO]]
[[FORO / COMARCA]]
[[PROVEDOR DE MENSAGERIA WHATSAPP]]
[[PROVEDOR DE INFRAESTRUTURA/HOSPEDAGEM]]
[[DATA_ATUALIZACAO]]
```

(Se preferir centralizar, pode extrair esses valores para uma constante/objeto único e referenciar nos dois componentes — facilita o preenchimento futuro num lugar só. Sua escolha.)

---

## Critérios de aceite (checklist final)

- [ ] `/termos` e `/privacidade` acessíveis sem login.
- [ ] Ambas listadas no `app.routes.ts` (lazy, padrão standalone).
- [ ] Links para as duas páginas no footer existente (ou footer mínimo criado).
- [ ] Banner de "rascunho/preliminar" no topo de cada página, com comentário marcando como removível.
- [ ] Todos os placeholders no padrão `[[ ]]`; nenhum dado real inventado.
- [ ] Nenhuma menção a nomes de fornecedores (sem "Z-API", sem "Railway") nos textos do usuário; comentário no código explicando o porquê (white-label).
- [ ] Seção controlador/operador presente na Política de Privacidade.
- [ ] Seção de direitos do titular (art. 18) presente.
- [ ] Páginas legíveis, reaproveitando o design system do projeto.
- [ ] Build passa sem erros.

---

## Aviso

Conteúdo em nível **placeholder funcional**, não é parecer jurídico. **Revisão por advogado(a) com OAB é necessária antes de iniciar cobrança**, em especial quanto ao enquadramento controlador/operador, bases legais e transferência internacional.
