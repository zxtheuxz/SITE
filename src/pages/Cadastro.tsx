import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, CheckCircle, Lock, Mail, User, Phone } from 'lucide-react';
import Aurora from '../components/Aurora';
import '../styles/global.css';

export function Cadastro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    telefone: '',
    sexo: '',
    senha: '',
    confirmarSenha: '',
  });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [telefoneStatus, setTelefoneStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [telefoneMessage, setTelefoneMessage] = useState('');
  const telefoneTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'telefone') {
      const telefoneValue = value.replace(/\D/g, '').slice(0, 11);
      setFormData({ ...formData, telefone: telefoneValue });
      verificarTelefoneRealTime(telefoneValue);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const verificarTelefoneRealTime = async (telefone: string) => {
    if (telefoneTimeoutRef.current) {
      clearTimeout(telefoneTimeoutRef.current);
    }

    if (!telefone || telefone.length < 11) {
      setTelefoneStatus('idle');
      setTelefoneMessage('');
      return;
    }

    if (telefone.length === 11) {
      setTelefoneStatus('checking');
      
      telefoneTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('==================== INÍCIO DA VERIFICAÇÃO ====================');
          console.log('Iniciando verificação para telefone:', telefone);
          
          // VERIFICAÇÃO ADICIONAL: Listar todos os telefones na tabela de perfis para debug
          console.log('LISTANDO TODOS OS TELEFONES NA TABELA PERFIS...');
          const { data: todosPerfis, error: todosPerfilError } = await supabase
            .from('perfis')
            .select('telefone, id, nome_completo');
          
          if (todosPerfilError) {
            console.error('Erro ao listar todos os perfis:', todosPerfilError);
          } else {
            console.log('Todos os telefones cadastrados em perfis:', todosPerfis);
            console.log('Total de perfis cadastrados:', todosPerfis ? todosPerfis.length : 0);
            
            // Verificação manual para debug
            if (todosPerfis && todosPerfis.length > 0) {
              const perfilEncontradoManualmente = todosPerfis.find(
                perfil => perfil.telefone === telefone
              );
              
              if (perfilEncontradoManualmente) {
                console.log('PERFIL ENCONTRADO MANUALMENTE:', perfilEncontradoManualmente);
              } else {
                console.log('PERFIL NÃO ENCONTRADO MANUALMENTE');
              }
            }
          }
          
          // PRIMEIRA VERIFICAÇÃO: Verificar se o telefone existe na tabela de compras
          console.log('VERIFICANDO NA TABELA COMPRAS...');
          const { data: compraDados, error: compraError } = await supabase
            .from('compras')
            .select('*')
            .eq('telefone', telefone);

          if (compraError) {
            console.error('Erro ao verificar compras:', compraError);
            throw compraError;
          }

          console.log('Resultado da consulta na tabela compras:', compraDados);
          console.log('Quantidade de registros encontrados em compras:', compraDados ? compraDados.length : 0);

          // Verifica se o telefone foi encontrado na tabela de compras
          if (!compraDados || compraDados.length === 0) {
            console.log('TELEFONE NÃO ENCONTRADO NA BASE DE COMPRADORES:', telefone);
            setTelefoneStatus('invalid');
            setTelefoneMessage('Telefone não encontrado na base de compradores.');
            console.log('==================== FIM DA VERIFICAÇÃO (TELEFONE NÃO ENCONTRADO) ====================');
            return;
          }
          
          // SEGUNDA VERIFICAÇÃO: Verificar se o telefone já está cadastrado em algum perfil
          // Usando verificação manual com os dados já obtidos
          let telefoneJaCadastrado = false;
          let perfilExistente = null;
          
          if (todosPerfis && todosPerfis.length > 0) {
            perfilExistente = todosPerfis.find(
              perfil => perfil.telefone === telefone
            );
            
            if (perfilExistente) {
              telefoneJaCadastrado = true;
            }
          }
          
          console.log('Verificação manual - Telefone já cadastrado:', telefoneJaCadastrado);
          console.log('Verificação manual - Perfil encontrado:', perfilExistente);
          
          if (telefoneJaCadastrado) {
            console.log('TELEFONE JÁ CADASTRADO EM OUTRO PERFIL:', telefone);
            console.log('Perfil encontrado:', JSON.stringify(perfilExistente));
            setTelefoneStatus('invalid');
            setTelefoneMessage('Este telefone já está cadastrado em outra conta.');
            console.log('==================== FIM DA VERIFICAÇÃO (TELEFONE JÁ CADASTRADO) ====================');
            return;
          }

          // Se chegou aqui, o telefone está na base de compras e não está cadastrado em nenhum perfil
          console.log('TELEFONE VÁLIDO:', telefone);
          console.log('Dados da compra:', JSON.stringify(compraDados));
          setTelefoneStatus('valid');
          setTelefoneMessage('Telefone válido!');
          console.log('==================== FIM DA VERIFICAÇÃO (TELEFONE VÁLIDO) ====================');
        } catch (error) {
          console.error('Erro na verificação do telefone:', error);
          setTelefoneStatus('invalid');
          setTelefoneMessage('Erro ao verificar telefone. Tente novamente.');
          console.log('==================== FIM DA VERIFICAÇÃO (ERRO) ====================');
        }
      }, 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    
    try {
      console.log('==================== INÍCIO DO CADASTRO ====================');
      if (formData.senha !== formData.confirmarSenha) {
        throw new Error('As senhas não coincidem');
      }

      if (formData.telefone.length !== 11) {
        throw new Error('O telefone deve ter 11 dígitos (DDD + número)');
      }

      // VERIFICAÇÃO ADICIONAL: Listar todos os telefones na tabela de perfis para debug
      console.log('LISTANDO TODOS OS TELEFONES NA TABELA PERFIS (SUBMIT)...');
      const { data: todosPerfis, error: todosPerfilError } = await supabase
        .from('perfis')
        .select('telefone, id, nome_completo');
      
      if (todosPerfilError) {
        console.error('Erro ao listar todos os perfis:', todosPerfilError);
      } else {
        console.log('Todos os telefones cadastrados em perfis:', todosPerfis);
        console.log('Total de perfis cadastrados:', todosPerfis ? todosPerfis.length : 0);
        
        // Verificação manual para debug
        if (todosPerfis && todosPerfis.length > 0) {
          const perfilEncontradoManualmente = todosPerfis.find(
            perfil => perfil.telefone === formData.telefone
          );
          
          if (perfilEncontradoManualmente) {
            console.log('PERFIL ENCONTRADO MANUALMENTE (SUBMIT):', perfilEncontradoManualmente);
          } else {
            console.log('PERFIL NÃO ENCONTRADO MANUALMENTE (SUBMIT)');
          }
        }
      }

      // PRIMEIRA VERIFICAÇÃO: Verificar se o telefone existe na tabela de compras
      console.log('VERIFICANDO NA TABELA COMPRAS (SUBMIT)...');
      console.log('Telefone a verificar:', formData.telefone);
      const { data: compraDados, error: compraError } = await supabase
        .from('compras')
        .select('*')
        .eq('telefone', formData.telefone);
      
      console.log('Resultado da consulta na tabela compras:', compraDados);
      console.log('Quantidade de registros encontrados em compras:', compraDados ? compraDados.length : 0);
      
      if (compraError) {
        console.error('Erro ao verificar compras:', compraError);
        throw new Error('Erro ao verificar telefone na base de compradores.');
      }
      
      if (!compraDados || compraDados.length === 0) {
        console.log('TELEFONE NÃO ENCONTRADO NA BASE DE COMPRADORES (SUBMIT)');
        throw new Error('Telefone não encontrado na base de compradores.');
      }
      
      // SEGUNDA VERIFICAÇÃO: Verificar se o telefone já está cadastrado em algum perfil
      // Usando verificação manual com os dados já obtidos
      let telefoneJaCadastrado = false;
      let perfilExistente = null;
      
      if (todosPerfis && todosPerfis.length > 0) {
        perfilExistente = todosPerfis.find(
          perfil => perfil.telefone === formData.telefone
        );
        
        if (perfilExistente) {
          telefoneJaCadastrado = true;
        }
      }
      
      console.log('Verificação manual - Telefone já cadastrado (SUBMIT):', telefoneJaCadastrado);
      console.log('Verificação manual - Perfil encontrado (SUBMIT):', perfilExistente);
      
      if (telefoneJaCadastrado) {
        console.log('TELEFONE JÁ CADASTRADO EM OUTRO PERFIL (SUBMIT):', formData.telefone);
        console.log('Perfil encontrado (SUBMIT):', JSON.stringify(perfilExistente));
        throw new Error('Este telefone já está cadastrado em outra conta.');
      }

      console.log('TELEFONE VÁLIDO (SUBMIT):', formData.telefone);
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('Erro ao criar usuário');

      const { error: profileError } = await supabase
        .from('perfis')
        .insert([
          {
            user_id: signUpData.user.id,
            nome_completo: formData.nomeCompleto,
            telefone: formData.telefone,
            sexo: formData.sexo,
          },
        ])
        .single();

      if (profileError) {
        await supabase.auth.admin.deleteUser(signUpData.user.id);
        throw profileError;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro('Erro ao criar conta. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ 
        background: 'linear-gradient(135deg, #0f0f1a 0%, #0a0a14 100%)' 
      }}>
        <Aurora 
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
        
        <div className="max-w-md w-full p-6 sm:p-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 flex items-center justify-center rounded-full mb-6" style={{ 
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              boxShadow: '0 8px 32px rgba(79, 70, 229, 0.5)',
              backdropFilter: 'blur(10px)',
              border: 'none'
            }}>
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-2 text-gradient" style={{
              textShadow: '0 2px 10px rgba(253, 252, 255, 0.5)',
              color: 'white'
            }}>Cadastro realizado!</h2>
            <p className="text-center" style={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.95rem',
              letterSpacing: '0.3px'
            }}>
              Sua conta foi criada com sucesso. Redirecionando para a página de login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ 
      background: 'linear-gradient(135deg, #0f0f1a 0%, #0a0a14 100%)' 
    }}>
      <Aurora 
        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
      
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
            <UserPlus className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-center mb-2 text-gradient" style={{
            textShadow: '0 2px 10px rgba(253, 252, 255, 0.5)',
            color: 'white'
          }}>Comece agora</h2>
          <p className="text-center" style={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.95rem',
            letterSpacing: '0.3px'
          }}>
            Cadastre-se para acessar seu programa exclusivo
          </p>
        </div>
        
        {erro && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              <User size={18} style={{ color: '#6366F1' }} />
              Nome Completo
            </label>
            <div className="relative">
              <input
                type="text"
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleChange}
                className="form-control w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                required
                placeholder="Seu nome completo"
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
              <Mail size={18} style={{ color: '#6366F1' }} />
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                required
                placeholder="seu@email.com"
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
              <Phone size={18} style={{ color: '#6366F1' }} />
              Telefone (DDD + número)
            </label>
            <div className="relative">
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="11999999999"
                maxLength={11}
                className="form-control w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                required
                style={{ 
                  backgroundColor: 'rgba(30, 30, 50, 0.5)', 
                  border: telefoneStatus === 'valid' 
                    ? '1px solid rgba(34, 197, 94, 0.5)'
                    : telefoneStatus === 'invalid'
                    ? '1px solid rgba(239, 68, 68, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.2)',
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
              
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {telefoneStatus === 'checking' && (
                  <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                
                {telefoneStatus === 'valid' && (
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
                
                {telefoneStatus === 'invalid' && (
                  <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                )}
              </div>
            </div>
            
            {telefoneMessage && (
              <p className="mt-1 text-sm" style={{ 
                color: telefoneStatus === 'valid' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'
              }}>
                {telefoneMessage}
              </p>
            )}
            
            <p className="mt-1 text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Digite apenas números: DDD + número (11 dígitos)
            </p>
          </div>

          <div className="form-group">
            <label className="form-label flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              <User size={18} style={{ color: '#6366F1' }} />
              Sexo
            </label>
            <div className="relative">
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                className="form-control w-full focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                required
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
                  backdropFilter: 'blur(10px)',
                  appearance: 'none'
                }}
              >
                <option value="">Selecione</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
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
                name="senha"
                value={formData.senha}
                onChange={handleChange}
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

          <div className="form-group">
            <label className="form-label flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              <Lock size={18} style={{ color: '#6366F1' }} />
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                type="password"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
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

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full relative overflow-hidden hover:translate-y-[-2px] hover:shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)',
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
                <span className="opacity-0">Cadastrar</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              </>
            ) : 'Cadastrar'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium hover:underline" style={{ color: '#6366F1' }}>
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}