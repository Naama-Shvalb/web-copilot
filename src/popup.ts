document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('DOM Content Loaded');
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('saveKey');
    const statusElement = document.getElementById('status');

    console.log('Elements found:', { 
      apiKeyInput: !!apiKeyInput, 
      saveButton: !!saveButton, 
      statusElement: !!statusElement 
    });

    if (!apiKeyInput || !saveButton || !statusElement) {
      throw new Error('Required elements not found');
    }

    // Type assertions after null check
    const input = apiKeyInput as HTMLInputElement;
    const button = saveButton as HTMLButtonElement;
    const status = statusElement as HTMLParagraphElement;

    // Load existing API key
    chrome.storage.sync.get(['openaiApiKey'], (result) => {
      console.log('Loading existing key:', result);
      if (result.openaiApiKey) {
        input.value = result.openaiApiKey;
      }
    });

    button.addEventListener('click', () => {
      console.log('Save button clicked');
      const apiKey = input.value.trim();
      
      if (!apiKey) {
        status.textContent = 'Please enter an API key';
        return;
      }

      chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
        console.log('API key saved');
        status.textContent = 'API key saved successfully!';
        setTimeout(() => {
          status.textContent = '';
        }, 2000);
      });
    });
  } catch (error) {
    console.error('Popup script error:', error);
  }
});
