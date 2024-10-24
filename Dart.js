function saveTableData() {
    // Samle data fra tabellen
    let tableData = [];
    let rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        // Exclude the row containing the "Ny spiller" button
        if (row.id !== "buttonRow") {
            let rowData = [];
            let cells = row.querySelectorAll("th, td");
            cells.forEach(cell => {
                rowData.push(cell.textContent.trim());
            });
            tableData.push(rowData);
        }
    });

    // Lagrer data fra tabellen inn i localstorage
    localStorage.setItem("dartTableData", JSON.stringify(tableData)); // lagrer data som en JSON string
}

// Laster de lagrede dataene
window.onload = function () {
    loadTableData();
};

function loadTableData() {
    if (localStorage.getItem("dartTableData")) {
        let tableData = JSON.parse(localStorage.getItem("dartTableData"));
        let tbody = document.querySelector("tbody");

        // Clear existing rows except the button row
        tbody.innerHTML = `
            <tr id="buttonRow">
                <td colspan="3" style="text-align: center;">
                    <button id="addPlayer" class="fhi-btn-secondary">Ny spiller</button>
                </td>
            </tr>
        `;

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

        // Reattach the event listener for the "Ny spiller" button
        document.getElementById("addPlayer").addEventListener("click", function () {
            let rowCount = tbody.querySelectorAll("tr").length;
            let newRow = createRow(rowCount);
            tbody.insertBefore(newRow, document.getElementById("buttonRow"));
            saveTableData();
        });
    }
}

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
    saveTableData();
    alert("Dataene er lagret");
});

// Event listener for the "Ny Tavle" button to reset the table
document.getElementById("nyTavleButton").addEventListener("click", function () {
    // Clear the local storage
    localStorage.clear();

    // Reset the table to its initial state
    let tbody = document.querySelector("tbody");
    tbody.innerHTML = `
        <tr id="buttonRow">
            <td colspan="3" style="text-align: center;">
                <button id="addPlayer" class="fhi-btn-secondary">Ny spiller</button>
            </td>
        </tr>
    `;

    // Reattach the event listener for the "Ny spiller" button
    document.getElementById("addPlayer").addEventListener("click", function () {
        let rowCount = tbody.querySelectorAll("tr").length;
        let newRow = createRow(rowCount);
        tbody.insertBefore(newRow, document.getElementById("buttonRow"));
        saveTableData();
    });
});