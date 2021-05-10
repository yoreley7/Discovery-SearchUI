import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import { map, withLatestFrom, switchMap, tap, skip } from 'rxjs/operators';

import { AppState } from '../app.reducer';
import {
  QueueActionType, DownloadMetadata, AddItems, RemoveItems,
  RemoveSceneFromQueue, DownloadSearchtypeMetadata,
  AddJob, RemoveJob, AddJobs, ToggleProduct, QueueScene, FindPair
} from './queue.action';
import { getQueuedProducts } from './queue.reducer';
import * as scenesStore from '@store/scenes';

import * as services from '@services';
import * as models from '@models';

export interface MetadataDownload {
  params: {[id: string]: string | null};
  format: models.AsfApiOutputFormat;
}

@Injectable()
export class QueueEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<AppState>,
    private asfApiService: services.AsfApiService,
    private searchParamsService: services.SearchParamsService,
    private bulkDownloadService: services.BulkDownloadService,
    private notificationService: services.NotificationService,
  ) {}

  public makeDownloadScript = createEffect(() => this.actions$.pipe(
    ofType(QueueActionType.MAKE_DOWNLOAD_SCRIPT),
    withLatestFrom(this.store$.select(getQueuedProducts)),
    map(([_, products]) => products),
    switchMap(
      products => this.bulkDownloadService.downloadScript$(products)
    ),
    map(
      req => { FileSaver.saveAs(req.body, req.headers.get('Content-Disposition').slice(20)); }
    )
  ), { dispatch: false });

  public downloadSearchtypeMetadata = createEffect(() => this.actions$.pipe(
    ofType<DownloadSearchtypeMetadata>(QueueActionType.DOWNLOAD_SEARCHTYPE_METADATA),
    map(action => action.payload),
    withLatestFrom(this.searchParamsService.getParams()),
    map(
      ([format, searchParams]) =>  ({
        format,
        searchParams})
    ),
    map(
      (x): MetadataDownload => ({
        params: { ...x.searchParams, ...{output: x.format.toLowerCase()} },
        format: x.format
      })
    ),
    switchMap(
      (search: MetadataDownload) => this.downloadSearch(search)
    ),
  ), { dispatch: false });

  public downloadMetadata = createEffect(() => this.actions$.pipe(
    ofType<DownloadMetadata>(QueueActionType.DOWNLOAD_METADATA),
    map(action => action.payload),
    withLatestFrom(this.store$.select(getQueuedProducts).pipe(
        map(
          products => products
            .map(product => product.id)
            .join(',')
        ),
        map(
          productIds => ({
            product_list: productIds
          })
        )
      )
    ),
    map(
      ([format, params]): MetadataDownload => ({
        params: { ...params, ...{output: format} },
        format
      })
    ),
    switchMap(
      (search: MetadataDownload) => this.downloadSearch(search),
    ),
  ), { dispatch: false });

  public findPair = createEffect(() => this.actions$.pipe(
    ofType<FindPair>(QueueActionType.FIND_PAIR),
  ), { dispatch: false });

  public queueScene = createEffect(() => this.actions$.pipe(
    ofType<QueueScene>(QueueActionType.QUEUE_SCENE),
    withLatestFrom(this.store$.select(scenesStore.getAllSceneProducts)),
    map(([action, sceneProducts]) => sceneProducts[action.payload]),
    map(products => new AddItems(products))
  ));

  public toggleProduct = createEffect(() => this.actions$.pipe(
    ofType<ToggleProduct>(QueueActionType.TOGGLE_PRODUCT),
    withLatestFrom(this.store$.select(getQueuedProducts)),
    map(([action, sceneProducts]) => sceneProducts.includes(action.payload)),
    tap(inQueue => this.notificationService.downloadQueue(inQueue))
  ),
    { dispatch: false }
  );

  public addItems = createEffect(() => this.actions$.pipe(
    ofType<AddItems>(QueueActionType.ADD_ITEMS),
    skip(1),
    tap(act => this.notificationService.downloadQueue(true, act.payload.length)),
  ),
    { dispatch: false }
  );

  public addJob = createEffect(() => this.actions$.pipe(
    ofType<AddJob>(QueueActionType.ADD_JOB),
    tap(act => this.notificationService.demandQueue(true, 1, act.payload.job_type.name)),
  ),
    { dispatch: false }
  );

  public addJobs = createEffect(() => this.actions$.pipe(
    ofType<AddJobs>(QueueActionType.ADD_JOBS),
    skip(1),
    map(action => action.payload),
    tap(jobs => this.notificationService.demandQueue(true, jobs.length, jobs[0].job_type.name)),
  ),
    { dispatch: false }
  );

  public removeJob = createEffect(() => this.actions$.pipe(
    ofType<RemoveJob>(QueueActionType.REMOVE_JOB),
    map(action => action.payload),
    tap(job => this.notificationService.demandQueue(false, 1, job.job_type.name)),
  ),
    { dispatch: false }
  );

  public removeScene = createEffect(() => this.actions$.pipe(
    ofType<RemoveSceneFromQueue>(QueueActionType.REMOVE_SCENE_FROM_QUEUE),
    withLatestFrom(this.store$.select(scenesStore.getAllSceneProducts)),
    map(([action, sceneProducts]) => sceneProducts[action.payload]),
    tap(products => this.notificationService.downloadQueue(false, products.length)),
    map(products => new RemoveItems(products))
  ));

  private downloadSearch(search: MetadataDownload) {
    return this.asfApiService.query<string>(search.params).pipe(
      map(resp => new Blob([resp], { type: 'text/plain'})),
      map(
        blob => FileSaver.saveAs(blob,
          `asf-datapool-results-${this.currentDate()}.${search.format.toLowerCase()}`
        )
      )
    );
  }

  private currentDate(): string {
    return moment().format('YYYY-MM-DD_hh-mm-ss');
  }
}
