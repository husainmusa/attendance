import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FollowupAddFieldsPageRoutingModule } from './followup-add-fields-routing.module';

import { FollowupAddFieldsPage } from './followup-add-fields.page';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    FollowupAddFieldsPageRoutingModule
  ],
  declarations: [FollowupAddFieldsPage]
})
export class FollowupAddFieldsPageModule {}
