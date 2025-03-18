import {
  auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "./firebase.js";

import { showLoading, hideLoading } from "./loading.js";

const signUpForm = document.getElementById("signup-form");
const logInForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logoutBtn");
const loginError = document.getElementById("loginError");
const signupError = document.getElementById("signupError");

const username = document.getElementById("username");
const usernameIcon = document.getElementById("username-icon");

// 🔹 Handle Login
if (logInForm) {
  logInForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showLoading();

    const loginEmail = document.getElementById("login-email").value;
    const loginPassword = document.getElementById("login-password").value;

    loginError.textContent = ""; // Clear previous error

    if (!loginEmail || !loginPassword) {
      loginError.textContent = "Please fill in all fields.";
      hideLoading();
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      window.location.href = "../pages/dashboard.html";
    } catch (error) {
      loginError.textContent = error.message.replace("Firebase:", ""); // Show error message
    } finally {
      hideLoading();
    }
  });
}



if (signUpForm) {
  signUpForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showLoading();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;

    signupError.textContent = ""; // Clear previous error

    if (!name || !email || !password || !confirmPassword) {
      signupError.textContent = "Please fill in all fields.";
      hideLoading();
      return;
    }

    if (name.length < 3) {
      signupError.textContent = "Please enter a valid name (at least 3 characters).";
      hideLoading();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      signupError.textContent = "Please enter a valid email address.";
      hideLoading();
      return;
    }

    if (password !== confirmPassword) {
      signupError.textContent = "Passwords do not match.";
      hideLoading();
      return;
    }

    if (password.length < 6) {
      signupError.textContent = "Password must be at least 6 characters long.";
      hideLoading();
      return;
    }

    try {
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      
      await updateProfile(user, { displayName: name });

      
      await auth.currentUser.reload();

      
      await signOut(auth);
      window.location.href = "../pages/account.html";
    } catch (error) {
      signupError.textContent = error.message.replace("Firebase:", "");
    } finally {
      hideLoading();
    }
  });
}



// 🔹 Handle Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    showLoading();
    try {
      await signOut(auth);
      window.location.href = "../pages/account.html";
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      hideLoading();
    }
  });
}


onAuthStateChanged(auth, async (user) => {
  showLoading();
  const currentPath = window.location.pathname;

  const restrictedPages = [
    "/pages/event.html", 
    "/pages/post-event.html", 
    "/pages/dashboard.html",
    "/pages/club.html",
  ];

  if (user) {
    await user.reload()
    const displayName = user.displayName || "User";
    
    if (username) {
      username.textContent = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    }

    if (usernameIcon) {
      usernameIcon.textContent = displayName.charAt(0).toUpperCase();
    }

    if (currentPath === "../pages/account.html") {
      window.location.href = "../pages/dashboard.html";
    }
  } else {
    const isRestricted = restrictedPages.some(page => currentPath.includes(page));

    if (isRestricted) {
      window.location.href = "../pages/account.html";
    }
  }

  hideLoading();
});