import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('main.tsx loaded');
console.log('Root element:', document.getElementById('root'));

try {
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )
    console.log('App rendered successfully');
} catch (error) {
    console.error('Error rendering App:', error);
}
