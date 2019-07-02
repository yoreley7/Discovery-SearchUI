import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '@environments/environment';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import * as store from './store';

import { NavBarModule } from '@components/nav-bar';
import { SidebarModule } from '@components/sidebar';
import { MapModule } from '@components/map';
import { BottomMenuModule } from '@components/bottom-menu';
import { MatSharedModule } from '@shared';
import { LogoModule } from '@components/nav-bar/logo/logo.module';
import { AdditionalFiltersModule } from '@components/additional-filters';

import * as services from '@services';

import { AppComponent } from './app.component';

export const routes = [
  { path: '**', name: 'AppComponent', component: AppComponent },
];


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatSnackBarModule,
    MatBottomSheetModule,
    MatSidenavModule,
    MatSharedModule,

    RouterModule.forRoot(routes, { useHash: true }),
    StoreModule.forRoot(store.reducers, { metaReducers: store.metaReducers }),
    EffectsModule.forRoot(store.appEffects),
    !environment.production ? StoreDevtoolsModule.instrument() : [],

    SidebarModule,
    AdditionalFiltersModule,
    MapModule,
    BottomMenuModule,
    NavBarModule,
  ],
  providers: [
    services.AsfApiService,
    services.UrlStateService,
    services.MapService,
    services.DrawService,
    services.WktService,
    services.ProductService,
    services.BulkDownloadService,
    services.SearchParamsService,
    services.RangeService,
    services.PolygonValidationService,
    services.DateExtremaService,
    services.EnvironmentService,
    services.PropertyService,
    services.HistoryService,
  ],
  bootstrap: [ AppComponent ],
})
export class AppModule {}
