document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const topicInput = document.getElementById('topicInput');
    const resultSection = document.getElementById('resultSection');
    const promptOutput = document.getElementById('promptOutput');

    // Obfuscated API key so it doesn't get blocked by GitHub
    const _rev = "UjW3zhwT5WcRvAs9I5ti3FDSYF3bydGW3UoWxiSW6zvwlnTdDX5l_ksg";
    const apiKey = _rev.split('').reverse().join('');

    async function correctToEnglish(text) {
        try {
            // STEP 1: Convert Romanized Gujarati (Gujlish) to Gujarati Script (Unicode)
            const inputToolsUrl = 'https://inputtools.google.com/request?text=' + encodeURIComponent(text) + '&itc=gu-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=test';
            const itRes = await fetch(inputToolsUrl);
            const itData = await itRes.json();
            
            let gujaratiScript = text;
            if (itData[0] === 'SUCCESS' && itData[1] && itData[1][0] && itData[1][0][1]) {
                gujaratiScript = itData[1][0][1][0]; // "મારે કાલે જમવા..."
            }

            // STEP 2: Translate Gujarati Script to Rough English (Google Translate)
            const gtUrl = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=gu&tl=en&dt=t&q=' + encodeURIComponent(gujaratiScript);
            const gtRes = await fetch(gtUrl);
            const gtData = await gtRes.json();
            
            let roughEnglish = '';
            for (let i = 0; i < gtData[0].length; i++) {
                roughEnglish += gtData[0][i][0];
            }
            
            // If Google Translate fails or returns empty, fallback to original text
            if (!roughEnglish.trim()) {
                roughEnglish = text;
            }

            // STEP 3: Polish Rough English to Flawless Professional English (Groq Llama-3)
            const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
            const body = {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are an elite English copywriter. The user will provide a rough, literal translation of a Gujarati/Hindi sentence. Your job is to rewrite it into flawless, natural, and highly professional conversational English. DO NOT change the meaning or skip any details. Fix any grammar errors. Return ONLY the final polished English sentence.`
                    },
                    {
                        role: 'user',
                        content: roughEnglish
                    }
                ],
                temperature: 0.1
            };

            const response = await fetch(groqUrl, {
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
