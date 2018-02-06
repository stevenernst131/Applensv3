import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { RouterModule } from '@angular/router';
import { SignalContainerComponent } from '../../shared/components/signal-container/signal-container.component';

export const DashboardModuleRoutes : ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: 'signals/:signal',
        component: SignalContainerComponent
      }
    ]
  },

])

@NgModule({
  imports: [
    CommonModule,
    DashboardModuleRoutes,
    SharedModule
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
