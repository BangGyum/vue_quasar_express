var config = {  
    server: '192.168.37.3',  //update me
    authentication: {
        type: 'default',
        options: {
            userName: 'ainframework_sa', //update me
            password: 'ani@64306000'  //update me
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        //encrypt: true,
        database: 'AINFRAMEWORK',  //update me
        trustServerCertificate: true , //"true"인 경우 통신 계층이 SSL을 사용하여
                                // 암호화될 때 SQL Server SSL 인증서가 자동으로 신뢰됩니다.
        //trustServerCertificate: true // add this line

    }
};  
module.exports = { config }

// var Connection = require('tedious').Connection;  
// var config = {  
//     server: '192.168.37.3',  //update me
//     authentication: {
//         type: 'default',
//         options: {
//             userName: 'ainframework_sa', //update me
//             password: 'ani@64306000'  //update me
//         }
//     },
//     options: {
//         port: 1433,
//         // If you are on Microsoft Azure, you need encryption:
//         encrypt: true,
//         database: 'AINFRAMEWORK'  //update me

//     }
// };  
// var connection = new Connection(config);  
// connection.on('connect', function(err) {  
//     // If no error, then good to proceed.
//     console.log("Connected");  
// });

// // DB 모듈화
// module.exports = { connection };
