import { Component, input, output, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'syl-switch',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SylSwitchComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="syl-switch-label" [class.syl-switch-disabled]="disabled()">
      <input
        type="checkbox"
        [checked]="checked"
        [disabled]="disabled()"
        (change)="onToggle($event)"
        class="syl-switch-native"
        role="switch"
        [attr.aria-checked]="checked"
      />
      <span class="syl-switch-track" [class.syl-switch-checked]="checked">
        <span class="syl-switch-thumb"></span>
      </span>
      <span class="syl-switch-text">
        <ng-content />
      </span>
    </label>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .syl-switch-label {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      cursor: pointer;
      user-select: none;
      font-size: 0.875rem;
      color: var(--syl-text-primary, #ffffff);
    }

    .syl-switch-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .syl-switch-native {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .syl-switch-track {
      position: relative;
      width: 2.25rem;
      height: 1.25rem;
      border-radius: var(--syl-radius-full, 9999px);
      background-color: var(--syl-surface-tertiary, #2a2a32);
      border: 1px solid var(--syl-border, #3f3f46);
      transition: background-color 200ms ease, border-color 200ms ease;
    }

    .syl-switch-track.syl-switch-checked {
      background-color: var(--syl-accent, #e50914);
      border-color: var(--syl-accent, #e50914);
    }

    .syl-switch-thumb {
      position: absolute;
      top: 1px;
      left: 1px;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background-color: #ffffff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .syl-switch-track.syl-switch-checked .syl-switch-thumb {
      transform: translateX(1rem);
    }

    .syl-switch-native:focus-visible + .syl-switch-track {
      box-shadow: 0 0 0 2px var(--syl-bg), 0 0 0 4px var(--syl-accent);
    }
  `],
})
export class SylSwitchComponent implements ControlValueAccessor {
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
