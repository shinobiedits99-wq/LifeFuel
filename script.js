// LifeFule AI - Supabase Setup

const SUPABASE_URL = "https://ypqieapdpixwshhllcut.supabase.co";

const SUPABASE_KEY = "sb_publishable_g0i8LwUmbxd1_KZ3HG6vDA_uYBWFHO-";

const { createClient } = supabase;

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);


// UI elements
const authContainer = document.getElementById("auth-container");
const appContent = document.getElementById("app-content");
const mealList = document.getElementById("meal-list");


// Auth state listener
supabaseClient.auth.onAuthStateChange((event, session) => {

if (session) {

authContainer.style.display = "none";
appContent.style.display = "block";

fetchMeals();

} else {

authContainer.style.display = "block";
appContent.style.display = "none";

}

});


// LOGIN
document.getElementById("login-btn").addEventListener("click", async () => {

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { error } = await supabaseClient.auth.signInWithPassword({
email: email,
password: password
});

if (error) {
alert("Login Error: " + error.message);
}

});


// SIGNUP
document.getElementById("signup-btn").addEventListener("click", async () => {

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { error } = await supabaseClient.auth.signUp({
email: email,
password: password
});

if (error) {

alert("Signup Error: " + error.message);

} else {

alert("Signup successful! Check your email.");

}

});


// LOGOUT
document.getElementById("logout-btn").addEventListener("click", async () => {

await supabaseClient.auth.signOut();

});


// ADD MEAL
document.getElementById("add-btn").addEventListener("click", async () => {

const food = document.getElementById("food-name").value;
const calories = document.getElementById("calories").value;

const { error } = await supabaseClient
.from("meals")
.insert([
{
food_name: food,
calories: calories
}
]);

if (error) {

alert("Error saving meal: " + error.message);

} else {

fetchMeals();

}

});


// FETCH MEALS
async function fetchMeals() {

const { data, error } = await supabaseClient
.from("meals")
.select("*")
.order("created_at", { ascending: false });

if (error) {

console.log(error);
return;

}

mealList.innerHTML = "";

data.forEach(meal => {

const div = document.createElement("div");

div.innerText = meal.food_name + " - " + meal.calories + " kcal";

mealList.appendChild(div);

});

}
