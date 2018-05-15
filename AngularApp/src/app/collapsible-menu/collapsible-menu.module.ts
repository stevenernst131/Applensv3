import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollapsibleMenuComponent } from './components/collapsible-menu/collapsible-menu.component';
import { CollapsibleMenuItemComponent } from './components/collapsible-menu-item/collapsible-menu-item.component';
import { SectionDividerComponent } from './components/section-divider/section-divider.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [CollapsibleMenuComponent, CollapsibleMenuItemComponent, SectionDividerComponent],
  exports: [CollapsibleMenuComponent, CollapsibleMenuItemComponent, SectionDividerComponent]
})
export class CollapsibleMenuModule { }
