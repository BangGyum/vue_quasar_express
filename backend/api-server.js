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
                DEL_YN = 'Y'
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


app.post("/api/delYnChange", async (req, res) => {
  console.log(req.body.param);
  let paramData = req.body.param;

  const sql = `UPDATE TB_CONFIG  
              SET 
                DEL_YN = '${paramData.delYn}'
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
  const { page, startRow, rowsPerPage, sortBy, descendingFinal
      , filterName, filterValue} = req.body.params;
  const offset = (page - 1) * rowsPerPage;
  console.log('filterName : '+filterName);
  console.log('filterValue : '+filterValue);
  let filterQuery = '';
  if (filterName && filterValue) {
  filterQuery = `AND ${filterName} LIKE '%${filterValue}%'`;
  }
  try {
    //AND DEL_YN='N'
    const result = await executeSelectQuery(
      `SELECT ROW_NUMBER() OVER (ORDER BY ${sortBy} ${descendingFinal}) AS RowNum
        , *
      FROM TB_CONFIG
      WHERE
        1=1
        
        ${filterQuery}
      ORDER BY ${sortBy} ${descendingFinal}
      OFFSET ${startRow} rows
      FETCH NEXT ${rowsPerPage} rows only`);
    //console.log(result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
//위와같이 페이징 처리하는데 index+1 (번호부여) 해서 번호매기는건 조건생각했을때 따로 쿼리를 불러야하나?

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
        //console.log(column.value);
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

  //const exceljs = require('exceljs');
// const path = require('path');
// const fs = require('fs').promises;
// const libre = require('libreoffice-convert');
// libre.convertAsync = require('util').promisify(libre.convert);

//const pdfMake = require('pdfmake/build/pdfmake.js');
//const puppeteerVar = require('puppeteer')
// var xlsx2 = require("xlsx")
// var fs2 = require('fs')
// app.get('/pdf', async (req, res) => {
//   const ext = 'pdf'; // Output extension.
// 	const inputPath = path.join(__dirname, '/shipment.xlsx');
// 	const outputPath = path.join(__dirname, `/example.${ext}`);

// 	// Read the input file.
// 	const xlsxBuf = await fs.readFile(inputPath);

//   //여기에서는 Excel 문서의 내용(in )을 PDF 형식으로 변환하는 방법을 사용했습니다.
//   // 세 번째 인수는 왼쪽입니다. 
//   //LibreOffice은(는) 입력 및 출력 형식에 따라 적합한 필터를 자동으로 선택합니다.
//   //libre.convertAsyncxlsxBuffilterundefined
//   let pdfBuf = await libre.convertAsync(xlsxBuf, ext, undefined);

//   // Save the converted PDF.
// 	await fs.writeFile(outputPath, pdfBuf);
// });
// app.get('/pdf2', async (req, res) => {
//   ('Test Case : Convert Excel To PDF', async function(){
//       const browser = await puppeteerVar.launch({headless:true, slowMo:500})
//       const page = await browser.newPage();
//       var dataPathExcelToRead = "Sample.xlsx"
//       var wb = xlsx.readFile(dataPathExcelToRead)
//       var sheetName = wb.SheetNames[0]
//       var sheetValue = wb.Sheets[sheetName]
//       var htmlData = xlsx.utils.sheet_to_html(sheetValue)
//       fs.writeFile('excelToHtml.html',htmlData,function(err){
//           console.log("Data is successfully converted")
//       })
//       await page.waitForTimeout(3000)
//       await page.goto('C:/Users/Azhar/Desktop/Puppeteer%20Project/excelToHtml.html',{"waitUntil":"networkidle2"}).catch(function(){
//           console.log("Error while loading the file")
//       })
//       await page.waitForTimeout(3000)
//       await page.pdf({path:'./ExcelToPDF.pdf',format:'A4',printBackground:true});
//       await browser.close()
//   });
// });

// app.get('/pdf3', (req, res) => {//버튼 id pdfmake 발생시 행동할 이벤트
        
//     /* documentDefinition : pdf파일에 들어갈 내용 및 여러가지를 정의 */
//     var documentDefinition = {
        
//         //content : pdf의 내용을 정의 
//         content: [
//             {
//                 text: 'First paragraph'
//             }, // 스타일 적용 없이 그냥 출력
//             {
//                 text: 'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines',
//                 bold: true
//             }, // 텍스트에 bold 주기
//             {
//                 text: '가나다라마바사아자타카타파하',
//                 style: 'style_test'
//             }, // style 부분에 정의된 style_test 적용해보기 및 한글 꺠짐 테스트 
//             {
//                 style: 'tableExample',
//                 table: {
//                     widths: [100, '*', 200, '*'],
//                     body: [
//                         ['width=100', 'star-sized', 'width=200', 'star-sized'],
//                         ['fixed-width cells have exactly the specified width', {
//                             text: 'nothing interesting here',
//                             italics: true,
//                             color: 'gray'
//                         }, {
//                             text: 'nothing interesting here',
//                             italics: true,
//                             color: 'gray'
//                         }, {
//                             text: 'nothing interesting here',
//                             italics: true,
//                             color: 'gray'
//                         }]
//                     ]
//                 }
//             }//테이블 그리기 
//         ],
//         //하단의 현재페이지 / 페이지 수 넣기 
//         footer: function (currentPage, pageCount) {
//             return {
//                 margin: 10,
//                 columns: [{
//                     fontSize: 9,
//                     text: [{
//                             text: '--------------------------------------------------------------------------' +
//                                 '\n',
//                             margin: [0, 20]
//                         },
//                         {
//                             text: '' + currentPage.toString() + ' of ' +
//                                 pageCount,
//                         }
//                     ],
//                     alignment: 'center'
//                 }]
//             };

//         },
//         //필요한 스타일 정의하기 
//         styles: {
//             style_test: {
//                 fontSize: 18,
//                 bold: true,
//                 margin: [0, 0, 0, 0],
//                 alignment: 'center'
//             },
//             tableExample: {
//                 margin: [0, 5, 0, 15]
//             }
//         },

//         // 페이지 크기 용지의 크기 사이즈 넣기 또는 특정 사이즈 넣기 { width: number, height: number }
//         pageSize: 'A4',

//         /* 페이지 방향 portrait : 가로 , landscape : 세로 */
//         pageOrientation: 'portrait',
//     };

//     var pdf_name = 'pdf파일 만들기.pdf'; // pdf 만들 파일의 이름 
//     pdfMake.createPdf(documentDefinition).download(pdf_name);
//   });
