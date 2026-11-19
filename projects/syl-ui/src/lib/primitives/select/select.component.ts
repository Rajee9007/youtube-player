import { Component, input, output, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface SylSelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
}

@Component({
  selector: 'syl-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SylSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-select-wrapper" [class.syl-select-disabled]="disabled()" [class.syl-select-invalid]="invalid()">
      <select
        [disabled]="disabled()"
        [ngModel]="selectedValue"
        (ngModelChange)="onSelectionChange($event)"
        class="syl-select-element"
      >
        @if (placeholder()) {
          <option [ngValue]="null" disabled [selected]="selectedValue === null">{{ placeholder() }}</option>
        }
        @for (opt of options(); track opt.value) {
          <option [ngValue]="opt.value" [disabled]="opt.disabled">{{ opt.label }}</option>
        }
      </select>
      <div class="syl-select-arrow" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-select-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      background-color: var(--syl-surface-secondary, #18181b);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-md, 0.5rem);
      transition: all 150ms ease;
    }

    .syl-select-wrapper:hover:not(.syl-select-disabled) {
      border-color: var(--syl-border-subtle, #3f3f46);
    }

    .syl-select-wrapper:focus-within {
      border-color: var(--syl-accent, #e50914);
      box-shadow: 0 0 0 1px var(--syl-accent, #e50914);
    }

    .syl-select-invalid {
      border-color: var(--syl-danger, #ef4444) !important;
    }

    .syl-select-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .syl-select-element {
      width: 100%;
      padding: 0.5625rem 2.25rem 0.5625rem 0.75rem;
      background: transparent;
      border: none;
      color: var(--syl-text-primary, #ffffff);
      font-size: 0.875rem;
      appearance: none;
      outline: none;
      cursor: pointer;
    }

    .syl-select-element option {
      background-color: var(--syl-surface, #141417);
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-select-arrow {
      position: absolute;
      right: 0.75rem;
      pointer-events: none;
      color: var(--syl-text-secondary, #a1a1aa);
      display: flex;
      align-items: center;
    }
  `],
})
export class SylSelectComponent implements ControlValueAccessor {
  readonly options = input<SylSelectOption[]>([]);
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);

  readonly selectionChange = output<any>();

  selectedValue: any = null;

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: any): void {
    this.selectedValue = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onSelectionChange(val: any): void {
    this.selectedValue = val;
    this.onChange(val);
    this.onTouched();
    this.selectionChange.emit(val);
  }
}
