const express = require('express');
const bodyParser = require('body-parser'); //request를 제대로 받기 위한 
const { Connection, Request, TYPES } = require('tedious'); //mssql 사용을 위해
const app = express();
const port = 3000;
const table = 'TB_CONFIG';

const config = require('./db_config').config; //db정보는 따로 빼놓음.

var connection = new Connection(config);  
connection.on('connect', function(err) {
  if (err) {
      console.log(err);
  } else {
      console.log("Connected");  
      let a = executeStatement();
      console.log(a);
  }
});

connection.connect();

app.use(express.json());

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

app.get('/api/', (req, res) => {
  res.send('Hello World!');
})
app.get('/api/confList', (req, res) => {
  res.send(confList);
})
app.post('/api/confObject', (req, res) => {
  
  res.send(confObject);
})

// app.get("/api/idx/:idx", (req, res) => {
//   res.send('user ' + req.params.idx)
// })
//테스트용
app.post("/api/idx/:idx", (req, res) => {
  console.log(req.body.param);
  res.send(req.body.param)
});
app.get('/api/test', (req, res) => {
  //ensureConnection();
  ///createTransaction(1,1,1,1,'34589345','uuidName','path','orginName','432543');
  res.send(executeStatement());
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

//테스트 확인
app.post("/api/saveConf/:idx", (req, res) => {
  let paramData = req.body.param;
  createTransaction(paramData.confId
                    ,paramData.confValue
                    ,paramData.confName
                    ,paramData.confDesc
                    ,paramData.craeteId);
  res.send(req.params.idx);
});

app.post("/api/getConfig/:idx", (req, res) => {
  let paramData = req.body.testParam;
  selectEach(paramData.confId
            ,paramData.confValue);
  res.send(req.params.idx);
});

function createTransaction(confId,confValue,confName,confDesc,craeteId) { //insert
  const sql = `INSERT INTO ${table} (CODE_ID
                                    ,CODE_VALUE
                                    ,CODE_NAME
                                    ,CODE_DESC
                                    ,CREATE_ID 
                                    ) VALUES (
                                    '${confId}'
                                    ,'${confValue}'
                                    ,'${confName}'
                                    ,'${confDesc}'
                                    ,'${craeteId}'
                                    )`;

  const request = new Request(sql, (err, rowCount) => {
    if (err) {
      console.log('Insert failed');
      throw err;
    }

    console.log('new Request cb');

    // Call connection.beginTransaction() method in this 'new Request' call back function
    beginTransaction();
  });

  connection.execSql(request);
}

function updateTransaction(confId,confValue,confName,confDesc,craeteId) { //insert
  console.log(confId);
  const sql = `UPDATE TB_CONFIG  
              SET 
                CODE_NAME = '${confName}'
                ,CODE_DESC = '${confDesc}'
                ,UPDATE_DT = GETDATE()
                ,UPDATE_ID = '${updateId}'
              WHERE 
                1=1
                AND CODE_ID = '${confId}'
                AND CODE_VALUE = '${confValue}'
  `

  const request = new Request(sql, (err, rowCount) => {
    if (err) {
      console.log('update failed');
      throw err;
    }

    console.log('new Request cb');

    // Call connection.beginTransaction() method in this 'new Request' call back function
    beginTransaction();
  });

  connection.execSql(request);
}

// 

function executeStatement() {
  var request = new Request("SELECT * FROM TB_CONFIG;", function(err) {  
  if (err) {  
      console.log(err); 
  }
  });  
  var result = [];  
  request.on('row', function(columns) {  
    console.log('///////////////////');
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
  
  console.log(result); 
  
  request.on('done', function(rowCount, more) {  
    console.log(rowCount + ' rows returned');  
  });  
  
  // Close the connection after the final event emitted by the request, after the callback passes
  request.on("requestCompleted", function (rowCount, more) {
      //connection.close();
  });
  connection.execSql(request);  
  
}

function selectEach(confId,confValue) {
  console.log(confId);
  const request = new Request(`select * from TB_CONFIG
                              WHERE 1=1
                              AND CODE_ID = '${confId}'
                              AND CODE_VALUE = '${confValue}'`, (err, rowCount) => {
    if (err) {
      throw err;
    }
    console.log('DONE!');
    connection.close();
  });
  let result = [];
  // Emits a 'DoneInProc' event when completed.
  request.on('row', (columns) => {
    columns.forEach((column) => {
      if (column.value === null) {
        console.log('NULL');
      } else {
        console.log(column.value);
        result+= column.value + " ";
      }
    });
  });

  request.on('done', (rowCount) => {
    console.log('Done is called!');
  });

  request.on('doneInProc', (rowCount, more) => {
    console.log(rowCount + ' rows returned');
  });

  // In SQL Server 2000 you may need: connection.execSqlBatch(request);
  connection.execSql(request);

  return result;
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

// SQL: Begin Transaction
//--------------------------------------------------------------------------------
function beginTransaction() {
  connection.beginTransaction((err) => {
    if (err) {
      // If error in begin transaction, roll back!
      rollbackTransaction(err);
    } else {
      console.log('beginTransaction() done');
      // If no error, commit transaction!
      commitTransaction();
    }
  });
}

// SQL: Commit Transaction (if no errors)
//--------------------------------------------------------------------------------
function commitTransaction() {
  connection.commitTransaction((err) => {
    if (err) {
      console.log('commit transaction err: ', err);
    }
    console.log('commitTransaction() done!');
    console.log('DONE!');
    connection.close();
  });
}

// SQL: Rolling Back Transaction - due to errors during transaction process.
//--------------------------------------------------------------------------------
function rollbackTransaction(err) {
  console.log('transaction err: ', err);
  connection.rollbackTransaction((err) => {
    if (err) {
      console.log('transaction rollback error: ', err);
    }
  });
  connection.close();
}

// function createTransaction(boNo,boNum,boDept,boSeq,FileRegistrationNum,fileUuidName,filePath,fileOrgnName,fileSize) { //insert
//     console.log(typeof FileRegistrationNum);
//     const sql = `INSERT INTO ${table} (BO_NO
//                                       ,BO_NUM
//                                       ,BO_DEPT
//                                       ,BO_SEQ
//                                       ,FILE_REGISTRATION_NUM
//                                       ,FILE_UUID_NAME
//                                       ,FILE_PATH
//                                       ,FILE_ORGN_NAME
//                                       ,FILE_SIZE
//                                       ,FILE_DEL_YN
//                                       ) VALUES (
//                                       ${boNo}
//                                       ,${boNum}
//                                       ,${boDept}
//                                       ,${boSeq}
//                                       ,'${FileRegistrationNum}'
//                                       ,'${fileUuidName}'
//                                       ,'${filePath}'
//                                       ,'${fileOrgnName}'
//                                       ,'${fileSize}'
//                                       ,'N'
//                                       )`;
  
//     const request = new Request(sql, (err, rowCount) => {
//       if (err) {
//         console.log('Insert failed');
//         throw err;
//       }
  
//       console.log('new Request cb');
  
//       // Call connection.beginTransaction() method in this 'new Request' call back function
//       beginTransaction();
//     });
  
//     connection.execSql(request);
//   }