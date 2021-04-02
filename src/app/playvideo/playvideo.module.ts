import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlayvideoPageRoutingModule } from './playvideo-routing.module';

import { PlayvideoPage } from './playvideo.page';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlayvideoPageRoutingModule,
    PipesModule
  ],
  declarations: [PlayvideoPage]
})
export class PlayvideoPageModule {}
