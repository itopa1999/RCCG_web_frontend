document.addEventListener('DOMContentLoaded', function() {

    
    fetch('https://lucky1999.pythonanywhere.com/nysc_church/api/get/session/') // Adjust the API endpoint if needed
        .then(response => response.json())
        .then(data => {
            if (data) {
                document.querySelector('input[name="batch"]').value = data.batch || "N/A";
                document.querySelector('input[name="stream"]').value = data.stream || "N/A";
                document.querySelector('input[name="year"]').value = data.year || "N/A";
            }
        })
        .catch(error => console.error('Error fetching session data:', error));

        const form = document.querySelector('.attendance-form');

        form.addEventListener('submit', function (event) {
            event.preventDefault();
    
            Swal.fire({
                title: "Submit Form?",
                text: "Are you sure you want to proceed?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, submit!",
            }).then((result) => {
                if (result.isConfirmed) {
                    const formData = new FormData(form);                    

                // Send data to backend
                fetch('https://lucky1999.pythonanywhere.com/nysc_church/api/create/attendance/', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: form.querySelector('[name="name"]').value,
                        phone: form.querySelector('[name="phone"]').value,
                        batch: form.querySelector('[name="batch"]').value,
                        stream: form.querySelector('[name="stream"]').value,
                        year: form.querySelector('[name="year"]').value,
                        state_code: form.querySelector('[name="state_code"]').value,

                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json().then(data => ({ status: response.ok, body: data })))
                .then(data => {
                         
                    if (data.status) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: data.body.message || 'Successful!',
                        }).then(() => {
                            form.reset();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: data.body.detail || 'Something went wrong. Try again!',
                        });
                    }
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Failed to submit form. Check your connection!',
                    });
                });
                }
            });
    


        });


})