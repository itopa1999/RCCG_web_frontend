document.addEventListener('DOMContentLoaded', function() {

    const token = localStorage.getItem('nysc_token');
    if (!token) {
        alert("You don't have access to view this page");
        window.location.href = 'index.html';
        return;
    }

    function fetchSession() {
        fetch("http://127.0.0.1:8000/nysc_church/api/list/session/", {
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
        fetch(`http://127.0.0.1:8000/nysc_church/api/mark/session/active?id=${sessionId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ active: newStatus })
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: data.detail || "Failed to update session.",
                });
            }
            return data;
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
    
    fetchSession()
    



})

//     // Fetch branches and departments
//     fetch('https://lucky1999.pythonanywhere.com/logec/api/list/department/branch/', {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     }).then(response => response.ok ? response.json() : Promise.reject(response))
//     .then(data => {
//         branchSelect.innerHTML = '<option value="">--- filter by Branch ---</option>';
//         departmentSelect.innerHTML = '<option value="">--- filter by Department ---</option>';
//         formBranch.innerHTML = '<option value="">--- select Branch ---</option>';
//         formDepartment.innerHTML = '<option value="">--- select Department ---</option>';

//         // Populate branch options
//         data.branches.forEach(branch => {
//             const option = document.createElement('option');
//             option.value = branch;
//             option.textContent = branch;
//             branchSelect.appendChild(option);
//         });

//         data.branches.forEach(branch => {
//             const option = document.createElement('option');
//             option.value = branch;
//             option.textContent = branch;
//             formBranch.appendChild(option);
//         });

//         // Populate department options
//         data.departments.forEach(department => {
//             const option = document.createElement('option');
//             option.value = department;
//             option.textContent = department;
//             departmentSelect.appendChild(option);
//         });

//         data.departments.forEach(department => {
//             const option = document.createElement('option');
//             option.value = department;
//             option.textContent = department;
//             formDepartment.appendChild(option);
//         });
//     })
//     .catch(error => console.error("Error fetching branches and departments:", error));

//     function fetchMember(page, query = '') {
//         const url = `https://lucky1999.pythonanywhere.com/logec/api/list/members/?page=${page}&search=${query}`;

//         fetch(url, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         })
//         .then(response => response.ok ? response.json() : Promise.reject(response))
//         .then(data => {
//             displayMember(data.results || []);
//             updatePagination(data);
//         })
//         .catch(error => console.error("Error fetching members:", error));
//     }

//     function updatePagination(data) {
//         paginationContainer.innerHTML = '';

//         const totalItems = data.count || 0;
//         const totalPages = Math.ceil(totalItems / itemsPerPage);

//         const prevButton = document.createElement('button');
//         prevButton.innerHTML = '<< Previous';
//         prevButton.disabled = !data.previous;
//         prevButton.addEventListener('click', () => {
//             if (currentPage > 1) {
//                 currentPage--;
//                 fetchMember(currentPage, currentSearchQuery);
//             }
//         });

//         const nextButton = document.createElement('button');
//         nextButton.innerHTML = 'Next >>';
//         nextButton.disabled = !data.next;
//         nextButton.addEventListener('click', () => {
//             if (currentPage < totalPages) {
//                 currentPage++;
//                 fetchMember(currentPage, currentSearchQuery);
//             }
//         });

//         const pageIndicator = document.createElement('span');
//         pageIndicator.textContent = ` ${currentPage} / ${totalPages} `;

//         paginationContainer.appendChild(prevButton);
//         paginationContainer.appendChild(pageIndicator);
//         paginationContainer.appendChild(nextButton);
//     }

//     // Event listeners for search and filters
//     searchInput.addEventListener('input', updateSearchQuery);
//     branchOption.addEventListener('change', updateSearchQuery);
//     departmentOption.addEventListener('change', updateSearchQuery);

//     function updateSearchQuery() {
//         const branch = branchOption.value;
//         const department = departmentOption.value;
//         const search = searchInput.value;
//         currentSearchQuery = `${search}${branch ? `&branch=${branch}` : ''}${department ? `&department=${department}` : ''}`;
//         currentPage = 1;
//         fetchMember(currentPage, currentSearchQuery);
//     }

//     function displayMember(data) {
//         document.getElementById("member-count").innerHTML = data.length
//         memberContainer.innerHTML = '';
//         if (data.length === 0) {
//             const noSermonsMessage = document.createElement('p');
//             noSermonsMessage.classList.add('text-center');
//             noSermonsMessage.textContent = 'No sermons available at the moment. Please check back later.';
//             memberContainer.appendChild(noSermonsMessage);
//         } else {
//             data.forEach(member => {
//                 const rowHtml = `
//                 <div class="post-item">
//                     <div>
//                         <h4>${member.id}. <a href="#!" class="details-btn" id="details-${member.id}">${member.name}</a></h4>
//                         <span datetime="2020-01-01">${member.phone} | </span>
//                         <span datetime="2020-01-01">${member.branch} | </span>
//                         <span datetime="2020-01-01">${member.gender} | </span>
//                     </div>
//                 </div>`;
//                 memberContainer.innerHTML += rowHtml;
//             });
//             document.querySelectorAll('.details-btn').forEach(button => {
//                 button.addEventListener('click', function () {
//                     const memberId = this.id.replace('details-', '');
//                     processDetails(memberId);
//                 });
//             });
//         }
//     }


//     function processDetails(memberId) {
//         fetch(`https://lucky1999.pythonanywhere.com/logec/api/members/details/${memberId}/`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             },
//         }).then(response => {
//             if (response.status===200) {
//                 response.json().then(data => {
//                     document.getElementById('member-id').value = data.id || '';
//                     document.getElementById('member-name').value = data.name || '';
//                     document.getElementById('member-email').value = data.email || '';
//                     document.getElementById('member-phone').value = data.phone || '';
//                     document.getElementById('member-address').value = data.address || '';
//                     document.getElementById('member-gender').value = data.gender || 'null';
//                     formBranch.value = data.branch || 'null';
//                     formDepartment.value = data.department || 'null';
//                     const rawDate = data.date || null;
//                     if (rawDate) {
//                         const dateObj = new Date(rawDate);
//                         const options = { 
//                             year: 'numeric', 
//                             month: 'long', 
//                             day: 'numeric', 
//                             hour: 'numeric', 
//                             minute: 'numeric', 
//                             second: 'numeric', 
//                             timeZoneName: 'short' 
//                         };
//                         const formattedDate = dateObj.toLocaleString('en-US', options);
//                         document.getElementById('member-date').textContent = formattedDate;
//                     } else {
//                         document.getElementById('member-date').textContent = 'N/A';
//                     }
//                     });
//             } else {
//                 return response.json().then(data => {
//                 alert(data.detail || 'Authorised or invalid entry')
//                 })
//             }
//             })
            
//         }

//         document.getElementById('submit-button').addEventListener('click', () => {
//             const memberId = document.getElementById('member-id').value;
//             const memberData = {
//                 name: document.getElementById('member-name').value,
//                 email: document.getElementById('member-email').value,
//                 phone: document.getElementById('member-phone').value,
//                 address: document.getElementById('member-address').value,
//                 gender: document.getElementById('member-gender').value,
//                 branch: document.getElementById('member-branch').value,
//                 department: document.getElementById('member-department').value,
//             };  
//             const spinner = document.getElementById('spinner');
//             const submitText = document.getElementById('submit-text');
    
//             spinner.classList.remove('d-none');
//             submitText.classList.add('d-none');

//             if (memberId) {
//                 fetch(`https://lucky1999.pythonanywhere.com/logec/api/update/member/${memberId}/`, {
//                     method: 'PUT',
//                     headers: { 
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}`
//                     },
//                     body: JSON.stringify(memberData)
//                 }).then(response => {
//                     spinner.classList.add('d-none');
//                     submitText.classList.remove('d-none');
//                     if (response.ok) {
//                         alert('Member updated successfully!');
//                     } else {
//                         alert('Error updating member.');
//                     }
//                 });
//             } else {
//                 fetch('https://lucky1999.pythonanywhere.com/logec/api/register/member/', {
//                     method: 'POST',
//                     headers: { 
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${token}`
//                     },
//                     body: JSON.stringify(memberData)
//                 }).then(response => {
//                     spinner.classList.add('d-none');
//                     submitText.classList.remove('d-none');
//                     if (response.ok) {
//                         alert('Member created successfully!');
//                     } else {
//                         alert('Error creating member.');
//                     }
//                 });
//             }
//         });

    



//     // Initial load
//     fetchMember(currentPage);
// });
