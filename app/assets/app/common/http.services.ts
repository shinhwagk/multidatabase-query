import {Headers, RequestOptions} from "@angular/http";
/**
 * Created by zhangxu on 2016/7/22.
 */
let headers = new Headers({'Content-Type': 'application/json'});
export const CustomOptions = new RequestOptions({headers: headers});