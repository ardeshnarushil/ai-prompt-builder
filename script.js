document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = { length: null };

    // Setup length buttons
    const lengthGroup = document.getElementById('lengthOptions');
    const lengthBtns = lengthGroup.querySelectorAll('.option-btn');
    lengthBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            state.length = btn.dataset.value;
        });
    });

    const generateBtn = document.getElementById('generateBtn');
    const topicInput = document.getElementById('topicInput');
    const resultSection = document.getElementById('resultSection');
    const promptOutput = document.getElementById('promptOutput');

    // Free translation function – no API key needed
    async function translateToEnglish(text) {
        try {
            const url = 'https://translate.googleapis.com/translate_a/single'
                + '?client=gtx&sl=auto&tl=en&dt=t&q=' + encodeURIComponent(text);

            const response = await fetch(url);
            const data = await response.json();

            // data[0] contains the translated segments
            let translated = '';
            for (let i = 0; i < data[0].length; i++) {
                translated += data[0][i][0];
            }
            return translated.trim();
        } catch (err) {
            console.error('Translation error:', err);
            return 'Error: Could not translate. Please try again.';
        }
    }

    // Generate button click
    generateBtn.addEventListener('click', async () => {
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

        // Show loading
        promptOutput.value = 'Translating & correcting...';
        resultSection.classList.remove('hidden');

        // Call free translation API
        let corrected = await translateToEnglish(topic);

        // Adjust based on length
        if (state.length === 'Short') {
            const words = corrected.split(/\s+/);
            if (words.length > 15) {
                corrected = words.slice(0, 15).join(' ') + '...';
            }
        }
        // Medium and Long: keep as-is

        promptOutput.value = corrected;

        // Reset copy button
        const cb = document.getElementById('copyBtn');
        cb.textContent = 'Copy to Clipboard';
        cb.classList.remove('copied');
    });

    // Copy to clipboard
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.addEventListener('click', () => {
        promptOutput.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied! ✓';
        copyBtn.classList.add('copied');
        window.getSelection().removeAllRanges();
    });
});
