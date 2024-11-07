function saveTableData() {
    let rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        if (!row.hasAttribute("data-saved")) {
            const playerName = row.querySelector("th").textContent.trim();
            const kast1 = parseInt(row.querySelector("td:nth-child(2)").textContent.trim()) || 0;
            const kast2 = parseInt(row.querySelector("td:nth-child(3)").textContent.trim()) || 0;
            const totalSum = kast1 + kast2 + 2; // Include +2 bonus here for saving

            const data = {
                navn: playerName,
                kast1: kast1,
                kast2: kast2,
                total_sum: totalSum // Send the bonus-inclusive total to the server
            };

            fetch('/api/dartboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                console.log(result);
                row.setAttribute("data-saved", "true");
                openPopup('Data has been saved successfully!'); // Open popup with a message
            })
            .catch(error => console.error('Error:', error));
        }
    });

    console.log("Data er lagret");
}



// Global popup functions
function openPopup(message) {
    const popupOverlay = document.getElementById('popupOverlay');
    const alertMessage = document.getElementById('alertMessage');
    if (popupOverlay && alertMessage) { // Check if elements exist
        alertMessage.textContent = message; // Set custom message
        popupOverlay.style.display = 'block';
    } else {
        console.error('Popup elements not found.');
    }
}

function closePopupFunc() {
    const popupOverlay = document.getElementById('popupOverlay');
    if (popupOverlay) {
        popupOverlay.style.display = 'none';
    }
}

// Event listener for the close button
document.addEventListener('DOMContentLoaded', function () {
    const closePopup = document.getElementById('closePopup');
    if (closePopup) {
        closePopup.addEventListener('click', closePopupFunc);
    } else {
        console.error("closePopup button not found in the DOM.");
    }
});



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
            openPopup("Dataene er lagret"); // Replace standard alert with pop-up
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
        let rowTotal = throw1 + throw2 + 2; // Automatically add +2 bonus

        console.log(`Player row: ${row.querySelector("th").textContent.trim()}`);
        console.log(`Throw 1: ${throw1}, Throw 2: ${throw2}, Total with Bonus: ${rowTotal}`);

        // Update the total in the row for display
        row.querySelector(".row-total").textContent = rowTotal;
    });
}


// Function to handle file upload and parse only .xlsx files
document.getElementById("uploadCSV").addEventListener("change", function (event) {
    let file = event.target.files[0];
    if (file && file.name.endsWith(".xlsx")) {
        let reader = new FileReader();
        reader.onload = function (e) {
            parseXLSX(e.target.result); // Pass the ArrayBuffer to parseXLSX
        };
        reader.readAsArrayBuffer(file); // Read as ArrayBuffer for XLSX
    } else {
        console.error("Unsupported file type. Please upload an XLSX file.");
    }
});

// Function to parse the uploaded .xlsx file and display it in the table
function parseXLSX(arrayBuffer) {
    console.log("parseXLSX function called");

    try {
        let data = new Uint8Array(arrayBuffer);
        let workbook = XLSX.read(data, { type: "array" });
        let firstSheetName = workbook.SheetNames[0];
        let worksheet = workbook.Sheets[firstSheetName];

        // Convert worksheet to JSON array
        let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0 });
        console.log("Parsed JSON Data:", jsonData); // Log to inspect the data structure

        let tableBody = document.querySelector("tbody");
        if (!tableBody) {
            console.error("Table body element not found.");
            return;
        }

        tableBody.innerHTML = ""; // Clear existing rows

        // Only process rows that have valid data in expected columns
        jsonData.slice(1).forEach((row) => {
            if (
                typeof row[0] === 'string' && row[0].trim() !== '' && // Name is non-empty
                !isNaN(row[1]) && !isNaN(row[2]) && !isNaN(row[3])    // Scores are numeric
            ) {
                let newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <th contenteditable="">${row[0]}</th>
                    <td contenteditable="">${row[1]}</td>
                    <td contenteditable="">${row[2]}</td>
                    <td class="row-total">${row[3]}</td>
                `;
                tableBody.appendChild(newRow);
                console.log(`Row added to table: ${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}`);
            } else {
                console.warn("Skipping invalid or empty row:", row);
            }
        });

        updateTotalSum(); // Assuming this function recalculates totals
    } catch (error) {
        console.error("Error parsing XLSX file:", error);
    }
}

// Function to download the table data as an .xlsx file
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

// Use DOMContentLoaded to set up event listeners for the buttons
document.addEventListener("DOMContentLoaded", function () {
    const downloadButton = document.getElementById("downloadCSVButton");

    if (downloadButton) {
        downloadButton.addEventListener("click", downloadXLSX);
    } else {
        console.error("downloadCSVButton not found in the DOM.");
    }
});

document.getElementById("uploadCSV").addEventListener("change", function (event) {
    const fileStatus = document.getElementById("fileStatus");
    if (event.target.files.length === 0) {
        // If no file was selected (canceled), show "Ingen fil valgt"
        fileStatus.style.display = "inline";
    } else {
        // If a file was selected, hide the "Ingen fil valgt" text
        fileStatus.style.display = "none";
    }
});




