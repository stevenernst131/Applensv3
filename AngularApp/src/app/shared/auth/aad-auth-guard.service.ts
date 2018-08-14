import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Http } from "@angular/http";
import { Observable } from "../../../../node_modules/rxjs";
import { environment } from "../../../environments/environment";

@Injectable()
export class AadAuthGuard implements CanActivate {

    constructor(private _authService: AuthService, private _router: Router, private http: Http) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
        if (!this._authService.isAuthenticated) {
            this._authService.returnUrl = state.url;
            this._router.navigate(['login'], { queryParams: { returnUrl: state.url } })
        }
        else {
            console.log(`Signed in as ${this._authService.userInfo.userName}`);

            if (environment.production) {
                return this._authService.registerWithAppServiceAuth().map(
                    response => {
                        if (this._authService.returnUrl) {
                            this._router.navigate([this._authService.returnUrl]);
                            this._authService.returnUrl = null;
                        }
                        return true;
                    }
                );
            }
            else {
                if (this._authService.returnUrl) {
                    this._router.navigate([this._authService.returnUrl]);
                    this._authService.returnUrl = null;
                }
                return true;
            }


        }

        return false;
    }
}