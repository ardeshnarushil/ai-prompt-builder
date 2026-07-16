document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const topicInput = document.getElementById('topicInput');
    const resultSection = document.getElementById('resultSection');
    const promptOutput = document.getElementById('promptOutput');

    // Try translating with a specific source language
    async function tryTranslate(text, sourceLang) {
        const url = 'https://translate.googleapis.com/translate_a/single'
            + '?client=gtx&sl=' + sourceLang + '&tl=en&dt=t&q=' + encodeURIComponent(text);
        const response = await fetch(url);
        const data = await response.json();
        let translated = '';
        for (let i = 0; i < data[0].length; i++) {
            translated += data[0][i][0];
        }
        return translated.trim();
    }

    // Smart translation: tries multiple languages if result looks unchanged
    async function translateToEnglish(text) {
        try {
            // 1. Try Gujarati first
            let result = await tryTranslate(text, 'gu');
            if (result.toLowerCase() !== text.toLowerCase()) {
                return result;
            }

            // 2. Try Hindi
            result = await tryTranslate(text, 'hi');
            if (result.toLowerCase() !== text.toLowerCase()) {
                return result;
            }

            // 3. Try auto-detect as fallback
            result = await tryTranslate(text, 'auto');
            return result;
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

        // Show loading
        promptOutput.value = 'Translating & correcting...';
        resultSection.classList.remove('hidden');

        // Translate
        const corrected = await translateToEnglish(topic);
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
