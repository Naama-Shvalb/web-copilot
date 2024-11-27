import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import ReactMarkdown from 'react-markdown';
import { 
    TextField, 
    Button, 
    Paper, 
    Box, 
    IconButton,
    Typography,
    Alert,
    ThemeProvider,
    createTheme
} from '@mui/material';
import { Close, Send } from '@mui/icons-material';

// Create a theme (optional - for consistent styling)
const theme = createTheme({
    palette: {
        primary: {
            main: '#2196f3',
        },
    },
});

export const WebCopilot: React.FC = () => {
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
        <ThemeProvider theme={theme}>
            <Paper
                elevation={3}
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    zIndex: 10000,
                    p: 2,
                    borderRadius: '12px 12px 0 0',
                }}
            >
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question..."
                        size="small"
                    />
                    <Button
                        variant="contained"
                        onClick={handleAsk}
                        endIcon={<Send />}
                    >
                        Ask
                    </Button>
                </Box>

                {answer && (
                    <Paper 
                        elevation={1}
                        sx={{ 
                            mt: 2, 
                            p: 2, 
                            position: 'relative',
                            maxHeight: '300px',
                            overflow: 'auto'
                        }}
                    >
                        <IconButton
                            onClick={() => setAnswer('')}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                            }}
                            size="small"
                        >
                            <Close />
                        </IconButton>
                        <Box sx={{ pr: 4 }}>
                            <ReactMarkdown>{answer}</ReactMarkdown>
                        </Box>
                    </Paper>
                )}

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Paper>
        </ThemeProvider>
    );
};

// Create and inject the mount point
const mountPoint = document.createElement('div');
mountPoint.id = 'web-copilot-root';
// unset and set initial styles for the mount point
mountPoint.style.all = 'unset';
// set ltr direction
mountPoint.style.direction = 'ltr';
// set padding to 0 50px
mountPoint.style.padding = '0 50px';
document.body.appendChild(mountPoint);

// Create root and render
const root = createRoot(mountPoint);
root.render(<WebCopilot />);

