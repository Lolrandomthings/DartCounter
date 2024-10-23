// Define the saveTableData function
function saveTableData() {
    // Samle data fra tabellen
    let tableData = [];
    let rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        if (row.id !== "buttonRow") {

            let rowData = [];
            let cells = row.querySelectorAll("th, td");  // Velger både th og td
            cells.forEach(cell => {
                rowData.push(cell.textContent.trim());  // Få innholdet i hver celle
            });
            tableData.push(rowData);
        }

    });

    // Lagrer data fra tabellen inn i localstorage
    localStorage.setItem("dartTableData", JSON.stringify(tableData)); // lagrer data som en JSON string
}

// Laster de lagrede dataene
window.onload = function () {
    if (localStorage.getItem("dartTableData")) {
        let tableData = JSON.parse(localStorage.getItem("dartTableData"));
        let tbody = document.querySelector("tbody");

        tableData.forEach((rowData, index) => {
            let newRow = createRow(index + 1);
            tbody.insertBefore(newRow, document.getElementById("buttonRow"));

            let cells = newRow.querySelectorAll("th, td");
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
    alert("Dataene er lagret")
});


// Function to create a new row
function createRow(rowCount) {
    let newRow = document.createElement("tr");
    newRow.innerHTML = `
        <th contenteditable="">Rad ${rowCount}</th>
        <td contenteditable="">Celle 1</td>
        <td contenteditable="">Celle 2</td>
    `;
    return newRow;
} 

// Event listener for "Lagre"-knappen that calls the saveTableData function
document.getElementById("lagreButton").addEventListener("click", function () {
    saveTableData(true);
    alert("Dataene er lagret");
});

// Event listener for the "Ny spiller" button
document.getElementById("addPlayer").addEventListener("click", function () {
    let tbody = document.querySelector("tbody");
    let rowCount = tbody.querySelectorAll("tr").length; // Get current row count

    // Create a new row
    let newRow = createRow(rowCount);

    // Insert the new row before the button row
    tbody.insertBefore(newRow, document.getElementById("buttonRow"));

    // Save the table data
    saveTableData();
});




