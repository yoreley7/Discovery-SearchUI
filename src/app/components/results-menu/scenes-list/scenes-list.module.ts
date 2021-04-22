import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { TruncateModule } from '@yellowspot/ng-truncate';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

import { MatSharedModule } from '@shared';
import { PipesModule } from '@pipes';

import { OnDemandAddMenuModule } from '@components/shared/on-demand-add-menu';
import { CopyToClipboardModule } from '@components/shared/copy-to-clipboard';
import { FileNameModule } from '@components/shared/file-name';
import { ScenesListComponent } from './scenes-list.component';
import { SceneComponent } from './scene/scene.component';
import { Hyp3JobComponent } from './hyp3-job/hyp3-job.component';
import { PairComponent } from './pair/pair.component';


@NgModule({
  declarations: [
    ScenesListComponent,
    SceneComponent,
    Hyp3JobComponent,
    PairComponent,
  ],
  imports: [
    CommonModule,
    ScrollingModule,
    MatBadgeModule,
    MatChipsModule,
    TruncateModule,
    FontAwesomeModule,
    CopyToClipboardModule,
    MatSharedModule,
    MatMenuModule,
    PipesModule,
    FileNameModule,
    OnDemandAddMenuModule,
  ],
  exports: [
    ScenesListComponent
  ]
})
export class ScenesListModule { }
