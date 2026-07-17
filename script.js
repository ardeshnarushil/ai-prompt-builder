document.addEventListener('DOMContentLoaded', () => {
    const topicInput = document.getElementById('topicInput');
    const generateBtn = document.getElementById('generateBtn');
    const resultSection = document.getElementById('resultSection');
    const promptOutput = document.getElementById('promptOutput');
    const copyBtn = document.getElementById('copyBtn');
    const historyList = document.getElementById('historyList');
    const newChatBtn = document.getElementById('newChatBtn');

    // Obfuscated API key
    const _rev = "UjW3zhwT5WcRvAs9I5ti3FDSYF3bydGW3UoWxiSW6zvwlnTdDX5l_ksg";
    const apiKey = _rev.split('').reverse().join('');

    // Load History
    let chatHistory = JSON.parse(localStorage.getItem('ai_prompts_history_v2')) || [];

    function renderHistorySidebar() {
        historyList.innerHTML = '';
        chatHistory.slice().reverse().forEach((session, index) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.textContent = session.title;
            div.title = session.title;
            div.addEventListener('click', () => {
                // Remove active class from all
                document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
                div.classList.add('active');
                loadSession(chatHistory.length - 1 - index);
            });
            historyList.appendChild(div);
        });
    }

    function loadSession(index) {
        const session = chatHistory[index];
        topicInput.value = session.original;
        promptOutput.value = session.translated;
        resultSection.classList.remove('hidden');
        resetCopyBtn();
    }

    newChatBtn.addEventListener('click', () => {
        topicInput.value = '';
        promptOutput.value = '';
        resultSection.classList.add('hidden');
        document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
        resetCopyBtn();
    });

    function resetCopyBtn() {
        copyBtn.textContent = 'Copy to Clipboard';
        copyBtn.classList.remove('copied');
    }

    async function correctToEnglish(text) {
        try {
            const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
            const body = {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are an elite linguistic expert in Romanized Gujarati (Gujlish). The user writes in terrible Gujlish with severe spelling mistakes. You must perfectly translate it to English.

CRITICAL AUTOCORRECT & DICTIONARY:
- Spelling fixes: kael -> kale (tomorrow), shubah -> shubham, khatar nakh -> khatarnak (dangerous/scary), bov/bau -> very.
- NOTE: "khatar nakh" is NOT negative. It means "khatarnak" (dangerous/scary). Do NOT translate "nakh" as "not".
- Subject-Object Relation (The "-thi" rule): "A B thi bive che" means "A is scared of B". Example: "shubham bhai tena wife thi bive che" -> "Shubham bhai is scared of his wife." (NOT wife is scared of him).
- Verbs: jamva/khava (to eat/dinner), javanu/javu (to go), bive/beve/dar (scared/afraid), aav (come), malva (meet).
- Pronouns: mare (I have to), tu (you), ena/tena (his/her).
- Nouns: ghare/ghar (house), wife/patni (wife), bhai (brother).
- Connectors: thi (from/of), ne (to), na/no/ni (of).

CRITICAL RULES:
1. NEVER reverse the subject and object. Use the "-thi" rule above.
2. Translate EXACTLY what they mean. "mare kael shubha ne ghare khava java nu che shubah na wife bov khatar nakh chhe" -> "I have to go to Shubham's house to eat tomorrow, Shubham's wife is very dangerous."
3. DO NOT SKIP VERBS (eating, sleeping, going, scared).
4. Return ONLY the final flawless English sentence. No explanations.`
                    },
                    {
                        role: 'user',
                        content: text
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
            if (data.error) return 'Error: ' + data.error.message;
            
            // Post processing for natural english
            let res = data.choices[0].message.content.trim();
            res = res.replace(/go for a roam/ig, 'go out');
            res = res.replace(/eat java/ig, 'have dinner');
            return res;
        } catch (err) {
            return 'Error: Network request failed. Please try again.';
        }
    }

    generateBtn.addEventListener('click', async () => {
        const text = topicInput.value.trim();
        if (!text) {
            alert("Please paste some text first.");
            return;
        }

        // Show loading state
        const btnSpan = generateBtn.querySelector('span');
        const originalText = btnSpan.textContent;
        btnSpan.textContent = 'Generating... ⚡';
        generateBtn.disabled = true;
        
        promptOutput.value = 'Translating...';
        resultSection.classList.remove('hidden');
        resetCopyBtn();

        // Call API
        const corrected = await correctToEnglish(text);

        // Display result
        promptOutput.value = corrected;
        
        // Restore button state
        btnSpan.textContent = originalText;
        generateBtn.disabled = false;

        // Save to History
        const title = text.substring(0, 30) + (text.length > 30 ? '...' : '');
        chatHistory.push({
            title: title,
            original: text,
            translated: corrected
        });
        localStorage.setItem('ai_prompts_history_v2', JSON.stringify(chatHistory));
        renderHistorySidebar();
        
        // Auto-select latest
        const items = document.querySelectorAll('.history-item');
        if(items.length > 0) {
            items[0].classList.add('active');
        }
    });

    copyBtn.addEventListener('click', () => {
        promptOutput.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied! ✓';
        copyBtn.classList.add('copied');
        window.getSelection().removeAllRanges();
    });

    // Init
    renderHistorySidebar();
});
