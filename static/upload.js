// upload.js
export function setupUploadFeature({ 
  uploadInputId = 'upload-input', 
  previewId = 'preview',
  itemTypeSelectId = 'item-type-select',
  saveBtnId = 'save-item-btn',
  removeBgBtnId = 'remove-bg-btn',
  loadingTextId = 'loading-text',
  statusMsgId = 'status-msg'
} = {}) {
  const uploadInput = document.getElementById(uploadInputId);
  const preview = document.getElementById(previewId);
  const itemTypeSelect = document.getElementById(itemTypeSelectId);
  const saveItemBtn = document.getElementById(saveBtnId);
  const removeBgBtn = document.getElementById(removeBgBtnId);
  const loadingText = document.getElementById(loadingTextId);
  const statusMsg = document.getElementById(statusMsgId);

  let currentUploadDataUrl = null;

  function validateUploadForm() {
    const canSave = !!currentUploadDataUrl && !!itemTypeSelect.value;
    saveItemBtn.disabled = !canSave;
    removeBgBtn.disabled = !currentUploadDataUrl;
  }

  function resetUploadState() {
    currentUploadDataUrl = null;
    preview.src = '';
    preview.style.display = 'none';
    uploadInput.value = '';
    saveItemBtn.disabled = true;
    removeBgBtn.disabled = true;
    itemTypeSelect.value = '';
    statusMsg.textContent = '';
  }

  uploadInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      resetUploadState();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      currentUploadDataUrl = reader.result;
      preview.src = currentUploadDataUrl;
      preview.style.display = 'block';
      validateUploadForm();
    };
    reader.readAsDataURL(file);
  });

  itemTypeSelect.addEventListener('change', validateUploadForm);

  saveItemBtn.addEventListener('click', () => {
    if (!currentUploadDataUrl || !itemTypeSelect.value) return;
    const closet = loadCloset();
    const newItem = {
      id: 'item_' + Date.now(),
      image: currentUploadDataUrl,
      type: itemTypeSelect.value
    };
    closet.push(newItem);
    saveCloset(closet);
    statusMsg.textContent = 'Item saved to your closet!';
    resetUploadState();
  });

  removeBgBtn.addEventListener('click', async () => {
    if (!currentUploadDataUrl) {
      alert('Please upload an image first.');
      return;
    }

    try {
      removeBgBtn.disabled = true;
      saveItemBtn.disabled = true;
      loadingText.style.display = 'block';
      statusMsg.textContent = '';

      const response = await fetch('/api/remove_bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: currentUploadDataUrl })
      });

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errorJson = await response.json();
          if (errorJson.error) errorMsg = errorJson.error;
        } catch {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (!data.result) throw new Error('No result image returned from API.');

      const bgRemovedDataUrl = 'data:image/png;base64,' + data.result;
      currentUploadDataUrl = bgRemovedDataUrl;
      preview.src = bgRemovedDataUrl;
      preview.style.display = 'block';
      validateUploadForm();
      statusMsg.textContent = 'Background removed successfully!';
    } catch (err) {
      alert('Error removing background: ' + err.message);
      statusMsg.textContent = 'Failed to remove background.';
    } finally {
      removeBgBtn.disabled = false;
      loadingText.style.display = 'none';
      validateUploadForm();
    }
  });

  function loadCloset() {
    try {
      const data = localStorage.getItem('whering_style_closet');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveCloset(items) {
    localStorage.setItem('whering_style_closet', JSON.stringify(items));
  }
}