const express = require("express");
const app = express();
//const service = require("#service/MenuService.js");
const ConfService = require("../service/confService.js");
const service = new ConfService();

app.get("/api/conf/list", async (req, res) => {
  console.log("/api/conf/list");

  /*
  const query = await poolPromise;
  const result = await query
    .request()
    .query("SELECT * FROM information_schema.TABLES", (err, result) => {
      // 쿼리 실행 실패시

      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Error executing query");
        return;
      }

      // 쿼리 실행 성공시 결과 출력
      res.json(result.recordset);
    });
  */

  const a = await service.getConfList();

  res.json(a);
});

module.exports = app;
