import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddNotesPageRoutingModule } from './add-notes-routing.module';

import { AddNotesPage } from './add-notes.page';
import { PipesModule } from '../pipes/pipes.module';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    AddNotesPageRoutingModule,
    IonicSelectableModule
  ],
  declarations: [AddNotesPage]
})
export class AddNotesPageModule {}
