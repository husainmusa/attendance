import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterStudentPage } from './register-student.page';

const routes: Routes = [
  {
    path: '',
    component: RegisterStudentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterStudentPageRoutingModule {}
