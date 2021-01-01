//Globals
let cropper;

$("#postTextArea,#replyTextArea").keyup((event) => {
  const textbox = $(event.target);
  const value = textbox.val().trim();

  const isModal = textbox.parents(".modal").length === 1;

  const submitBtn = isModal ? $("#submitReplyButton") : $("#submitPostButton");

  if (submitBtn.length === 0) {
    return alert("No Submit Button Found");
  }

  if (value === "") {
    submitBtn.prop("disabled", true);
    return;
  }

  submitBtn.prop("disabled", false);
});

$("#submitPostButton,#submitReplyButton").click((event) => {
  const button = $(event.target);

  const isModal = button.parents(".modal").length === 1;

  const textbox = isModal ? $("#replyTextArea") : $("#postTextArea");

  const data = {
    content: textbox.val(),
  };

  if (isModal) {
    const id = button.data().id;
    data.replyTo = id;
  }

  $.post("/api/posts", data, (postData) => {
    if (postData.replyTo) {
      location.reload();
    } else {
      const html = createPostHtml(postData);
      $(".postsContainer").prepend(html);
      textbox.val("");
      button.prop("disabled", true);
    }
  });
});

//events provided by bootstrap

$("#replyModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);

  $("#submitReplyButton").data("id", postId);

  $.get(`/api/posts/${postId}`, (result) => {
    outputSinglePost(result.postData, $("#originalPostContainer"));
  });
});

$("#replyModal").on("hidden.bs.modal", (event) => {
  $("#originalPostContainer").html("");
});

$("#deletePostModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);

  $("#deletePostButton").data("id", postId);
});

$("#deletePostButton").click((e) => {
  const postId = $(e.target).data("id");

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "DELETE",
    success: () => {
      location.reload();
    },
  });
});

$("#filePhoto").change(function () {
  if (this.files && this.files[0]) {
    const selectedImageSrc = URL.createObjectURL(this.files[0]);

    document.getElementById("imagePreview").src = selectedImageSrc;

    if (cropper !== undefined) {
      cropper.destroy();
    }

    cropper = new Cropper(document.getElementById("imagePreview"), {
      aspectRatio: 1 / 1,
      background: false,
    });
  }
});

$("#imageUploadButton").click(() => {
  let canvas = cropper.getCroppedCanvas();

  if (canvas === null) {
    return alert("Could Not Upload Image,Make Sure Its a image file!");
  }

  canvas.toBlob((blob) => {
    let formData = new FormData();
    formData.append("croppedImage", blob);

    $.ajax({
      url: "/api/users/profilePicture",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: () => {
        location.reload();
      },
    });
  });
});

$("#coverPhoto").change(function () {
  if (this.files && this.files[0]) {
    const selectedImageSrc = URL.createObjectURL(this.files[0]);

    document.getElementById("coverImagePreview").src = selectedImageSrc;

    if (cropper !== undefined) {
      cropper.destroy();
    }

    cropper = new Cropper(document.getElementById("coverImagePreview"), {
      aspectRatio: 16 / 9,
      background: false,
    });
  }
});

$("#coverPhotoButton").click(() => {
  let canvas = cropper.getCroppedCanvas();

  if (canvas === null) {
    return alert("Could Not Upload Image,Make Sure Its a image file!");
  }

  canvas.toBlob((blob) => {
    let formData = new FormData();
    formData.append("croppedImage", blob);

    $.ajax({
      url: "/api/users/coverPhoto",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: () => {
        location.reload();
      },
    });
  });
});

$(document).on("click", ".likeButton", (event) => {
  const button = $(event.target);
  const postId = getPostIdFromElement(button);

  if (postId === undefined) return;

  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: "PUT",
    success: (postData) => {
      button.find("span").text(postData.likes.length || "");

      if (postData.likes.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

$(document).on("click", ".retweetButton", (event) => {
  const button = $(event.target);
  const postId = getPostIdFromElement(button);

  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: "POST",
    success: (postData) => {
      button.find("span").text(postData.retweetUsers.length || "");

      if (postData.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

$(document).on("click", ".post", (event) => {
  const element = $(event.target);
  const postId = getPostIdFromElement(element);

  if (postId !== undefined && !element.is("button")) {
    window.location.href = "/posts/" + postId;
  }
});

$(document).on("click", ".followButton", (event) => {
  const button = $(event.target);
  const userId = button.data().id;

  $.ajax({
    url: `/api/users/${userId}/follow`,
    type: "PUT",
    success: (data, status, xhr) => {
      if (xhr.status === 404) {
        return alert("User not found!");
      }
      let difference = 1;
      if (data.following && data.following.includes(userId)) {
        button.addClass("following");
        button.text("Following");
      } else {
        button.removeClass("following");
        button.text("Follow");
        difference = -1;
      }

      const followersLabel = $("#followersValue");

      if (followersLabel.length !== 0) {
        const followersText = +followersLabel.text();
        followersLabel.text(followersText + difference);
      }
    },
  });
});

function getPostIdFromElement(element) {
  const isRoot = element.hasClass("post");

  const rootElement = isRoot === true ? element : element.closest(".post");

  const postId = rootElement.data().id;

  if (postId === undefined) return alert("postId Undefined");

  return postId;
}

function createPostHtml(postData) {
  if (postData === null) return alert("No post Object");

  const isRetweet = postData.retweetData !== undefined;
  const retweetedBy = isRetweet ? postData.postedBy.username : null;
  postData = isRetweet ? postData.retweetData : postData;

  const postedBy = postData.postedBy;
  const displayName = postedBy.firstName + " " + postedBy.lastName;
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  const likedButtonActiveClass = postData.likes.includes(userLoggedIn._id)
    ? "active"
    : "";

  const retweetButtonActiveClass = postData.retweetUsers.includes(
    userLoggedIn._id
  )
    ? "active"
    : "";

  let retweetText = "";

  if (isRetweet) {
    retweetText = `<span><i class="fas fa-retweet"></i>Retweeted By <a href="/profile/${retweetedBy}">@${retweetedBy}</a></span>`;
  }

  let replyFlag = "";

  if (postData.replyTo) {
    if (!postData.replyTo._id) return alert("Reply to is not populated");

    const replyToUsername = postData.replyTo.postedBy.username;
    replyFlag = `<div class="replyFlag">Replying To <a href="/profile/${replyToUsername}">${replyToUsername}</a></div>`;
  }

  let button = "";

  if (postData.postedBy._id === userLoggedIn._id) {
    button = `<button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fas fa-times"></i></button>`;
  }

  return `<div class="post" data-id='${postData._id}'>
    <div class="postActionContainer">
      ${retweetText}
    </div>
    <div class="mainContentContainer">
      <div class="userImageContainer">
        <img src="${postedBy.profilePic}" />
      </div>
      <div class="postContentContainer">
        <div class="header">
          <a href="/profile/${postedBy.username}" class="displayName">
            ${displayName}
          </a>
          <span class="username">@${postedBy.username}</span>
          <span class="date">${timestamp}</span>
          ${button}
        </div>
        ${replyFlag}
        <div class="postBody">
          <span>${postData.content}</span>
        </div>
        <div class="postFooter">
          <div class="postButtonContainer">
            <button data-toggle="modal" data-target="#replyModal"><i class="far fa-comment"></i></button>
          </div>
          <div class="postButtonContainer green">
            <button class="retweetButton ${retweetButtonActiveClass}">
            <i class="fas fa-retweet"></i>
            <span>${postData.retweetUsers.length || ""}</span>
            </button>
          </div>
          <div class="postButtonContainer red">
            <button class="likeButton ${likedButtonActiveClass}">
            <i class="far fa-heart"></i>
            <span>${postData.likes.length || ""}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return "Just Now";
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}

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

function outputSinglePost(result, container) {
  container.html("");
  const html = createPostHtml(result);
  container.append(html);
}

function outputSinglePostWithReplies(result, container) {
  container.html("");

  if (result.replyTo !== undefined && result.replyTo._id !== undefined) {
    const html = createPostHtml(result.replyTo);
    container.append(html);
  }

  const mainPostHtml = createPostHtml(result.postData);
  container.append(mainPostHtml);

  result.replies.forEach((reply) => {
    const html = createPostHtml(reply);
    container.append(html);
  });
}
