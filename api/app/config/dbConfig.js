// Get the DB Connection Params from Environment Variables 

/*
const host = process.env.DB_HOST_AWS;
const user = process.env.DB_USER_AWS;
const password = process.env.DB_PASS_AWS;
const database = process.env.DB_DATABASE_AWS;
module.exports = {user, password, host, database};*/

//module.exports = {user, password, host, database,port}; // this is for local db connections
//module.exports = {user, password, host, database,port};


const host = 'localhost';
const user = process.env.DB_USER;
const password = process.env.DB_PASS;
const database = "weather_data";
const port = process.env.DB_PORT;
module.exports = {user, password, host, database, port}; 
