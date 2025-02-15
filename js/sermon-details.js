document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('logec_token');
    const adminAction = document.getElementById("adminAction");
    if (token) {
        adminAction.style.display = "block";
    }
    const urlParams = new URLSearchParams(window.location.search);
    const sermonId = urlParams.get('id');
    function fetchSermons(query) {
        fetch(`https://lucky1999.pythonanywhere.com/logec/api/get/sermon/${sermonId}/?search=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
      }).then(response => {
        if (response.status === 200) {
            return response.json();
        } else {
            console.error("Failed to retrieve data", response.status);
            return;
        }
        }).then(data => {
            
            if (data) {
                displaySermonDetails(data.sermon);
                displayRecentSermon(data.recent_sermons);
                displaySermonComment(data.comments);
            }
        })
        .catch(error => {
            throw new Error("Error fetching sermon details:", error);
        });
    }

    document.getElementById('search').addEventListener('input', function() {
        const query = this.value.trim();
        fetchSermons(query);
    })

    function displaySermonDetails(data) {
        document.getElementById("precher-c").innerHTML = " " + data.preacher;
        document.getElementById("precher-t").innerHTML = " " + data.preacher;
        document.getElementById("date-c").innerHTML = " " + data.posted_at;
        document.getElementById("text-c").innerHTML = " " + data.bible_text;
        document.getElementById("content-c").innerHTML = " " + data.sermon;
        document.getElementById("title-c").innerHTML = " " + data.title;
        document.getElementById("precher-h").innerHTML = "Pastor " + data.preacher;
        document.getElementById("title-h").innerHTML = data.title;

        document.getElementById("preacher-i").value =data.preacher;
        document.getElementById("title-i").value = data.title;
        document.getElementById("text-i").value = data.bible_text;
        document.getElementById("sermon-i").value = data.sermon;
        
    }

    function displayRecentSermon(data) {
        const sermonContainer = document.getElementById('sermon-container');
        sermonContainer.innerHTML = '';
        const sermons = data;
        if (sermons.length === 0) {
            const noSermonsMessage = document.createElement('p');
            noSermonsMessage.classList.add('text-center');
            noSermonsMessage.textContent = 'No sermons available at the moment. Please check back later.';
            sermonContainer.appendChild(noSermonsMessage);
        } else {
            sermons.forEach(sermon => {
                const rowHtml = `
                <div class="post-item">
                    <img loading="lazy" src="images/sermon-2.jpg" alt="" class="flex-shrink-0">
                    <div>
                    <h4><a href="sermon-details.html?id=${sermon.id}">${sermon.title}</a></h4>
                    <time datetime="2020-01-01">${sermon.posted_at}</time>
                    </div>
                </div>`;
                sermonContainer.innerHTML += rowHtml;
            });
        }
    }
    

    function displaySermonComment(data) {
        function formatDate(dateString) {
            const now = new Date();
            const commentDate = new Date(dateString);
            const diffInSeconds = Math.floor((now - commentDate) / 1000);
            
            const minutes = Math.floor(diffInSeconds / 60);
            const hours = Math.floor(diffInSeconds / 3600);
            const days = Math.floor(diffInSeconds / (3600 * 24));
            const months = Math.floor(days / 30); // Approximate month length (30 days)
            const years = Math.floor(days / 365); // Approximate year length (365 days)

            if (minutes < 1) return "Just now";
            if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
            if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
            return `${years} year${years > 1 ? 's' : ''} ago`;
        }
        const commentContainer = document.getElementById('comment-container');
        commentContainer.innerHTML = '';
        const comments = data;
        document.getElementById('comments-count').innerHTML =  comments.length + " comment(s)";
        if (comments.length === 0) {
            const noCommentMessage = document.createElement('p');
            noCommentMessage.classList.add('text-center');
            noCommentMessage.textContent = 'No comment available at the moment. Please check back later.';
            commentContainer.appendChild(noCommentMessage);
        } else {
            comments.forEach(comment => {
                const rowHtml = `
                <div id="comment-1" class="comment">
                    <div class="d-flex">
                      <div>
                        <h5>${comment.name}</h5>
                        <time datetime="2020-01-01">${formatDate(comment.date)}</time>
                        <p style="white-space: pre-line;word-wrap: break-word; margin-top:-30px;">
                        ${comment.comment}
                        </p>
                      </div>
                    </div>
                    <a type="button"  class="btn btn-danger delete-btn" id="delete-${comment.id}">
                        <i class="bi bi-trash"></i>
                        Delete
                    </a>
                  </div> `;
                commentContainer.innerHTML += rowHtml;
            });
            document.querySelectorAll('.delete-btn').forEach(button => {
                if (token){
                    button.style.display = 'block';
                }
                button.addEventListener('click', function () {
                    const commentId = this.id.replace('delete-', '');
                    processDelete(commentId);
                });
            });
        }

    }
    

    document.querySelector('.addComment-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const form = this;

        const formData = new FormData(form);


        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        const spinner = document.getElementById('spinner');
        const submitText = document.getElementById('submit-text');

        spinner.classList.remove('d-none');
        submitText.classList.add('d-none');
        fetch(`https://lucky1999.pythonanywhere.com/logec/api/comment/sermon/${sermonId}/`, {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData.entries())), // Convert form data to JSON
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            spinner.classList.add('d-none');
            submitText.classList.remove('d-none');
            
            if (response.status===201) {
                return response.json().then(data => {
                    document.querySelector('.addComment-form').reset();
                    alert(data.message)
                });

            } else {
                return response.json().then(data => {
                alert(data.error || 'An error occurred. Please try again later.')
                })
            }
        })
        
    });

    function processDelete(commentId) {
        const token = localStorage.getItem('logec_token');
        if (!token){ 
            alert("you have no right to perform this operation");
            return;
        }
        const confirmDelete = confirm("Are you sure you want to delete this comment?");
        if (!confirmDelete) return;
        fetch(`https://lucky1999.pythonanywhere.com/logec/api/comment/sermon/${commentId}/delete/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        }).then(response => {
            if (response.status===204) {
                alert("Deleted successfully");
            } else {
                return response.json().then(data => {
                alert(data.detail || 'Authorised or invalid entry')
                })
            }
        })
        
    }

    document.getElementById("adminDelete").addEventListener('click', () => {
        const token = localStorage.getItem('logec_token');
        if (!token){ 
            alert("you have no right to perform this operation");
            return;
        }
        const confirmDelete = confirm("Are you sure you want to delete this sermon?");
        if (!confirmDelete) return;
        fetch(`https://lucky1999.pythonanywhere.com/logec/api/delete/sermon/${sermonId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        }).then(response => {
            if (response.status===204) {
                alert("Deleted successfully");
            } else {
                return response.json().then(data => {
                alert(data.detail || 'Authorised or invalid entry')
                })
            }
        })
    })

    document.getElementById("adminUpdate").addEventListener('click', () => {
        const sermon = document.getElementById("update-sermon");
        sermon.style.display = "block";
    })


    document.querySelector('.updateSermon-form').addEventListener('submit', function(event) {
        const token = localStorage.getItem('logec_token');
        if (!token){ 
            alert("you have no right to perform this operation");
            return;
        }
        const confirmDelete = confirm("Are you sure you want to update this sermon?");
        if (!confirmDelete) return;

        event.preventDefault();
        const form = this;
        const formData = new FormData(form);


        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        const spinner = document.getElementById('spinner1');
        const submitText = document.getElementById('submit-text1');

        spinner.classList.remove('d-none');
        submitText.classList.add('d-none');
        
        fetch(`https://lucky1999.pythonanywhere.com/logec/api/update/sermon/${sermonId}/`, {
            method: 'PUT',
            body: JSON.stringify(Object.fromEntries(formData.entries())), // Convert form data to JSON
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        })
        .then(response => {
            spinner.classList.add('d-none');
            submitText.classList.remove('d-none');
            
            if (response.status===200) {
                return response.json().then(data => {
                    alert('Updated successfully')
                });

            } else {
                return response.json().then(data => {
                alert(data.detail || data.error || 'This already exists or An error occurred. Please try again later.')
                })
            }
        }).catch(error => {
            spinner.classList.add('d-none');
            submitText.classList.remove('d-none');
            alert('An error occurred. Please try again later.');
            console.error(error);
        });
        
    });


    
    fetchSermons('');


})