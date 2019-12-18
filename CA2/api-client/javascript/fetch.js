// Setting the HTTP headers, that will be used when making requests to the API
const HTTP_REQ_HEADERS = new Headers({
    "Accept": "application/json",
    "Content-Type": "application/json"
});

// Requests will be using GET and cross-origin requests will not be blocked
const GET_INIT = { method: 'GET', credentials: 'include', headers: HTTP_REQ_HEADERS, mode: 'cors', cache: 'default' };
// Requests will use the GET method and permit cross origin requests
const DELETE_INIT = { method: 'DELETE', credentials: 'include', headers: HTTP_REQ_HEADERS, mode: 'cors' };

// API URL
const BASE_URL = `http://localhost:8000/`;


async function getDataAsync(url) {
    try {
        // Call fetch and await the respose
        const response = await fetch(url, GET_INIT);
    
        // response depends on fetch, so we must return a promise here too
        const json = await response.json();
    
        // Output result to console
        console.log(json);
        
        // return the json object
        return json;
    
    // catch and log any errors
    } catch (err) {
        console.log(err);
        return err;
    }
}

// Asynchronous Function to POST or PUT data to a url
async function postOrPutDataAsync(url, reqBody, reqMethod) {

    // create request object
    const request = {
        method: reqMethod,
        headers: HTTP_REQ_HEADERS,
        credentials: 'include', // important
        mode: 'cors',
        body: reqBody
        };

    // Try catch 
    try {
      // Call fetch and await the respose
      // Initally returns a promise
      const response = await fetch(url, request);
  
      // As Resonse is dependant on fetch, await must also be used here
      const json = await response.json();
  
      // Output result to console (for testing purposes) 
      console.log(json);
  
      // Call function( passing he json result) to display data in HTML page
      //displayData(json);
      return json;
  
      // catch and log any errors
    } catch (err) {
      console.log(err);
      return err;
    }
  
  }

  // Delete
  async function deleteDataAsync(url) {

    // Try catch 
    try {
        // Call fetch and await the respose
        // Initally returns a promise
        const response = await fetch(url, DELETE_INIT);
    
        // As Resonse is dependant on fetch, await must also be used here
        const json = await response.json();
    
        // Output result to console (for testing purposes) 
        console.log(json);
    
        // Call function( passing he json result) to display data in HTML page
        //displayData(json);
        return json;
    
        // catch and log any errors
      } catch (err) {
        console.log(err);
        return err;
      }
  }