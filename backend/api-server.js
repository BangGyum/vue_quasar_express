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

app.post('/api/codeObject', (req, res) => {
  
  res.send(codeObject);
})

app.post('/api/codeList', (req, res) => {
  
  res.send(codeList);
})

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

app.post("/api/updateCode", async (req, res) => {
  console.log(req.body.param);
  let paramData = req.body.param;
  const sql = `UPDATE TB_CONFIG  
              SET 
                CODE_NAME = '${paramData.codeName}'
                ,CODE_DESC = '${paramData.codeDesc}'
                ,UPDATE_DT = GETDATE()
                ,UPDATE_ID = '${paramData.updateId}'
              WHERE 
                1=1
                AND CODE_ID = '${paramData.codeId}'
                AND CODE_VALUE = '${paramData.codeValue}'
  `
  try {
    configUpdate(sql);
    res.send('성공');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.post("/api/deleteCode", async (req, res) => {
  console.log(req.body.param);
  let paramData = req.body.param;
  const sql = `UPDATE TB_CONFIG  
              SET 
                DEL_YN='Y'
              WHERE 
                1=1
                AND CODE_ID = '${paramData.codeId}'
                AND CODE_VALUE = '${paramData.codeValue}'
  `
  try {
    configUpdate(sql);
    res.send('성공');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

function configUpdate(sql) { //insert
  console.log(sql);
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

app.get('/api/getConfigCount', async (req, res) => {
  console.log('getCount진입');
  console.log(req.body.params);
  try {
    const result = await executeSelectQuery("SELECT COUNT(1) AS COUNT FROM TB_CONFIG;");
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/api/test', async (req, res) => {
  try {
    const result = await executeSelectQuery("SELECT * FROM TB_CONFIG;");
    //console.log(result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/api/data', async (req, res) => {
  console.log('------------------------------------------------------------진입');
  console.log(req.body.params);
  const { page, startRow, rowsPerPage, sortOrder } = req.body.params;
  const offset = (page - 1) * rowsPerPage;
  console.log('offset : '+offset);
  //const order = `${sortField} ${sortOrder.toUpperCase()}`;
  //const filter = `${filterField} LIKE '%${filterValue}%'`;
  
  //      WHERE ${filter} 
  try {
    const result = await executeSelectQuery(
      `SELECT 
      * FROM TB_CONFIG

      ORDER BY ${sortOrder} 
      OFFSET ${startRow} rows
      FETCH NEXT ${rowsPerPage} rows only`);
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

function executeSelectQuery(sql) {
  console.log(sql);
  return new Promise((resolve, reject) => {
    var request = new Request(sql, function(err) {  
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
    //connection.close();
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
    //connection.close();
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
  //connection.close();
}
