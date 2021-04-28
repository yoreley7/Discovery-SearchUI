import { Injectable } from '@angular/core';

import { Observable, combineLatest } from 'rxjs';
import { debounceTime, map, withLatestFrom } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import { AppState } from '@store/app.reducer';
import { getScenes, getCustomPairs } from '@store/scenes/scenes.reducer';
import {
  getTemporalRange, getPerpendicularRange, getDateRange, DateRangeState, getSeason
} from '@store/filters/filters.reducer';
import { getSearchType } from '@store/search/search.reducer';

import { CMRProduct, CMRProductPair, ColumnSortDirection, Range, SearchType } from '@models';

@Injectable({
  providedIn: 'root'
})
export class PairService {

  constructor(private store$: Store<AppState>) { }

  public productsFromPairs$(): Observable<CMRProduct[]> {
    return this.pairs$().pipe(
      map(({ custom, pairs }) => {
        const prods = Array.from([...custom, ...pairs].reduce((products, pair) => {
          products.add(pair[0]);
          products.add(pair[1]);

          return products;
        }, new Set<CMRProduct>()));

        return prods;
      })
    );
  }

  public pairs$(): Observable<{custom: CMRProductPair[], pairs: CMRProductPair[]}> {
    return combineLatest(
      this.store$.select(getScenes).pipe(
        map(
          scenes => this.temporalSort(scenes, ColumnSortDirection.INCREASING)
        ),
      ),
      this.store$.select(getCustomPairs),
      this.store$.select(getTemporalRange).pipe(
        map(range => range.start)
      ),
      this.store$.select(getPerpendicularRange).pipe(
        map(range => range.start)
      ),
      this.store$.select(getDateRange),
      this.store$.select(getSeason),
    ).pipe(
      debounceTime(250),
      withLatestFrom(this.store$.select(getSearchType)),
      map(([params, searchType]) => {
        const [scenes, customPairs, temporal, perp, dateRange, season] = params;

        return searchType === SearchType.SBAS ? ({
          pairs: [...this.makePairs(scenes, temporal, perp, dateRange, season)],
          custom: [ ...customPairs ]
        }) : ({
          pairs: [],
          custom: []
        });
      })
    );
  }

  private makePairs(scenes: CMRProduct[], tempThreshold: number, perpThreshold,
    dateRange: DateRangeState,
    season): CMRProductPair[] {
    const pairs = [];

    let startDateExtrema: Date;
    let endDateExtrema: Date;

    if (!!dateRange.start) {
    startDateExtrema = new Date(dateRange.start.toISOString());
    }
    if (!!dateRange.end) {
      endDateExtrema = new Date(dateRange.end.toISOString());
    }

    // }

    scenes.forEach((root, index) => {
      for (let i = index + 1; i < scenes.length; ++i) {
        const scene = scenes[i];
        const tempDiff = scene.metadata.temporal - root.metadata.temporal;
        const perpDiff = Math.abs(scene.metadata.perpendicular - root.metadata.perpendicular);

        const P1StartDate = new Date(root.metadata.date.toISOString());
        const P1StopDate = new Date(root.metadata.stopDate.toISOString());
        const P2StartDate = new Date(scene.metadata.date.toISOString());
        const P2StopDate = new Date(scene.metadata.stopDate.toISOString());

        // const p1DayOfYear = this.getDayOfYear(P1StartDate);
        // const p2DayOfYear = this.getDayOfYear(P2StopDate);

        if (!!season.start && !!season.end) {
          // if ( P1StartDate < P2StartDate) {
            if (!this.dayInSeason(P1StartDate, P1StopDate, P2StartDate, P2StopDate, season)) {
              return;
            }
        // } else {
        //   if (!this.dayInSeason(P2StartDate, P2StopDate, P1StartDate, P1StopDate, season)) {
        //     return;
        //   }
        // }
        }

        if (tempDiff > tempThreshold || perpDiff > perpThreshold) {
          return;
        }

        if (startDateExtrema !== null) {
          if (P1StartDate < startDateExtrema || P2StartDate < startDateExtrema) {
            return;
          }
        }

        if (endDateExtrema !== null) {
          if ( P1StopDate > endDateExtrema || P2StopDate > endDateExtrema) {
              return;
            }
        }

        pairs.push([root, scene]);
      }
    });

    return pairs;
  }

  public findNearestneighbour(reference_scene: CMRProduct, 
    scenes: CMRProduct[], 
    temporal: boolean, perpendicular: boolean, 
    temporalRange: Range<number>, perpendicularRange: Range<number>,
    amount: number) {

    scenes = this.hyp3able(scenes);
    scenes = scenes.filter(scene => 
      scene.id.includes('SLC')
      && !scene.id.includes('METADATA') 
      && (temporal ? scene.metadata.temporal != null : scene.metadata.perpendicular != null)
    );

    console.log(scenes);
    // let neighbours: number[];

    // if(temporal && perpendicular) {
    //   // scenes.sort((a, b) => a.metadata.temporal < b.metadata.temporal ? -1 : 1);
    //   neighbours = scenes.map(scene => scene.metadata.perpendicular);
    // } else {
    //   // scenes.sort((a, b) => a.metadata.perpendicular < b.metadata.perpendicular ? -1 : 1);
    //   neighbours = scenes.map(scene => scene.metadata.perpendicular);
    // }

    const RefperpDiffNormalized = (reference_scene.metadata.perpendicular - perpendicularRange.start)
      / (perpendicularRange.end - perpendicularRange.start);

    const ReftempDiffNormalized = (reference_scene.metadata.temporal - temporalRange.start)
      / (temporalRange.end - temporalRange.start);

    const refPoint = [RefperpDiffNormalized, ReftempDiffNormalized];

    let SortedScenes = scenes.sort((a, b) => {
      let AperpDiffNormalized = RefperpDiffNormalized;
      let AtempDiffNormalized = ReftempDiffNormalized;
      let BperpDiffNormalized = RefperpDiffNormalized;
      let BtempDiffNormalized = ReftempDiffNormalized;
      if(perpendicular) {
        AperpDiffNormalized = (a.metadata.perpendicular - perpendicularRange.start) / (perpendicularRange.end - perpendicularRange.start);
        BperpDiffNormalized = (b.metadata.perpendicular - perpendicularRange.start) / (perpendicularRange.end - perpendicularRange.start);

      }


      if
      (temporal) {
        BtempDiffNormalized = (b.metadata.temporal - temporalRange.start) / (temporalRange.end - temporalRange.start);
        AtempDiffNormalized = (a.metadata.temporal - temporalRange.start) / (temporalRange.end - temporalRange.start);
      }

      const PointA = [AperpDiffNormalized, AtempDiffNormalized];
      const PointB = [BperpDiffNormalized, BtempDiffNormalized];
      if(this.distance(PointA, refPoint) < this.distance(PointB, refPoint)) {
        return -1;
      }

      return 1;
    }
    );

    // const reference_idx = scenes.findIndex(scene => scene.id === reference_scene.id);

    // let neighbour_idx = reference_idx;

    // if (reference_idx === scenes.length - 1) {
    //   neighbour_idx = reference_idx - 1;
    // } else if (reference_idx === 0) {
    //   neighbour_idx = reference_idx + 1;
    // } else {
    //   const left_neighbour_diff = Math.abs(neighbour_idx[reference_idx] - neighbours[reference_idx - 1]);
    //   const right_neighbour_diff = Math.abs(neighbour_idx[reference_idx] - neighbours[reference_idx - 1]);
    //   neighbour_idx = left_neighbour_diff < right_neighbour_diff ? reference_idx - 1 : reference_idx + 1;
    // }

    console.log(SortedScenes);
    return SortedScenes.slice(0, Math.min(amount, SortedScenes.length));

  }

  private distance(lhs: number[], rhs: number[]) {
    return Math.sqrt(Math.pow(lhs[0] - rhs[0], 2) + Math.pow(lhs[1] - rhs[1], 2));
  }

  private hyp3able(products: CMRProduct[]) {
    return products.filter(product => !product.metadata.polarization.includes('Dual'));
  }

  private dayInSeason(P1StartDate: Date, P1EndDate: Date, P2StartDate: Date, P2EndDate: Date, season) {
    if (season.start < season.end) {
        return (
          season.start <= this.getDayOfYear(P1StartDate)
          && season.end >= this.getDayOfYear(P1EndDate)
          && season.start <= this.getDayOfYear(P2StartDate)
          && season.end >= this.getDayOfYear(P2EndDate)
        );
      } else {
        return !(
          season.start >= this.getDayOfYear(P1StartDate)
          && season.start >= this.getDayOfYear(P1EndDate)
          && season.end <= this.getDayOfYear(P1StartDate)
          && season.end <= this.getDayOfYear(P1EndDate)
          && season.start >= this.getDayOfYear(P2StartDate)
          && season.start >= this.getDayOfYear(P2EndDate)
          && season.end <= this.getDayOfYear(P2StartDate)
          && season.end <= this.getDayOfYear(P2EndDate)
        );
      }
  }

  private getDayOfYear(date: Date) {
    const temp = new Date(date.getFullYear(), 0, 0);
    return Math.floor(date.getTime() - temp.getTime()) / 1000 / 60 / 60 / 24;
  }

  private temporalSort(scenes, direction: ColumnSortDirection) {
    const sortFunc = (direction === ColumnSortDirection.INCREASING) ?
        (a, b) => a.metadata.temporal - b.metadata.temporal :
        (a, b) => b.metadata.temporal - a.metadata.temporal;

    return scenes.sort(sortFunc);
  }
}
