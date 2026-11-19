import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MockApiAdapter } from '../mock/mock-api.adapter';
import { VideoDetailViewModel } from '../../shared/models/video.model';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly api = inject(MockApiAdapter);

  search(q: string, filter?: { channelId?: string; categoryId?: string }): Observable<VideoDetailViewModel[]> {
    return this.api.search(q, filter).pipe(map((res) => res.data));
  }
}
