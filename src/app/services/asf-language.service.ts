import '@formatjs/intl-displaynames/polyfill'
import '@formatjs/intl-displaynames/locale-data/en' // locale-data for en

import { Injectable } from '@angular/core';

import { TranslateService } from "@ngx-translate/core";
import { CookieService } from "ngx-cookie-service";
// import * as moment from 'moment/min/moment-with-locales'
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class AsfLanguageService {

  // @ts-ignore
  public languageNamesInEnglish = new Intl.DisplayNames(['en'], { type: 'language' });
  public browserLang: string;
  private defaultProfileLanguage: string;
  public languageCookie = 'Language';
  public cookieOptions = {
    path: '/'
  };
  private matchLanguagesRegex = /de|en|es|fr|pt|zh/;
  private listLanguagesRegex = ['de', 'en', 'es', 'fr', 'pt', 'zh'];

  public languageName = {
    'de' : 'Deutsch',
    'en' : 'English',
    'es' : 'Español' ,
    'fr' : 'Français',
    'pt' : 'Português',
    'zh' : '中文 (Chinese)',
  }

  constructor(
    public translate: TranslateService,
    private cookieService: CookieService
  ) {
    this.browserLang = this.translate.getBrowserLang();
  }

  public getName( langName? : string ) {
    if (!langName) {
      return  this.languageName[this.translate.currentLang]
    }
    return this.languageName[langName];
  }

  public getEnglishName( langName : string ) {
    return this.languageNamesInEnglish.of( langName );
  }

  public setCurrent(language: string): void {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'language-selected',
      'language': language,
    });
    this.cookieService.set(this.languageCookie, language, this.cookieOptions);
    this.translate.use(language)
    moment.locale(language);
  }

  public setProfileLanguage(language: string): void {
    this.defaultProfileLanguage = language;
  }

  public initialize(): void {
    console.log('Initialize Profile Language:', this.defaultProfileLanguage);
    this.translate.addLangs(this.listLanguagesRegex);
    const defaultLanguage = 'en';
    this.translate.setDefaultLang(defaultLanguage);

    // If the browser reports a language we support and if so use it as the current language
    let currentLanguage = this.browserLang.match(this.matchLanguagesRegex) ? this.browserLang : defaultLanguage;
    // If the user has a profile and established a language preference then set the current language to it
    if (this.defaultProfileLanguage !== undefined) {
      currentLanguage = this.defaultProfileLanguage;
      console.log('currentLanguage = this.defaultProfileLanguage', currentLanguage)
    }
    // If a language cookie exists, override the current language with it.
    // Else, set a language cookie to the current language
    const cookieExists: boolean = this.cookieService.check(this.languageCookie);
    if (cookieExists) {
      let cookieLanguage = this.cookieService.get(this.languageCookie);
      if (cookieLanguage.match(this.matchLanguagesRegex)) {
        currentLanguage = cookieLanguage;
        console.log('cookieExists and is:', this.cookieService.get(this.languageCookie), currentLanguage);
      }
    }
    // Use the current language for the translation target
    console.log('initialize finishing with current language set to:',currentLanguage);
    this.setCurrent(currentLanguage);

  }
}
