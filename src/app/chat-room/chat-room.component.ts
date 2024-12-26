import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../services/web-socket.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent {
  messages: any[] = [];
  message = { sender: '', content: '' };
  isConnected: boolean = false;
  connectingMessage: string = '';

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
      this.webSocketService.connect("Ram");
      this.webSocketService.messages$.subscribe((message) => {
          if (message) {
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
  }

  sendMessage() {
      this.webSocketService.sendMessage(this.message?.sender, this.message.content);
      this.message.content = '';
  }

}
