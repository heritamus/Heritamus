import { Component, OnInit } from '@angular/core';
import { Graph } from '../../shared/models/graph.model';
import { User } from '../../shared/models/user.model';
import { GraphService } from '../../services/graph.service';
import { Neo4jService } from '../../services/neo4j.service';
import { Node } from '../../shared/models/node.model';
import { Relationship } from '../../shared/models/relationship.model';
import { UserService } from '../../services/user.service';
import { ToastComponent } from '../../shared/toast/toast.component';
import { Language, TranslationService } from 'angular-l10n';
import * as $ from 'jquery';

class NodeToReview {
  n: Node;
  state: string;
}

class RelationshipToReview {
  r: Relationship;
  state: string;
  reviewable: boolean;
}

@Component({
  selector: 'app-admin-graphs',
  templateUrl: './graphs.admin.component.html'
})
export class AdminGraphsComponent implements OnInit {
  @Language() lang: string;

  users: Array<User>;
  graphs: Array<Graph>;
  modalReview: Boolean;
  loadingDiff: Boolean;
  isLoading = true;
  nodesToReview: Array<Node>;
  relationsToReview: Array<Relationship>;
  generalGraphNodes: Array<Node>;
  generalGraphRelations: Array<Relationship>;
  nodesDiffAdded: Array<NodeToReview>;
  relationsDiffAdded: Array<RelationshipToReview>;
  nodesToMerge: Array<Node>;
  relationsToMerge: Array<Relationship>;
  mergeable: boolean;
  reviewComment: string;
  graphReviewed: Graph;

  constructor(private graphService: GraphService,
              private userService: UserService,
              private neo4jService: Neo4jService,
              public toast: ToastComponent,
              public translation: TranslationService) {
  }

  ngOnInit() {
    this.mergeable = false;
    this.graphs = [];
    this.users = [];
    this.userService.getUsers().subscribe(
        res => {
          this.users = res;
          this.isLoading = false;
        },
        error => console.log(error)
    );
    this.graphService.getNotReviewedGraphs().subscribe(
        res => this.graphs = res,
        error => console.log(error)
    );
    this.modalReview = false;
    this.loadingDiff = true;
  }

  getGraphAuthor(userID) {
    for (let u of this.users) {
      if (u._id === userID) {
        return u.username;
      }
    }
  }

  deleteGraphReview(graph: Graph) {
    graph.state = 'draft';
    this.graphService.editGraph(graph).subscribe(
        res => this.toast.setMessage(this.translation.translate('_GRAPH_NOT_REVIEWABLE_ANYMORE_'), 'success'),
        error => this.toast.setMessage(this.translation.translate('_GRAPH_REVIEW_DELETE_ERROR_'), 'danger')
    );
  }

  reviewGraph(graph: Graph) {
    this.graphReviewed = graph;
    this.modalReview = true;
    this.loadingDiff = true;
    this.generalGraphNodes = [];
    this.generalGraphRelations = [];
    this.nodesToReview = [];
    this.relationsToReview = [];
    this.nodesToMerge = [];
    this.relationsToMerge = [];
    this.mergeable = false;
    this.gatherData(0, 'general', this.generalGraphNodes, this.generalGraphRelations);
    this.gatherData(graph.revision, graph.uuid, this.nodesToReview, this.relationsToReview);
  }

  gatherData(rev_id: number, uuid: string, nodes: Node[], relations: Relationship[]) {
    this.neo4jService.getFullGraph(rev_id, uuid).subscribe(res => {
          res.result.forEach(r => {
            const newnode1 = Node.create(JSON.parse(r)._fields[0]);
            if (!nodes.some(n => n.id === newnode1.id)) {
              nodes.push(newnode1);
            }
            const newnode2 = Node.create(JSON.parse(r)._fields[2]);
            if (!nodes.some(n => n.id === newnode2.id)) {
              nodes.push(newnode2);
            }
            const relationship = Relationship.create(JSON.parse(r)._fields[1]);
            relationship.source = newnode2.id;
            relationship.sourceNode = newnode2;
            relationship.target = newnode1.id;
            relationship.targetNode = newnode1;
            if (!relations.some(relation => relation.id === relationship.id)) {
              relations.push(relationship);
            }
          });
          if (this.generalGraphNodes.length !== 0
              && this.generalGraphRelations.length !== 0
              && this.nodesToReview.length !== 0
              && this.relationsToReview.length !== 0) {
            this.calculateDiff();
          }
        },
        err => {
        }
    );
  }

  addMerge(nr, type) {
    nr.state = 'toMerge';
    if (type === 'node') {
      this.nodesToMerge.push(nr.n);
      this.checkImpact(nr, true);
    } else {
      this.relationsToMerge.push(nr.r);
    }
    this.checkMergeState();
  }

  checkImpact(nr, i) {
    for (let rel of this.relationsDiffAdded) {
      if (rel.r.targetNode.name === nr.n.name || rel.r.sourceNode.name === nr.n.name) {
        rel.reviewable = i;
        if (!i) {
          let index = this.relationsToMerge.indexOf(rel.r);
          if (index >= 0) {
            this.relationsToMerge.splice(index, 1);
          }
          rel.state = 'waiting';
        }
        this.checkMergeState();
      }
    }
  }

  checkMergeState() {
    this.mergeable = this.calculateMergesDone() === (this.nodesDiffAdded.length + this.relationsDiffAdded.length);
  }

  removeMerge(nr, type) {
    if (type === 'node') {
      let index = this.nodesToMerge.indexOf(nr.n);
      this.nodesToMerge.splice(index, 1);
      this.checkImpact(nr, false);
    } else {
      let index = this.relationsToMerge.indexOf(nr.r);
      this.relationsToMerge.splice(index, 1);
    }
    nr.state = 'toNotMerge';
    this.checkMergeState();
  }

  calculateMergesDone() {
    let total = 0;
    for (let n of this.nodesDiffAdded) {
      if (n.state !== 'waiting') {
        total++;
      }
    }
    for (let r of this.relationsDiffAdded) {
      if (r.state !== 'waiting') {
        total++;
      }
    }
    return total;
  }

  calculateDiff() {
    this.nodesDiffAdded = [];
    this.relationsDiffAdded = [];
    for (let n of this.nodesToReview) {
      let node = new NodeToReview();
      node.n = n;
      node.state = 'waiting';
      let diffNode = this.calculateNodeDiff(node.n);
      if (diffNode === 'added') {
        this.nodesDiffAdded.push(node);
      }
    }
    for (let r of this.relationsToReview) {
      let rel = new RelationshipToReview();
      rel.r = r;
      rel.state = 'waiting';
      rel.reviewable = true;
      let diffRel = this.calculateRelDiff(rel.r);
      if (!diffRel) {
        this.relationsDiffAdded.push(rel);
      }
    }
    this.loadingDiff = false;
  }

  calculateNodeDiff(node: Node) {
    let found = false;
    for (let n of this.generalGraphNodes) {
      if (n.name === node.name) {
        found = true;
      }
    }
    if (!found) {
      return 'added';
    }
  }

  calculateRelDiff(rel: Relationship) {
    let found = false;
    for (let r of this.generalGraphRelations) {
      if (rel.targetNode.name === r.targetNode.name
          && rel.sourceNode.name === r.sourceNode.name
          && rel.type === r.type
          || rel.targetNode.name === r.sourceNode.name
          && rel.sourceNode.name === r.targetNode.name
          && rel.type === r.type) {
        found = true;
      }
    }
    return found;
  }

  changeComment() {
    this.reviewComment = $('#commentReview').val();
  }

  reviewDone() {
    this.graphReviewed.state = 'reviewed';
    this.graphReviewed.comment = this.reviewComment;
    let req = this.createMergeRequest();
    this.neo4jService.saveGraph(req).subscribe(
        res => {
          this.graphService.editGraph(this.graphReviewed).subscribe(
              res2 => this.toast.setMessage(this.translation.translate('_GRAPH_REVIEW_SUCCESS_'), 'success'),
              err2 => this.toast.setMessage(this.translation.translate('_GRAPH_REVIEW_FAIL_'), 'danger')
          );
        },
        err => this.toast.setMessage(this.translation.translate('_GRAPH_MERGE_ERROR_'), 'danger')
    );
    this.modalReview = false;
  }

  createMergeRequest() {
    let request = '';
    for (let n of this.nodesToMerge) {
      request += 'CREATE (' + this.normalizeName(n.name) + ':' + n.type + ' {name: "' + n.properties.name + '", revision_id: 0 }) ';
    }
    for (let r of this.relationsToMerge) {
      let foundTarget = false;
      let foundSource = false;
      for (let n of this.generalGraphNodes) {
        if (r.targetNode.name === n.name) {
          foundTarget = true;
        }
        if (r.sourceNode.name === n.name) {
          foundSource = true;
        }
      }
      let sourceName = this.normalizeName(r.sourceNode.name);
      let targetName = this.normalizeName(r.targetNode.name);
      if (foundTarget || foundSource) {
        if (request !== '') {
          request += 'WITH ';
          let first = true;
          for (let n of this.nodesToMerge) {
            if (first) {
              first = false;
            } else {
              request += ',';
            }
            request += this.normalizeName(n.name) + ' ';
          }
        }
      }
      if (foundTarget) {
        request += 'MATCH (a {name: "' + r.targetNode.name + '"}) ';
        targetName = 'a';
      }
      if (foundSource) {
        request += 'MATCH (b {name: "' + r.sourceNode.name + '"}) ';
        sourceName = 'b';
      }
      request += 'CREATE (' + sourceName + ')-[:' + r.type + ']->(' + targetName + ') ';
    }
    return request;
  }

  normalizeName(name) {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '').replace(/-/g, '').replace(/'/g, '');
  }

}
