/**
 * Created by zhangxu on 2016/7/20.
 */
import {provideRouter, RouterConfig} from "@angular/router";
import {SqlQueryComponent} from "./sql-query.component";
import {LoginComponent} from "./login.component";
import {QueryComponent} from "./sql-query/query.component";
import {AuthGuard, loginRouterGuard} from "./router.guard";
import {PrivilegeComponent} from "./sql-query/privilege.component";
import {SqlManageComponent} from "./sql-query/sqlmanage.component";

const routes:RouterConfig = [
  {path: '', redirectTo: '/sqlquery/query', pathMatch: 'full'},
  {path: 'login', component: LoginComponent, canActivate: [loginRouterGuard]},
  {
    path: 'sqlquery', component: SqlQueryComponent,
    children: [
      {path: 'query', component: QueryComponent, canActivate: [AuthGuard]},
      {path: 'sqlmanage', component: SqlManageComponent},
      {path: 'privilege', component: PrivilegeComponent}]
  }

];

export const appRouterProviders = [
  provideRouter(routes),
  [AuthGuard, loginRouterGuard]
];