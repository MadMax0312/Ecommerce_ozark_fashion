function validForm() {
    document.getElementById('categoryname-error').textContent = '';
    document.getElementById('categorydes-error').textContent = '';
    document.getElementById('discountPrice-error').textContent = '';

    const categoryname = document.getElementById('exampleInputName1').value.trim();
    const categorydes = document.getElementById('exampleTextarea1').value.trim();
    const offerPercentage = document.getElementById('Offer').value.trim();
    const discountPrice = document.getElementById("Offer").value.trim();

    const namePattern = /^[a-zA-Z]+$/;
    const descPattern = /^[a-zA-Z]+$/;
    const offerPattern = /^(\d{1,2}(\.\d{1,2})?|100)$/;
    
    if (!categoryname || !categorydes) {
        document.getElementById('categorydes-error').textContent = 'Category description and name fields should not be empty';
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
      

    if (categoryname.length > 10) {
        document.getElementById('categoryname-error').textContent = 'Category name should not exceed 10 characters';
        return false;
    }

    if (categorydes.length > 10) {
        document.getElementById('categorydes-error').textContent = 'Category description should not exceed 10 characters';
        return false;
    }

    if (!categoryname.match(namePattern)) {
        document.getElementById('categoryname-error').textContent = 'Category name should only contain alphabets';
        return false;
    }

    if (!categorydes.match(descPattern)) {
        document.getElementById('categorydes-error').textContent = 'Category description should only contain alphabets';
        return false;
    }

    if (offerPercentage !== "" && (!offerPercentage.match(offerPattern) || parseFloat(offerPercentage) > 50)) {
        document.getElementById('discountPrice-error').textContent = 'Offer percentage should be a number between 0 and 50';
        return false;
    }

    return true;
}
