const Subscription = require('egg').Subscription;

class updateTokenTx extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '1m',
      type: 'worker',
      immediate: true
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    try {
      const pageSize = 10;
      const txCount = await this.count();
      const page = Math.floor(txCount / pageSize) + 1;
      const url = `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=0xdcd85914b8ae28c1e62f1c488e1d968d5aaffe2b&page=${page}&offset=${pageSize}&sort=asc`;
      const res = await this.ctx.curl(url, {
        dataType: 'json',
      });
      console.log('page > ', page);
      const dataResult = res.data.result;
      for (let i=0;i<dataResult.length;i++) {
        const tempData = dataResult[i];
        const isHas = await this.find(tempData.hash);
        if (isHas){
          console.log('data is has > ', tempData.hash);
          continue;
        }
        tempData['id'] = (page - 1) * pageSize + 1 + i;
        await this.save(tempData);
        console.log('data insert succ > ', tempData.hash);
      }
    } catch (error) {
      console.error('error > ', error);
    }
  }

  async save(data) {
    const db = this.app.txdb;
    return new Promise(resolve => {
        db.insert(data, (err, doc) => {
            if(err) {
                resolve(false);
                return;
            }
            resolve(true);
        });
    });
  }

  async find(txHash) {
    const db = this.app.txdb;
    return new Promise(resolve => {
        db.find({ hash: txHash }, (err, doc) => {
          if (doc.length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
    });
  }

  async count(){
    const db = this.app.txdb;
    return new Promise(resolve => {
      db.count({}, (err, count) => {
        if (!err) {
          resolve(count);
        }
      });
    });
  }
}

module.exports = updateTokenTx;