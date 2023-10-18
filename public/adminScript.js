document.addEventListener("DOMContentLoaded", function() {
  // This code will run after the DOM is fully loaded

  // Check if the element with ID "viewproducts" exists
  var viewProductsButton = document.getElementById('viewproducts');

  if (viewProductsButton) {
      viewProductsButton.addEventListener('click', function(e) {
          alert('hellooo');
          e.preventDefault();
          fetch('/admin/view-products')
          .then(response => {
              console.log('Response status:', response.status);
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              } else {
                  console.log("success");
                  return response.text(); // Get the response as text
              }
          })
          .then(data => {
              // Set the innerHTML of the product-view div with the fetched HTML content
              console.log("next");
              // console.log(data);
              var productViewElement = document.getElementById("productview");
              if (productViewElement) {
                  productViewElement.innerHTML = data;
              } else {
                  console.error('product-view element not found!');
              }
          })
          .catch(error => {
              // Handle errors, e.g., display an error message
              console.error('Error:', error);
          });
      });
  } else {
      console.error('viewproducts element not found!');
  }
});
