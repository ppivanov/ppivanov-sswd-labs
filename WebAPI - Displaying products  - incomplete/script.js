//JS fetch

//setting HTTP headers.
const headers = new Headers();

//request will use the get method and permit cross origin requests
const init = {method: "GET", headers: headers, mode: "cors", cache: "default"};

//product API URL
const url = `http://localhost:8080/product`;

//asynchronous function
async function getDataAsync(){
	try{
		//call fetch and wait for response
		//initially returns a 'promise'
		const response = await fetch(url, init);

		//because response is dependent on fetch, we must also use await here
		const json = await response.json();

		console.log(json);

		//displayData(json);
	} catch(err){
		console.log(err);
	}
}

//parsing a JSON
//generating table row from each product & display in the page
function displayData(products){
	const rows = products.map(product => {
		return `<tr>
							<td>${product.ProductId}</td>
							<td>${product.CategoryId}</td>
							<td>${product.ProductName}</td>
							<td>${product.ProductDescription}</td>
							<td>${product.ProductStock}</td>
							<td>${product.ProductPrice}</td>
						</tr>`;
	});

	document.getElementById("productRows").innerHTML = rows.join("");

	getDataAsync();
}
