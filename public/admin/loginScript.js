



function valiForm() {
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");

  emailError.textContent = "";
  passwordError.textContent = "";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Regular expression for email validation with optional '@' symbol
  const emailRegex = /^[^\s@]+(@[^\s@]+\.[^\s@]+)?$/;

  if (!email && !password) {
      document.getElementById("email-error").textContent = "Email field should not be empty";

      document.getElementById("password-error").textContent = "Password field should not be empty";

      return false;
  }

  if (!email) {
      document.getElementById("email-error").textContent = "Email field should not be empty";
      setTimeout(function () {
          emailError.textContent = "";
      }, 3000);
      return false;
  }

  if (!emailRegex.test(email)) {
      document.getElementById("email-error").textContent = "Invalid email format";
      setTimeout(function () {
          emailError.textContent = "";
      }, 3000);
      return false;
  }

  if (!password || password.length < 4) {
      document.getElementById("password-error").textContent = "Password must be at least 4 characters";
      setTimeout(function () {
          passwordError.textContent = "";
      }, 3000);
      return false;
  }

  return true;
}

document.addEventListener("DOMContentLoaded", function () {
  const errorMessages = document.querySelectorAll(".error-message");

  function hideErrorMessages() {
      errorMessages.forEach(function (errorMessage) {
          errorMessage.textContent = "";
      });
  }
  setTimeout(hideErrorMessages, 4000);
});
