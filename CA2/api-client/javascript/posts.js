function displayPostsAndComments(postsAndComments){
    // Using Array's map function to loop through the array of posts (in json format)
    // Each products will be formated as HTML table rowsand added to the array
    const allPosts = postsAndComments.map(postAndComment => {
        // after this function has finished execution, 'allPosts' will have all the posts
        // and their comments formatted in HTML tags, ready to be displayed

        let thread = `<li>
                        <div class="comment-main-level">
                            <!-- Author's profile image -->
                            <div class="comment-avatar"><img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn2.iconfinder.com%2Fdata%2Ficons%2Foffice-and-business-special-set-1%2F260%2F18-512.png&f=1&nofb=1" alt=""></div>
                            <!-- Comment -->
                            <div class="comment-box">
                                <div class="comment-head">
                                    <h6 class="comment-name by-author"><a href="#" onclick="selectPost(${postAndComment.post.post_id})">${postAndComment.post.first_name}</a></h6>
                                    <span>${postAndComment.post.upload_time.replace('T', ' ').substring(0, 19)}</span>
                                    <i class="fa fa-reply"></i>
                                    <i class="fa fa-heart"></i>
                                </div>
                                <div class="comment-content">
                                    ${postAndComment.post.post_body}
                                </div>
                            </div>
                        </div>`;
        // if the post has at least one comment then loop through the array, again using map       
        if(postAndComment.comments != null){
            thread += `<ul class="comments-list reply-list">`;
            const replies = postAndComment.comments.map(reply => {
                thread += `<li>
                                <!-- User's profile image -->
                                <div class="comment-avatar"><img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn2.iconfinder.com%2Fdata%2Ficons%2Foffice-and-business-special-set-1%2F260%2F18-512.png&f=1&nofb=1" alt=""></div>
                                <!-- Comment -->
                                <div class="comment-box">
                                    <div class="comment-head">
                                        <h6 class="comment-name"><a href="#">${reply.first_name}</a></h6>
                                        <span>${reply.upload_time.replace('T', ' ').substring(0, 19)}</span>
                                        <i class="fa fa-reply"></i>
                                        <i class="fa fa-heart"></i>
                                    </div>
                                    <div class="comment-content">
                                        ${reply.comment_body}
                                    </div>
                                </div>
                            </li>`;
            });
            thread += `</ul>`;
        }
        // if the post does not have any comments
        else {
            thread += `</li></ul>`;
        }
        
        // console.log(thread);
        // save the formatted post data in the variable 'allPosts'
        return thread;
    });
    // display the posts and their comments on the home page
    document.getElementById('comments-list').innerHTML = allPosts.join('');
}

function displaySinglePost(thread){
    // console.log(thread);
    let htmlThread = `<li>
                        <div class="comment-main-level">
                            <!-- Author's profile image -->
                            <div class="comment-avatar"><img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn2.iconfinder.com%2Fdata%2Ficons%2Foffice-and-business-special-set-1%2F260%2F18-512.png&f=1&nofb=1" alt=""></div>
                            <!-- Comment -->
                            <div class="comment-box">
                                <div class="comment-head">
                                    <h6 class="comment-name by-author"><a href="#">${thread.post.first_name}</a></h6>
                                    <span>${thread.post.upload_time.replace('T', ' ').substring(0, 19)}</span>
                                    <i class="fa fa-reply"></i>
                                    <i class="fa fa-heart"></i>
                                </div>
                                <div class="comment-content">
                                    ${thread.post.post_body}
                                </div>
                            </div>
                        </div>`;
        // if the post has at least one comment then loop through the array, again using map       
    if(thread.comments != null){
        htmlThread += `<ul class="comments-list reply-list">`;
        const replies = thread.comments.map(reply => {
            htmlThread += `<li>
                            <!-- User's profile image -->
                            <div class="comment-avatar"><img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn2.iconfinder.com%2Fdata%2Ficons%2Foffice-and-business-special-set-1%2F260%2F18-512.png&f=1&nofb=1" alt=""></div>
                            <!-- Comment -->
                            <div class="comment-box">
                                <div class="comment-head">
                                    <h6 class="comment-name"><a href="http://creaticode.com/blog">${reply.first_name}</a></h6>
                                    <span>${reply.upload_time.replace('T', ' ').substring(0, 19)}</span>
                                    <i class="fa fa-reply"></i>
                                    <i class="fa fa-heart"></i>
                                </div>
                                <div class="comment-content">
                                    ${reply.comment_body}
                                </div>
                            </div>
                        </li>`;
        });
        htmlThread += `</ul>`;
    }
    // if the post does not have any comments
    else {
        htmlThread += `</li></ul>`;
    }
    document.getElementById('comments-list').innerHTML = htmlThread;
}

// Get all posts and their comments and call on the display function
async function loadPosts() {
    try {
        // calling the function getDataAsync, implemented in fetch.js, that does a JS Fetch to the API endpoint
        const postsAndComments = await getDataAsync(`${BASE_URL}`);
        displayPostsAndComments(postsAndComments);
    
    } // catch and log any errors
    catch (err) {
      console.log(err);
    }
}

async function selectPost(id){
    try{
        // calling the function getDataAsync, implemented in fetch.js, that does a JS Fetch to the API endpoint
        const post = await getDataAsync(`${BASE_URL}${id}`);
        displaySinglePost(post);
    }  // catch and display any errors to the console
    catch (err) {
      console.log(err);
    }
}
