import { Component } from '@angular/core';
import { WebSocketService } from '../services/web-socket.service';
import { SearchReq, User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { RoomRequest } from '../models/room-request';
import { PENDING, ROOM_STATUS_ACTIVE, ROOM_TYPE_GROUP } from '../data';
import { ChatApiService } from '../services/chat-api.service';
import { ChatRoom, Participant } from '../models/chat-room';
import { LoaderService } from '../services/loader.service';

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
  groupFlag: boolean = false;
  newGroup: ChatRoom = new ChatRoom();

  activeIdx: number = 0;
  requestList: RoomRequest[] = [];
  totalRecords: number = 0;

  reqUser: User | undefined;
  autoUserList: User[] = [];

  constructor(private webSocketService: WebSocketService, private authService: AuthService, private chatApiService: ChatApiService, private router: Router, private loaderService: LoaderService){
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
      this.loaderService.loader(true);
      this.chatApiService.roomRequest(newRequest).subscribe(resp=>{
        if(resp && resp.status ==200){
          this.requests();
          this.reqUser = undefined;
        } else  {
          this.loaderService.loader(false);
        }
      });
    }
  }

  requests(event: any= { first: 0, rows: 10 }, receiveFlag: boolean = false){
    const pageIndex = event.rows ? event.first / event.rows :0;
    const pageSize = event.rows ? event.rows : 10;
    const search: SearchReq = new SearchReq();
    search.limit= pageSize;
    search.page = pageIndex;
    search.participant = this.currUser?.userId;
    receiveFlag = this.activeIdx ? true : false;
    if(search.participant){
      this.loaderService.loader(true);
      this.chatApiService.searchRequestList(search, receiveFlag).subscribe(resp=>{
        if(resp && resp.status==200 && resp.data?.roomRequest?.dataList){
          this.requestList=resp.data.roomRequest.dataList;
          this.totalRecords = resp.data.roomRequest.totalRow ? resp.data.roomRequest.totalRow :0;
        }
        this.loaderService.loader(false);
      });
    }
  }

  requestAcceptance(reqRow: RoomRequest,acceptFlag: boolean = false){
    if(reqRow.reqFrom && reqRow.reqTo && this.currUser?.userId){
      this.loaderService.loader(true);
      this.chatApiService.roomRequestAcceptance(reqRow, acceptFlag).subscribe(resp=>{
        if(resp && resp.status ==200){
          this.requests();
        } else{
          this.loaderService.loader(false);
        }

      });
    }
  }

  openGroup(){
    this.groupFlag = true;
  }

  closeGroupDialog(){
    this.groupFlag = false;
  }

  addMember(){
    if(!this.newGroup?.members?.length){
      this.newGroup.members = [];
    }
    if(this.reqUser && this.reqUser.id){
      const foundFlag: boolean = this.newGroup.members.some(member=> member && member.id && this.reqUser && member.id == this.reqUser.id);
      if(!foundFlag){
        this.newGroup.members.push(this.reqUser);
      }
      this.reqUser = undefined;
    }
  }

  removeGroupMember(index: number){
    this.newGroup.members.splice(index, 1);
  }


  saveGroup(){
    if(this.currUser?.userId && this.newGroup && this.newGroup.roomName && this.newGroup.members.length){
      this.newGroup.participants = [];
      this.newGroup.onlyAdmin = false;
      this.newGroup.members.forEach(m=>{
        if(m?.id && !this.newGroup.participants.some(pcs=> pcs && pcs.id == m.id)){
          let participant: Participant = new Participant();
          participant.id = m.id;
          if(participant?.id === this.currUser?.userId || m?.adminFlag){
            participant.adminFlag = true;
          }
          this.newGroup.participants.push(participant);
        }
      });
      if(this.currUser?.userId){
        const foundFlag: boolean = this.newGroup.participants.some(participant=> participant && this.currUser && participant == this.currUser?.userId);
        if(!foundFlag){
          let participant: Participant = new Participant();
          participant.id = this.currUser?.userId;
          participant.adminFlag = true;
          this.newGroup.participants.push(participant);
        }
      }

      this.newGroup.status = ROOM_STATUS_ACTIVE;
      this.newGroup.type = ROOM_TYPE_GROUP;


      this.loaderService.loader(true);
      this.chatApiService.saveChatRoom(this.newGroup).subscribe(resp=>{
        if(resp && resp.status==200){
          this.closeGroupDialog();
        }
        this.loaderService.loader(false);
      });
    }
  }
}
