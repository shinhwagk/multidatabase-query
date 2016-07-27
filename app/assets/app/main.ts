import {bootstrap} from "@angular/platform-browser-dynamic";
import {HTTP_PROVIDERS} from "@angular/http";
import {disableDeprecatedForms, provideForms} from "@angular/forms";
import {LocationStrategy, HashLocationStrategy} from "@angular/common";
import "rxjs/Rx";

import {AppComponent} from "./app.component";
import {appRouterProviders} from "./app.routes";

bootstrap(AppComponent,
  [appRouterProviders, HTTP_PROVIDERS, disableDeprecatedForms, provideForms,
    {provide: LocationStrategy, useClass: HashLocationStrategy}]).catch(err => console.error(err));