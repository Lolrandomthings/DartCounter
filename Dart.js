function saveTableData() {
    // Samle data fra tabellen
    let tableData = [];
    let rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        // Exclude the row containing the "Ny spiller" button
        if (row.id !== "buttonRow" && row.id !== "totalRow") {
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
            <td colspan="4" style="text-align: center;">
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
            let rowCount = tbody.querySelectorAll("tr").length - 1; // Exclude buttonRow
            let newRow = createRow(rowCount);
            tbody.insertBefore(newRow, document.getElementById("buttonRow"));
            saveTableData();
        });

        // Update the total sum for each row
        updateTotalSum();
    }
}

function createRow(rowCount) {
    let newRow = document.createElement("tr");
    newRow.innerHTML = `
        <th contenteditable="">Rad ${rowCount}</th>
        <td contenteditable="">0</td>
        <td contenteditable="">0</td>
        <td class="row-total">0</td>
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
    
    // Clear all rows and add the initial row along with the "Ny spiller" button row
    tbody.innerHTML = `
        <tr>
            <th contenteditable="">legg til et navn</th>
            <td contenteditable="">0</td>
            <td contenteditable="">0</td>
            <td class="row-total">0</td>
        </tr>
        <tr id="buttonRow">
            <td colspan="4" style="text-align: center;">
                <button id="addPlayer" class="fhi-btn-secondary">Ny spiller</button>
            </td>
        </tr>
    `;

    // Reattach the event listener for the "Ny spiller" button
    document.getElementById("addPlayer").addEventListener("click", function () {
        let rowCount = tbody.querySelectorAll("tr").length - 1; // Exclude buttonRow
        let newRow = createRow(rowCount);
        tbody.insertBefore(newRow, document.getElementById("buttonRow"));
        saveTableData();
    });

    // Update the total sum for each row
    updateTotalSum();
});

function updateTotalSum() {
    let rows = document.querySelectorAll("tbody tr");

    // Iterate over all rows except the last one (buttonRow)
    rows.forEach(row => {
        if (row.id !== "buttonRow") {
            let cells = row.querySelectorAll("td");
            let throw1 = parseInt(cells[0].textContent.trim()) || 0;
            let throw2 = parseInt(cells[1].textContent.trim()) || 0;
            let rowTotal = throw1 + throw2;
            row.querySelector(".row-total").textContent = rowTotal;
        }
    });
}