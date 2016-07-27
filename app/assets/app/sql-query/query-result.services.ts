/**
 * Created by zhangxu on 2016/7/20.
 */
import { Injectable, Component } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class QueryResult {

  constructor(private http: Http) { }

  _self_sql = "api/sqlquery/query/selfsql"
  _share_sql = "api/sqlquery/query/sharesql"
  _servers = "api/sqlquery/query/server"
  _schemas = "api/sqlquery/query/schemas"
  _result = "api/sqlquery/query/result"

  result: String;

  private token = localStorage.getItem("token")


  getSelfSql() {
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': `Basic ${this.token}` });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(this._self_sql, options).map((res: Response) => res.json())
  }
  getSQLQuery(sqlText) {
    let body = sqlText;

    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': `Basic ${this.token}` });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(this._self_sql, body, options).map((res: Response) => res.json())
  }

  handleError(error: Response) {
    return Observable.throw(error.json().error || 'Server error');
  }

  getDbConnInfo() {
    let headers = new Headers({ 'Authorization': `Basic ${this.token}` });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(this._servers, options).map((res: Response) => res.json())
  }

  api_user_auth(userObj) {
    let body: string = `${userObj.username}:${userObj.password}`;
    let authString = window.btoa(body)
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': `Basic ${authString}` });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(this._self_sql, "", options).map((res: Response) => res.text())
  }

  sqlquery_info() {
    let body = "";
    let token = localStorage.getItem("token")
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': `Basic ${token}` });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(this._self_sql, body, options).map((res: Response) => res.json())
  }

  getResult(sql) {
    let body = sql;
    let token = localStorage.getItem("token")
    let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': `Basic ${token}` });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(this._result, body, options).map((res: Response) => res.json())
  }
}