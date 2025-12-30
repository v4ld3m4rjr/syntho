import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

console.log('Simple test loaded');

function SimpleApp() {
    const [message, setMessage] = React.useState('Loading...');

    React.useEffect(() => {
        console.log('SimpleApp mounted');
        setMessage('React is working! The problem is in App.tsx or its dependencies.');
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
            <div className="card max-w-md">
                <h1 className="text-2xl font-bold mb-4">Debug Test</h1>
                <p className="text-lg">{message}</p>
                <p className="text-sm mt-4 text-slate-600 dark:text-slate-400">
                    Check the console for more details
                </p>
            </div>
        </div>
    );
}

try {
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <SimpleApp />
        </React.StrictMode>,
    )
    console.log('SimpleApp rendered');
} catch (error) {
    console.error('Error:', error);
}
