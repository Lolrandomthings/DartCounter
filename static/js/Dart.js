function saveTableData() {
    let rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        // Check if the row has been saved before
        if (!row.hasAttribute("data-saved")) {
            const playerName = row.querySelector("th").textContent.trim();
            const kast1 = parseInt(row.querySelector("td:nth-child(2)").textContent.trim()) || 0;
            const kast2 = parseInt(row.querySelector("td:nth-child(3)").textContent.trim()) || 0;

            // Skip if the row has no player name or both scores are zero
            if (!playerName || (kast1 === 0 && kast2 === 0)) {
                console.log("Skipping row with no data.");
                return;
            }

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


document.getElementById("nyTavleButton").addEventListener("click", function () {
    const button = this;
    button.disabled = true; // Disable button to prevent multiple clicks

    fetch('/api/create_new_round', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log("New round table created:", data.table_name);

            // Reset the board in the frontend
            let tbody = document.querySelector("tbody");
            tbody.innerHTML = `
                <tr id="poenger-rad1">
                    <th contenteditable="" class="editable" data-placeholder="Legg til et navn"></th>
                    <td contenteditable="" class="editable"data-placeholder="0"></td>
                    <td contenteditable="" class="editable" data-placeholder="0"></td>
                    <td class="row-total">0</td>
                </tr>
        `;
            updateTotalSum();
        })
        .catch(error => console.error('Error creating new round:', error))
        .finally(() => {
            setTimeout(() => { button.disabled = false; }, 2000); // Re-enable after 2 seconds
        });
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
            // Don't call saveTableData() here, wait until the user saves manually
        });
    }
    
};

function displayCurrentDate() {
    const dateContainer = document.getElementById("currentDate");
    const today = new Date();
    const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('no-NO', options);

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

        <th contenteditable="" class="editable" data-placeholder="Legg til et navn"></th>
        <td contenteditable="" class="editable"data-placeholder="0"></td>
        <td contenteditable="" class="editable" data-placeholder="0"></td>
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

        console.log(`Player row: ${row.querySelector("th").textContent.trim()}`);
        console.log(`Throw 1: ${throw1}, Throw 2: ${throw2}, Initial Total: ${rowTotal}`);

        // Check if either throw has a score of 2 and both throws are non-zero
        if (throw1 !== 2 && throw2 !== 2 && (throw1 > 0 || throw2 > 0)) {
            // Apply bonus only if it hasn’t been applied before
            if (!row.hasAttribute("data-bonus-applied")) {
                rowTotal += 2; // Add the +2 bonus
                row.setAttribute("data-bonus-applied", "true"); // Mark the bonus as applied
                console.log(`Bonus applied. New Total: ${rowTotal}`);
            } else {
                console.log("Bonus already applied previously.");
            }
        } else {
            // Remove the bonus if it was previously applied and there's a 2 in either throw
            if (row.hasAttribute("data-bonus-applied")) {
                row.removeAttribute("data-bonus-applied");
                console.log("Bonus removed because a throw has a score of 2.");
            } else {
                console.log("No bonus applied, and a throw has a score of 2 or zero.");
            }
        }

        // Update the total in the row
        row.querySelector(".row-total").textContent = rowTotal;
        console.log(`Final Total for row: ${rowTotal}`);
    });
}


function downloadCSV() {
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
}

document.getElementById("downloadCSVButton").addEventListener("click", downloadXLSX);