import { Component, OnInit } from '@angular/core';
import * as models from '@models';
import { Store } from '@ngrx/store';
// import { SarviewsEventsService } from '@services';
import { filter } from 'rxjs/operators';
import { AppState } from '@store';
import { SubSink } from 'subsink';
import { getSelectedSarviewsEventProducts } from '@store/scenes';
import { SetSarviewsEventProductEndDate, SetSarviewsEventProductStartDate } from '@store/filters';

@Component({
  selector: 'app-event-products-date-selector',
  templateUrl: './event-products-date-selector.component.html',
  styleUrls: ['./event-products-date-selector.component.scss']
})
export class EventProductsDateSelectorComponent implements OnInit {

  private subs = new SubSink();
  public dateRange: models.Range<Date | null> = {start: null, end: null};
  public startDate: Date;
  public endDate: Date;

  constructor(
    private store$: Store<AppState>,
    // private eventMonitoringService: SarviewsEventsService
  ) { }

  ngOnInit(): void {
    this.subs.add(
      this.store$.select(getSelectedSarviewsEventProducts).
      pipe(
        filter(products => products?.length > 0)
      ).subscribe(
        products => {
          var dates = products.map(product => product.granules.map(granule => granule.acquisition_date).sort());
          var minToMax = dates.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
          this.dateRange = {start: new Date(minToMax[0][0]), end: new Date(minToMax[minToMax.length -1][0])}

        }
      )
    )
  }

  public onSetStartDate(startDate: Date) {
    // this.startDate = startDate;
    this.store$.dispatch(new SetSarviewsEventProductStartDate(new Date(startDate)));
  }

  public onSetEndDate(endDate: Date) {
    // this.endDate = endDate;
    this.store$.dispatch(new SetSarviewsEventProductEndDate(new Date(endDate)));
  }

}
