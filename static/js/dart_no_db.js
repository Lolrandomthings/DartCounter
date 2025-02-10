// Venter HTML-dokumentet er fullstendig lastet og kjører deretter setupEventListeners
document.addEventListener("DOMContentLoaded", setupEventListeners);// Dette sikrer at alle event listeners blir satt opp etter at DOM-en er tilgjengelig

// Setter opp event listeners for forskjellige brukerhandlinger
function setupEventListeners() {
    document.getElementById("uploadCSV")?.addEventListener("change", handleFileUpload); // Når en fil lastes opp
    document.getElementById("downloadCSVButton")?.addEventListener("click", downloadXLSX); // Når brukeren vil laste ned tabellen
    document.getElementById("nyTavleButton")?.addEventListener("click", resetTableForNewRound); // Tilbakestill tabellen for en ny runde
    document.getElementById("addPlayer")?.addEventListener("click", addNewPlayer); // Legg til ny spiller
    document.getElementById("lagreButton")?.addEventListener("click", saveTableData); // Lagre tabellens data
}

// Håndterer opplastning av en Excel-fil
function handleFileUpload(event) {
    let file = event.target.files[0]; // Henter den valgte filen
    if (!file?.name.endsWith(".xlsx")) {// Sjekker om det er en Excel-fil
        showMessage("Ugyldig filtype, vennligst last opp en .xlsx fil");
        return;
    } else {
        console.log("klarte å laste opp excel filen ")
    }

    let reader = new FileReader(); // Oppretter en FileReader for å lese filen
    reader.onload = (e) => processXLSXData(e.target.result); // Behandler data når lesing er fullført
    reader.readAsArrayBuffer(file); // Leser filen som en array buffer
}

// Behandler data fra den opplastede XLSX-filen
function processXLSXData(arrayBuffer) {
    try {
        let jsonData = convertXLSXToJson(arrayBuffer); // Konverterer Excel-data til JSON
        if (!jsonData?.length) return console.error("Filen er tom eller ugyldig.");

        let headers = jsonData[0]; // Henter kolonneoverskriftene
        let dateColumns = headers.slice(-2); // Antar at de to siste kolonnene er datoer

        if (dateColumns.length < 2) return console.error("Fant ikke nok dato-kolonner.");

        updateTableHeaders(dateColumns); // Oppdaterer tabelloverskriftene
        populateTable(jsonData, headers, dateColumns); // Fyller tabellen med data
    } catch (error) {
        console.error("Feil ved analyse av XLSX-fil:", error);
    }
}

// Konverterer XLSX-fil til JSON-format
function convertXLSXToJson(arrayBuffer) {
    let workbook = XLSX.read(new Uint8Array(arrayBuffer), {
        type: "array",
        cellDates: true // Eventuelt: Behandler dato-celler som JavaScript Date-objekter, så de blir MM/DD/ÅÅ
    });
    // raw: false bruker celleformatering slik at overskrifter som er datoer returneres som strings
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, raw: false });
}


// Oppdaterer tabellens overskrifter basert på dato-kolonner fra den importerte filen
function updateTableHeaders(dateColumns) {
    let headers = document.querySelectorAll("thead th"); // Henter alle overskrifter i tabellen
    if (headers.length > 2) { // Sikrer at det finnes minst tre kolonner før oppdatering
        headers[1].textContent = dateColumns[0]; // Setter første dato-kolonne i andre overskrift
        headers[2].textContent = dateColumns[1]; // Setter andre dato-kolonne i tredje overskrift
    }
}

// Fyller tabellen med data fra XLSX-filen
function populateTable(jsonData, headers, dateColumns) {
    let tableBody = document.querySelector("tbody"); // Henter tabellens body (innhold)
    tableBody.innerHTML = ""; // Fjerner eksisterende innhold for å unngå duplikater

    jsonData.slice(1).forEach(row => { // Starter fra andre rad (første rad er overskrifter)
        let name = row[0]?.trim() || ""; // Henter navnet på spilleren fra første kolonne
        if (!name) return console.warn("Hopper over tom rad."); // Hvis ingen navn, hopp over raden

        let prevTotal1 = row[headers.indexOf(dateColumns[0])] || 0; // Henter tidligere sum for første dato
        let prevTotal2 = row[headers.indexOf(dateColumns[1])] || 0; // Henter tidligere sum for andre dato

        tableBody.appendChild(createRow(name, prevTotal1, prevTotal2)); // Oppretter og legger til ny rad
    });
}

// Oppretter en ny rad i tabellen for en spiller
function createRow(name = "", prevTotal1 = 0, prevTotal2 = 0) {
    let row = document.createElement("tr"); // Lager en ny rad (tr-element)
    row.innerHTML = `
        <th contenteditable="" class="editable" data-placeholder="Legg til et navn">${name}</th> <!-- Navn på spilleren -->
        <td>${prevTotal1}</td> <!-- Tidligere sum for første dato -->
        <td>${prevTotal2}</td> <!-- Tidligere sum for andre dato -->
        <td contenteditable="" class="editable dart-kast" data-placeholder="0"></td> <!-- Kast 1 -->
        <td contenteditable="" class="editable dart-kast" data-placeholder="0"></td> <!-- Kast 2 -->
        <td class="row-total">0</td> <!-- Beregnet totalsum med bonus -->
    `;
    return row;
}


// Tilbakestiller tabellen for en ny runde
function resetTableForNewRound() {
    document.querySelectorAll("tbody tr").forEach(row => {
        row.querySelectorAll("td")[0].textContent = "0";
        row.querySelectorAll("td")[1].textContent = "0";
        row.querySelector(".row-total").textContent = "";
    });
    updateTotalSum();
}

// Legger til en ny spiller i tabellen
function addNewPlayer() {
    document.querySelector("tbody").appendChild(createRow());
}

// Oppdaterer total sum for hver rad
function updateTotalSum() {
    document.querySelectorAll("tr").forEach(row => {
        let totalCell = row.querySelector(".row-total");
        if (!totalCell) {
            return; // Hopper over raden hvis den ikke har en totalcelle
        }

        let cells = row.querySelectorAll(".dart-kast"); // Velger kun kolonner med kastverdier
        let throw1 = parseInt(cells[0]?.textContent) || 0;
        let throw2 = parseInt(cells[1]?.textContent) || 0;

        totalCell.textContent = throw1 + throw2 + 2; // Legger til 2 poeng bonus
    });
}

// Laster ned tabellen som en Excel-fil
function downloadXLSX() {
    let table = document.querySelector(".table");
    let data = Array.from(table.querySelectorAll("tr")).map(row =>
        Array.from(row.querySelectorAll("th, td")).map(cell => cell.innerText)
    );

    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), "Dart Table");
    XLSX.writeFile(wb, "dart_table.xlsx");
}

// Lagrer tabellens data (kan utvides med mer lagringslogikk)
function saveTableData() {
    updateTotalSum();
    console.log("Lagrer data og oppdaterer total sum for kast 1 og kast 2");
    displayWinner();
}

function showMessage(message) {
    let messageElement = document.getElementById("global-error");
    let textElement = document.getElementById("error-text");

    if (textElement) {
        textElement.textContent = message; // Update only the text
    }

    messageElement.style.display = "flex"; // Show the message
}

function displayWinner() {
    // Get the winner display element
    const winnerDisplay = document.getElementById("winnerDisplay");
    if (!winnerDisplay) {
        console.error("Element with ID 'winnerDisplay' not found.");
        return;
    }
    
    // Get all player rows from the table
    const rows = document.querySelectorAll("tbody tr");
    let highestScore = 0;
    let winnerName = "No players yet";

    // Loop through each row and determine the highest score
    rows.forEach(row => {
        const name = row.querySelector("th")?.textContent.trim();
        const score = parseInt(row.querySelector(".row-total")?.textContent) || 0;
        if (score > highestScore) {
            highestScore = score;
            winnerName = name;
        }
    });

    // Update the winner display's text content
    winnerDisplay.textContent = `🏆 Winner: ${winnerName} with ${highestScore} points!`;

    // Remove the hidden class to show the winner display
    winnerDisplay.classList.remove("hidden");
}






