import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  error: string;

  contentHeight: number;

  constructor(private _authService: AuthService, private _router: Router, private _route: ActivatedRoute) { }

  ngOnInit() {
    this.contentHeight = window.innerHeight;
    this._authService.login();
    this._authService.logInSubject.subscribe(isAuthenticated => {
      if (isAuthenticated !== null) {
        if (isAuthenticated) {
          this._router.navigate(['']);
        }
        else {
          this.error = this._authService.errorDescription;
        }
      }
    });
  }

}
