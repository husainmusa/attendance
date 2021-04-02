import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectBulletinsUserPageRoutingModule } from './select-bulletins-user-routing.module';

import { SelectBulletinsUserPage } from './select-bulletins-user.page';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    SelectBulletinsUserPageRoutingModule
  ],
  declarations: [SelectBulletinsUserPage]
})
export class SelectBulletinsUserPageModule {}
