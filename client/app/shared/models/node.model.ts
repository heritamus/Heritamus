export class PropertyTypes {
  static date = 'Date';
  static location = 'Location';
  static url = 'Url';
  static dataModel = 'Data model';
  static NamedEntitie = 'Named entitie';
  static other = 'Other';
}

export const TypesForProperties = [
  PropertyTypes.date,
  PropertyTypes.location,
  PropertyTypes.url,
  PropertyTypes.dataModel,
  PropertyTypes.NamedEntitie,
  PropertyTypes.other
];

export class Property {
  nameProp: string;
  type: PropertyTypes;
  value: string;
}

export class NodeProperties {
  name: string;
  type: string;
  origin?: number;
  props: Property[] = [];
}

export class JsonNode {
  identity = { low: -1, high: 0 };
  labels: string[] = [];
  properties = new NodeProperties();

  static create(node: Node): JsonNode {
    return {
      identity: node.identity,
      labels: node.labels,
      properties: {
        name: node.properties.name || '',
        type: node.type === 'Custom' ? node.cntype : node.type,
        props: node.props || []
      }
    };
  }
}

export class Node extends JsonNode {
  cntype: string;
  x?: number = null;
  y?: number = null;
  cx?: number = null;
  cy?: number = null;
  vx?: number = null;
  vy?: number = null;

  /**
   * cast object to Node
   * @param {Object} data
   * @returns {Node}
   */
  public static create(data: Object): Node {
    let node = new Node();
    node.identity = data['identity'];
    node.labels = Array.isArray(data['labels']) ? data['labels'] : [data['labels']]; // Because of 'xml-js'
    node.properties = data['properties'];
    if (node.properties.props === undefined) {
      node.properties.props = [];
    }
    node.type =  Array.isArray(node.labels) ? node.labels[0] : node.labels; // Because of 'xml-js'
    return node;
  }

  get id(): number {
    return this.identity.low;
  }

  set id(value: number) {
    this.identity.low = value;
  }

  get name(): string {
    return this.properties ? this.properties.name : null;
  }

  set name(value: string) {
    this.properties.name = value;
  }

  get type(): string {
    return this.properties ? this.properties.type : null;
  }

  set type(value: string) {
    this.properties.type = value;
  }

  get props(): Property[] {
    return this.properties ? this.properties.props : null;
  }

  set props(value: Property[]) {
    this.properties.props = value;
  }

  get origin(): number {
    return this.properties ? this.properties.origin : null;
  }

  set origin(value: number) {
    this.properties.origin = value;
  }
}
