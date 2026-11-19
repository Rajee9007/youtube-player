import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Channel, CreateChannelDto, UpdateChannelDto } from '../../shared/models/channel.model';
import { Video, VideoDetailViewModel, CreateVideoDto, UpdateVideoDto } from '../../shared/models/video.model';
import { Playlist, CreatePlaylistDto, UpdatePlaylistDto } from '../../shared/models/playlist.model';
import { Category, CreateCategoryDto } from '../../shared/models/category.model';
import { ApiResponse, AuthSession } from '../../shared/models/api-response.model';
import { INITIAL_CHANNELS } from '../config/channel.config';
import { INITIAL_CATEGORIES, INITIAL_VIDEOS, INITIAL_PLAYLISTS } from './mock-data';

@Injectable({
  providedIn: 'root',
})
export class MockApiAdapter {
  private channels: Channel[] = [];
  private categories: Category[] = [];
  private videos: Video[] = [];
  private playlists: Playlist[] = [];

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    try {
      const savedCh = localStorage.getItem('syl_db_channels');
      this.channels = savedCh ? JSON.parse(savedCh) : [...INITIAL_CHANNELS];

      const savedCat = localStorage.getItem('syl_db_categories');
      this.categories = savedCat ? JSON.parse(savedCat) : [...INITIAL_CATEGORIES];

      const savedVid = localStorage.getItem('syl_db_videos');
      this.videos = savedVid ? JSON.parse(savedVid) : [...INITIAL_VIDEOS];

      const savedPl = localStorage.getItem('syl_db_playlists');
      this.playlists = savedPl ? JSON.parse(savedPl) : [...INITIAL_PLAYLISTS];
    } catch {
      this.channels = [...INITIAL_CHANNELS];
      this.categories = [...INITIAL_CATEGORIES];
      this.videos = [...INITIAL_VIDEOS];
      this.playlists = [...INITIAL_PLAYLISTS];
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem('syl_db_channels', JSON.stringify(this.channels));
      localStorage.setItem('syl_db_categories', JSON.stringify(this.categories));
      localStorage.setItem('syl_db_videos', JSON.stringify(this.videos));
      localStorage.setItem('syl_db_playlists', JSON.stringify(this.playlists));
    } catch (err) {
      console.warn('Unable to save state to localStorage', err);
    }
  }

  // --- HOME ---
  getHomeData(): Observable<ApiResponse<{
    featuredVideo: VideoDetailViewModel | null;
    channels: Channel[];
    trendingVideos: VideoDetailViewModel[];
    latestVideos: VideoDetailViewModel[];
    featuredPlaylists: Playlist[];
    categories: Category[];
  }>> {
    const published = this.videos.filter((v) => v.publicationStatus === 'published');
    const featuredVid = published.find((v) => v.featured) || published[0] || null;

    const data = {
      featuredVideo: featuredVid ? this.toDetailViewModel(featuredVid) : null,
      channels: this.channels.filter((c) => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
      trendingVideos: published.slice(0, 8).map((v) => this.toDetailViewModel(v)),
      latestVideos: published.slice().reverse().slice(0, 8).map((v) => this.toDetailViewModel(v)),
      featuredPlaylists: this.playlists.filter((p) => p.isPublished),
      categories: [...this.categories],
    };

    return of({ success: true, data, message: 'Home data retrieved successfully' }).pipe(delay(50));
  }

  // --- CHANNELS ---
  getChannels(): Observable<ApiResponse<Channel[]>> {
    const list = this.channels.filter((c) => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
    return of({ success: true, data: list, message: 'Channels fetched' }).pipe(delay(30));
  }

  getChannelBySlug(slug: string): Observable<ApiResponse<{ channel: Channel; videos: VideoDetailViewModel[] }>> {
    const ch = this.channels.find((c) => c.slug === slug);
    if (!ch) {
      return throwError(() => new Error(`Channel not found: ${slug}`));
    }
    const videos = this.videos
      .filter((v) => v.channelId === ch.id && v.publicationStatus === 'published')
      .map((v) => this.toDetailViewModel(v));

    return of({ success: true, data: { channel: ch, videos }, message: 'Channel details fetched' }).pipe(delay(30));
  }

  // --- VIDEOS ---
  getVideos(query?: { channelSlug?: string; categorySlug?: string; tag?: string }): Observable<ApiResponse<VideoDetailViewModel[]>> {
    let list = this.videos.filter((v) => v.publicationStatus === 'published');

    if (query?.channelSlug) {
      const ch = this.channels.find((c) => c.slug === query.channelSlug);
      if (ch) list = list.filter((v) => v.channelId === ch.id);
    }
    if (query?.categorySlug) {
      const cat = this.categories.find((c) => c.slug === query.categorySlug);
      if (cat) list = list.filter((v) => v.categoryIds?.includes(cat.id));
    }
    if (query?.tag) {
      list = list.filter((v) => v.tags?.includes(query.tag!));
    }

    return of({ success: true, data: list.map((v) => this.toDetailViewModel(v)), message: 'Videos fetched' }).pipe(delay(30));
  }

  getVideoBySlug(slug: string): Observable<ApiResponse<{
    video: VideoDetailViewModel;
    relatedVideos: VideoDetailViewModel[];
    channelVideos: VideoDetailViewModel[];
  }>> {
    const video = this.videos.find((v) => v.slug === slug);
    if (!video) {
      return throwError(() => new Error(`Video not found: ${slug}`));
    }

    const detail = this.toDetailViewModel(video);
    const related = this.videos
      .filter((v) => v.id !== video.id && v.publicationStatus === 'published')
      .slice(0, 6)
      .map((v) => this.toDetailViewModel(v));
    const channelVideos = this.videos
      .filter((v) => v.id !== video.id && v.channelId === video.channelId && v.publicationStatus === 'published')
      .slice(0, 6)
      .map((v) => this.toDetailViewModel(v));

    return of({
      success: true,
      data: { video: detail, relatedVideos: related, channelVideos },
      message: 'Video retrieved',
    }).pipe(delay(30));
  }

  // --- SEARCH ---
  search(q: string, filter?: { channelId?: string; categoryId?: string }): Observable<ApiResponse<VideoDetailViewModel[]>> {
    const query = (q || '').trim().toLowerCase();
    let res = this.videos.filter((v) => v.publicationStatus === 'published');

    if (query) {
      res = res.filter((v) =>
        v.title.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query) ||
        v.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (filter?.channelId) {
      res = res.filter((v) => v.channelId === filter.channelId);
    }
    if (filter?.categoryId) {
      res = res.filter((v) => v.categoryIds?.includes(filter.categoryId!));
    }

    return of({ success: true, data: res.map((v) => this.toDetailViewModel(v)), message: 'Search results' }).pipe(delay(40));
  }

  // --- PLAYLISTS ---
  getPlaylists(): Observable<ApiResponse<Playlist[]>> {
    return of({ success: true, data: this.playlists.filter((p) => p.isPublished), message: 'Playlists fetched' }).pipe(delay(30));
  }

  getPlaylistBySlug(slug: string): Observable<ApiResponse<{ playlist: Playlist; videos: VideoDetailViewModel[]; channel: Channel | null }>> {
    const pl = this.playlists.find((p) => p.slug === slug);
    if (!pl) {
      return throwError(() => new Error(`Playlist not found: ${slug}`));
    }
    const ch = this.channels.find((c) => c.id === pl.channelId) || null;
    const vids = pl.videoIds
      .map((id) => this.videos.find((v) => v.id === id))
      .filter((v): v is Video => !!v)
      .map((v) => this.toDetailViewModel(v));

    return of({ success: true, data: { playlist: pl, videos: vids, channel: ch }, message: 'Playlist fetched' }).pipe(delay(30));
  }

  // --- CATEGORIES ---
  getCategories(): Observable<ApiResponse<Category[]>> {
    return of({ success: true, data: [...this.categories], message: 'Categories fetched' }).pipe(delay(20));
  }

  // --- ADMIN AUTH & MANAGEMENT ---
  adminLogin(password: string): Observable<ApiResponse<AuthSession>> {
    if (password === 'admin123' || password === 'seyyul2026') {
      const session: AuthSession = {
        user: {
          id: 'usr-admin',
          name: 'Seyyul Content Lead',
          email: 'admin@seyyul.com',
          role: 'admin',
        },
        token: 'syl_mock_jwt_token_valid',
      };
      return of({ success: true, data: session, message: 'Authenticated successfully' }).pipe(delay(50));
    }
    return throwError(() => new Error('Invalid administrative password. Try "admin123" or "seyyul2026".'));
  }

  getAllChannelsAdmin(): Observable<ApiResponse<Channel[]>> {
    return of({ success: true, data: [...this.channels], message: 'All channels' });
  }

  saveChannel(dto: CreateChannelDto, id?: string): Observable<ApiResponse<Channel>> {
    if (id) {
      const idx = this.channels.findIndex((c) => c.id === id);
      if (idx !== -1) {
        this.channels[idx] = { ...this.channels[idx], ...dto };
        this.saveState();
        return of({ success: true, data: this.channels[idx], message: 'Channel updated' });
      }
    }
    const newCh: Channel = {
      id: 'ch-' + Date.now(),
      ...dto,
    };
    this.channels.push(newCh);
    this.saveState();
    return of({ success: true, data: newCh, message: 'Channel created' });
  }

  getAllVideosAdmin(): Observable<ApiResponse<Video[]>> {
    return of({ success: true, data: [...this.videos], message: 'All videos' });
  }

  saveVideo(dto: CreateVideoDto, id?: string): Observable<ApiResponse<Video>> {
    const slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (id) {
      const idx = this.videos.findIndex((v) => v.id === id);
      if (idx !== -1) {
        this.videos[idx] = { ...this.videos[idx], ...dto, slug };
        this.saveState();
        return of({ success: true, data: this.videos[idx], message: 'Video updated' });
      }
    }
    const newVid: Video = {
      id: 'vid-' + Date.now(),
      slug,
      ...dto,
    };
    this.videos.unshift(newVid);
    this.saveState();
    return of({ success: true, data: newVid, message: 'Video registered' });
  }

  deleteVideo(id: string): Observable<ApiResponse<boolean>> {
    this.videos = this.videos.filter((v) => v.id !== id);
    this.saveState();
    return of({ success: true, data: true, message: 'Video deleted' });
  }

  togglePublishVideo(id: string): Observable<ApiResponse<Video>> {
    const vid = this.videos.find((v) => v.id === id);
    if (vid) {
      vid.publicationStatus = vid.publicationStatus === 'published' ? 'draft' : 'published';
      this.saveState();
      return of({ success: true, data: vid, message: `Video set to ${vid.publicationStatus}` });
    }
    return throwError(() => new Error('Video not found'));
  }

  // --- VIEW MODEL HELPER ---
  private toDetailViewModel(v: Video): VideoDetailViewModel {
    const ch = this.channels.find((c) => c.id === v.channelId);
    return {
      ...v,
      channelName: ch?.name || 'Seyyul Hub',
      channelLogoUrl: ch?.logoUrl || '',
      channelSubscribeUrl: ch?.subscribeUrl || 'https://www.youtube.com',
      categoryNames: v.categoryIds?.map((cid) => this.categories.find((c) => c.id === cid)?.name || cid) || [],
    };
  }
}
