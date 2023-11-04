
function productValidForm() {
  const nameError = document.getElementById("productname-error");
  const priceError = document.getElementById("price-error");
  const quantityError = document.getElementById("quantity-error");
  const descriptionError = document.getElementById("description-error");
  const sizeError = document.getElementById("size-error");


  priceError.textContent = "";
  nameError.textContent = "";
  quantityError.textContent = "";
  descriptionError.textContent = "";
  sizeError.textContent = "";


  const productname = document.getElementById("exampleInputName1").value;
  const size = document.getElementById("size").value;
  const price = document.getElementById("price").value;
  const quantity = document.getElementById("quantity").value;
  const description = document.getElementById("description").value;


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

  if (!productname.match(nameRegex)) {
    nameError.textContent = "Name field should contain only letters and spaces";
    setTimeout(function () {
      nameError.textContent = "";
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
    sizeError.textContent = "Size field should be a positive number";
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
  // This function checks if the input is a positive integer
  const regex = /^[1-9]\d*$/;
  return regex.test(size) && parseFloat(size) > 0;
}
