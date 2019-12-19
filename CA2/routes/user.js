// Dependencies
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const validator = require('validator');

// config package used to manage configuration options
const config = require('config');

const keys = config.get('keys');

// require the database connection
const { sql, dbConnPoolPromise } = require('../database/db.js');

// Define SQL statements here for use in function below
// These are parameterised queries note @named parameters.
// Input parameters are parsed and set before queries are executed

// Query to retrieva all users
const SQL_SELECT_ALL = 'SELECT * FROM dbo.Netizen for json path;';

// Query to retrieve only 1 user if the ID matches a record in the db
const SQL_SELECT_BY_ID = 'SELECT * FROM dbo.Netizen WHERE user_id = @id for json path, without_array_wrapper;';


router.get('/all', passport.authenticate('jwt', { session: false}), async (req, res) => {

  // Get a DB connection and execute SQL
  try {
    const pool = await dbConnPoolPromise
    const result = await pool.request()
      // execute query
      .query(SQL_SELECT_ALL);

    res.json(result.recordset[0]);

    // Catch and send errors  
  } catch (err) {
    res.status(500)
    res.send("USER/ALL" + err.message)
  }
});

router.get('/:id', passport.authenticate('jwt', { session: false}), async (req, res) => {
  if(sessionStorage.userRole == 'admin'){
   
  // read value of id parameter from the request url
  const userId = req.params.id;

  if (!validator.isNumeric(userId, { no_symbols: true })) {
    res.json({ "error": "invalid id parameter" });
    return false;
  }

  try {
    // Get a DB connection and execute SQL
    const pool = await dbConnPoolPromise
    const result = await pool.request()
      // set name parameter(s) in query
      .input('id', sql.Int, userId)
      // execute query
      .query(SQL_SELECT_BY_ID);

    res.json(result.recordset)

  } catch (err) {
    res.status(500)
    res.send(err.message)
  }
}
});

module.exports = router;
