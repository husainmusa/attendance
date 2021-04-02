import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SchoolRegistrationPageRoutingModule } from './school-registration-routing.module';

import { SchoolRegistrationPage } from './school-registration.page';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchoolRegistrationPageRoutingModule,
    PipesModule
  ],
  declarations: [SchoolRegistrationPage]
})
export class SchoolRegistrationPageModule {}
