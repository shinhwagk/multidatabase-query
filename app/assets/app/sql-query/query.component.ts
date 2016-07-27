/**
 * Created by zhangxu on 2016/7/20.
 */
import {Component, OnInit} from "@angular/core";

import {QueryResultCommonent} from "./query-result.component";
import {SqlQueryServices} from "./api.services";
import {QueryObject, PrivilegeObject} from "./object.service";
import {extractObjectKeys} from "../common/Tools";

@Component({
  selector: 'sql-query-query',
  templateUrl: 'app/sql-query/query.component.html',
  directives: [QueryResultCommonent],
  providers: [SqlQueryServices]
})

export class QueryComponent implements OnInit {

  constructor(private _apiService:SqlQueryServices) {
  }

  queryAll(code:Boolean) {
    this._query_obj.queryfull = code
    this._query_obj.page = code ? 40 : 0
  }

  _switch() {
    this.switch_exec = false
  }

  // save_sql() {
  //   let obj = {sqltext: this._query_obj.sqltext, reason: this._query_obj.reason}
  //   this._apiService.saveSql(JSON.stringify(obj)).toPromise().then(p => {
  //     console.info(p)
  //   })
  // }
  //
  // onChangeGroup(group_name) {
  //   console.info(group_name)
  //   this._apiService.getGroupsSqls(group_name).toPromise().then(p => this.sql_group_texts = p)
  //   this.curr_group_name = group_name
  // }
  //
  // onChangeText(index) {
  //   this._query_obj.sqltext = this.sql_group_texts[index].text
  //   this._query_obj.reason = this.sql_group_texts[index].reason
  // }
  //
  // getUserShareSql(user) {
  //   this._apiService.getShareSqlsUserSqls(user).toPromise().then(p => {
  //     this.sql_user_share_sqls = p
  //   })
  // }

  getUserSqlsShareSql(index) {
    this._query_obj.sqltext = this.sql_user_share_sqls[index].text
    this._query_obj.reason = this.sql_user_share_sqls[index].reason
  }

  executeQuery() {
    console.info("executeQuery")
    if (!this._first_query) {
      this._first_query = true
    }
  }

  ngOnInit() {
    this._apiService.getUserData().toPromise().then(this.allotUserData)

    this._apiService.getDbServers().toPromise().then(p => this._db_servers = p)
  }

  allotUserData:(u) => void = (u) => {
    this._user_data = u
    this._user_sqls_data = this._user_data.sqlgroups
    this._user_sqls_gruops = extractObjectKeys(this._user_sqls_data)
  }

  applayFullCountDisplay() {
    return this._query_obj.queryfull && !Boolean(this.all_query_count)
  }

  setQueryServer(ser) {
    this._query_obj.server = ser
  }

  private switch_exec:boolean = true
  private _user_data
  private _user_sqlgroups
  private _db_servers:string[]
  private _user_sqls_data:string[]
  private _user_sqls_gruops:string[]
  private sql_text
  _query_obj:QueryObject = new QueryObject()
  _query_pvlg:PrivilegeObject = new PrivilegeObject()
  private verify_code = true
  private sql_groups:string[]
  private sql_share_users:string[]
  private all_query_count:number
  private apply_num
  //自己的sqlgroup
  private sql_groups_name:string[] = []
  //当前某个sqlgroup下的sqltext组
  private sql_group_texts
  //当前分享的schema下的sql
  private sql_schema_texts
  //当前group组名字
  private curr_group_name
  //当前sql alias组名字
  private curr_text_name
  private refresh_sql_texts:Boolean
  private servers
  private sql_user_share_sqls
  _is_querying:boolean = false

  _first_query:boolean = false
}