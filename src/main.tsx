import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './ErrorBoundary.tsx';
import './index.css';

console.log('Mount: Start');

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<div style="padding:20px; color:red;">#root missing</div>';
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>,
    );
    console.log('Mount: Render initiated');
  } catch (error) {
    console.error('Mount: FATAL ERROR', error);
    rootElement.innerHTML = `
      <div style="padding:20px; background:white; border:2px solid red;">
        <h3 style="color:red; margin:0;">Application initialization failed</h3>
        <p>${error instanceof Error ? error.message : String(error)}</p>
      </div>
    `;
  }
}
