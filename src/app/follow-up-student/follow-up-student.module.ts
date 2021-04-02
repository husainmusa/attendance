import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FollowUpStudentPageRoutingModule } from './follow-up-student-routing.module';

import { FollowUpStudentPage } from './follow-up-student.page';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    FollowUpStudentPageRoutingModule
  ],
  declarations: [FollowUpStudentPage]
})
export class FollowUpStudentPageModule {}
