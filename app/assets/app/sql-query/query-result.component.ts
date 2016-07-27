/**
 * Created by zhangxu on 2016/7/20.
 */

import {Component, Output, Input, EventEmitter} from "@angular/core";

import {SqlQueryServices} from "./api.services";

@Component({
  selector: 'sql-query-query-result',
  templateUrl: 'app/sql-query/query-result.component.html',
  providers: [SqlQueryServices],
  styles: [`
  .table-striped>thead>tr>th {
    padding: 4px 10px 4px 10px;
    font-size: 12px;
    text-align:center;
  }
  .table-striped>tbody>tr>td {
    padding: 4px 10px 4px 10px;
    font-size: 12px;
    text-align:center;
  }
  h3 {
    border: 1px solid #d8d8d8;
  }
  `]
})

export class QueryResultCommonent {

  constructor(private _apiService:SqlQueryServices) {
  }

  @Output() success = new EventEmitter();


  _display_query_wait:boolean = false

  @Input() set executeQuery(_query_obj) {
    this._display_query_wait = true
    this._apiService.getQueryResult(_query_obj).toPromise()
      .then(rs=> console.info(JSON.stringify(rs)))
      .catch(ex=> console.info(ex.toString()))
    // if (sql.length > 0) {
    //   this.successResultStatus = false
    //   this.failureResultStatus = false
    //   this._query_api.getResult(sql).toPromise().then(data => {
    //     if (data.status == 0) {
    //       this.setTransformJsontoSet(JSON.parse(data.data))
    //       this.successResultStatus = true
    //       this.queryObj = JSON.parse(sql)
    //     } else {
    //       this.failureResult = data.data
    //       this.failureResultStatus = true
    //     }
    //     this.loading = false
    //     this.success.emit(111)
    //   })
    // } else {
    //   this.successResultStatus = false
    //   this.failureResultStatus = false
    // }

  }

  setTransformJsontoSet(_json) {
    let arrX:Array<Array<[string, string]>> = [];
    for (let idxwd in _json) {
      let cols:Array<[string, string]> = [];
      for (let colName in _json[idxwd]) {
        cols.push([colName, _json[idxwd][colName]])
      }
      arrX.push(cols)
    }
    this.successResult = arrX
  }

  successResult
  failureResult

  loading = false
  successResultStatus = false
  failureResultStatus = false

  queryObj

  abc(sql) {
    if (sql.length > 0) {
      this.loading = true
      this.successResultStatus = false
      this.failureResultStatus = false
      // this._query_api.getResult(sql).toPromise().then(data => {
      //   if (data.status == 0) {
      //     this.setTransformJsontoSet(JSON.parse(data.data))
      //     this.successResultStatus = true
      //     this.queryObj = JSON.parse(sql)
      //   } else {
      //     this.failureResult = data.data
      //     this.failureResultStatus = true
      //   }
      //   this.loading = false
      //   this.success.emit(111)
      // })
    } else {
      this.successResultStatus = false
      this.failureResultStatus = false
    }
  }

  paging(num) {
    if (num == 1) {
      this.queryObj.page = this.queryObj.page - 1
    } else {
      this.queryObj.page = this.queryObj.page + 1
    }
    this.abc(JSON.stringify(this.queryObj))
  }
}