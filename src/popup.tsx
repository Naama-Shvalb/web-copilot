import React from 'react';
import { createRoot } from 'react-dom/client';
import PopupComponent from './PopupComponent';

const root = createRoot(document.getElementById('root')!);
root.render(<PopupComponent />);
