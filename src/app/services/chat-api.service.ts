import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomRequest } from '../models/room-request';
import { SearchReq } from '../models/user';
import { ChatRoom } from '../models/chat-room';

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {

  private baseUrl = 'http://localhost:7076';
  // private messageUrl = this.baseUrl+'/api/messages';
  private roomUrl = this.baseUrl+'/chat-room';
  constructor(private http: HttpClient) { }

  getMessages(chatRoomId: string, page: number=0, size: number=20): Observable<any> {
    return this.http.get<any>(this.roomUrl+'/messages/'+chatRoomId+'?page='+page+'&size='+size);
  }

  roomRequest(roomRequest: RoomRequest): Observable<any>{
    return this.http.post<any>(`${this.roomUrl}/room-request`, roomRequest);
  }
  roomRequestAcceptance(roomRequest: RoomRequest, acceptFlag: boolean = false): Observable<any>{
    return this.http.post<any>(this.roomUrl+'/room-request/acceptance?acceptFlag='+acceptFlag, roomRequest);
  }

  saveChatRoom(chatRoom: ChatRoom): Observable<any>{
    return this.http.post<any>(this.roomUrl+'/room/add', chatRoom);
  }
  updateChatRoom(chatRoom: ChatRoom): Observable<any>{
    return this.http.put<any>(this.roomUrl+'/room/update', chatRoom);
  }
  chatRoomById(roomId: string): Observable<any>{
    return this.http.get<any>(this.roomUrl+'/room/'+roomId);
  }

  searchRequestList(searcReq: SearchReq, receiveFlag: boolean = false, pageFlag: boolean = true): Observable<any> {
    return this.http.post<any>(this.roomUrl+'/room-request/search?pageFlag='+pageFlag+'&receiveFlag='+receiveFlag, searcReq);
  }
  searchChatRoomList(searcReq: SearchReq, pageFlag: boolean = true): Observable<any> {
    return this.http.post<any>(this.roomUrl+'/room/search?pageFlag='+pageFlag, searcReq);
  }
}
