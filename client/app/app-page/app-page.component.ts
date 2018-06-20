import { Component, OnInit } from '@angular/core';
import { Language, LocaleService, TranslationService } from 'angular-l10n';
import { GraphService } from '../services/graph.service';
import { AppService } from '../services/app.service';
import { AuthService } from '../services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Urls } from '../shared/urls';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-page',
  templateUrl: './app-page.component.html',
})
export class AppPageComponent implements OnInit {

  @Language() lang: string;
  currentLanguage: string;
  graphID: number;
  graphOpen: boolean;
  appVersion: any;
  urls = Urls;

  constructor(public auth: AuthService,
              public locale: LocaleService,
              public translation: TranslationService,
              private appService: AppService,
              private graphService: GraphService,
              private cookieService: CookieService) {
    this.appVersion = environment.version;
    this.locale.setDefaultLocale('en', null);
    this.currentLanguage = 'English';
  }

  void() {
  }

  ngOnInit(): void {
    this.graphService.graphIDEmitter.subscribe((n: number) => {
      this.graphID = n;
    });
    this.graphService.graphOpenEmitter.subscribe((o: boolean) => {
      this.graphOpen = o;
    });
    if (this.cookieService.check('h_lang')) {
      if (this.cookieService.get('h_lang') === 'en') {
        this.selectLanguage('en', 'English');
      } else if (this.cookieService.get('h_lang') === 'pt') {
        this.selectLanguage('pt', 'Português');
      } else {
        this.selectLanguage('en', 'English');
      }
    } else {
      this.selectLanguage('en', 'English');
    }
  }

  selectLanguage(language, full): void {
    this.locale.setCurrentLanguage(language);
    this.currentLanguage = full;
    this.cookieService.set('h_lang', language);
  }

  closeGraph() {
    if (this.graphID === 0 || confirm(this.translation.translate('_CONFIRM_EXIT_'))) {
      this.appService.sendInstruction('closeGraph');
    }
  }

  createGraph() {
    this.appService.sendInstruction('createGraph');
  }

  exportGraph() {
    this.appService.sendInstruction('exportGraph');
  }

  saveGraph() {
    this.appService.sendInstruction('saveGraph');
  }

  publishGraph() {
    this.appService.sendInstruction('publishGraph');
  }

  applyFilter() {
    this.appService.sendInstruction('applyFilter');
  }

  get username(): string {
    if (this.auth.loggedIn) {
      return this.auth.currentUser.username;
    } else {
      return this.translation.translate('_GUEST_');
    }
  }
}
