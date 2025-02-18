import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { SpotifyProvider } from './context/SpotifyContext';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SpotifyProvider>
            <App />
        </SpotifyProvider>
    </StrictMode>,
);
