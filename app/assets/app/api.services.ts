/**
 * Created by zhangxu on 2016/7/20.
 */
import { Injectable, Component } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

@Injectable()
export class ApiServices {

  constructor(private http: Http) { }

  _heroesUrl = '/api/sqlquery';
  _dbinfos = '/api/dbinfos';
  _login = '/api/auth/login';
  _logout = '/api/auth/logout';
  _query_info = '/api/sqlquery/info';

  result: String;

  getSQLQuery(sqlText) {
    let body = sqlText;
    let token = localStorage.getItem("token")
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': `Basic ${token}` });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(this._heroesUrl, body, options).map((res: Response) => res.json())
  }

  getDbConnInfo() {
    return this.http.get(this._dbinfos).map((res: Response) => res.json())
  }

  api_user_auth(userObj) {
    let body: string = `${userObj.username}:${userObj.password}`;
    let authString = window.btoa(body)
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': `Basic ${authString}` });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(this._login, "", options).map((res: Response) => res.text())
  }

  sqlquery_info() {
    let body = "";
    let token = localStorage.getItem("token")
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': `Basic ${token}` });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(this._query_info, body, options).map((res: Response) => res.json())
  }
}