'use strict';

/**
 * navbar variables
 */

const navOpenBtn = document.querySelector("[data-menu-open-btn]");
const navCloseBtn = document.querySelector("[data-menu-close-btn]");
const navbar = document.querySelector("[data-navbar]");
const overlay = document.querySelector("[data-overlay]");

const navElemArr = [navOpenBtn, navCloseBtn, overlay];

for (let i = 0; i < navElemArr.length; i++) {

  navElemArr[i].addEventListener("click", function () {

    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.classList.toggle("active");

  });

}



/**
 * header sticky
 */

const header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {

  window.scrollY >= 10 ? header.classList.add("active") : header.classList.remove("active");

});



/**
 * go top
 */

const goTopBtn = document.querySelector("[data-go-top]");

window.addEventListener("scroll", function () {

  window.scrollY >= 500 ? goTopBtn.classList.add("active") : goTopBtn.classList.remove("active");

});

document.addEventListener('DOMContentLoaded', function () {
  const searchResults = document.getElementById('searchResults');
  const searchInput = document.getElementById('searchInput');

  // Hide search results and set initial width and visibility
  searchResults.style.display = 'none';
  searchInput.style.width = '0';
  searchInput.style.visibility = 'hidden';
  searchInput.style.pointerEvents = 'none'; // Disable pointer events initially

  document.addEventListener('click', function (event) {
    const searchContainer = document.querySelector('.search-container');

    // Check if the clicked element is outside the search container
    if (!searchContainer.contains(event.target)) {
      searchResults.style.display = 'none';
      searchInput.style.width = '0';
      searchInput.style.visibility = 'hidden';
      searchInput.style.pointerEvents = 'none'; // Disable pointer events when hidden
    }
  });

  document.querySelector('.search-btn').addEventListener('click', function (event) {
    // Prevent the click event from propagating to the document
    event.stopPropagation();

    // Toggle the display and width of the search results
    if (searchResults.style.display === 'none') {
      searchResults.style.display = 'block';
      searchInput.style.width = '200px';
      searchInput.style.visibility = 'visible';
      searchInput.style.pointerEvents = 'auto'; // Enable pointer events when visible
      searchInput.focus(); // Optional: automatically focus on the input field
    } else {
      searchResults.style.display = 'none';
      searchInput.style.width = '0';
      searchInput.style.visibility = 'hidden';
      searchInput.style.pointerEvents = 'none'; // Disable pointer events when hidden
    }
  });
});


document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('searchInput');
  const searchForm = document.getElementById('searchForm');

  searchInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchForm.submit();
    }
  });
});

const apiKey = 'AIzaSyDHJPT0XZauRMWo3zhG062F-TI3ZFN-qck';
const playerContainer = document.getElementById('player');
let player;

function openYouTubePlayer(videoId) {
  // Create a new iframe for the YouTube player
  playerContainer.innerHTML = '<iframe id="youtubeIframe" width="560" height="315" src="https://www.youtube.com/embed/' + videoId + '?enablejsapi=1&autoplay=1" frameborder="0" allowfullscreen></iframe>';

  // Display the modal
  document.getElementById('youtubeModal').style.display = 'flex';

  // Load the YouTube player API script
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // Set up the YouTube player when the API is ready
  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player('youtubeIframe', {
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange,
        'onError': onPlayerError
      }
    });
  };
}

function onPlayerError(event) {
  console.log(event.target)
}

function onPlayerReady(event) {
  // You can do something when the player is ready
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  // You can do something when the player state changes
  // For example, close the modal when the video ends
  if (event.data === YT.PlayerState.ENDED) {
    closeYouTubePlayer();
  }
}

function closeYouTubePlayer() {
  // Stop and destroy the YouTube player
  if (player) {
    player.stopVideo();
    player.destroy();
  }
  // Hide the modal
  document.getElementById('youtubeModal').style.display = 'none';
}

function copyText(value) {
  // Create a textarea element to hold the text temporarily
  var textarea = document.createElement("textarea");
  textarea.value = value;

  // Append the textarea to the document
  document.body.appendChild(textarea);

  // Select the text in the textarea
  textarea.select();
  textarea.setSelectionRange(0, 99999); // For mobile devices

  // Execute the copy command
  document.execCommand("copy");

  // Remove the textarea from the document
  document.body.removeChild(textarea);

  // You can optionally provide user feedback (e.g., alert or display a message)
  alert("Text copied to clipboard!");
}