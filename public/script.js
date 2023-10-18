const { name } = require("ejs");

function validateForm()
    {
        document.getElementById('email-error').textContent = '';
        document.getElementById('password-error').textContent = '';
        document.getElementById('name-error').textContent = '';
        document.getElementById('mobile-error').textContent = '';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email) 
        {
            document.getElementById('email-error').textContent = 'Email field should not be empty';
            return false;
        }

        if (!name) 
        {
            document.getElementById('name-error').textContent = 'Name field should not be empty';
            return false;
        }

        if (!mno || mno.length !== 10) 
        {
            document.getElementById('mobile-error').textContent = 'Mobile number should be of length 10';
            return false;
        }

        if (!password || password.length < 4) 
        {
            document.getElementById('password-error').textContent = 'Password must be at least 4 characters';
            return false;
        }

        return true;
    }


document.addEventListener("DOMContentLoaded", function() {
  const form = document.querySelector("form");
  const passwordField = document.getElementById("password");
  const confirmPasswordField = document.getElementById("cpassword");
  const passwordMismatchDiv = document.getElementById("password-mismatch");

  form.addEventListener("submit", function(event) {
    if (passwordField.value !== confirmPasswordField.value) {
      passwordMismatchDiv.style.display = "block";
      event.preventDefault(); // Prevent form submission
    } else {
      passwordMismatchDiv.style.display = "none";
   }
    });
  });