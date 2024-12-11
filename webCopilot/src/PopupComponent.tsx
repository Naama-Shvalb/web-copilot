import React, { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    ThemeProvider,
    createTheme
} from '@mui/material';
import { Key } from '@mui/icons-material';

const theme = createTheme();

const PopupComponent: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        chrome.storage.sync.get(['openaiApiKey'], (result) => {
            if (result.openaiApiKey) {
                setApiKey(result.openaiApiKey);
            }
        });
    }, []);

    const handleSave = () => {
        const trimmedKey = apiKey.trim();
        
        if (!trimmedKey) {
            setStatus('error');
            return;
        }

        chrome.storage.sync.set({ openaiApiKey: trimmedKey }, () => {
            setStatus('success');
            setTimeout(() => setStatus(''), 2000);
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <Paper sx={{ width: '300px', p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Web Copilot Settings
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="OpenAI API Key"
                        variant="outlined"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        size="small"
                        type="password"
                    />
                    
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        startIcon={<Key />}
                    >
                        Save API Key
                    </Button>

                    {status === 'success' && (
                        <Alert severity="success">
                            API key saved successfully!
                        </Alert>
                    )}
                    
                    {status === 'error' && (
                        <Alert severity="error">
                            Please enter an API key
                        </Alert>
                    )}
                </Box>
            </Paper>
        </ThemeProvider>
    );
};

export default PopupComponent; 