// 1. Initialize Supabase with your project details
const SUPABASE_URL = 'https://ypqieapdpixwshhllcut.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcWllYXBkcGl4d3NoaGxsY3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMDQ4NDcsImV4cCI6MjA4ODc4MDg0N30.DLZ5ArWsh-Jdwr-VzJ-n4sHqM0zEIl2EGZ6Uoabl2fw';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Auth State Management
supabase.auth.onAuthStateChange((event, session) => {
    const authContainer = document.getElementById('auth-container');
    const appContent = document.getElementById('app-content');
    
    if (session) {
        // User is logged in
        if (authContainer) authContainer.style.display = 'none';
        if (appContent) appContent.style.display = 'block';
        fetchMeals();
    } else {
        // User is logged out
        if (authContainer) authContainer.style.display = 'block';
        if (appContent) appContent.style.display = 'none';
    }
});

// 3. Authentication Functions
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Login Error: " + error.message);
});

document.getElementById('signup-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert("Signup Error: " + error.message);
    else alert("Check your email for confirmation!");
});

document.getElementById('logout-btn').addEventListener('click', () => {
    supabase.auth.signOut();
});

// 4. Data Functions
async function fetchMeals() {
    const { data, error } = await supabase.from('meals').select('*').order('created_at', { ascending: false });
    if (error) console.error("Error fetching meals:", error.message);
    else {
        const mealList = document.getElementById('meal-list');
        if (mealList) {
            mealList.innerHTML = data.map(m => `<div>${m.food_name} - ${m.calories} kcal</div>`).join('');
        }
    }
}
