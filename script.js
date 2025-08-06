// Language name mapping for display
const languageNames = {
  'en': 'English',
  'fil': 'Filipino',
  'es': 'Spanish',
  'pt': 'Portuguese',
  'fr': 'French',
  'de': 'German',
  'hi': 'Hindi',
  'ja': 'Japanese',
  'ko': 'Korean',
  'pa': 'Punjabi',
  'ru': 'Russian',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'ar': 'Arabic',
  'it': 'Italian',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'pl': 'Polish',
  'tr': 'Turkish',
  'he': 'Hebrew',
  'cs': 'Czech',
  'hu': 'Hungarian'
};

// Theme management
let isDarkMode = false;

// Initialize theme on page load
function initializeTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
        isDarkMode = JSON.parse(savedTheme);
    }    
    updateThemeUI();
}

// Update theme UI (body class and icon)
function updateThemeUI() {
    const themeIcon = document.getElementById('themeIcon');
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        if (themeIcon) themeIcon.className = 'fas fa-moon'; // Moon icon for dark mode
    } else {
        document.body.classList.remove('dark-mode');
        if (themeIcon) themeIcon.className = 'fas fa-sun'; // Sun icon for light mode
    }
}

// Toggle theme function - SINGLE BUTTON TOGGLE
function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    updateThemeUI();
}

// Character count functionality and limit enforcement
const CHAR_LIMIT = 50000; // Define the character limit here
function updateCharCount() {
    const sourceTextarea = document.getElementById('source');
    const charCountElement = document.getElementById('charCount');
    if (!sourceTextarea || !charCountElement) return;

    let text = sourceTextarea.value;
    let charCount = text.length;
    
    // Enforce character limit
    if (charCount > CHAR_LIMIT) {
        text = text.substring(0, CHAR_LIMIT);
        sourceTextarea.value = text;
        charCount = CHAR_LIMIT; // Update charCount to the limit
        // Add visual cue for limit exceeded
        charCountElement.classList.add('char-limit-exceeded');
    } else {
        charCountElement.classList.remove('char-limit-exceeded');
    }
    charCountElement.textContent = `${charCount}/${CHAR_LIMIT}`; // Display as 0/50000
}

// Function to clear input text area
function clearInput() {
    const sourceTextarea = document.getElementById('source');
    if (sourceTextarea) {
        sourceTextarea.value = '';
        updateCharCount(); // Update char count after clearing
    }
}

// Translation history management
let translationHistory = [];

// Load history from localStorage on page load
function loadTranslationHistory() {
  const stored = localStorage.getItem('translationHistory');
  if (stored) {
    translationHistory = JSON.parse(stored);
  }
  updateHistoryDisplay(); // Update display on load to show initial "No history" or actual history
}

// Save history to localStorage
function saveTranslationHistory() {
  localStorage.setItem('translationHistory', JSON.stringify(translationHistory));
}

// Add translation to history
function addToHistory(sourceText, fromLang, translations) {
  const historyItem = {
    id: Date.now() + Math.random(), // Unique ID
    sourceText: sourceText,
    fromLanguage: fromLang,
    translations: translations,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time
  };

  // Add to beginning of array (newest first)
  translationHistory.unshift(historyItem);

  // Limit history to 50 items
  if (translationHistory.length > 50) {
    translationHistory = translationHistory.slice(0, 50);
  }

  saveTranslationHistory();
  updateHistoryDisplay(); // Update history display after adding
}

// Clear translation history
function clearHistory() {
  if (confirm('Are you sure you want to clear all translation history?')) {
    translationHistory = [];
    saveTranslationHistory();
    updateHistoryDisplay();
  }
}

// Copy translation function
function copyTranslation() {
  const resultDiv = document.getElementById('result');
  const copyBtn = document.getElementById('copyButton');
  
  if (!resultDiv || !copyBtn) return;

  // Find the actual translation content within resultDiv
  // The translation content is now within resultDiv's direct child, not necessarily output-text-area
  const translationContentDiv = resultDiv.querySelector('.translation-content');
  let textToCopy = '';

  if (translationContentDiv) {
      // Extract text from the content div
      textToCopy = Array.from(translationContentDiv.querySelectorAll('.translation-result'))
          .map(result => {
              const language = result.querySelector('h4').textContent;
              const text = result.querySelector('p').textContent;
              return `${language}: ${text}`;
          })
          .join('\n');
  } else {
      // Fallback for cases without .translation-content (e.g., error messages, initial message)
      // Ensure we don't copy the initial message or loading message
      const initialMessage = resultDiv.querySelector('.initial-message');
      const loadingMessage = resultDiv.querySelector('.loading');
      if (!initialMessage && !loadingMessage) {
          textToCopy = resultDiv.textContent.trim(); // This might pick up labels, so translationContentDiv is better
      }
  }
  
  if (!textToCopy) {
    // If no text to copy, just return without changing button
    return;
  }
  
  navigator.clipboard.writeText(textToCopy).then(() => {
    // Visual feedback: change icon and add 'copied' class
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = '<i class="fas fa-check"></i>'; // Just the checkmark icon
    
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = '<i class="fas fa-copy"></i>'; // Revert to original copy icon
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy text (clipboard API)', err);
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      copyBtn.classList.add('copied');
      copyBtn.innerHTML = '<i class="fas fa-check"></i>';
      
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
      }, 2000);
    } catch (err) {
      // If even fallback fails silently do nothing
    }
    document.body.removeChild(textArea);
  });
}

// Toggle history panel visibility
function toggleHistoryPanel() {
  const historyPanel = document.getElementById('history-panel');
  if (!historyPanel) return;

  historyPanel.classList.toggle('show');
  if (historyPanel.classList.contains('show')) {
    updateHistoryDisplay(); // Ensure display is updated when shown
  }
}

// Update history display in the dedicated panel
function updateHistoryDisplay() {
  const historyListContainer = document.getElementById('history-list-container');
  if (!historyListContainer) return; // Ensure element exists

  if (translationHistory.length === 0) {
    historyListContainer.innerHTML = '<p class="no-history">Your translation history will appear here.</p>';
    return;
  }

  let html = '';
  translationHistory.forEach((item, index) => {
    const fromLangName = languageNames[item.fromLanguage] || item.fromLanguage;

    let translationsHtml = '';
    if (Array.isArray(item.translations)) {
      item.translations.forEach(trans => {
        const toLangName = languageNames[trans.language] || trans.language;
        translationsHtml += `
          <div class="translation-item">
            <strong>${toLangName}:</strong> ${trans.text}
          </div>
        `;
      });
    } else if (item.translations && item.translations.language && item.translations.text) { // Single translation (backward compatibility)
        const toLangName = languageNames[item.translations.language] || item.translations.language;
        translationsHtml = `
            <div class="translation-item">
                <strong>${toLangName}:</strong> ${item.translations.text}
            </div>
        `;
    }

    html += `
      <div class="history-item" data-id="${item.id}" onclick="reuseTranslation('${encodeURIComponent(item.sourceText)}', '${item.fromLanguage}', '${encodeURIComponent(JSON.stringify(item.translations))}')">
        <div class="history-item-content">
            <span class="history-date">${item.date} ${item.time}</span>
            <p class="history-source">From ${fromLangName}: "${item.sourceText}"</p>
            <div class="history-translations">
                ${translationsHtml}
            </div>
        </div>
        <button class="delete-history-item" onclick="event.stopPropagation(); deleteHistoryItem('${item.id}')">
            <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  });

  historyListContainer.innerHTML = html;
}

// Delete specific history item
function deleteHistoryItem(itemId) {
  translationHistory = translationHistory.filter(item => item.id != itemId);
  saveTranslationHistory();
  updateHistoryDisplay();
}

// Reuse translation from history
function reuseTranslation(encodedSourceText, fromLang, encodedTranslations) {
  const sourceText = decodeURIComponent(encodedSourceText);
  const translations = JSON.parse(decodeURIComponent(encodedTranslations));

  document.getElementById('source').value = sourceText;
  // Set the custom dropdown for source language
  const fromLangDropdownSelected = document.getElementById('fromLangDropdownSelected');
  if (fromLangDropdownSelected) {
    // Find the language name from languageNames
    const langName = languageNames[fromLang] || fromLang;
    fromLangDropdownSelected.querySelector('span').textContent = langName;
  }

  const resultDiv = document.getElementById('result');
  
  // Clear existing content and hide initial message
  const initialMessage = resultDiv.querySelector('.initial-message');
  if (initialMessage) {
      initialMessage.style.display = 'none';
  }
  let translationContentDiv = resultDiv.querySelector('.translation-content');
  if (translationContentDiv) {
      translationContentDiv.remove();
  }

  // Get the output buttons container and temporarily detach it
  const outputButtonsContainer = resultDiv.parentElement.querySelector('.output-buttons-container');
  if (outputButtonsContainer) {
      outputButtonsContainer.remove();
  }

  if (Array.isArray(translations)) {
      displayMultipleTranslations({ translations: translations }, translations.map(t => t.language), resultDiv, false, outputButtonsContainer); // Pass outputButtonsContainer
  } else {
      displaySingleTranslation({ translation: translations.text }, translations.language, resultDiv, false, outputButtonsContainer); // Pass outputButtonsContainer
  }

  // Hide history panel after reusing
  const historyPanel = document.getElementById('history-panel');
  if (historyPanel && historyPanel.classList.contains('show')) {
      toggleHistoryPanel();
  }
}

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function () {
    initializeTheme(); // Initialize theme

    loadTranslationHistory(); // Load and display history

    // --- Custom Dropdown for Source Language (from-lang) ---
    const fromLangDropdown = document.getElementById('fromLangDropdown');
    const fromLangDropdownSelected = document.getElementById('fromLangDropdownSelected');
    const fromLangDropdownOptions = document.getElementById('fromLangDropdownOptions');
    let fromLangSelectedValue = 'en';

    if (fromLangDropdown && fromLangDropdownSelected && fromLangDropdownOptions) {
        // Open/close dropdown
        fromLangDropdownSelected.addEventListener('click', function (event) {
            event.stopPropagation();
            fromLangDropdown.classList.toggle('open');
            fromLangDropdownOptions.classList.toggle('show');
        });

        // Handle option click
        const options = fromLangDropdownOptions.querySelectorAll('.dropdown-option');
        options.forEach(option => {
            option.addEventListener('click', function (e) {
                const value = this.getAttribute('data-value');
                const text = this.textContent;
                fromLangSelectedValue = value;
                fromLangDropdownSelected.querySelector('span').textContent = text;
                fromLangDropdown.classList.remove('open');
                fromLangDropdownOptions.classList.remove('show');
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (event) {
            if (!fromLangDropdown.contains(event.target)) {
                fromLangDropdown.classList.remove('open');
                fromLangDropdownOptions.classList.remove('show');
            }
        });
    }


    // Setup character count and limit enforcement
    const sourceTextarea = document.getElementById('source');
    if (sourceTextarea) {
        sourceTextarea.addEventListener('input', updateCharCount);
        sourceTextarea.addEventListener('paste', function() {
            setTimeout(updateCharCount, 10); // Small delay to ensure paste content is processed
        });
        updateCharCount(); // Initial count
    }

    // Custom dropdown functionality
    const dropdownSelected = document.getElementById('dropdownSelected');
    const dropdownOptions = document.getElementById('dropdownOptions');
    const customDropdown = document.querySelector('.custom-dropdown');
    const historyPanel = document.getElementById('history-panel'); // Get history panel reference
    const historyToggleButton = document.getElementById('historyToggleButton'); // Get history toggle button reference
    const languageCheckboxes = document.querySelectorAll('.language-checkbox-dropdown');
    const selectAllCheckbox = document.querySelector('.select-all-checkbox');
    
    // The historyCloseButton is now directly in HTML, no need to create it here
    // But we still need to reference it for the click outside listener
    const historyCloseButton = document.querySelector('.history-close-button');


    // Add event listener to close dropdowns and history panel when clicking outside
    document.addEventListener('click', function (event) {
        // Close custom language dropdown
        if (customDropdown && !customDropdown.contains(event.target) && dropdownOptions.classList.contains('show')) {
            customDropdown.classList.remove('open');
            dropdownOptions.classList.remove('show');
        }

        // Close history panel if clicked outside
        // Ensure click is not on the history panel itself or the history toggle button or the history close button
        if (historyPanel && historyPanel.classList.contains('show') && 
            !historyPanel.contains(event.target) && 
            !historyToggleButton.contains(event.target) &&
            (historyCloseButton && !historyCloseButton.contains(event.target))) { // Check if historyCloseButton exists before using it
            
            historyPanel.classList.remove('show');
        }
    });

    if (dropdownSelected && dropdownOptions && customDropdown && selectAllCheckbox) {
        // Toggle dropdown
        dropdownSelected.addEventListener('click', function (event) {
            event.stopPropagation(); // Prevent document click listener from immediately closing it
            customDropdown.classList.toggle('open');
            dropdownOptions.classList.toggle('show');
        });

        // Handle language checkbox changes
        languageCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                updateDropdownDisplay();
                updateSelectAllState();
            });
        });

        // Handle select all checkbox
        selectAllCheckbox.addEventListener('change', function () {
            const isChecked = this.checked;
            languageCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });
            updateDropdownDisplay();
        });

        // Update dropdown display text
        function updateDropdownDisplay() {
            const checkedBoxes = Array.from(languageCheckboxes).filter(cb => cb.checked);
            const selectedSpan = dropdownSelected.querySelector('span:first-child');

            // Set initial selected language as "Spanish" if none are checked, as per image
            if (checkedBoxes.length === 0) {
                selectedSpan.textContent = 'Spanish';
            } else if (checkedBoxes.length === 1) {
                const language = checkedBoxes[0].nextElementSibling.textContent;
                selectedSpan.textContent = language;
            } else {
                selectedSpan.textContent = `${checkedBoxes.length} languages selected`;
            }
        }

        // Update select all checkbox state
        function updateSelectAllState() {
            const totalBoxes = languageCheckboxes.length;
            const checkedBoxes = Array.from(languageCheckboxes).filter(cb => cb.checked);

            if (checkedBoxes.length === 0) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            } else if (checkedBoxes.length === totalBoxes) {
                selectAllCheckbox.checked = true;
                selectAllCheckbox.indeterminate = false;
            } else {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = true;
            }
        }

        // Initialize display
        updateDropdownDisplay();
        updateSelectAllState();
    }
});

async function translateText() {
  const text = document.getElementById("source").value;
  const resultDiv = document.getElementById("result");
  // Use the selected value from the custom from-lang dropdown
  let fromLanguage = 'en';
  const fromLangDropdownSelected = document.getElementById('fromLangDropdownSelected');
  if (fromLangDropdownSelected) {
    // Find the selected value by matching the text
    const selectedText = fromLangDropdownSelected.querySelector('span').textContent;
    const options = [
      { value: 'en', text: 'English' },
      { value: 'fil', text: 'Filipino' },
      { value: 'es', text: 'Spanish' },
      { value: 'pt', text: 'Portuguese' },
      { value: 'fr', text: 'French' },
      { value: 'de', text: 'German' },
      { value: 'hi', text: 'Hindi' },
      { value: 'ja', text: 'Japanese' },
      { value: 'ko', text: 'Korean' },
      { value: 'pa', text: 'Punjabi' },
      { value: 'ru', text: 'Russian' },
      { value: 'th', text: 'Thai' },
      { value: 'vi', text: 'Vietnamese' },
      { value: 'ar', text: 'Arabic' },
      { value: 'it', text: 'Italian' },
      { value: 'nl', text: 'Dutch' },
      { value: 'sv', text: 'Swedish' },
      { value: 'da', text: 'Danish' },
      { value: 'no', text: 'Norwegian' },
      { value: 'pl', text: 'Polish' },
      { value: 'tr', text: 'Turkish' },
      { value: 'he', text: 'Hebrew' },
      { value: 'cs', text: 'Czech' },
      { value: 'hu', text: 'Hungarian' }
    ];
    const found = options.find(opt => opt.text === selectedText);
    if (found) fromLanguage = found.value;
  }

  // Get the output buttons container and temporarily detach it before clearing resultDiv
  // This ensures the buttons are preserved and re-appended
  const outputButtonsContainer = resultDiv.parentElement.querySelector('.output-buttons-container');
  if (outputButtonsContainer) {
      outputButtonsContainer.remove(); // Temporarily detach
  }

  // Clear existing content in resultDiv (but not the parent output-box)
  resultDiv.innerHTML = '';

  if (!text.trim()) {
    resultDiv.innerHTML = "<p style='color: red;'>Please enter some text to translate.</p>";
    if (outputButtonsContainer) resultDiv.parentElement.appendChild(outputButtonsContainer); // Re-append buttons to output-box
    return;
  }

  // Get selected languages from custom dropdown checkboxes
  const selectedLanguages = [];
  const checkboxes = document.querySelectorAll('.language-checkbox-dropdown:checked');

  checkboxes.forEach(checkbox => {
    selectedLanguages.push(checkbox.value);
  });

  if (selectedLanguages.length === 0) {
    resultDiv.innerHTML = "<p style='color: red;'>Please select at least one target language.</p>";
    if (outputButtonsContainer) resultDiv.parentElement.appendChild(outputButtonsContainer); // Re-append buttons
    return;
  }

  // Handle multiple languages selection
  if (selectedLanguages.length > 1) {
    await translateToMultipleLanguages(text, fromLanguage, selectedLanguages, resultDiv, outputButtonsContainer); // Pass outputButtonsContainer
    return;
  }

  // Handle single language translation
  const toLanguage = selectedLanguages[0];
  if (fromLanguage === toLanguage) { // Removed auto-detect check as it's no longer an option
    resultDiv.innerHTML = "<p style='color: orange;'>Source and target languages are the same.</p>";
    if (outputButtonsContainer) resultDiv.parentElement.appendChild(outputButtonsContainer); // Re-append buttons
    return;
  }

  await translateToSingleLanguage(text, fromLanguage, toLanguage, resultDiv, outputButtonsContainer); // Pass outputButtonsContainer
}

async function translateToSingleLanguage(text, fromLanguage, toLanguage, resultDiv, outputButtonsContainer) {
  try {
    // Show loading message
    const loadingMessage = document.createElement('p');
    loadingMessage.className = 'loading';
    loadingMessage.textContent = 'Translating...';
    resultDiv.innerHTML = ''; // Clear previous content
    resultDiv.appendChild(loadingMessage); // Add loading message

    // Re-append buttons to the parent output-box, after the loading message is added to resultDiv
    if (outputButtonsContainer) {
        resultDiv.parentElement.appendChild(outputButtonsContainer);
    }

    const API_URL = "https://backend-translator-9m88.onrender.com/translate"; 

    // Prepare request body
    const requestBody = {
      text: text,
      from: fromLanguage, // Always send 'from' language now
      to: toLanguage
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorData = await res.json();
      resultDiv.innerHTML = `<p style='color: red;'>Error: ${errorData.error || 'Translation failed'}</p>`;
      if (outputButtonsContainer) resultDiv.parentElement.appendChild(outputButtonsContainer); // Re-append buttons
      console.error("Server error:", errorData);
      return;
    }

    const data = await res.json();
    displaySingleTranslation(data, toLanguage, resultDiv, true, outputButtonsContainer); // Pass outputButtonsContainer

  } catch (error) {
    console.error("Client error:", error);
    resultDiv.innerHTML = "<p style='color: red;'>Error: Unable to connect to translation service. Make sure the server is running.</p>";
    if (outputButtonsContainer) resultDiv.parentElement.appendChild(outputButtonsContainer); // Re-append buttons
  }
}

async function translateToMultipleLanguages(text, fromLanguage, selectedLanguages, resultDiv, outputButtonsContainer) {
  try {
    // Show loading message
    const loadingMessage = document.createElement('p');
    loadingMessage.className = 'loading';
    loadingMessage.textContent = 'Translating to multiple languages...';
    resultDiv.innerHTML = ''; // Clear previous content
    resultDiv.appendChild(loadingMessage); // Add loading message

    // Re-append buttons to the parent output-box, after the loading message is added to resultDiv
    if (outputButtonsContainer) {
        resultDiv.parentElement.appendChild(outputButtonsContainer);
    }

    const API_URL = "https://backend-translator-9m88.onrender.com/translate"; 

    // Prepare request body
    const requestBody = {
      text: text,
      from: fromLanguage, // Always send 'from' language now
      to: selectedLanguages
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorData = await res.json();
      resultDiv.innerHTML = `<p style='color: red;'>Error: ${errorData.error || 'Translation failed'}</p>`;
      if (outputButtonsContainer) resultDiv.parentElement.appendChild(outputButtonsContainer); // Re-append buttons
      console.error("Server error:", errorData);
      return;
    }

    const data = await res.json();
    displayMultipleTranslations(data, selectedLanguages, resultDiv, true, outputButtonsContainer); // Pass outputButtonsContainer

  } catch (error) {
    console.error("Client error:", error);
    resultDiv.innerHTML = "<p style='color: red;'>Error: Unable to connect to translation service. Make sure the server is running.</p>";
    if (outputButtonsContainer) resultDiv.parentElement.appendChild(outputButtonsContainer); // Re-append buttons
  }
}

function displaySingleTranslation(data, targetLanguage, resultDiv, addToHistoryFlag = false, outputButtonsContainer = null) {
  // Clear previous content
  resultDiv.innerHTML = '';

  // Create content div
  const translationContentDiv = document.createElement('div');
  translationContentDiv.className = 'translation-content';
  resultDiv.appendChild(translationContentDiv); // Add content div to resultDiv

  // Handle single language response
  if (data.translation) {
    const languageName = languageNames[targetLanguage] || targetLanguage;
    translationContentDiv.innerHTML = `
      <div class="translation-result">
        <h4>${languageName}:</h4>
        <p>${data.translation}</p>
      </div>
    `;

    if (addToHistoryFlag) {
        const sourceText = document.getElementById("source").value;
        // Use custom dropdown for fromLanguage
        let fromLanguage = 'en';
        const fromLangDropdownSelected = document.getElementById('fromLangDropdownSelected');
        if (fromLangDropdownSelected) {
          const selectedText = fromLangDropdownSelected.querySelector('span').textContent;
          const options = [
            { value: 'en', text: 'English' },
            { value: 'fil', text: 'Filipino' },
            { value: 'es', text: 'Spanish' },
            { value: 'pt', text: 'Portuguese' },
            { value: 'fr', text: 'French' },
            { value: 'de', text: 'German' },
            { value: 'hi', text: 'Hindi' },
            { value: 'ja', text: 'Japanese' },
            { value: 'ko', text: 'Korean' },
            { value: 'pa', text: 'Punjabi' },
            { value: 'ru', text: 'Russian' },
            { value: 'th', text: 'Thai' },
            { value: 'vi', text: 'Vietnamese' },
            { value: 'ar', text: 'Arabic' },
            { value: 'it', text: 'Italian' },
            { value: 'nl', text: 'Dutch' },
            { value: 'sv', text: 'Swedish' },
            { value: 'da', text: 'Danish' },
            { value: 'no', text: 'Norwegian' },
            { value: 'pl', text: 'Polish' },
            { value: 'tr', text: 'Turkish' },
            { value: 'he', text: 'Hebrew' },
            { value: 'cs', text: 'Czech' },
            { value: 'hu', text: 'Hungarian' }
          ];
          const found = options.find(opt => opt.text === selectedText);
          if (found) fromLanguage = found.value;
        }
        const translations = [{
          language: targetLanguage,
          text: data.translation
        }];
        addToHistory(sourceText, fromLanguage, translations);
    }
  } else {
    // Fallback for unexpected response format
    translationContentDiv.innerHTML = "<p style='color: red;'>Unexpected response format from server.</p>";
  }

  // Re-append buttons to the parent output-box (which contains resultDiv)
  if (outputButtonsContainer) {
      resultDiv.parentElement.appendChild(outputButtonsContainer);
  }
}

function displayMultipleTranslations(data, selectedLanguages, resultDiv, addToHistoryFlag = false, outputButtonsContainer = null) {
  // Clear previous content
  resultDiv.innerHTML = '';

  // Create content div
  const translationContentDiv = document.createElement('div');
  translationContentDiv.className = 'translation-content';
  resultDiv.appendChild(translationContentDiv); // Add content div to resultDiv

  // Handle multiple language response
  if (data.translations && data.translations.length > 0) {
    let html = '';
    data.translations.forEach(translation => {
      const languageName = languageNames[translation.language] || translation.language;
      html += `
        <div class="translation-result">
          <h4>${languageName}:</h4>
          <p>${translation.text}</p>
        </div>
      `;
    });
    translationContentDiv.innerHTML = html;

    if (addToHistoryFlag) {
        const sourceText = document.getElementById("source").value;
        // Use custom dropdown for fromLanguage
        let fromLanguage = 'en';
        const fromLangDropdownSelected = document.getElementById('fromLangDropdownSelected');
        if (fromLangDropdownSelected) {
          const selectedText = fromLangDropdownSelected.querySelector('span').textContent;
          const options = [
            { value: 'en', text: 'English' },
            { value: 'fil', text: 'Filipino' },
            { value: 'es', text: 'Spanish' },
            { value: 'pt', text: 'Portuguese' },
            { value: 'fr', text: 'French' },
            { value: 'de', text: 'German' },
            { value: 'hi', text: 'Hindi' },
            { value: 'ja', text: 'Japanese' },
            { value: 'ko', text: 'Korean' },
            { value: 'pa', text: 'Punjabi' },
            { value: 'ru', text: 'Russian' },
            { value: 'th', text: 'Thai' },
            { value: 'vi', text: 'Vietnamese' },
            { value: 'ar', text: 'Arabic' },
            { value: 'it', text: 'Italian' },
            { value: 'nl', text: 'Dutch' },
            { value: 'sv', text: 'Swedish' },
            { value: 'da', text: 'Danish' },
            { value: 'no', text: 'Norwegian' },
            { value: 'pl', text: 'Polish' },
            { value: 'tr', text: 'Turkish' },
            { value: 'he', text: 'Hebrew' },
            { value: 'cs', text: 'Czech' },
            { value: 'hu', text: 'Hungarian' }
          ];
          const found = options.find(opt => opt.text === selectedText);
          if (found) fromLanguage = found.value;
        }
        addToHistory(sourceText, fromLanguage, data.translations);
    }
  } else if (data.translation && selectedLanguages.length === 1) { // Handle single language response (backward compatibility from old backend)
    const languageName = languageNames[selectedLanguages[0]] || selectedLanguages[0];
    translationContentDiv.innerHTML = `
      <div class="translation-result">
        <h4>${languageName}:</h4>
        <p>${data.translation}</p>
      </div>
    `;

    if (addToHistoryFlag) {
        const sourceText = document.getElementById("source").value;
        // Use custom dropdown for fromLanguage
        let fromLanguage = 'en';
        const fromLangDropdownSelected = document.getElementById('fromLangDropdownSelected');
        if (fromLangDropdownSelected) {
          const selectedText = fromLangDropdownSelected.querySelector('span').textContent;
          const options = [
            { value: 'en', text: 'English' },
            { value: 'fil', text: 'Filipino' },
            { value: 'es', text: 'Spanish' },
            { value: 'pt', text: 'Portuguese' },
            { value: 'fr', text: 'French' },
            { value: 'de', text: 'German' },
            { value: 'hi', text: 'Hindi' },
            { value: 'ja', text: 'Japanese' },
            { value: 'ko', text: 'Korean' },
            { value: 'pa', text: 'Punjabi' },
            { value: 'ru', text: 'Russian' },
            { value: 'th', text: 'Thai' },
            { value: 'vi', text: 'Vietnamese' },
            { value: 'ar', text: 'Arabic' },
            { value: 'it', text: 'Italian' },
            { value: 'nl', text: 'Dutch' },
            { value: 'sv', text: 'Swedish' },
            { value: 'da', text: 'Danish' },
            { value: 'no', text: 'Norwegian' },
            { value: 'pl', text: 'Polish' },
            { value: 'tr', text: 'Turkish' },
            { value: 'he', text: 'Hebrew' },
            { value: 'cs', text: 'Czech' },
            { value: 'hu', text: 'Hungarian' }
          ];
          const found = options.find(opt => opt.text === selectedText);
          if (found) fromLanguage = found.value;
        }
        const translations = [{
          language: selectedLanguages[0],
          text: data.translation
        }];
        addToHistory(sourceText, fromLanguage, translations);
    }
  } else {
    // Fallback for unexpected response format
    translationContentDiv.innerHTML = "<p style='color: red;'>Unexpected response format from server.</p>";
  }

  // Re-append buttons to the parent output-box (which contains resultDiv)
  if (outputButtonsContainer) {
      resultDiv.parentElement.appendChild(outputButtonsContainer);
  }
}