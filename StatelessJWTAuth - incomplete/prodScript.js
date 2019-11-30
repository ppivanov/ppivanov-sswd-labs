const headers = new Headers();
const init = {method: 'GET', headers: headers, mode: 'cors', cache:'default'};
async function getDataProd(){
    try {
        const response = await fetch('http://localhost:8080/product/', init);

        const json = await response.json();
        console.log(json);
        displayDataProd(json);
    } catch (err){
        console.log(err.message);
    }
}

function displayDataProd(data){
    const output = data.map(product => {
        return `<tr>
            <td>${product.ProductId}</td>
            
            <td>${product.ProductName}</td>
            <td>${product.ProductDescription}</td>
            <td>${product.ProductStock}</td>
            <td>${product.ProductPrice}</td>
        </tr>`;
    });

    document.getElementById('products').innerHTML = output.join('');
}

getDataProd();