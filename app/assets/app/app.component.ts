import {Component} from "@angular/core";
import {ROUTER_DIRECTIVES, Router} from "@angular/router";

@Component({
  selector: 'gk-app',
  templateUrl: 'app/app.component.html',
  styleUrls: ['app/app.component.css'],
  directives: [ROUTER_DIRECTIVES]
})

export class AppComponent {

  constructor(private _router:Router) {
  }

  _login_status:boolean = Boolean(localStorage.getItem("_username"))

  logout() {
    localStorage.removeItem("_username");
    this._login_status = Boolean(localStorage.getItem("_username"))
    console.info(this._login_status)
    this._router.navigate(['/login']);
  }
}
