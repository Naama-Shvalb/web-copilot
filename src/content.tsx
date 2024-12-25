import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import React, { useState, useRef, useEffect } from 'react';
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
    createTheme,
    CircularProgress
} from '@mui/material';
import { Close, Send, Minimize, OpenInFull, ChatBubble } from '@mui/icons-material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';


const theme = createTheme({
    typography: {
        fontSize: 16,
    },

    palette: {
        primary: {
            main: '#2196f3',
        },
    },
});

const isRTL = (text: string): boolean => {
    const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    return rtlRegex.test(text);
};

export const WebCopilot: React.FC = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [position, setPosition] = useState(() => {
        const saved = localStorage.getItem('webCopilotPosition');
        return saved ? JSON.parse(saved) : { x: 20, y: 20 };
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isMinimized, setIsMinimized] = useState(() => {
        const saved = localStorage.getItem('webCopilotMinimized');
        return saved ? JSON.parse(saved) : true;
    });
    const dragRef = useRef<{ x: number; y: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [dragStartTime, setDragStartTime] = useState<number>(0);

    React.useEffect(() => {
        chrome.storage.sync.get(['openaiApiKey'], (result) => {
            setApiKey(result.openaiApiKey || '');
        });
    }, []);

    useEffect(() => {
        localStorage.setItem('webCopilotMinimized', JSON.stringify(isMinimized));
    }, [isMinimized]);

    useEffect(() => {
        localStorage.setItem('webCopilotPosition', JSON.stringify(position));
    }, [position]);

    const getTextDirection = (text: string) => {
        return isRTL(text) ? 'rtl' : 'ltr';
    };

    const handleAsk = async () => {
        if (!apiKey) {
            setError('Please set your OpenAI API key in the extension popup');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const pageContent = document.body.innerText.slice(0, 10000);
            const pageUrl = window.location.href;
            const pageTitle = document.title;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: `### Instructions 
1. **Understand Context**:
    - Use the provided 'Page URL', 'Page Title', and 'Page Content' to determine the context and purpose of the page.
    - Analyze the page content to identify its main features, functionality, or relevant sections.

2. **Tailor the Answer**:
    - Generate responses specifically aligned with the context of the page.
    - Avoid generic answers and directly reference details from the provided page content.

3. **Handle User Intent**:
    - Infer user intent based on the question and page context.
    - If the question is vague, guide the response using the most relevant page sections.

4. **Be Concise and Actionable**:
    - Provide clear, step-by-step instructions or actionable advice if the user's query requires guidance.
    - Summarize relevant parts of the page before answering, if necessary.

5. **Acknowledge Limitations**:
    - If information on the page is insufficient, explicitly state this and suggest further steps or additional context required.

6. **Example Response Formats**:
    - **For How-To Questions**: "Based on the settings page you are viewing, follow these steps: ..."
    - **For Explanations**: "This page allows you to configure [feature]. According to the content, you can achieve this by..."
    - **For Suggestions**: "From the context of this page, it seems you are trying to [goal]. Here's how you might proceed..."

7. **Avoid Irrelevance**:
    - Do not include information unrelated to the current webpage content.
    - Mention explicitly if the page content lacks necessary details for answering the question.

8. **Adapt for Dynamic Pages**:
    - If the content indicates dynamic interactions (e.g., forms, buttons, or dynamic elements), guide the user on static content and suggest interactive exploration where needed.`
                        },
                        {
                            role: 'user',
                            content: `Page URL: ${pageUrl}\nPage Title: ${pageTitle}\nPage Content: \n''' \n ${pageContent}\n ''' \n  Please answer the following question in the same language as the question. If the question is in Hebrew, respond in Hebrew: \nQuestion: ${question}`
                        }
                    ],
                    temperature: 0
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStartTime(Date.now());
        dragRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && dragRef.current) {
            setPosition({
                x: e.clientX - dragRef.current.x,
                y: e.clientY - dragRef.current.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        dragRef.current = null;
    };

    return (
        <ThemeProvider theme={theme}>
            <Paper
                elevation={2}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    maxWidth: isMinimized ? '40px' : '800px',
                    width: isMinimized ? '40px' : '95%',
                    height: isMinimized ? '40px' : 'auto',
                    maxHeight: isMinimized ? '40px' : '80vh',
                    overflow: 'hidden',
                    zIndex: 99999,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    transition: 'width 0.2s ease, height 0.2s ease',
                    backgroundColor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: isMinimized ? '0' : '16px',
                    borderRadius: isMinimized ? '20px' : '8px',
                    fontSize: '16px',

                }}
            >
                {isMinimized ? (
                    <Box
                        sx={{
                            width: '40px',
                            height: '40px',
                            cursor: isDragging ? 'grabbing' : 'pointer',
                        }}
                        onClick={(e) => {
                            // Only maximize if not dragging
                            if (!isDragging) {
                                setIsMinimized(false);
                            }
                        }}
                    >
                        <ChatBubble sx={{
                            color: 'primary.main',
                            width: '28px',
                            height: '28px',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none' // Prevent icon from interfering with drag
                        }} />
                    </Box>
                ) : (
                    <>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            width: '100%'
                        }}>
                            <IconButton
                                onClick={() => setIsMinimized(true)}
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 0,
                                    height: '40px',
                                    width: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1
                                }}
                            >
                                <Minimize sx={{
                                    transform: 'translateY(1px)'
                                }} />
                            </IconButton>

                            <Box sx={{
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: answer ? 2 : 0,
                                mt: 1
                            }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Ask a question..."
                                    size="small"
                                    dir={getTextDirection(question)}
                                    sx={{
                                        maxWidth: '600px',
                                        '& .MuiOutlinedInput-root': {
                                            height: '40px',
                                            backgroundColor: '#f5f5f5',
                                            '&:hover': {
                                                backgroundColor: '#eeeeee',
                                            }
                                        }
                                    }}
                                />
                                <IconButton
                                    onClick={handleAsk}
                                    color="primary"
                                    sx={{
                                        height: '40px',
                                        width: '40px',
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'primary.dark',
                                        }
                                    }}
                                >
                                    <Send />
                                </IconButton>
                            </Box>

                            {isLoading && (
                                <Box sx={{
                                    mt: 2,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    <CircularProgress size={24} />
                                    <Typography variant="body2" color="text.secondary">
                                        Generating response...
                                    </Typography>
                                </Box>
                            )}

                            {answer && !isLoading && (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        mt: 2,
                                        p: 2,
                                        position: 'relative',
                                        maxWidth: '100%',
                                        maxHeight: 'calc(80vh - 120px)',
                                        overflow: 'auto',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '4px',
                                        '& pre': {
                                            marginLeft: '16px',
                                            overflowX: 'auto',
                                            width: 'calc(100% - 16px)'
                                        }
                                    }}
                                >
                                    <IconButton
                                        onClick={() => setAnswer('')}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            right: 8,
                                            top: 8,
                                            padding: '4px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                            }
                                        }}
                                    >
                                        <Close fontSize="small" />
                                    </IconButton>
                                    <Box sx={{
                                        pr: 4,
                                        mt: 1
                                    }}
                                         dir={getTextDirection(answer)}
                                    >
                                        <ReactMarkdown>{answer}</ReactMarkdown>
                                    </Box>
                                </Paper>
                            )}

                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                </Alert>
                            )}
                        </Box>
                    </>
                )}
            </Paper>
        </ThemeProvider>
    );
};
const mountPoint = document.createElement('div');
mountPoint.id = 'web-copilot-root';

const shadowRoot = mountPoint.attachShadow({ mode: 'open' });
document.body.appendChild(mountPoint);

const styleElement = document.createElement('style');
styleElement.textContent = `
    *, *::before, *::after {
        margin: 0 ;
        padding: 4 ;
        box-sizing: border-box ;
    }

    :host {
        all: initial
        font-size: 16px;
        font-family: 'Roboto', Arial, sans-serif ;
        line-height: 1.5 ;
        color: #333 ;
        background-color: white ;
        display: block ;
    }

    html, body {
        font-size: 16px;
    }

    input {
        all: unset;
        font-size: 16px !important;
        font-family: 'Roboto', Arial, sans-serif;
        line-height: 1.5;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: white;
        color: #333;
        width: 100%;
        box-sizing: border-box ;
        position: relative;
        transition: transform 0.2s;
    }

    input:focus {
        outline: none;
        border-color: #2196f3;
        box-shadow: 0 0 2px rgba(33, 150, 243, 0.5);
        transform: translateY(0);
    }

    #web-copilot-root {
        position: fixed;
        top: 10px;
        left: 10px;
        width: 400px;
        max-width: 400px;
        padding: 16px;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: white;
        z-index: 99999;
        overflow: auto;
        scroll-behavior: smooth;
    }
`;
shadowRoot.appendChild(styleElement);

const emotionCache = createCache({
    key: 'web-copilot',
    container: shadowRoot,
});

const rootContainer = document.createElement('div');
shadowRoot.appendChild(rootContainer);

const root = createRoot(rootContainer);
root.render(
    <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
            <WebCopilot />
        </ThemeProvider>
    </CacheProvider>
);
