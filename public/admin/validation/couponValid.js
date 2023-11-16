function couponValid() {
  // Reset error messages
  document.getElementById('couponNameError').innerText = '';
  document.getElementById('couponDiscountError').innerText = '';
  document.getElementById('minPurchaseError').innerText = '';
  document.getElementById('startDateError').innerText = '';
  document.getElementById('expiryDateError').innerText = '';

  // Get form values
  const couponName = document.getElementById('couponName').value.trim();
  const couponDiscount = document.getElementById('couponDiscount').value.trim();
  const minPurchase = document.getElementById('minPurchase').value.trim();
  const startDate = document.getElementById('startDate').value.trim();
  const expiryDate = document.getElementById('expiryDate').value.trim();

  var codeRegex = /^[a-zA-Z0-9]{1,10}$/;

  // Validate Coupon Name
  if (!codeRegex.test(couponName)) {
      document.getElementById('couponNameError').innerText = 'Coupon Name is required';
      return false;
  }

  // Validate Coupon Discount
  if (!couponDiscount || isNaN(couponDiscount) || couponDiscount <= 0) {
      document.getElementById('couponDiscountError').innerText = 'Valid Discount is required';
      return false;
  }

  // Validate Minimum Purchase
  if (!minPurchase || isNaN(minPurchase) || minPurchase < 0) {
      document.getElementById('minPurchaseError').innerText = 'Valid Minimum Purchase is required';
      return false;
  }

  // Validate Start Date
  if (!startDate) {
      document.getElementById('startDateError').innerText = 'Start Date is required';
      return false;
  }

  // Validate Expiry Date
  if (!expiryDate) {
      document.getElementById('expiryDateError').innerText = 'Expiry Date is required';
      return false;
  }

  return true;
}