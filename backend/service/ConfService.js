const { connection } = require("../dbConnect.js"); //databasePool로 
//const mapper = require("./SqlMapper");
//const sqlMapper = require("#service/SqlMapper.js");
//const mapper = new SqlMapper();
const mapper = require("./SqlMapper.js");

class ConfService {
  constructor(namespace) {
    console.log("constructor: conf");
  }

  async getConfList() {
    const result = this.selectQuery("selectConfList"); //select id 값
    return result;
  }

  loadNamespace() {
    // 네임스페이스 세팅
    mapper.setNamespace("conf");
  }

  async executeQuery(query) {
    const pool = await connection;
    const result = await pool.request().query(query);
    return result;
  }

  async selectQuery(mapperId) {
    this.loadNamespace();
    const query = mapper.getSql(mapperId);
    const result = await this.executeQuery(query);
    console.log("selectQuery", query);
    return result;
  }

  async selectQueryWithParms(mapperId, params) {
    this.loadNamespace();
    const query = mapper.getSql(mapperId, params);
    const result = await this.executeQuery(query);

    return result;
  }
}

module.exports = ConfService;
