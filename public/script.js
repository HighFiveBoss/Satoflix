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