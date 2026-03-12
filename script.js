const SUPABASE_URL = 'https://ypqieapdpixwshhllcut.supabase.co';
const SUPABASE_KEY = 'YOUR_REAL_ANON_KEY_HERE';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth Logic
supabaseClient.auth.onAuthStateChange((event, session) => {
    const authBox = document.getElementById('auth-container');
    const appBox = document.getElementById('app-content');
    
    if (session) {
        authBox.style.display = 'none';
        appBox.style.display = 'block';
        refreshData();
    } else {
        authBox.style.display = 'flex';
        appBox.style.display = 'none';
    }
});

// Sign Up / Login
document.getElementById('signup-btn').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) alert(error.message); else alert("Check your email!");
};

document.getElementById('login-btn').onclick = async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
};

document.getElementById('logout-btn').onclick = () => supabaseClient.auth.signOut();

// Meal Logic
async function refreshData() {
    await fetchMeals();
    await updateChart();
    await updateStreaks();
}

document.getElementById('add-btn').onclick = async () => {
    const name = document.getElementById('food-name').value;
    const cals = parseInt(document.getElementById('calories').value);
    const cat = document.querySelector('input[name="category"]:checked').value;
    
    const { data: { user } } = await supabaseClient.auth.getUser();

    const { error } = await supabaseClient.from('meals').insert([{ 
        food_name: name, calories: cals, category: cat, user_id: user.id 
    }]);

    if (!error) {
        document.getElementById('food-name').value = '';
        document.getElementById('calories').value = '';
        refreshData();
    }
};

async function fetchMeals() {
    const showAll = document.getElementById('show-all').checked;
    let query = supabaseClient.from('meals').select('*');

    if (!showAll) {
        const today = new Date();
        today.setHours(0,0,0,0);
        query = query.gte('created_at', today.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error) renderList(data);
}

function renderList(meals) {
    const list = document.getElementById('meal-list');
    const icons = { Breakfast: '🍳', Lunch: '🥪', Dinner: '🥩', Snack: '🥤' };
    let total = 0;
    list.innerHTML = '';

    meals.forEach(m => {
        total += m.calories;
        list.innerHTML += `
            <div class="meal-item">
                <span>${icons[m.category] || '🍽️'} <strong>${m.food_name}</strong></span>
                <span>${m.calories} kcal <button class="del" onclick="deleteMeal(${m.id})">✕</button></span>
            </div>`;
    });
    document.getElementById('total-cals').innerText = total;
}

window.deleteMeal = async (id) => {
    await supabaseClient.from('meals').delete().eq('id', id);
    refreshData();
};

document.getElementById('show-all').onchange = fetchMeals;

// Initial Chart Placeholder
let myChart;
async function updateChart() {
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ label: 'Kcal', data: [1200, 1900, 1500, 2100, 1800, 0, 0], backgroundColor: '#00ff88' }] },
        options: { color: 'white' }
    });
}
