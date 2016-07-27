/**
 * Created by zhangxu on 2016/7/25.
 */
export class QueryObject {
  sqltext:string
  server:string
  reason:string
  queryfull:Boolean = false
  page:number = 0
  offset:number = 0
}

export class PrivilegeObject {
  queryNumber:number

}

interface UserData {
  admin:number;
  allquerynumber:number;
  id:number;
  privilege:any;
  sqlgroups:any;
  username:string;
}