import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogIn, User, Lock, Mail } from 'lucide-react';
import Aurora from '../components/Aurora';
import '../styles/global.css';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      console.log("Tentando fazer login...");
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) throw error;
      
      console.log("Login bem-sucedido, navegando para o dashboard");
      
      // Garantir que o fundo seja escuro antes de navegar
      document.documentElement.style.backgroundColor = '#1A1A1A';
      document.body.style.backgroundColor = '#1A1A1A';
      
      // Navega diretamente para o dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error("Erro no login:", error);
      setErro('Erro ao fazer login. Verifique suas credenciais.');
      setLoading(false);
    }
  };

  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErro('Por favor, informe seu email para recuperar a senha.');
      return;
    }

    setRecuperandoSenha(true);
    setErro('');
    setSucesso('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) throw error;
      setSucesso(
        'Email de recuperação enviado! Verifique sua caixa de entrada e spam. Clique no link recebido para redefinir sua senha.'
      );
    } catch (error) {
      setErro('Erro ao enviar email de recuperação. Verifique se o email está correto.');
    } finally {
      setRecuperandoSenha(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ 
      background: 'linear-gradient(135deg, #0f0f1a 0%, #0a0a14 100%)' 
    }}>
      {/* Aurora effect */}
      <Aurora 
        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
      
      {/* Card de login */}
      <div className="max-w-md w-full p-6 sm:p-8 relative z-10" style={{ 
        backgroundColor: 'transparent',
        backdropFilter: 'blur(5px)'
      }}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 flex items-center justify-center rounded-full mb-6" style={{ 
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            boxShadow: '0 8px 32px rgba(79, 70, 229, 0.5)',
            backdropFilter: 'blur(10px)',
            border: 'none'
          }}>
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-center mb-2 text-gradient" style={{
            textShadow: '0 2px 10px rgba(253, 252, 255, 0.5)',
            color: 'white'
          }}>Alê Grimaldi</h2>
          <p className="text-center" style={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.95rem',
            letterSpacing: '0.3px'
          }}>
            Acesse seu programa exclusivo
          </p>
        </div>

        {erro && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-6">
            {sucesso}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="form-group">
            <label className="form-label flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              <Mail size={18} style={{ color: '#6366F1' }} />
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                required
                placeholder="seuemail@email.com"
                style={{ 
                  backgroundColor: 'rgba(30, 30, 50, 0.5)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  outline: 'none',
                  fontSize: '1rem',
                  color: 'white',
                  height: '50px',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              <Lock size={18} style={{ color: '#6366F1' }} />
              Senha
            </label>
            <div className="relative">
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="form-control w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                required
                placeholder="••••••••"
                style={{ 
                  backgroundColor: 'rgba(30, 30, 50, 0.5)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  outline: 'none',
                  fontSize: '1rem',
                  color: 'white',
                  height: '50px',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRecuperarSenha}
              disabled={recuperandoSenha}
              className="text-sm hover:underline"
              style={{ color: '#6366F1' }}
            >
              {recuperandoSenha ? 'Enviando...' : 'Esqueci minha senha'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full relative overflow-hidden hover:translate-y-[-2px] hover:shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg,rgb(17, 0, 250) 0%,rgb(4, 41, 248) 100%)',
              boxShadow: '0 4px 12px rgb(30, 18, 252), 0 0 0 1px rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              letterSpacing: '0.5px',
              height: '50px',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <>
                <span className="opacity-0">Entrar</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              </>
            ) : 'Entrar'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm" style={{ color: 'rgba(255, 254, 254, 0.7)' }}>
          Ainda não tem uma conta?{' '}
          <Link to="/cadastro" className="font-medium hover:underline" style={{ color: '#6366F1' }}>
            Cadastre-se agora
          </Link>
        </p>
      </div>
    </div>
  );
}