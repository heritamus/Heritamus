import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

// Modules
import { RoutingModule } from './routing.module';
import { SharedModule } from './shared/shared.module';
import { D3graphModule } from './d3graph/d3graph.module';
import { L10nConfig, L10nLoader, ProviderType, StorageStrategy, TranslationModule } from 'angular-l10n';
import {
  AccordionModule,
  AlertModule,
  BsDropdownModule,
  ButtonsModule,
  ModalModule,
  PopoverModule,
  TabsModule,
  TooltipModule,
  TypeaheadModule
} from 'ngx-bootstrap';

// Providers
import { RequestService } from './services/request.service';
import { Neo4jService } from './services/neo4j.service';
import { AppService } from './services/app.service';
import { GraphService } from './services/graph.service';
import { TypesService } from './services/types.service';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { AuthGuardLogin } from './services/auth-guard-login.service';
import { AuthGuardAdmin } from './services/auth-guard-admin.service';

// Components
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AccountComponent } from './account/account.component';
import { GraphComponent } from './graph/graph.component';
import { AdminComponent } from './admin/admin.component';
import { AdminGeneralGraphsComponent } from './admin/general/general.admin.component';
import { AdminGraphsComponent } from './admin/graphs/graphs.admin.component';
import { AdminRequestsComponent } from './admin/requests/requests.admin.component';
import { AdminTypesComponent } from './admin/types/types.admin.component';
import { AdminUsersComponent } from './admin/users/users.admin.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AppPageComponent } from './app-page/app-page.component';
import { HomePageComponent } from './home-page/home-page.component';

const l10nConfig: L10nConfig = {
  locale: {
    languages: [
      { code: 'en', dir: 'ltr' },
      { code: 'pt', dir: 'ltr' }
    ],
    language: 'en',
    storage: StorageStrategy.Cookie
  },
  translation: {
    providers: [
      { type: ProviderType.Static, prefix: './assets/locale/locale-' }
    ],
    caching: true,
    missingValue: 'No key'
  }
};

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    AccountComponent,
    GraphComponent,
    AdminComponent,
    AdminGeneralGraphsComponent,
    AdminGraphsComponent,
    AdminRequestsComponent,
    AdminTypesComponent,
    AdminUsersComponent,
    NotFoundComponent,
    AppPageComponent,
    HomePageComponent
  ],
  imports: [
    RoutingModule,
    SharedModule,
    AccordionModule.forRoot(),
    AlertModule,
    ButtonsModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule,
    PopoverModule.forRoot(),
    TypeaheadModule.forRoot(),
    TabsModule.forRoot(),
    D3graphModule,
    TranslationModule.forRoot(l10nConfig)
  ],
  providers: [
    AppService,
    AuthService,
    AuthGuardLogin,
    AuthGuardAdmin,
    CookieService,
    GraphService,
    Neo4jService,
    RequestService,
    TypesService,
    UserService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(public l10nLoader: L10nLoader) {
    this.l10nLoader.load();
  }
}
