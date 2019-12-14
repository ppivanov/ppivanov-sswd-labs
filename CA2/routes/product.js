const router = require("express").Router();

//input validator (package)
let validator = require("validator");

//require the db connection

const {sql, dbConnPoolPromise} = require("../database/db.js");

// Define SQL statements here for use in function below
// These are parameterised queries note @named parameters.
// Input parameters are parsed and set before queries are executed
// for json path - Tell MS SQL to return results as JSON
const SQL_SELECT_ALL = 'SELECT * FROM dbo.Product for json path;';

// without_array_wrapper - use for single result
const SQL_SELECT_BY_ID = 'SELECT * FROM dbo.Product WHERE ProductId = @id for json path, without_array_wrapper;';

// Second statement (Select...) returns inserted record identified by ProductId = SCOPE_IDENTITY()
const SQL_INSERT = 'INSERT INTO dbo.Product (CategoryId, ProductName, ProductDescription, ProductStock, ProductPrice) VALUES (@categoryId, @productName, @productDescription, @ProductStock, @ProductPrice); SELECT * from dbo.Product WHERE ProductId = SCOPE_IDENTITY();';
const SQL_UPDATE = 'UPDATE dbo.Product SET CategoryId = @categoryId, ProductName = @productName, ProductDescription = @productDescription, ProductStock = @ProductStock, ProductPrice = @ProductPrice WHERE ProductId = @id; SELECT * FROM dbo.Product WHERE ProductId = @id;';
const SQL_DELETE = 'DELETE FROM dbo.Product WHERE ProductId = @id;';

//retrieving all products
//returns a JSON
//http://server:port/product
router.get("/", async (req, res) => {
	//get a db conn and execute SQL
	try{
		const pool = await dbConnPoolPromise
		const result = await pool.request()
			//execute query
			.query(SQL_SELECT_ALL);
		//send http response
		//json data from ms sql is contained in first element of the recordset
		res.json(result.recordset[0]);
	} catch(err){
		//catch error and send error code
		res.status(500);
		res.send(err.message);
	}
});

//getting a single product by idea
// id is passed as a parameter in the url
//returns JSON
//http://server:port/product/:id
router.get("/:id", async(req,res) => {
	//reading the id from the url received
	const productId = req.params.id;
	//validation of input - must not skip this part, because input could crash the server
	//or lead to a security breach
	//if validation fails return an error message
	if(!validator.isNumeric(productId, {no_symbols: true})){
		res.json({error: "Invalid id"});
		return false;
	}
	//if validation passes, execute query and return results
	//returns single product with matching id
	try{
		const pool = await dbConnPoolPromise
		const result = await pool.request()
			//set name parameter in query
			.input("id", sql.Int, productId)
			//execute query
			.query(SQL_SELECT_BY_ID);
		//send http response
		//json data from ms sql is contained in first element of the recordset
		res.json(result.recordset);
	} catch(err){
		//catch error and send error code
		res.status(500);
		res.send(err.message);
	}
});

//insert a new product using POST
router.post("/", async (req, res) => {
	//validation - this string will hold any errors that occur.
	let errors = "";
	//making sure category is a number
	const categoryId = req.body.categoryId;
	if(!validator.isNumeric(categoryId, {no_symbols: true})){
		errors += "Invalid category id\n";
	}
	//escape text and potential bad characters
	const productName = validator.escape(req.body.productName);
	if(productName === ""){
		errors += "Invalid product name\n";
	}
	const prodcutDesc = validator.escape(req.body.product.productDescription);
	if(prodcutDesc === ""){
		errors += "Invalid product description\n";
	}
	const inStock = req.body.productStock;
	if(!validator.isNumeric(inStock, {no_symbols: true})){
		errors += "Invalid product stock\n";
	}
	const productPrice = req.body.productPrice;
	if(!validator.isNumeric(inStock, {no_symbols: true})){
		errors += "Invalid product price\n";
	}
	//if there are any errors send the details in the response
	if(errors != ""){
		res.json({"errors": errors});
		return false;
	}
	//if no errors, then insert
	try{
		const pool = await dbConnPoolPromise
		const result = await pool.request()
			//set name parameter(s) in query
			.input("categoryId", sql.Int, categoryId)
			.input("productName", sql.NVarChar, productName)
			.input("productDescription", sql.NVarChar, productDesc)
			.input("productStock", sql.Int, inStock)
			.input("productPrice", sql.Decimal, productPrice)
			.query(SQL_INSERT);
		//if successful then return inserted product via http
		res.json(result.recordset[0]);
	} catch (err) {
		res.status(500);
		res.send(err.message)
	}
});

//update a product using POST
router.post("/:id", async (req, res) => {
	//reading the id from the request
	const productId = req.params.id;
	//validation - this string will hold any errors that occur.
	let errors = "";
	const productId = req.body.productId;
	if(!validator.isNumeric(productId, {no_symbols: true})){
		errors += "Invalid product id\n";
	}
	//making sure category is a number
	const categoryId = req.body.categoryId;
	if(!validator.isNumeric(categoryId, {no_symbols: true})){
		errors += "Invalid category id\n";
	}
	//escape text and potential bad characters
	const productName = validator.escape(req.body.productName);
	if(productName === ""){
		errors += "Invalid product name\n";
	}
	const prodcutDesc = validator.escape(req.body.product.productDescription);
	if(prodcutDesc === ""){
		errors += "Invalid product description\n";
	}
	const inStock = req.body.productStock;
	if(!validator.isNumeric(inStock, {no_symbols: true})){
		errors += "Invalid product stock\n";
	}
	const productPrice = req.body.productPrice;
	if(!validator.isNumeric(inStock, {no_symbols: true})){
		errors += "Invalid product price\n";
	}
	//if there are any errors send the details in the response
	if(errors != ""){
		res.json({"errors": errors});
		return false;
	}
	//if no errors, then insert
	try{
		const pool = await dbConnPoolPromise
		const result = await pool.request()
			//set name parameter(s) in query
			.input("productId", sql.Int, productId)
			.input("categoryId", sql.Int, categoryId)
			.input("productName", sql.NVarChar, productName)
			.input("productDescription", sql.NVarChar, productDesc)
			.input("productStock", sql.Int, inStock)
			.input("productPrice", sql.Decimal, productPrice)
			.query(SQL_UPDATE);
		//if successful then return inserted product via http
		res.json(result.recordset[0]);
	} catch (err) {
		res.status(500);
		res.send(err.message)
	}
});

//deleting a single product by id
//id is passed as a parameter in the url
//returns JSON
//http://server:port/product/delete/:id
router.delete("/delete/:id", async(req,res) => {
	//reading the id from the url received
	const productId = req.params.id;
	//validation of input - must not skip this part, because input could crash the server
	//or lead to a security breach
	//if validation fails return an error message
	if(!validator.isNumeric(productId, {no_symbols: true})){
		res.json({error: "Invalid id"});
		return false;
	}
	//if validation passes, execute query and return results
	//returns single product with matching id
	try{
		const pool = await dbConnPoolPromise
		const result = await pool.request()
			//set name parameter in query
			.input("id", sql.Int, productId)
			//execute query
			.query(SQL_SELECT_BY_ID);
		//send http response
		//json data from ms sql is contained in first element of the recordset
		res.json(result.recordset);
	} catch(err){
		//catch error and send error code
		res.status(500);
		res.send(err.message);
	}
});

module.exports = router;
