import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasecleansingComponent } from './casecleansing/casecleansing.component';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { RouterModule } from '@angular/router';

export const CasecleansingModuleRoutes : ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: CasecleansingComponent
  }
]);

@NgModule({
  imports: [
    CommonModule,
    CasecleansingModuleRoutes
  ],
  declarations: [CasecleansingComponent]
})
export class CasecleansingModule { }
