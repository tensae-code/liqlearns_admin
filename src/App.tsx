import React from 'react';
import Routes from './Routes';
import { AuthProvider } from './contexts/AuthContext';
import GDPRConsentBanner from './components/GDPRConsentBanner';

function App() {
  return (
    <AuthProvider>
      <Routes />
      <GDPRConsentBanner />
    </AuthProvider>
  );
}

export default App;