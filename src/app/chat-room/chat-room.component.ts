import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WebSocketService } from '../services/web-socket.service';
import { ChatApiService } from '../services/chat-api.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ChatMessage } from '../models/chat-message';
import { MenuItem, MessageService } from 'primeng/api';
import { OnlineStatus, SearchReq } from '../models/user';
import { ChatRoom } from '../models/chat-room';
import { Subscription } from 'rxjs';
import { LoaderService } from '../services/loader.service';
import { ROOM_TYPE_CHAT } from '../data';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css'],
  providers: [MessageService]
})
export class ChatRoomComponent implements OnInit, OnDestroy, AfterViewInit{
  @ViewChild('chatWindow') chatWindow!: ElementRef; 
  roomMsgMap: Map<string, string[]> = new Map();
  messages: ChatMessage[] | any[] = [];
  msgNotifications: ChatMessage[] | any[] = [];
  onlineStatusList: OnlineStatus[] = [];
  message: ChatMessage = new ChatMessage();
  isConnected: boolean = false;
  connectingMessage: string = '';
  currUser: any;
  chatRoomList: ChatRoom[] = [];
  selectedRow: number | null = null;
  selectedRoom: ChatRoom = new ChatRoom();
  editChatRoom: ChatRoom = new ChatRoom();
  editedFlag: boolean = false;
  roomErrorList: string[] = [];
  subscription: Subscription | null = null;
  sideFlag: boolean = false;
  sentFlag: boolean = false;
  subscribedUsers: string[] = [];

  totalMsg: number = 0;
  page = 0;
  size = 20;
  loading = false;
  currScrollValue: boolean = false;
  
  activeTab: number = 0;
  // activeItem: MenuItem | undefined;
  tabList: MenuItem[] =  [
    { label: 'Chat', id: 'CHAT', icon: 'pi pi-comments' },
    { label: 'Group Outlay', id: 'GROUP', icon: 'pi pi-users' },
    { label: 'Self Outlay', id: 'SELF', icon: 'pi pi-user' }
  ];
  router = inject(Router);


  totalRooms: number =0;
  rowsPerPage = 20; 
  currentPage = 0; 

  constructor(private webSocketService: WebSocketService, private chatApiService: ChatApiService, private authService: AuthService, private messageService: MessageService, private loaderService: LoaderService) {}

  ngOnInit() {
    // this.activeItem = this.tabList[0];
    this.currUser = this.authService.getUserDetails();
    console.log("###=================",this.currUser);
    if(this.currUser?.userId){
      this.message.sender = this.currUser.userId;
      this.message.roomId = this.selectedRoom.id;
      this.getChatRoomList(undefined,0); // initial listing;
    } else {
      this.message.sender = '';
    }
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    // this.webSocketService.disconnect();
  }

  ngAfterViewInit(): void {
  }

  connectWebSocket(){
    this.messages = [];
    this.page = 0;
    this.totalMsg=0;

    this.webSocketService.connect();
    this.webSocketService.connectionStatus$.subscribe(connected =>{
      this.isConnected = connected;
      if(connected){
        this.connectingMessage = '';
        console.log("Connection established...");
      }
    });
    this.subscribeNewMessage();
    this.subscribeMsgNotification();
    this.subscribeStatus();
  }

  subscribeNewMessage(){
    if(this.message.sender && this.selectedRoom && this.selectedRoom.id){
      // this.webSocketService.connect(this.selectedRoom.id, this.message.sender);
      this.subscription = this.webSocketService.messages$.subscribe((message) => {
          if (message && message !='') {
            this.messages.push(message);
          }
      });
      
      // this.loadMessages(); // Initial load
      // this.subscribeToWebSocket();
      this.webSocketService.sharedValue$.subscribe((newValue) => {
        console.log('############sharedValue############################', this.currScrollValue, newValue);
        if(this.currScrollValue !== newValue){
          this.currScrollValue = newValue;
          this.scrollToBottom();
        } 
      });
    }
  }

  subscribeMsgNotification(){
    if(this.message.sender){
      this.webSocketService.msgNotify$.subscribe((msgNotification) => {
          if (msgNotification && msgNotification !='') {
            this.msgNotifications.push(msgNotification);
            if(this.selectedRoom?.id){
              this.clearNotification(this.selectedRoom.id);
            }
          }
      });
    }
  }

  subscribeStatus(){
    if(this.message.sender){
      this.webSocketService.onlineStatus$.subscribe((oStatus) => {
        const onlineStatus: OnlineStatus = oStatus;
          if (onlineStatus && onlineStatus.userId) {
            if(this.onlineStatusList?.length){
              this.onlineStatusList = this.onlineStatusList.filter(online=> online?.userId &&  online.userId != onlineStatus.userId);
            } else {
              this.onlineStatusList = [];
            }
            this.onlineStatusList.push(onlineStatus);
          }
      });
    }
  }

  onlineStatus(chatRoom: ChatRoom):boolean{
    let onlineFlag: boolean = false;
    if(chatRoom && this.currUser?.userId){
      let memberId: string| undefined = undefined;
      for(let pts of chatRoom.participants){
        if(pts?.id && pts.id != this.currUser?.userId){
          memberId = pts.id;
          break;
        }
      }
      if(memberId){
        if(this.onlineStatusList?.length){
          onlineFlag = this.onlineStatusList.some(status => status.userId && status.userId == memberId && status.onlineFlag);
        }
      }
    }
    return onlineFlag;
  }

  // onTabChange(event: MenuItem) {
  //   // this.activeItem = event;
  //   // this.selectedRoom = new ChatRoom();
  //   // if(this.activeItem && this.activeItem.id){
  //   //   this.getChatRoomList(this.activeItem.id);
  //   // }
  // }

  destroySubscription(){
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  sendMessage() {
    if(this.selectedRoom && this.selectedRoom?.id && this.message.content && this.message.sender && !this.sentFlag){
      this.sentFlag=true;
      this.message.roomId = this.selectedRoom?.id;
      this.webSocketService.sendMessage(this.message.roomId, this.message.sender, this.message.content);
      this.message.content = '';
      this.scrollToBottom();
      this.sentFlag=false;
    }
  }

  onScroll(event: any): void {
    const top = event.target.scrollTop;
    if (top === 0) { // Detect when scrolling to the top
      this.loadMessages();
    }
  }

  
  loadMessages() {
    console.log("==loadMessages====================", this.loading, this.selectedRoom.id, this.totalMsg, this.page,this.size)
    if (this.loading) return;
    
    if(this.selectedRoom.id && (!this.totalMsg || (this.totalMsg > (this.page)*this.size))){
      this.loaderService.loader(true);
      this.loading = true;
      this.chatApiService.getMessages(this.selectedRoom.id, this.page, this.size).subscribe((reponse) => {
        if(reponse && reponse.status ==200 && reponse.data && reponse.data?.roomMessage?.dataList?.length){
          let newMessages: ChatMessage[] = reponse.data.roomMessage.dataList;
          newMessages = newMessages.filter(msg => msg && msg?.content);
          if(newMessages){
            this.messages = [...(newMessages.reverse()), ...this.messages];
          }
          this.totalMsg = reponse.data.roomMessage.totalRow;
          if(!this.page){
            this.scrollToBottom();
          }
          this.page++;
        }
        this.loading = false;
        this.loaderService.loader(false);
      },
      (error)=>{
        this.loading = false;
        this.loaderService.loader(false);
      }
     );
    }
  }

  // subscribeToWebSocket() {
  //   if(this.selectedRoom.id){
  //     this.webSocketService.subscribeToMessages(this.selectedRoom.id).subscribe((message) => {
  //       this.messages.push(message);
  //     });
  //   }
  // }

  scrollToBottom(): void {
    console.log("###############################", this.selectedRoom.id, this.selectedRoom);
    try {
      setTimeout(() => {
        const chatWindow = this.chatWindow.nativeElement;
        chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to the exact bottom
      }, 0); // Defer execution to ensure the DOM is fully updated
    } catch (err) {
      console.error('Failed to scroll to bottom:', err);
    }
  }

  logout(){
    this.authService.removeToken();
    this.router.navigate(['']);
  }

  messageAlert(severityData: string = 'success', summaryData: string = 'Success', detailData:string) {
    this.messageService.add({ severity: severityData, summary: summaryData, detail: detailData });
  }

  onMemberScroll(event: any): void {
    const target = event.target;
    const scrollPosition = target.scrollTop + target.clientHeight;
    const scrollHeight = target.scrollHeight;
    if (scrollPosition >= scrollHeight - 10) {
      if(this.currentPage * this.rowsPerPage < this.totalRooms){
        this.getChatRoomList(undefined, this.currentPage +1);
      }
    }
  }

  getChatRoomList(chatRoomType: string | undefined, currPage: number=0, tabFlag: boolean = false){
    if(tabFlag){
      this.totalRooms = 0;
      this.currentPage = 0;
      this.chatRoomList =[];
      this.selectedRow = null;
    }
    this.selectedRoom = new ChatRoom();
    console.log("chatRoomType====", chatRoomType);
    const search: SearchReq = new SearchReq();
    search.limit= this.rowsPerPage;
    search.page = currPage;
    search.participant = this.currUser?.userId;
    search.type=chatRoomType;
    if(search.participant){
      this.loaderService.loader(true);
      this.totalRooms = 0;
      this.chatApiService.searchChatRoomList(search).subscribe(resp=>{
        if(resp && resp.status==200 && resp.data?.chatRoom?.dataList){
          this.chatRoomList = [...this.chatRoomList, ...resp.data.chatRoom.dataList];
          if(this.chatRoomList?.length){
            this.chatRoomList = this.chatRoomList.filter((room, index, self) => {
                return index === self.findIndex((r) => r.id === room.id);
            });
            ;
            this.chatRoomList.forEach(room=>{
              if(room.participants?.length){
                room.participants.forEach(pts=>{
                  if(pts && pts.id && pts.id != this.currUser?.userId && !this.subscribedUsers.includes(pts.id)){
                    this.subscribedUsers.push(pts.id);
                    this.webSocketService.onlineStatus(pts.id);
                  }
                })
              }
            })
          }
          this.totalRooms = resp.data.chatRoom.totalRow || this.totalRooms;
          this.currentPage = resp.data?.chatRoom?.pageCount ? resp.data.chatRoom.pageCount :0;
        }
        this.loaderService.loader(false);
      }
      ,
      (error)=>{
        this.loaderService.loader(false);
      }
    );
    }
  }

  getChatRoomById(roomId: string){
    if(roomId){
      this.loaderService.loader(true);
      this.editChatRoom = new ChatRoom();
      this.chatApiService.chatRoomById(roomId).subscribe(resp=>{
        if(resp && resp.status==200 && resp.data?.chatRoom){
          this.editChatRoom = resp.data?.chatRoom;
        }
        this.loaderService.loader(false);
      });
    }
  }

  updateChatRoom(chatRoom: ChatRoom){
    if(chatRoom && this.editedFlag && this.validateRoom()){
      this.loaderService.loader(true);
      this.editChatRoom = new ChatRoom();
      this.chatApiService.updateChatRoom(chatRoom).subscribe(resp=>{
        if(resp && resp.status==200 && resp.data?.chatRoom){
          // this.editChatRoom = resp.data?.chatRoom;
          this.editedFlag = false;
          this.sideFlag = false;
        }
        this.loaderService.loader(false);
      });
    }
  }

  validateRoom(): boolean{
    this.roomErrorList =[];
    if(!this.editChatRoom.roomName){
      this.roomErrorList.push("Group Name required.")
    }
    if(this.editChatRoom && this.editChatRoom.participants?.length){
      if(!this.editChatRoom.participants.some(pts => pts && pts.adminFlag)){
        this.roomErrorList.push("At least a memeber should be admin.");
      }
      if(!this.editChatRoom.participants.some(pts => pts && pts.id && pts.id == this.currUser?.userId)){
        this.roomErrorList.push("Not able to save.");
      }
    } else {
      this.roomErrorList.push("At least a memeber required.");
    }
    return !this.roomErrorList?.length;
  }

  selectMember(currRoom: ChatRoom, index: number): void {// room selected
    this.selectedRow = index;
    this.message.roomId = currRoom.id;
    this.selectedRoom = currRoom;

    this.page =0;
    this.totalMsg =0;
    this.messages = [];

    this.destroySubscription();
    if(this.selectedRoom?.id){
      this.webSocketService.unsubscribeOtherChatRoom(this.selectedRoom.id);
      this.webSocketService.subscribeChatRoom(this.selectedRoom.id);
      this.clearNotification(this.selectedRoom.id);
    }
    this.subscribeNewMessage();
    this.loadMessages();
    console.log('Selected selectedRoom:', currRoom);
  }

  notifyMsg(roomId: string): string {
    let msgCount: number = 0;
    if(roomId){
      if(this.msgNotifications.length && this.currUser && this.currUser.userId){
        this.msgNotifications.forEach(msgNote=>{
          if(msgNote && msgNote.content && msgNote.sender && msgNote.sender !=this.currUser.userId && msgNote.roomId == roomId){
            msgCount++;
          }
        })
      }
    }
    return msgCount ? msgCount+'' : '';
  }

  clearNotification(roomId: string){
    if(roomId && this.msgNotifications.length){
      this.msgNotifications = this.msgNotifications.filter(notes => notes?.roomId !=roomId);
    }
  }

  
  openSide(){
    this.sideFlag = true;
    this.editedFlag = false;
    if(this.selectedRoom.id){
      this.getChatRoomById(this.selectedRoom.id);
    }
  }
  roomAdminCheck(): boolean {
    let adminFlag: boolean = false;
    if(this.editChatRoom && this.editChatRoom.participants){
      adminFlag = this.selectedRoom.participants.some(pts => pts && pts.adminFlag && pts.id === this.currUser.userId);
    }
    return adminFlag;
  }

  adminCheck(): boolean {
    let adminFlag: boolean = false;
    if(this.editChatRoom && this.editChatRoom.participants){
      adminFlag = this.editChatRoom.participants.some(pts => pts && pts.adminFlag && pts.id === this.currUser.userId);
    }
    return adminFlag;
  }

  removeMember(memberId: string){
    if(memberId && this.editChatRoom.participants){
      this.editChatRoom.participants = this.editChatRoom.participants.filter(pts => pts && pts.id && pts.id !== memberId);
      this.editedFlag = true;
    }
  }
  adminMark(memberId: string , adminFlag: boolean = false){
    if(memberId && this.editChatRoom.participants){
      this.editChatRoom.participants.forEach(pts => {
        if(pts.id && pts.id == memberId){
          pts.adminFlag = adminFlag;
          this.editedFlag = true;
        }
      });
    }
  }

  onEmojiClick(event: any) {
    if(this.selectedRoom.id && event){
      if(!this.message.content){
        this.message.content = '';
      }
      this.message.content += event;
    }
  }


}
