import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Garantir que o root seja exibido após o carregamento
document.addEventListener('DOMContentLoaded', () => {
  // Aplicar fundo escuro imediatamente
  document.documentElement.style.backgroundColor = '#1A1A1A';
  document.body.style.backgroundColor = '#1A1A1A';
  
  // Remover qualquer favicon ou ícone existente
  const links = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="manifest"]');
  links.forEach((link) => {
    const htmlLink = link as HTMLLinkElement;
    if (htmlLink.href !== 'data:,') {
      const parentNode = htmlLink.parentNode;
      if (parentNode) {
        parentNode.removeChild(htmlLink);
      }
    }
  });
  
  // Adicionar um favicon personalizado em base64
  const customFavicon = document.createElement('link');
  customFavicon.rel = 'icon';
  customFavicon.type = 'image/svg+xml';
  customFavicon.href = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSIxNiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyKSIvPjxwYXRoIGQ9Ik0xMC41IDE0LjVIMTIuNVYyMS41SDEwLjVWMTQuNVoiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTE5LjUgMTQuNUgyMS41VjIxLjVIMTkuNVYxNC41WiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMTMuNSAxMC41SDE4LjVWMTIuNUgxMy41VjEwLjVaIiBmaWxsPSJ3aGl0ZSIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhciIgeDE9IjAiIHkxPSIwIiB4Mj0iMzIiIHkyPSIzMiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIHN0b3AtY29sb3I9IiM4RTJERTIiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM0QTAwRTAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=';
  document.head.appendChild(customFavicon);
  
  // Mostrar o root
  const root = document.getElementById('root');
  if (root) {
    root.style.display = 'block';
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
