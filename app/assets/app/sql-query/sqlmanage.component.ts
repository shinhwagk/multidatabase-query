/**
 * Created by zhangxu on 2016/7/26.
 */
import {Component} from "@angular/core";

import {SqlQueryServices} from "./api.services";

@Component({
  selector: 'sql-query-sqlmanage',
  templateUrl: 'app/sql-query/sqlmanage.component.html',
  providers: [SqlQueryServices]
})

export class SqlManageComponent {

  constructor(private _apiService:SqlQueryServices) { }

  private sqlEntry
  private sqls
  private sql_groups
  private sql_groups_name = []
  private sql_group_sqls
  private curr_alias
  private curr_sqltext = ""
  private curr_reason = ""
  private curr_group_name
  private curr_index
  private update_group_ui_statue = true
  private curr_new_group_name
  private curr_share: boolean = false

  // onChangeGroup(group_name) {
  //   this._apiService.getGroupsSqls(group_name).toPromise().then(p => this.sql_group_sqls = p)
  //   this.curr_group_name = group_name
  // }
  //
  // onChangeText(index) {
  //   this.curr_index = index
  //   this.curr_alias = this.sql_group_sqls[index].alias
  //   this.curr_sqltext = this.sql_group_sqls[index].text
  //   this.curr_reason = this.sql_group_sqls[index].reason
  //   this.curr_share = (this.sql_group_sqls[index].share === "true") ? true : false
  // }
  //
  // add_sql() {
  //   this._apiService.addSql(this.curr_group_name).toPromise().then(p => {
  //     this._apiService.getGroupsSqls(this.curr_group_name).toPromise().then(p => this.sql_group_sqls = p)
  //     alert("添加成功...")
  //   })
  // }
  //
  // delete_sql() {
  //   this._apiService.deleteSql(this.curr_group_name, this.curr_index).toPromise().then(p => {
  //     this._apiService.getGroupsSqls(this.curr_group_name).toPromise().then(p => this.sql_group_sqls = p)
  //     alert("删除成功...")
  //   })
  // }
  //
  // update_sql() {
  //   this.sqlEntry.alias = this.curr_alias
  //   this.sqlEntry.reason = this.curr_reason
  //   this.sqlEntry.text = this.curr_sqltext
  //   this.sqlEntry.share = this.curr_share.toString()
  //   alert(JSON.stringify(this.sqlEntry))
  //   this._apiService.updateSql(this.curr_group_name, this.curr_index, this.sqlEntry).toPromise().then(p => {
  //     this._apiService.getGroupsSqls(this.curr_group_name).toPromise().then(p => this.sql_group_sqls = p)
  //     alert("修改成功...")
  //   })
  // }
  //
  // add_group() {
  //   this._apiService.addGroup().toPromise().then(p => {
  //     this.ngOnInit()
  //   })
  // }
  //
  // delete_group() {
  //   this._apiService.deleteGroup(this.curr_group_name).toPromise().then(p =>
  //     this.ngOnInit()
  //   )
  // }
  //
  // update_group() {
  //   this._apiService.updateGroup(this.curr_group_name, this.curr_new_group_name).toPromise().then(p => {
  //     this.ngOnInit()
  //     this.open_update_group_ui()
  //   })
  // }
  //
  // open_update_group_ui() {
  //   if (this.update_group_ui_statue) {
  //     this.curr_new_group_name = this.curr_group_name
  //     this.update_group_ui_statue = false
  //   }
  //   else
  //     this.update_group_ui_statue = true
  // }
  //
  // ngOnInit() {
  //   this._apiService.getSqlGroups().toPromise().then(p => this.sql_groups = p)
  // }

}