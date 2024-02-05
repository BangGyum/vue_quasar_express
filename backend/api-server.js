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
      // let a = executeStatement();
      // console.log(a);
  }
});

connection.connect();

app.use(express.json());

const codeList = [{name : "공통코드1", id : "1"}
                 ,{name : "공통코드2", id : "2"}];
codeList.push({name : "공통코드3", id : 3})

const codeObject = [
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
// app.get('/api/confList', (req, res) => {
//   res.send(confList);
// })
app.post('/api/codeObject', (req, res) => {
  
  res.send(codeObject);
})

app.post('/api/codeList', (req, res) => {
  
  res.send(codeList);
})

//테스트용
app.post("/api/idx/:idx", (req, res) => {
  console.log(req.body.param);
  res.send(req.body.param)
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

//테스트 확인
app.post("/api/saveCode/:idx", (req, res) => {
  let paramData = req.body.param;
  createTransaction(paramData.codeId
                    ,paramData.codeValue
                    ,paramData.codeName
                    ,paramData.codeDesc
                    ,paramData.craeteId);
  res.send(req.params.idx);
});

app.post("/api/getConfig/:idx", (req, res) => {
  let paramData = req.body.testParam;
  selectEach(paramData.codeId
            ,paramData.codeValue);
  res.send(req.params.idx);
});

function createTransaction(codeId,codeValue,codeName,codeDesc,craeteId) { //insert
  const sql = `INSERT INTO ${table} (CODE_ID
                                    ,CODE_VALUE
                                    ,CODE_NAME
                                    ,CODE_DESC
                                    ,CREATE_ID 
                                    ) VALUES (
                                    '${codeId}'
                                    ,'${codeValue}'
                                    ,'${codeName}'
                                    ,'${codeDesc}'
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

function updateTransaction(codeId,codeValue,codeName,codeDesc,craeteId) { //insert
  console.log(codeId);
  const sql = `UPDATE TB_CONFIG  
              SET 
                CODE_NAME = '${codeName}'
                ,CODE_DESC = '${codeDesc}'
                ,UPDATE_DT = GETDATE()
                ,UPDATE_ID = '${updateId}'
              WHERE 
                1=1
                AND CODE_ID = '${codeId}'
                AND CODE_VALUE = '${codeValue}'
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

app.get('/api/test', async (req, res) => {
  try {
    const result = await executeSelectQuery();
    //console.log(result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

function executeSelectQuery() {
  return new Promise((resolve, reject) => {
    var request = new Request("SELECT * FROM TB_CONFIG;", function(err) {  
      if (err) {  
        reject(err); 
      }
    });  

    var result = []; 
    let colData = {}; 

    request.on('row', function(columns) {  
      columns.forEach(function(column) { 
        let colName = column.metadata.colName;
        let colValue = column.value;
        colData[colName] = colValue !== null ? colValue : 'NULL';
      });  

      result.push(colData);
      colData = {}; 
    });  

    request.on('requestCompleted', function() {
      resolve(result); 
    });

    connection.execSql(request); //sql 보내기
  });
}
//수정 예정
function selectEach(codeId,codeValue) {
  console.log(codeId);
  const request = new Request(`select * from TB_CONFIG
                              WHERE 1=1
                              AND CODE_ID = '${codeId}'
                              AND CODE_VALUE = '${codeValue}'`, (err, rowCount) => {
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