// DOM Elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

// api url 
const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`;
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;

searchBtn.addEventListener("click", searchMeals);

mealsContainer.addEventListener("click",handleMealClick);

backBtn.addEventListener("click",()=>{
    mealDetails.classList.add("hidden");
})

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter")
        searchMeals()
});

async function searchMeals() {
    // getting the search value from user through input without whitespaces
    const searchTerm = searchInput.value.trim();

    // handle the edge case
    if (!searchTerm) {
        errorContainer.textContent = "Please enter a search term",
            errorContainer.classList.remove("hidden");
        return;
    }
    // searching the meals in try block and error is handle by catch block
    try {
        // display the name for the search 
        resultHeading.textContent = `Searching for "${searchTerm}" ...`;
        // value of mealsContainer is none
        mealsContainer.innerHTML = "";
        // adding the features of class hidden from css
        errorContainer.classList.add("hidden");

        // fetching the meals from API
        const response = await fetch(`${SEARCH_URL}${searchTerm}`);
        // getting the data from api in json format
        const data = await response.json();
        // displaying the data in console
        console.log("data is here:", data);
        // handle edge case
        if (data.meals === null) {
            // no meals found case
            resultHeading.textContent = ``;
            mealsContainer.innerHTML = "";
            errorContainer.textContent = `No recipes found for "${searchTerm}".Try another search term!`;
            errorContainer.classList.remove("hidden");
        } else {
          // displaying the meal  text content in web
            resultHeading.textContent = `Search results for "${searchTerm}":`;
            // calling the displayMeals function to display the results from api
            displayMeals(data.meals);
            searchTerm.value = "";

        }

    } catch (error) { // handling the error in this block
        errorContainer.textContent = "Something went wrong. Please try again later."
        errorContainer.classList.remove("hidden");
    }
}
// methods to display the content in browser
function displayMeals(meals) {
    mealsContainer.innerHTML = "";
    // loop through meals and create a card for each meal from api result
    meals.forEach((meal) => {
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

// handling the click event on meal card-> onclick the description about the meals is generated through api
async function handleMealClick(e){
  // mealEl card 
    const mealEl=e.target.closest(".meal");
    // getting the id of the meal card
    const mealId=mealEl.getAttribute("data-meal-id");
    // edge case if mealId is null -> return
    if(!mealId) return;

    // handling the click event in try block
    try {
      // getting the response from api
        const response=await fetch(`${LOOKUP_URL}${mealId}`);
        // data from api
        const data=await response.json();
        // displaying the data on console
        console.log(data);
        // data,meals and data.meals[0] are coming from api response 
        if(data.meals && data.meals[0]){
          // data of click meal
            const meal=data.meals[0];
            // array to store the ingredient from api
            const ingredients=[];
            // display the ingredient 
            for(let i=1;i<20;i++){
                if(meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim()!==""){
                    ingredients.push({
                        ingredient:meal[`strIngredient${i}`],
                        measure:meal[`strMeasure${i}`]
                    })
                }
            }
            // display meal details
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

      mealDetails.classList.remove("hidden");
      mealDetails.scrollIntoView({ behavior: "smooth" });
    }
    // handling the edge case
  } catch (error) {
    errorContainer.textContent = "Could not load recipe details. Please try again later.";
    errorContainer.classList.remove("hidden");
  }
}