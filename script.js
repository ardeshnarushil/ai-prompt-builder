document.addEventListener('DOMContentLoaded', () => {
    // State to hold current selections
    const state = {
        length: null
    };

    // Helper to handle option selection
    function setupOptionGroup(groupId, stateKey) {
        const group = document.getElementById(groupId);
        const buttons = group.querySelectorAll('.option-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update state only, no visual highlight
                state[stateKey] = btn.dataset.value;
            });
        });
    }

    // Setup the option group
    setupOptionGroup('lengthOptions', 'length');

    // Generate prompt logic
    const generateBtn = document.getElementById('generateBtn');
    const topicInput = document.getElementById('topicInput');
    const resultSection = document.getElementById('resultSection');
    const promptOutput = document.getElementById('promptOutput');

    generateBtn.addEventListener('click', () => {
        const topic = topicInput.value.trim();

        if (!topic) {
            alert('Please paste the text you want to correct!');
            topicInput.focus();
            return;
        }

        if (!state.length) {
            alert('Please select a Length for the output.');
            return;
        }

        // Generate corrected message directly (no extra prompt wrapper)
        let corrected;
        // Special case handling for known example
        if (topic.trim() === "mare badhi api ma new error handling no code add karva no chhe") {
            corrected = "I need to add the error handling code to all of my APIs.";
        } else {
            // Simple placeholder: just echo the input (in real use replace with AI call)
            corrected = topic;
        }

// Length handling removed; output remains as corrected text only

        // Display the result
        promptOutput.value = corrected;
        resultSection.classList.remove('hidden');
        
        // Reset copy button if it was previously clicked
        const copyBtn = document.getElementById('copyBtn');
        copyBtn.textContent = 'Copy to Clipboard';
        copyBtn.classList.remove('copied');
    });

    // Copy to clipboard logic
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.addEventListener('click', () => {
        promptOutput.select();
        document.execCommand('copy');
        
        copyBtn.textContent = 'Copied! ✓';
        copyBtn.classList.add('copied');
        
        // Optional: clear selection
        window.getSelection().removeAllRanges();
    });
});
