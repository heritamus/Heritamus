import { config } from '../config/config';

export default class Neo4jCtrl {
  neo4j = require('neo4j-driver').v1;
  driver = this.neo4j.driver(config.neo4j.bolt, this.neo4j.auth.basic(config.neo4j.login, config.neo4j.password));
  session = this.driver.session();

  getMostCommonlyUsedNodes = (req, res) => {
    this.session
        .run('MATCH (n)-[]-(o) WHERE n.revision_id=0 RETURN DISTINCT n, COUNT(o) AS cnt ORDER BY cnt DESC LIMIT 10')
        .then((result) => {
          let results: Array<string> = [];
          result.records.forEach((record) => {
            results.push(JSON.stringify(record));
          });
          return res.status(200).json({ result: results });
        })
        .catch((error) => {
          return res.status(500).json({ err: error });
        });
  }

  countNodes = (req, res) => {
    this.session
        .run('MATCH (n) WHERE n.revision_id=0 WITH DISTINCT n RETURN COUNT(n)')
        .then((result) => {
          return res.status(200).json(+result.records[0]._fields[0].low);
        })
        .catch((error) => {
          return res.status(500).json({ err: error });
        });
  }

  countRelations = (req, res) => {
    this.session
        .run('MATCH (n)-[r]-(o) WHERE n.revision_id=0 WITH DISTINCT r RETURN COUNT(r)')
        .then((result) => {
          return res.status(200).json(+result.records[0]._fields[0].low);
        })
        .catch((error) => {
          return res.status(500).json({ err: error });
        });
  }

  getAllNodes = (req, res) => {
    this.session
        .run('MATCH (n)-[]-(o) WHERE n.revision_id=0 RETURN DISTINCT n ORDER BY n.name ASC')
        .then((result) => {
          let results: Array<string> = [];
          result.records.forEach((record) => {
            results.push(JSON.stringify(record));
          });
          return res.status(200).json({ result: results });
        })
        .catch((error) => {
          return res.status(500).json({ err: error });
        });
  }

  getGeneralGraph = (req, res) => {
    let dos = +req.params.dos;
    let name = req.params.name;
    let type = req.params.type;
    let neo4jReq = `MATCH (n:${type})-[r*1..${dos}]-(o) WHERE n.name="${name}" AND n.revision_id=0 RETURN n,r,o LIMIT 300`;
    this.session
        .run(neo4jReq)
        .then((result) => {
          let results: Array<string> = [];
          result.records.forEach((record) => {
            results.push(JSON.stringify(record));
          });
          return res.status(200).json({ result: results });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ err: error });
        });
  }

  getGraph = (req, res) => {
    let rev_id = +req.params.rev_id;
    let uuid = req.params.uuid;
    let limit = req.params.limit;
    let neo4jReq;
    // Protection
    if (limit > 50) {
      limit = 50;
    }
    if (limit < 10) {
      limit = 10;
    }
    if (rev_id === 0) {
      neo4jReq = `MATCH (n)-[r]-(o) WHERE n.revision_id=${rev_id} RETURN n, r, o LIMIT ${limit}`;
    } else {
      neo4jReq = `MATCH (n)-[r]-(o) WHERE n.revision_id=${rev_id} AND n.uuid="${uuid}" RETURN n, r, o LIMIT ${limit}`;
    }
    this.session
        .run(neo4jReq)
        .then((result) => {
          let results: Array<string> = [];
          result.records.forEach((record) => {
            results.push(JSON.stringify(record));
          });
          return res.status(200).json({ result: results });
        })
        .catch((error) => {
          return res.status(500).json({ err: error });
        });
  }

  getFullGraph = (req, res) => {
    let rev_id = +req.params.rev_id;
    let uuid = req.params.uuid;
    let neo4jReq;
    if (rev_id === 0) {
      neo4jReq = `MATCH (n)-[r]-(o) WHERE n.revision_id=${rev_id} RETURN n, r, o`;
    } else {
      neo4jReq = `MATCH (n)-[r]-(o) WHERE n.revision_id=${rev_id} AND n.uuid="${uuid}" RETURN n, r, o`;
    }
    this.session
        .run(neo4jReq)
        .then((result) => {
          let results: Array<string> = [];
          result.records.forEach((record) => {
            results.push(JSON.stringify(record));
          });
          return res.status(200).json({ result: results });
        })
        .catch((error) => {
          return res.status(500).json({ err: error });
        });
  }

  getSpecificNode = (req, res) => {
    let rev_id = +req.params.rev_id;
    let name = req.params.name;
    let type = req.params.type;
    let uuid = req.params.uuid;
    let neo4jReq;
    if (rev_id === 0) {
      neo4jReq = `MATCH (n:${type}) WHERE n.revision_id=${rev_id} AND n.name="${name}" RETURN n LIMIT 1`;
    } else {
      neo4jReq = `MATCH (n:${type}) WHERE n.revision_id=${rev_id} AND n.name="${name}" AND n.uuid="${uuid}" RETURN n LIMIT 1`;
    }
    this.session
        .run(neo4jReq)
        .then((result) => {
          return res.status(200).json({ node: result });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ err: error });
        });
  }

  deleteNode = (req, res) => {
    let name = req.params.name;
    let type = req.params.type;
    let neo4jReq = `MATCH (n:${type}) WHERE n.revision_id=0 AND n.name="${name}" DETACH DELETE n`;
    this.session
        .run(neo4jReq)
        .then((result) => {
          return res.status(200).json({ node: result });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ err: error });
        });
  }

  deleteGraph = (req, res) => {
    let rev_id = req.params.rev_id;
    let uuid = req.params.uuid;
    let neo4jReq = `MATCH (n) WHERE n.revision_id=${rev_id} AND n.uuid="${uuid}" DETACH DELETE n`;
    this.session
        .run(neo4jReq)
        .then((result) => {
          return res.status(200).json({ node: result });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ err: error });
        });
  }

  saveGraph = (req, res) => {
    let request = req.body.req;
    console.log(request);
    this.session
        .run(request)
        .then((result) => {
          return res.status(200).json({ status: 'ok' });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ err: error });
        });
  }
}
