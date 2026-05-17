import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { limparWhatsApp } from '@core/utils/whatsapp.util'

export class KiannaValidators {

  static nome(): ValidatorFn[] {
    return [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
      (c: AbstractControl): ValidationErrors | null =>
        c.value && /\d/.test(c.value) ? { nomeInvalido: true } : null,
    ]
  }

  static whatsapp(): ValidatorFn[] {
    return [
      Validators.required,
      (c: AbstractControl): ValidationErrors | null => {
        const digits = limparWhatsApp(c.value || '')
        if (digits.length < 10 || digits.length > 11) return { wppInvalido: true }
        return null
      },
    ]
  }

  static preco(): ValidatorFn[] {
    return [
      Validators.required,
      Validators.min(0),
      (c: AbstractControl): ValidationErrors | null =>
        c.value !== null && c.value !== '' && !/^\d+(\.\d{1,2})?$/.test(String(c.value))
          ? { precoInvalido: true }
          : null,
    ]
  }

  static duracao(): ValidatorFn[] {
    return [Validators.required, Validators.min(5), Validators.max(480)]
  }

  static email(): ValidatorFn[] {
    return [Validators.required, Validators.email]
  }

  static slug(): ValidatorFn[] {
    return [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(60),
      Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    ]
  }
}
