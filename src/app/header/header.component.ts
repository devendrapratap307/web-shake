import { Component } from '@angular/core';
import { WebSocketService } from '../services/web-socket.service';
import { SearchReq, User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { RoomRequest } from '../models/room-request';
import { PENDING } from '../data';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  user: any;
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

  reqUser: User | undefined;
  autoUserList: User[] = [];

  constructor(private webSocketService: WebSocketService, private authService: AuthService, private router: Router){
    this.user = this.authService.getUserDetails();
  }
  
  logout(){
    this.authService.removeToken();
    this.router.navigate(['']);
  }

  addMember(){
    
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
    this.reqUser = event;
  }
  onUserClear(event: any){
    this.reqUser = undefined;
    console.log("onUserClear---", event);
  }

  requestUser(){
    if(this.reqUser?.id && this.user?.userId){
      let newRequest: RoomRequest = new RoomRequest();
      newRequest.reqTo = this.reqUser?.id;
      newRequest.reqFrom = this.user?.userId;
      newRequest.status = PENDING;
    }
  }
}
