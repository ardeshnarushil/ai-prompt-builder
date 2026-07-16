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

        // Construct the prompt with exact required format
        let prompt = `Please correct the spellings and English grammar in the following text. Also, focus on improving clarity and flow.\n\nText: "${topic}"\n\n`;

        if (state.length === 'Short') {
            prompt += `Keep the corrected version very short and concise. Remove any unnecessary words.`;
        } else if (state.length === 'Medium') {
            prompt += `Provide a medium-length corrected version, keeping the original meaning intact but making it read naturally.`;
        } else if (state.length === 'Long') {
            prompt += `Provide a highly detailed and expressive corrected version. You can expand slightly to make it sound highly professional and articulate.`;
        }

        // Display the result
        promptOutput.value = prompt;
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
