import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { WebSocketService } from '../services/web-socket.service';
import { ChatApiService } from '../services/chat-api.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ChatMessage } from '../models/chat-message';
import { MenuItem, MessageService } from 'primeng/api';
import { SearchReq } from '../models/user';
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
export class ChatRoomComponent implements OnInit{
  @ViewChild('chatWindow') chatWindow!: ElementRef; 
  roomMsgMap: Map<string, string[]> = new Map();
  messages: ChatMessage[] = [];
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

  totalMsg: number = 0;
  page = 0;
  size = 20;
  loading = false;
  currScrollValue: boolean = false;
  
  activeTab: number = 0;
  activeItem: MenuItem | undefined;
  tabList: MenuItem[] =  [
    { label: 'Chat', code: 'CHAT', icon: 'pi pi-comments' },
    { label: 'Group Outlay', code: 'GROUP', icon: 'pi pi-users' },
    { label: 'Self Outlay', code: 'SELF', icon: 'pi pi-user' }
  ];


  totalRooms: number =0;
  rowsPerPage = 20; 
  currentPage = 0; 

  constructor(private webSocketService: WebSocketService, private chatApiService: ChatApiService, private authService: AuthService, private router: Router, private messageService: MessageService, private loaderService: LoaderService) {}

  ngOnInit() {
    this.activeItem = this.tabList[0];
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

  connectWebSocket(){
    this.messages = [];
    this.page = 0;
    this.totalMsg=0;

    if(this.message.sender && this.selectedRoom && this.selectedRoom.id){
      this.webSocketService.connect(this.selectedRoom.id, this.message.sender);
      this.subscription = this.webSocketService.messages$.subscribe((message) => {
          if (message && message !='') {
            this.messages.push(message);
          }
      });
      this.webSocketService.connectionStatus$.subscribe(connected =>{
        this.isConnected = connected;
        if(connected){
          this.connectingMessage = '';
          console.log("Connection established...");
        }
      });
      // this.loadMessages(); // Initial load
      // this.subscribeToWebSocket();
      this.webSocketService.sharedValue$.subscribe((newValue) => {
        if(this.currScrollValue != newValue){
          this.scrollToBottom();
          this.currScrollValue = newValue;
        } 
      });
    }
  }

  onTabChange(event: MenuItem) {
    this.activeItem = event;
    this.selectedRoom = new ChatRoom();
    if(this.activeItem && this.activeItem.code){
      this.getChatRoomList(this.activeItem.code);
    }
  }

  destroySubscription(){
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  sendMessage() {
    if(this.selectedRoom && this.selectedRoom?.id, this.message.content && this.message.sender){
      this.message.roomId = this.selectedRoom?.id;
      this.webSocketService.sendMessage(this.message.roomId, this.message.sender, this.message.content);
      this.message.content = '';
      this.scrollToBottom();
    }
  }

  onScroll(event: any): void {
    const top = event.target.scrollTop;
    if (top === 0) { // Detect when scrolling to the top
      this.loadMessages();
    }
  }

  
  loadMessages() {
    if (this.loading) return;
    this.loading = true;
    if(this.selectedRoom.id && (!this.totalMsg || (this.totalMsg > (this.page+1)*this.size))){
      this.loaderService.loader(true);
      this.chatApiService.getMessages(this.selectedRoom.id, this.page, this.size).subscribe((reponse) => {
        if(reponse && reponse.status ==200 && reponse.data && reponse.data?.roomMessage?.dataList?.length){
          let newMessages: ChatMessage[] = reponse.data.roomMessage.dataList;
          newMessages = newMessages.filter(msg => msg && msg?.content);
          if(newMessages){
            this.messages = [...(newMessages), ...this.messages];
          }
          this.totalMsg = reponse.data.roomMessage.totalRow;
        }
        this.page++;
        this.loading = false;
        this.loaderService.loader(false);
      });
    }
  }

  subscribeToWebSocket() {
    if(this.selectedRoom.id){
      this.webSocketService.subscribeToMessages(this.selectedRoom.id).subscribe((message) => {
        this.messages.push(message);
      });
    }
  }

  scrollToBottom(): void {
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
      if((this.currentPage +1) * this.rowsPerPage < this.totalRooms){
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
          }
          this.totalRooms = resp.data.chatRoom.totalRow || this.totalRooms;
          this.currentPage = resp.data?.chatRoom?.pageCount ? resp.data.chatRoom.pageCount :0;
        }
        this.loaderService.loader(false);
      });
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
    this.destroySubscription();
    this.connectWebSocket();
    this.messages = [];
    this.loadMessages();
    console.log('Selected selectedRoom:', currRoom);

    // Add logic to open chat or load messages
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

}
