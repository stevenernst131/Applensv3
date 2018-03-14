import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { CUSTOM_MOMENT_FORMATS } from '../../shared/models/datetime';

export const MainModuleRoutes : ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: MainComponent
  }
])

/*
 * If possible do no import SharedModule to this module
 * This will mean that we don't have to initialize that module to start up the app 
 */

@NgModule({
  imports: [
    CommonModule,
    MainModuleRoutes,
    FormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    OwlMomentDateTimeModule 
  ],
  providers: [{
    provide: OWL_DATE_TIME_FORMATS, 
    useValue: CUSTOM_MOMENT_FORMATS
  }],
  declarations: [MainComponent]
})
export class MainModule { }
