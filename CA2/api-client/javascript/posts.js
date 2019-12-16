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
                                    <span>${postAndComment.post.upload_time.replace('T', ' ').substring(0, 19)}</span>`;
        if(userLoggedIn()) {
            thread +=               `<i class="fa fa-reply" type="button" class="btn btn-primary" data-toggle="modal" data-target="#UploadCommentDialog" onclick="updatePostIdValueInCommentModal(${postAndComment.post.post_id}, '')">Reply</i>`;
        }
        if(userIsAuthor(postAndComment.post.user_id)) {
            thread += `<i class="fa fa-reply" onclick="updatePostIdValueInPostModal(${postAndComment.post.post_id}, -1, '${postAndComment.post.post_body}');" type="button" class="btn btn-primary" data-toggle="modal" data-target="#UploadPostDialog">Update</i>`;
        }
        thread +=               `</div>
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
                                        <span>${reply.upload_time.replace('T', ' ').substring(0, 19)}</span>`
            if(userIsAuthor(reply.user_id)) {
                thread += `<i class="fa fa-reply" onclick="updatePostIdValueInCommentModal(${postAndComment.post.post_id}, ${reply.comment_id}, '${reply.comment_body}');" type="button" class="btn btn-primary" data-toggle="modal" data-target="#UploadCommentDialog">Update</i>`;
            } 
            thread += `</div>
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

async function addOrUpdatePost() {
    let url = `${BASE_URL}posts`;
  
    // Get form fields
    const postId = Number(document.getElementById('postId').value);
    const postBody = document.getElementById('postBody').value;
    const userId = sessionStorage.userId;
    
    // only allow post upload if the user is logged in
    if(userLoggedIn()){
        // build request body
        const reqBody = JSON.stringify({
            user_id: userId,
            post_body: postBody
        });

        // Try catch 
        try {
            let json = "";
            // determine if this is an insert (POST) or update (PUT)
            // update will include product id
            if (postId > 0) {
                url += `/${postId}/update-post`;
                json = await postOrPutDataAsync(url, reqBody, 'PUT');
            }
            else {  
                url += `/upload`;
                json = await postOrPutDataAsync(url, reqBody, 'POST');
            }
            // Load products
            loadPosts();
        // catch and log any errors
        } catch (err) {
            console.log(err);
            return err;
        }
    } else {
        // display a popup box
        alert("Please log in first!");
    }
}

async function addOrUpdateComment() {
    let url = `${BASE_URL}posts`;
  
    // Get form fields
    const commentId = Number(document.getElementById('commentId').value)
    const postId = Number(document.getElementById('postIdForReply').value);
    const commentBody = document.getElementById('commentBody').value;
    const userId = sessionStorage.userId;
    
    // only allow post upload if the user is logged in
    if(userLoggedIn()){
        // build request body
        const reqBody = JSON.stringify({
            user_id: userId,
            comment_body: commentBody
        });

        // Try catch 
        try {
            let json = "";
            // determine if this is an insert (POST) or update (PUT)
            // update will include product id
            if (commentId > 0) {
                url +=`/${postId}/update-reply/${commentId}`;
                json = await postOrPutDataAsync(url, reqBody, 'PUT');
            }
            else {  
                url += `/${postId}/reply`;
                json = await postOrPutDataAsync(url, reqBody, 'POST');
            }
            // Load products
            loadPosts();
        // catch and log any errors
        } catch (err) {
            console.log(err);
            return err;
        }
    } else {
        // display a popup box
        alert("Please log in first!");
    }
}

async function deletePost(id) {
    if(userIsAdmin()){
        if(confirm("Do you want to permanently delete this post?")){
            const url = `${BASE_URL}posts/${id}/delete-post}`
            try{
                const json = await deleteDataAsync(url);

                console.log("delete post response: " + json);
                loadPosts();
            } catch (err) {
                console.log(err);
                return err;
            }
        }
    } else {
        alert("You are not authorized to perform delete actions!");
    }
}

async function deleteComment(id) {
    if(userIsAdmin()){
        if(confirm("Do you want to permanently delete this reply?")){
            const url = `${BASE_URL}posts/delete-reply/${id}`
            try{
                const json = await deleteDataAsync(url);

                console.log("delete comment response: " + json);
                loadPosts();
            } catch (err) {
                console.log(err);
                return err;
            }
        }
    } else {
        alert("You are not authorized to perform delete actions!");
    }
}

// Display add post button only if user is logged in
function addPostButtonDisplay(){
    if(userLoggedIn()){
        document.getElementById("addPostButton").style.display = "block";
    } else {
        document.getElementById("addPostButton").style.display = "none";
    }
}

function updatePostIdValueInCommentModal(postId, commentId, body) {
    if(userLoggedIn()){
        document.getElementById("postIdForReply").value = postId + "";
        if (commentId > 0) {
            document.getElementById("commentId").value = commentId + "";
        }
        document.getElementById("commentBody").value = body + "";

        console.log("value of post id: " + postId);
        console.log("value of comment id: " + commentId);
        console.log("value of body: " + body);
    }
}

function updatePostIdValueInPostModal(id, body) {
    if(userLoggedIn()){
        document.getElementById("postId").value = id + "";
        document.getElementById("postBody").value = body + "";
    }
}