const mybatisMapper = require("mybatis-mapper");
const mapperDirectory = "./mapper";
const fs = require("fs");


const mapperFiles = fs
  .readdirSync(mapperDirectory)
  .filter((item) => item.endsWith(".xml"))
  .map((item) => `${mapperDirectory}/${item}`);

mybatisMapper.createMapper(mapperFiles);

module.exports = {
  setNamespace(namespace) {
    this.namespace = namespace;
  },
  getSql() { //sql 생성,반환
    let sqlId = "";
    let param = {};
    let format = {};

    console.log("getSql begin");

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
      language: "sql",
      indent: "  ",
    };

    console.log("getSql end");

    return mybatisMapper.getStatement(this.namespace, sqlId, param, format);
  },
};
