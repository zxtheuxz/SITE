import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, Home, Settings, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Header } from './Header';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    // Implemente a lógica de logout aqui
    navigate('/login');
  };

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center py-3 px-4 rounded-lg w-full ${
      isActive
        ? 'bg-orange-500 text-white'
        : `${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-orange-500 hover:bg-orange-500/10`
    }`;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Header onMenuClick={toggleMobileMenu} isMenuOpen={isMobileMenuOpen} />
      
      {/* Sidebar - visível em desktop ou quando o menu móvel está aberto */}
      <aside 
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 ${isDark ? 'bg-gray-900' : 'bg-white'} border-r ${isDark ? 'border-gray-800' : 'border-gray-200'} flex flex-col z-10 ${
          isMobileMenuOpen ? 'fixed inset-0 overflow-y-auto' : ''
        }`}
      >
        {/* Logo e título - visível apenas em desktop */}
        <div className={`hidden md:block p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <img
              src="/images/frango.png"
              alt="Frango"
              className="w-10 h-10 rounded-lg mr-3"
            />
            <span className="font-bold text-lg text-orange-500">
              EXTERMINA FRANGO
            </span>
          </div>
        </div>
        
        {/* Botão para fechar o menu - visível apenas em mobile quando o menu está aberto */}
        {isMobileMenuOpen && (
          <div className="md:hidden p-4 flex justify-end">
            <button 
              onClick={toggleMobileMenu}
              className={`p-2 rounded-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} hover:text-orange-500`}
              aria-label="Fechar menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        )}
        
        {/* Menu de navegação */}
        <nav className="flex-1 py-4">
          <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-lg ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Home size={20} />
            <span>Início</span>
          </Link>
          
          <Link to="/configuracoes" className={`flex items-center gap-3 px-4 py-2 mx-2 mt-1 rounded-lg ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Settings size={20} />
            <span>Configurações</span>
          </Link>
          
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-3 px-4 py-2 mx-2 mt-1 rounded-lg w-full ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
        </nav>
        
        {/* Botão de sair */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-lg w-full ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
      
      {/* Conteúdo principal */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
} 