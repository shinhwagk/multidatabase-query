import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {CustomOptions} from "../common/http.services";

@Injectable()
export class SqlQueryServices {
  private _c_options = CustomOptions

  constructor(private _http:Http) {
  }

  getUserData() {
    return this._http.get("/api/sqlquery/user", this._c_options).map((res:Response) => res.json())
  }

  getDbServers() {
    return this._http.get('/api/sqlquery/dbserver', this._c_options).map((res:Response) => res.json())
  }

  // saveSql(obj) {
  //   return this._http.post('/api/sqlquery/query/savesql', obj, this._c_options).map((res:Response) => res.text())
  // }
  //
  // getSqlGroups() {
  //   return this._http.get("/api/sqlquery/sqls/self/groups", this._c_options).map((res:Response) => res.json())
  // }
  //
  // getGroupsSqls(p_group) {
  //   return this._http.get(`/api/sqlquery/sqls/self/group/${p_group}`, this._c_options).map((res:Response) => res.json())
  // }
  //
  // getShareSqlsUsers() {
  //   return this._http.get("/api/sqlquery/sqls/share/users", this._c_options).map((res:Response) => res.json())
  // }
  //
  // getShareSqlsUserSqls(user) {
  //   return this._http.get(`/api/sqlquery/sqls/share/user/${user}`, this._c_options).map((res:Response) => res.json())
  // }

  // deleteSql(p_group, index) {
  //   return this._http.delete(`/api/sqlquery/sql/self/sql/${p_group}/${index}`).map((res:Response) => res.json())
  // }
  //
  // addSql(p_group) {
  //   return this._http.post(`/api/sqlquery/sql/self/sql/${p_group}`, null).map((res:Response) => res.json())
  // }
  //
  // updateSql(p_group, index, sql_entry) {
  //   return this._http.put(`/api/sqlquery/sql/self/sql/${p_group}/${index}`, sql_entry).map((res:Response) => res.json())
  // }
  //
  // updateGroup(p_old_group, p_new_group) {
  //   return this._http.put(`/api/sqlquery/sql/self/group/${p_old_group}/${p_new_group}`, null).map((res:Response) => res.text())
  // }
  //
  // addGroup() {
  //   return this._http.post("/api/sqlquery/sql/self/group/", null).map((res:Response) => res.text())
  // }
  //
  // deleteGroup(p_group) {
  //   return this._http.delete(`/api/sqlquery/sql/self/group/${p_group}`).map((res:Response) => res.text())
  // }

  getQueryResult(obj) {
    return this._http.post(`/api/sqlquery/query/result`, JSON.stringify(obj), this._c_options).map((res:Response) => res.json())
  }
}