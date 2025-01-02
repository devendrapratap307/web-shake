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

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css'],
  providers: [MessageService]
})
export class ChatRoomComponent implements OnInit{
  @ViewChild('chatWindow') chatWindow!: ElementRef; 
  messages: ChatMessage[] = [];
  message: ChatMessage = new ChatMessage();
  isConnected: boolean = false;
  connectingMessage: string = '';
  currUser: any;
  chatRoomList: ChatRoom[] = [];
  selectedRow: number | null = null;
  selectedRoom: ChatRoom = new ChatRoom();
  subscription: Subscription | null = null;

  page = 0;
  size = 20;
  loading = false;
  currScrollValue: number =0;
  
  activeTab: number = 0;
  activeItem: MenuItem | undefined;
  items: MenuItem[] =  [
    { label: 'Chat', icon: 'pi pi-comments' },
    { label: 'Group Outlay', icon: 'pi pi-users' },
    { label: 'Self Outlay', icon: 'pi pi-user' }
  ];
  constructor(private webSocketService: WebSocketService, private chatApiService: ChatApiService, private authService: AuthService, private router: Router, private messageService: MessageService) {}

  ngOnInit() {
    this.activeItem = this.items[0];
    this.currUser = this.authService.getUserDetails();
    console.log("###=================",this.currUser);
    if(this.currUser?.userId){
      this.message.sender = this.currUser.userId;
      this.message.roomId = this.selectedRoom.id;
    } else {
      this.message.sender = '';
    }

    this.connectWebSocket();
  }

  connectWebSocket(){
    this.messages = [];
    this.page = 0;
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
        } 
        this.currScrollValue = newValue;
      });
    }
  }

  onActiveItemChange(event: MenuItem) {
    this.activeItem = event;
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
    if(this.selectedRoom.id){
      this.chatApiService.getMessages(this.selectedRoom.id, this.page, this.size).subscribe((newMessages) => {
        this.messages = [...newMessages.reverse(), ...this.messages];
        this.page++;
        this.loading = false;
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

  addMember(){

  }

  messageAlert(severityData: string = 'success', summaryData: string = 'Success', detailData:string) {
    this.messageService.add({ severity: severityData, summary: summaryData, detail: detailData });
  }

  getChatRoomList(chatRoomType: string, activeTab: number=0){
    console.log("chatRoomType====", chatRoomType);
    this.activeTab = activeTab;
    const search: SearchReq = new SearchReq();
    search.limit=10;
    search.page =0;
    search.participant = this.currUser?.userId;
    search.type=chatRoomType;
    if(search.participant){
      this.chatApiService.searchChatRoomList(search).subscribe(resp=>{
        if(resp && resp.status==200 && resp.data?.chatRoom?.dataList){
          this.chatRoomList = resp.data.chatRoom.dataList;
        }
      });
    }
  }

  selectMember(currRoom: ChatRoom, index: number): void {
    this.selectedRow = index;
    this.message.roomId = currRoom.id;
    this.selectedRoom = currRoom;
    this.destroySubscription();
    this.connectWebSocket();
    console.log('Selected selectedRoom:', currRoom);

    // Add logic to open chat or load messages
  }
  

}
