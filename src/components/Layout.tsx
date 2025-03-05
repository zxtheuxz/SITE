import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, User, Home, Settings, FileText, Menu, X } from 'lucide-react';
import '../styles/global.css';

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('Usuário');
  const [userRole, setUserRole] = useState('Aluno');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    // Garantir que o fundo seja aplicado corretamente
    document.documentElement.style.background = '#f5f7ff';
    document.documentElement.style.backgroundColor = '#f5f7ff';
    document.body.style.background = '#f5f7ff';
    document.body.style.backgroundColor = '#f5f7ff';
    
    console.log('Layout montado - fundo aplicado');
    
    // Buscar informações do usuário
    async function getUserInfo() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Buscar o perfil do usuário para obter o nome completo
          const { data: perfilData } = await supabase
            .from('perfis')
            .select('nome_completo')
            .eq('user_id', user.id)
            .single();
            
          if (perfilData?.nome_completo) {
            // Se tiver nome completo, pega o primeiro nome
            const primeiroNome = perfilData.nome_completo.split(' ')[0];
            setUserName(primeiroNome);
          } else {
            // Se não tiver nome completo, usa o email sem o domínio
            setUserName(user.email?.split('@')[0] || 'Usuário');
          }
        }
      } catch (error) {
        console.error('Erro ao buscar informações do usuário:', error);
      }
    }
    
    getUserInfo();
    
    // Fechar o menu móvel quando a rota mudar
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  // Função para verificar se um link está ativo
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Classe para links ativos e inativos
  const getLinkClass = (path: string) => {
    return `flex items-center py-3 px-4 rounded-lg transition-all ${
      isActive(path)
        ? 'bg-purple-100 text-purple-700 font-medium'
        : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
    }`;
  };

  // Função para alternar o menu móvel
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Header móvel - visível apenas em telas pequenas */}
      <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-lg mr-2">
            A
          </div>
          <span className="text-lg font-bold text-gray-800">Ale Grimaldi</span>
        </Link>
        
        <button 
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>
      
      {/* Sidebar - visível em desktop ou quando o menu móvel está aberto */}
      <aside 
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-60 bg-white border-r border-gray-200 flex flex-col z-10 ${
          isMobileMenuOpen ? 'fixed inset-0 overflow-y-auto' : ''
        }`}
      >
        {/* Logo e título - visível apenas em desktop */}
        <div className="hidden md:block p-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-xl mr-3">
              A
            </div>
            <span className="text-xl font-bold text-gray-800">Ale Grimaldi</span>
          </Link>
        </div>
        
        {/* Botão para fechar o menu - visível apenas em mobile quando o menu está aberto */}
        <div className="md:hidden p-4 flex justify-end">
          <button 
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Fechar menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Informações do usuário */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{userName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
          </div>
        </div>
        
        {/* Menu de navegação */}
        <nav className="flex-grow p-4">
          <ul className="space-y-1">
            <li>
              <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                <Home className="h-5 w-5 mr-3" />
                <span>Início</span>
              </Link>
            </li>
            <li>
              <Link to="/configuracoes" className={getLinkClass('/configuracoes')}>
                <Settings className="h-5 w-5 mr-3" />
                <span>Configurações</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Botão de logout */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-red-600 transition-colors w-full py-2"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
      
      {/* Conteúdo principal */}
      <main className="flex-grow md:ml-0">
        {children}
      </main>
    </div>
  );
} 