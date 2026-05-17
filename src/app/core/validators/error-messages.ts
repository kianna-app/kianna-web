import { AbstractControl } from '@angular/forms'

export const ERROR_MESSAGES: Record<string, string | ((params: any) => string)> = {
  required:         'Campo obrigatório.',
  minlength:        (p) => `Mínimo ${p.requiredLength} caracteres.`,
  maxlength:        (p) => `Máximo ${p.requiredLength} caracteres.`,
  min:              (p) => `Valor mínimo: ${p.min}.`,
  max:              (p) => `Valor máximo: ${p.max}.`,
  email:            'E-mail inválido.',
  pattern:          'Formato inválido.',
  nomeInvalido:     'Nome não pode conter números.',
  wppInvalido:      'WhatsApp inválido. Informe DDD + número (10 ou 11 dígitos).',
  whatsappInvalido: 'WhatsApp inválido. Informe DDD + número (10 ou 11 dígitos).',
  precoInvalido:    'Preço inválido. Use até 2 casas decimais.',
  jaCadastrado:     'Este número já está cadastrado em outra conta.',
}

export function getErrorMessage(control: AbstractControl): string {
  if (!control.errors) return ''
  const key = Object.keys(control.errors)[0]
  const msg = ERROR_MESSAGES[key]
  if (!msg) return 'Campo inválido.'
  return typeof msg === 'function' ? msg(control.errors[key]) : msg
}
