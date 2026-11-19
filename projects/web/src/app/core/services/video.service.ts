import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MockApiAdapter } from '../mock/mock-api.adapter';
import { VideoDetailViewModel } from '../../shared/models/video.model';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private readonly api = inject(MockApiAdapter);

  getHomeData() {
    return this.api.getHomeData().pipe(map((res) => res.data));
  }

  getVideos(query?: { channelSlug?: string; categorySlug?: string; tag?: string }): Observable<VideoDetailViewModel[]> {
    return this.api.getVideos(query).pipe(map((res) => res.data));
  }

  getVideoBySlug(slug: string) {
    return this.api.getVideoBySlug(slug).pipe(map((res) => res.data));
  }
}
