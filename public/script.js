function validateForm() {
    const emailError = document.getElementById("email-error");
    const nameError = document.getElementById("name1-error");
    const mobileError = document.getElementById("mobile-error");
    const passwordError = document.getElementById("password-error");

    emailError.textContent = "";
    nameError.textContent = "";
    mobileError.textContent = "";
    passwordError.textContent = "";

    const email = document.getElementById("email").value;
    const name1 = document.getElementById("name1").value;
    const mobile = document.getElementById("mobile").value;
    const password = document.getElementById("password").value;

    // Regular expression for email validation with optional '@' symbol
    const emailRegex = /^[^\s@]+(@[^\s@]+\.[^\s@]+)?$/;

    if (!email && !name1 && !password && !mobile) {
        document.getElementById("email-error").textContent = "Email field should not be empty";
        document.getElementById("name1-error").textContent = "Name field should not be empty";
        document.getElementById("password-error").textContent = "Password field should not be empty";
        document.getElementById("mobile-error").textContent = "Mobile field should not be empty";
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

    if (!name1) {
        document.getElementById("name1-error").textContent = "Name field should not be empty";
        setTimeout(function () {
            nameError.textContent = "";
        }, 3000);

        return false;
    }

    // Regular expression to match exactly 10 digits
    const mobileRegex = /^\d{10}$/;

    if (!mobile) {
        document.getElementById("mobile-error").textContent = "Mobile number field should not be empty";
        setTimeout(function () {
            mobileError.textContent = "";
        }, 3000);

        return false;
    }

    if (!mobile.match(mobileRegex)) {
        document.getElementById("mobile-error").textContent = "Invalid mobile number (must be exactly 10 digits)";
        setTimeout(function () {
            mobileError.textContent = "";
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

    setTimeout(function () {
        hideErrorMessages();
    }, 4000); // Hide error messages after 4 seconds
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const passwordField = document.getElementById("password");
    const confirmPasswordField = document.getElementById("cpassword");
    const passwordMismatchDiv = document.getElementById("password-mismatch");

    form.addEventListener("submit", function (event) {
        if (passwordField.value !== confirmPasswordField.value) {
            passwordMismatchDiv.style.display = "block";
            setTimeout(function () {
                passwordMismatchDiv.style.display = "none";
            }, 3000);
            event.preventDefault(); // Prevent form submission
        } else {
            passwordMismatchDiv.style.display = "none";
        }
    });
});
