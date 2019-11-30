let sql = require('mssql');

const config = require('config');

let dbConnPoolPromise = new sql.ConnectionPool(config.get('connection'))
    .connect()
    .then(pool => {
        console.log('Connected to mssql')
        return pool
    })
    .catch(err => console.log('DB connection failed :', err))

    module.exports = {
        sql, dbConnPoolPromise
    };