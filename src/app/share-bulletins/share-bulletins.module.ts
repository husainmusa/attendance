import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShareBulletinsPageRoutingModule } from './share-bulletins-routing.module';

import { ShareBulletinsPage } from './share-bulletins.page';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareBulletinsPageRoutingModule,
    PipesModule
  ],
  declarations: [ShareBulletinsPage]
})
export class ShareBulletinsPageModule {}
