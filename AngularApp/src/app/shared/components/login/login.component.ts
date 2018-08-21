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

  popUpsBlocked: boolean = false;
  inIFrame: boolean = false;

  constructor(private _authService: AuthService, private _router: Router, private _route: ActivatedRoute) { 
    this.inIFrame = window.parent !== window;
  }

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

          if(this.error.indexOf('Popup Window is null') >= 0) {
            this.popUpsBlocked = true;
          }
        }
      }
    });
  }

  login() {
    this._authService.login();
  }
}
