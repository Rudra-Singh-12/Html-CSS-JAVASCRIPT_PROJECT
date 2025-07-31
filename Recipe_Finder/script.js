// DOM Elements: These constants store references to the HTML elements the script will interact with.
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

// API URLs: These constants define the endpoints for TheMealDB API.
const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`; // URL to search for meals by name
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`; // URL to look up a single meal by its ID

// --- Event Listeners ---

// Triggers the search function when the search button is clicked.
searchBtn.addEventListener("click", searchMeals);

// Attaches a single click listener to the container for all meal cards.
// This uses event delegation to efficiently handle clicks on dynamically added meals.
mealsContainer.addEventListener("click", handleMealClick);

// Hides the meal details view when the "Back" button is clicked.
backBtn.addEventListener("click", () => {
    mealDetails.classList.add("hidden");
});

// Allows the user to initiate a search by pressing the "Enter" key in the input field.
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchMeals();
    }
});

// --- Core Functions ---

/**
 * Fetches meals from the API based on the user's search term and displays them.
 * This is an async function because it uses 'await' to handle the API request.
 */
async function searchMeals() {
    // Get the user's input and remove any leading/trailing whitespace.
    const searchTerm = searchInput.value.trim();

    // Validate the input to ensure it's not empty.
    if (!searchTerm) {
        errorContainer.textContent = "Please enter a search term";
        errorContainer.classList.remove("hidden");
        return;
    }

    // A try...catch block is used to handle potential network errors during the API call.
    try {
        // Provide user feedback that a search is in progress.
        resultHeading.textContent = `Searching for "${searchTerm}"...`;
        // Clear any previous search results and errors.
        mealsContainer.innerHTML = "";
        errorContainer.classList.add("hidden");

        // Make an asynchronous call to the API to fetch meal data.
        // The 'await' keyword pauses the function until the request completes.
        const response = await fetch(`${SEARCH_URL}${searchTerm}`);
        // Parse the JSON response body into a JavaScript object.
        const data = await response.json();

        // Check if the API returned any meals. `data.meals` will be null if no results are found.
        if (data.meals === null) {
            // Inform the user that no recipes were found for their search term.
            resultHeading.textContent = ``;
            mealsContainer.innerHTML = "";
            errorContainer.textContent = `No recipes found for "${searchTerm}". Try another search term!`;
            errorContainer.classList.remove("hidden");
        } else {
            // If meals are found, update the heading and display the results.
            resultHeading.textContent = `Search results for "${searchTerm}":`;
            // Call the helper function to render the meal cards to the DOM.
            displayMeals(data.meals);
            // Clear the search input field for the next search.
            searchInput.value = "";
        }
    } catch (error) {
        // Catch any errors (e.g., network failure) and display a generic error message.
        errorContainer.textContent = "Something went wrong. Please try again later.";
        errorContainer.classList.remove("hidden");
    }
}

/**
 * Renders an array of meal objects to the DOM as clickable cards.
 * @param {Array<Object>} meals - An array of meal objects from the API.
 */
function displayMeals(meals) {
    mealsContainer.innerHTML = "";
    // Loop through each meal and create its corresponding HTML element.
    meals.forEach((meal) => {
        // Note: `data-meal-id` is a custom data attribute used to store the meal's unique ID.
        // This ID is crucial for fetching the full recipe details later.
        mealsContainer.innerHTML += `
      <div class="meal" data-meal-id="${meal.idMeal}">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <div class="meal-info">
          <h3 class="meal-title">${meal.strMeal}</h3>
          ${meal.strCategory ? `<div class="meal-category">${meal.strCategory}</div>` : ""}
        </div>
      </div>
    `;
    });
}

/**
 * Handles the click event on a meal card to fetch and display its full details.
 * @param {Event} e - The click event object.
 */
async function handleMealClick(e) {
    // `e.target.closest('.meal')` finds the nearest parent element with the class "meal".
    // This ensures we get the meal card, even if the user clicks on an image or title inside it.
    const mealEl = e.target.closest(".meal");

    // If the click was outside a meal card, do nothing.
    if (!mealEl) return;

    // Retrieve the unique meal ID stored in the `data-meal-id` attribute.
    const mealId = mealEl.getAttribute("data-meal-id");

    try {
        // Fetch the detailed information for the specific meal using its ID.
        const response = await fetch(`${LOOKUP_URL}${mealId}`);
        const data = await response.json();

        // Ensure the API returned a valid meal object.
        if (data.meals && data.meals[0]) {
            const meal = data.meals[0];

            // The API returns up to 20 ingredients and measures in separate properties (e.g., strIngredient1, strMeasure1).
            // This loop collects them into a clean array of objects.
            const ingredients = [];
            for (let i = 1; i <= 20; i++) {
                if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== "") {
                    ingredients.push({
                        ingredient: meal[`strIngredient${i}`],
                        measure: meal[`strMeasure${i}`],
                    });
                }
            }

            // Populate the meal details container with the fetched data.
            mealDetailsContent.innerHTML = `
           <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-details-img">
           <h2 class="meal-details-title">${meal.strMeal}</h2>
           <div class="meal-details-category">
             <span>${meal.strCategory || "Uncategorized"}</span>
           </div>
           <div class="meal-details-instructions">
             <h3>Instructions</h3>
             <p>${meal.strInstructions}</p>
           </div>
           <div class="meal-details-ingredients">
             <h3>Ingredients</h3>
             <ul class="ingredients-list">
               ${ingredients
                 .map(
                   (item) => `
                 <li><i class="fas fa-check-circle"></i> ${item.measure} ${item.ingredient}</li>
               `
                 )
                 .join("")}
             </ul>
           </div>
           ${
             meal.strYoutube
               ? `
             <a href="${meal.strYoutube}" target="_blank" class="youtube-link">
               <i class="fab fa-youtube"></i> Watch Video
             </a>
           `
               : ""
           }
         `;

            // Make the meal details section visible and scroll it into view.
            mealDetails.classList.remove("hidden");
            mealDetails.scrollIntoView({ behavior: "smooth" });
        }
    } catch (error) {
        // Handle errors that might occur while fetching recipe details.
        errorContainer.textContent = "Could not load recipe details. Please try again later.";
        errorContainer.classList.remove("hidden");
    }
}