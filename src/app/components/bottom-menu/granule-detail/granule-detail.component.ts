import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';

import { Store } from '@ngrx/store';

import { AppState } from '@store';
import * as filtersStore from '@store/filters';

import * as models from '@models';
import { DatapoolAuthService, MapService, WktService } from '@services';
import { ImageDialogComponent } from './image-dialog';

@Component({
  selector: 'app-granule-detail',
  templateUrl: './granule-detail.component.html',
  styleUrls: ['./granule-detail.component.css']
})
export class GranuleDetailComponent {
  @Input() granule: models.CMRProduct;
  @Input() platform: models.Platform;
  @Input() searchType: models.SearchType;

  public searchTypes = models.SearchType;

  constructor(
    public dialog: MatDialog,
    public authService: DatapoolAuthService,
    private store$: Store<AppState>,
    private mapService: MapService,
    private wktService: WktService,
  ) {}

  public onOpenImage(granule: models.CMRProduct): void {
    this.dialog.open(ImageDialogComponent, {
      height: '1200px',
      width: '1200px',
      maxWidth: '90%',
      maxHeight: '90%',
      panelClass: 'image-dialog'
    });
  }

  public isGeoSearch(): boolean {
    return this.searchType === models.SearchType.DATASET;
  }

  public hasValue(v: any): boolean {
    return v !== null && v !== undefined;
  }

  public shouldHideWith(platformNames: string[]): boolean {
    return platformNames.includes(this.platform.name);
  }

  public onZoomToGranule(): void {
    const features = this.wktService.wktToFeature(
      this.granule.metadata.polygon,
      this.mapService.epsg()
    );

    this.mapService.zoomTo(features);
  }

  public onSetBeamMode(): void {
    this.store$.dispatch(
      new filtersStore.AddBeamMode(this.granule.metadata.beamMode)
    );
  }

  public setStartDate(): void {
    this.store$.dispatch(
      new filtersStore.SetStartDate(this.granule.metadata.date)
    );
  }

  public setEndDate(): void {
    this.store$.dispatch(
      new filtersStore.SetEndDate(this.granule.metadata.date)
    );
  }

  public setPathStart(): void {
    this.store$.dispatch(
      new filtersStore.SetPathStart(this.granule.metadata.path)
    );
  }

  public setPathEnd(): void {
    this.store$.dispatch(
      new filtersStore.SetPathEnd(this.granule.metadata.path)
    );
  }

  public setFrameStart(): void {
    this.store$.dispatch(
      new filtersStore.SetFrameStart(this.granule.metadata.frame)
    );
  }

  public setFrameEnd(): void {
    this.store$.dispatch(
      new filtersStore.SetFrameEnd(this.granule.metadata.frame)
    );
  }

  public setFlightDirection(): void {
    const dir = this.granule.metadata.flightDirection
      .toLowerCase();

    const capitalized = this.capitalizeFirstLetter(dir);

    this.store$.dispatch(
      new filtersStore.SetFlightDirections([<models.FlightDirection>capitalized])
    );
  }

  public addPolarization(): void {
    this.store$.dispatch(new filtersStore.AddPolarization(this.granule.metadata.polarization));
  }

  private capitalizeFirstLetter(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
