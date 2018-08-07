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
    console.log(this._route.snapshot.queryParams['returnUrl']);
    this._authService.login();
    this._authService.logInSubject.subscribe(isAuthenticated => {
      if (isAuthenticated !== null) {
        if (isAuthenticated) {
          let returnUrl = this._route.snapshot.queryParams['returnUrl'];
          console.log(returnUrl);
          this._router.navigate(['']);
        }
        else {
          console.log(this._authService.errorDescription);
          this.error = this._authService.errorDescription;
        }
      }
    });
  }

}
