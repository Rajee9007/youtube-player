import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'syl-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="syl-list" [class.syl-list-divided]="divided()">
      <ng-content />
    </ul>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .syl-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
    }

    .syl-list-divided ::ng-deep > li {
      border-bottom: 1px solid var(--syl-border, #27272a);
    }

    .syl-list-divided ::ng-deep > li:last-child {
      border-bottom: none;
    }
  `],
})
export class SylListComponent {
  readonly divided = input<boolean>(true);
}
