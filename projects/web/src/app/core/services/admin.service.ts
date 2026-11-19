import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MockApiAdapter } from '../mock/mock-api.adapter';
import { Channel, CreateChannelDto } from '../../shared/models/channel.model';
import { Video, CreateVideoDto } from '../../shared/models/video.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly api = inject(MockApiAdapter);

  getAllChannels(): Observable<Channel[]> {
    return this.api.getAllChannelsAdmin().pipe(map((res) => res.data));
  }

  saveChannel(dto: CreateChannelDto, id?: string): Observable<Channel> {
    return this.api.saveChannel(dto, id).pipe(map((res) => res.data));
  }

  getAllVideos(): Observable<Video[]> {
    return this.api.getAllVideosAdmin().pipe(map((res) => res.data));
  }

  saveVideo(dto: CreateVideoDto, id?: string): Observable<Video> {
    return this.api.saveVideo(dto, id).pipe(map((res) => res.data));
  }

  deleteVideo(id: string): Observable<boolean> {
    return this.api.deleteVideo(id).pipe(map((res) => res.data));
  }

  togglePublish(id: string): Observable<Video> {
    return this.api.togglePublishVideo(id).pipe(map((res) => res.data));
  }
}
