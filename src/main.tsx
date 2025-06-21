// C:\Users\pedro\Desktop\project\src\main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // Tu archivo CSS global, si existe
import { BrowserRouter } from 'react-router-dom'; // Importa BrowserRouter
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Para React Query

const queryClient = new QueryClient(); // Instancia de QueryClient para React Query

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* Envuelve tu App con BrowserRouter */}
      <QueryClientProvider client={queryClient}> {/* Envuelve tu App con QueryClientProvider */}
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
