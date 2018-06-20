import { Component, OnInit } from '@angular/core';
import { Language, LocaleService, TranslationService } from 'angular-l10n';
import { CookieService } from 'ngx-cookie-service';
import { Urls } from '../shared/urls';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
})
export class HomePageComponent implements OnInit {
  @Language() lang: string;
  currentLanguage: string;
  urls = Urls;

  constructor(public locale: LocaleService,
              public translation: TranslationService,
              private cookieService: CookieService) {
    this.locale.setDefaultLocale('en', null);
    this.currentLanguage = 'English';
  }

  ngOnInit(): void {
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

}
