import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { Language, TranslationService } from 'angular-l10n';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {
  @Language() lang: string;

  isLoading = true;

  constructor(public auth: AuthService,
              public translation: TranslationService) { }

  ngOnInit() {
    this.isLoading = false;
  }

}
