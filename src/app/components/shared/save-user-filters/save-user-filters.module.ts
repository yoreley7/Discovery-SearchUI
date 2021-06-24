import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatSharedModule } from '@shared';
import { SaveUserFiltersComponent } from './save-user-filters.component';
import { SavedSearchesModule } from '../saved-searches';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { SaveUserFilterComponent } from './save-user-filter/save-user-filter.component';
@NgModule({
  declarations: [
    SaveUserFiltersComponent,
    SaveUserFilterComponent
  ],
  imports: [
    CommonModule,
    MatSharedModule,
    MatButtonToggleModule,
    MatInputModule,
    FormsModule,
    MatMenuModule,
    MatExpansionModule,
    SavedSearchesModule,
  ],
  exports: [
    SaveUserFiltersComponent
  ]
})
export class SaveUserFiltersModule { }
