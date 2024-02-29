const { databasePool } = require("#express/db-amifeed.js");
const mapper = require("./SqlMapper");
//const SqlMapper = require("#service/SqlMapper.js");
//const mapper = new SqlMapper();

class ConfService {
  constructor() {
    this.mapper = new SqlMapper();
    this.mapper.setNamespace("work");
  }

  async selectWorkList(params) {
    const { page, rowsPerPage } = params;
    let result = {};

    const workCount = (await this.mapper.select("selectCountAllWork")).CNT ?? 0;

    Object.assign(params, {
      firstRow: (page - 1) * rowsPerPage + 1,
      lastRow: page * rowsPerPage,
    });

    const workList = await this.mapper.selectList("selectWorkList", params);
    const lastPage = Math.ceil(Number(workCount) / rowsPerPage);

    result = {
      rows: workList,
      meta: {
        currentPage: params.page,
        lastPage: lastPage ?? 0,
        totalRow: workCount ?? 0,
      },
    };

    return result;
  }
  async saveWorkList(params) {
    let result = {};
    let rowStatus = "";
    console.log("saveWorks", params);

    const connection = await this.mapper.getConnection();
    const transaction = new sql.Transaction(connection);
    try {
      await transaction.begin();

      const request = new sql.Request(transaction);

      for (let item of params) {
        rowStatus = item.flag;
        if (rowStatus === "+") {
          // 행 추가
          await this.mapper.insert(request, "insertWork", item);
        } else if (rowStatus === "*") {
          // 행 수정
          await this.mapper.update(request, "updateWork", item);
        } else if (rowStatus === "-") {
          // 행 삭제
          await this.mapper.update(request, "deleteWork", item);
        }
      }

      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      throw e;
    } finally {
      //await connection.close();
    }

    return result;
  }

  async getWorkDateList() {
    const result = this.mapper.selectList("selectWorkDateList");
    return result;
  }

  async getWorkPlantList(params) {
    console.log("params", params);
    const result = this.mapper.selectList("selectWorkPlantList", params);
    return result;
  }

  async getWorkList(params) {
    const result = this.mapper.selectList("getWorkList", params);
    return result;
  }
}
module.exports = ConfService;
