// Define the saveTableData function
function saveTableData() {
    // Samle data fra tabellen
    let tableData = [];
    let rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        let rowData = [];
        let cells = row.querySelectorAll("th, td");  // Velger både th og td
        cells.forEach(cell => {
            rowData.push(cell.textContent.trim());  // Få innholdet i hver celle
        });
        tableData.push(rowData);
    });

    // Lagrer data fra tabellen inn i localstorage
    localStorage.setItem("dartTableData", JSON.stringify(tableData)); // lagrer data som en JSON string
}

// Laster de lagrede dataene
window.onload = function () {
    if (localStorage.getItem("dartTableData")) {
        let tableData = JSON.parse(localStorage.getItem("dartTableData"));
        let tbody = document.querySelector("tbody");
        let rows = document.querySelectorAll("tbody tr");

        // If there are fewer rows in the table than the data, create new rows
        while (rows.length < tableData.length) {
            let newRow = document.createElement("tr");
            newRow.innerHTML = `
                <th contenteditable="">Rad ${rows.length + 1}</th>
                <td contenteditable="">Celle 1</td>
                <td contenteditable="">Celle 2</td>
            `;
            tbody.appendChild(newRow);
            rows = document.querySelectorAll("tbody tr"); // Update the rows NodeList
        }

        // Update the existing rows with the loaded data
        tableData.forEach((rowData, index) => {
            let cells = rows[index].querySelectorAll("th, td");
            rowData.forEach((cellData, cellIndex) => {
                if (cells[cellIndex]) {
                    cells[cellIndex].textContent = cellData;
                }
            });
        });
    }
};

//Eventlistener for "Lagre"-knappen som kaller opp saveTableData-funksjonen med varsel
document.getElementById("lagreButton").addEventListener("click", function () {
    saveTableData(true);
    alert("Dataene er lagret ")
});



// Funksjon for å legge til en ny rad (spiller) på tabellen
document.getElementById("addPlayer").addEventListener("click", function () {
    let tbody = document.querySelector("tbody");
    let rowCount = tbody.querySelectorAll("tr").length + 1;  // øker antall spiller

    // lager en ny row (tr)
    let newRow = document.createElement("tr");
    newRow.innerHTML = `
        <th contenteditable="">Rad ${rowCount}</th>
        <td contenteditable="">Celle 1</td>
        <td contenteditable="">Celle 2</td>
    `;
     // AddEventListener for slette-knapp
    newRow.getElementById(".deleteRow"). addEventListener("click",function (){
        newRow.remove(); // Sletter raden
        saveTableData(false);
    });

    return newRow;

    // Legg til den nye raden til tabellteksten
    tbody.appendChild(newRow);
    saveTableData();
});




