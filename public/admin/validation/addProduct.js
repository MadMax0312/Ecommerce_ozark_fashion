
function productValidForm(event) {
  event.preventDefault();

  const isValid = validateForm();

  const imageInputs = document.querySelectorAll(".custom-file-input");
  const hasImage = Array.from(imageInputs).some((input) => input.files.length > 0);

  if (isValid && hasImage) {
      event.currentTarget.submit();
  } else {
      const errorMessage = document.getElementById("image-error");
      errorMessage.textContent = "At least one image should be added.";

      setTimeout(function () {
          errorMessage.textContent = "";
      }, 3000);
  }
}


function validateForm() {

  const nameError = document.getElementById("productname-error");
  const priceError = document.getElementById("price-error");
  const quantityError = document.getElementById("quantity-error");
  const descriptionError = document.getElementById("description-error");
  const sizeError = document.getElementById("size-error");
  const imageError = document.getElementById("image-error");

  priceError.textContent = "";
  nameError.textContent = "";
  quantityError.textContent = "";
  descriptionError.textContent = "";
  sizeError.textContent = "";
  imageError.textContent = "";


  const productname = document.getElementById("exampleInputName1").value;
  const size = document.getElementById("size").value;
  const price = document.getElementById("price").value;
  const quantity = document.getElementById("quantity").value;
  const description = document.getElementById("description").value;
  const discountPrice = document.getElementById("discount").value;


  // Regular expressions for validation
  const nameRegex = /^[a-zA-Z ]+$/;
  const sizeRegex = /^[a-zA-Z0-9 ]+$/;
  const priceRegex = /^\d+(\.\d{1,2})?$/;
  const quantityRegex = /^[1-9]\d*$/;

  if (!productname && !size && !price && !quantity && !description) {
    document.getElementById("productname-error").textContent = "Name field should not be empty";
    document.getElementById("price-error").textContent = " Price field should not be empty";
    document.getElementById("quantity-error").textContent = "Quantity field should not be empty";
    document.getElementById("description-error").textContent = " Description field should not be empty";
    document.getElementById("size-error").textContent = "Size field should not be empty";
    document.getElementById("image-error").textContent = "Image field should not be empty";

    return false;
}

if (!productname) {
    document.getElementById("nameError").textContent = "Product name should not be empty";
    setTimeout(function () {
        document.getElementById("nameError").textContent = "";
    }, 3000);
    return false;
}

if (
  discountPrice !== "" &&
  (!isValidPrice(discountPrice) ||
      parseFloat(discountPrice) < 0 ||
      parseFloat(discountPrice) > 50) // Updated condition to check if discount is greater than 70%
) {
  document.getElementById("discount-error").textContent =
      "Discount percentage should be a non-negative number and should not exceed 50%.";
  setTimeout(function () {
      document.getElementById("discount-error").textContent = "";
  }, 3000);
  return false;
}


if (productname.length > 15) {
    document.getElementById("nameError").textContent = "Product name must be maximum 15 characters long";
    setTimeout(function () {
        document.getElementById("nameError").textContent = "";
    }, 3000);
    return false;
}

if (!nameRegex.test(productname)) {
    document.getElementById("nameError").textContent = "Product name should contain only letters and spaces";
    setTimeout(function () {
        document.getElementById("nameError").textContent = "";
    }, 3000);
    return false;
}

  if (!size.match(sizeRegex)) {
    sizeError.textContent = "Size field should contain only letters, numbers, and spaces";
    setTimeout(function () {
      sizeError.textContent = "";
  }, 3000);
    return false;
  }

  if (!isValidSize(size)) {
    sizeError.textContent = "Size field should be a positive number btw 10 and 45";
    setTimeout(function () {
      sizeError.textContent = "";
  }, 3000);
    return false;
  }

  if (!price.match(priceRegex)) {
    priceError.textContent = "Price field should be a positive number with up to two decimal places";
    setTimeout(function () {
      sizeError.textContent = "";
  }, 3000);
    return false;
  }

  if (!quantity.match(quantityRegex)) {
    quantityError.textContent = "Quantity field should be a positive integer";
    setTimeout(function () {
      quantityError.textContent = "";
  }, 3000);
    return false;
  }

  if (!isValidQuantity(quantity)) {
    quantityError.textContent = "Quantity field should be a positive integer";
    setTimeout(function () {
      quantityError.textContent = "";
  }, 3000);
    return false;
  }

  if (!description) {
    descriptionError.textContent = "Description field should not be empty";
    setTimeout(function () {
      descriptionError.textContent = "";
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
  }, 5000);
});

function isValidPrice(price) {
  // This function checks if the input is a positive number with up to two decimal places
  const regex = /^\d+(\.\d{1,2})?$/;
  return regex.test(price) && parseFloat(price) > 0;
}

function isValidQuantity(quantity) {
  // This function checks if the input is a positive integer
  const regex = /^[1-9]\d*$/;
  return regex.test(quantity) && parseFloat(quantity) > 0;
}

function isValidSize(size) {
  // This function checks if the input is a positive integer between 10 and 45
  const regex = /^[1-9]\d*$/;
  const numericSize = parseFloat(size);
  return regex.test(size) && numericSize >= 10 && numericSize <= 45;
}
