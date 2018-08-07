import { Injectable } from '@angular/core';
import * as AuthenticationContext from 'adal-angular'
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from '../../../../node_modules/rxjs';
import { Http } from '@angular/http';

@Injectable()
export class AuthService {

  private authContext: AuthenticationContext;
  private config: AuthenticationContext.Options;

  private error: string;

  public returnUrl: string;

  public logInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor(private http: Http) {
    this.config = {
      clientId: environment.production ? '192bd8f2-c844-4977-aefd-77407619e80c' : '0128de1e-8cb3-480c-8c65-9b08be97dd40',
      callback: this.tokenCallback,
      popUp: true,
      redirectUri: window.location.origin
    }

    this.authContext = new AuthenticationContext(this.config);
    console.log(this.authContext.config.redirectUri);
  }

  login() {
    this.authContext.login();
  }

  logout() {
    this.authContext.logOut();
  }

  tokenCallback: AuthenticationContext.TokenCallback = (errorDesc, token, error) => {
    this.error = errorDesc;
    console.log('tokenCallback');
    console.log(this.config.clientId);
      console.log(this.accessToken);
    if (environment.production) {
      this.http.post('/.auth/login/aad',
        {
          id_token: this.config.clientId,
          access_token: this.accessToken
        }
      ).subscribe(response => {
        this.logInSubject.next(errorDesc == null);
      })
    }
    else {
      this.logInSubject.next(errorDesc == null);
    }
  }

  public get errorDescription() {
    return this.error;
  }

  public get userInfo() {
    return this.authContext.getCachedUser();
  }

  public get accessToken() {
    return this.authContext.getCachedToken(this.config.clientId);
  }

  public get isAuthenticated(): boolean {
    return this.userInfo !== null && this.accessToken !== null;
  }

}
