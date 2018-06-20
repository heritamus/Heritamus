import { Node } from './node.model';
import { relationTypes } from '../../../static/relationTypes';

export class JsonRelationship {
  type: string;
  sourceId: number;
  targetId: number;
  identity: { low: number, high: number };

  static create(rel: Relationship): JsonRelationship {
    return {
      type: rel.type,
      sourceId: rel.sourceNode.identity.low,
      targetId: rel.targetNode.identity.low,
      identity: rel.identity
    };
  }
}

export class Relationship {
  type: string;
  source: number;
  target: number;
  sourceNode: Node;
  targetNode: Node;
  identity: { low: number, high: number };
  properties: any;

  /** propeties to draw links **/
  sameIndex: number;
  sameTotal: number;
  sameTotalHalf: number;
  sameUneven: boolean;
  sameMiddleLink: boolean;
  sameLowerHalf: boolean;
  sameArcDirection: number;
  sameIndexCorrected: number;
  maxSameHalf: number;


  constructor() {
    this.identity = { low: -1, high: 0 };
    this.properties = {
      comment: ''
    };
    this.type = relationTypes[0].en;
  }

  /**
   * Cast Object to Relationship
   * @param {Object} data
   * @returns {Relationship}
   */
  public static create(data: Object): Relationship {
    let rel = new Relationship();
    rel.identity = data['identity'];
    rel.properties = data['properties'];
    rel.type = data['type'];
    return rel;
  }

  public static createFromJson(jRel: JsonRelationship, nodes: Node[]): Relationship {
    let rel = new Relationship();
    rel.type = jRel.type;
    rel.identity = jRel.identity;
    let n1 = nodes.find((n) => n.id === jRel.sourceId);
    let n2 = nodes.find((n) => n.id === jRel.targetId);
    rel.sourceNode = n1;
    rel.targetNode = n2;
    rel.source = n1.id;
    rel.target = n2.id;
    return rel;
  }

  get id(): number {
    return this.identity.low;
  }

  set id(id: number) {
    this.identity.low = id;
  }

  get comment(): string {
    return this.properties.comment || '';
  }

  set comment(value: string) {
    this.properties.comment = value;
  }
}
