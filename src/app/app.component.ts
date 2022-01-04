import { Component } from '@angular/core';
import {VisualPipeEdge, VisualPipeNode} from './models/visual-pipe.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  nodes: VisualPipeNode[] = [];
  edges: VisualPipeEdge[] = [];

  constructor() {
    this.nodes = [
      {id: '1', name: 'A', type: 'person'},
      {id: '2', name: 'B', type: 'person'},
      {id: '3', name: 'C', type: 'person'},
      {id: '100', name: 'ABC', type: 'family'}
    ];
    this.edges = [
      {sourceID: '1', targetID: '100', type: 'parent'},
      {sourceID: '2', targetID: '100', type: 'parent'},
      {sourceID: '3', targetID: '100', type: 'child'}
    ]
  }
}
