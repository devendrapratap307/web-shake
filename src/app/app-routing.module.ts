import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { authGuard } from './auth.guard';

const routes: Routes = [
  { path: '', component: AuthComponent }, 
  { path: 'chat', component: ChatRoomComponent, canActivate: [authGuard] },
  { path: 'e404', component: PageNotFoundComponent },
  { path: '**', redirectTo : 'e404' }, // Wildcard route for handling 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
