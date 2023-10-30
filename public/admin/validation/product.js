function productValiddForm() {
    console.log("grtttttt");
    const nameError = document.getElementById("productname-error");
    const priceError = document.getElementById("price-error");
    const quantityError = document.getElementById("quantity-error");
    const descriptionError = document.getElementById("description-error");
    const sizeError = document.getElementById("size-error");

    priceError.textContent = '';
    nameError.textContent = '';
    quantityError.textContent = '';
    descriptionError.textContent = '';
    sizeError.textContent = '';

    const productname = document.getElementById("exampleInputName1").value.trim();
    const size = document.getElementById("size").value.trim();
    const price = document.getElementById("price").value.trim();
    const quantity = document.getElementById("quantity").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!productname && !size && !price && !quantity && !description) {
        document.getElementById("productname-error").textContent = 'Name field should not be empty'
        document.getElementById("price-error").textContent = " Price field should not be empty"
        document.getElementById("quantity-error").textContent = "Quantity field should not be empty"
        document.getElementById("description-error").textContent = " Description field should not be empty"
        document.getElementById("size-error").textContent = "Size field should not be empty"

      
        return false;
    }

    if (!productname) {
        document.getElementById("productname-error").textContent = 'Name field should not be empty'
        setTimeout(function() {
            nameError.textContent = '';
        }, 3000);
        return false;
    }

    if (!size) {
        document.getElementById("size-error").textContent = "Size field should not be empty"
        setTimeout(function() {
            sizeError.textContent = '';
        }, 3000);
        return false;
    }

    if (!isValidPrice(price)) {
        document.getElementById("price-error").textContent = " Price field should not be empty"
        setTimeout(function() {
            priceError.textContent = '';
        }, 3000);
        return false;
    }

    if (!isValidQuantity(quantity)) {
        document.getElementById("quantity-error").textContent = "Quantity field should not be empty"
        setTimeout(function() {
            quantityError.textContent = '';
        }, 3000);
        return false;
    }

    if (!description) {
        document.getElementById("description-error").textContent = " Description field should not be empty"
        setTimeout(function() {
            descriptionError.textContent = '';
        }, 3000);
        return false;
    }

    return true;
}

document.addEventListener("DOMContentLoaded", function() {
    const errorMessages = document.querySelectorAll('.error-message');

        function hideErrorMessages() {
          errorMessages.forEach(function(errorMessage) {
            errorMessage.textContent = '';
          });
        } 
        setTimeout(function() {
            hideErrorMessages();
        }, 4000); // Hide error messages after 4 seconds
      });


function isValidPrice(price) {
    // Implement your price validation logic here, e.g., allow only positive numbers
    // This function checks if the input is a positive number with up to two decimal places
    const regex = /^\d+(\.\d{1,2})?$/;
    return regex.test(price) && parseFloat(price) > 0;
}

function isValidQuantity(quantity) {
    // Implement your quantity validation logic here, e.g., allow only positive integers
    // This function checks if the input is a positive integer
    const regex = /^[1-9]\d*$/;
    return regex.test(quantity);
}

