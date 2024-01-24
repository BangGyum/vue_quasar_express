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
        trustServerCertificate: true
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
