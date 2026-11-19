import { Component, input, output, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'syl-radio',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SylRadioComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="syl-radio-label" [class.syl-radio-disabled]="disabled()">
      <input
        type="radio"
        [name]="name()"
        [value]="value()"
        [checked]="modelValue === value()"
        [disabled]="disabled()"
        (change)="onSelect()"
        class="syl-radio-native"
      />
      <span class="syl-radio-circle" [class.syl-radio-checked]="modelValue === value()">
        <span class="syl-radio-dot"></span>
      </span>
      <span class="syl-radio-text">
        <ng-content />
      </span>
    </label>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .syl-radio-label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
      font-size: 0.875rem;
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-radio-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .syl-radio-native {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .syl-radio-circle {
      width: 1.125rem;
      height: 1.125rem;
      border-radius: 50%;
      border: 1.5px solid var(--syl-border, #3f3f46);
      background-color: var(--syl-surface-secondary, #18181b);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 150ms ease;
    }

    .syl-radio-circle.syl-radio-checked {
      border-color: var(--syl-accent, #e50914);
    }

    .syl-radio-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background-color: var(--syl-accent, #e50914);
      transform: scale(0);
      transition: transform 150ms ease;
    }

    .syl-radio-circle.syl-radio-checked .syl-radio-dot {
      transform: scale(1);
    }

    .syl-radio-native:focus-visible + .syl-radio-circle {
      box-shadow: 0 0 0 2px var(--syl-bg), 0 0 0 4px var(--syl-accent);
    }
  `],
})
export class SylRadioComponent implements ControlValueAccessor {
  readonly name = input<string>('');
  readonly value = input<any>(null);
  readonly disabled = input<boolean>(false);
  readonly selected = output<any>();

  modelValue: any = null;

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: any): void {
    this.modelValue = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onSelect(): void {
    if (this.disabled()) return;
    this.modelValue = this.value();
    this.onChange(this.modelValue);
    this.onTouched();
    this.selected.emit(this.modelValue);
  }
}
