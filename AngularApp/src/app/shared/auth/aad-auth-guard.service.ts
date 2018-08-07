import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AadAuthGuard implements CanActivate {

    constructor(private _authService: AuthService, private _router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (!this._authService.isAuthenticated) {
            this._authService.returnUrl = state.url;
            this._router.navigate(['login'], { queryParams: { returnUrl: state.url  } })
        }
        else {
            console.log(`Signed in as ${this._authService.userInfo.userName}`);
            if (this._authService.returnUrl) {
                this._router.navigate([this._authService.returnUrl]);
                this._authService.returnUrl = null;
            }
            return true;
        }   

        return false;
    }
}