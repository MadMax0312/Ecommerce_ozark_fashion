function validatedForm() {

  document.getElementById('email-error').textContent = '';
  document.getElementById('name1-error').textContent = '';
  document.getElementById('mobile-error').textContent = '';

  const email = document.getElementById('email').value;
  const name1 = document.getElementById('name1').value;
  const mobile = document.getElementById('mobile').value;

  // Regular expression for email validation with optional '@' symbol
  const emailRegex = /^[^\s@]+(@[^\s@]+\.[^\s@]+)?$/;

  if (!email) {
      document.getElementById('email-error').textContent = 'Email field should not be empty';
      return false;
  }

  if (!emailRegex.test(email)) {
      document.getElementById('email-error').textContent = 'Invalid email format';
      return false;
  }

  if (!name1) {
      document.getElementById('name1-error').textContent = 'Name field should not be empty';
      return false;
  }

  // Regular expression to match exactly 10 digits
  const mobileRegex = /^\d{10}$/;
  if (!mobile || !mobile.match(mobileRegex)) {
      document.getElementById('mobile-error').textContent = 'Invalid mobile number (must be exactly 10 digits)';
      return false;
  }

  return true;
}