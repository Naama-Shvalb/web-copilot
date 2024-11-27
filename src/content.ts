document.body.insertAdjacentHTML(
    'beforeend',
    `<div id="web-copilot" style="position: fixed; bottom: 0; left: 0; width: 100%; background: #f0f0f0; border-top: 1px solid #ccc; z-index: 10000; padding: 10px;">
    <input type="text" id="question" placeholder="Ask a question..." style="width: 80%; padding: 5px;">
    <button id="ask-btn" style="padding: 5px 10px;">Ask</button>
  </div>`
);

document.getElementById('ask-btn')?.addEventListener('click', async () => {
    const question = (document.getElementById('question') as HTMLInputElement).value;
    const pageContent = document.body.innerText;
    const pageUrl = window.location.href;
    const pageTitle = document.title;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer sk-proj-8FIlEAaQdSX8QDP8sQLtT3BlbkFJXIQSQcH9qn93QYAwSXYy`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [{ role: 'system', content: 'Analyze webpage content and answer questions.' },
                    { role: 'user', content: `Page Content: ${pageContent}\nQuestion: ${question}` }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const answer = data.choices[0]?.message?.content || 'Sorry, I could not generate an answer.';
        createAnswerUI()
        displayAnswer(answer);
    } catch (error) {
        console.error('Error:', error);
        createAnswerUI()
        displayAnswer('Sorry, an error occurred while processing your request.');
    }
});
function createAnswerUI() {
    const answerDiv = document.createElement('div');
    answerDiv.id = 'web-copilot-answer';
    answerDiv.style.cssText = `
        display: none;
        margin-top: 10px;
        padding: 10px;
        background: white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        position: relative;
    `;

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        position: absolute;
        right: 10px;
        top: 10px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 0 5px;
    `;
    closeButton.onclick = () => {
        answerDiv.style.display = 'none';
    };

    answerDiv.appendChild(closeButton);
    document.getElementById('web-copilot')?.appendChild(answerDiv);
}

function displayAnswer(text: string) {
    const answerDiv = document.getElementById('web-copilot-answer');
    if (answerDiv) {
        // Create a container for the text to prevent overlap with close button
        const textContainer = document.createElement('div');
        textContainer.style.paddingRight = '30px'; // Make space for close button
        textContainer.textContent = text;
        
        // Clear previous content and add new text
        answerDiv.innerHTML = ''; // Clear existing content
        answerDiv.appendChild(textContainer);
        
        // Re-add close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            position: absolute;
            right: 10px;
            top: 10px;
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            padding: 0 5px;
        `;
        closeButton.onclick = () => {
            answerDiv.style.display = 'none';
        };
        
        answerDiv.appendChild(closeButton);
        answerDiv.style.display = 'block';
    }
}

interface OpenAIResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

