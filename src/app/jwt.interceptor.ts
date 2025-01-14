import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { JWT_TOKEN } from './data';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();//localStorage.getItem(JWT_TOKEN); // Retrieve JWT token
    if (token) {
      const decodedToken: any = jwtDecode(token);
      console.log('User Data from Token:', decodedToken);
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next.handle(clonedRequest);
    }
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle unauthorized error (e.g., redirect to login)
          this.authService.removeToken();
          this.router.navigate(['']);
        }
        return throwError(error);
      })
    );
    return next.handle(req);
  }
}
