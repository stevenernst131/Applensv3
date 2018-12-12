import { Component, OnInit, Input } from '@angular/core';
import { DiffEditorModel } from 'ngx-monaco-editor';

@Component({
  selector: 'detector-diff-view',
  templateUrl: './detector-diff-view.component.html',
  styleUrls: ['./detector-diff-view.component.css']
})
export class DetectorDiffViewComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input() originalModel: DiffEditorModel;

  @Input() modifiedModel: DiffEditorModel;

  
  options = {
    theme: 'vs-dark',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    minimap: {
      enabled: false
    },
    folding: true
  };
}
