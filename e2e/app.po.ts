import { $$, browser } from 'protractor';

export class AngularFullStackPage {
  navigateTo() {
    return browser.get('/');
  }

  getNavbarElement(n) {
    return $$('app-root a').get(n).getText();
  }

}
