document.addEventListener('DOMContentLoaded', function() {
    const questionContainer = document.getElementById('question-container');
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


    function fetchQuestions(page, query = '') {
        const url = `https://lucky1999.pythonanywhere.com/logec/api/list/questions/?page=${page}&search=${query}`;

        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.ok ? response.json() : Promise.reject(response))
        .then(data => {
            displayQuestions(data.results || []);
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
                fetchQuestions(currentPage, currentSearchQuery);
            }
        });

        const nextButton = document.createElement('button');
        nextButton.innerHTML = 'Next >>';
        nextButton.disabled = !data.next;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                fetchQuestions(currentPage, currentSearchQuery);
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
        fetchQuestions(currentPage, currentSearchQuery);
    });

    function displayQuestions(data) {
        document.getElementById("question-count").innerHTML = data.length
        questionContainer.innerHTML = '';
        if (data.length === 0) {
            const noSermonsMessage = document.createElement('p');
            noSermonsMessage.classList.add('text-center');
            noSermonsMessage.textContent = 'No questions available at the moment. Please check back later.';
            questionContainer.appendChild(noSermonsMessage);
        } else {
            data.forEach(question => {
                const rowHtml = `
                <div class="post-item">
                    <div>
                        <h4>${question.id}. <a href="#!" class="details-btn" id="details-${question.id}">${question.name}</a></h4>
                        <span datetime="2020-01-01">${question.email} </span>

                    </div>
                </div>`;
                questionContainer.innerHTML += rowHtml;
            });
            document.querySelectorAll('.details-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const questionId = this.id.replace('details-', '');
                    processDetails(questionId);
                });
            });

        }
    }


    function processDetails(questionId) {
        fetch(`https://lucky1999.pythonanywhere.com/logec/api/get/question/${questionId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        }).then(response => {
            if (response.status===200) {
                response.json().then(data => {
                    
                    document.getElementById('question-name').textContent = data.name || 'null';
                    document.getElementById('question-email').textContent = data.email || 'null';
                    document.getElementById('question-phone').textContent = data.phone || 'null';
                    document.getElementById('question-question').textContent = data.question || 'null';
                    document.getElementById('question-date').textContent = data.date ;
          
                    });
            } else {
                return response.json().then(data => {
                alert(data.detail || 'Authorised or invalid entry')
                })
            }
            })
            
        }


    fetchQuestions(currentPage)


})