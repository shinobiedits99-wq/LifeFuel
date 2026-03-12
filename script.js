const SUPABASE_URL = 'https://ypqieapdpixwshhllcut.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwcWllYXBkcGl4d3NoaGxsY3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMDQ4NDcsImV4cCI6MjA4ODc4MDg0N30.DLZ5ArWsh-Jdwr-VzJ-n4sHqM0zEIl2EGZ6Uoabl2fw';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Handle UI visibility
supabase.auth.onAuthStateChange((event, session) => {
    document.getElementById('auth-container').style.display = session ? 'none' : 'block';
    document.getElementById('app-content').style.display = session ? 'block' : 'none';
    if (session) fetchMeals();
});

document.getElementById('login-btn').onclick = async () => {
    const { error } = await supabase.auth.signInWithPassword({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    });
    if (error) alert(error.message);
};

document.getElementById('add-btn').onclick = async () => {
    const name = document.getElementById('food-name').value;
    const cals = document.getElementById('calories').value;
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('meals').insert([{ 
        food_name: name, calories: cals, user_id: user.id 
    }]);
    if (error) alert(error.message); else { alert("Added!"); fetchMeals(); }
};

async function fetchMeals() {
    const { data } = await supabase.from('meals').select('*');
    document.getElementById('meal-list').innerHTML = data.map(m => `<div>${m.food_name}</div>`).join('');
}

document.getElementById('logout-btn').onclick = () => supabase.auth.signOut();
