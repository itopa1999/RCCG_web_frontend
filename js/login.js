document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.login-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const form = this;

        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated'); // This will show the validation messages
            return;
        }
        
        const formData = new FormData(form);

        // Send the login request
        fetch('https://lucky1999.pythonanywhere.com/admins/api/login/', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData.entries())), // Convert form data to JSON
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {            
            if (response.status===200) {
                return response.json().then(data => {
                    
                    Swal.fire("Success", "login successful", "success");
                    localStorage.setItem('nysc_token', data.access);
                    window.location.href = 'index.html';
                });
            } else if (response.status === 400) {
                return response.json().then(data => {
                    Swal.fire("Error", data.detail, "error");
                });
            } else {
                Swal.fire("Error", "'An error occurred. Please try again later.", "error");
                // Handle other error statuses
            }
        }).catch(error => {
            Swal.fire("Error", "Server is not responding. Please try again later", "error");
                console.error('Server is not responding. Please try again later.');
        });
        
    });

    

});
