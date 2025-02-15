document.addEventListener('DOMContentLoaded', function() {

    const token = localStorage.getItem('nysc_token');
    if (!token) {
        alert("You don't have access to view this page");
        window.location.href = 'index.html';
        return;
    }

    function fetchSession() {
        fetch("https://lucky1999.pythonanywhere.com/nysc_church/api/list/session/", {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
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
            const sessionsContainer = document.getElementById("sessionsContainer");
            sessionsContainer.innerHTML = ""; // Clear previous content

            data.results.forEach(session => {
                const card = document.createElement("div");
                card.className = "col-md-3";

                card.innerHTML = `
                    <div class="card shadow-sm border-${session.active ? 'success' : 'danger'}">
                        <div class="card-body">
                            <h5 class="card-title">Batch: ${session.batch}</h5>
                            <p class="card-text">Stream: ${session.stream}</p>
                            <p class="card-text">Year: ${session.year}</p>
                            <div class="form-check form-switch">
                                <input class="form-check-input toggle-active" type="checkbox" ${session.active ? 'checked' : ''} data-id="${session.id}">
                                <label class="form-check-label">${session.active ? 'Active' : 'Inactive'}</label>
                            </div>
                        </div>
                    </div>
                `;

                sessionsContainer.appendChild(card);
            });

            // Add event listener to toggle switches
            document.querySelectorAll(".toggle-active").forEach(toggle => {
                toggle.addEventListener("change", function() {
                    const sessionId = this.getAttribute("data-id");
                    const newStatus = this.checked;

                    updateSessionStatus(sessionId, newStatus);
                });
            });

        })
        .catch(error => {
            console.error("Error fetching session:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: "Failed to load session data.",
            });
        });

    }


    function updateSessionStatus(sessionId, newStatus) {
        fetch(`https://lucky1999.pythonanywhere.com/nysc_church/api/mark/session/active?id=${sessionId}`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ active: newStatus })
        })
            .then( async response => {
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
                return await response.json();
            })
            .then(data => {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: data.message || 'Successful!',
            })
            fetchSession();
        })
        .catch(error => {
            console.error("Error updating session:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text:"Failed to update session.",
            });
            fetchSession()
        });
    }


    const form= document.querySelector('.addSession')
    form.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const formData = {
            year: form.year.value.trim(),
            batch: form.batch.value.trim(),
            stream: form.stream.value.trim(),
            active: form.active.checked ? "yes" : "no",
        };
        
        
        fetch('https://lucky1999.pythonanywhere.com/nysc_church/api/api/add/session/', {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then( async response => {
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
            return await response.json();
        })
    .then(data => {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: data.message || 'Successful!',
            })
            form.reset();
            console.log('Success:', data);
            fetchSession()
        })
        .catch(error => {
           
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text:"There was an error submitting the form.",
            });
        });
    });

    
    fetchSession()



    document.getElementById("#addSessionForm").addEventListener("click", function() {
		
        // Show the card with fade-in effect
        let card = document.getElementById("addSessionForm");
        card.style.display = "block";
        card.style.opacity = 1;
        card.style.transition = "opacity 0.5s ease";
    });

  
    document.getElementById('select1').addEventListener('change', function() {
        let batch = this.value;
        let streamSelect = document.getElementById('select2');
        
        // Clear current options
        streamSelect.innerHTML = '<option value="">Select Session Stream</option>';
        
        let streamOptions = [];
        
        // Define streams based on batch selection
        if (batch === 'Batch A') {
            streamOptions = [
                { value: 'Stream A1', text: 'Stream A1' },
                { value: 'Stream A2', text: 'Stream A2' }
            ];
        } else if (batch === 'Batch B') {
            streamOptions = [
                { value: 'Stream B1', text: 'Stream B1' },
                { value: 'Stream B2', text: 'Stream B2' }
            ];
        } else if (batch === 'Batch C') {
            streamOptions = [
                { value: 'Stream C1', text: 'Stream C1' },
                { value: 'Stream C2', text: 'Stream C2' }
            ];
        }

        // Populate the stream dropdown with relevant options
        streamOptions.forEach(function(option) {
            let opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            streamSelect.appendChild(opt);
        });
    });
				

    



})
