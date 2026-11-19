export interface Playlist {
  id: string;
  title: string;
  slug: string;
  description: string;
  channelId: string;
  videoIds: string[];
  coverImage: string;
  isPublished: boolean;
}

export type CreatePlaylistDto = Omit<Playlist, 'id' | 'slug'>;
export type UpdatePlaylistDto = Partial<CreatePlaylistDto>;
