document.addEventListener('DOMContentLoaded', function() {
    const offeringContainer = document.getElementById('offering-container');
    const paginationContainer = document.getElementById('pagination-container');
    const searchInput = document.getElementById("search");
    let currentPage = 1;
    const itemsPerPage = 15;
    let currentSearchQuery = '';

    const token = localStorage.getItem('logec_token');
    if (!token) {
        alert("You don't have access to view this page");
        window.location.href = 'index.html';
        return;
    }

    function fetchOfferings(page, query = '') {
        const url = `https://lucky1999.pythonanywhere.com/logec/api/list/donation/?page=${page}&search=${query}`;

        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(data => {
            displayOfferings(data.results || []);
            updatePagination(data);
        })
        .catch(error => console.error("Error fetching members:", error));
    }

    function updatePagination(data) {
        paginationContainer.innerHTML = '';

        const totalItems = data.count || 0;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<< Previous';
        prevButton.disabled = !data.previous;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                fetchOfferings(currentPage, currentSearchQuery);
            }
        });

        const nextButton = document.createElement('button');
        nextButton.innerHTML = 'Next >>';
        nextButton.disabled = !data.next;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                fetchOfferings(currentPage, currentSearchQuery);
            }
        });

        const pageIndicator = document.createElement('span');
        pageIndicator.textContent = ` ${currentPage} / ${totalPages} `;

        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(pageIndicator);
        paginationContainer.appendChild(nextButton);
    }

    searchInput.addEventListener('input', function() {
        currentSearchQuery = searchInput.value;
        currentPage = 1; 
        fetchOfferings(currentPage, currentSearchQuery);
    });

    function displayOfferings(data) {
        document.getElementById("offering-count").innerHTML = data.length
        offeringContainer.innerHTML = '';
        if (data.length === 0) {
            const noSermonsMessage = document.createElement('p');
            noSermonsMessage.classList.add('text-center');
            noSermonsMessage.textContent = 'No Offering available at the moment. Please check back later.';
            offeringContainer.appendChild(noSermonsMessage);
        } else {
            data.forEach(offering => {
                const rowHtml = `
                <div class="post-item">
                    <div>
                        <h4>${offering.id}. <a href="#!" class="details-btn" id="details-${offering.id}">${offering.name}</a></h4>
                        <span datetime="2020-01-01">${offering.title} | </span>
                        <span datetime="2020-01-01">${offering.amount} | </span>

                    </div>
                </div>`;
                offeringContainer.innerHTML += rowHtml;
            });
            document.querySelectorAll('.details-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const offeringId = this.id.replace('details-', '');
                    processDetails(offeringId);
                });
            });

        }
    }


    function processDetails(offeringId) {
        fetch(`https://lucky1999.pythonanywhere.com/logec/api/get/donation/${offeringId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        }).then(response => {
            if (response.status===200) {
                response.json().then(data => {
                    
                    document.getElementById('offering-name').textContent = data.name || 'null';
                    document.getElementById('offering-ref').textContent = data.ref || 'null';
                    document.getElementById('offering-title').textContent = data.title || 'null';
                    document.getElementById('offering-amount').textContent = data.amount || 'null';
                    document.getElementById('offering-date').textContent = data.posted_at ;
          
                    });
            } else {
                return response.json().then(data => {
                alert(data.detail || 'Authorised or invalid entry')
                })
            }
            })
            
        }


    fetchOfferings(currentPage)


})