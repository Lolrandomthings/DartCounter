document.addEventListener("DOMContentLoaded", setupEventListeners);

function setupEventListeners() {
    document.getElementById("uploadCSV")?.addEventListener("change", handleFileUpload);
    document.getElementById("downloadCSVButton")?.addEventListener("click", downloadXLSX);
    document.getElementById("nyTavleButton")?.addEventListener("click", resetTableForNewRound);
    document.getElementById("addPlayer")?.addEventListener("click", addNewPlayer);
    document.getElementById("lagreButton")?.addEventListener("click", saveTableData);

}

function handleFileUpload(event) {
    let file = event.target.files[0];
    if (!file?.name.endsWith(".xlsx")) return console.error("Ugyldig filtype.");

    let reader = new FileReader();
    reader.onload = (e) => processXLSXData(e.target.result);
    reader.readAsArrayBuffer(file);
}

function processXLSXData(arrayBuffer) {
    try {
        let jsonData = convertXLSXToJson(arrayBuffer);
        if (!jsonData?.length) return console.error("Filen er tom eller ugyldig.");

        let headers = jsonData[0];
        let dateColumns = headers.slice(-2);

        if (dateColumns.length < 2) return console.error("Fant ikke nok dato-kolonner.");

        updateTableHeaders(dateColumns);
        populateTable(jsonData, headers, dateColumns);
    } catch (error) {
        console.error("Feil ved analyse av XLSX-fil:", error);
    }
}

function convertXLSXToJson(arrayBuffer) {
    let workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
}

function getJsDateFromExcel(excelDate) {
    return new Date((excelDate - (25567 + 1)) * 86400 * 1000);
}

function formatHeaders() {
    let tableHeaders = document.querySelectorAll("th"); // Select all table headers

    tableHeaders.forEach(header => {
        let value = header.innerText.trim();
        if (!isNaN(value) && value > 40000 && value < 50000) { // Likely an Excel date
            let formattedDate = getJsDateFromExcel(parseInt(value)).toLocaleDateString("no-NO");
            header.innerText = formattedDate; // Replace header text with formatted date
        }
    });
}


document.addEventListener("DOMContentLoaded", formatHeaders);


function updateTableHeaders(dateColumns) {
    let headers = document.querySelectorAll("thead th");
    if (headers.length > 2) {
        headers[1].textContent = dateColumns[0];
        headers[2].textContent = dateColumns[1];
    }
}

function populateTable(jsonData, headers, dateColumns) {
    let tableBody = document.querySelector("tbody");
    tableBody.innerHTML = "";

    jsonData.slice(1).forEach(row => {
        let name = row[0]?.trim() || "";
        if (!name) return console.warn("Hopper over tom rad.");

        let prevTotal1 = row[headers.indexOf(dateColumns[0])] || 0;
        let prevTotal2 = row[headers.indexOf(dateColumns[1])] || 0;

        tableBody.appendChild(createRow(name, prevTotal1, prevTotal2));
    });
}

function createRow(name = "", prevTotal1 = 0, prevTotal2 = 0) {
    let row = document.createElement("tr");
    row.innerHTML = `
        <th contenteditable="">${name}</th>
        <td>${prevTotal1}</td>
        <td>${prevTotal2}</td>
        <td  contenteditable="" class="editable dart-kast" data-placeholder="0"></td>
        <td  contenteditable="" class="editable dart-kast" data-placeholder="0"></td>
        <td class="row-total">2</td>
    `;
    return row;
}

function resetTableForNewRound() {
    document.querySelectorAll("tbody tr").forEach(row => {
        row.querySelectorAll("td")[0].textContent = "0";
        row.querySelectorAll("td")[1].textContent = "0";
        row.querySelector(".row-total").textContent = "";
    });
    updateTotalSum();
}

function addNewPlayer() {
    document.querySelector("tbody").appendChild(createRow());
}

function updateTotalSum() {
    document.querySelectorAll("tr").forEach(row => {
        let totalCell = row.querySelector(".row-total");
        if (!totalCell) {
            return; // Skip this row if .row-total is missing
        }

        let cells = row.querySelectorAll(".dart-kast"); // Only select dart throw columns
        let throw1 = parseInt(cells[0]?.textContent) || 0;
        let throw2 = parseInt(cells[1]?.textContent) || 0;

        totalCell.textContent = throw1 + throw2 + 2;
    });
}

function downloadXLSX() {
    let table = document.querySelector(".table");
    let data = Array.from(table.querySelectorAll("tr")).map(row =>
        Array.from(row.querySelectorAll("th, td")).map(cell => cell.innerText)
    );

    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), "Dart Table");
    XLSX.writeFile(wb, "dart_table.xlsx");
}

function saveTableData() {
    updateTotalSum();
    console.log("Lagrer data skal oppdatere total summen for kast 1 og kast 2");
}
