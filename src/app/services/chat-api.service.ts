import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {

  private baseUrl = 'http://localhost:7076/api/messages';
  constructor(private http: HttpClient) { }

  getMessages(chatRoomId: string, page: number, size: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${chatRoomId}?page=${page}&size=${size}`);
  }
}
