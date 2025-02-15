document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".contact-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            question: form.question.value.trim(),
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/nysc_church/api/api/contact-form/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire("Success", result.message, "success");
                form.reset();
            } else {
                Swal.fire("Error", result.message, "error");
            }
        } catch (error) {
            Swal.fire("Error", "Something went wrong!", "error");
        }
    });
});
