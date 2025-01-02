import { Component } from '@angular/core';
import { WebSocketService } from '../services/web-socket.service';
import { SearchReq, User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { RoomRequest } from '../models/room-request';
import { PENDING } from '../data';
import { ChatApiService } from '../services/chat-api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  currUser: any;
  visible: boolean = false;
  tabs: { title: string, value: number }[] = [
    { title: 'Requested', value: 1 },
    { title: 'Requestors', value: 2 }
  ];
  products: any[]= [
    {username:'c', status: "Pending"},
    {username:'d', status: "Accepted"},
    {username:'e', status: "Deny"},
    {username:'c', status: "Pending"},
    {username:'d', status: "Accepted"},
    {username:'e', status: "Deny"},
    {username:'c', status: "Pending"},
    {username:'d', status: "Accepted"},
    {username:'e', status: "Deny"},
    {username:'c', status: "Pending"},
    {username:'d', status: "Accepted"},
    {username:'e', status: "Deny"},
    {username:'c', status: "Pending"},
    {username:'d', status: "Accepted"},
    {username:'e', status: "Deny"},
    {username:'c', status: "Pending"},
    {username:'d', status: "Accepted"},
    {username:'e', status: "Deny"},
    {username:'c', status: "Pending"},
    {username:'d', status: "Accepted"},
    {username:'e', status: "Deny"},
  ];

  activeIdx: number = 0;
  requestList: RoomRequest[] = [];

  reqUser: User | undefined;
  autoUserList: User[] = [];

  constructor(private webSocketService: WebSocketService, private authService: AuthService, private chatApiService: ChatApiService, private router: Router){
    this.currUser = this.authService.getUserDetails();
  }
  
  logout(){
    this.authService.removeToken();
    this.router.navigate(['']);
  }

  openRequestDialog(){
    this.visible=true;
    this.requests();
  }

  searchUsers(event: any) {
    const query = event.query; // The user's input
    const search: SearchReq = new SearchReq();
    search.limit=10;
    search.page =0;
    search.label = query
    this.authService.searUserList(search).subscribe(resp=>{
      if(resp && resp.status==200 && resp.data?.user?.dataList){
        this.autoUserList=resp.data.user.dataList
      }
    });
  }
  onUserSelect(event: any){
    this.reqUser = event.value;
  }
  onUserClear(event: any){
    this.reqUser = undefined;
  }

  requestUser(){
    if(this.reqUser?.id && this.currUser?.userId){
      let newRequest: RoomRequest = new RoomRequest();
      newRequest.reqTo = this.reqUser?.id;
      newRequest.reqFrom = this.currUser?.userId;
      newRequest.status = PENDING;
      this.chatApiService.roomRequest(newRequest).subscribe(resp=>{
        if(resp && resp.status ==200){
          this.requests();
          this.reqUser = undefined;
        }
      });
    }
  }

  requests(receiveFlag: boolean = false){
    const search: SearchReq = new SearchReq();
    search.limit=10;
    search.page =0;
    search.participant = this.currUser?.userId;
    receiveFlag = this.activeIdx ? true : false;
    if(search.participant){
      this.chatApiService.searchRequestList(search, receiveFlag).subscribe(resp=>{
        if(resp && resp.status==200 && resp.data?.roomRequest?.dataList){
          this.requestList=resp.data.roomRequest.dataList;
        }
      });
    }
  }

  requestAcceptance(reqRow: RoomRequest,acceptFlag: boolean = false){
    if(reqRow.reqFrom && reqRow.reqTo && this.currUser?.userId){
      this.chatApiService.roomRequestAcceptance(reqRow, acceptFlag).subscribe(resp=>{
        if(resp && resp.status ==200){
          this.requests();
        }
      });
    }
  }
}
