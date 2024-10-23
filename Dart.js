document.getElementById("lagreButton").addEventListener("click", function () {
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
    localStorage.setItem("dartTableData", JSON.stringify(tableData));// lagrer data som en JSON string
    alert("Dataene er lagret");
});

// Laster de lagrede dataene
window.onload = function () {
    if (localStorage.getItem("dartTableData")) {
        let tableData = JSON.parse(localStorage.getItem("dartTableData"));
        let rows = document.querySelectorAll("tbody tr");

        tableData.forEach((rowData, index) => {
            let cells = rows[index].querySelectorAll("th, td");
            rowData.forEach((cellData, cellIndex) => {
                cells[cellIndex].textContent = cellData;
            });
        });
    }
};

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

    // Legg til den nye raden til tabellteksten
    tbody.appendChild(newRow);
});




