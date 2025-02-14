
// Deaktiverer redigering på header- og innholdscellene for "total til forrige runde"
function disableEditingPreviousTotals() {
    // Deaktiver redigering på headercellene for kolonne 2 og 3
    const headerCells = document.querySelectorAll("thead th");
    if (headerCells.length > 2) {
        headerCells[1].setAttribute("contenteditable", "false");
        headerCells[2].setAttribute("contenteditable", "false");
    }

    // Deaktiver redigering på cellene i tabellens body for de samme kolonnene
    document.querySelectorAll("tbody tr").forEach(row => {
        const cells = row.querySelectorAll("td, th");
        if (cells.length > 2) {
            cells[1].setAttribute("contenteditable", "false");
            cells[2].setAttribute("contenteditable", "false");
        }
    });
}

// Funksjon for å legge en begrensning på maks 3 sifre for celler med klassen "dart-kast"
function limitForDartKast() {
    // Hent alle celler for kastene 
    const dartCells = document.querySelectorAll(".dart-kast");

    dartCells.forEach(cell => {
        cell.addEventListener("input", function (event) {// Hent innholdet og fjern alt som ikke er siffer
            
            let numericText = event.target.textContent.replace(/\D/g, "");

            if (numericText.length > 3) {// Hvis lengden er større enn 3, kutt teksten til de 3 første sifrene
                numericText = numericText.slice(0, 3);
                // Oppdater celleinnholdet med den trimmede verdien
                event.target.textContent = numericText;
                // (Valgfritt) Vis en melding til brukeren
                showMessage("Maksimalt 3 sifre er tillatt.");
            }
        });
    });
}


// Validerer at cellene som skal inneholde tall (f.eks. dart-kast) kun har tall
function validateNumericFields() {
    let allNumbersValid = true;
    // Den antar at cellene med klassen "dart-kast" skal være et tall
    document.querySelectorAll("tbody tr .dart-kast").forEach(cell => {
        const text = cell.textContent.trim();
        // Hvis cellen ikke er tom, skal den kunne konverteres til et tall
        if (text !== "" && isNaN(text)) {
            allNumbersValid = false;
            cell.classList.add("invalid");
        } else {
            cell.classList.remove("invalid");
        }
    });
    return allNumbersValid;
}

// Validerer navnene i tabellen slik at ingen input er tomt eller likt 
function validateNames() {
    const rows = document.querySelectorAll("tbody tr");
    const names = [];
    let valid = true;

    rows.forEach(row => {
        const nameCell = row.querySelector("th"); // Forutsetter at navnet ligger i <th>-cellen
        if (nameCell) {
            const name = nameCell.textContent.trim();

            if (name === "") {// Sjekk om navnet er tomt
                valid = false;
                nameCell.classList.add("invalid");
            } else {
                // Sjekk om navnet allerede finnes
                if (names.includes(name)) {
                    valid = false;
                    nameCell.classList.add("invalid");
                } else {
                    names.push(name);
                    nameCell.classList.remove("invalid");
                }
            }
        }
    });

    return valid;
}

// Funksjon som sjekker alle valideringer før man fortsetter
function validateTableData() {
    const numericValid = validateNumericFields();
    const namesValid = validateNames();

    if (!numericValid) {
        showMessage("Et eller flere tallfelt inneholder ugyldig verdi.");
        return false;
    }

    if (!namesValid) {
        showMessage("Alle spillere må ha et navn, og navn kan ikke dupliseres.");
        return false;
    }

    return true;
}
