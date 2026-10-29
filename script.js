const videoFeed = document.getElementById("video-feed");

let videos = [
  {
    id: 1,
    username: "@AnimeWorld",
    caption: "Anime moments that hit different 🔥",
    music: "Original sound - AnimeWorld",
    src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    likes: 170000,
    comments: 1108,
    shares: 6936,
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Anime"
  },
  {
    id: 2,
    username: "@MovieClips",
    caption: "Enjoy this amazing video 🎬✨",
    music: "Original sound - MovieClips",
    src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    likes: 24500,
    comments: 560,
    shares: 1200,
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Movie"
  },
  {
    id: 3,
    username: "@FunVideos",
    caption: "Watch until the end 😂❤️",
    music: "Original sound - FunVideos",
    src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    likes: 52000,
    comments: 820,
    shares: 2400,
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Fun"
  }
];

const likedVideos = new Set();
const savedVideos = new Set();
const followedUsers = new Set();

function formatCount(number) {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }

  if (number >= 1000) {
    return (number / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }

  return String(number);
}

function renderVideos(filter = "") {
  videoFeed.innerHTML = "";

  const results = videos.filter(video =>
    (video.username + " " + video.caption)
      .toLowerCase()
      .includes(filter.toLowerCase())
  );

  if (results.length === 0) {
    videoFeed.innerHTML =
      '<p class="empty-message">No videos found. Try another search.</p>';
    return;
  }

  results.forEach(video => {
    const liked = likedVideos.has(video.id);
    const saved = savedVideos.has(video.id);
    const followed = followedUsers.has(video.username);

    const card = document.createElement("article");
    card.className = "video-card";

    const screen = document.createElement("div");
    screen.className = "video-screen";

    const player = document.createElement("video");
    player.src = video.src;
    player.loop = true;
    player.muted = true;
    player.playsInline = true;
    player.preload = "metadata";

    player.addEventListener("click", () => {
      if (player.paused) {
        player.play().catch(() => {});
      } else {
        player.pause();
      }
    });

    player.addEventListener("error", () => {
      player.poster = "";
    });

    const caption = document.createElement("div");
    caption.className = "video-caption";

    const username = document.createElement("h3");
    username.textContent = video.username;

    const description = document.createElement("p");
    description.textContent = video.caption;

    const music = document.createElement("p");
    music.className = "music";
    music.textContent = "♫ " + video.music;

    caption.append(username, description, music);
    screen.append(player, caption);

    const actions = document.createElement("div");
    actions.className = "video-actions";

    const avatar = document.createElement("img");
    avatar.className = "avatar";
    avatar.src = video.avatar;
    avatar.alt = "Creator profile";

    const follow = document.createElement("button");
    follow.className = "follow-button";
    follow.textContent = followed ? "✓" : "+";
    follow.title = followed ? "Unfollow creator" : "Follow creator";

    follow.addEventListener("click", () => {
      if (followedUsers.has(video.username)) {
        followedUsers.delete(video.username);
      } else {
        followedUsers.add(video.username);
      }

      renderVideos(document.getElementById("search").value);
    });

    const likeButton = document.createElement("button");
    likeButton.className = "action-button" + (liked ? " liked" : "");
    likeButton.textContent = liked ? "♥" : "♡";
    likeButton.title = "Like video";

    const likeCount = document.createElement("span");
    likeCount.className = "action-count";
    likeCount.textContent = formatCount(
      video.likes + (liked ? 1 : 0)
    );

    likeButton.addEventListener("click", () => {
      if (likedVideos.has(video.id)) {
        likedVideos.delete(video.id);
      } else {
        likedVideos.add(video.id);
      }

      renderVideos(document.getElementById("search").value);
    });

    const commentButton = document.createElement("button");
    commentButton.className = "action-button";
    commentButton.textContent = "☏";
    commentButton.title = "Comment";

    const commentCount = document.createElement("span");
    commentCount.className = "action-count";
    commentCount.textContent = formatCount(video.comments);

    commentButton.addEventListener("click", () => {
      const comment = prompt("Write a comment on this video:");

      if (comment && comment.trim()) {
        video.comments++;
        alert("Your comment was added to this demo!");
        renderVideos(document.getElementById("search").value);
      }
    });

    const saveButton = document.createElement("button");
    saveButton.className = "action-button";
    saveButton.textContent = saved ? "★" : "♧";
    saveButton.title = saved ? "Remove bookmark" : "Save video";

    const saveCount = document.createElement("span");
    saveCount.className = "action-count";
    saveCount.textContent = formatCount(video.shares);

    saveButton.addEventListener("click", () => {
      if (savedVideos.has(video.id)) {
        savedVideos.delete(video.id);
      } else {
        savedVideos.add(video.id);
      }

      renderVideos(document.getElementById("search").value);
    });

    const shareButton = document.createElement("button");
    shareButton.className = "action-button";
    shareButton.textContent = "➦";
    shareButton.title = "Share video";

    shareButton.addEventListener("click", async () => {
      try {
        if (navigator.share) {
          await navigator.share({
            title: "Check out this video!",
            text: video.caption,
            url: video.src
          });
        } else {
          await navigator.clipboard.writeText(video.src);
          alert("Video link copied!");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          prompt("Copy this video link:", video.src);
        }
      }
    });

    actions.append(
      avatar,
      follow,
      likeButton,
      likeCount,
      commentButton,
      commentCount,
      saveButton,
      saveCount,
      shareButton
    );

    card.append(screen, actions);
    videoFeed.appendChild(card);
  });

  setupAutoplay();
}

let videoObserver;

function setupAutoplay() {
  if (videoObserver) {
    videoObserver.disconnect();
  }

  videoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const player = entry.target;

      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        player.play().catch(() => {});
      } else {
        player.pause();
      }
    });
  }, {
    threshold: [0, 0.6, 1]
  });

  document.querySelectorAll(".video-screen video").forEach(player => {
    videoObserver.observe(player);
  });
}

// Search videos
document.getElementById("search").addEventListener("input", event => {
  renderVideos(event.target.value);
});

// Upload a video from your computer
let uploadedVideoURL = null;

document.getElementById("upload-button").addEventListener("click", () => {
  const fileInput = document.getElementById("video-upload");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a video first.");
    return;
  }

  if (!file.type.startsWith("video/")) {
    alert("Please select a valid video file.");
    return;
  }

  if (uploadedVideoURL) {
    URL.revokeObjectURL(uploadedVideoURL);
  }

  uploadedVideoURL = URL.createObjectURL(file);

  videos.unshift({
    id: Date.now(),
    username: "@MyProfile",
    caption: file.name,
    music: "Original sound - MyProfile",
    src: uploadedVideoURL,
    likes: 0,
    comments: 0,
    shares: 0,
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=MyProfile"
  });

  fileInput.value = "";
  renderVideos();
  document.getElementById("feed").scrollIntoView();
});

// Start the website
renderVideos();
