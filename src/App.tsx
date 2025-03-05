import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AvaliacaoFisica } from './pages/AvaliacaoFisica';
import { AvaliacaoNutricionalFeminina } from './pages/AvaliacaoNutricionalFeminina';
import { AvaliacaoNutricionalMasculina } from './pages/AvaliacaoNutricionalMasculina';
import { Resultados } from './pages/Resultados';
import { Cadastro } from './pages/Cadastro';
import { RedefinirSenha } from './pages/RedefinirSenha';
import { Configuracoes } from './pages/Configuracoes';
import { PrivateRoute } from './components/PrivateRoute';
import './styles/global.css';

function App() {
  useEffect(() => {
    // Garantir que o fundo seja aplicado corretamente
    document.documentElement.style.background = 'linear-gradient(135deg, #f5f7ff 0%, #e0e6ff 100%)';
    document.documentElement.style.backgroundColor = '#f5f7ff';
    document.body.style.background = 'linear-gradient(135deg, #f5f7ff 0%, #e0e6ff 100%)';
    document.body.style.backgroundColor = '#f5f7ff';
    
    // Adicionar um estilo global para garantir que o fundo seja aplicado
    const style = document.createElement('style');
    style.textContent = `
      html, body {
        background: linear-gradient(135deg, #f5f7ff 0%, #e0e6ff 100%) !important;
        background-color: #f5f7ff !important;
        min-height: 100vh;
      }
      #root {
        background: transparent !important;
        min-height: 100vh;
      }
    `;
    document.head.appendChild(style);
    
    console.log('App montado - fundo aplicado');
    
    return () => {
      // Limpar o estilo ao desmontar
      const styles = document.head.querySelectorAll('style');
      styles.forEach(style => {
        if (style.textContent?.includes('background: linear-gradient(135deg, #f5f7ff 0%, #e0e6ff 100%)')) {
          document.head.removeChild(style);
        }
      });
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app-container" style={{background: 'transparent', minHeight: '100vh'}}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/avaliacao-fisica" element={<PrivateRoute><AvaliacaoFisica /></PrivateRoute>} />
          <Route path="/avaliacao-nutricional/feminino" element={<PrivateRoute><AvaliacaoNutricionalFeminina /></PrivateRoute>} />
          <Route path="/avaliacao-nutricional/masculino" element={<PrivateRoute><AvaliacaoNutricionalMasculina /></PrivateRoute>} />
          <Route path="/resultados" element={<PrivateRoute><Resultados /></PrivateRoute>} />
          <Route path="/configuracoes" element={<PrivateRoute><Configuracoes /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;