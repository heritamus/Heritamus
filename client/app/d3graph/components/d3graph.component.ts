import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as d3 from 'd3';
import { Relationship } from '../../shared/models/relationship.model';
import { Node } from '../../shared/models/node.model';
import { TranslationService } from 'angular-l10n';
import { getNodeType } from '../../../static/nodeTypes';
import { getRelationType } from '../../../static/relationTypes';

const LINK_LENGTH = 300;
const CIRCLE_SIZE = 30;

@Component({
    selector: 'd3-graph',
    templateUrl: './d3graph.component.html',
    styleUrls: ['./d3graph.component.css']
})
export class D3graphComponent implements OnInit {
    color2Change: {key: string, color: string};

    private svg: any;
    private graphLayer;
    private legendLayer;
    private node: any;
    private link: any;
    private edgepaths: any;
    private edgelabels: any;
    private edgeOverlay: any;
    private simulation: any;
    private colors: any;
    private width: number;
    private height: number;
    private selectedLineId = null;
    private selectedNodeId = null;

    private drawingLine: boolean;
    private line: any;
    private newLinkSource: Node;
    private scale = 1;
    private language: string;

    private colorMap: Map<string, string>;

    @Output() onNodeClick: EventEmitter<any>;
    @Output() onNodeDoubleClick: EventEmitter<any>;
    @Output() onLinkClick: EventEmitter<any>;
    @Output() onLinkDoubleClick: EventEmitter<any>;
    @Output() onNewLinkDrawn: EventEmitter<any>;
    @Output() onSelectionClear: EventEmitter<void>;


    constructor(private translation: TranslationService) {
        /** initialize event emitters **/
        this.onNodeClick = new EventEmitter<any>();
        this.onNodeDoubleClick = new EventEmitter<any>();
        this.onLinkClick = new EventEmitter<any>();
        this.onLinkDoubleClick = new EventEmitter<any>();
        this.onNewLinkDrawn = new EventEmitter<any>();
        this.onSelectionClear = new EventEmitter<void>();
        /** color array **/
        this.colors = d3.scaleOrdinal(d3.schemeCategory10);
        this.height = 1000;
        this.width = 1000;
        this.colorMap = new Map<string, string>();
        this.color2Change = {key: null, color: null};
    }

    ngOnInit() {
        /** get height and width of container **/
        this.width = d3.select('#d3-graph')._groups[0][0].clientWidth;
        this.height = d3.select('#d3-graph')._groups[0][0].clientHeight;
        /** graph svg container **/
        this.svg = d3.select('#d3-graph')
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .call(d3.zoom()
                .scaleExtent([0.1, 3])
                .on('zoom', () => this.zooming()))
            .on('click', () => {
                this.clearDrawingLine();
                this.unselect();
                this.onSelectionClear.emit();
            })
            .on('dblclick.zoom', null);

        /** define arrows for links **/
        /*this.svg.append('defs').append('marker')
          .attr('id', 'arrowhead')
          .attr('viewBox', '-0 -5 30 30')
          .attr('refX', - CIRCLE_SIZE)
          .attr('refY', 10)
          .attr('orient', 'auto')
          .attr('markerWidth', CIRCLE_SIZE)
          .attr('markerHeight', CIRCLE_SIZE)
          .attr('xoverflow', 'visible')
          .append('svg:path')
          .attr('d', 'M 20,5 L 0 ,10 L 20,15')
          .attr('fill', '#999')
          .style('stroke', 'none');*/

        /** layer where all graph will be drawn **/
        this.graphLayer = this.svg.append('g')
            .attr('width', '100%')
            .attr('height', '100%');

        /** layer where legend is displayed **/
        this.legendLayer = this.svg.append('g').attr('class', 'legend');

        /** define forces applyed
         * charge: nodes closer to LINK_LENGTH repel each other (like electric charges)
         * link: attract linked node to each other so that their distance is LINK_LENGHT when possible
         * collide: node can't go over an other node
         * center: force applied so that the graph is centered on the middle of the screen
         */
        this.simulation = d3.forceSimulation()
            .force('charge', d3.forceManyBody().strength(-20).distanceMax(LINK_LENGTH * 2))
            .force('link', d3.forceLink().id((d: any) => d.id).distance(LINK_LENGTH * 2))
            .force('collide', d3.forceCollide().radius(CIRCLE_SIZE * 3))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2));

        this.translation.translationChanged().subscribe(res => {
            this.language = res;
            this.updateEdgeLabels();
            this.updateLegend();
        });
    }

    /**
     * update the graph data
     * @param {Relationship[]} links
     * @param {Node[]} nodes
     */
    public update(links: Relationship[] = [], nodes: Node[]) {
        this.updateColorMap(nodes);
        this.prepareLinks(links);

        this.link = this.graphLayer.selectAll('.link')
            .remove()
            .exit()
            .data(links)
            .enter()
            .append('g')
            .attr('class', 'link');

        this.edgepaths = this.link
            .append('path')
            .attr('class', 'edgepath')
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 1)
            .attr('stroke', '#999')
            .attr('id',  (d, i) => 'edgepath' + i)
            .attr('marker-start', 'url(#arrowhead)')
            .style('pointer-events', 'none');

        this.edgeOverlay = this.link.append('path');
        this.drawEdgeOverlay();

        this.edgelabels = this.link
            .append('g')
            .attr('class', 'edgelabel')
            .attr('id', (d, i) => 'edgelabel' + i)
            .on('click', (d) => {
                this.onLinkClick.emit(d);
            })
            .on('dblclick', (d) => {
                this.onLinkDoubleClick.emit(d);
                this.selectLine(d);
                this.clearDrawingLine();
            });

        this.edgelabels.append('text')
            .attr('font-size', 14)
            .attr('fill', '#aaa')
            .append('textPath')
            .attr('xlink:href', function (d, i) {
                return window.location.href + '#edgepath' + i;
            })
            .attr('text-anchor', 'middle')
            .attr('startOffset', '50%')
            /**
             * Get translated relation type
             */
            .text((d) => getRelationType(d.type, this.language));

        this.node = this.graphLayer.selectAll('.node')
            .remove()
            .exit()
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on('start', (d) => {
                    this.dragStarted(d);
                    d3.event.sourceEvent.stopPropagation();
                })
                .on('drag', (d) => {
                    this.dragged(d);
                    d3.event.sourceEvent.stopPropagation();
                })
                .on('end', (d) => {
                    this.dragEnded(d);
                    d3.event.sourceEvent.stopPropagation();
                })
            ).on('click', (d) => {
                this.onNodeClick.emit(d);
            })
            .on('dblclick', (d) => {
                this.onNodeDoubleClick.emit(d);
                this.selectNode(d);
                this.clearDrawingLine();
            })
            .on('contextmenu', (d) => {
                d3.event.preventDefault();
                this.onNodeRightClick(d);
            });

        this.node.append('circle');
        this.drawCircle();

        this.node.append('text')
            .attr('dy', - CIRCLE_SIZE)
            .text((d: Node) => d.name);

        this.simulation
            .nodes(nodes)
            .on('tick', () => this.ticked());

        this.simulation.force('link')
            .links(links);

        /**
         * run the simulation for a fix number of steps
         * https://bl.ocks.org/mbostock/01ab2e85e8727d6529d20391c0fd9a16
         */
        for (let i = 0, n = Math.ceil(Math.log(this.simulation.alphaMin()) / Math.log(1 - this.simulation.alphaDecay())); i < n; ++i) {
            this.simulation.tick();
        }
        this.simulation.alphaTarget(0).restart();

        /**
         * define for all node a fixed position
         */
        // this.simulation.nodes().forEach(n => {
        //     n.fx = n.x;
        //     n.fy = n.y;
        // });
    }

    /**
     * define new node and link position
     */
    ticked() {
        this.node.attr('transform', (d) => 'translate(' + d.x + ', ' + d.y + ')');

        this.edgepaths.attr('d', (d) => this.linkArc(d));
        this.edgeOverlay.attr('d', (d) => this.linkArc(d));

        this.edgelabels.attr('transform', function (d) {
            if (d.target.x > d.source.x) {
                const bbox = this.getBBox();
                const rx = bbox.x + bbox.width / 2;
                const ry = bbox.y + bbox.height / 2;
                return 'rotate(180 ' + rx + ' ' + ry + ')';
            } else {
                return 'rotate(0)';
            }
        });
    }

    /**
     * Update links label when changing language
     */
    private updateEdgeLabels() {
        this.graphLayer
            .selectAll('.link')
            .select('text')
            .select('textPath')
            .text((d) => getRelationType(d.type, this.language));
    }

    /**
     * Update legend labels when changing language
     */
    private updateLegend() {
        this.legendLayer
            .selectAll('.legend-data')
            .select('text')
            .text((d) => getNodeType(d, this.language));
    }

    private dragStarted(d) {
        if (!d3.event.active) {
            this.simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
    }

    private dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    private dragEnded(d) {
        if (!d3.event.active) {
            this.simulation.alphaTarget(0);
        }
        this.simulation.stop();
    }

    /**
     * create colorMap for nodes
     * @param {Node[]} nodes
     */
    private updateColorMap(nodes: Node[]) {
        nodes.forEach(node => {
            if (!this.colorMap.get(node.labels[0])) {
                this.colorMap.set(node.labels[0], this.colors(this.colorMap.size));
            }
        });
        this.drawLegend();
    }

    /**
     * draw curved link
     * http://bl.ocks.org/thomasdobber/9b78824119136778052f64a967c070e0
     * @param d
     * @returns {string}
     */
    private linkArc(d) {
        const dx = (d.target.x - d.source.x);
        const dy = (d.target.y - d.source.y);
        const dr = Math.sqrt(dx * dx + dy * dy);
        const unevenCorrection = (d.sameUneven ? 0 : 0.5);
        let arc = ((dr * d.maxSameHalf) / (d.sameIndexCorrected - unevenCorrection));

        if (d.sameMiddleLink) {
            arc = 0;
        }

        return 'M' + d.target.x + ',' + d.target.y + 'A' + arc + ',' + arc + ' 0 0,' + d.sameArcDirection + ' ' + d.source.x + ',' + d.source.y;
    }

    /**
     * compute value to draw curved link when mutiple on th same node
     * http://bl.ocks.org/thomasdobber/9b78824119136778052f64a967c070e0
     * @param {any[]} links
     */
    private prepareLinks(links: Relationship[]): void {
        links.forEach(link => {
            // find other links with same target+source or source+target
            const same = links.filter(l => l.sourceNode.id === link.sourceNode.id && l.targetNode.id === link.targetNode.id);

            const sameAlt = links.filter(l => l.targetNode.id === link.sourceNode.id && l.sourceNode.id === link.targetNode.id);
            const sameAll = same.concat(sameAlt);

            const index = sameAll.findIndex(l => l.id === link.id);
            link.sameIndex = (index + 1);
            link.sameTotal = sameAll.length;
            link.sameTotalHalf = (link.sameTotal / 2);
            link.sameUneven = ((link.sameTotal % 2) !== 0);
            link.sameMiddleLink = ((link.sameUneven === true) && (Math.ceil(link.sameTotalHalf) === link.sameIndex));
            link.sameLowerHalf = (link.sameIndex <= link.sameTotalHalf);
            link.sameArcDirection = link.sameLowerHalf ? 0 : 1;
            link.sameIndexCorrected = link.sameLowerHalf ? link.sameIndex : (link.sameIndex - Math.ceil(link.sameTotalHalf));
        });
        let maxSame = 0;
        if (links.length > 0) {
            maxSame = links.sort(x => x.sameTotal)[links.length - 1].sameTotal;
        }
        links.forEach(l => l.maxSameHalf = maxSame);
    }

    /**
     * place the node at the center of the screen and zoom on it
     * @param {Node} node
     */
    public focusOnNode(node: Node): void {
        this.svg.call(d3.zoom().transform, d3.zoomIdentity.translate(((this.width / 2) - node.x), ((this.height / 2) - node.y)));
        this.graphLayer.attr('transform', 'translate(' + ((this.width / 2) - node.x) + ',' + ((this.height / 2) - node.y) + ')');
        /** reset zoom to 1 **/
        this.scale = 1;
    }

    public focusOnCenter(): void {
        this.svg.call(d3.zoom().transform, d3.zoomIdentity.translate(0, 0));
        this.graphLayer.attr('transform', 'translate(' + ( 0 + ',' + 0 ) + ')');
        /** reset zoom to 1 **/
        this.scale = 1;
    }

    /**
     * function to draw lline on right click on a node
     * when finish emit {source: Node, taget: Node} to parent
     * @param {Node} d
     */
    private onNodeRightClick(d: Node) {
        this.simulation.stop();
        if ( !this.drawingLine) {
            this.drawingLine = true;
            this.newLinkSource = d;
            this.line = this.graphLayer.append('line')
                .attr('x1', d.x)
                .attr('y1', d.y)
                .attr('x2', d.x)
                .attr('y2', d.y)
                .attr('stroke', '#000000')
                .attr('stroke-opacity', 1)
                .attr('stroke-width', '1px');

            /** add function to catch mouse move **/
            this.svg.on('mousemove', () => {
                this.line.attr('x2', +this.line.attr('x2') + d3.event.movementX / this.scale)
                    .attr('y2', +this.line.attr('y2') + d3.event.movementY / this.scale);
            });
        } else {
            this.onNewLinkDrawn.emit({source: this.newLinkSource, target: d});
            this.clearDrawingLine();
        }
    }

    private clearDrawingLine() {
        this.drawingLine = false;
        this.newLinkSource = null;
        if (this.line) {
            this.line.remove().exit();
        }
        this.svg.on('mousemove', null);
    }

    private selectLine(l) {
        this.selectedLineId = l.id;
        this.selectedNodeId = null;
        this.drawCircle();
        this.drawEdgeOverlay();
    }

    selectNode(n) {
        this.selectedLineId = null;
        this.selectedNodeId = n.id;
        this.drawCircle();
        this.drawEdgeOverlay();
    }

    private unselect() {
        this.selectedLineId = null;
        this.selectedNodeId = null;
        this.drawCircle();
        this.drawEdgeOverlay();
    }

    private drawCircle(): void {
        if (!this.node) {
            return;
        }
        this.node.selectAll('circle')
            .attr('r', CIRCLE_SIZE)
            .style('fill', (d) => this.colorMap.get(d.labels[0]))
            .attr('stroke', (d) => d.id === this.selectedNodeId ? '#ADD8E6' : '')
            .attr('stroke-width', 10);
    }
    private drawEdgeOverlay(): void {
        if (!this.edgeOverlay) {
            return;
        }
        this.edgeOverlay.attr('class', 'edgeOverlay')
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0.5)
            .attr('stroke-width', 10)
            .attr('stroke', (d) => d.id === this.selectedLineId ? '#ADD8E6' : '');
    }

    public setColor(key: string, color: string): void {
        this.colorMap.set(key, color);
        this.drawLegend();
        this.drawCircle();
    }

    private zooming() {
        this.graphLayer.attr('transform', d3.event.transform);
        this.scale = d3.event.transform.k;
    }

    private drawLegend() {
        const legendData = this.legendLayer.selectAll('.legend-data')
            .remove()
            .exit()
            .data(Array.from(this.colorMap.keys()))
            .enter()
            .append('g')
            .attr('class', 'legend-data');

        legendData.append('circle')
            .attr('r', 12)
            .style('fill', (d) => this.colorMap.get(d))
            .attr('cx', 20)
            .attr('cy', (d, index) => 30 * (1 + index))
            .on('click', (d) => {
                this.color2Change = {key: d, color: this.colorMap.get(d)};
                document.getElementById('c').focus();
                document.getElementById('c').click();
            });

        legendData.append('text')
            .attr('font-size', 14)
            .attr('x', 50)
            .attr('y', (d, index) => 30 * (1 + index) + 5)
            /**
             * Get translated node type
             */
            .text((d) => getNodeType(d, this.language));
    }
}
