// Når HTML-dokumentet er lastet inn, sett opp eventlyttere.
document.addEventListener("DOMContentLoaded", setupEventListeners);

// Setter opp hendelseslyttere for filopplasting, nedlasting, tilbakestilling og lagring.
function setupEventListeners() {
    document.getElementById("uploadCSV")?.addEventListener("change", handleFileUpload);
    document.getElementById("downloadCSVButton")?.addEventListener("click", downloadXLSX);
    document.getElementById("nyTavleButton")?.addEventListener("click", resetTableForNewRound);
    document.getElementById("lagreButton")?.addEventListener("click", saveTableData);
}


// Håndterer opplasting av en Excel-fil (.xlsx). Skjuler eventuell tidligere vinnervisning og kontrollerer filtypen.
function handleFileUpload(event) {
    hideWinnerBox(); // Skjul vinnerboksen ved nytt filvalg.
    const file = event.target.files[0]; // Hent den valgte filen.
    if (!file?.name.endsWith(".xlsx")) {
        showMessage("Ingen fil valgt. Vennligst velg en gyldig .xlsx-fil.");
        return;
    }
    console.log("Excel-fil lastet opp");

    const reader = new FileReader(); // Opprett en FileReader.
    reader.onload = (e) => processXLSXData(e.target.result);
    reader.onerror = () => showMessage("Feil ved lesing av filen. Prøv en annen fil.");
    reader.readAsArrayBuffer(file); // Les filen som en arraybuffer.
}


// Konverterer en XLSX-fil (arrayBuffer) til JSON ved hjelp av SheetJS.
function convertXLSXToJson(arrayBuffer) {
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
        type: "array",
        cellDates: true // Konverterer datoer til JavaScript Date-objekter.
    });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
        header: 1,
        raw: false // Bruker celleformatering slik at datoer blir til tekst.
    });
}


// Behandler Excel-dataene ved å konvertere dem til JSON, sjekke for gyldige data, og bygge den dynamiske tabellen.
function processXLSXData(arrayBuffer) {
    try {
        const jsonData = convertXLSXToJson(arrayBuffer);
        if (!jsonData || jsonData.length === 0) {
            showMessage("Filen inneholder ingen data. Vennligst velg en annen fil.");
            return;
        }
        buildDynamicTable(jsonData);
        updateTotalSum();
        displayWinner();
    } catch (error) {
        console.error("Feil ved analyse av XLSX-fil:", error);
        showMessage("Feil ved analyse av XLSX-fil, vennligst prøv igjen.");
    }
}


// Filtrerer ut eventuelle overskrifter som ikke skal vises (for eksempel "sammenlagt poeng").
function filterHeaders(excelHeaders) {
    return excelHeaders.filter(header => header.toLowerCase() !== "sammenlagt poeng");
}


// Oppretter tabellhodet (thead) med overskrifter fra Excel-data.
function createTableHead(headers) {
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headers.forEach(headerText => {
        const th = document.createElement("th");
        // Dersom overskriften er tom, bruk "Dato" som standard.
        th.textContent = headerText.trim() !== "" ? headerText : "Dato";
        headerRow.appendChild(th);
    });

    // Legg til en ekstra kolonne for "Sammenlagt poeng".
    const thTotal = document.createElement("th");
    thTotal.textContent = "Sammenlagt poeng";
    headerRow.appendChild(thTotal);

    thead.appendChild(headerRow);
    return thead;
}


// Oppretter tabellens kropp (tbody) med data fra Excel.
function createTableBody(jsonData, headers) {
    const tbody = document.createElement("tbody");

    // Gå gjennom hver rad (start på indeks 1 for å hoppe over headeren).
    jsonData.slice(1).forEach(rowData => {
        // Hopp over helt tomme rader.
        if (!rowData[0] || !rowData[0].toString().trim()) {
            console.warn("Hopper over tom rad.");
            return;
        }
        const tr = document.createElement("tr");

        // Opprett en celle for hver overskrift.
        headers.forEach((_, index) => {
            const td = document.createElement("td");
            td.textContent = rowData[index] !== undefined ? rowData[index] : "";
            tr.appendChild(td);
        });

        // Regn ut totalsummen for raden (fra kolonne 1 og utover).
        let seasonSum = 0;
        for (let i = 1; i < headers.length; i++) {
            const score = parseInt(rowData[i]) || 0;
            seasonSum += score;
        }
        // Legg til en ekstra celle for totalen.
        const tdTotal = document.createElement("td");
        tdTotal.textContent = seasonSum;
        tr.appendChild(tdTotal);

        tbody.appendChild(tr);
    });

    return tbody;
}

// Bygger en dynamisk tabell basert på JSON-data hentet fra den opplastede Excel-filen.
function buildDynamicTable(jsonData) {
    if (!jsonData || jsonData.length === 0) {
        showMessage("Filen inneholder ingen data. Vennligst last opp en annen fil.");
        return;
    }

    // Hent og filtrer overskriftene fra første rad.
    const excelHeaders = jsonData[0];
    const filteredHeaders = filterHeaders(excelHeaders);

    // Finn tabellen og fjern eksisterende innhold.
    const table = document.querySelector(".table");
    table.innerHTML = "";

    // Lag og legg til tabellhodet og tabellkroppen.
    const thead = createTableHead(filteredHeaders);
    table.appendChild(thead);

    const tbody = createTableBody(jsonData, filteredHeaders);
    table.appendChild(tbody);
}



// Laster ned den nåværende tabellen som en Excel-fil. 
function downloadXLSX() {
    const table = document.querySelector(".table");
    if (!table) {
        showMessage("Ingen tabell for å laste ned. Vennligst last opp en fil.");
        return;
    }

    // Sjekk om tabellen har noen rader med data.
    const tbody = table.querySelector("tbody");
    if (!tbody || tbody.rows.length === 0) {
        showMessage("Tabellen er tom. Vennligst last opp en fil.");
        return;
    }

    // Hent data fra alle radene i tabellen.
    const data = Array.from(table.querySelectorAll("tr")).map(row =>
        Array.from(row.querySelectorAll("th, td")).map(cell => cell.innerText)
    );

    // Erstatt header for siste kolonne med dagens dato i formatet mm/dd/yy.
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
    if (data.length > 0 && data[0].length > 0) {
        data[0][data[0].length - 1] = formattedDate;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), "Sesongstatistikk");
    XLSX.writeFile(wb, "Sesongstatistikk.xlsx");
}


// Oppdaterer totalpoengene for hver rad ved å regne ut summen på nytt.
function updateTotalSum() {
    const rows = document.querySelectorAll("tbody tr");
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        let seasonSum = 0;
        for (let i = 1; i < cells.length - 1; i++) { // Summer alle poengcellene (fra celle 1 til nest siste celle).
            const score = parseInt(cells[i].textContent.trim()) || 0;
            seasonSum += score;
        }
        cells[cells.length - 1].textContent = seasonSum;// Oppdater den siste cellen med den nye totalen.
    });
}


// Globalt flagg for å forhindre flere samtidige tilbakestillinger.
let resetInProgress = false;

// Nullstiller tabellen til standardoppsettet med placeholders for navn og datoer.
function resetTableForNewRound() {
    resetInProgress = true;
    const resetButton = document.getElementById("nyTavleButton");
    if (resetButton) {
        resetButton.disabled = true;
    }

    hideWinnerBox(); // Skjul vinnerboksen.

    try {
        const table = document.querySelector(".table");
        if (!table) {
            showMessage("Tabellen finnes ikke. Vennligst last inn siden på nytt.");
            return;
        }

        const tbody = table.querySelector("tbody");
        if (!tbody || tbody.rows.length === 0) { // Sjekk om det ikke finnes noen data.
            showMessage("Tabellen er allerede tom.");
            return;
        }

        // Sjekk om alle score-cellene allerede er null eller tomme.
        let alreadyReset = true;
        Array.from(tbody.rows).forEach(row => {
            const cells = row.querySelectorAll("td");
            for (let i = 1; i < cells.length - 1; i++) { // Anta at den første cellen er navn og den siste er total.
                if (cells[i].textContent.trim() !== "" && cells[i].textContent.trim() !== "0") {
                    alreadyReset = false;
                }
            }
        });

        if (alreadyReset) {
            showMessage("Tabellen er allerede tom.");
            return;
        }

        // Sett tabellen til standardoppsettet med editable felter og placeholders.
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Navn</th>
                    <th contenteditable class="editable" data-placeholder="Dato 1"></th>
                    <th contenteditable class="editable" data-placeholder="Dato 2"></th>
                    <th contenteditable class="editable" data-placeholder="Dato 3"></th>
                    <th contenteditable class="editable" data-placeholder="Dato 4"></th>
                    <th>Sammenlagt</th>
                </tr>
            </thead>
            <tbody>
                <tr id="poenger-rad1">
                    <th contenteditable class="editable" data-placeholder="Legg til et navn"></th>
                    <td contenteditable class="editable" data-placeholder="Total til en forrige runde"></td>
                    <td contenteditable class="editable" data-placeholder="Total til en forrige runde"></td>
                    <td contenteditable class="editable" data-placeholder="Total til en forrige runde"></td>
                    <td contenteditable class="editable" data-placeholder="Total til en forrige runde"></td>
                    <td class="row-total"></td>
                </tr>
            </tbody>
        `;

        // Oppdater totalene (som nå bør være null/0).
        updateTotalSum();
    } catch (error) {
        console.error("Feil under tilbakestilling av tabellen:", error);
        showMessage("En feil oppstod under tilbakestilling. Vennligst prøv igjen.");
    } finally {
        resetInProgress = false;
        if (resetButton) {
            resetButton.disabled = false;
        }
    }
}

// Lagrer tabelldata ved å oppdatere totalene og vise vinneren.
function saveTableData() {
    if (!document.querySelector("tbody tr")) {
        showMessage("Kan ikke lagre data. Det er ingen spillere i tabellen.");
        return;
    }
    updateTotalSum();
    displayWinner();
    console.log("Lagrer data og oppdaterer totalsum for sesongen.");
}

// Beregner og viser spilleren med høyest totalsum.
function displayWinner() {
    const winnerDisplay = document.getElementById("winnerDisplay");
    const winnerBox = document.querySelector(".winner-box");

    if (!winnerDisplay || !winnerBox) {
        showMessage("Vinneren kunne ikke vises. Vennligst prøv igjen.")
        console.error("Element med ID 'winnerDisplay' eller '.winner-box' finnes ikke.");
        return;
    }

    const rows = document.querySelectorAll("tbody tr");
    let highestScore = 0;
    let winnerName = "Ingen spillere";

    // Gå gjennom hver rad i tabellen.
    rows.forEach(row => {
        // Forvent at navnet står i den første cellen.
        const name = row.querySelector("td")?.textContent.trim();
        const cells = row.querySelectorAll("td");
        const score = parseInt(cells[cells.length - 1].textContent) || 0;// Hent poengsummen fra den siste cellen i raden.

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
    console.log("displayWinner kalt");
}

// Skjuler vinnerboksen.
function hideWinnerBox() {
    const winnerBox = document.querySelector(".winner-box");
    if (winnerBox) {
        winnerBox.style.display = "none";
    }
}

// Viser en melding (feil eller info) i 3 sekunder.
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
