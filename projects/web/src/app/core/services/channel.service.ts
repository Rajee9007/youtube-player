import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MockApiAdapter } from '../mock/mock-api.adapter';
import { Channel } from '../../shared/models/channel.model';
import { VideoDetailViewModel } from '../../shared/models/video.model';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private readonly api = inject(MockApiAdapter);

  getChannels(): Observable<Channel[]> {
    return this.api.getChannels().pipe(map((res) => res.data));
  }

  getChannelBySlug(slug: string): Observable<{ channel: Channel; videos: VideoDetailViewModel[] }> {
    return this.api.getChannelBySlug(slug).pipe(map((res) => res.data));
  }
}
