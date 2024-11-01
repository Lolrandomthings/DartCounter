// Function to save only unsaved table data
function saveTableData() {
    let rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        // Check if the row has been saved before
        if (!row.hasAttribute("data-saved")) {
            const playerName = row.querySelector("th").textContent.trim();
            const kast1 = parseInt(row.querySelector("td:nth-child(2)").textContent.trim()) || 0;
            const kast2 = parseInt(row.querySelector("td:nth-child(3)").textContent.trim()) || 0;

            const data = {
                navn: playerName,
                kast1: kast1,
                kast2: kast2
            };

            // Send data to the endpoint
            fetch('/api/dartboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                console.log(result); // Confirm entry was added

                // Mark this row as saved
                row.setAttribute("data-saved", "true");
            })
            .catch(error => console.error('Error:', error));
        }
    });

    console.log("Data er lagret");
}

// "Ny Runde" button click handler
document.getElementById("nyTavleButton").addEventListener("click", function () {
    fetch('/api/create_new_round', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("New round table created:", data.table_name);

        // Clear the current board in the frontend
        let tbody = document.querySelector("tbody");
        tbody.innerHTML = `
            <tr>
                <th contenteditable="">legg til et navn</th>
                <td contenteditable="">0</td>
                <td contenteditable="">0</td>
                <td class="row-total">0</td>
            </tr>
        `;
        updateTotalSum();
    })
    .catch(error => console.error('Error creating new round:', error));
});


// "Ny Runde" button click handler (no need to track the table in JavaScript)
document.getElementById("nyTavleButton").addEventListener("click", function () {
    fetch('/api/create_new_round', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("New round table created:", data.table_name);

        // Clear the current board in the frontend
        let tbody = document.querySelector("tbody");
        tbody.innerHTML = `
            <tr>
                <th contenteditable="">legg til et navn</th>
                <td contenteditable="">0</td>
                <td contenteditable="">0</td>
                <td class="row-total">0</td>
            </tr>
        `;
        updateTotalSum();
    })
    .catch(error => console.error('Error creating new round:', error));
});


// Single Event Listener Setup
window.onload = function () {
    loadTableData();
    updateTotalSum();
    displayCurrentDate();

    const saveButton = document.getElementById("lagreButton");
    const addPlayerButton = document.getElementById("addPlayer");

    // Attach event listener for "lagreButton" only once
    if (saveButton) {
        saveButton.addEventListener("click", function () {
            saveTableData();
            updateTotalSum();
            alert("Dataene er lagret");
        });
    } else {
        console.error("lagreButton not found on the page.");
    }

    // Attach event listener for "addPlayer" only once
    if (addPlayerButton) {
        addPlayerButton.addEventListener("click", function () {
            let tbody = document.querySelector("tbody");
            let newRow = createRow();
            tbody.appendChild(newRow);
            saveTableData();
        });
    } else {
        console.error("Add Player button (addPlayer) not found on the page.");
    }
};

function displayCurrentDate() {
    const dateContainer = document.getElementById("currentDate");
    const today = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-GB', options);

    dateContainer.textContent = ` ${formattedDate}`;
}

function loadTableData() {
    if (localStorage.getItem("dartTableData")) {
        let tableData = JSON.parse(localStorage.getItem("dartTableData"));
        let tbody = document.querySelector("tbody");

        tbody.innerHTML = '';

        tableData.forEach(rowData => {
            let newRow = createRow();
            tbody.appendChild(newRow);

            let cells = newRow.querySelectorAll("th, td");
            rowData.forEach((cellData, cellIndex) => {
                if (cells[cellIndex]) {
                    cells[cellIndex].textContent = cellData;
                }
            });
        });

        updateTotalSum();
    }
}

function createRow() {
    let newRow = document.createElement("tr");
    newRow.innerHTML = `
        <th contenteditable="">Legg til et navn</th>
        <td contenteditable="">0</td>
        <td contenteditable="">0</td>
        <td class="row-total">0</td>
    `;
    return newRow;
}

function updateTotalSum() {
    let rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        let cells = row.querySelectorAll("td");
        let throw1 = parseInt(cells[0].textContent.trim()) || 0;
        let throw2 = parseInt(cells[1].textContent.trim()) || 0;
        let rowTotal = throw1 + throw2;

        row.querySelector(".row-total").textContent = rowTotal;
    });
}


/*function downloadCSV() {
    let table = document.querySelector(".table");
    let rows = table.querySelectorAll("tr");
    let csvContent = "";

    rows.forEach(row => {
        let cols = row.querySelectorAll("th, td");
        let rowData = [];
        cols.forEach(col => {
            rowData.push('"' + col.innerText + '"');
        });
        csvContent += rowData.join(",") + "\n";
    });

    let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "dart_table.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById("uploadCSV").addEventListener("change", function(event) {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            let csvContent = e.target.result;
            parseCSV(csvContent);
        };
        reader.readAsText(file);
    }
});

function parseCSV(csvContent) {
    let rows = csvContent.split("\n");
    let tableBody = document.querySelector("tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    rows.slice(1).forEach((row, index) => { // Skip the first row
        if (row.trim() !== "") {
            let cols = row.split(",");
            let newRow = document.createElement("tr");
            newRow.innerHTML = `
                <th contenteditable="">${cols[0].replace(/"/g, '')}</th>
                <td contenteditable="">${cols[1].replace(/"/g, '')}</td>
                <td contenteditable="">${cols[2].replace(/"/g, '')}</td>
                <td class="row-total">${cols[3].replace(/"/g, '')}</td>
            `;
            tableBody.appendChild(newRow);
        }
    });

    updateTotalSum();
}

function parseXLSX(arrayBuffer) {
    let data = new Uint8Array(arrayBuffer);
    let workbook = XLSX.read(data, { type: "array" });
    let firstSheetName = workbook.SheetNames[0];
    let worksheet = workbook.Sheets[firstSheetName];
    let json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let tableBody = document.querySelector("tbody");
    tableBody.innerHTML = "";

    json.slice(1).forEach((row, index) => { // Skip the first row
        if (row.length > 0) {
            let newRow = document.createElement("tr");
            newRow.innerHTML = `
                <th contenteditable="">${row[0] || ''}</th>
                <td contenteditable="">${row[1] || 0}</th>
                <td contenteditable="">${row[2] || 0}</th>
                <td class="row-total">${row[3] || 0}</th>
            `;
            tableBody.appendChild(newRow);
        }
    });

    updateTotalSum();
}

function downloadXLSX() {
    let table = document.querySelector(".table");
    let rows = table.querySelectorAll("tr");
    let data = [];

    rows.forEach(row => {
        let cols = row.querySelectorAll("th, td");
        let rowData = [];
        cols.forEach(col => {
            rowData.push(col.innerText);
        });
        data.push(rowData);
    });

    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet(data);

    XLSX.utils.book_append_sheet(wb, ws, "Dart Table");

    XLSX.writeFile(wb, "dart_table.xlsx");
}*/

document.getElementById("downloadCSVButton").addEventListener("click", downloadXLSX);