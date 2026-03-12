// --- AUTH LOGIC ---
const authContainer = document.getElementById('auth-container');
const appContent = document.getElementById('app-content');

// Check for active session
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    authContainer.style.display = 'none';
    appContent.style.display = 'block';
    fetchMeals(); // Only fetch data when we know who the user is
  } else {
    authContainer.style.display = 'block';
    appContent.style.display = 'none';
  }
});

// Sign Up
document.getElementById('signup-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) alert(error.message);
  else alert("Check your email for the confirmation link!");
});

// Login
document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
});

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabase.auth.signOut();
});-- Allow anyone to read and insert for now (good for testing)
alter table meals enable row level security;

create policy "Allow public access" 
on meals for all 
using (true);// ============================================
// LifeFuel AI – Main Application Script
// Includes: 3D Background, Auth, Meal Tracking,
//           Chart, AI Insights, Mock Payment
// ============================================

(function() {
    "use strict";

    // ---------- Configuration ----------
    const SUPABASE_URL = 'https://your-project.supabase.co';  // Replace with your Supabase URL
    const SUPABASE_ANON_KEY = 'your-anon-key';                // Replace with your Supabase anon key
    const USE_MOCK_AUTH = true;  // Set to false when using real Supabase

    // ---------- DOM Elements ----------
    const canvasContainer = document.getElementById('canvas-container');
    const authBtn = document.getElementById('auth-btn');
    const proBtn = document.getElementById('pro-btn');
    const mealListContainer = document.getElementById('meal-list-container');
    const calorieChartCanvas = document.getElementById('calorieChart');
    const aiInsightDiv = document.getElementById('ai-insight');

    // ---------- Global State ----------
    let isAuthenticated = false;
    let isPro = false;
    let meals = [];  // Array of { name, calories, date }

    // ---------- 1. Three.js 3D Background ----------
    function initThree() {
        if (!canvasContainer) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0f);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 2, 22);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        canvasContainer.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x404060);
        scene.add(ambientLight);
        const pointLight1 = new THREE.PointLight(0x8b5cf6, 1.2, 30);
        pointLight1.position.set(6, 4, 10);
        scene.add(pointLight1);
        const pointLight2 = new THREE.PointLight(0x22d3ee, 0.8, 30);
        pointLight2.position.set(-6, -3, 10);
        scene.add(pointLight2);

        // Main object: Torus Knot (glowing, wireframe)
        const geometry = new THREE.TorusKnotGeometry(3.5, 1.0, 200, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x8b5cf6,
            emissive: 0x2a1b4a,
            wireframe: true,
            transparent: true,
            opacity: 0.25
        });
        const knot = new THREE.Mesh(geometry, material);
        scene.add(knot);

        // Particles
        const particlesGeo = new THREE.BufferGeometry();
        const particlesCount = 2000;
        const positions = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 80;
            positions[i+1] = (Math.random() - 0.5) * 80;
            positions[i+2] = (Math.random() - 0.5) * 80;
        }
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMat = new THREE.PointsMaterial({
            size: 0.1,
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        const particles = new THREE.Points(particlesGeo, particlesMat);
        scene.add(particles);

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            knot.rotation.x += 0.0008;
            knot.rotation.y += 0.0015;
            particles.rotation.y += 0.0002;
            renderer.render(scene, camera);
        }
        animate();

        // Resize handler
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // ---------- 2. Mock Authentication (replace with Supabase) ----------
    function initAuth() {
        const storedAuth = localStorage.getItem('lifefuel_auth');
        isAuthenticated = storedAuth === 'true';
        updateAuthButton();

        authBtn.addEventListener('click', toggleAuth);
    }

    function toggleAuth() {
        if (USE_MOCK_AUTH) {
            isAuthenticated = !isAuthenticated;
            localStorage.setItem('lifefuel_auth', isAuthenticated);
            updateAuthButton();
            showNotification(isAuthenticated ? 'Signed in (mock)' : 'Signed out (mock)');
            if (isAuthenticated) loadUserMeals(); else meals = [];
            updateMealList();
            updateChart();
        } else {
            // Real Supabase integration would go here
            console.log('Using Supabase auth');
        }
    }

    function updateAuthButton() {
        authBtn.innerHTML = isAuthenticated ? '<i class="fas fa-user-check mr-2"></i>Dashboard' : '<i class="fas fa-sign-in-alt mr-2"></i>Sign In';
    }

    // ---------- 3. Mock Payment (Upgrade to Pro) ----------
    function initPayment() {
        proBtn.addEventListener('click', () => {
            // In a real app, you'd redirect to your payment provider (not Stripe)
            // For demo, we simulate a successful upgrade
            if (confirm('Upgrade to Pro for $9.99/month? (Mock payment)')) {
                isPro = true;
                localStorage.setItem('lifefuel_pro', 'true');
                proBtn.disabled = true;
                proBtn.innerHTML = '<i class="fas fa-crown mr-2"></i>Pro Active';
                proBtn.classList.remove('from-amber-500', 'to-orange-500');
                proBtn.classList.add('from-violet-600', 'to-indigo-600');
                showNotification('🎉 Welcome to Pro!');
            }
        });

        // Check stored pro status
        const storedPro = localStorage.getItem('lifefuel_pro');
        if (storedPro === 'true') {
            isPro = true;
            proBtn.disabled = true;
            proBtn.innerHTML = '<i class="fas fa-crown mr-2"></i>Pro Active';
            proBtn.classList.remove('from-amber-500', 'to-orange-500');
            proBtn.classList.add('from-violet-600', 'to-indigo-600');
        }
    }

    // ---------- 4. Meal Management ----------
    function initMealTracking() {
        // Create Add Meal form dynamically inside the first glass-card (Account)
        const accountCard = document.querySelector('.glass-card:first-child');
        if (!accountCard) return;

        // Build form if not present
        if (!document.getElementById('meal-form')) {
            const formHtml = `
                <div id="meal-form" class="mt-8">
                    <h3 class="text-xl font-semibold mb-4 flex items-center gap-2"><i class="fas-regular fa-plus-circle text-emerald-400"></i> Add Meal</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" id="meal-name" placeholder="Meal name (e.g., Chicken Salad)" class="bg-black/40 p-3 rounded-xl border border-white/10 focus:border-violet-400 outline-none">
                        <input type="number" id="meal-calories" placeholder="Calories" class="bg-black/40 p-3 rounded-xl border border-white/10 focus:border-violet-400 outline-none">
                        <button id="add-meal-btn" class="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                            <i class="fas fa-plus"></i> Log Meal
                        </button>
                    </div>
                </div>
            `;
            accountCard.insertAdjacentHTML('beforeend', formHtml);
        }

        // Load meals from localStorage
        const savedMeals = localStorage.getItem('lifefuel_meals');
        if (savedMeals) {
            try { meals = JSON.parse(savedMeals); } catch(e) { meals = []; }
        } else {
            // Demo meals
            meals = [
                { name: 'Breakfast Oats', calories: 350, date: new Date().toLocaleDateString() },
                { name: 'Grilled Chicken', calories: 420, date: new Date().toLocaleDateString() },
                { name: 'Protein Shake', calories: 180, date: new Date().toLocaleDateString() }
            ];
        }

        // Event listener for add button
        document.getElementById('add-meal-btn')?.addEventListener('click', addMeal);

        // Initial display
        updateMealList();
        updateChart();
    }

    function addMeal() {
        const nameInput = document.getElementById('meal-name');
        const calInput = document.getElementById('meal-calories');
        const name = nameInput.value.trim();
        const calories = parseInt(calInput.value);

        if (!name || isNaN(calories) || calories <= 0) {
            showNotification('Please enter a valid meal name and calories', 'error');
            return;
        }

        meals.push({
            name: name,
            calories: calories,
            date: new Date().toLocaleDateString()
        });

        // Save to localStorage
        localStorage.setItem('lifefuel_meals', JSON.stringify(meals));

        // Clear inputs
        nameInput.value = '';
        calInput.value = '';

        // Update UI
        updateMealList();
        updateChart();
        generateAIInsight(); // new insight after meal
        showNotification('Meal added!');
    }

    function updateMealList() {
        if (!mealListContainer) return;
        if (meals.length === 0) {
            mealListContainer.innerHTML = '<p class="text-white/40 text-center py-8">No meals logged yet. Add your first meal above.</p>';
            return;
        }

        // Show last 5 meals
        const recentMeals = meals.slice(-5).reverse();
        let html = '<ul class="space-y-3">';
        recentMeals.forEach(meal => {
            html += `<li class="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                <span><i class="fas fa-utensils text-emerald-400 mr-2"></i>${meal.name}</span>
                <span class="font-bold text-violet-300">${meal.calories} kcal</span>
            </li>`;
        });
        html += '</ul>';
        mealListContainer.innerHTML = html;
    }

    // ---------- 5. Chart (Calorie History) ----------
    let calorieChart = null;
    function updateChart() {
        if (!calorieChartCanvas) return;

        // Prepare data: last 7 days totals
        const last7Days = [];
        const labels = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString();
            labels.push(dateStr.slice(0, 5)); // short format
            const total = meals
                .filter(m => m.date === dateStr)
                .reduce((sum, m) => sum + m.calories, 0);
            last7Days.push(total);
        }

        if (calorieChart) {
            calorieChart.data.labels = labels;
            calorieChart.data.datasets[0].data = last7Days;
            calorieChart.update();
        } else {
            const ctx = calorieChartCanvas.getContext('2d');
            calorieChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Calories',
                        data: last7Days,
                        backgroundColor: 'rgba(139, 92, 246, 0.7)',
                        borderRadius: 8,
                        barPercentage: 0.6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    }

    // ---------- 6. AI Assistant (Mock Insights) ----------
    function generateAIInsight() {
        if (!aiInsightDiv) return;

        const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
        const avgCalories = meals.length ? Math.round(totalCalories / meals.length) : 0;
        const lastMeal = meals[meals.length-1];

        let insight = '';
        if (meals.length === 0) {
            insight = '👋 Start logging meals to get personalized AI insights.';
        } else {
            const suggestions = [
                `Based on your meals, you average ${avgCalories} kcal per meal.`,
                `Your last meal was "${lastMeal.name}" (${lastMeal.calories} kcal).`,
                `Try adding more protein to balance your intake.`,
                `You're doing great! Keep logging to unlock advanced analytics.`
            ];
            insight = suggestions[Math.floor(Math.random() * suggestions.length)];
        }

        aiInsightDiv.innerHTML = `<i class="fas fa-robot text-violet-400 mr-3"></i>${insight}`;
    }

    // ---------- 7. Stats Cards (update dynamically) ----------
    function updateStats() {
        const totalMeals = meals.length;
        const totalCals = meals.reduce((sum, m) => sum + m.calories, 0);
        const avgCals = totalMeals ? Math.round(totalCals / totalMeals) : 0;
        const streak = calculateStreak();

        // Find stats container
        const statsGrid = document.querySelector('.grid-cols-2.md\\:grid-cols-4');
        if (statsGrid) {
            const statCards = statsGrid.children;
            if (statCards.length >= 4) {
                statCards[0].innerHTML = `<i class="fas fa-utensils text-3xl text-violet-400 mb-2"></i><div class="text-2xl font-bold">${totalMeals}</div><div class="text-xs text-white/40">Total Meals</div>`;
                statCards[1].innerHTML = `<i class="fas fa-fire text-3xl text-orange-400 mb-2"></i><div class="text-2xl font-bold">${totalCals}</div><div class="text-xs text-white/40">Total Calories</div>`;
                statCards[2].innerHTML = `<i class="fas fa-chart-line text-3xl text-emerald-400 mb-2"></i><div class="text-2xl font-bold">${avgCals}</div><div class="text-xs text-white/40">Avg per Meal</div>`;
                statCards[3].innerHTML = `<i class="fas fa-calendar-check text-3xl text-blue-400 mb-2"></i><div class="text-2xl font-bold">${streak}</div><div class="text-xs text-white/40">Day Streak</div>`;
            }
        }
    }

    function calculateStreak() {
        // Simple mock streak based on unique dates
        const uniqueDates = new Set(meals.map(m => m.date));
        return uniqueDates.size;
    }

    // ---------- 8. Notification System (Simple) ----------
    function showNotification(msg, type = 'success') {
        // Create a temporary toast
        const toast = document.createElement('div');
        toast.className = `fixed top-5 right-5 z-50 px-6 py-3 rounded-2xl text-white font-medium shadow-2xl animate-bounceIn ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>${msg}`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    // ---------- 9. Load User Meals (if authenticated) ----------
    function loadUserMeals() {
        // In mock mode, just use localStorage
        const saved = localStorage.getItem('lifefuel_meals');
        if (saved) {
            try { meals = JSON.parse(saved); } catch(e) { meals = []; }
        }
    }

    // ---------- 10. Initialize Everything ----------
    function init() {
        initThree();
        initAuth();
        initPayment();
        initMealTracking();
        generateAIInsight();

        // Update stats periodically (e.g., after meal added)
        // We'll call updateStats after each meal add and chart update
        // But also set an interval to refresh AI
        setInterval(() => {
            generateAIInsight();
            updateStats();
        }, 30000);

        // Add a small bounce animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); opacity: 1; }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
            }
            .animate-bounceIn { animation: bounceIn 0.5s ease; }
        `;
        document.head.appendChild(style);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const suggestBtn = document.getElementById('suggest-btn');
const aiSuggestion = document.getElementById('ai-suggestion');
const aiStatus = document.getElementById('ai-status');

suggestBtn.addEventListener('click', () => {
    const currentCals = parseInt(totalCalsDisplay.innerText);
    const goal = 2000;
    const remaining = goal - currentCals;

    aiStatus.innerText = "AI is thinking...";
    aiSuggestion.innerText = "";

    // Simulate "AI thinking" delay
    setTimeout(() => {
        let suggestion = "";

        if (remaining <= 0) {
            suggestion = "You've hit your goal! Stick to water or herbal tea for the rest of the day. 💧";
        } else if (remaining < 300) {
            suggestion = "You're almost there! Try a light snack like a handful of almonds or a Greek yogurt. 🥄";
        } else if (remaining < 700) {
            suggestion = "You have room for a solid meal. How about Grilled Salmon with quinoa and steamed broccoli? 🐟";
        } else {
            suggestion = "You need fuel! A hearty bowl of Oatmeal with bananas and peanut butter would be a great start. 🥣";
        }

        aiStatus.innerText = "AI Recommendation:";
        aiSuggestion.innerText = suggestion;
    }, 800);
});
addBtn.addEventListener('click', async () => {
    const name = foodInput.value;
    const cals = parseInt(calInput.value);
    // Get selected category
    const category = document.querySelector('input[name="category"]:checked').value;

    if (!name || !cals) return alert("Please fill in both fields!");

    const { error } = await supabase
        .from('meals')
        .insert([{ food_name: name, calories: cals, category: category }]);

    if (error) {
        alert("Error saving meal!");
    } else {
        foodInput.value = '';
        calInput.value = '';
        fetchMeals();
    }
});
const icons = { Breakfast: '🍳', Lunch: '🥪', Dinner: '🥩', Snack: '🥤' };

function renderMeals(meals) {
    mealList.innerHTML = '';
    let total = 0;

    meals.forEach(meal => {
        total += meal.calories;
        const icon = icons[meal.category] || '🍽️';
        const div = document.createElement('div');
        div.className = 'meal-item';
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.2rem;">${icon}</span>
                <div>
                    <strong>${meal.food_name}</strong><br>
                    <small style="opacity: 0.6;">${meal.category} • ${meal.calories} kcal</small>
                </div>
            </div>
            <button class="delete-btn" onclick="deleteMeal(${meal.id})">✕</button>
        `;
        mealList.appendChild(div);
    });
    totalCalsDisplay.innerText = total;
}
async function fetchMeals() {
    // 1. Get the start of the current day (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.toISOString();

    // 2. Fetch meals created ONLY today
    const { data, error } = await supabase
        .from('meals')
        .select('*')
        .gte('created_at', startOfDay) // "Greater than or equal to" start of today
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching:', error);
    } else {
        renderMeals(data);
    }
}
const historyToggle = document.getElementById('show-all');

historyToggle.addEventListener('change', fetchMeals);

async function fetchMeals() {
    let query = supabase.from('meals').select('*');

    // Only filter if "Show all-time" is UNCHECKED
    if (!historyToggle.checked) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('created_at', today.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (!error) renderMeals(data);
}
const { data: { user } } = await supabase.auth.getUser();

const { error } = await supabase
    .from('meals')
    .insert([{ 
        food_name: name, 
        calories: cals, 
        category: category,
        user_id: user.id // Tie the meal to the logged-in user
    }]);
