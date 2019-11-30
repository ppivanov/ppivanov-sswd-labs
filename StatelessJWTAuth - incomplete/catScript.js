async function getDataCat(){
    try {
        const response = await fetch('http://localhost:8080/category');

        const json = await response.json();
        console.log(json);
        displayDataCat(json);
    } catch (err){
        console.log(err.message);
    }
}

function displayDataCat(data){
    const output = data.map(cat => {
        return `<tr><a href="http://localhost:8080/category/${cat.CategoryId}">${cat.CategoryName}</a></tr>`;
    });

    document.getElementById('categories').innerHTML = output.join('');
}

getDataCat();