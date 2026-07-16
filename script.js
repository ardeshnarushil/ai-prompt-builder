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

// Async function to call OpenAI API for correction and translation
async function getCorrectedText(inputText) {
    const apiKey = "YOUR_OPENAI_API_KEY"; // <-- replace with your actual OpenAI API key
    const endpoint = "https://api.openai.com/v1/chat/completions";
    const prompt = `Correct the spelling, grammar and translate the following text to proper English. Return only the corrected English sentence.

Text: "${inputText}"`;
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.2,
            }),
        });
        const data = await response.json();
        if (data.error) {
            console.error("OpenAI API error:", data.error);
            return "Error: Unable to get correction.";
        }
        const corrected = data.choices[0].message.content.trim();
        return corrected;
    } catch (err) {
        console.error(err);
        return "Error: Network request failed.";
    }
}

// Updated generate button logic to use the API
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

    // Show a temporary loading message
    promptOutput.value = "Processing...";
    resultSection.classList.remove('hidden');

    let corrected = await getCorrectedText(topic);

    // Optionally adjust based on selected length (simple trimming)
    if (state.length === 'Short') {
        // truncate to first 20 words for short version
        corrected = corrected.split(/\s+/).slice(0, 20).join(' ') + "...";
    } else if (state.length === 'Medium') {
        // keep as is for medium
    } else if (state.length === 'Long') {
        // no change for long, could add extra detail but keep original
    }

    promptOutput.value = corrected;

    // Reset copy button
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
