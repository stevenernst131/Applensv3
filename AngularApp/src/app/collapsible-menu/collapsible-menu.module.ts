import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollapsibleMenuComponent } from './components/collapsible-menu/collapsible-menu.component';
import { CollapsibleMenuItemComponent, SearchPipe, SearchMatchPipe } from './components/collapsible-menu-item/collapsible-menu-item.component';
import { SectionDividerComponent } from './components/section-divider/section-divider.component';
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { MenuScrollComponent } from './components/menu-scroll/menu-scroll.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [CollapsibleMenuComponent, CollapsibleMenuItemComponent, SectionDividerComponent, SearchBoxComponent, MenuScrollComponent, SearchPipe, SearchMatchPipe],
  exports: [CollapsibleMenuComponent, CollapsibleMenuItemComponent, SectionDividerComponent, SearchBoxComponent, MenuScrollComponent]
})
export class CollapsibleMenuModule { }
