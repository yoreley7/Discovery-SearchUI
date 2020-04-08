import { Component, OnInit, OnDestroy } from '@angular/core';

import { AppState } from '@store';
import { Store } from '@ngrx/store';
import * as scenesStore from '@store/scenes';

import { SubSink } from 'subsink';
import * as models from '@models';
import { ScreenSizeService } from '@services';

enum FilterPanel {
  MASTER = 'Master',
  DATE = 'Date',
  BASELINE = 'Baseline'
}

@Component({
  selector: 'app-baseline-search',
  templateUrl: './baseline-search.component.html',
  styleUrls: ['./baseline-search.component.scss']
})
export class BaselineSearchComponent implements OnInit, OnDestroy {
  public breakpoint$ = this.screenSize.breakpoint$;
  public breakpoints = models.Breakpoints;
  public areResultsLoaded: boolean;

  selectedPanel: FilterPanel | null = null;
  panels = FilterPanel;
  defaultPanelOpenState = true;
  panelIsDisabled = true;
  customCollapsedHeight = '30px';
  customExpandedHeight = '30px';

  private subs = new SubSink();

  constructor(
    private store$: Store<AppState>,
    private screenSize: ScreenSizeService
  ) { }

  ngOnInit() {
    this.subs.add(
      this.store$.select(scenesStore.getAreResultsLoaded).subscribe(
        areLoaded => this.areResultsLoaded = areLoaded
      )
    );
  }

  public isSelected(panel: FilterPanel): boolean {
    return this.selectedPanel === panel;
  }

  public selectPanel(panel: FilterPanel): void {
    this.selectedPanel = panel;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
