import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation} from '@angular/core';
import * as dagreD3 from 'dagre-d3';
import * as d3 from 'd3';
import {VisualPipeEdge, VisualPipeNode} from '../../models/visual-pipe.model';
import {
  curveBasis,
  curveBasisClosed,
  curveBasisOpen,
  curveBumpX,
  curveBundle,
  curveCardinal,
  curveCatmullRom,
  curveLinear, curveMonotoneX,
  curveNatural, curveStep
} from 'd3-shape';

@Component({
  selector: 'app-visual-pipe',
  template: '<svg id="visual-pipe"></svg>',
  styleUrls: ['./visual-pipe.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VisualPipeComponent implements OnChanges {

  @Input() nodes: VisualPipeNode[] = [];
  @Input() edges: VisualPipeEdge[] = [];
  @Input() trigger: string = '';
  @Input() selectable = true;
  @Input() multiSelect = false;
  @Input() panZoom = true;
  @Input() showIcon = false;
  @Input() showProgress = false;
  @Output() nodeSelected = new EventEmitter();

  private svg: any;
  // @ts-ignore
  private graph: dagreD3.graphlib.Graph;
  private zoomObj: any;

  private static deselectAllComponents() {
    // @ts-ignore
    d3.selectAll('.selected').nodes().forEach((element: HTMLElement) => {
      element.classList.remove('selected');
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.nodes && this.edges) {
      let transform;
      const transformGroup = document.getElementById('visual-pipe')?.getElementsByTagName('g')[0];
      if (transformGroup) {
        transform = transformGroup.getAttribute('transform');
      }
      this.cleanUpData();
      this.drawGraph();
      this.renderGraph();
      this.setSelectableNodes();
      this.initZoom(transform);
    }
  }

  zoom(ratio = 1) {
    const pipe = document.getElementById('visual-pipe');

    if (pipe && this.graph) {
      const graph = this.graph.graph();
      const width = pipe.getBoundingClientRect().width;
      const height = pipe.getBoundingClientRect().height;
      let initialScale = ratio;
      if (ratio === 0) {
        // @ts-ignore
        const widthScale = width / graph.width;
        // @ts-ignore
        const heightScale = height / graph.height;
        initialScale = (widthScale < heightScale ? widthScale : heightScale) * .9;
      }
      // @ts-ignore
      this.svg.call(this.zoomObj.transform as any, d3.zoomIdentity.translate((width - graph.width * initialScale) / 2, (height - graph.height * initialScale) / 2
      ).scale(initialScale));
    }
  }

  selectNode(id: string) {
    if (this.selectable) {
      const d3Node = d3.selectAll('.' + id);
      const classes = d3Node.attr('class');
      if (classes.indexOf('selected') !== -1) {
        d3Node.attr('class', classes.replace('selected', '').trim());
      } else {
        if (!this.multiSelect) {
          VisualPipeComponent.deselectAllComponents();
        }
        d3Node.attr('class', classes + ' selected');
      }
    }
  }

  private drawGraph() {
    this.graph = new dagreD3.graphlib.Graph();
    this.graph.setGraph({nodesep: 70, ranksep: 50, rankdir: 'TB', marginx: 20, marginy: 20});
    this.nodes.forEach(node => this.graph.setNode(node.id, {label: node.id}));
    this.edges.forEach(edge => {
      let strokeStyle = 'stroke: #999; stroke-width: 1px; fill: none;';
      if (edge.type === 'parent') {
        strokeStyle = 'stroke: #999; stroke-width: 4px; fill: none;'
      }
      this.graph.setEdge(edge.sourceID, edge.targetID, {
        label: edge.label,
        style: strokeStyle,
        arrowheadStyle: 'fill: none; stroke: none;',
      });
    });
    this.graph.nodes().forEach(v => {
      const d3Node = this.graph.node(v);
      const node = this.nodes.find(n => n.id === v);
      if (node) {
        d3Node.rx = d3Node.ry = 3; // corner radius of the nodes
        d3Node.label = this.createNodeContent(node);
        (d3Node as any).labelType = 'html';
        d3Node.class = encodeURI(v) + (this.selectable ? ' selectable' : '');
      }
    });
  }

  private renderGraph() {
    d3.select('#visual-pipe').selectAll('*').remove();
    this.svg = d3.select('#visual-pipe');
    const inner = this.svg.append('g');

    this.svg.on('click', () => {
      VisualPipeComponent.deselectAllComponents();
      this.nodeSelected.emit();
    });

    this.zoomObj = d3.zoom().on('zoom', (event: any) => {
      inner.attr('transform', event.transform);
    });
    if (this.panZoom) {
      this.svg.call(this.zoomObj);
    }
    const render = new dagreD3.render();
    render(inner, this.graph as any);
  }

  private setSelectableNodes() {
    const self = this; // eslint-disable-line
    d3.selectAll('.node').on('click', function (e: MouseEvent) {
      const classes = d3.select(this).attr('class');
      let deselect = false;
      if (self.selectable) {
        if (classes.indexOf('selected') !== -1) {
          d3.select(this).attr('class', classes.replace('selected', '').trim());
          deselect = true;
        } else {
          if (!self.multiSelect) {
            VisualPipeComponent.deselectAllComponents();
          }
          d3.select(this).attr('class', classes + ' selected');
        }
      }
      const id = d3.select(this).data()[0];
      self.nodeSelected.emit(deselect ? null : id);
      e.stopPropagation();
    });
  }

  private initZoom(transform?: string | any) {
    const visualPipeContainer = document.getElementById('visual-pipe');
    if (visualPipeContainer) {
      if (transform) {
        visualPipeContainer.getElementsByTagName('g')[0]
          .setAttribute('transform', transform);
      } else {
        // Center the graph and set zoom
        // Set zoom according to different situations: zoom(0) / fit: many nodes, zoom(1) / 100%: just a few nodes.
        const width = visualPipeContainer.getBoundingClientRect().width;
        const height = visualPipeContainer.getBoundingClientRect().height;
        // @ts-ignore
        const widthScale = width / this.graph.graph().width;
        // @ts-ignore
        const heightScale = height / this.graph.graph().height;
        if (widthScale < (1 / 0.9) || heightScale < (1 / 0.9)) {
          this.zoom(0);
        } else {
          this.zoom(1);
        }
      }
    }
  }

  private createNodeContent(node: VisualPipeNode): string {
    let html = `<div class="node-container ${node.id}">`;
    html += `<div class="title" title="${node.name}">${node.name}</div>`;
    html += '</div>';
    return html;
  }

  private cleanUpData() {
    const ids = this.nodes.map(node => node.id);
    this.edges = this.edges.filter(e => e.sourceID && e.targetID && e.sourceID !== e.targetID);
    this.edges = this.edges.filter(e => ids.some(id => e.sourceID === id) && ids.some(id => e.targetID === id));
  }
}
