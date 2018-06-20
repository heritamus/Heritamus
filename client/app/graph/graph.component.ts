import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastComponent } from '../shared/toast/toast.component';
import { AuthService } from '../services/auth.service';
import { User } from '../shared/models/user.model';
import { Graph } from '../shared/models/graph.model';
import { Type } from '../shared/models/type.model';
import { Neo4jService } from '../services/neo4j.service';
import { UserService } from '../services/user.service';
import { AppService } from '../services/app.service';
import { GraphService } from '../services/graph.service';
import { TypesService } from '../services/types.service';
import { JsonNode, Node, Property, TypesForProperties } from '../shared/models/node.model';
import { cities } from '../../static/cities';
import { getNodeType, nodeTypes } from '../../static/nodeTypes';
import { relationTypes } from '../../static/relationTypes';
import { RequestService } from '../services/request.service';
import { JsonRelationship, Relationship } from '../shared/models/relationship.model';
import { Request } from '../shared/models/request.model';
import { Help } from '../shared/models/help.model';
import { D3graphComponent } from '../d3graph/components/d3graph.component';
import { Language, TranslationService } from 'angular-l10n';
import { isEmpty, last, max, range, sortBy } from 'underscore';
import * as $ from 'jquery';
import * as uuidv4 from 'uuid/v4';
import * as xmljs from 'xml-js';
import { Types } from '../../static/types';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})

export class GraphComponent implements OnInit {
  @Language() lang: string;
  @ViewChild(D3graphComponent) graph: D3graphComponent;

  graphOpen: boolean;
  openGraphInterface: boolean;
  graphID: number;
  searchProgress: boolean;
  searchTerms: string;
  results: Array<Node>;
  mostUsedNodes: Array<Node>;
  requests: Array<Request>;
  currentFilter: Request;
  helps: Array<Help> = [];
  user: User;
  displayErrorMessage: boolean;
  formEditNode: FormGroup;
  formEditRel: FormGroup;
  formCreateRel: FormGroup;
  formPublishGraph: FormGroup;
  msg: string;
  currentRelation: Relationship;
  currentSelectedNode: Node;
  currentSelectedRel: Relationship;
  savedGraphs: Array<Graph>;
  savedGraphsList: Array<Graph>[];
  modalNode: boolean;
  modalRel: boolean;
  modalRelEdit: boolean;
  modalExport: boolean;
  modalPublish: boolean;
  customRelationType: string;
  state: string;
  filtersOpen: boolean;
  oneAtATime: boolean;
  publishMessage: string;
  newGraphHelp: boolean;
  generalGraphParams: boolean;
  startingNode: string;
  startingNodeSelected: Node;
  degreesOfSeparation: number;
  degreesOptions = range(1, 5);
  exportFormat: string;
  language: string;
  nodePremadeType = nodeTypes;
  relationPremadeType = relationTypes;
  availableTypes = TypesForProperties;
  graphDrawing: boolean;
  fetchingNodes: boolean;

  private graphCurrent: Graph;
  private graphRevision: number;
  private searchIn: Array<Node>;
  private nodes: Array<Node>;
  private nodesSaved: Array<Node>;
  private relations: Array<Relationship>;
  private relationsSaved: Array<Relationship>;
  private formStartingNode: FormGroup;
  private graphExistFromLoaded: boolean;
  private highestID: number;
  private customTypes: Array<Type>;

  /** Cas d'une d'un jour 29,30,31 */
  private dateRegex = '^(?:(?:(?:0?[13578]|1[02])(\\/|-|\\.)31)\\1|(?:(?:0?[1,3-9]|1[0-2])' +
      '(\\/?|-|\\.)(?:29|30)\\2))(?:(?:1[6-9]|[2-9]\\d)?\\d{4})$' +
      '|^(?:(?:0?2)(\\/?|-|\\.)(?:29)\\3(?:(?:(?:1[6-9]|[2-9]\\d)?' +
      '(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$' +
      /** Cas général de date*/
      '|^(?:(?:0?[1-9])|(?:1[0-2]))(\\/?|-|\\.)(?:0?[0-9]|1\\d|2[0-8])\\4' +
      '(?:(?:1[6-9]|[2-9]\\d{2})?\\d)$';

  constructor(public toast: ToastComponent,
              public translation: TranslationService,
              public auth: AuthService,
              private fb: FormBuilder,
              private neo4jService: Neo4jService,
              private appService: AppService,
              private userService: UserService,
              private graphService: GraphService,
              private typesService: TypesService,
              private requestService: RequestService,
              private sanitizer: DomSanitizer) {
    this.graphCurrent = new Graph();
    this.savedGraphs = [];
    this.graphOpen = false;
    this.graphID = 1; // default, must be <> 0
    this.graphRevision = 1;
    this.results = [];
    this.mostUsedNodes = [];
    this.searchIn = [];
    this.nodes = [];
    this.nodesSaved = [];
    this.relations = [];
    this.relationsSaved = [];
    this.searchProgress = false;
    this.displayErrorMessage = false;
    this.searchTerms = '';
    this.openGraphInterface = false;
    this.msg = '';
    this.currentRelation = new Relationship();
    this.currentSelectedNode = null;
    this.currentSelectedRel = null;
    this.graphExistFromLoaded = false;
    this.modalNode = false;
    this.modalRel = false;
    this.modalRelEdit = false;
    this.modalPublish = false;
    this.modalExport = false;
    this.oneAtATime = true;
    this.filtersOpen = false;
    this.requests = [];
    this.publishMessage = '';
    this.newGraphHelp = false;
    this.generalGraphParams = false;
    this.startingNode = '';
    this.startingNodeSelected = null;
    this.degreesOfSeparation = 3;
    this.highestID = 0;
    this.exportFormat = 'json';
    this.customTypes = [];
    this.customRelationType = 'Custom';
    this.graphDrawing = false;
    this.fetchingNodes = true;
  }

  ngOnInit() {
    this.graphChanged(null, false);
    this.getUser();
    this.buildForm();

    /** Changement des listes de nodes/relations suivant la langue */
    this.translation.translationChanged().subscribe(res => {
      this.language = res;
    });

    this.appService.eventTriggered.subscribe((req: string) => {
      switch (req) {
        case 'closeGraph':
          this.closeGraph();
          break;
        case 'createGraph':
          this.createGraph();
          break;
        case 'publishGraph':
          this.publishGraph();
          break;
        case 'saveGraph':
          this.saveGraph();
          break;
        case 'exportGraph':
          this.exportGraph();
          break;
        case 'applyFilter':
          this.applyFilter();
          break;
      }
    });
    this.neo4jService.getMostCommonlyUsedNodes().subscribe(
        res => {
          for (let i = 0; i < res.result.length; i++) {
            let node = Node.create(JSON.parse(res.result[i])._fields[0]);
            this.mostUsedNodes.push(node);
          }
        },
        err => {
        }
    );
    this.neo4jService.getAllNodes().subscribe(
        res => {
          for (let i = 0; i < res.result.length; i++) {
            let node = Node.create(JSON.parse(res.result[i])._fields[0]);
            this.searchIn.push(node);
          }
          this.fetchingNodes = false;
        },
        err => {
        }
    );
    this.requestService.getRequests().subscribe(
        r => this.requests = r,
        err => {
        }
    );
    this.typesService.getTypes().subscribe((types: Type[]) => {
      for (let t of types) {
        this.customTypes.push(t);
        if (t.availability === 'node' && t.state === 'accepted') {
          this.nodePremadeType.push({ en: t.name, pt: t.name });
        }
        if (t.availability === 'relation' && t.state === 'accepted') {
          this.relationPremadeType.push({ en: t.name, pt: t.name });
        }
      }
    });
    this.fetchingNodes = true;
  }

  @HostListener('window:beforeunload')
  onReload(): boolean {
    return false;
  }

  inPersonalGraph(): boolean {
    return this.graphID !== 0;
  }

  selectFilter(request: Request) {
    this.currentFilter = request;
    this.helps = [];
    this.renderCypherAsForm();
  }

  applySelectedFilter() {
    this.nodesSaved = this.nodes;
    this.relationsSaved = this.relations;
    this.nodes = [];
    this.relations = [];
    let req = new Request();
    req.request = this.reverseReplacement();

    this.requestService.playRequest(req).subscribe(
        res => this.processRequest(res),
        err => {
        }
    );
  }

  removeFilter() {
    if (this.nodesSaved.length !== 0 && this.relationsSaved.length !== 0) {
      this.nodes = this.nodesSaved;
      this.relations = this.relationsSaved;
      this.graph.update(this.relations, this.nodes);
    }
    this.currentFilter = null;
    this.filtersOpen = false;
  }

  showGeneralGraph(startingNode?: Node) {
    if (startingNode) {
      this.startingNodeSelected = startingNode;
    }
    this.graphCurrent = new Graph();
    this.openGraphInterface = false;
    this.graphDrawing = true;
    this.graphOpen = true;
    this.graphID = 0; // 0 here for the general graph
    this.nodes = [];
    this.relations = [];
    this.searchProgress = false;
    this.searchTerms = '';
    this.currentRelation = new Relationship();
    this.gatherData('general');
    this.graphChanged(0, true);
  }

  openGraph() {
    this.graphOpen = false;
    this.openGraphInterface = true;
    this.savedGraphs = [];
    this.savedGraphsList = [];

    this.graphService.getGraphs(this.user).subscribe(
        res => {
          this.savedGraphs = res;
          for (let s of this.savedGraphs) {
            if (this.savedGraphsList[s.uuid] == null) {
              this.savedGraphsList[s.uuid] = [];
            }
            this.savedGraphsList[s.uuid].push(s);
            this.savedGraphsList[s.uuid].sort((a, b) => {
              return (a.revision < b.revision) ? 1 : ((b.revision < a.revision) ? -1 : 0);
            });
          }
          let tmp = [];
          let isInArray: boolean;
          for (let s of this.savedGraphs) {
            isInArray = false;
            for (let t of tmp) {
              if (s.name === t.name) {
                isInArray = true;
              }
            }
            if (!isInArray) {
              tmp.push(s);
            }
          }
          this.savedGraphs = tmp;
        }
    );
  }

  calculateHeader(g: Graph) {
    return g.name + ' (' + this.savedGraphsList[g.uuid].length + ' ' + this.translation.translate('_REVISIONS_SAVED_') + ')';
  }

  deleteLoadedGraph(g: Graph) {
    if (confirm(this.translation.translate('_CONFIRM_DELETE_GRAPH_'))) {
      this.neo4jService.deleteGraph(g).subscribe(
          res => {
            this.graphService.deleteGraph(g).subscribe(
                res2 => {
                  this.toast.setMessage(this.translation.translate('_THE_GRAPH_') +
                      ' ' + g.name + ' rev' + g.revision + ' ' +
                      this.translation.translate('_GRAPH_HAS_BEEN_DELETED_'), 'success');
                  this.openGraph();
                },
                err2 => this.toast.setMessage(this.translation.translate('_GRAPH_ERROR_DELETE_'), 'danger')
            );
          },
          err => this.toast.setMessage(this.translation.translate('_GRAPH_ERROR_DELETE_'), 'danger')
      );
    }
  }

  openLoadedGraph(g: Graph) {
    this.graphCurrent = g;
    this.openGraphInterface = false;
    this.graphDrawing = true;
    this.graphOpen = true;
    this.graphID = g.revision;
    this.nodes = [];
    this.relations = [];
    this.searchProgress = false;
    this.searchTerms = '';
    this.currentRelation = new Relationship();
    this.gatherData(g.uuid);
    this.graphChanged(this.graphID, true);
  }

  importGraphBtn() {
    $('#openedFile').click();
  }

  importGraph() {
    this.createGraph();
    this.newGraphHelp = false;
    let file: any = document.getElementById('openedFile');
    file = file.files[0];
    if (file != null && file !== '') {
      let fr = new FileReader();
      fr.onload = (e) => {
        let res: any = e.target;
        let ext = last(file.name.split('.'));
        let result: any;
        if (ext === 'json') {
          result = JSON.parse(res.result);
        } else if (ext === 'xml') {
          let options = {
            compact: true,
            nativeType: true,
          };
          result = xmljs.xml2js(res.result, options);
          this.traverse(result); // Get rid of '_text' object generated by 'xml2js'
        } else {
          alert(`Cannot read files of type '${ext}'`);
          return;
        }
        this.nodes = result.graph.nodes.map((n: JsonNode) => {
          let node = Node.create(n);
          this.parseProps(node);
          return node;
        });
        this.relations = result.graph.relationships.map((r: JsonRelationship) => {
          return Relationship.createFromJson(r, this.nodes);
        });
        this.graph.update(this.relations, this.nodes);
        this.graphChanged(this.graphID, true);
      };
      fr.readAsText(file);
    }
  }

  closeGraph() {
    this.graphOpen = false;
    this.newGraphHelp = false;
    this.openGraphInterface = false;
    this.generalGraphParams = false;
    this.startingNode = '';
    this.startingNodeSelected = null;
    this.degreesOfSeparation = 3;
    this.graphChanged(null, false);
  }

  searchStartingElement() {
    this.startingNode = $('#searchNodeToStart').val();
    this.results = [];
    if (this.startingNode.length >= 3) {
      this.search(this.startingNode);
    }
  }

  selectStartingElement(node: Node) {
    this.neo4jService.getSpecificNode(node.name, node.type).subscribe(
        res => {
          this.startingNodeSelected = Node.create(res.node.records[0]._fields[0]);
        }
    );
  }

  removeStartingNode() {
    this.startingNodeSelected = null;
    this.startingNode = '';
    $('#searchNodeToStart').val('');
  }

  onChangeDegrees(value: number) {
    this.degreesOfSeparation = value;
  }

  exportSubmit() {
    let jsonVal = {
      graph: {
        nodes: this.nodes.map((n: Node) => JsonNode.create(n)),
        relationships: this.relations.map((rel: Relationship) => JsonRelationship.create(rel))
      }
    };

    if (this.exportFormat === 'xml') {
      // Export to XML
      let link = document.createElement('a');
      link.download = 'save.xml';
      let options = {
        compact: true,
        spaces: 2
      };
      let data = 'text/xml;charset=utf-8,' + encodeURIComponent(
          '<?xml version="1.0" encoding="utf-8"?>\n' +
          xmljs.json2xml(JSON.stringify(jsonVal), options)
      );
      link.href = 'data:' + data;
      link.click();

    } else if (this.exportFormat === 'json') {
      // Export to JSON
      let link = document.createElement('a');
      link.download = 'save.json';
      let data = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonVal, null, 2));
      link.href = 'data:' + data;
      link.click();
    }
    this.modalExport = false;
  }

  createGraph() {
    this.graphCurrent = new Graph();
    this.graphCurrent.state = 'unsaved';
    this.openGraphInterface = false;
    this.graphOpen = true;
    this.graphID = 1; // default, must be <> 0
    this.graphRevision = 1;
    this.nodes = [];
    this.relations = [];
    this.searchProgress = false;
    this.searchTerms = '';
    this.msg = '';
    this.newGraphHelp = true;
    this.currentSelectedNode = null;
    this.currentSelectedRel = null;
    this.currentRelation = new Relationship();
    this.highestID = 0;
    this.graphChanged(this.graphID, true);
  }

  publishGraph() {
    if (this.graphCurrent.state === 'unsaved') {
      this.toast.setMessage(this.translation.translate('_SAVE_BEFORE_PUBLISH_'), 'danger');
    } else if (this.graphCurrent.state === 'published' || this.graphCurrent.state === 'reviewed') {
      this.toast.setMessage(this.translation.translate('_ALREADY_PUBLISHED_'), 'warning');
    } else {
      this.publishMessage = '';
      this.modalPublish = true;
    }
  }

  publishGraphRevision() {
    this.graphCurrent.comment = this.publishMessage;
    this.graphCurrent.state = 'published';
    this.graphService.editGraph(this.graphCurrent).subscribe(
        res => {
          this.toast.setMessage(this.translation.translate('_GRAPH_PUBLISH_SUCCESS_'), 'success');
          this.publishMessage = '';
        },
        err => {
          this.graphCurrent.state = 'draft';
          this.toast.setMessage(this.translation.translate('_GRAPH_PUBLISH_FAIL_'), 'danger');
          this.publishMessage = '';
        }
    );
    this.modalPublish = false;
  }

  showResultDiv() {
    $('#searchNode').addClass('active');
    $('.search-results').addClass('active');
    this.newGraphHelp = false;
  }

  hideResultDiv() {
    $('#searchNode').removeClass('active');
    $('.search-results').removeClass('active');
  }

  searchElement() {
    this.searchTerms = $('#searchNode').val();
    this.results = [];
    if (this.searchTerms.length >= 3) {
      this.searchProgress = true;
      this.search(this.searchTerms);
    } else {
      this.searchProgress = false;
    }
  }

  addingNewNode() {
    let name = this.searchTerms;
    if (!this.searchIn.some(n => n.name === name)
        && !this.nodes.some(n => n.name === name)
        && name !== ''
        && name != null
        && name.replace(/\s/g, '').length > 0) {
      let newNode = new Node();
      newNode.name = name;
      newNode.id = isEmpty(this.nodes) ? 1 : max(this.nodes.map(n => n.id)) + 1;
      if (this.language === 'en') {
        newNode.type = 'Concept';
      } else if (this.language === 'pt') {
        newNode.type = 'Conceito';
      }
      newNode.labels[0] = newNode.type;
      this.nodes.push(newNode);
      this.graph.update(this.relations, this.nodes);
      this.graph.selectNode(newNode);
      this.showNodeEditor(newNode);
      this.editNodeForm(newNode);
    } else if (name === '' || name.replace(/\s/g, '').length === 0 || name == null) {
      alert(this.translation.translate('_NODE_NAME_EMPTY_'));
    } else {
      alert(this.translation.translate('_NODE_NAME_ALREADY_EXISTS_'));
    }
  }

  onSubmitEditNode() {
    let editNode = this.formEditNode.value as Node;
    if (editNode.name !== '' && editNode.name.replace(/\s/g, '').length > 0) {
      if (this.currentSelectedNode.name !== editNode.name
          && this.nodes.some(n => n.name === editNode.name)) {
        alert(this.translation.translate('_NODE_NAME_ALREADY_EXISTS_'));
      } else {
        this.nodes[this.nodes.indexOf(this.currentSelectedNode)].name = editNode.name;
        if (editNode.type === 'Custom') {
          this.nodes[this.nodes.indexOf(this.currentSelectedNode)].labels[0] = editNode.cntype;
          if (!this.isExistingCustomType(editNode.cntype)) {
            let type = new Type();
            type.availability = 'node';
            type.name = editNode.cntype;
            type.state = 'waiting';
            this.typesService.addType(type).subscribe((t: Type) => {
            });
          }
        } else {
          this.nodes[this.nodes.indexOf(this.currentSelectedNode)].labels[0] = editNode.type;
        }
        this.nodes[
            this.nodes.indexOf(this.currentSelectedNode)
            ].type = this.nodes[
            this.nodes.indexOf(this.currentSelectedNode)
            ].labels[0];
        const propedit = this.formEditNode.value;
        this.nodes[this.nodes.indexOf(this.currentSelectedNode)].props = propedit.props;
        this.graph.update(this.relations, this.nodes);
        this.modalNode = false;
      }
    } else {
      alert(this.translation.translate('_NODE_NAME_EMPTY_'));
    }
  }

  editRelForm(rel: Relationship) {
    this.modalRelEdit = true;
    this.formEditRel.reset(rel);
  }

  onSubmitEditRelation() {
    let editRel = this.formEditRel.value as Relationship;
    console.log(editRel);

    if (editRel.type === "Custom") {
      this.currentRelation.type = this.customRelationType;
      if (!this.isExistingCustomType(this.customRelationType)) {
        let type = new Type();
        type.availability = 'relation';
        type.name = this.customRelationType;
        type.state = 'waiting';
        this.typesService.addType(type).subscribe((t: Type) => {
        });
      }
    } else {
      this.relations[this.relations.indexOf(this.currentRelation)].type = editRel.type;
    }
    this.relations[this.relations.indexOf(this.currentRelation)].comment = editRel.comment;

    this.graph.update(this.relations, this.nodes);
    this.modalRelEdit = false;
  }

  onSubmitCreateRel() {
    this.currentRelation.id = this.highestID;
    this.highestID++;
    if (this.currentRelation.type === 'Custom') {
      this.currentRelation.type = this.customRelationType;
      if (!this.isExistingCustomType(this.customRelationType)) {
        let type = new Type();
        type.availability = 'relation';
        type.name = this.customRelationType;
        type.state = 'waiting';
        this.typesService.addType(type).subscribe((t: Type) => {
        });
      }
    }
    this.relations.push(this.currentRelation);
    this.graph.update(this.relations, this.nodes);
    this.modalRel = false;
  }

  addExistingNodeToGraph(node: Node) {
    this.neo4jService.getSpecificNode(node.name, node.type).subscribe(
        res => {
          let queryNode = Node.create(res.node.records[0]._fields[0]);
          this.parseProps(queryNode);

          if (this.inPersonalGraph()) {
            if (!this.nodeExist(queryNode)) {
              this.nodes.push(queryNode);
              this.graph.update(this.relations, this.nodes);
            } else {
              let focusNode = this.findNode(queryNode);
              if (focusNode) {
                this.graph.focusOnNode(focusNode);
              }
            }
          } else {
            let focusNode = this.findNode(queryNode);
            if (focusNode) {
              this.graph.focusOnNode(focusNode);
            } else {
              let navigate = confirm(`"${node.name}" ${this.translation.translate('_NAVIGATE_TO_IT_')}`);
              if (navigate) {
                this.showGeneralGraph(node);
              }
            }
          }
        }
    );
  }

  editNodeForm(node: Node) {
    this.modalNode = true;
    this.msg = '';
    this.state = 'edit';

    if (this.nodePremadeType.every((n) => n.en !== node.type)) {
      node.cntype = node.type;
      node.type = 'Custom';
    }

    this.formEditNode.reset(node);
    this.setProps(node.props);
  }

  deleteNodeFromGraph(node) {
    if (confirm(this.translation.translate('_CONFIRM_NODE_DELETE_') + ' ' + node.name + ' ?')) {
      this.relations = this.relations.filter(r => r.sourceNode.id !== node.id && r.targetNode.id !== node.id);
      this.nodes = this.nodes.filter(n => n.id !== node.id);
      this.graph.update(this.relations, this.nodes);
      this.currentSelectedNode = null;
    }
  }

  showCenterGraph() {
      this.graph.focusOnCenter();
  }

  showNodeEditor(node: Node) {
    this.graph.focusOnNode(node);
    this.currentSelectedNode = node;
  }

  showRelEditor(rel: Relationship) {
    this.currentRelation = rel;
    this.currentSelectedRel = rel;
  }

  closeRelEditor() {
    this.currentSelectedRel = null;
  }

  closeNodeEditor() {
    this.currentSelectedNode = null;
  }

  deleteRelFromGraph(rel: Relationship) {
    if (this.graphID !== 0) {
      if (confirm(this.translation.translate('_CONFIRM_DELETE_RELATION_'))) {
        let index = this.relations.indexOf(rel);
        this.relations.splice(index, 1);
        this.graph.update(this.relations, this.nodes);
        this.currentSelectedRel = null;
      }
    }
  }

  createLink(link: { source: Node, target: Node }) {
    if (link.source === link.target) {
      alert(this.translation.translate('_ERROR_RELATION_TO_ITSELF_'));
      return;
    }
    this.modalRel = true;
    this.state = 'creation';
    this.currentRelation = new Relationship();
    this.currentRelation.sourceNode = link.source;
    this.currentRelation.targetNode = link.target;
    this.currentRelation.source = <any>link.source;
    this.currentRelation.target = <any>link.target;
    this.customRelationType = 'Custom';
  }

  addProperty() {
    this.propsArray.push(this.createPropGroup());
  }

  removeProp(index: number) {
    this.propsArray.removeAt(index);
  }

  sorted(typeList: Types[], lang: string): Types[] {
    return sortBy(typeList, lang);
  }

  getType(node: Node): string {
    return getNodeType(node.type, this.language);
  }

  getPattern(select: HTMLSelectElement) {
    if (select.selectedIndex === -1) {
      return '';
    }
    let pattern = select.options[select.selectedIndex].text;
    if (pattern === 'Date') {
      return this.dateRegex;
    } else if (pattern === 'Location') {
      return '^(?=.*?[A-Za-z])[A-Za-z+]+$';
    } else if (pattern === 'Url') {
      return '^(http).*';
    } else if (pattern === 'Data Model') {
      return '';
    } else if (pattern === 'Named Entitie') {
      return '';
    } else if (pattern === 'Other') {
      return '';
    }
  }

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  get propsArray(): FormArray {
    return this.formEditNode.get('props') as FormArray;
  }

  set propsArray(props: FormArray) {
    this.formEditNode.setControl('props', props);
  }


  private getUser() {
    this.userService.getUser(this.auth.currentUser).subscribe(
        data => this.user = data,
        error => console.log(error)
    );
  }

  private applyFilter() {
    this.filtersOpen = true;
  }

  private renderCypherAsForm() {
    this.helps.splice(0, this.helps.length);
    let matches = this.currentFilter.help.match(/\$[0-9\d]+/ig),
        sentences = this.currentFilter.help.split(/\$[0-9\d]+/ig);
    for (let i = 0; i < matches.length; i++) {
      let id = matches[i].split('$')[1];
      let h = new Help();
      h.id = id;
      h.sentence = sentences[i];
      this.helps.push(h);
    }
  }

  private reverseReplacement() {
    let matches = this.currentFilter.request.match(/\$[0-9\d]+/ig);
    let req = this.currentFilter.request;
    for (let i = 0; i < matches.length; i++) {
      let id = '#requestParameter' + matches[i].split('$')[1];
      let val = $(id).val();
      req = req.replace(matches[i], val);
    }
    return req;
  }

  private gatherData(uuid) {
    if (uuid === 'general') {
      let node = this.startingNodeSelected;
      this.neo4jService.getGeneralGraph(node.name, node.type, this.degreesOfSeparation).subscribe(
          res => this.processRequest(res),
          err => {
            this.displayErrorMessage = true;
          });
    } else {
      this.neo4jService.getFullGraph(this.graphID, uuid).subscribe(
          res => this.processRequest(res),
          err => {
            this.displayErrorMessage = true;
          });
    }
  }

  private exportGraph() {
    if (this.graphID === -1) {
      alert(this.translation.translate('_CANT_EXPORT_GENERAL_GRAPH_'));
      return;
    } else if (this.nodes.length <= 0) {
      alert(this.translation.translate('_CANT_EXPORT_EMPTY_GRAPH_'));
      return;
    }
    this.modalExport = true;
    this.exportFormat = 'json';
  }

  private graphChanged(n, b) {
    this.graphService.graphIDEmitter.emit(n);
    this.graphService.graphOpenEmitter.emit(b);
  }

  private saveGraph() {
    if (this.nodes.length === 0) {
      this.toast.setMessage(this.translation.translate('_CANT_SAVE_EMPTY_GRAPH_'), 'danger');
      return;
    } else if (this.isolatedNodes().length > 0) {
      this.toast.setMessage(this.translation.translate('_CANT_SAVE_ISOLATED_NODES_'), 'danger');
      return;
    }

    /** Récupération des graphes existant */
    this.graphService.getGraphs(this.user).subscribe(
        res => {
          this.savedGraphs = res;
        }
    );

    let name: string;

    /** Si le graphe n'existe pas */
    if (!this.graphExist(this.graphCurrent)) {
      if (name === undefined || name === '') {
        name = prompt(this.translation.translate('_NAME_GRAPH_'), '');
        if (name === null) {
          return;
        }
        while (name.length < 5 || name.length > 30) {
          alert(this.translation.translate('_NAME_GRAPH_RULES_'));
          name = prompt(this.translation.translate('_NAME_GRAPH_'), '');
          if (name === null) {
            return;
          }
        }
      }
      if (name === undefined || name === '') {
        return;
      }
      this.removeFilter();
      this.graphCurrent.name = name;
      this.graphCurrent._id = null;
      this.graphCurrent.state = 'draft';
      this.graphCurrent.user = this.user._id;
      this.graphCurrent.revision = this.graphRevision;
      this.graphCurrent.comment = '';
      this.graphCurrent.created = new Date();
      if (this.graphCurrent.uuid === undefined || this.graphCurrent.uuid === '') {
        this.graphCurrent.uuid = uuidv4();
      }
      /** Requete */
      this.neo4jService.saveGraph(this.buildRequestForSave()).subscribe(
          res => {
            this.graphService.addGraph(this.graphCurrent).subscribe(
                res2 => {
                  this.graphCurrent._id = res2._id;
                  this.toast.setMessage(this.translation.translate('_GRAPH_SAVE_SUCCESS_'), 'success');
                },
                err2 => this.toast.setMessage(this.translation.translate('_GRAPH_SAVE_ERROR_'), 'danger')
            );
          },
          err => this.toast.setMessage(this.translation.translate('_GRAPH_SAVE_ERROR_'), 'danger')
      );
      /** Si le graphe existe */
    } else {
      this.removeFilter();
      this.graphCurrent.created = new Date();
      this.graphCurrent._id = null;
      this.graphCurrent.state = 'draft';
      this.graphCurrent.revision++;

      /** Requete */
      this.neo4jService.saveGraph(this.buildRequestForSave()).subscribe(
          res => {
            this.graphService.addGraph(this.graphCurrent).subscribe(
                res2 => {
                  this.graphCurrent._id = res2._id;
                  this.toast.setMessage(this.translation.translate('_GRAPH_SAVE_SUCCESS_'), 'success');
                },
                err2 => {
                  this.toast.setMessage(this.translation.translate('_GRAPH_SAVE_ERROR_'), 'danger');
                  this.graphCurrent.revision--;
                }
            );
          },
          err => {
            this.toast.setMessage(this.translation.translate('_GRAPH_SAVE_ERROR_'), 'danger');
            this.graphCurrent.revision--;
          }
      );
    }
  }

  private normalizeName(name) {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '').replace(/-/g, '').replace(/'/g, '');
  }

  private buildRequestForSave() {
    let request = '';
    for (let n of this.nodes) {

      let name = this.normalizeName(n.name);
      request += `
      CREATE (${name}:${n.type} {
      name: "${n.properties.name}",
      revision_id: ${this.graphCurrent.revision},
      uuid: "${this.graphCurrent.uuid}"
      `;

      if (n.props !== null) {
        for (let prop of n.props) {
          request += `, ${prop.nameProp}: "${prop.value}" `;
        }
      }
      request += '}) ';
    }

    if (this.relations.length > 0) {
      request += 'CREATE ';
    }
    let first = true;
    for (let r of this.relations) {
      if (!first) {
        request += ',';
      } else {
        first = false;
      }
      let source = this.normalizeName(r.sourceNode.name);
      let target = this.normalizeName(r.targetNode.name);
      request += `(${source})-
      [:${r.type} {
      comment: "${r.comment}"
      }]->
      (${target})`;
    }
    return request;
  }

  private search(element) {
    let current;
    element = element.toLowerCase();
    for (let node of this.searchIn) {
      current = node.name.toLowerCase();
      if (current.indexOf(element) >= 0) {
        this.results.push(node);
      }
    }
    this.searchProgress = false;
  }

  private isExistingCustomType(name: string) {
    for (let t of this.customTypes) {
      if (t.name === name) {
        return true;
      }
    }
    return false;
  }

  private graphExist(graph: Graph): boolean {
    return this.savedGraphs.some(g => g.name === graph.name);
  }

  private buildForm() {
    this.formEditNode = this.fb.group({
      _id: '',
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]],
      type: '',
      cntype: '',
      props: this.fb.array([])
    });
    this.formEditRel = this.fb.group({
      _id: '',
      type: ['', [Validators.required]],
      crtype: ['', []],
      comment: ''
    });
    this.formCreateRel = this.fb.group({
      rela: ['', [Validators.required]],
      crtype: ['', []],
      comment: ''
    });
    this.formPublishGraph = this.fb.group({
      publishMessage: [this.publishMessage, []]
    });
    this.formStartingNode = this.fb.group({});
  }

  private createPropGroup(prop?: Property): FormGroup {
    return this.fb.group({
      nameProp: [prop ? prop.nameProp : '', [Validators.required]],
      type: [prop ? prop.type : '', [Validators.required]],
      value: [prop ? prop.value : '', Validators.required]
    });
  }

  private setProps(props: Property[]) {
    const propFGs = props.map(prop => this.createPropGroup(prop));
    this.propsArray = this.fb.array(propFGs);
  }

  /**
   * Get rid of '_text' object generated by 'xml2js'.
   * Flatten objects like this :
   *  { prop: { _text: 'hello' } }
   *  => { prop: 'hello' }
   */
  private traverse(obj: Object) {
    for (let k in obj) {
      if (obj.hasOwnProperty(k)) {
        if (typeof obj[k] === 'object') {
          if (obj[k].hasOwnProperty('_text')) {
            obj[k] = obj[k]['_text'];
          } else {
            this.traverse(obj[k]);
          }
        }
      }
    }
  }

  private parseProps(newNode: Node) {

    const list_keys = Object.keys(newNode.properties);
    const list_values = Object.values(newNode.properties);

    let index = 0;
    let val;
    let val_courante;
    let typeProp = '';

    for (let key of list_keys) {
      if (key !== 'name'
          && key !== 'type'
          && key !== 'uuid'
          && key !== 'revision_id'
          && key !== 'props') {

        index = list_keys.indexOf(key);
        val_courante = list_values[index];

        if (typeof(val_courante) === 'object') {
          val = JSON.stringify(val_courante['low']);
        } else {
          val = val_courante;
        }

        if (Date.parse(val)) {
          typeProp = 'Date';
        } else if (val.startsWith('http')) {
          typeProp = 'Url';
        } else if (cities.includes(val)) {
          typeProp = 'Location';
        } else {
          typeProp = 'Other';
        }

        let p: Property = {
          nameProp: key,
          value: val,
          type: typeProp,
        };

        newNode.props.push(p);
      }
    }
  }

  private isolatedNodes(): string[] {
    let isConnected = (n: Node) => {
      return this.relations.some(r => r.sourceNode.id === n.id || r.targetNode.id === n.id);
    };
    return this.nodes.filter(n => !isConnected(n)).map(n => n.name);
  }

  private nodeExist(node: Node): boolean {
    return this.nodes.some(n => n.id === node.id);
  }

  private relationExist(rel: Relationship): boolean {
    return this.relations.some(r => r.id === rel.id);
  }

  private findNode(node: Node): Node {
    return this.nodes.find(n => n.id === node.id);
  }

  private processRequest(res): void {
    res.result.forEach(r => {

      let req = JSON.parse(r);

      /** Dans un premier on parcours les fields qui contiennent des nodes */
      for (let field of req._fields) {
        /** Si le field contient la property "properties" et ne contient pas "start" c'est un node */
        if (field.hasOwnProperty('properties') && !field.hasOwnProperty('start')) {
          const newnode = Node.create(field);
          if (!this.nodeExist(newnode)) {
            this.parseProps(newnode);
            this.nodes.push(newnode);
          }
        }
      }
      /** Ensuite on parcours les fields qui contiennent des relations */
      for (let field of req._fields) {
        if (!field.hasOwnProperty('properties') || field.hasOwnProperty('start') || field.has) {
          if (!!field) {
            let reqRels = field;
            if (!Array.isArray(reqRels)) {
              reqRels = [reqRels];
            }

            reqRels.forEach(reqRel => {
              const relation = Relationship.create(reqRel);
              if (!this.relationExist(relation)) {
                /**
                 * Source and target nodes are not always newnode1 and newnode2,
                 * for requests like (n)-[r*1..2]-(o), the source will be 'n' and the target 'o',
                 * we do not want the relation to be created directly between 'n' and 'o'
                 */
                let n1 = this.nodes.find(n => n.id === reqRel.start.low);
                let n2 = this.nodes.find(n => n.id === reqRel.end.low);

                if (n1 == null || n2 == null) {
                  return;
                }

                relation.source = n1.id;
                relation.sourceNode = n1;
                relation.target = n2.id;
                relation.targetNode = n2;
                this.relations.push(relation);
              }
            });
          }
        }
      }
    });
    this.graph.update(this.relations, this.nodes);
    this.graphDrawing = false;
    if (res.result.length === 300) {
      this.toast.setMessage(this.translation.translate('_LIMIT_REACHED_'), 'warning', 5000);
    }
  }

}
