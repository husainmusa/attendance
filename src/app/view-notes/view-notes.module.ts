import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewNotesPageRoutingModule } from './view-notes-routing.module';

import { ViewNotesPage } from './view-notes.page';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewNotesPageRoutingModule,
    PipesModule
  ],
  declarations: [ViewNotesPage]
})
export class ViewNotesPageModule {}
