import { Component, OnInit } from '@angular/core';
import { Neo4jService } from '../../services/neo4j.service';
import { Node } from '../../shared/models/node.model';
import { ToastComponent } from '../../shared/toast/toast.component';
import { Language, TranslationService } from 'angular-l10n';
import * as $ from 'jquery';
import { getNodeType } from '../../../static/nodeTypes';

@Component({
  selector: 'app-admin-general',
  templateUrl: './general.admin.component.html'
})
export class AdminGeneralGraphsComponent implements OnInit {
  @Language() lang: string;
  results: Array<Node>;
  searchIn: Array<Node>;
  nodeToDelete: string;
  nodeToDeleteSelected: Node;
  isLoading = true;
  language: string;
  mostUsedNodes: Array<Node>;
  nbRelConnected: Array<number>;
  nbNodes = 0;
  nbRelations = 0;

  constructor(private neo4jService: Neo4jService,
              public toast: ToastComponent,
              public translation: TranslationService) {
    this.mostUsedNodes = [];
    this.nbRelConnected = [];
  }

  ngOnInit() {
    this.nodeToDelete = '';
    this.nodeToDeleteSelected = null;
    this.results = [];
    this.gatherTerms();

    this.neo4jService.getMostCommonlyUsedNodes().subscribe(
        res => {
          for (let i = 0; i < res.result.length; i++) {
            let node = Node.create(JSON.parse(res.result[i])._fields[0]);
            this.mostUsedNodes.push(node);
            let cnt = JSON.parse(res.result[i])._fields[1].low;
            this.nbRelConnected.push(cnt);
          }
        },
        err => {
        }
    );

    this.neo4jService.getNumberOfNodes().subscribe(
        res => this.nbNodes = res,
        err => console.log(err)
    );

    this.neo4jService.getNumberOfRelations().subscribe(
        res => this.nbRelations = res,
        err => console.log(err)
    );

    /** Changement des listes de nodes/relations suivant la langue */
    this.translation.translationChanged().subscribe(res => {
      this.language = res;
    });
  }

  gatherTerms() {
    this.searchIn = [];
    this.neo4jService.getAllNodes().subscribe(
        res => {
          for (let i = 0; i < res.result.length; i++) {
            let node = Node.create(JSON.parse(res.result[i])._fields[0]);
            this.searchIn.push(node);
          }
        },
        err => {
        },
        () => this.isLoading = false
    );
  }

  searchDeletingNode() {
    this.nodeToDelete = $('#searchNodeToDelete').val();
    this.results = [];
    if (this.nodeToDelete.length >= 3) {
      this.search(this.nodeToDelete);
    }
  }

  selectDeletingNode(node: Node) {
    this.neo4jService.getSpecificNode(node.name, node.type).subscribe(
        res => {
          this.nodeToDeleteSelected = Node.create(res.node.records[0]._fields[0]);
        }
    );
  }

  removeDeletingNode() {
    this.nodeToDeleteSelected = null;
    this.nodeToDelete = '';
    $('#searchNodeToDelete').val('');
  }

  search(element) {
    let current;
    element = element.toLowerCase();
    for (let node of this.searchIn) {
      current = node.name.toLowerCase();
      if (current.indexOf(element) >= 0) {
        this.results.push(node);
      }
    }
  }

  deleteNode() {
    if (confirm(this.translation.translate('_CONFIRM_NODE_DELETE_'))) {
      let node = this.nodeToDeleteSelected;
      this.neo4jService.deleteNode(node.name, node.type).subscribe(
          res => {
            this.removeDeletingNode();
            this.gatherTerms();
            alert(this.translation.translate('_NODE_DELETION_SUCCESS_'));
          },
          err => this.toast.setMessage(this.translation.translate('_NODE_DELETION_FAIL_'), 'danger')
      );
    }
  }

  getType(node: Node): string {
    return getNodeType(node.type, this.language);
  }
}
