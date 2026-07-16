document.addEventListener('DOMContentLoaded', () => {
    // State to hold current selections
    const state = {
        role: null,
        tone: null,
        length: null
    };

    // Helper to handle option selection
    function setupOptionGroup(groupId, stateKey) {
        const group = document.getElementById(groupId);
        const buttons = group.querySelectorAll('.option-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove selected class from all buttons in group
                buttons.forEach(b => b.classList.remove('selected'));
                // Add selected class to clicked button
                btn.classList.add('selected');
                // Update state
                state[stateKey] = btn.dataset.value;
            });
        });
    }

    // Setup the three option groups
    setupOptionGroup('roleOptions', 'role');
    setupOptionGroup('toneOptions', 'tone');
    setupOptionGroup('lengthOptions', 'length');

    // Generate prompt logic
    const generateBtn = document.getElementById('generateBtn');
    const topicInput = document.getElementById('topicInput');
    const resultSection = document.getElementById('resultSection');
    const promptOutput = document.getElementById('promptOutput');

    generateBtn.addEventListener('click', () => {
        const topic = topicInput.value.trim();

        if (!topic) {
            alert('Please enter a topic!');
            topicInput.focus();
            return;
        }

        if (!state.role || !state.tone || !state.length) {
            alert('Please select a Role, Tone, and Length to craft the perfect prompt.');
            return;
        }

        // Construct the prompt
        let prompt = `Act as an expert ${state.role}. `;
        
        prompt += `I need you to write about or create content for the following topic: "${topic}". `;
        
        prompt += `Please maintain a ${state.tone} tone throughout your response. `;

        if (state.length === 'Short') {
            prompt += `Keep your response short, concise, and straight to the point (under 150 words).`;
        } else if (state.length === 'Medium') {
            prompt += `Provide a medium-length, well-structured response with moderate detail.`;
        } else if (state.length === 'Long') {
            prompt += `Provide a highly detailed, comprehensive, and long-form response covering all nuances of the topic.`;
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
