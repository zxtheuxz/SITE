import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Dumbbell, Save } from 'lucide-react';

export function RedefinirSenha() {
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValido, setTokenValido] = useState(false);

  useEffect(() => {
    // Verificar se o usuário está autenticado com um token de recuperação
    const verificarSessao = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        setTokenValido(true);
      } else {
        // Tentar extrair o token da URL (para casos onde o redirecionamento não funcionou perfeitamente)
        const hashFragment = window.location.hash;
        if (hashFragment) {
          const hashParams = new URLSearchParams(hashFragment.substring(1));
          const accessToken = hashParams.get('access_token');
          
          if (accessToken) {
            try {
              // Tentar definir a sessão manualmente
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: '',
              });
              
              if (!error) {
                setTokenValido(true);
              } else {
                setErro('Link de recuperação inválido ou expirado. Solicite um novo link.');
              }
            } catch (error) {
              setErro('Erro ao processar o link de recuperação. Solicite um novo link.');
            }
          } else {
            setErro('Link de recuperação inválido. Solicite um novo link.');
          }
        } else {
          setErro('Nenhum token de recuperação encontrado. Solicite um novo link de recuperação.');
        }
      }
    };

    verificarSessao();
  }, []);

  const handleRedefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setErro('');
    setSucesso('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: novaSenha
      });

      if (error) throw error;
      
      setSucesso('Senha atualizada com sucesso! Redirecionando para o login...');
      
      // Redirecionar para o login após alguns segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setErro('Erro ao redefinir a senha. Tente novamente ou solicite um novo link de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  const solicitarNovoLink = async () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-effect rounded-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="blue-gradient p-4 rounded-full mb-6">
            <Dumbbell className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-center text-white mb-3">Redefinir Senha</h2>
          <p className="text-blue-300 text-center text-lg">Crie uma nova senha para sua conta</p>
        </div>
        
        {erro && (
          <div className="bg-red-500/10 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-6">
            <p>{erro}</p>
            {!tokenValido && (
              <button 
                onClick={solicitarNovoLink}
                className="mt-2 text-red-300 hover:text-red-200 underline text-sm"
              >
                Voltar para o login
              </button>
            )}
          </div>
        )}

        {sucesso && (
          <div className="bg-green-500/10 border border-green-500 text-green-100 px-4 py-3 rounded-lg mb-6">
            {sucesso}
          </div>
        )}

        {tokenValido ? (
          <form onSubmit={handleRedefinirSenha} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Nova Senha</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-slate-800/50 border border-blue-500/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-white placeholder-slate-400 py-3 px-4 transition-all duration-200"
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-slate-800/50 border border-blue-500/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 text-white placeholder-slate-400 py-3 px-4 transition-all duration-200"
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-4 px-6 rounded-lg text-base font-semibold text-white transition-all duration-300 ${
                loading
                  ? 'opacity-70 cursor-not-allowed'
                  : 'btn-gradient hover:shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Atualizando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Redefinir Senha
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-blue-300 mb-4">Aguarde enquanto validamos seu link de recuperação...</p>
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-400 rounded-full mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
} 