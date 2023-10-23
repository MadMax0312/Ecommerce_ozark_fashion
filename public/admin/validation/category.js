function validForm() {

  document.getElementById('categoryname-error').textContent = '';
  document.getElementById('categorydes-error').textContent = '';

  const categoryname = document.getElementById('exampleInputName1').value;
  const categorydes = document.getElementById('exampleTextarea1').value;

  if (!categorydes && !categoryname) {
    document.getElementById('categorydes-error').textContent = 'Category description field should not be empty';
    document.getElementById('categoryname-error').textContent = 'Category name field should not be empty';
    return false;
}

  if (!categoryname) {
      document.getElementById('categoryname-error').textContent = 'Category name field should not be empty';
      return false;
  }

  if (!categorydes) {
      document.getElementById('categorydes-error').textContent = 'Category description field should not be empty';
      return false;
  }

  return true;
}