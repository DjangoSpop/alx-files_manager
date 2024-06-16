const { Db } = require('mongodb');
const redis = require('redis');

class AppController {
  static getStatus(req, res) {
    if (redis.isAlive()) {
      res.status(200).send();
    } else {
      Db.isAlive((err, res) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send({ users: 12, files: 1231 });
        }
      });
    }
  }

  static getStats(req, res) {
    res.status(200).send();
  }
}
module.exports = AppController;
