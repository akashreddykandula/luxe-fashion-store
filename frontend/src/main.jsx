import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import store from './store';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <App />
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0A0A0A',
              color: '#FAFAFA',
              borderRadius: '0',
              fontSize: '13px',
              letterSpacing: '0.02em',
              padding: '14px 18px',
            },
            success: {
              iconTheme: { primary: '#C9A96E', secondary: '#0A0A0A' },
            },
            error: {
              style: { background: '#DC2626', color: '#fff' },
            },
          }}
        />
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);
