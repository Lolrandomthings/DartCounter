document.getElementById("LagreButton").addEventListener("click", function() {
    // Get table element
    let table = document.getElementById("table-responsive");
    if (!table) {
        console.error("Table element not found!");
        return; // Exit if the table is not found
    }

    let rows = table.getElementsByTagName("tr");

    // Initialize CSV content
    let csvContent = "";

    // Loop through rows and construct CSV data
    for (let i = 0; i < rows.length; i++) {
        let cols = rows[i].cells; // Use cells to get <th> and <td> only
        let rowArray = [];

        for (let j = 0; j < cols.length; j++) {
            // Add column data and escape commas and quotes if needed
            let cellData = cols[j].innerText;
            cellData = '"' + cellData.replace(/"/g, '""') + '"';
            rowArray.push(cellData);
        }

        // Join the data and add a new line
        csvContent += rowArray.join(",") + "\n";
    }

    // Check if CSV content is empty
    if (csvContent.trim() === "") {
        console.warn("No data found in the table to export.");
        return; // Exit if there is no data
    }

    // Create a Blob and a link to download the CSV
    let blob = new Blob([csvContent], { type: "text/csv" });
    let link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "table_data.csv"; // Filename for download

    // Append the link to the body to enable download in Firefox
    document.body.appendChild(link);
    link.click();

    // Clean up and remove the link
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
});
