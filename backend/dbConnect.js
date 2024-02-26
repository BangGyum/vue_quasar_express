const { Connection, TYPES } = require('tedious'); //mssql 사용을 위해
const app = express();

const config = require('./db_config').config; //db정보는 따로 빼놓음.


const databasePool = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to MSSQL");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));


module.exports = {
    databasePool
    ,sql
}
