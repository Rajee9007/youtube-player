import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { adminAuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // Public Portal
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'channels',
        loadComponent: () =>
          import('./features/channels/channel-list.component').then((m) => m.ChannelListComponent),
      },
      {
        path: 'channels/:slug',
        loadComponent: () =>
          import('./features/channels/channel-detail.component').then((m) => m.ChannelDetailComponent),
      },
      {
        path: 'videos/:slug',
        loadComponent: () =>
          import('./features/videos/video-detail.component').then((m) => m.VideoDetailComponent),
      },
      {
        path: 'playlists',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: 'playlists/:slug',
        loadComponent: () =>
          import('./features/playlists/playlist-detail.component').then((m) => m.PlaylistDetailComponent),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./features/search/search.component').then((m) => m.SearchComponent),
      },
      {
        path: 'design-system',
        loadComponent: () =>
          import('./features/design-system/design-system.component').then((m) => m.DesignSystemComponent),
      },
      {
        path: 'multi-video-player',
        loadComponent: () =>
          import('./features/multi-video-player/multi-video-player.component').then(
            (m) => m.MultiVideoPlayerComponent
          ),
      },
    ],
  },

  // Admin Login
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./features/admin-login/admin-login.component').then((m) => m.AdminLoginComponent),
  },

  // Protected Admin Portal
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminAuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'channels',
        loadComponent: () =>
          import('./features/admin-channels/admin-channels.component').then(
            (m) => m.AdminChannelsComponent
          ),
      },
      {
        path: 'videos',
        loadComponent: () =>
          import('./features/admin-videos/admin-videos.component').then(
            (m) => m.AdminVideosComponent
          ),
      },
      {
        path: 'playlists',
        loadComponent: () =>
          import('./features/admin-playlists/admin-playlists.component').then(
            (m) => m.AdminPlaylistsComponent
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin-categories/admin-categories.component').then(
            (m) => m.AdminCategoriesComponent
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin-settings/admin-settings.component').then(
            (m) => m.AdminSettingsComponent
          ),
      },
    ],
  },

  // Fallback
  {
    path: '**',
    redirectTo: '',
  },
];
