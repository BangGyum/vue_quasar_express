//const { connPool } = require('./server.js');
//import { express } from 'express';
const express = require('express')
//import { bodyParser } from 'body-parser';
const bodyParser = require('body-parser') //request를 제대로 받기 위한 
const { Connection, Request, TYPES } = require('tedious') //mssql 사용을 위해
const app = express()
const port = 3000

///////////////

const config = require('./db_config').config;

var connection = new Connection(config);  
connection.on('connect', function(err) {
  if (err) {
      console.log(err);
  } else {
      console.log("Connected");  
      executeStatement();
  }
});

connection.connect();

// mssql DB가 연동된 라우터 모듈을 객체화
//const { connection } = require('./db_connector');
//var Request = require('tedious').Request;  
//var TYPES = require('tedious').TYPES;  


const confList = ["메뉴1","메뉴2","메뉴3"];

const confObject = [
  {
  name : "메뉴",
  code : "menu",
  },
  {
  name : "권한",
  code : "auth",
  },
]

app.use(bodyParser.json());

app.get('/api/', (req, res) => {
  res.send('Hello World!')
})
app.get('/api/confList', (req, res) => {
  res.send(confList)
})
app.post('/api/confObject', (req, res) => {
  
  res.send(confObject)
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get('/api/test', (req, res) => {
  //ensureConnection();
  res.send(executeStatement());
});


function executeStatement() {  
  var request = new Request("SELECT * FROM TB_FILES;", function(err) {  
  if (err) {  
      console.log(err);}  
  });  
  var result = [];  
  request.on('row', function(columns) {  
      columns.forEach(function(column) { 
        //console.log(column) ;
        if (column.value === null) {  
          console.log('NULL');  
        } else {  
          console.log(column.value);
          result+= column.value + " ";  
        }  
      });  
      console.log('여기 들어왔다');
      console.log(result);  
      //result ="";  
      return result;
  });  

  request.on('done', function(rowCount, more) {  
  console.log(rowCount + ' rows returned');  
  });  
  
  // Close the connection after the final event emitted by the request, after the callback passes
  request.on("requestCompleted", function (rowCount, more) {
      //connection.close();
  });
  connection.execSql(request);  
  
}  

function ensureConnection() {
  if (!connection || connection.state === 'Final') {
      connection = new Connection(config);  
      connection.on('connect', function(err) {  
          // If no error, then good to proceed.
          console.log("Connected");  
      });
  }
}