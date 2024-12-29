import { Component } from '@angular/core';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { LoaderComponent } from '../loader/loader.component';
import { LoaderService } from '../services/loader.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  loginFlag: boolean = false;
  user: User = new User();
  errorList: string[] = [];


  constructor(private authService: AuthService, private loaderService: LoaderService, private router: Router){}
  logging(signupFlag: boolean = false){
    this.loginFlag = signupFlag;
    this.user= new User();
  }
  SignUp(){
    this.errorList = [];
    if(this.user && this.isEmailValid() && this.isPasswordValid() && this.isPasswordValid()){
      this.authService.addUser(this.user).subscribe(resp=>{
        console.log("signup---------");
        if(resp && resp.status ==200){
          this.logging();
        } else {
          this.errorList.push(resp?.message);
        }
      });
    }
  }

  login(){
    this.errorList = [];
    if(this.user && this.user.username && this.user.password && this.isPasswordValid()){
      this.loaderService.loader(true);
      this.authService.authenticateUser(this.user.username, this.user.password).subscribe(resp=>{
        console.log("login---------", resp.status, this.errorList);
        if(resp && resp.token){
          this.authService.storeToken(resp.token);
          this.router.navigate(['/chat']); 
        } else {
          // this.router.navigate(['/auth']);
          this.errorList.push(resp?.message);
        }
        console.log("login---------", resp.status, this.errorList);
        this.loaderService.loader();
      }, err=>{
        this.errorList.push(err?.message);
        this.loaderService.loader();
        // this.router.navigate(['/auth']);
      });
    }
  }

  isEmailValid(): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return this.user.email ? emailPattern.test(this.user.email) : false;
  }
  isPasswordValid(): boolean {
    return this.user?.password ? this.user?.password?.length >= 8 : false; // Password should be at least 8 characters long
  }

  // Function to check if the passwords match
  isPasswordsMatch(): boolean {
    return this.user.password === this.user.confirmPassword;
  }

}
