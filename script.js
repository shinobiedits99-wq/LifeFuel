const SUPABASE_URL = "https://ypqieapdpixwshhllcut.supabase.co"

const SUPABASE_KEY = "YOUR_PUBLIC_KEY"

const supabase = window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
)

async function signUp(){

const email = document.getElementById("email").value

const password = document.getElementById("password").value

const { error } = await supabase.auth.signUp({
email,
password
})

if(error){

alert(error.message)

}else{

alert("Account created!")

}

}

async function login(){

const email = document.getElementById("email").value

const password = document.getElementById("password").value

const { error } = await supabase.auth.signInWithPassword({
email,
password
})

if(error){

alert(error.message)

}else{

alert("Login successful!")

}

}
