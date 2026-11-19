import { Directive, ElementRef, HostListener, input, inject, Renderer2 } from '@angular/core';

@Directive({
  selector: '[sylTooltip]',
  standalone: true,
})
export class SylTooltipDirective {
  readonly sylTooltip = input<string>('');
  readonly tooltipPosition = input<'top' | 'bottom'>('top');

  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private tooltipEl: HTMLElement | null = null;

  @HostListener('mouseenter')
  onMouseEnter(): void {
    const text = this.sylTooltip();
    if (!text) return;

    this.tooltipEl = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipEl, 'syl-tooltip-bubble');
    this.renderer.appendChild(this.tooltipEl, this.renderer.createText(text));
    this.renderer.appendChild(document.body, this.tooltipEl);

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipEl!.getBoundingClientRect();

    let top = hostRect.top - tooltipRect.height - 8;
    if (this.tooltipPosition() === 'bottom' || top < 8) {
      top = hostRect.bottom + 8;
    }
    const left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;

    this.renderer.setStyle(this.tooltipEl, 'top', `${Math.max(8, top)}px`);
    this.renderer.setStyle(this.tooltipEl, 'left', `${Math.max(8, left)}px`);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.removeTooltip();
  }

  private removeTooltip(): void {
    if (this.tooltipEl) {
      this.renderer.removeChild(document.body, this.tooltipEl);
      this.tooltipEl = null;
    }
  }
}
