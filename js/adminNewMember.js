document.addEventListener('DOMContentLoaded', function() {

    const token = localStorage.getItem('nysc_token');
    if (!token) {
        alert("You don't have access to view this page");
        window.location.href = 'index.html';
        return;
    }

    let currentPage = 1;

    function fetchNewComers(){
        fetch(`http://127.0.0.1:8000/nysc_church/api/list/newComers/?page=${currentPage}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (!response.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: "Network response was not ok",
                });
            }
            return response.json();
        })

        .then(data => { 
            console.log(data)
            displayData(data.results);
            handlePagination(data.next, data.previous);
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


function displayData(data){
    let tableBody = document.getElementById("nyscTableBody");
        let counter = document.getElementById("counter");
        
        // Update counter
        counter.innerHTML = `New Members List (${data.length})`;

        // Clear existing table rows
        tableBody.innerHTML = "";

        // Loop through data and add rows
        data.forEach((member, index) => {
            let row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${member.name}</td>
                    <td>${member.email || "N/A"}</td>
                    <td>${member.phone}</td>
                    <td>${member.batch}</td>
                    <td>${member.stream}</td>
                    <td>${member.year}</td>
                    <td>${member.state_code}</td>
                    <td>${member.dob}</td>
                    <td>${member.department}</td>
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
            fetchNewComers();
        }
    };

    prevButton.onclick = () => {
        if (previousPage) {
            currentPage--;
            fetchNewComers();
        }
    };
}

fetch("http://127.0.0.1:8000/nysc_church/api/list/session/", {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
    .then(response => {
        if (!response.ok) {
            console.error("Error fetching sessions:", error);
        }
        return response.json();
    })
    .then(data => { 
        console.log(data);
        let sessions = data.results;
        let select = document.getElementById("sessionSelect");
        sessions.forEach(session => {
            let option = document.createElement("option");
            option.value = `${session.year} ${session.batch} ${session.stream}`;
            option.textContent = `${session.year} ${session.batch} ${session.stream}`;
            select.appendChild(option);
        });
        })
        .catch(error => {
            console.error("Error fetching sessions:", error);
        });



        document.getElementById("sessionSelect").addEventListener("change", function() {
            let selectedValue = this.value;  // This now contains "year batch stream"
            console.log("Selected session:", selectedValue);
        
            // If you need them separately:
            let [year, batch, stream] = selectedValue.split(" ");
            console.log("Year:", year);
            console.log("Batch:", batch);
            console.log("Stream:", stream);
        });
    

fetchNewComers()


})