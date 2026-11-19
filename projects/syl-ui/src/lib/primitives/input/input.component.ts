import {
  Component,
  Directive,
  input,
  output,
  ChangeDetectionStrategy,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Directive({
  selector: 'input[sylInput]',
  standalone: true,
  host: {
    '[class.syl-native-input]': 'true',
    '[class.syl-input-sm]': 'size() === "sm"',
    '[class.syl-input-md]': 'size() === "md"',
    '[class.syl-input-lg]': 'size() === "lg"',
    '[class.syl-input-invalid]': 'invalid()',
    '[disabled]': 'disabled()',
  },
})
export class SylInputDirective {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly invalid = input<boolean>(false);
  readonly disabled = input<boolean>(false);
}

@Component({
  selector: 'syl-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SylInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="syl-input-container"
      [class.syl-input-focused]="isFocused"
      [class.syl-input-disabled]="disabled()"
      [class.syl-input-invalid]="invalid()"
    >
      <ng-content select="[sylPrefix]" />
      <input
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [value]="value"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        class="syl-input-element"
      />
      @if (clearable() && value && !disabled() && !readonly()) {
        <button
          type="button"
          class="syl-clear-btn"
          (click)="clear()"
          aria-label="Clear input"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      }
      <ng-content select="[sylSuffix]" />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-input-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      background-color: var(--syl-surface-secondary, #18181b);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-md, 0.5rem);
      padding: 0 0.75rem;
      transition: all 150ms ease;
    }

    .syl-input-container:hover:not(.syl-input-disabled) {
      border-color: var(--syl-border-subtle, #3f3f46);
    }

    .syl-input-focused {
      border-color: var(--syl-accent, #e50914) !important;
      box-shadow: 0 0 0 1px var(--syl-accent, #e50914);
    }

    .syl-input-invalid {
      border-color: var(--syl-danger, #ef4444) !important;
    }

    .syl-input-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .syl-input-element {
      flex: 1;
      min-width: 0;
      padding: 0.5625rem 0;
      background: transparent;
      border: none;
      color: var(--syl-text-primary, #ffffff);
      font-size: 0.875rem;
      outline: none;
    }

    .syl-input-element::placeholder {
      color: var(--syl-text-muted, #71717a);
    }

    .syl-clear-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--syl-text-secondary, #a1a1aa);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: var(--syl-radius-full, 9999px);
    }

    .syl-clear-btn:hover {
      color: var(--syl-text-primary, #ffffff);
    }
  `],
})
export class SylInputComponent implements ControlValueAccessor {
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly clearable = input<boolean>(false);

  readonly valueChange = output<string>();

  value = '';
  isFocused = false;

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value = val ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
    this.valueChange.emit(val);
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  clear(): void {
    this.value = '';
    this.onChange('');
    this.valueChange.emit('');
  }
}
