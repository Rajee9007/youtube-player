import { Component, input, output, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'syl-checkbox',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SylCheckboxComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="syl-checkbox-label" [class.syl-checkbox-disabled]="disabled()">
      <input
        type="checkbox"
        [checked]="checked"
        [disabled]="disabled()"
        (change)="onToggle($event)"
        class="syl-checkbox-native"
      />
      <span class="syl-checkbox-custom" [class.syl-checkbox-checked]="checked">
        @if (checked) {
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        }
      </span>
      <span class="syl-checkbox-text">
        <ng-content />
      </span>
    </label>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .syl-checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
      font-size: 0.875rem;
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-checkbox-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .syl-checkbox-native {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .syl-checkbox-custom {
      width: 1.125rem;
      height: 1.125rem;
      border-radius: var(--syl-radius-sm, 0.25rem);
      border: 1.5px solid var(--syl-border, #3f3f46);
      background-color: var(--syl-surface-secondary, #18181b);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 150ms ease;
      color: var(--syl-accent-foreground, #ffffff);
    }

    .syl-checkbox-label:hover:not(.syl-checkbox-disabled) .syl-checkbox-custom {
      border-color: var(--syl-text-secondary, #a1a1aa);
    }

    .syl-checkbox-custom.syl-checkbox-checked {
      background-color: var(--syl-accent, #e50914);
      border-color: var(--syl-accent, #e50914);
    }

    .syl-checkbox-native:focus-visible + .syl-checkbox-custom {
      box-shadow: 0 0 0 2px var(--syl-bg), 0 0 0 4px var(--syl-accent);
    }
  `],
})
export class SylCheckboxComponent implements ControlValueAccessor {
  readonly disabled = input<boolean>(false);
  readonly change = output<boolean>();

  checked = false;

  private onChange: (val: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: boolean): void {
    this.checked = !!val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onToggle(event: Event): void {
    if (this.disabled()) return;
    this.checked = (event.target as HTMLInputElement).checked;
    this.onChange(this.checked);
    this.onTouched();
    this.change.emit(this.checked);
  }
}
