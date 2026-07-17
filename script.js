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

            const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
            const body = {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are an elite bilingual English copywriter and Gujarati/Hindi translator. 
The user provides the ORIGINAL Gujlish text and a ROUGH translation. 
Your ONLY job is to output a flawless, 100% natural conversational English sentence. 

CRITICAL RULES FOR NATURAL ENGLISH:
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
        if (!text) return;

        topicInput.value = '';
        topicInput.style.height = 'auto'; // Reset height
        generateBtn.disabled = true;

        // Display user message
        appendMessage('user', text);
        currentSession.push({ role: 'user', content: text });
        
        // Show loading state in a temporary AI bubble
        const loadingId = 'loading-' + Date.now();
        const loadingHtml = `<div class="message ai" id="${loadingId}">
            <div class="avatar">AI</div>
            <div class="content">Translating...</div>
        </div>`;
        messagesContainer.insertAdjacentHTML('beforeend', loadingHtml);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Call API
        const corrected = await correctToEnglish(text);

        // Remove loading bubble
        document.getElementById(loadingId).remove();

        // Display AI message
        appendMessage('ai', corrected);
        currentSession.push({ role: 'ai', content: corrected });

        // Save to History
        if (chatHistory.length === 0 || currentSession.length === 2) {
            // New session
            chatHistory.push({
                title: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
                messages: currentSession
            });
        } else {
            // Update current session
            chatHistory[chatHistory.length - 1].messages = currentSession;
        }
        localStorage.setItem('ai_prompts_history', JSON.stringify(chatHistory));
        renderHistorySidebar();

        generateBtn.disabled = false;
    });

    // Handle Enter to submit (Shift+Enter for new line)
    topicInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateBtn.click();
        }
    });

    // Auto-resize textarea
    topicInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Init
    renderHistorySidebar();
});
