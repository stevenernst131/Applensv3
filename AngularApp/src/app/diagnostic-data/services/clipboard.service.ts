import { Injectable } from '@angular/core';
import * as clipboard from 'copy-html-to-clipboard';

@Injectable()
export class ClipboardService {

  copyAsHtml(htmlString: string) {

    clipboard(htmlString, {
      asHtml:true
    });
  }
}
