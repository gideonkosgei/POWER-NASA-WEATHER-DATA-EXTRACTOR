// Create the connection with required details

const mysql = require('mysql');
module.exports = async (params) => new Promise(
  (resolve, reject) => {
    const connection = mysql.createConnection(params);    
    connection.connect(error => {
      if (error) {
        reject(error);       
      } else {        
        resolve("DB connected successfully!");
      }      
    })
  });