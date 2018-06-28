import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

import { JwtHelper } from 'angular2-jwt';

import User from '../models/user';
import BaseCtrl from './base';

export default class UserCtrl extends BaseCtrl {
  model = User;

  login = (req, res) => {
    this.model.findOne({ email: req.body.email }, (err, user) => {
      if (!user) { return res.sendStatus(403); }
      user.comparePassword(req.body.password, (error, isMatch) => {
        if (!isMatch) { return res.sendStatus(403); }
        const token = jwt.sign({ user: user }, process.env.SECRET_TOKEN); // , { expiresIn: 10 } seconds
        res.status(200).json({ token: token });
      });
    });
  }

  // Update by id
  updateProtected = (req, res) => {
    let user = new this.model(req.body);
    this.cryptPassword(user)
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token != null) {
      jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
        if(err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          // If not admin or not called by the user himself
          if(!this.verifyUser(token, req.params.id)) {
            return res.status(403).send({ success: false, message: 'Not allowed to perform this action.' });
          }
          this.model.findOneAndUpdate({ _id: req.params.id }, user, (err, item) => {
            res.status(200).json(item);
          });
        }
      });
    } else {
      return res.status(403).send({ success: false, message: 'No token provided.' });
    }
  }

  // Delete by id
  deleteProtected = (req, res) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
      jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
        if(err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          if(!this.verifyUser(token)) {
            return res.status(403).send({ success: false, message: 'Not allowed to perform this action.' });
          }
          this.model.findOneAndRemove({ _id: req.params.id }, (err) => {
            if (err) { return console.error(err); }
            res.sendStatus(200);
          });
        }
      });
    } else {
      return res.status(403).send({ success: false, message: 'No token provided.' });
    }
  }

  // Verify if the user is allowed to perform the action
  verifyUser = (token, self = null) => {
    let jwtHelper = new JwtHelper();
    let userCheck = jwtHelper.decodeToken(token).user;
    let userValid = true;
    this.model.findOne({ _id: userCheck.id, username: userCheck.username, email: userCheck.email }, (err, user) => {
      // Unknown user or not admin
      if (!user || user.role != 'admin') {
        userValid = false;
      }
      // Known user and self parameter, which indicate a modification on self id, not null
      if(user && self != null && user.id == self) {
        if(user.role != 'admin' && userCheck == 'admin') {
          userValid = false;
        }
        if(user.role != 'admin' && userCheck != 'admin') {
          userValid = true;
        }
      }
    });
    return userValid;
  }

  private cryptPassword(user) {
    if (!user.password) {
      return
    }
    let salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(user.password, salt);
  }

}
