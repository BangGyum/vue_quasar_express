const { databasePool } = require("#express/db-amifeed.js");
//const mapper = require("./SqlMapper");
//const sqlMapper = require("#service/SqlMapper.js");
//const mapper = new SqlMapper();
const mapper = require("#service/SqlMapper.js");

class ConfService {
  constructor(namespace) {
    console.log("constructor: conf");
  }

  async getConfList() {
    const result = this.selectList("selectConfList", {});
    return result;
  }

  loadNamespace() {
    // 네임스페이스 세팅
    mapper.setNamespace("conf");
  }

  async executeQuery(query) {
    const pool = await databasePool;
    const result = await pool.request().query(query);
    return result;
  }

  async selectList(mapperId, params) {
    this.loadNamespace();
    const query = mapper.getSql(mapperId, params);
    console.log("query", query);
    const result = await this.executeQuery(query).then(
      (resultObj) => resultObj.recordset
    );

    //const util = require("util");
    //console.log("result", util.inspect(result, false, null));

    return result;
  }

  async select(mapperId, params) {
    this.loadNamespace();
    const query = mapper.getSql(mapperId, params);
    const result = await this.executeQuery(query).then((resultObj) => {
      let value = "";
      const firstRecordset = resultObj.recordset[0];
      for (let key in firstRecordset) {
        value = firstRecordset[key];
        break;
      }
      return value;
    });

    //const util = require("util");
    //console.log("result", util.inspect(result, false, null));

    return result;
  }
}

module.exports = ConfService;
