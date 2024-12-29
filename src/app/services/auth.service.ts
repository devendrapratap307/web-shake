import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:7076/auth';
  constructor(private http: HttpClient) { }

  addUser(user: User): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/user/add`, user);
  }

  authenticateUser(username: string, password: string): Observable<any> {
    return this.http.post<string>(this.baseUrl+"/login?username="+username+"&password="+password, null);
  }

  storeToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  removeToken(): void {
    localStorage.removeItem('jwt_token');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
