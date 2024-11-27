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

    const data = await response.json();
    const answer = data.choices[0].message.content;

    alert(`Answer: ${answer}`);
});
