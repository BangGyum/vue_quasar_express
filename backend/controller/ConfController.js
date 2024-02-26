const express = require("express");
const app = express();
//const service = require("#service/MenuService.js");
const ConfService = require("../service/confService.js");
const service = new ConfService();

app.get("/api/conf/list", async (req, res) => {
  console.log("/api/conf/list");

  const a = await service.getConfList();

  res.json(a);
});

module.exports = app;
