import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuthModule, AngularFireAuth } from '@angular/fire/compat/auth';
import { LoginService } from '../service/login.service';
import { User } from '../model/user';


@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent implements OnInit {

  currentUser!: User;

  constructor(public auth: AngularFireAuth, private router: Router, private login : LoginService) {
    login.currentUserObservable.subscribe(u => {
      this.currentUser = u;
    })
  }

  ngOnInit(): void {
  }

  home() {
    this.router.navigate(['main/'] , { skipLocationChange: false });
  }

  adminHome() {
    this.router.navigate(['admin/'] , { skipLocationChange: false });
  }

  logout() {
    this.auth.signOut();
    this.router.navigate(['/main/'] , { skipLocationChange: false });
  }

}
