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

    alert("Dataene er lagret i databasen");
}

document.getElementById("lagreButton").addEventListener("click", function () {
    saveTableData();
    updateTotalSum();
});


window.onload = function () {
    loadTableData();
    updateTotalSum();
    displayCurrentDate();

    document.getElementById("addPlayer").addEventListener("click", function () {
        let tbody = document.querySelector("tbody");
        let rowCount = tbody.querySelectorAll("tr").length;
        let newRow = createRow(rowCount + 1);
        tbody.appendChild(newRow);
        saveTableData();
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

document.getElementById("uploadFile").addEventListener("change", function(event) {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            let fileContent = e.target.result;
            if (file.name.endsWith(".csv")) {
                parseCSV(fileContent);
            } else if (file.name.endsWith(".xlsx")) {
                parseXLSX(fileContent);
            }
        };
        if (file.name.endsWith(".csv")) {
            reader.readAsText(file);
        } else if (file.name.endsWith(".xlsx")) {
            reader.readAsArrayBuffer(file);
        }
    }
});

function parseCSV(csvContent) {
    let rows = csvContent.split("\n");
    let tableBody = document.querySelector("tbody");
    tableBody.innerHTML = "";

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

    json.forEach((row, index) => {
        if (row.length > 0) {
            let newRow = document.createElement("tr");
            newRow.innerHTML = `
                <th contenteditable="">${row[0] || ''}</th>
                <td contenteditable="">${row[1] || 0}</td>
                <td contenteditable="">${row[2] || 0}</td>
                <td class="row-total">${row[3] || 0}</td>
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

// Fetch all entries from the database
fetch('/api/dartboard')
  .then(response => response.json())
  .then(data => {
    console.log(data);  // Display the entries or render them in your UI
  });
