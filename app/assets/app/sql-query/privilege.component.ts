/**
 * Created by zhangxu on 2016/7/26.
 */
import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";

import {QueryResultCommonent} from "./query-result.component";
import {SqlQueryServices} from "./api.services";
import {QueryObject, PrivilegeObject} from "./object.service";

@Component({
  selector: 'sql-query-privilege',
  templateUrl: 'app/sql-query/privilege.component.html',
  directives: [QueryResultCommonent],
  providers: [SqlQueryServices]
})

export class PrivilegeComponent{

}