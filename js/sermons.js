document.addEventListener('DOMContentLoaded', function() {
    const sermonContainer = document.getElementById('sermon-container');
    const paginationContainer = document.getElementById('pagination-container');
    const searchInput = document.getElementById("search");
    let currentPage = 1;
    const itemsPerPage = 9;
    let currentSearchQuery = '';

    function fetchSermons(page, query = '') {
        const url = `https://lucky1999.pythonanywhere.com/logec/api/list/sermons/?page=${page}&search=${query}`;
        
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                console.error("Failed to retrieve data", response.status);
            }
        })
        .then(data => {
            displaySermons(data);
            updatePagination(data);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
    }

    function displaySermons(data) {
        sermonContainer.innerHTML = '';
        const sermons = data.results;

        if (sermons.length === 0) {
            const noSermonsMessage = document.createElement('p');
            noSermonsMessage.classList.add('text-center');
            noSermonsMessage.textContent = 'No sermons available at the moment. Please check back later.';
            sermonContainer.appendChild(noSermonsMessage);
        } else {
            sermons.forEach(sermon => {
                const rowHtml = `
                    <div class="col-md-4 text-center">
                        <div class="sermon-entry">
                            <div class="sermon" style="background-image: url(images/sermon-2.jpg);"></div>
                            <h3><b>${sermon.title}</b></h3>
                            <span>Pastor ${sermon.preacher}</span> <br>
                            <a href="sermon-details.html?id=${sermon.id}" style="margin-top:50px;">Read More <i class="icon-arrow-right3"></i></a>
                        </div>
                    </div>
                `;
                sermonContainer.innerHTML += rowHtml;
            });
        }
    }

    function updatePagination(data) {
        paginationContainer.innerHTML = '';

        const totalItems = data.count;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<< Previous';
        prevButton.disabled = data.previous === null;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                fetchSermons(currentPage, currentSearchQuery);
            }
        });

        const nextButton = document.createElement('button');
        nextButton.innerHTML = 'Next >>';
        nextButton.disabled = data.next === null;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                fetchSermons(currentPage, currentSearchQuery);
            }
        });

        const pageIndicator = document.createElement('span');
        pageIndicator.textContent = ` ${currentPage} / ${totalPages} `;

        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(pageIndicator);
        paginationContainer.appendChild(nextButton);
    }

    // Event listener for the search input
    searchInput.addEventListener('input', function() {
        currentSearchQuery = searchInput.value;
        currentPage = 1;  // Reset to first page on new search
        fetchSermons(currentPage, currentSearchQuery);
    });

    // Initial fetch
    fetchSermons(currentPage);
});