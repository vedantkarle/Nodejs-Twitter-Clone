$.get("/api/posts", (results) => {
  outputPosts(results, $(".postsContainer"));
});

function outputPosts(results, container) {
  container.html("");

  results.forEach((result) => {
    const html = createPostHtml(result);
    container.append(html);
  });

  if (results.length === 0) {
    container.append("<span>No Posts Yet!</span>");
  }
}
