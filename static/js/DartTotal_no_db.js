// Når HTML-dokumentet er fullastet, sett opp event listeners.
document.addEventListener("DOMContentLoaded", setupEventListeners);

// Setter opp hendelseslyttere for filopplasting, nedlasting, tilbakestilling og lagringshandlinger. 
function setupEventListeners() {
    document.getElementById("uploadCSV")?.addEventListener("change", handleFileUpload);
    document.getElementById("downloadCSVButton")?.addEventListener("click", downloadXLSX);
    document.getElementById("nyTavleButton")?.addEventListener("click", resetTableForNewRound);
    document.getElementById("lagreButton")?.addEventListener("click", saveTableData);
}

//Handterer opplasting av en Excel-fil (.xlsx). Skjuler eventuelle tidligere vinnervisninger og bekrefter at filen er en gyldig .xlsx.
function handleFileUpload(event) {
    hideWinnerBox(); // Skjul vinnerboksen på nytt filvalg
    const file = event.target.files[0]; // Hent den valgte filen.
    if (!file?.name.endsWith(".xlsx")) {
        showMessage("Ingen fil valgt. Vennligst velg en gyldig .xlsx-fil.");
        return;
    }
    console.log("Excel-fil lastet opp");

    const reader = new FileReader(); // Lag en FileReader.
    reader.onload = (e) => processXLSXData(e.target.result);
    reader.onerror = () => showMessage("Feil ved lesing av filen. Prøv en annen fil.");
    reader.readAsArrayBuffer(file); // Les fil som en matrisebuffer.
}

// Behandler Excel-dataene, konverterer filen til JSON. sjekker for gyldige data, bygger sesongstatistikktabellen.
function processXLSXData(arrayBuffer) {
    try {
        const jsonData = convertXLSXToJson(arrayBuffer);
        if (!jsonData || jsonData.length === 0) {
            showMessage("Filen inneholder ingen data. Vennligst velg et annet fil.");
            return;
        }
        buildSeasonTable(jsonData);
    } catch (error) {
        console.error("Feil ved analyse av XLSX-fil:", error);
        showMessage("Feil ved analyse av XLSX-fil, vennligst prøv igjen.");
        return;
    }
}

// Konverterer en XLSX-fil (arrayBuffer) til JSON ved hjelp av SheetJS.
function convertXLSXToJson(arrayBuffer) {
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
        type: "array",
        cellDates: true // Konverter datoer til JavaScript Dato-objekter.
    });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
        header: 1,
        raw: false // Fjern alt eksisterende innhold.
    });
}

// Bygger sesongstatistikktabellen. Bruker hele JSON-dataene (første rad som overskrifter, påfølgende rader som data).
function buildSeasonTable(jsonData) {
    const headers = jsonData[0]; // Første rad: tabelloverskrifter.
    const table = document.querySelector(".table");
    table.innerHTML = ""; // Fjern alt eksisterende innhold.

    // Create and append the table head.
    const thead = createTableHead(headers);
    table.appendChild(thead);

    // Create and append the table body.
    const tbody = document.createElement("tbody");
    jsonData.slice(1).forEach(rowData => {
        // Skip rows that are completely empty.
        if (!rowData[0]?.trim()) {
            console.warn("Hopper over tom rad.");
            return;
        }
        const tr = createTableRow(rowData, headers);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
}


// Oppretter tabelloverskriften (thead) for sesongstatistikktabellen. Den første kolonnen er "Navn", etterfulgt av en kolonne for hver dato fra Excel,
// og en ekstra spalte for "Sammenlagt poeng" (totalt poeng).
function createTableHead(headers) {
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    // Første kolonne: Spillerens navn.
    let th = document.createElement("th");
    th.textContent = "Navn";
    headerRow.appendChild(th);

    // Lag en overskrift for hver gjenværende kolonne fra Excel-filen.
    for (let i = 1; i < headers.length; i++) {
        th = document.createElement("th");
        th.textContent = headers[i];
        headerRow.appendChild(th);
    }

    // Ekstra kolonne for totalsummen.
    th = document.createElement("th");
    th.textContent = "Sammenlagt poeng";
    headerRow.appendChild(th);

    thead.appendChild(headerRow);
    return thead;
}

// Oppretter en tabellrad (tr) for en spillers sesongstatistikk. Den første cellen er spillerens navn. For hver påfølgende kolonne, 
// den konverterer poengsummen (eller bruker 0 hvis ugyldig) og summerer dem opp. En ekstra celle legges til for totalt antall poeng.
function createTableRow(rowData, headers) {
    const tr = document.createElement("tr");

    //Celle for spillerens navn.
    let td = document.createElement("td");
    td.textContent = rowData[0] || "";
    tr.appendChild(td);

    let seasonSum = 0;
    // Lag en celle for hver poengsum (fra kolonne 1 til siste overskrift).
    for (let i = 1; i < headers.length; i++) {
        td = document.createElement("td");
        const score = parseInt(rowData[i]) || 0;
        td.textContent = score;
        seasonSum += score;
        tr.appendChild(td);
    }

    // Ekstra celle for totalen (sammenlagt poeng).
    td = document.createElement("td");
    td.textContent = seasonSum;
    tr.appendChild(td);

    return tr;
}


// Oppdaterer totalen (samme tid) for hver rad. Itererer over alle rader i kroppen, beregner summen for hver rad på nytt og oppdaterer den siste cellen tilsvarende.
function updateTotalSum() {
    const rows = document.querySelectorAll("tbody tr");
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        let seasonSum = 0;
        //Sum poengcellene (unntatt den første cellen (navn) og den siste cellen (totalt)).
        for (let i = 1; i < cells.length - 1; i++) {
            const score = parseInt(cells[i].textContent.trim()) || 0;
            seasonSum += score;
        }
        // Oppdater den siste cellen med den nye totalen.
        cells[cells.length - 1].textContent = seasonSum;
    });
}

//Tilbakestiller sesongtabellresultatene (alle celler unntatt navn og totalceller). Hvis tabellen allerede er tilbakestilt, viser den en melding.
function resetTableForNewRound() {
    hideWinnerBox();
    const rows = document.querySelectorAll("tbody tr");
    if (rows.length === 0) {
        showMessage("Tabellen er allerede tom.");
        return;
    }

    // Sjekk om alle poengcellene (unntatt navn og total) allerede er tomme eller null.
    let alreadyReset = true;
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        for (let i = 1; i < cells.length - 1; i++) {
            if (cells[i].textContent.trim() !== "" && cells[i].textContent.trim() !== "0") {
                alreadyReset = false;
            }
        }
    });

    if (alreadyReset) {
        showMessage("Tabellen er allerede tom.");
        return;
    }

    // Tilbakestill poengcellene.
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        for (let i = 1; i < cells.length - 1; i++) {
            cells[i].textContent = "";
        }
        // Fjern hele cellen.
        cells[cells.length - 1].textContent = "";
    });

    updateTotalSum();
}


// Laster ned gjeldende sesongstatistikktabell som en Excel-fil.
function downloadXLSX() {
    const table = document.querySelector(".table");
    const data = Array.from(table.querySelectorAll("tr")).map(row =>
        Array.from(row.querySelectorAll("th, td")).map(cell => cell.innerText)
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), "Sesongstatistikk");
    XLSX.writeFile(wb, "Sesongstatistikk.xlsx");
}


// Lagrer sesongtabelldata ved å oppdatere totaler og vise vinneren.
function saveTableData() {
    if (!document.querySelector("tbody tr")) {
        showMessage("Kan ikke lagre data. Det er ingen spillere i tabellen.");
        return;
    }
    updateTotalSum();
    displayWinner();
    console.log("Lagrer data og oppdaterer total sum for sesongen");
}


// Beregner og viser spilleren med høyest sesongtotal.
function displayWinner() {
    const winnerDisplay = document.getElementById("winnerDisplay");
    const winnerBox = document.querySelector(".winner-box");

    if (!winnerDisplay || !winnerBox) {
        console.error("Element med ID 'winnerDisplay' eller '.winner-box' finnes ikke.");
        return;
    }

    const rows = document.querySelectorAll("tbody tr");
    let highestScore = 0;
    let winnerName = "Ingen spillere";

    rows.forEach(row => {
        // Forutsatt at den første cellen er spillerens navn.
        const name = row.querySelector("td")?.textContent.trim();
        const cells = row.querySelectorAll("td");
        const score = parseInt(cells[cells.length - 1].textContent) || 0;
        if (score > highestScore) {
            highestScore = score;
            winnerName = name;
        }
    });

    if (highestScore === 0) {
        showMessage("Ingen gyldige poengsummer funnet.");
        return;
    }

    winnerDisplay.textContent = `Vinneren er ${winnerName} med ${highestScore} poeng!`;
    winnerBox.style.display = "block";
    console.log("displayWinner called");
}

// Skjuler vinnerboksen.
function hideWinnerBox() {
    const winnerBox = document.querySelector(".winner-box");
    if (winnerBox) {
        winnerBox.style.display = "none";
    }
}



// Viser en feilmelding i 3 sekunder.
function showMessage(message) {
    const messageElement = document.getElementById("global-error");
    const textElement = document.getElementById("error-text");

    if (textElement) {
        textElement.textContent = message;
    }
    messageElement.style.display = "flex";

    setTimeout(() => {
        messageElement.style.display = "none";
    }, 3000);
}
