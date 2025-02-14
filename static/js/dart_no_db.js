// Når HTML-dokumentet er lastet, settes event-lyttere opp
document.addEventListener("DOMContentLoaded", setupEventListeners);

// Setter opp event-lyttere for opplasting, nedlasting, tilbakestilling, lagring og for å legge til nye spillere
function setupEventListeners() {
  document.getElementById("uploadCSV")?.addEventListener("change", handleFileUpload);
  document.getElementById("downloadCSVButton")?.addEventListener("click", downloadXLSX);
  document.getElementById("nyTavleButton")?.addEventListener("click", resetTableForNewRound);
  document.getElementById("addPlayer")?.addEventListener("click", addNewPlayer);
  document.getElementById("lagreButton")?.addEventListener("click", saveTableData);
}

// Håndterer opplasting av en Excel-fil (.xlsx)
// Skjuler vinnerboksen og viser feilmelding om filen ikke er gyldig
function handleFileUpload(event) {
  hideWinnerBox(); // Skjul tidligere vinnervisning
  const file = event.target.files[0];
  if (!file?.name.endsWith(".xlsx")) {
    showMessage("Ingen fil valgt. Vennligst velg en gyldig .xlsx-fil.");
    return;
  }
  console.log("Excel-fil lastet opp");

  const reader = new FileReader();
  reader.onload = (e) => processXLSXData(e.target.result);
  reader.onerror = () => showMessage("Feil ved lesing av filen. Prøv en annen fil.");
  reader.readAsArrayBuffer(file);
}

// Behandler Excel-data: konverterer filen til JSON, sjekker data og bygger tabellen
function processXLSXData(arrayBuffer) {
  try {
    const jsonData = convertXLSXToJson(arrayBuffer);
    if (!jsonData || jsonData.length === 0) {
      showMessage("Filen inneholder ingen data. Vennligst velg en annen fil.");
      return;
    }
    const headers = jsonData[0]; // Første rad med overskrifter
    const dateColumns = headers.slice(-2); // De to siste antas å være datoer
    if (dateColumns.length < 2) {
      showMessage("Tabellen må inneholde minst 1 kolonne med forrige dato.");
      return;
    }
    updateTableHeaders(dateColumns);
    populateTable(jsonData, headers, dateColumns);

    // Kall funksjonen for å deaktivere redigering av "total til forrige runde"
    disableEditingPreviousTotals();

  } catch (error) {
    console.error("Feil ved analyse av XLSX-fil:", error);
    showMessage("Feil ved analyse av XLSX-fil, vennligst prøv igjen.");
    return;
  }
}


// Konverterer XLSX-fil (arrayBuffer) til JSON med SheetJS
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

// Oppdaterer tabellens overskrifter med de to siste datoene fra filen
function updateTableHeaders(dateColumns) {
  const headerCells = document.querySelectorAll("thead th");
  if (headerCells.length > 2) {
    headerCells[1].textContent = dateColumns[0];
    headerCells[2].textContent = dateColumns[1];
  }
}

// Fyller tabellen med data fra Excel-filen
// Hopper over første rad (overskrifter) og lager nye rader for resten
function populateTable(jsonData, headers, dateColumns) {
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = ""; // Tøm tidligere innhold
  jsonData.slice(1).forEach(row => {
    const name = row[0]?.trim() || "";
    if (!name) {
      console.warn("Hopper over tom rad.");
      return;
    }
    // Henter forrige total basert på indeksene til datoene i headeren
    const prevTotal1 = row[headers.indexOf(dateColumns[0])] || 0;
    const prevTotal2 = row[headers.indexOf(dateColumns[1])] || 0;
    tableBody.appendChild(createRow(name, prevTotal1, prevTotal2));
  });
}

// Oppretter en ny rad med standardverdier og placeholder-tekst
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

// Oppdaterer totalsummen for hver rad (kast 1 + kast 2 + bonus)
// Bonus gis dersom minst ett kastfelt har innhold (selv om det er "0")
function updateTotalSum() {
  document.querySelectorAll("tbody tr").forEach(row => {
    const totalCell = row.querySelector(".row-total");
    if (!totalCell) return;
    const dartCells = row.querySelectorAll(".dart-kast");

    const kast1 = parseInt(dartCells[0]?.textContent.trim()) || 0;
    const kast2 = parseInt(dartCells[1]?.textContent.trim()) || 0;
    const bonus = (dartCells[0]?.textContent.trim() !== "" || dartCells[1]?.textContent.trim() !== "") ? 2 : 0;

    totalCell.textContent = kast1 + kast2 + bonus;
  });
}

// Global variabel for å hindre samtidige tilbakestillinger
let dartResetInProgress = false;

// Nullstiller dart-tabellen for en ny runde
// Fjerner innhold fra celler med "dart-kast" og totalcellen, men beholder navnecellen
function resetTableForNewRound() {
  dartResetInProgress = true;
  const resetButton = document.getElementById("nyTavleButton");
  if (resetButton) resetButton.disabled = true;
  hideWinnerBox();

  try {
    const rows = document.querySelectorAll("tbody tr");

    // Dersom ingen rader finnes, er tabellen allerede tom
    if (!rows.length) {
      showMessage("Tabellen er allerede tom.");
      return;
    }

    // Sjekk om alle celler med "dart-kast" allerede er tomme
    const alreadyReset = Array.from(rows).every(row =>
      Array.from(row.querySelectorAll(".dart-kast")).every(cell => cell.textContent.trim() === "")
    );

    if (alreadyReset) {
      showMessage("Tabellen er allerede tom.");
      return;
    }

    // Nullstill celler med "dart-kast" og totalcellen for hver rad
    rows.forEach(row => {
      row.querySelectorAll(".dart-kast").forEach(cell => cell.textContent = "");
      const rowTotal = row.querySelector(".row-total");
      if (rowTotal) rowTotal.textContent = "";
    });

    updateTotalSum();
  } catch (error) {
    console.error("Feil under tilbakestilling av dart-tabellen:", error);
    showMessage("En feil oppstod under tilbakestilling. Vennligst prøv igjen.");
  } finally {
    dartResetInProgress = false;
    if (resetButton) resetButton.disabled = false;
  }
}

// Legger til en ny spiller ved å opprette en ny rad
function addNewPlayer() {
  document.querySelector("tbody").appendChild(createRow());
}

// Returnerer dagens dato som en streng i formatet MM/DD/YY
function getCurrentDateHeader() {
  return new Date().toLocaleDateString('en-US', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit'
  });
}

// Bygger data for nedlasting av dart-tabellen
// Henter de tre første kolonnene (Navn, Forrige Total 1 og 2) og legger til en ny kolonne med dagens total
function buildDownloadData() {
  const table = document.querySelector(".table");
  if (!table) {
    showMessage("Tabellen er ikke tilgjengelig. Vennligst last opp en fil.");
    return null;
  }
  const headerRow = table.querySelector("thead tr");
  if (!headerRow) {
    showMessage("Ingen overskrifter funnet.");
    return null;
  }

  const headers = [];
  const headerCells = headerRow.querySelectorAll("th");
  headers.push(headerCells[0] ? headerCells[0].innerText : "Navn");
  headers.push(headerCells[1] ? headerCells[1].innerText : "Forrige Total 1");
  headers.push(headerCells[2] ? headerCells[2].innerText : "Forrige Total 2");
  headers.push(getCurrentDateHeader());

  const data = [];
  data.push(headers);

  const rows = table.querySelectorAll("tbody tr");
  rows.forEach(row => {
    const cells = row.querySelectorAll("td, th");
    const firstCellText = cells[0] ? cells[0].innerText.trim() : "";
    if (!firstCellText) return;
    const newRow = [];
    newRow.push(cells[0] ? cells[0].innerText : "");
    newRow.push(cells[1] ? cells[1].innerText : "");
    newRow.push(cells[2] ? cells[2].innerText : "");
    newRow.push(cells[5] ? cells[5].innerText : "0");
    data.push(newRow);
  });
  return data;
}

// Laster ned dart-tabellen som en Excel-fil med 4 kolonner:
// Navn, Forrige Total 1, Forrige Total 2 og dagens total (overskrift = dagens dato)
function downloadXLSX() {
  const data = buildDownloadData();
  if (!data) return;
  if (data.length < 2) {
    showMessage("Tabellen er tom. Vennligst last opp en fil.");
    return;
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), "Darttavle");
  XLSX.writeFile(wb, "Darttavle.xlsx");
}

// Oppdaterer totalsummen og viser vinneren for sesongen
function saveTableData() {
  if (!document.querySelector("tbody tr")) {
    showMessage("Kan ikke lagre data. Det er ingen spillere i tabellen.");
    return;
  }

  if (!validateTableData()) {
    // Hvis validering feiler, ikke kjør videre
    return;
  }
  updateTotalSum();
  displayWinner();
  console.log("Data lagret og total sum oppdatert for kast 1 og kast 2");
}

// Kalkulerer og viser spilleren med høyest poengsum
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
    const name = row.querySelector("th")?.textContent.trim();
    const score = parseInt(row.querySelector(".row-total")?.textContent) || 0;
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

// Skjuler vinnerboksen
function hideWinnerBox() {
  const winnerBox = document.querySelector(".winner-box");
  if (winnerBox) {
    winnerBox.style.display = "none";
  }
}

// Viser en feilmelding i 3 sekunder
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
