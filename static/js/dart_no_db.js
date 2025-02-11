// Når hele HTML-dokumentet er lastet, start oppsett av event listeners
document.addEventListener("DOMContentLoaded", setupEventListeners);

function setupEventListeners() {
    // Legger til event-lyttere for diverse knapper og inputfelt
    document.getElementById("uploadCSV")?.addEventListener("change", handleFileUpload);
    document.getElementById("downloadCSVButton")?.addEventListener("click", downloadXLSX);
    document.getElementById("nyTavleButton")?.addEventListener("click", resetTableForNewRound);
    document.getElementById("addPlayer")?.addEventListener("click", addNewPlayer);
    document.getElementById("lagreButton")?.addEventListener("click", saveTableData);
}

// Funksjon for å håndtere opplastning av en Excel-fil
function handleFileUpload(event) {
    const file = event.target.files[0]; // Henter den valgte filen
    if (!file?.name.endsWith(".xlsx")) {
        showMessage("Ingen fil valgt. Vennligst velg en gyldig .xlsx-fil.");
        return;
    }
    console.log("Excel-fil lastet opp");

    const reader = new FileReader(); // Oppretter en FileReader
    reader.onload = (e) => processXLSXData(e.target.result);
    reader.onerror = () => showMessage("Feil ved lesing av filen. Prøv en annen fil."); //Hvis render blir ikke trigget 
    reader.readAsArrayBuffer(file); // Leser filen som array buffer
}

// Behandler Excel-data og fyller tabellen med innhold
function processXLSXData(arrayBuffer) {
    try {
        const jsonData = convertXLSXToJson(arrayBuffer); // Konverterer Excel til JSON
        if (!jsonData || jsonData.length === 0) {
            showMessage("Filen inneholder ingen data. Vennligst velg et annet fil.");
            return;
        }
        const headers = jsonData[0]; // Første rad er overskrifter
        const dateColumns = headers.slice(-2); // Antar de to siste er datoer
        if (dateColumns.length < 2) {
            showMessage("Tabellen må inneholde minst 1 kolonne med forrige dato.");
            return;
        }
        updateTableHeaders(dateColumns); // Oppdaterer overskrifter
        populateTable(jsonData, headers, dateColumns); // Fyller tabellen med data
    } catch (error) {
        console.error("Feil ved analyse av XLSX-fil:", error);
    }
}

// Konverterer en XLSX-fil til JSON-format ved hjelp av SheetJS (XLSX)
function convertXLSXToJson(arrayBuffer) {
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
        type: "array",
        cellDates: true // Konverterer datoer til JS Date-objekter
    });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
        header: 1,
        raw: false // Bruker celleformatering slik at datoer blir til tekst
    });
}

// Oppdaterer overskriftene i tabellen med datoene fra filen
function updateTableHeaders(dateColumns) {
    const headers = document.querySelectorAll("thead th");
    if (headers.length > 2) {
        headers[1].textContent = dateColumns[0];
        headers[2].textContent = dateColumns[1];
    }
}

// Fyller tabellen med data fra Excel-filen
function populateTable(jsonData, headers, dateColumns) {
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = ""; // Tømmer eksisterende innhold
    // Hopper over den første raden (overskrifter) og oppretter rader for resten
    jsonData.slice(1).forEach(row => {
        const name = row[0]?.trim() || "";
        if (!name) {
            console.warn("Hopper over tom rad.");
            return;
        }
        const prevTotal1 = row[headers.indexOf(dateColumns[0])] || 0;
        const prevTotal2 = row[headers.indexOf(dateColumns[1])] || 0;
        tableBody.appendChild(createRow(name, prevTotal1, prevTotal2));
    });
}

// Oppretter en ny rad med standardverdier og plasserer placeholder-tekster
function createRow(name = "", prevTotal1 = 0, prevTotal2 = 0) {
    const row = document.createElement("tr");
    row.innerHTML = `
    <th contenteditable="" class="editable" data-placeholder="Legg til et navn">${name}</th>
    <td contenteditable="" class="editable" data-placeholder="0">${prevTotal1}</td>
    <td contenteditable="" class="editable" data-placeholder="0">${prevTotal2}</td>
    <td contenteditable="" class="editable dart-kast" data-placeholder=""></td>
    <td contenteditable="" class="editable dart-kast" data-placeholder=""></td>
    <td class="row-total"></td>
  `;
    return row;
}

function updateTotalSum() {
    document.querySelectorAll("tbody tr").forEach(row => {
      const totalCell = row.querySelector(".row-total");
      if (!totalCell) return;
      const cells = row.querySelectorAll(".dart-kast");
  
      const throw1Text = cells[0]?.textContent.trim();
      const throw2Text = cells[1]?.textContent.trim();
  
      const throw1 = parseInt(throw1Text) || 0;
      const throw2 = parseInt(throw2Text) || 0;
  
      const bonus = (throw1Text !== "" || throw2Text !== "") ? 2 : 0;
  
      totalCell.textContent = throw1 + throw2 + bonus;
    });
  }

// Nullstiller tabellen for en ny runde (resetter poeng)
function resetTableForNewRound() {
    if (document.querySelector("tbody").children.length === 0) {
        showMessage("Tabellen er allerede tom.");
        return;
    }
    document.querySelectorAll("tbody tr").forEach(row => {
        // Setter alle score-celler til "0" og tømmer total-cellen
        row.querySelectorAll("td")[0].textContent = "";
        row.querySelectorAll("td")[1].textContent = "";
        row.querySelector(".row-total").textContent = "";
    });
    updateTotalSum();
}

// Legger til en ny spiller ved å opprette en ny rad
function addNewPlayer() {
    document.querySelector("tbody").appendChild(createRow());
}

// Oppdaterer totalsummen for hver rad (kast 1 + kast 2 + bonus)
// Bonus gis dersom en spiller har skrevet noe i minst ett av kast-cells
/*function updateTotalSum() {
    document.querySelectorAll("tbody tr").forEach(row => {
        const totalCell = row.querySelector(".row-total");
        if (!totalCell) return;
        const cells = row.querySelectorAll(".dart-kast");

        // Henter og trimmer tekst fra kast-cells
        const throw1Text = cells[0]?.textContent.trim();
        const throw2Text = cells[1]?.textContent.trim();

        // Konverterer til tall, blir 0 hvis tomt eller ugyldig
        const throw1 = parseInt(throw1Text) || 0;
        const throw2 = parseInt(throw2Text) || 0;

        // Hvis brukeren har skrevet noe (selv "0") i minst ett felt, gi bonus på 2 poeng
        const bonus = (throw1Text !== "" || throw2Text !== "") ? 2 : 0;

        totalCell.textContent = throw1 + throw2 + bonus;
    });
}*/

// Laster ned tabellen som en Excel-fil
function downloadXLSX() {
    const table = document.querySelector(".table");
    const data = Array.from(table.querySelectorAll("tr")).map(row =>
        Array.from(row.querySelectorAll("th, td")).map(cell => cell.innerText)
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), "Dart Table");
    XLSX.writeFile(wb, "dart_table.xlsx");
}

// Lagrer tabellens data ved å oppdatere totalsummen og vise vinneren
function saveTableData() {
    if (!document.querySelector("tbody tr")) {
        showMessage("Kan ikke lagre data. Det er Ingen spillere i tabellen.");
        return;
    }
    updateTotalSum();
    displayWinner();
    console.log("Lagrer data og oppdaterer total sum for kast 1 og kast 2");
}

// Viser en feilmelding (brukes ved feil ved filopplasting)
function showMessage(message) {
    const messageElement = document.getElementById("global-error");
    const textElement = document.getElementById("error-text");
    if (textElement) {
        textElement.textContent = message;
    }
    messageElement.style.display = "flex";
}

// Kalkulerer og viser hvem som har høyest poengsum
function displayWinner() {
    const winnerDisplay = document.getElementById("winnerDisplay");
    if (!winnerDisplay) {
        console.error("Element med ID 'winnerDisplay' finnes ikke.");
        return;
    }
    const rows = document.querySelectorAll("tbody tr");
    let highestScore = 0;
    let winnerName = "Ingen spillere";

    rows.forEach(row => {
        const name = row.querySelector("th")?.textContent.trim();
        const score = parseInt(row.querySelector(".row-total")?.textContent) || 0; //tar at total finnes på rad 4
        if (score > highestScore) {
            highestScore = score;
            winnerName = name;
        }
    });
    if (highestScore === 0) {
        showMessage("Ingen gyldige poengsummer funnet.");
        return;
    }
    winnerDisplay.textContent = `Vinneren er ${winnerName} med ${highestScore} poenger!`;
    winnerDisplay.classList.remove("hidden");
}
