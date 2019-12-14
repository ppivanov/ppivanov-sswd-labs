// Setting the HTTP headers, that will be used when making requests to the API
const HTTP_REQ_HEADERS = new Headers({
    "Accept": "application/json",
    "Content-Type": "application/json"
});

// Requests will be using GET and cross-origin requests will not be blocked
const GET_INIT = { method: 'GET', credentials: 'include', headers: HTTP_REQ_HEADERS, mode: 'cors', cache: 'default' };


const BASE_URL = `http://localhost:8000/`;


async function getDataAsync(url) {
    try {
        // Call fetch and await the respose
        const response = await fetch(url, GET_INIT);
    
        // response depends on fetch, so we must return a promise here too
        const json = await response.json();
    
        // Output result to console
        // console.log(json);
        
        // return the json object
        return json;
    
    // catch and log any errors
    } catch (err) {
        console.log(err);
        return err;
    }
}

