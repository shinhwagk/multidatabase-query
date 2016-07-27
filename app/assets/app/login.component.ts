/**
 * Created by zhangxu on 2016/7/20.
 */
import {Component} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Router} from "@angular/router";

import {ApiServices} from "./api.services";
import {CustomOptions} from "./common/http.services";

@Component({
  selector: 'login',
  templateUrl: 'app/login.component.html',
  styleUrls: ['app/login.component.css'],
  providers: [ApiServices],
})

export class LoginComponent {

  constructor(private _http:Http, private _router:Router) {
    console.info('login')
    this._hidden_login_img = true
  }

  login() {
    this._hidden_login_img = false
    this._http.post(this._login_url, JSON.stringify(this._user), this._json_header)
      .map((res:Response) => res.text())
      .toPromise()
      .then(data => {
        localStorage.setItem("_username", data);
        this._router.navigate(['/sqlquery/query'])
      })
      .catch(err => this._error = err.toString())
  }

  _user:User = new User
  _error:string
  _login_url:string = '/api/login';
  _json_header = CustomOptions
  _hidden_login_img = true
}

class User {
  username:string
  password:string
}