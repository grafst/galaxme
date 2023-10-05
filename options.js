// Saves options to chrome.storage
const saveOptions = () => {
  /*const color = document.getElementById('color').value;*/
  const hideCategories = document.getElementById('hideCategories').checked;

  chrome.storage.sync.set(
    { 
        // favoriteColor: color,
         hideCategories: hideCategories },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 750);
    }
  );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    { //favoriteColor: 'red',
     hideCategories: true },
    (items) => {
      //document.getElementById('color').value = items.favoriteColor;
      document.getElementById('hideCategories').checked = items.hideCategories;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);