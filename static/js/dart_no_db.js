// Når hele HTML-dokumentet er lastet, start oppsett av event listeners
document.addEventListener("DOMContentLoaded", setupEventListeners);

// Legger til event-lyttere for diverse knapper og inputfelt.
function setupEventListeners() {
  document.getElementById("uploadCSV")?.addEventListener("change", handleFileUpload);
  document.getElementById("downloadCSVButton")?.addEventListener("click", downloadXLSX);
  document.getElementById("nyTavleButton")?.addEventListener("click", resetTableForNewRound);
  document.getElementById("addPlayer")?.addEventListener("click", addNewPlayer);
  document.getElementById("lagreButton")?.addEventListener("click", saveTableData);
}

// Håndterer opplasting av en Excel-fil (.xlsx). Skjuler vinnerboksen og viser en feilmelding dersom filen ikke er gyldig.
function handleFileUpload(event) {
  hideWinnerBox(); // Skjul vinnerboksen for ethvert nytt filvalg
  const file = event.target.files[0]; // Henter den valgte filen
  if (!file?.name.endsWith(".xlsx")) {
    showMessage("Ingen fil valgt. Vennligst velg en gyldig .xlsx-fil.");
    return;
  }
  console.log("Excel-fil lastet opp");

  const reader = new FileReader(); // Oppretter en FileReader
  reader.onload = (e) => processXLSXData(e.target.result);
  reader.onerror = () => showMessage("Feil ved lesing av filen. Prøv en annen fil.");
  reader.readAsArrayBuffer(file); // Leser filen som array buffer
}

// Behandler Excel-data og fyller tabellen med innhold. Konverterer data til JSON, sjekker gyldigheten og kaller oppdateringsfunksjoner.
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
    showMessage("Feil ved analyse av XLSX-fil, vennligst prøv igjen.");
    return;
  }
}

// Konverterer en XLSX-fil til JSON-format ved hjelp av SheetJS (XLSX).
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

// Oppdaterer overskriftene i tabellen med datoene fra filen.
function updateTableHeaders(dateColumns) {
  const headers = document.querySelectorAll("thead th");
  if (headers.length > 2) {
    headers[1].textContent = dateColumns[0];
    headers[2].textContent = dateColumns[1];
  }
}

// Fyller tabellen med data fra Excel-filen. Hopper over første rad (overskrifter) og oppretter nye rader for resten.
function populateTable(jsonData, headers, dateColumns) {
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = ""; // Tømmer eksisterende innhold
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

//Oppretter en ny rad med standardverdier og placeholder-tekster.
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



// Oppdaterer totalsummen for hver rad (kast 1 + kast 2 + bonus). Bonus gis dersom en spiller har skrevet noe (selv "0") i minst ett felt.
function updateTotalSum() {
  document.querySelectorAll("tbody tr").forEach(row => {
    const totalCell = row.querySelector(".row-total");
    if (!totalCell) return;
    const cells = row.querySelectorAll(".dart-kast");

    // Henter og trimmer tekst fra kast-cells
    const throw1Text = cells[0]?.textContent.trim();
    const throw2Text = cells[1]?.textContent.trim();

    // Konverterer til tall; blir 0 hvis tomt eller ugyldig
    const throw1 = parseInt(throw1Text) || 0;
    const throw2 = parseInt(throw2Text) || 0;

    // Gi bonus på 2 poeng dersom minst ett felt er fylt ut (selv "0")
    const bonus = (throw1Text !== "" || throw2Text !== "") ? 2 : 0;

    totalCell.textContent = throw1 + throw2 + bonus;
  });
}


// Globalt variabel for å forhindre flere samtidige tilbakestillinger for dartbordet.
let dartResetInProgress = false;

// Nullstiller dart-tabellen for en ny runde. Dette fjerner poeng for de cellene med klassen .dart-kast og nullstiller den siste cellen (radtotalen) 
// for hver rad, mens navnecellen (første celle) beholdes. Dersom tabellen allerede er tom,vises en feilmelding.
function resetTableForNewRound() {
  // Sjekk om en tilbakestilling allerede er i gang.
  if (dartResetInProgress) {
    console.log("nullstilling pågår")
    return;
  }
  dartResetInProgress = true;

  // Deaktiver tilbakestillingsknappen for å forhindre raske klikk.
  const resetButton = document.getElementById("nyTavleButton");
  if (resetButton) {
    resetButton.disabled = true;
  }

  hideWinnerBox();

  try {
    const rows = document.querySelectorAll("tbody tr");
    if (!rows || rows.length === 0) {
      showMessage("Tabellen er allerede tom.");
      return;
    }

    // Sjekk om alle dart-score-celler (med klassen .dart-kast) allerede er tomme.
    let alreadyReset = true;
    rows.forEach(row => {
      row.querySelectorAll(".dart-kast").forEach(cell => {
        if (cell.textContent.trim() !== "") {
          alreadyReset = false;
        }
      });
    });

    if (alreadyReset) {
      showMessage("Tabellen er allerede tom.");
      return;
    }

    // Fjern hver rads dart-poengceller og radtotal.
    rows.forEach(row => {
      row.querySelectorAll(".dart-kast").forEach(cell => {
        cell.textContent = ""; // Slett poengcelle.
      });
      const rowTotal = row.querySelector(".row-total");
      if (rowTotal) {
        rowTotal.textContent = ""; // Clear the total cell.
      }
    });

    // Beregn totaler på nytt (som nå skal være tomme/0)
    updateTotalSum();
  } catch (error) {
    console.error("Feil under tilbakestilling av dart-tabellen:", error);
    showMessage("En feil oppstod under tilbakestilling. Vennligst prøv igjen.");
  } finally {
    // Aktiver tilbakestillingsknappen på nytt.
    dartResetInProgress = false;
    if (resetButton) {
      resetButton.disabled = false;
    }
  }
}


// Legger til en ny spiller ved å opprette en ny rad.
function addNewPlayer() {
  document.querySelector("tbody").appendChild(createRow());
}


// Laster ned tabellen som en Excel-fil.
function downloadXLSX() {
  const table = document.querySelector(".table");
  const data = Array.from(table.querySelectorAll("tr")).map(row =>
    Array.from(row.querySelectorAll("th, td")).map(cell => cell.innerText)
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), "Darttavle");
  XLSX.writeFile(wb, "Darttavle.xlsx");
}


// Lagrer tabellens data ved å oppdatere totalsummen og vise vinneren.
function saveTableData() {
  if (!document.querySelector("tbody tr")) {
    showMessage("Kan ikke lagre data. Det er Ingen spillere i tabellen.");
    return;
  }
  updateTotalSum();
  displayWinner();
  console.log("Lagrer data og oppdaterer total sum for kast 1 og kast 2");
}


// Kalkulerer og viser hvem som har høyest poengsum.
// Viser en feilmelding dersom ingen gyldige poengsummer er funnet.
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

  // Oppdaterer vinnertexten og viser vinnerboksen
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

// Viser en feilmelding ved feil (f.eks. ved filopplasting). Feilmeldingen skjules automatisk etter 3 sekunder.
function showMessage(message) {
  const messageElement = document.getElementById("global-error");
  const textElement = document.getElementById("error-text");

  if (textElement) {
    textElement.textContent = message;
  }
  // Vis feilmeldingen
  messageElement.style.display = "flex";

  // Skjul feilmeldingen etter 3 sekunder
  setTimeout(function () {
    messageElement.style.display = "none";
  }, 3000);
}
