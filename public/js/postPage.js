$.get("/api/posts/" + postId, (result) => {
  outputSinglePostWithReplies(result, $(".postsContainer"));
});
