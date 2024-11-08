function saveTableData() {
    let rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        if (!row.hasAttribute("data-saved")) {
            const playerName = row.querySelector("th").textContent.trim();
            const kast1 = parseInt(row.querySelector("td:nth-child(2)").textContent.trim()) || 0;
            const kast2 = parseInt(row.querySelector("td:nth-child(3)").textContent.trim()) || 0;
            const totalSum = kast1 + kast2 + 2; // Legg til +2 bonus her for lagring

            const data = {
                navn: playerName,
                kast1: kast1,
                kast2: kast2,
                total_sum: totalSum // Send totalsummen med bonus til serveren
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
                openPopup('Data har blitt lagret!'); // Vis pop-up
                displayBestScore(); // Vis den beste poengsummen etter lagring
            })
            .catch(error => console.error('Feil:', error));
        }
    });

    console.log("Data er lagret");
}

// Funksjon for å finne og vise spilleren med beste poengsum
function displayBestScore() {
    let rows = document.querySelectorAll("tbody tr");
    let bestScore = 0;
    let bestPlayer = "";

    // Gå gjennom hver rad for å finne spilleren med høyeste poengsum
    rows.forEach(row => {
        const playerName = row.querySelector("th").textContent.trim();
        const kast1 = parseInt(row.querySelector("td:nth-child(2)").textContent.trim()) || 0;
        const kast2 = parseInt(row.querySelector("td:nth-child(3)").textContent.trim()) || 0;
        const totalScore = kast1 + kast2 + 2; // Inkluder +2 bonus

        if (totalScore > bestScore) {
            bestScore = totalScore;
            bestPlayer = playerName;
        }
    });

    // Vis den beste poengsummen i bestScoreBox
    const bestScoreBox = document.getElementById("bestScoreBox");
    if (bestPlayer) {
        bestScoreBox.textContent = `${bestPlayer} fikk best poengsum med ${bestScore} poeng!`;
        bestScoreBox.style.display = "block"; // Gjør boksen synlig
    } else {
        bestScoreBox.textContent = "Ingen spillere med poeng enda.";
        bestScoreBox.style.display = "block";
    }
}

// Globale popup-funksjoner
function openPopup(message) {
    const popupOverlay = document.getElementById('popupOverlay');
    const alertMessage = document.getElementById('alertMessage');
    if (popupOverlay && alertMessage) { // Sjekk om elementer finnes
        alertMessage.textContent = message; // Sett tilpasset melding
        popupOverlay.style.display = 'block';
    } else {
        console.error('Popup-elementer ikke funnet.');
    }
}

function closePopupFunc() {
    const popupOverlay = document.getElementById('popupOverlay');
    if (popupOverlay) {
        popupOverlay.style.display = 'none';
    }
}

// Event listener for lukkeknappen
document.addEventListener('DOMContentLoaded', function () {
    const closePopup = document.getElementById('closePopup');
    if (closePopup) {
        closePopup.addEventListener('click', closePopupFunc);
    } else {
        console.error("closePopup-knappen ikke funnet i DOM.");
    }
});

document.getElementById("nyTavleButton").addEventListener("click", function () {
    const button = this;
    button.disabled = true; // Deaktiver knappen for å forhindre flere klikk

    // Gjør en POST-forespørsel for å opprette en ny runde i backend
    fetch('/api/create_new_round', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Ny rundetabell opprettet:", data.table_name);

        // Gå til hovedspillsiden (index.html eller din hovedspillside)
        window.location.href = "/"; // Juster om hovedsiden har et annet navn
    })
    .catch(error => console.error('Feil ved oppretting av ny runde:', error))
    .finally(() => {
        setTimeout(() => { button.disabled = false; }, 2000); // Aktiver etter 2 sekunder
    });
});

// Funksjon for å sjekke om `newRound=true` finnes i URL-en
function isNewRound() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('newRound') === 'true';
}

// Nullstill tabellen med en tom rad for en ny runde
function resetTableForNewRound() {
    let tbody = document.querySelector("tbody");

    // Fjern eksisterende rader og legg til en tom rad
    tbody.innerHTML = `
        <tr id="poenger-rad1">
            <th contenteditable="" class="editable" data-placeholder="Legg til et navn"></th>
            <td contenteditable="" class="editable" data-placeholder="0"></td>
            <td contenteditable="" class="editable" data-placeholder="0"></td>
            <td class="row-total">0</td>
        </tr>
    `;

    // Oppdater eventuelle summer eller annen info om nødvendig
    updateTotalSum();
    console.log("Tabell nullstilt for ny runde");
}

window.onload = function () {
    // Sjekk om dette er en ny runde og nullstill tabellen om nødvendig
    if (isNewRound()) {
        resetTableForNewRound();
    } else {
        loadTableData();
    }

    updateTotalSum();
    displayCurrentDate();

    const saveButton = document.getElementById("lagreButton");
    const addPlayerButton = document.getElementById("addPlayer");

    // Legg til event listener for "lagreButton" kun én gang
    if (saveButton) {
        saveButton.addEventListener("click", function () {
            saveTableData();
            updateTotalSum();
            openPopup("Dataene er lagret"); // Erstatt standardvarsel med pop-up
        });
    } else {
        console.error("lagreButton ikke funnet på siden.");
    }

    // Legg til event listener for "addPlayer" kun én gang
    if (addPlayerButton) {
        addPlayerButton.addEventListener("click", function () {
            let tbody = document.querySelector("tbody");
            let newRow = createRow();
            tbody.appendChild(newRow);
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
        let rowTotal = throw1 + throw2 + 2; // Legg til +2 bonus automatisk

        console.log(`Spillerrad: ${row.querySelector("th").textContent.trim()}`);
        console.log(`Kast 1: ${throw1}, Kast 2: ${throw2}, Total med Bonus: ${rowTotal}`);

        // Oppdater totalen i raden for visning
        row.querySelector(".row-total").textContent = rowTotal;
    });
}

// Funksjon for å håndtere filopplasting og analysere kun .xlsx-filer
document.getElementById("uploadCSV").addEventListener("change", function (event) {
    let file = event.target.files[0];
    if (file && file.name.endsWith(".xlsx")) {
        let reader = new FileReader();
        reader.onload = function (e) {
            parseXLSX(e.target.result); // Send ArrayBuffer til parseXLSX
        };
        reader.readAsArrayBuffer(file); // Les som ArrayBuffer for XLSX
    } else {
        console.error("Ugyldig filtype. Vennligst last opp en XLSX-fil.");
    }
});

// Funksjon for å analysere den opplastede .xlsx-filen og vise den i tabellen
function parseXLSX(arrayBuffer) {
    console.log("parseXLSX-funksjon kalt");

    try {
        let data = new Uint8Array(arrayBuffer);
        let workbook = XLSX.read(data, { type: "array" });
        let firstSheetName = workbook.SheetNames[0];
        let worksheet = workbook.Sheets[firstSheetName];

        // Konverter regneark til JSON-array
        let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0 });
        console.log("Analysert JSON Data:", jsonData); // Logg for å inspisere datastruktur

        let tableBody = document.querySelector("tbody");
        if (!tableBody) {
            console.error("Tabellkropp-element ikke funnet.");
            return;
        }

        tableBody.innerHTML = ""; // Fjern eksisterende rader

        // Behandle kun rader som har gyldige data i forventede kolonner
        jsonData.slice(1).forEach((row) => {
            if (
                typeof row[0] === 'string' && row[0].trim() !== '' && // Navn er ikke tomt
                !isNaN(row[1]) && !isNaN(row[2]) && !isNaN(row[3])    // Poengsummer er numeriske
            ) {
                let newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <th contenteditable="">${row[0]}</th>
                    <td contenteditable="">${row[1]}</td>
                    <td contenteditable="">${row[2]}</td>
                    <td class="row-total">${row[3]}</td>
                `;
                tableBody.appendChild(newRow);
                console.log(`Rad lagt til i tabell: ${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}`);
            } else {
                console.warn("Hopper over ugyldig eller tom rad:", row);
            }
        });

        updateTotalSum(); // Forutsatt at denne funksjonen beregner totalsummer
    } catch (error) {
        console.error("Feil ved analyse av XLSX-fil:", error);
    }
}

// Funksjon for å laste ned tabelldata som en .xlsx-fil
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

// Bruk DOMContentLoaded for å sette opp event listeners for knappene
document.addEventListener("DOMContentLoaded", function () {
    const downloadButton = document.getElementById("downloadCSVButton");

    if (downloadButton) {
        downloadButton.addEventListener("click", downloadXLSX);
    } else {
        console.error("downloadCSVButton ikke funnet i DOM.");
    }
});

document.getElementById("uploadCSV").addEventListener("change", function (event) {
    const fileStatus = document.getElementById("fileStatus");
    if (event.target.files.length === 0) {
        // Hvis ingen fil ble valgt (avbrutt), vis "Ingen fil valgt"
        fileStatus.style.display = "inline";
    } else {
        // Hvis en fil ble valgt, skjul teksten "Ingen fil valgt"
        fileStatus.style.display = "none";
    }
});
