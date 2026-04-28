import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppWithProviders } from './App.tsx';
import { SplashScreen } from './components/SplashScreen.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SplashScreen />
    <AppWithProviders />
  </StrictMode>
);
