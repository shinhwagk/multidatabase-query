/**
 * Created by zhangxu on 2016/7/22.
 */
import {CanActivate, Router} from "@angular/router";
import {Injectable} from "@angular/core";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate() {
    console.info(localStorage.getItem("_username"))
    if (localStorage.getItem("_username")) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }

  constructor(private router:Router) {
  }
}

@Injectable()
export class loginRouterGuard implements CanActivate {
  canActivate() {
    console.info(localStorage.getItem("_username"))
    if (localStorage.getItem("_username")) {
      this.router.navigate(['/sqlquery/query']);
      return false;
    }
    return true;
  }

  constructor(private router:Router) {
  }
}