import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Lock, Save } from 'lucide-react';
import '../styles/global.css';

export function Configuracoes() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  
  // Estados para alteração de senha
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Carregar dados do usuário
  useEffect(() => {
    async function getUser() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  // Função para alterar senha
  const alterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (novaSenha !== confirmarSenha) {
      setMensagem({ 
        texto: 'As senhas não coincidem.', 
        tipo: 'erro' 
      });
      return;
    }
    
    setSalvando(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha
      });
      
      if (error) throw error;
      
      setMensagem({ 
        texto: 'Senha alterada com sucesso!', 
        tipo: 'sucesso' 
      });
      
      // Limpar campos
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setMensagem({ texto: '', tipo: '' }), 3000);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setMensagem({ 
        texto: 'Erro ao alterar senha. Verifique sua senha atual e tente novamente.', 
        tipo: 'erro' 
      });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Configurações</h1>
          <p className="text-gray-600">Altere sua senha de acesso</p>
        </div>
        
        {mensagem.texto && (
          <div className={`mb-6 p-4 rounded-lg ${
            mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {mensagem.texto}
          </div>
        )}
        
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Lock className="h-5 w-5 mr-2 text-blue-500" />
              Alterar Senha
            </h2>
            
            <form onSubmit={alterarSenha} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite sua senha atual"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite sua nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">A senha deve ter pelo menos 6 caracteres</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirme sua nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  disabled={salvando}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {salvando ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 