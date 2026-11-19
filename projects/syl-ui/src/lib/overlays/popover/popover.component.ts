import { Component, input, signal, ElementRef, HostListener, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-popover',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-popover-wrapper">
      <div (click)="toggle()" class="syl-popover-trigger">
        <ng-content select="[sylPopoverTrigger]" />
      </div>
      @if (isOpen()) {
        <div class="syl-popover-panel">
          <ng-content />
        </div>
      }
    </div>
  `,
  styles: [`
    .syl-popover-wrapper {
      position: relative;
      display: inline-block;
    }

    .syl-popover-trigger {
      display: inline-flex;
    }

    .syl-popover-panel {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      padding: 1rem;
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-md, 0.5rem);
      box-shadow: var(--syl-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.5));
    }
  `],
})
export class SylPopoverComponent {
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
