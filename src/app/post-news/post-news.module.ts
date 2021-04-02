import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PostNewsPageRoutingModule } from './post-news-routing.module';

import { PostNewsPage } from './post-news.page';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    PostNewsPageRoutingModule
  ],
  declarations: [PostNewsPage]
})
export class PostNewsPageModule {}
