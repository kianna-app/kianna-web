import { Component, Input } from '@angular/core'
import { AbstractControl } from '@angular/forms'
import { getErrorMessage } from '@core/validators/error-messages'

@Component({
  selector: 'app-field-error',
  standalone: true,
  template: `
    @if (control?.invalid && control?.touched) {
      <span class="field-error">{{ message }}</span>
    }
  `,
  styles: [`
    .field-error {
      font: 400 12px 'Inter', sans-serif;
      color: #E26172;
      display: block;
      margin-top: 2px;
    }
  `],
})
export class FieldErrorComponent {
  @Input() control?: AbstractControl | null
  get message(): string { return this.control ? getErrorMessage(this.control) : '' }
}
