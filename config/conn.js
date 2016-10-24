var mysql = require('mysql');
var config = require('../config/config');

var pool  = mysql.createPool({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    port: config.database.port,
    database: config.database.database,
    acquireTimeout: 10000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;