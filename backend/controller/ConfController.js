const express = require("express");
const app = express();
//const service = require("#service/MenuService.js");
const ConfService = require("../service/confService.js");
const service = new ConfService();

app.get("/api/conf/list", async (req, res) => {
  console.log(req);
  const params = req.query;
  const result = await service.getConfList(params);

  res.json(result);
});

module.exports = app;
