import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  constructor() { }

  private loaderSubject = new Subject<boolean>();
  loaderState$ = this.loaderSubject.asObservable();

  loader(loaderFlag: boolean = false) {
    this.loaderSubject.next(loaderFlag);
  }
}
