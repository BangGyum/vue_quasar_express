const { databasePool } = require("../dbConnect");
const mybatisMapper = require("mybatis-mapper");
const mapperDirectory = "./mapper";
const fs = require("fs");

class SqlMapper {
  constructor() {
    const mapperFiles = fs
      .readdirSync(mapperDirectory)
      .filter((item) => item.endsWith(".xml"))
      .map((item) => `${mapperDirectory}/${item}`);

    mybatisMapper.createMapper(mapperFiles);
  }

  setNamespace(namespace) {
    this.namespace = namespace;
  }

  getSql() {
    let sqlId = "";
    let param = {};
    let format = {};

    console.log("getSql begin", param);

    const len = arguments.length;
    switch (len) {
      case 1:
      case 2:
      case 3:
        [sqlId, param, format] = arguments;
        break;
      default:
        throw "error";
        break;
    }

    format = format ?? {
      language: "tsql",
      indent: "  ",
    };

    console.log("getSql end");

    return mybatisMapper.getStatement(this.namespace, sqlId, param, format);
  }

  async executeQuery(query) {
    const pool = await databasePool;
    const result = await pool.request().query(query);
    return result;
  }

  async selectList(mapperId, params) {
    const query = this.getSql(mapperId, params);
    console.log("query", query);
    const result = await this.executeQuery(query).then(
      (resultObj) => resultObj.recordset
    );

    //const util = require("util");
    //console.log("result", util.inspect(result, false, null));

    return result;
  }

  async select(mapperId, params) {
    const resultList = await this.selectList(mapperId, params);
    let result = {};
    if (resultList.length > 0) {
      result = resultList[0];
    }

    console.log("resultList", resultList);
    console.log("result", result);

    //const util = require("util");
    //console.log("result", util.inspect(result, false, null));

    return result;
  }
}

module.exports = SqlMapper;
