import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {  ToastrModule } from 'ngx-toastr';

import * as store from './store';

import { MatSharedModule } from '@shared';
import { SidebarModule } from '@components/sidebar';
import { HeaderModule } from '@components/header';
import { MapModule } from '@components/map';
import { CodeExportModule } from '@components/shared/code-export';
import { ResultsMenuModule } from '@components/results-menu';
import { BaselineChartModule } from '@components/baseline-chart';
import { HelpModule } from '@components/help';
import { AppComponent } from './app.component';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from "@angular/common/http";

import * as services from '@services';

import { NgcCookieConsentModule, NgcCookieConsentConfig } from 'ngx-cookieconsent';
import { getSaver, SAVER } from '@services/saver.provider';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter
} from "@angular/material-moment-adapter";

// info about cookie consent module: https://tinesoft.github.io/ngx-cookieconsent/home
const cookieConfig: NgcCookieConsentConfig = {
  'autoOpen': false,
    'cookie': {
      'domain': window.location.hostname
  },
    'position': 'bottom',
    'theme': 'edgeless',
    'palette': {
    'popup': {
      'background': '#000000',
        'text': '#ffffff',
        'link': '#ffffff'
    },
    'button': {
      'background': '#236192',
        'text': '#ffffff',
        'border': 'transparent'
    }
  },
    'type': 'info',
    'content': {
      'message': 'This website uses cookies to ensure you get the best experience on our website.',
        'dismiss': 'Dismiss',
        'deny': 'Refuse cookies',
        'link': 'Learn more',
        'href': 'https://cookiesandyou.com',
        'policy': 'Cookie Policy'
    }
};

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export const routes = [
  { path: '**', name: 'AppComponent', component: AppComponent },
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    BrowserAnimationsModule,
    NgcCookieConsentModule.forRoot(cookieConfig),
    MatBottomSheetModule,
    MatSharedModule,
    RouterModule.forRoot(routes, {useHash: true}),
    StoreModule.forRoot(store.reducers, {metaReducers: store.metaReducers}),
    EffectsModule.forRoot(store.appEffects),
    MatSidenavModule,
    MatTableModule,
    MatSortModule,
    SidebarModule,
    MapModule,
    ResultsMenuModule,
    HeaderModule,
    MatMenuModule,
    MatFormFieldModule,
    MatIconModule,
    MatDialogModule,
    BaselineChartModule,
    HelpModule,
    ToastrModule.forRoot({positionClass: 'inline', preventDuplicates: true}),
    CodeExportModule
  ],
  providers: [
    services.AsfApiService,
    services.AsfLanguageService,
    services.UrlStateService,
    services.MapService,
    services.DrawService,
    services.WktService,
    services.LayerService,
    services.ProductService,
    services.BulkDownloadService,
    services.SearchParamsService,
    services.RangeService,
    services.PolygonValidationService,
    services.DateExtremaService,
    services.EnvironmentService,
    services.PropertyService,
    services.LegacyAreaFormatService,
    services.BannerApiService,
    services.ScreenSizeService,
    services.KeyboardService,
    services.UserDataService,
    services.SavedSearchService,
    services.UnzipApiService,
    services.ScenesService,
    services.SearchService,
    services.Hyp3Service,
    services.PairService,
    services.SceneSelectService,
    services.OnDemandService,
    services.PossibleHyp3JobsService,
    {provide: SAVER, useFactory: getSaver},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    // { provide: Window, useValue: window },
  ],
  bootstrap: [AppComponent],
    exports: [MatTableModule],
})

export class AppModule { }


