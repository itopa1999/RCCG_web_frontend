document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('nysc_token');
    if (!token) {
        alert("You don't have access to view this page");
        window.location.href = 'index.html';
        return;
    }

    let currentPage = 1;
    let selectedYear = "";
    let selectedBatch = "";
    let selectedStream = "";
    let searchQuery = "";
    let dateQuery = "";

    function fetchAttendances() {
        let url = `https://lucky1999.pythonanywhere.com/nysc_church/api/list/attendance/?page=${currentPage}`;

        // Append filters if available
        if (selectedYear) url += `&year=${selectedYear}`;
        if (selectedBatch) url += `&batch=${selectedBatch}`;
        if (selectedStream) url += `&stream=${selectedStream}`;
        if (searchQuery) url += `&search=${searchQuery}`;
        if (dateQuery) url += `&date=${dateQuery}`;

        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.status === 401) {
                // Handle Unauthorized error
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "Unauthorized Access. Redirecting to login.",
                });
                window.location.href = 'index.html';
                return null;  // Stop further execution
            } 
            else if (response.status === 400) {
                // Handle Bad Request error
                return response.json().then(errorData => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: errorData.message || "Bad request",
                    });
                    return null;  // Stop further execution
                });
            }
            else if (!response.ok) {
                // Handle any other errors
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "Network response was not ok.",
                });
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                displayData(data.results);
                handlePagination(data.next, data.previous);
                
                document.getElementById("downloadCSV").addEventListener("click", function () {
                    downloadCSV(data.results);
                });
        
                let counter = document.getElementById("counter");
                counter.innerHTML = `Attendances List (${data.results.length})`;
            }
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "Failed to load data.",
            });
        });

    }
        
    function displayData(data) {
        let tableBody = document.getElementById("nyscTableBody");
        

        // Clear existing table rows
        tableBody.innerHTML = "";

        // Loop through data and add rows
        data.forEach((member, index) => {
            let row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${member.name}</td>
                    <td>${member.phone}</td>
                    <td>${member.batch}</td>
                    <td>${member.stream}</td>
                    <td>${member.year}</td>
                    <td>${member.state_code}</td>
                    <td>${new Date(member.date).toLocaleDateString()}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    function handlePagination(nextPage, previousPage) {
        const nextButton = document.getElementById("nextButton");
        const prevButton = document.getElementById("prevButton");

        nextButton.disabled = !nextPage;
        prevButton.disabled = !previousPage;

        nextButton.onclick = () => {
            if (nextPage) {
                currentPage++;
                fetchAttendances();
            }
        };

        prevButton.onclick = () => {
            if (previousPage) {
                currentPage--;
                fetchAttendances();
            }
        };
    }

    // Fetch session options
    fetch("https://lucky1999.pythonanywhere.com/nysc_church/api/list/session/", {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "Network response was not ok",
            });
            return null;
        }
        return response.json();
    })
        .then(data => {
            let sessions = data.results;
            let select = document.getElementById("sessionSelect");
            sessions.forEach(session => {
                let option = document.createElement("option");
                option.value = `${session.year},${session.batch},${session.stream}`;
                option.textContent = `${session.year} ${session.batch} ${session.stream}`;
                select.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching sessions:", error));

    // **Filter on session change**
    document.getElementById("sessionSelect").addEventListener("change", function () {
        let selectedValue = this.value;  
        if (selectedValue) {
            [selectedYear, selectedBatch, selectedStream] = selectedValue.split(",");
        } else {
            selectedYear = selectedBatch = selectedStream = "";
        }
        fetchAttendances();  // Refresh data with new filters
    });

    // **Filter on search input**
    document.getElementById("searchInput").addEventListener("input", function () {
        searchQuery = this.value.trim();
        fetchAttendances();  // Refresh data with search filter
    });

    document.getElementById("dateInput").addEventListener("input", function () {
        dateQuery = this.value.trim();
        fetchAttendances();  // Refresh data with search filter
    });


    function downloadCSV(data) {
        if (!Array.isArray(data) || data.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "No data available.",
            });
            return; // Exit the function early if data is invalid or empty
        }
        else{

        let wb = XLSX.utils.book_new();
        let ws_data = [];

        // Add a title row (merged across the table)
        ws_data.push(["LOGEC CHURCH"]);

        // Add a description row (merged across the table)
        let sessionData = data[0];
        let sessionTitle = `${sessionData.year} ${sessionData.batch} ${sessionData.stream} Attendance`;
        ws_data.push([sessionTitle]);

        // Define headers
        let headers = ["#", "Name", "Phone", "Batch", "Stream", "Year", "State Code", "Date"];
        ws_data.push(headers);

        // Add data
        data.forEach((member, index) => {
            let formattedDate = new Date(member.date).toLocaleDateString();
            ws_data.push([
                index + 1, 
                member.name, 
                member.phone, 
                member.batch, 
                member.stream, 
                member.year, 
                member.state_code, 
                formattedDate  // Last column (Date)
            ]);
        });

        let ws = XLSX.utils.aoa_to_sheet(ws_data);

        // Merge first row (LOGEC CHURCH)
        if (!ws["!merges"]) ws["!merges"] = [];
        ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });

        // Merge second row (Session Info)
        ws["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } });

        // Define styles
        const boldCenterStyle = { 
            font: { bold: true }, 
            alignment: { horizontal: "center" }
        };

        // Apply bold and center alignment to title (first row)
        for (let C = 0; C < headers.length; C++) {
            let cellAddress = XLSX.utils.encode_cell({ r: 0, c: C }); // Title row (LOGEC CHURCH)
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = boldCenterStyle;  // Apply bold and center alignment
        }

        // Apply bold and center alignment to description (second row)
        for (let C = 0; C < headers.length; C++) {
            let cellAddress = XLSX.utils.encode_cell({ r: 1, c: C }); // Description row
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = boldCenterStyle;  // Apply bold and center alignment
        }

        // Apply bold formatting to headers
        let range = XLSX.utils.decode_range(ws["!ref"]);
        for (let C = range.s.c; C <= range.e.c; C++) {
            let cellAddress = XLSX.utils.encode_cell({ r: 2, c: C }); // Headers are now on row 2 (index 2)
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = { font: { bold: true } };  // Apply bold style
        }

        // Apply bold formatting to the last column (Date)
        for (let R = 0; R <= range.e.r; R++) {
            let cellAddress = XLSX.utils.encode_cell({ r: R, c: range.e.c }); // Last column (Date)
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = { font: { bold: true } };  // Apply bold style
        }

        XLSX.utils.book_append_sheet(wb, ws, "Attendance");

        // Export file
        XLSX.writeFile(wb, "Attendances_List.xlsx");

    }

    
        // // Define CSV headers
        // const headers = ["Name", "Email", "Phone", "Batch", "Stream", "Year", "State Code", "DOB", "Department", "Date"];
        
        // // Convert data to CSV format
        // const csvRows = [];
        // csvRows.push(headers.join(","));  // Add headers
        
        // data.forEach(member => {
        //     const row = [
        //         member.name,
        //         member.email || "N/A",
        //         member.phone,
        //         member.batch,
        //         member.stream,
        //         member.year,
        //         member.state_code,
        //         member.dob,
        //         member.department,
        //         new Date(member.date).toLocaleDateString()
        //     ].join(",");
        //     csvRows.push(row);
        // });
    
        // const csvString = csvRows.join("\n");
    
        // // Create a Blob and trigger the download
        // const blob = new Blob([csvString], { type: "text/csv" });
        // const url = URL.createObjectURL(blob);
        // const a = document.createElement("a");
        // a.href = url;
        // a.download = "new_comers.csv";
        // document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);
    }

    fetchAttendances();  // Initial data load
});
