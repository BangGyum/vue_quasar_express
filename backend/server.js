const express = require("express");
const session = require("express-session");
const logger = require("morgan");

const bodyParser = require("body-parser");

const MenuController = require("./controller/MenuController.js");
const WorkController = require("./controller/WorkController.js");
const PlantController = require("./controller/PlantController.js");
const NutritionController = require("./controller/NutritionController.js");
const FeedController = require("./controller/FeedController.js");
const PrintController = require("./controller/PrintController.js");

//로그인
const loginController = require("./controller/LoginController.js");

const app = express();
const port = 3000;

const prefixUrl = "/api";

app.use(logger("dev"));

// 세션 설정
app.use(
  session({
    secret: "amifeed!234@@",
    resave: false,
    saveUninitialized: true,
  })
);

// 로그인 체크

// 화면 전환 시 세션 체크

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(`${prefixUrl}`, MenuController);
app.use(`${prefixUrl}`, WorkController);
app.use(`${prefixUrl}`, PlantController);
app.use(`${prefixUrl}`, NutritionController);
app.use(`${prefixUrl}`, FeedController);
app.use(`${prefixUrl}`, PrintController);

//로그인
app.use(`${prefixUrl}`, loginController);
