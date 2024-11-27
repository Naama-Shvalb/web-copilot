import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import ReactMarkdown from 'react-markdown';

const WebCopilot: React.FC = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState('');
    const [apiKey, setApiKey] = useState('');

    // Load API key when component mounts
    React.useEffect(() => {
        chrome.storage.sync.get(['openaiApiKey'], (result) => {
            setApiKey(result.openaiApiKey || '');
        });
    }, []);

    const handleAsk = async () => {
        if (!apiKey) {
            setError('Please set your OpenAI API key in the extension popup');
            return;
        }

        const pageContent = document.body.innerText;
        const pageUrl = window.location.href;
        const pageTitle = document.title;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
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
            setAnswer(data.choices[0]?.message?.content || 'Sorry, I could not generate an answer.');
        } catch (error) {
            console.error('Error:', error);
            setError('Sorry, an error occurred while processing your request.');
        }
    };

    return (
        <div id="web-copilot" style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: '#f0f0f0', borderTop: '1px solid #ccc', zIndex: 10000, padding: '10px' }}>
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question..." style={{ width: '80%', padding: '5px' }} />
            <button onClick={handleAsk} style={{ padding: '5px 10px' }}>Ask</button>
            {answer && (
                <div style={{ marginTop: '10px', padding: '10px', background: 'white', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative' }}>
                    <button onClick={() => setAnswer('')} style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '0 5px' }}>×</button>
                    <div style={{ paddingRight: '30px' }}>
                        <ReactMarkdown>{answer}</ReactMarkdown>
                    </div>
                </div>
            )}
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    );
};

// Create and inject the mount point
const mountPoint = document.createElement('div');
mountPoint.id = 'web-copilot-root';
document.body.appendChild(mountPoint);

// Create root and render
const root = createRoot(mountPoint);
root.render(<WebCopilot />);

