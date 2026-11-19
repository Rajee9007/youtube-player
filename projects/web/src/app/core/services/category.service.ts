import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MockApiAdapter } from '../mock/mock-api.adapter';
import { Category } from '../../shared/models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly api = inject(MockApiAdapter);

  getCategories(): Observable<Category[]> {
    return this.api.getCategories().pipe(map((res) => res.data));
  }
}
