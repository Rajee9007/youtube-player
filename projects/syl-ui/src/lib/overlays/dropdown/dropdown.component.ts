import { Component, input, signal, ElementRef, HostListener, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-dropdown',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-dropdown-wrapper">
      <div (click)="toggle()" class="syl-dropdown-trigger">
        <ng-content select="[sylDropdownTrigger]" />
      </div>
      @if (isOpen()) {
        <div class="syl-dropdown-content" [class.syl-dropdown-right]="align() === 'right'">
          <ng-content />
        </div>
      }
    </div>
  `,
  styles: [`
    .syl-dropdown-wrapper {
      position: relative;
      display: inline-block;
    }

    .syl-dropdown-trigger {
      display: inline-flex;
    }

    .syl-dropdown-content {
      position: absolute;
      top: calc(100% + 0.375rem);
      left: 0;
      z-index: 1000;
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-md, 0.5rem);
      box-shadow: var(--syl-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.5));
      animation: syl-drop 150ms ease;
    }

    .syl-dropdown-right {
      left: auto;
      right: 0;
    }

    @keyframes syl-drop {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class SylDropdownComponent {
  readonly align = input<'left' | 'right'>('left');
  readonly isOpen = signal<boolean>(false);
  private readonly el = inject(ElementRef);

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}
