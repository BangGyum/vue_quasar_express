const { Connection, TYPES } = require('tedious'); //mssql 사용을 위해
const app = express();

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

module.exports = {
    connection
    ,sql
}
