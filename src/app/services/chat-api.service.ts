import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomRequest } from '../models/room-request';

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {

  private baseUrl = 'http://localhost:7076';
  private messageUrl = this.baseUrl+'/api/messages';
  private roomUrl = this.baseUrl+'/chat-rooms';
  constructor(private http: HttpClient) { }

  getMessages(chatRoomId: string, page: number, size: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.messageUrl}/${chatRoomId}?page=${page}&size=${size}`);
  }

  roomRequest(roomRequest: RoomRequest){
    return this.http.post<any>(`${this.roomUrl}/room-request`, roomRequest);
  }
}
