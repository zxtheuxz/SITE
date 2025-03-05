import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Users, Activity, Mail, User as UserIcon, Calendar, Shield } from 'lucide-react';
import '../styles/global.css';

interface Perfil {
  sexo?: string;
  nome_completo?: string;
}

export function Perfil() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  // Carregar dados do usuário
  useEffect(() => {
    async function getUser() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Buscar o perfil do usuário
          const { data: perfilData, error: perfilError } = await supabase
            .from('perfis')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (perfilError && perfilError.code !== 'PGRST116') {
            console.error('Erro ao buscar perfil do usuário:', perfilError);
          } else if (perfilData) {
            console.log('Perfil do usuário:', perfilData);
            setPerfil(perfilData);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">Meu Perfil</h1>
            <p className="text-gray-600 text-lg">Informações básicas da sua conta</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                  {perfil?.nome_completo ? (
                    <span className="text-4xl font-bold text-white">
                      {perfil.nome_completo.split(' ').map(name => name.charAt(0).toUpperCase()).join('').substring(0, 2)}
                    </span>
                  ) : (
                    <UserIcon className="h-16 w-16 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-2 border-white shadow-md">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8 pb-4 border-b border-gray-200">
              Informações do Perfil
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Nome */}
              <div className="bg-blue-50 p-6 rounded-xl transition-all duration-300 hover:shadow-md hover:bg-blue-100 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4 shadow-inner">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Nome</p>
                    <p className="font-semibold text-xl text-gray-800">{perfil?.nome_completo || 'Não informado'}</p>
                  </div>
                </div>
              </div>
              
              {/* Sexo */}
              <div className="bg-purple-50 p-6 rounded-xl transition-all duration-300 hover:shadow-md hover:bg-purple-100 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full mr-4 shadow-inner">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-600 uppercase tracking-wider">Sexo</p>
                    <p className="font-semibold text-xl text-gray-800 capitalize">{perfil?.sexo || 'Não informado'}</p>
                  </div>
                </div>
              </div>
              
              {/* Email */}
              <div className="bg-green-50 p-6 rounded-xl transition-all duration-300 hover:shadow-md hover:bg-green-100 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4 shadow-inner">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600 uppercase tracking-wider">Email</p>
                    <p className="font-semibold text-xl text-gray-800">{user?.email || 'Não informado'}</p>
                  </div>
                </div>
              </div>
              
              {/* Membro desde */}
              <div className="bg-amber-50 p-6 rounded-xl transition-all duration-300 hover:shadow-md hover:bg-amber-100 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-3 rounded-full mr-4 shadow-inner">
                    <Calendar className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-600 uppercase tracking-wider">Membro desde</p>
                    <p className="font-semibold text-xl text-gray-800">{user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) : 'Não disponível'}</p>
                  </div>
                </div>
              </div>
              
              {/* Status */}
              <div className="bg-emerald-50 p-6 rounded-xl md:col-span-2 transition-all duration-300 hover:shadow-md hover:bg-emerald-100 transform hover:-translate-y-1">
                <div className="flex items-center">
                  <div className="bg-emerald-100 p-3 rounded-full mr-4 shadow-inner">
                    <Activity className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Status</p>
                    <div className="flex items-center">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse shadow"></span>
                      <p className="font-semibold text-xl text-green-700">Ativo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            <div className="mt-2 flex justify-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Versão 1.0</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Conta Verificada</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}