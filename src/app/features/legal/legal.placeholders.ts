// Placeholders centralizados das páginas legais (/termos e /privacidade).
// Conteúdo em nível placeholder funcional — preenchimento real deve ser feito
// após revisão por advogado(a) com OAB. Padrão [[ ]] para localizar com busca.
export const LEGAL_PLACEHOLDERS = {
  RAZAO_SOCIAL: '[[RAZÃO SOCIAL]]',
  NOME_FANTASIA: '[[NOME FANTASIA / KIANNA]]',
  CNPJ: '[[CNPJ]]',
  ENDERECO: '[[ENDEREÇO]]',
  EMAIL_CONTATO: '[[EMAIL_CONTATO]]',
  ENCARREGADO_DPO: '[[ENCARREGADO_DPO]]',
  EMAIL_DPO: '[[EMAIL_DPO]]',
  PRAZO_RETENCAO: '[[PRAZO_RETENÇÃO]]',
  FORO: '[[FORO / COMARCA]]',
  // Termos genéricos por decisão de white-label: o profissional não deve
  // ver "Z-API" nem "Railway" na UI.
  PROVEDOR_MENSAGERIA: '[[PROVEDOR DE MENSAGERIA WHATSAPP]]',
  PROVEDOR_INFRA: '[[PROVEDOR DE INFRAESTRUTURA/HOSPEDAGEM]]',
  DATA_ATUALIZACAO: '[[DATA_ATUALIZACAO]]',
} as const;
