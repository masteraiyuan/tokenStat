'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');

class HomeController extends Controller {

  async index() {
    
    const { ctx } = this;
    const result = await this.find(ctx.helper.hbAddr);
    result.forEach(item => {
      const m = moment.unix(item.timeStamp);
      item.timeStr = m.format();
    });
    ctx.body = result;
  }

  async find(arrAddr, limit) {
    const db = this.app.txdb;
    limit = limit ? limit : 30;
    return new Promise(resolve => {
        db.find({ to: {$in: arrAddr} }).sort({timeStamp: -1}).limit(limit).exec((err, doc) => {
          if (doc.length > 0) {
            resolve(doc);
          } else {
            resolve(false);
          }
        });
    });
  }
}

module.exports = HomeController;
