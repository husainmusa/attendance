import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SendmessagePageRoutingModule } from './sendmessage-routing.module';

import { SendmessagePage } from './sendmessage.page';
import { PipesModule } from '../pipes/pipes.module';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SendmessagePageRoutingModule,
    PipesModule,
    IonicSelectableModule
  ],
  declarations: [SendmessagePage]
})
export class SendmessagePageModule {}
