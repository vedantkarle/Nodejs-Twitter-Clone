$.get("/api/posts", (results) => {
  outputPosts(results, $(".postsContainer"));
});
