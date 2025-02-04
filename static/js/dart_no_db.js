document.getElementById("uploadCSV").addEventListener("change", function (event) {
    let file = event.target.files[0];
    if (!file || !file.name.endsWith(".xlsx")) {
        console.error("Ugyldig filtype. Last opp en XLSX-fil.");
        return;
    }

    let formData = new FormData();
    formData.append("file", file);

    fetch("/upload_excel", {
        method: "POST",
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("Error:", data.error);
        } else {
            displayTableData(data.data);
        }
    })
    .catch(error => console.error("laster error:", error));
});

function displayTableData(data) {
    let tableBody = document.querySelector("tbody");
    tableBody.innerHTML = ""; // Clear existing table

    data.forEach(row => {
        let newRow = document.createElement("tr");
        newRow.innerHTML = `
            <th contenteditable="">${row.Name}</th>
            <td contenteditable="">${row.Throw1}</td>
            <td contenteditable="">${row.Throw2}</td>
            <td class="row-total">${row.Total}</td>
        `;
        tableBody.appendChild(newRow);
    });
}

// Download function for saving Excel files
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

document.addEventListener("DOMContentLoaded", function () {
    const downloadButton = document.getElementById("downloadCSVButton");
    if (downloadButton) {
        downloadButton.addEventListener("click", downloadXLSX);
    }
});
