import { Component, OnInit, Input } from '@angular/core';
import { DiffEditorModel } from 'ngx-monaco-editor';

@Component({
  selector: 'haha',
  templateUrl: './haha.component.html',
  styleUrls: ['./haha.component.css']
})

export class HahaComponent implements OnInit {

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
