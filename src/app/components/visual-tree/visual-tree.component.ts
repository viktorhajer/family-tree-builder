import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation} from '@angular/core';
import * as d3 from 'd3';
import {VisualPipeEdge, VisualPipeNode} from '../../models/visual-pipe.model';

@Component({
  selector: 'app-visual-tree',
  template: '<svg id="visual-tree"></svg>',
  styleUrls: ['./visual-tree.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VisualTreeComponent implements OnChanges {

  @Input() nodes: VisualPipeNode[] = [];
  @Input() edges: VisualPipeEdge[] = [];
  @Input() trigger: string = '';
  @Input() selectable = true;
  @Input() multiSelect = false;
  @Input() panZoom = true;
  @Input() showIcon = false;
  @Input() showProgress = false;
  @Output() nodeSelected = new EventEmitter();

  ngOnChanges(changes: SimpleChanges): void {
    this.drawGraph();
  }

  private drawGraph() {
    d3.select('#visual-pipe').selectAll('*').remove();
    const margin = {top: 0, right: 320, bottom: 0, left: 30};
    const fullWidth = 1260;
    const fullHeight = 500;
    const width = fullWidth - margin.left - margin.right;
    const height = fullHeight - margin.top - margin.bottom;

    const tree = d3.tree()
      .separation((a, b) => ((a.parent === b.parent) ? 0.6 : 0.5))
      .size([height, width]);

    const svg = d3.select('body')
      .append('svg')
      .attr('width', fullWidth)
      .attr('height', fullHeight);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // const json = JSON.parse('{"name":"Clifford Shanks","born":1862,"died":1906,"location":"Petersburg, VA","parents":[{"name":"James Shanks","born":1831,"died":1884,"location":"Petersburg, VA","parents":[{"name":"Robert Shanks","born":1781,"died":1871,"location":"Ireland/Petersburg, VA"},{"name":"Elizabeth Shanks","born":1795,"died":1871,"location":"Ireland/Petersburg, VA"}]},{"name":"Ann Emily Brown","born":1826,"died":1866,"location":"Brunswick/Petersburg, VA","parents":[{"name":"Henry Brown","born":1792,"died":1845,"location":"Montgomery, NC"},{"name":"Sarah Houchins","born":1793,"died":1882,"location":"Montgomery, NC"}]}]}');
    const json = JSON.parse('{"name":"Clifford Shanks","born":1862,"died":1906,"location":"Petersburg, VA","parents":[{"name":"James Shanks","born":1831,"died":1884,"location":"Petersburg, VA","parents":[{"name":"Robert Shanks","born":1781,"died":1871,"location":"Ireland/Petersburg, VA"},{"name":"Elizabeth Shanks","born":1795,"died":1871,"location":"Ireland/Petersburg, VA"}]},{"name":"Ann Emily Brown","born":1826,"died":1866,"location":"Brunswick/Petersburg, VA","parents":[{"name":"Henry Brown","born":1792,"died":1845,"location":"Montgomery, NC","parents":[{"name":"Henry Brown","born":1792,"died":1845,"location":"Montgomery, NC"},{"name":"Sarah Houchins","born":1793,"died":1882,"location":"Montgomery, NC"}]},{"name":"Sarah Houchins","born":1793,"died":1882,"location":"Montgomery, NC","parents":[{"name":"Henry Brown","born":1792,"died":1845,"location":"Montgomery, NC"},{"name":"Sarah Houchins","born":1793,"died":1882,"location":"Montgomery, NC"}]}]}]}');
    const nodes = d3.hierarchy(json, (d) => d.parents);

    // @ts-ignore
    const elbow = (d, i) => {
      return `M${d.source.y},${d.source.x}H${d.target.y},V${d.target.x}${d.target.children ? '' : 'h' + margin.right}`;
    };

    // maps hierarchy to tree layout
    const treeNodes = tree(nodes);

    // adds links between nodes
    g.selectAll('.link')
      .data(treeNodes.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', elbow);

    const node = g.selectAll('.node')
      .data(treeNodes.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    node.append('text')
      .attr('class', 'name')
      .attr('x', 8)
      .attr('y', -6)
      .text((d: any) => `${d.data.name}`);

    node.append('text')
      .attr('x', 8)
      .attr('y', 8)
      .attr('dy', '.71em')
      .attr('class', 'about lifespan')
      .text((d: any) => `${d.data.born} - ${d.data.died}`);

    node.append('foreignObject')
      .attr('x', 8)
      .attr('y', 20)
      .attr('width', 250)
      .attr('height', 100)
      .attr('dy', '1.86em')
      .html((d: any) => `<div class="about location">${d.data.location}</div>`);
  }
}
