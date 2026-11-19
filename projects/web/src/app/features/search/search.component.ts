import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../core/services/search.service';
import { ChannelService } from '../../core/services/channel.service';
import { CategoryService } from '../../core/services/category.service';
import { VideoDetailViewModel } from '../../shared/models/video.model';
import { Channel } from '../../shared/models/channel.model';
import { Category } from '../../shared/models/category.model';
import {
  SylInputComponent,
  SylSelectComponent,
  SylButtonComponent,
  SylVideoCardComponent,
  SylVideoGridComponent,
  SylEmptyStateComponent,
  SylSkeletonComponent,
} from '@seyyul/ui';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SylInputComponent,
    SylSelectComponent,
    SylButtonComponent,
    SylVideoCardComponent,
    SylVideoGridComponent,
    SylEmptyStateComponent,
    SylSkeletonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="syl-search-page">
      <div class="syl-search-header-panel">
        <h1 class="syl-search-title">Discover Videos</h1>

        <div class="syl-search-controls">
          <div class="syl-search-input-box">
            <syl-input
              [(ngModel)]="searchQuery"
              placeholder="Search by keywords, title, or topic..."
              [clearable]="true"
              (keydown.enter)="triggerSearch()"
            />
          </div>

          <div class="syl-filter-box">
            <syl-select
              [options]="channelOptions()"
              placeholder="All Channels"
              [(ngModel)]="selectedChannelId"
              (selectionChange)="triggerSearch()"
            />
          </div>

          <div class="syl-filter-box">
            <syl-select
              [options]="categoryOptions()"
              placeholder="All Categories"
              [(ngModel)]="selectedCategoryId"
              (selectionChange)="triggerSearch()"
            />
          </div>

          <syl-button variant="primary" (clicked)="triggerSearch()">
            Search
          </syl-button>
        </div>
      </div>

      <section class="syl-search-results">
        <div class="syl-results-meta">
          <span class="syl-results-count">
            Found {{ results().length }} video{{ results().length === 1 ? '' : 's' }}
            @if (searchQuery) {
              for "{{ searchQuery }}"
            }
          </span>
        </div>

        @if (loading()) {
          <syl-video-grid>
            @for (i of [1, 2, 3, 4, 5, 6]; track i) {
              <syl-skeleton height="220px" radius="0.75rem" />
            }
          </syl-video-grid>
        } @else if (results().length === 0) {
          <syl-empty-state
            title="No matching videos found"
            description="Try modifying your keywords or clearing channel and category filters."
          >
            <div sylEmptyActions>
              <syl-button variant="secondary" (clicked)="resetFilters()">
                Reset Filters
              </syl-button>
            </div>
          </syl-empty-state>
        } @else {
          <syl-video-grid>
            @for (v of results(); track v.id) {
              <syl-video-card
                [video]="v"
                (cardClick)="onWatch($event.slug)"
              />
            }
          </syl-video-grid>
        }
      </section>
    </div>
  `,
  styles: [`
    .syl-search-page {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .syl-search-header-panel {
      background-color: var(--syl-surface, #141417);
      border: 1px solid var(--syl-border, #27272a);
      border-radius: var(--syl-radius-lg, 1rem);
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .syl-search-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--syl-text-primary, #ffffff);
      margin: 0;
    }

    .syl-search-controls {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 0.75rem;
      align-items: center;
    }

    @media (max-width: 900px) {
      .syl-search-controls {
        grid-template-columns: 1fr;
      }
    }

    .syl-results-meta {
      margin-bottom: 1.25rem;
    }

    .syl-results-count {
      font-size: 0.875rem;
      color: var(--syl-text-secondary, #a1a1aa);
      font-weight: 500;
    }
  `],
})
export class SearchComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);
  private readonly channelService = inject(ChannelService);
  private readonly categoryService = inject(CategoryService);

  searchQuery = '';
  selectedChannelId: string | null = null;
  selectedCategoryId: string | null = null;

  readonly results = signal<VideoDetailViewModel[]>([]);
  readonly loading = signal<boolean>(false);
  readonly channelOptions = signal<{ label: string; value: any }[]>([]);
  readonly categoryOptions = signal<{ label: string; value: any }[]>([]);

  ngOnInit(): void {
    this.channelService.getChannels().subscribe((chs) => {
      this.channelOptions.set([
        { label: 'All Channels', value: null },
        ...chs.map((c) => ({ label: c.name, value: c.id })),
      ]);
    });

    this.categoryService.getCategories().subscribe((cats) => {
      this.categoryOptions.set([
        { label: 'All Categories', value: null },
        ...cats.map((c) => ({ label: c.name, value: c.id })),
      ]);
    });

    this.route.queryParams.subscribe((params) => {
      if (params['q'] !== undefined) {
        this.searchQuery = params['q'];
      }
      if (params['channelId'] !== undefined) {
        this.selectedChannelId = params['channelId'];
      }
      if (params['categoryId'] !== undefined) {
        this.selectedCategoryId = params['categoryId'];
      }
      this.performSearch();
    });
  }

  triggerSearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchQuery || null,
        channelId: this.selectedChannelId || null,
        categoryId: this.selectedCategoryId || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  private performSearch(): void {
    this.loading.set(true);
    this.searchService
      .search(this.searchQuery, {
        channelId: this.selectedChannelId || undefined,
        categoryId: this.selectedCategoryId || undefined,
      })
      .subscribe({
        next: (res) => {
          this.results.set(res);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedChannelId = null;
    this.selectedCategoryId = null;
    this.triggerSearch();
  }

  onWatch(slug: string): void {
    this.router.navigate(['/videos', slug]);
  }
}
