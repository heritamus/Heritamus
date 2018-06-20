import Request from '../models/request';
import BaseCtrl from './base';
import { config } from '../config/config';

export default class RequestCtrl extends BaseCtrl {
    model = Request;
    neo4j = require('neo4j-driver').v1;
    driver = this.neo4j.driver(config.neo4j.bolt, this.neo4j.auth.basic(config.neo4j.login, config.neo4j.password));
    session = this.driver.session();

    play = (req, res) => {
        if (!req.body || req.body == '') {
            return res.status(400).json({ err: 'You must pass a request to execute' });
        }
        this.session
            .run(req.body.request)
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
}
