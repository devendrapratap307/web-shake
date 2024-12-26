import { Injectable } from '@angular/core';
import { Client, Message, Stomp } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient: Client | null = null;
  private messageSubject = new BehaviorSubject<any>(null);
  public messages$ = this.messageSubject.asObservable();

  private connectionSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionSubject.asObservable();

  constructor() {}

  /**
   * Connects to the WebSocket server.
   * @param username Optional username for the chat.
   */
  connect(username?: string): void {
    const socket = new SockJS('http://localhost:7076/ws');

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // Retry connection after delay if disconnected
      debug: (str) => console.log(`[STOMP DEBUG]: ${str}`),
    });

    // Handle successful connection
    this.stompClient.onConnect = () => {
      console.log('Connected to WebSocket.');
      this.connectionSubject.next(true);

      // Subscribe to the topic
      this.stompClient?.subscribe('/topic/public', (message: Message) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          this.messageSubject.next(parsedMessage);
        } catch (error) {
          console.error('Error parsing message body:', error);
        }
      });

      // Notify the server of a new user joining
      if (username) {
        this.sendMessage(username, '', 'JOIN');
      }
    };

    // Handle STOMP errors
    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported an error:', frame.headers['message']);
      console.error('Additional details:', frame.body);
    };

    // Activate the client
    this.stompClient.activate();
  }

  /**
   * Sends a message to the WebSocket server.
   * @param username The sender's username.
   * @param content The message content.
   * @param type The type of message ('CHAT', 'JOIN', etc.).
   */
  sendMessage(username: string, content: string, type: string = 'CHAT'): void {
    if (this.stompClient && this.stompClient.connected) {
      const message = { sender: username, content, type };
      this.stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(message),
      });
    } else {
      console.error('Cannot send message: WebSocket is not connected.');
      setTimeout(()=>{
        this.connect();
      }, 300);
    }
  }

  /**
   * Returns an observable for messages received from the server.
   */
  getMessages(): Observable<any> {
    return this.messages$;
  }

  /**
   * Disconnects from the WebSocket server.
   */
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connectionSubject.next(false);
      console.log('WebSocket connection deactivated.');
    }
  }
}






// import { Injectable } from '@angular/core';
// import { Client, Message, Stomp } from '@stomp/stompjs';
// import { BehaviorSubject } from 'rxjs';
// import * as SockJS from 'sockjs-client';

// @Injectable({
//   providedIn: 'root'
// })
// export class WebSocketService {
//   constructor() {}
//   private stompClient: Client | null = null;
//   private messageSubject = new BehaviorSubject<any>(null);
//   public messages$ = this.messageSubject.asObservable();

//   private connectionSubject = new BehaviorSubject<boolean>(false);
//   public connectionStatus$ = this.connectionSubject.asObservable();

//   connect(usrname?: string) {
//     const socket = new SockJS('http://localhost:7076/ws');

//     this.stompClient = new Client({
//       webSocketFactory: ()=> socket,
//       reconnectDelay: 5000,
//       debug: (str) => console.log("debug---", str)
//     });

//     this.stompClient.onConnect = (frame) =>{
//       console.log("Connected to web socket.");
//       this.connectionSubject.next(true);

//       this.stompClient?.subscribe('topic/public', (message: Message) =>{
//         this.messageSubject.next(JSON.parse(message.body)); // pass the message to subscribers
//       });
//     }

//     this.stompClient?.publish({
//       destination: 'app/chat.addUser',
//       body: JSON.stringify({sender: usrname, type: 'JOIN'}) // send username and join event
//     });

//     this.stompClient.onStompError = (frame) =>{
//       console.error("Broker reported error : "+ frame.headers['message']);
//       console.error("Addition Details : "+ frame.body);
//     }

//     this.stompClient.activate();


//     // console.log("socket-----", socket);
//     // this.stompClient = Stomp.over(socket);
//     // this.stompClient.connect({}, () => {

//     //   this.stompClient.subscribe('/topic/room/room-1', (message: any) => {
//     //     this.messageSubject.next(JSON.parse(message.body));
//     //   });
//     // });
//   }

//   sendMessage(username:  string, message: string) {
//     if(this.stompClient && this.stompClient.connected){
//       const currMsg = {sender: username, content: message, type: 'CHAT'};
//       this.stompClient.publish({
//         destination:'app/chat.sendMessage', 
//         body: JSON.stringify(currMsg)
//       });
//     } else {
//       console.error("WS is not connected, unable to send message...");
//     }


//     // const roomId = "room-1"; // Replace with your roomId
//     // const currMessage = {
//     //     roomId: roomId,
//     //     content: "Hello, World!",
//     //     sender: "user123"
//     // };
//     // this.stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(currMessage));

//       // this.stompClient.send('/sendMessage/room-1', {}, JSON.stringify(message));
//   }

//   getMessages() {
//     return this.messageSubject.asObservable();
//   }

//   disconnect(){
//     if(this.stompClient){
//       this.stompClient.deactivate();
//     }
//   }


//   //2
//   // private stompClient: any;
//   //   private messageSubject = new BehaviorSubject<any>(null);

//   //   connect() {
//   //     // const socket = new SockJS('http://localhost:8080/ws');
//   //     // this.stompClient = Stomp.over(socket);
//   //     // this.stompClient.connect({}, () => {
//   //     //   this.stompClient.subscribe('/topic/public', (message: any) => {
//   //     //     this.messageSubject.next(JSON.parse(message.body));
//   //     //   });
//   //     // });
//   //   }

//   //   sendMessage(message: any) {
//   //     this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(message));
//   //   }

//   //   getMessages() {
//   //     return this.messageSubject.asObservable();
//   //   }
// ///3
//   // connect(): void {
//   //   this.client = new Client({
//   //     brokerURL: 'ws://localhost:8080/ws',
//   //     connectHeaders: {},
//   //     debug: (str) => console.log(str),
//   //     reconnectDelay: 5000,
//   //     heartbeatIncoming: 4000,
//   //     heartbeatOutgoing: 4000,
//   //     webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
//   //   });

//   //   this.client.onConnect = (frame) => {
//   //     console.log('Connected: ' + frame);
//   //     this.client.subscribe('/topic/messages', (message: Message) => {
//   //       console.log('Message Received:', message.body);
//   //     });
//   //   };

//   //   this.client.activate();
//   // }

//   // sendMessage(message: string): void {
//   //   if (this.client && this.client.connected) {
//   //     this.client.publish({ destination: '/app/sendMessage', body: message });
//   //   }
//   // }
// }