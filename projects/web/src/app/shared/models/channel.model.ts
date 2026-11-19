export interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  youtubeChannelId: string;
  subscribeUrl: string;
  isActive: boolean;
  displayOrder: number;
}

export type CreateChannelDto = Omit<Channel, 'id'>;
export type UpdateChannelDto = Partial<CreateChannelDto>;
