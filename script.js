document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const topicInput = document.getElementById('topicInput');
    const resultSection = document.getElementById('resultSection');
    const promptOutput = document.getElementById('promptOutput');

    // Load saved API key from localStorage
    let apiKey = localStorage.getItem('groq_api_key') || '';

    // If no key saved, ask once
    if (!apiKey) {
        apiKey = prompt('Enter your Groq API Key (starts with gsk_):');
        if (apiKey) {
            localStorage.setItem('groq_api_key', apiKey.trim());
            apiKey = apiKey.trim();
        }
    }

    async function correctToEnglish(text) {
        const url = 'https://api.groq.com/openai/v1/chat/completions';

        const body = {
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are an English correction tool. The user will give you text in any language (Gujarati, Hindi, broken English, or mixed). Your job is to understand the meaning and return ONLY the corrected proper English sentence. Do not add any explanation, do not add quotes, just return the corrected English text.'
                },
                {
                    role: 'user',
                    content: text
                }
            ],
            temperature: 0.2
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.error) {
                console.error('Groq API error:', data.error);
                // Clear invalid key
                if (data.error.message.includes('Invalid API Key') || response.status === 401) {
                    localStorage.removeItem('groq_api_key');
                    apiKey = '';
                }
                return 'Error: ' + data.error.message;
            }

            const result = data.choices[0].message.content.trim();
            return result;
        } catch (err) {
            console.error('Request failed:', err);
            return 'Error: Network request failed. Please try again.';
        }
    }

    // Generate button click
    generateBtn.addEventListener('click', async () => {
        if (!apiKey) {
            apiKey = prompt('Enter your Groq API Key (starts with gsk_):');
            if (apiKey) {
                localStorage.setItem('groq_api_key', apiKey.trim());
                apiKey = apiKey.trim();
            } else {
                return;
            }
        }

        const topic = topicInput.value.trim();

        if (!topic) {
            alert('Please paste the text you want to correct!');
            topicInput.focus();
            return;
        }

        // Show loading
        generateBtn.disabled = true;
        generateBtn.textContent = 'Processing...';
        promptOutput.value = 'Translating & correcting...';
        resultSection.classList.remove('hidden');

        // Call Groq API
        const corrected = await correctToEnglish(topic);
        promptOutput.value = corrected;

        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Perfect Prompt ✨';

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
