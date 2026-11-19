export type PublicationStatus = 'published' | 'draft' | 'unlisted';

export interface Video {
  id: string;
  youtubeVideoId: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  categoryIds: string[];
  tags: string[];
  durationSeconds: number;
  publicationStatus: PublicationStatus;
  isMadeForKids: boolean;
  publishedAt: string;
  featured: boolean;
  viewCount?: number;
}

export interface VideoDetailViewModel extends Video {
  channelName: string;
  channelLogoUrl: string;
  channelSubscribeUrl: string;
  categoryNames?: string[];
}

export type CreateVideoDto = Omit<Video, 'id' | 'slug'>;
export type UpdateVideoDto = Partial<CreateVideoDto>;
