const { connection } = require("../dbConnect.js");
//const mapper = require("./SqlMapper");
//const sqlMapper = require("#service/SqlMapper.js");
//const mapper = new SqlMapper();
const mapper = require("#service/SqlMapper.js");

class ConfService {
  constructor(namespace) {
    console.log("constructor: conf");
  }
  loadNamespace() {
    mapper.setNamespace("conf");
  }

  async getConfList() {
    this.loadNamespace();
    const query = mapper.getSql("selectTreeMenuList");

    const pool = await connection;
    const result = await pool.request().query(query);

    console.log("result", result);

    return result;
  }


}

module.exports = ConfService;
