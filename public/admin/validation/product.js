function productValidForm() {
    document.getElementById("productname-error").textContent = "";
    document.getElementById("price-error").textContent = "";
    document.getElementById("quantity-error").textContent = "";
    document.getElementById("description-error").textContent = "";
    document.getElementById("image-error").textContent = "";
    document.getElementById("size-error").textContent = "";

    const productname = document.getElementById("exampleInputName1").value;
    const price = document.getElementById("price").value;
    const quantity = document.getElementById("quantity").value;
    const description = document.getElementById("description").value;
    const image = document.getElementById("image").value;
    const size = document.getElementById("size").value;

    if (!productname || !price || !quantity || !description || !image || !size) {
        if (!productname) {
            document.getElementById("productname-error").textContent = "Product name field should not be empty";
        }
        if (!size) {
            document.getElementById("size-error").textContent = "Product size field should not be empty";
        }
        if (!price) {
            document.getElementById("price-error").textContent = "Product price field should not be empty";
        }
        if (!quantity) {
            document.getElementById("quantity-error").textContent = "Product quantity field should not be empty";
        }
        if (!description) {
            document.getElementById("description-error").textContent = "Product description field should not be empty";
        }
        if (!image) {
            document.getElementById("image-error").textContent = "Image field should not be empty";
        }
        return false; // Prevent form submission on validation failure
    }

    return true; // Allow form submission if all fields are valid
}
