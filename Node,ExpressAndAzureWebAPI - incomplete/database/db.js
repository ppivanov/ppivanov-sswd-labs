// connect to MS SQL db and make a connection pool available
let sql = require("mssql");

//config package used to manage configuration options?
const config = require("config");

//set up db connection
// config is used to read values from the conn section of /config/default.json
let dbConnPoolPromise = new sql.ConnectionPool(config.get("connection"))
	.connect()
	.then(pool => {
		console.log("Connected to MSSQL")
		return pool
	})
	.catch(err => console.log("Database connection failed - error: ", err))

//exporting the sql and conn pool objects
module.exports = {
	sql, dbConnPoolPromise
};
