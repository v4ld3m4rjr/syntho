import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Componente de teste simples
function TestApp() {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>Test App</h1>
            <p>If you see this, React is working!</p>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <TestApp />
    </React.StrictMode>,
)
