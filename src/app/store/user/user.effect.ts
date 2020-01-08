import { Injectable } from '@angular/core';

import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store, Action } from '@ngrx/store';

import { Observable, combineLatest } from 'rxjs';
import { withLatestFrom, switchMap, map, tap } from 'rxjs/operators';

import { AppState } from '../app.reducer';
import * as userActions from './user.action';
import * as userReducer from './user.reducer';

import { UserDataService } from '@services/user-data.service';
import { Search } from '@models';

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private store$: Store<AppState>,
    private userDataService: UserDataService,
  ) {}

  @Effect({ dispatch: false })
  private saveUserProfile: Observable<void> = this.actions$.pipe(
    ofType<userActions.SaveProfile>(userActions.UserActionType.SAVE_PROFILE),
    withLatestFrom(
      combineLatest(
        this.store$.select(userReducer.getUserAuth),
        this.store$.select(userReducer.getUserProfile)
      )
    ),
    switchMap(
      ([_, [userAuth, profile]]) =>
        this.userDataService.setAttribute$(userAuth, 'profile', profile)
    )
  );

  @Effect({ dispatch: false })
  private saveSavedSearches: Observable<void> = this.actions$.pipe(
    ofType<userActions.SaveSearches>(userActions.UserActionType.SAVE_SEARCHES),
    withLatestFrom(
      combineLatest(
        this.store$.select(userReducer.getUserAuth),
        this.store$.select(userReducer.getSavedSearches)
      )
    ),
    switchMap(
      ([_, [userAuth, searches]]) =>
        this.userDataService.setAttribute$(userAuth, 'SavedSearches', searches)
    ),
    tap(searches => console.log(searches)),
  );

  @Effect()
  private loadSavedSearches: Observable<Action> = this.actions$.pipe(
    ofType<userActions.LoadSavedSearches>(userActions.UserActionType.LOAD_SAVED_SEARCHES),
    withLatestFrom( this.store$.select(userReducer.getUserAuth)),
    switchMap(
      ([_, userAuth]) =>
        this.userDataService.getAttribute$(userAuth, 'SavedSearches')
    ),
    map(searches => new userActions.SetSearches(<Search[]>searches))
  );
}
