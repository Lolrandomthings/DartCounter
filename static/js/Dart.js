// Function to save table data
function saveTableData() {
    let rows = document.querySelectorAll("tbody tr");
    
    rows.forEach(row => {
        if (row.id !== "totalRow") {
            const playerName = row.querySelector("th").textContent.trim();
            const kast1 = parseInt(row.querySelector("td:nth-child(2)").textContent.trim()) || 0;
            const kast2 = parseInt(row.querySelector("td:nth-child(3)").textContent.trim()) || 0;

            // Prepare data to send to the server
            const data = {
                navn: playerName,
                kast1: kast1,
                kast2: kast2
            };

            // Send data to Flask backend via POST request
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
            })
            .catch(error => console.error('Error:', error));
        }
    });

    console.log("Data er lagret");
}

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
        console.error("Save button (lagreButton) not found on the page.");
    }

    // Attach event listener for "addPlayer" only once
    if (addPlayerButton) {
        addPlayerButton.addEventListener("click", function () {
            let tbody = document.querySelector("tbody");
            let rowCount = tbody.querySelectorAll("tr").length;
            let newRow = createRow(rowCount + 1);
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

        tableData.forEach((rowData, index) => {
            let newRow = createRow(index + 1);
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

document.getElementById("lagreButton").addEventListener("click", function () {
    saveTableData();
    updateTotalSum();
    alert("Dataene er lagret");
});

document.getElementById("nyTavleButton").addEventListener("click", function () {
    saveTableData();

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
});

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

function saveTableData() {
    // Samle data fra tabellen
    let tableData = [];
    let rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        // Exclude the row containing the "Ny spiller" button
        if (row.id !== "totalRow") {
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
    updateTotalSum();
    displayCurrentDate();

    // Set up the event listener for the "Ny spiller" button
    document.getElementById("addPlayer").addEventListener("click", function () {
        let tbody = document.querySelector("tbody");
        let rowCount = tbody.querySelectorAll("tr").length;
        let newRow = createRow(rowCount + 1);
        tbody.appendChild(newRow); // Add the new row to the end of the table body
        saveTableData(); // Save the updated table data
    });
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

        // Clear existing rows
        tbody.innerHTML = '';

        tableData.forEach((rowData, index) => {
            let newRow = createRow(index + 1);
            tbody.appendChild(newRow);

            let cells = newRow.querySelectorAll("th, td");
            rowData.forEach((cellData, cellIndex) => {
                if (cells[cellIndex]) {
                    cells[cellIndex].textContent = cellData;
                }
            });
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
    updateTotalSum();
    alert("Dataene er lagret");
});

// Event listener for the "Ny Tavle" button to reset the table
document.getElementById("nyTavleButton").addEventListener("click", function () {
    // Save the current state of the table before clearing it
    saveTableData();

    // Reset the table to its initial state
    let tbody = document.querySelector("tbody");

    // Clear all rows and add only the initial row
    tbody.innerHTML = `
        <tr>
            <th contenteditable="">legg til et navn</th>
            <td contenteditable="">0</td>
            <td contenteditable="">0</td>
            <td class="row-total">0</td>
        </tr>
    `;

    // Update the total sum for each row
    updateTotalSum();
});

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

function downloadCSV() {
    let table = document.querySelector(".table");
    let rows = table.querySelectorAll("tr");
    let csvContent = "";

    // Loop through rows to build CSV content
    rows.forEach(row => {
        let cols = row.querySelectorAll("th, td");
        let rowData = [];
        cols.forEach(col => {
            rowData.push('"' + col.innerText + '"');
        });
        csvContent += rowData.join(",") + "\n";
    });

    // Create a blob and initiate download
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

    rows.forEach((row, index) => {
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

    // Update the total sum for each row
    updateTotalSum();
}

function downloadXLSX() {
    let table = document.querySelector(".table");
    let rows = table.querySelectorAll("tr");
    let data = [];

    // Loop through rows to build data array
    rows.forEach(row => {
        let cols = row.querySelectorAll("th, td");
        let rowData = [];
        cols.forEach(col => {
            rowData.push(col.innerText);
        });
        data.push(rowData);
    });

    // Create a new workbook and worksheet
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet(data);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Dart Table");

    // Generate XLSX file and trigger download
    XLSX.writeFile(wb, "dart_table.xlsx");
}

<<<<<<< HEAD
document.getElementById("downloadCSVButton").addEventListener("click", downloadXLSX);
=======
document.getElementById("downloadCSVButton").addEventListener("click", downloadXLSX);

// Fetch all entries from the database
fetch('http://127.0.0.1:5000/api/dartboard', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
})

>>>>>>> 09a73485a149b6a8a4e2c1ca8668cf8d029220c1
