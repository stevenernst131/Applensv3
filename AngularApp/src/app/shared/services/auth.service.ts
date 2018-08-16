import { Injectable } from '@angular/core';
import * as AuthenticationContext from 'adal-angular'
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Http, Response } from '@angular/http';
import { DiagnosticApiService } from './diagnostic-api.service';

const ProductionClientId = '192bd8f2-c844-4977-aefd-77407619e80c';
const SteveTestClientId = '3c7756c4-a776-46cc-81f3-dd9e5ad5c98b';
const LocalhostClientId = '0128de1e-8cb3-480c-8c65-9b08be97dd40';

@Injectable()
export class AuthService {

  private authContext: AuthenticationContext;
  private config: AuthenticationContext.Options;

  private error: string;

  public returnUrl: string;
  public logInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor(private http: Http) {
    this.config = {
      clientId: environment.production ? ProductionClientId : LocalhostClientId,
      callback: this.tokenCallback,
      popUp: true,
      redirectUri: window.location.origin,
      cacheLocation: 'localStorage'
    }

    this.authContext = new AuthenticationContext(this.config);
  }

  login() {
    this.authContext.login();
  }

  logout() {
    this.authContext.logOut();
  }

  tokenCallback: AuthenticationContext.TokenCallback = (errorDesc, token, error) => {
    this.error = errorDesc;
    this.logInSubject.next(!errorDesc);
  }

  registerWithAppServiceAuth(): Observable<Response> {
    return this.http.post('/.auth/login/aad',
        {
            id_token: this.config.clientId,
            access_token: this.accessToken
        });
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
