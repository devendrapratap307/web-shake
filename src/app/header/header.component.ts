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
