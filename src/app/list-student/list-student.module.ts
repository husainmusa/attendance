import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListStudentPageRoutingModule } from './list-student-routing.module';

import { ListStudentPage } from './list-student.page';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListStudentPageRoutingModule,
    PipesModule
  ],
  declarations: [ListStudentPage]
})
export class ListStudentPageModule {}
