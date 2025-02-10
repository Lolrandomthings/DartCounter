/**
 Lager tabellhodet (thead) for sesongoppsummeringstabellen
 Den lager en rad med kolonneoverskrifter: "Navn", 
 deretter én for hver dato (fra Excel-dataen) og til slutt "Sammenlagt poeng"
 */
function createTableHead(headers) {
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    // Første kolonne: Navn
    let th = document.createElement("th");
    th.textContent = "Navn";
    headerRow.appendChild(th);

    // Legger til en kolonne for hver dato (forutsetter at Excel-overskriftene starter på index 1)
    for (let i = 1; i < headers.length; i++) {
        th = document.createElement("th");
        th.textContent = headers[i]; 
        headerRow.appendChild(th);
    }

    // Ekstra kolonne for "Sammenlagt poeng"
    th = document.createElement("th");
    th.textContent = "Sammenlagt poeng";
    headerRow.appendChild(th);

    thead.appendChild(headerRow);
    return thead;
}

/**
Lager en tabellrad (tr) for en enkelt spiller.
Den fyller ut celler med spillerens navn, poeng for hver dato
og beregner til slutt den totale poengsummen.
 */
function createTableRow(rowData, headers) {
    const tr = document.createElement("tr");

    // Celle for spillerens navn (forventer at navnet er i første kolonne)
    let td = document.createElement("td");
    td.textContent = rowData[0] || "";
    tr.appendChild(td);

    let seasonSum = 0; // Variabel for å summere alle poeng for denne spilleren

    // For hver dato-kolonne (fra index 1 til siste) hentes poengene
    for (let i = 1; i < headers.length; i++) {
        td = document.createElement("td");
        // Konverterer til tall; hvis det ikke er et gyldig tall, brukes 0
        const score = parseInt(rowData[i]) || 0;
        td.textContent = score;
        seasonSum += score;
        tr.appendChild(td);
    }

    // Celle for sammenlagt poeng (totalen)
    td = document.createElement("td");
    td.textContent = seasonSum;
    tr.appendChild(td);

    return tr;
}

/*
 Genererer hele sesongoppsummeringstabellen basert på Excel-dataen.
 Dataen forventes å være en array der den første raden er overskriftene, og hver påfølgende rad inneholder en spillers data.
 */
function generateSeasonSummaryTable(jsonData) {
    if (!jsonData || jsonData.length < 1) {
        console.error("Data mangler eller er ugyldig.");
        return;
    }

    // Hent overskriftene fra første rad
    const headers = jsonData[0];
    // Opprett tabell-elementet
    const table = document.createElement("table");
    table.className = "season-summary-table";

    // Legg til tabellhodet
    table.appendChild(createTableHead(headers));

    // Opprett tabellens kropp (tbody)
    const tbody = document.createElement("tbody");
    // Gå gjennom alle spillerradene (starter på index 1)
    for (let i = 1; i < jsonData.length; i++) {
        const tr = createTableRow(jsonData[i], headers);
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    return table;
}
