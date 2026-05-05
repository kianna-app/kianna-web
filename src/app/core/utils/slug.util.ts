export function gerarSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // remove acentos
    .replace(/[^a-z0-9\s-]/g, '')    // remove especiais
    .trim()
    .replace(/\s+/g, '-')            // espaços → hífen
    .replace(/-+/g, '-')             // hífens duplicados
    .slice(0, 50);
}

export function slugComSufixo(slug: string, sufixo: number): string {
  return `${slug}-${sufixo}`;
}
