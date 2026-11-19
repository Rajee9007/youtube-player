import { Component, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SylAvatarSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'syl-avatar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="syl-avatar"
      [class.syl-avatar-sm]="size() === 'sm'"
      [class.syl-avatar-md]="size() === 'md'"
      [class.syl-avatar-lg]="size() === 'lg'"
      [class.syl-avatar-xl]="size() === 'xl'"
      [attr.aria-label]="alt()"
    >
      @if (src() && !imageFailed()) {
        <img
          [src]="src()"
          [alt]="alt()"
          (error)="onImageError()"
          class="syl-avatar-img"
        />
      } @else {
        <span class="syl-avatar-fallback">{{ getInitials() }}</span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .syl-avatar {
      position: relative;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--syl-surface-secondary, #27272a);
      border: 1.5px solid var(--syl-border, #3f3f46);
      user-select: none;
    }

    .syl-avatar-sm {
      width: 1.75rem;
      height: 1.75rem;
      font-size: 0.6875rem;
    }
    .syl-avatar-md {
      width: 2.25rem;
      height: 2.25rem;
      font-size: 0.8125rem;
    }
    .syl-avatar-lg {
      width: 3rem;
      height: 3rem;
      font-size: 1rem;
    }
    .syl-avatar-xl {
      width: 4.5rem;
      height: 4.5rem;
      font-size: 1.5rem;
    }

    .syl-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .syl-avatar-fallback {
      font-weight: 700;
      color: var(--syl-text-primary, #ffffff);
      text-transform: uppercase;
    }
  `],
})
export class SylAvatarComponent {
  readonly src = input<string | null>(null);
  readonly alt = input<string>('');
  readonly name = input<string>('');
  readonly size = input<SylAvatarSize>('md');

  readonly imageFailed = signal<boolean>(false);

  onImageError(): void {
    this.imageFailed.set(true);
  }

  getInitials(): string {
    const text = this.name() || this.alt() || '?';
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  }
}
