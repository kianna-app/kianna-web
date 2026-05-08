import { AbstractControl, ValidationErrors } from '@angular/forms';

export function limparWhatsApp(valor: string): string {
  return (valor ?? '').replace(/\D/g, '');
}

export function whatsAppValido(valor: string): boolean {
  const digitos = limparWhatsApp(valor);
  return digitos.length === 10 || digitos.length === 11;
}

export function formatarWhatsApp(valor: string): string {
  const d = limparWhatsApp(valor);
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return valor;
}

export function whatsAppValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (!valor) return null;
  return whatsAppValido(valor) ? null : { whatsappInvalido: true };
}
