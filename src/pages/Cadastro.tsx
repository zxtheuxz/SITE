import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, CheckCircle, Lock, Mail, User, Phone } from 'lucide-react';
import Aurora from '../components/Aurora';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClass } from '../styles/theme';
import '../styles/global.css';

export function Cadastro() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const themeClasses = {
    background: getThemeClass(isDarkMode, 'background'),
    text: getThemeClass(isDarkMode, 'text'),
    textSecondary: getThemeClass(isDarkMode, 'textSecondary'),
    card: `${getThemeClass(isDarkMode, 'cardBg')} border ${getThemeClass(isDarkMode, 'border')} ${getThemeClass(isDarkMode, 'shadow')}`,
    button: getThemeClass(isDarkMode, 'button'),
    buttonSecondary: getThemeClass(isDarkMode, 'buttonSecondary'),
    input: getThemeClass(isDarkMode, 'input'),
    select: getThemeClass(isDarkMode, 'select'),
    label: getThemeClass(isDarkMode, 'label'),
    helperText: getThemeClass(isDarkMode, 'helperText'),
    errorText: isDarkMode ? 'text-red-400' : 'text-red-600'
  };

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

  // Garantir que o fundo seja preto ao carregar a página
  useEffect(() => {
    // Aplicar fundo preto
    document.documentElement.style.backgroundColor = '#000000';
    document.body.style.backgroundColor = '#000000';
    document.documentElement.style.background = '#000000';
    document.body.style.background = '#000000';
    
    // Adicionar um estilo global para garantir que o fundo seja preto
    const style = document.createElement('style');
    style.textContent = `
      html, body, #root, .min-h-screen {
        background: #000000 !important;
        background-color: #000000 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Limpar o estilo ao desmontar
      document.head.querySelectorAll('style').forEach(s => {
        if (s.textContent?.includes('background: #000000')) {
          document.head.removeChild(s);
        }
      });
    };
  }, []);

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
      <div className={`min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${themeClasses.background}`}>
        <Aurora />
        
        <div className={`max-w-md w-full space-y-8 ${themeClasses.card} p-8 rounded-xl relative z-10`}>
          <div className="flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-16 w-16 text-orange-500 mb-4" />
            <h2 className={`text-2xl font-bold mb-2 ${themeClasses.text}`}>
              Cadastro realizado com sucesso!
            </h2>
            <p className={`${themeClasses.textSecondary} mb-6`}>
              Sua conta foi criada. Você já pode fazer login.
            </p>
            <button
              onClick={() => navigate('/login')}
              className={`${themeClasses.button} w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              Ir para o Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${themeClasses.background}`}>
      <Aurora />
      
      <div className={`max-w-md w-full space-y-8 ${themeClasses.card} p-8 rounded-xl relative z-10`}>
        <div>
          <h2 className={`text-center text-3xl font-extrabold ${themeClasses.text}`}>
            Criar nova conta
          </h2>
          <p className={`mt-2 text-center ${themeClasses.textSecondary}`}>
            Ou{' '}
            <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
              faça login em sua conta existente
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="nomeCompleto" className={`block text-sm font-medium ${themeClasses.label}`}>
                Nome Completo
              </label>
              <div className="mt-1 relative">
                <input
                  id="nomeCompleto"
                  name="nomeCompleto"
                  type="text"
                  required
                  value={formData.nomeCompleto}
                  onChange={handleChange}
                  className={`${themeClasses.input} block w-full px-3 py-2 rounded-md`}
                  placeholder="Digite seu nome completo"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className={`block text-sm font-medium ${themeClasses.label}`}>
                E-mail
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`${themeClasses.input} block w-full px-3 py-2 rounded-md`}
                  placeholder="Digite seu e-mail"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="telefone" className={`block text-sm font-medium ${themeClasses.label}`}>
                Telefone
              </label>
              <div className="mt-1 relative">
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  required
                  value={formData.telefone}
                  onChange={handleChange}
                  className={`${themeClasses.input} block w-full px-3 py-2 rounded-md`}
                  placeholder="Digite seu telefone"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {telefoneMessage && (
                <p className={`mt-2 text-sm ${telefoneStatus === 'valid' ? 'text-green-600' : themeClasses.errorText}`}>
                  {telefoneMessage}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="sexo" className={`block text-sm font-medium ${themeClasses.label}`}>
                Sexo
              </label>
              <select
                id="sexo"
                name="sexo"
                required
                value={formData.sexo}
                onChange={handleChange}
                className={`${themeClasses.select} block w-full px-3 py-2 rounded-md`}
              >
                <option value="">Selecione seu sexo</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="senha" className={`block text-sm font-medium ${themeClasses.label}`}>
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.senha}
                  onChange={handleChange}
                  className={`${themeClasses.input} block w-full px-3 py-2 rounded-md`}
                  placeholder="Digite sua senha"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="confirmarSenha" className={`block text-sm font-medium ${themeClasses.label}`}>
                Confirmar Senha
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className={`${themeClasses.input} block w-full px-3 py-2 rounded-md`}
                  placeholder="Confirme sua senha"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {erro && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${themeClasses.errorText}`}>
                    {erro}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`${themeClasses.button} group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <UserPlus className="h-5 w-5 text-white" />
              </span>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}