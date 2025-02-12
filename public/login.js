document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  
  // Example validation
  if (username === "faculty" && password === "password") {
    window.location.href = "/menu"; // Redirect to Menu page on success
  } else {
    alert("Invalid credentials!");
  }
});