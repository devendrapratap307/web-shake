import { Component } from '@angular/core';
import { WebSocketService } from '../services/web-socket.service';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

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
  ]


  constructor(private webSocketService: WebSocketService, private authService: AuthService, private router: Router){
    this.user = this.authService.getUserDetails();
  }
  
  logout(){
    this.authService.removeToken();
    this.router.navigate(['']);
  }

  addMember(){
    
  }
}
