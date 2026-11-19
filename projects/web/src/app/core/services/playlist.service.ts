import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MockApiAdapter } from '../mock/mock-api.adapter';
import { Playlist } from '../../shared/models/playlist.model';

@Injectable({
  providedIn: 'root',
})
export class PlaylistService {
  private readonly api = inject(MockApiAdapter);

  getPlaylists(): Observable<Playlist[]> {
    return this.api.getPlaylists().pipe(map((res) => res.data));
  }

  getPlaylistBySlug(slug: string) {
    return this.api.getPlaylistBySlug(slug).pipe(map((res) => res.data));
  }
}
