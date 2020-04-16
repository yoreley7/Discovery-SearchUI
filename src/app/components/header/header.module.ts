import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';

import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MatSharedModule } from '@shared';
import { HeaderComponent } from './header.component';

import { QueueModule } from './queue';
import { NavButtonsModule } from './nav-buttons';
import { InfoBarComponent } from './info-bar/info-bar.component';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';

import { DatasetSelectorModule } from '@components/shared/selectors/dataset-selector';
import { DateSelectorModule } from '@components/shared/selectors/date-selector';
import { AoiOptionsModule } from '@components/shared/aoi-options';
import { MaxResultsSelectorModule } from '@components/shared/max-results-selector';
import { SearchButtonModule } from '@components/shared/search-button';
import { ClearButtonModule } from '@components/shared/clear-button';
import { PipesModule } from '@pipes';
import { SearchTypeSelectorModule } from '@components/shared/selectors/search-type-selector';

import { LogoModule } from '@components/header/logo/logo.module';
import { DatasetNavComponent } from './dataset-nav/dataset-nav.component';
import { ListNavComponent } from './list-nav/list-nav.component';
import { AoiFilterComponent } from './dataset-nav/aoi-filter/aoi-filter.component';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { BaselineHeaderComponent } from './baseline-header/baseline-header.component';
import { MasterSceneSelectorModule } from '@components/shared/selectors/master-scene-selector';


@NgModule({
  declarations: [
    HeaderComponent,
    InfoBarComponent,
    DatasetNavComponent,
    ListNavComponent,
    AoiFilterComponent,
    BaselineHeaderComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    FlexLayoutModule,
    MatButtonToggleModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatMenuModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatSharedModule,
    PipesModule,

    QueueModule,

    SearchTypeSelectorModule,
    DatasetSelectorModule,
    DateSelectorModule,
    AoiOptionsModule,
    MaxResultsSelectorModule,
    SearchButtonModule,
    ClearButtonModule,
    NavButtonsModule,
    MasterSceneSelectorModule,
    LogoModule,
  ],
  exports: [
    HeaderComponent
  ]
})
export class HeaderModule { }
