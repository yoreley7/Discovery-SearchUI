import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatBottomSheet } from '@angular/material';

import { Store } from '@ngrx/store';

import { filter, map, switchMap, tap, catchError } from 'rxjs/operators';

import { SpreadsheetComponent } from '@components/spreadsheet';

import { AppState } from '@store';
import * as granulesStore from '@store/granules';
import * as mapStore from '@store/map';
import * as filterStore from '@store/filters';
import * as searchStore from '@store/search';

import * as services from '@services';
import * as models from './models';

@Component({
  selector   : 'app-root',
  templateUrl: './app.component.html',
  styleUrls  : ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public shouldOmitSearchPolygon$ = this.store$.select(filterStore.getShouldOmitSearchPolygon);

  public interactionTypes = models.MapInteractionModeType;

  constructor(
    private store$: Store<AppState>,
    private bottomSheet: MatBottomSheet,
    private mapService: services.MapService,
    private urlStateService: services.UrlStateService,
    private polygonValidationService: services.PolygonValidationService,
  ) {}

  public ngOnInit(): void {
    this.polygonValidationService.validate();
  }

  public onLoadUrlState(): void {
    this.urlStateService.load();
  }

  public onOpenSpreadsheet(): void {
    this.bottomSheet.open(SpreadsheetComponent, {
      panelClass: 'spreadsheet-width'
    });
  }

  public onNewSearch(): void {
    this.store$.dispatch(new searchStore.MakeSearch());
  }

  public onClearSearch(): void {
    this.store$.dispatch(new granulesStore.ClearGranules());
    this.store$.dispatch(new filterStore.ClearFilters());
    this.mapService.clearDrawLayer();
  }
}
