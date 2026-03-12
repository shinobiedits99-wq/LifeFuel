const SUPABASE_URL = "https://ypqieapdpixwshhllcut.supabase.co";

const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";

const { createClient } = supabase;

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);


const authContainer = document.getElementById("auth-container");

const appContent = document.getElementById("app-content");


supabaseClient.auth.onAuthStateChange((event, session)=>{

if(session){

authContainer.style.display="none";

appContent.style.display="block";

fetchMeals();

}

else{

authContainer.style.display="block";

appContent.style.display="none";

}

});


document.getElementById("login-btn").addEventListener("click", async()=>{

const email=document.getElementById("email").value;

const password=document.getElementById("password").value;

const {error}=await supabaseClient.auth.signInWithPassword({

email,

password

});

if(error){

alert(error.message);

}

});


document.getElementById("signup-btn").addEventListener("click", async()=>{

const email=document.getElementById("email").value;

const password=document.getElementById("password").value;

const {error}=await supabaseClient.auth.signUp({

email,

password

});

if(error){

alert(error.message);

}

else{

alert("Check your email to confirm signup");

}

});


document.getElementById("logout-btn").addEventListener("click", async()=>{

await supabaseClient.auth.signOut();

});


document.getElementById("add-btn").addEventListener("click", async()=>{

const food=document.getElementById("food-name").value;

const calories=document.getElementById("calories").value;

const {error}=await supabaseClient

.from("meals")

.insert([

{

food_name:food,

calories:calories

}

]);

if(error){

alert(error.message);

}

else{

fetchMeals();

}

});


async function fetchMeals(){

const {data,error}=await supabaseClient

.from("meals")

.select("*")

.order("created_at",{ascending:false});


if(error){

console.log(error);

return;

}


const mealList=document.getElementById("meal-list");

mealList.innerHTML="";


data.forEach(meal=>{

const div=document.createElement("div");

div.innerText=meal.food_name+" - "+meal.calories+" kcal";

mealList.appendChild(div);

});

}
