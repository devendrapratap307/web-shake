import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { WebSocketService } from '../services/web-socket.service';
import { ChatApiService } from '../services/chat-api.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ChatMessage } from '../models/chat-message';
import { MenuItem, MessageService } from 'primeng/api';

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

  page = 0;
  size = 20;
  chatRoomId = 'room123'; // Example chat room ID
  loading = false;
  currScrollValue: number =0;
  
  activeItem: MenuItem | undefined;
  items: MenuItem[] =  [
    { label: 'Chat', icon: 'pi pi-comments' },
    { label: 'Group Outlay', icon: 'pi pi-users' },
    { label: 'Self Outlay', icon: 'pi pi-user' }
  ];
  constructor(private webSocketService: WebSocketService, private chatApiService: ChatApiService, private authService: AuthService, private router: Router, private messageService: MessageService) {}

  ngOnInit() {
    this.activeItem = this.items[0];
    let userData = this.authService.getUserDetails();
    console.log("###=================",userData);
    if(userData?.userId){
      this.message.sender = userData.userId;
      this.message.roomId = "room-1";
    } else {
      this.message.sender = '';
    }
    if(this.message.sender){
      this.webSocketService.connect(this.message.sender);
      this.webSocketService.messages$.subscribe((message) => {
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

  sendMessage() {
    if(this.message?.roomId, this.message.content && this.message.sender){
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
    this.chatApiService.getMessages(this.chatRoomId, this.page, this.size).subscribe((newMessages) => {
      this.messages = [...newMessages.reverse(), ...this.messages];
      this.page++;
      this.loading = false;
    });
  }

  subscribeToWebSocket() {
    this.webSocketService.subscribeToMessages(this.chatRoomId).subscribe((message) => {
      this.messages.push(message);
    });
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
  

}
