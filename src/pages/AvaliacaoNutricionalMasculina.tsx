import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Scale, AlertCircle, CheckCircle, Loader2, ClipboardCheck, ArrowLeft } from 'lucide-react';
import { Layout } from '../components/Layout';

// Estilos de tema consistentes
const themeStyles = {
  light: {
    background: "bg-gradient-to-br from-blue-50 via-white to-purple-50",
    text: "text-slate-800",
    textSecondary: "text-slate-600",
    card: "bg-white/90 backdrop-blur-sm shadow-xl border border-white/20",
    button: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25 text-white",
    buttonSecondary: "bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 shadow-sm",
    input: "bg-white/90 backdrop-blur-sm border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-slate-700",
    progressBar: {
      track: "bg-gray-100",
      fill: "bg-gradient-to-r from-blue-600 to-purple-600"
    },
    stepIndicator: {
      active: "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg",
      completed: "bg-green-500 shadow-lg",
      inactive: "bg-gray-200"
    }
  }
};

export function AvaliacaoNutricionalMasculina() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [perfilData, setPerfilData] = useState<any>(null);
  const [sucesso, setSucesso] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Dividir em 4 etapas
  const [confirmedStep4, setConfirmedStep4] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const theme = themeStyles.light;
  const [formData, setFormData] = useState({
    // Dados pessoais
    data_nascimento: '',
    estado_civil: '',
    tem_filhos: false,
    quantidade_filhos: 0,
    objetivo: '',
    
    // Medidas
    peso: '',
    altura: '',
    peso_habitual: '',
    variacao_peso_6meses: '',
    
    // Histórico de Saúde
    tem_doencas_cronicas: false,
    doencas_cronicas: [] as string[],
    tem_cirurgias: false,
    cirurgias_anteriores: [] as string[],
    intolerancia_alimentar: [] as string[],
    medicamentos: [] as string[],
    historico_familiar_doencas: [] as string[],
    nivel_ansiedade: 0,
    
    // Estilo de Vida
    nivel_atividade: '',
    horas_sono: '',
    horario_acordar: '',
    consumo_alcool: false,
    frequencia_alcool: '',
    fumante: false,
    cigarros_por_dia: 0,
    horas_trabalho: '',
    suplementacao: [] as string[],
    intestino_regular: false,
    frequencia_intestino: '',
    problemas_digestivos: [] as string[],
    
    // Hábitos Alimentares
    ja_fez_dieta: false,
    dificuldades_dieta: [] as string[],
    diario_alimentar: '',
    alimentos_aversao: '',
    alimentos_preferidos: '',
    consumo_refrigerante: false,
    frequencia_refrigerante: '',
    alimentacao_fim_semana: '',
    come_frente_tv: false,
    consumo_agua: '',
    urina_normal: true,
    urina_caracteristicas: [] as string[],
    intestino_diario: false,
    tem_intolerancia: false,
    tem_medicamentos: false,
    tem_historico_familiar: false,
    tem_problemas_digestivos: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    carregarPerfil();
    
    // Aplicar background consistente com o dashboard
    document.documentElement.style.background = 'linear-gradient(135deg, #f5f7ff 0%, #e0e6ff 100%)';
    document.documentElement.style.backgroundColor = '#f5f7ff';
    document.body.style.background = 'linear-gradient(135deg, #f5f7ff 0%, #e0e6ff 100%)';
    document.body.style.backgroundColor = '#f5f7ff';
    document.body.style.backgroundImage = "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")";
  }, []);

  const carregarPerfil = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: perfil, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setPerfilData(perfil);
      
      // Verificar se já existe avaliação nutricional
      const { data: avaliacaoExistente, error: avaliacaoError } = await supabase
        .from('avaliacao_nutricional')
        .select('*')
        .eq('user_id', user.id);
        
      console.log('Verificação de avaliação existente - dados:', avaliacaoExistente);
      console.log('Verificação de avaliação existente - erro:', avaliacaoError);
      console.log('Avaliação já existe?', !!(avaliacaoExistente && avaliacaoExistente.length > 0));
      
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value)
      }));
    } else if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (type === 'radio') {
      // Tratamento específico para botões de rádio
      const boolValue = value === 'true';
      
      // Log para debug
      console.log(`Radio button changed: ${name} = ${value} (${boolValue})`);
      
      setFormData(prev => {
        const newState = {
          ...prev,
          [name]: boolValue
        };
        
        // Resetar campos dependentes quando o valor for false
        if (name === 'tem_filhos' && !boolValue) {
          newState.quantidade_filhos = 0;
        }
        if (name === 'tem_intolerancia' && !boolValue) {
          newState.intolerancia_alimentar = [];
        }
        if (name === 'tem_medicamentos' && !boolValue) {
          newState.medicamentos = [];
        }
        if (name === 'tem_historico_familiar' && !boolValue) {
          newState.historico_familiar_doencas = [];
        }
        if (name === 'tem_problemas_digestivos' && !boolValue) {
          newState.problemas_digestivos = [];
        }
        if (name === 'consumo_alcool' && !boolValue) {
          newState.frequencia_alcool = '';
        }
        if (name === 'fumante' && !boolValue) {
          newState.cigarros_por_dia = 0;
        }
        if (name === 'consumo_refrigerante' && !boolValue) {
          newState.frequencia_refrigerante = '';
        }
        
        return newState;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Permitir quebras de linha e preservar espaços
    setFormData(prev => ({
      ...prev,
      [name]: value.split('\n').filter(item => item !== '')
    }));
  };

  const handleAlimentosChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setSucesso(false);

    try {
      console.log('Iniciando envio do formulário...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Calcula a idade com base na data de nascimento
      const calcularIdade = (dataNascimento: string): number => {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const m = hoje.getMonth() - nascimento.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
          idade--;
        }
        return idade;
      };

      const idade = calcularIdade(formData.data_nascimento);

      // Processa os campos de alimentos e outros dados
      const dadosParaEnviar = {
        user_id: user.id,
        sexo: 'MASCULINO',
        idade: idade,
        data_nascimento: formData.data_nascimento,
        estado_civil: formData.estado_civil,
        tem_filhos: formData.tem_filhos,
        quantidade_filhos: Number(formData.quantidade_filhos),
        objetivo: formData.objetivo,
        
        // Medidas
        peso: Number(formData.peso),
        altura: Number(formData.altura),
        peso_habitual: Number(formData.peso_habitual),
        variacao_peso_6meses: formData.variacao_peso_6meses,
        
        // Histórico de Saúde
        doencas_cronicas: formData.doencas_cronicas,
        cirurgias_anteriores: formData.cirurgias_anteriores,
        intolerancia_alimentar: formData.intolerancia_alimentar,
        medicamentos: formData.medicamentos,
        historico_familiar_doencas: formData.historico_familiar_doencas,
        nivel_ansiedade: Number(formData.nivel_ansiedade),
        
        // Estilo de Vida
        nivel_atividade: formData.nivel_atividade,
        horas_sono: Number(formData.horas_sono),
        horario_acordar: formData.horario_acordar,
        horario_dormir: '22:00',
        consumo_alcool: formData.consumo_alcool,
        frequencia_alcool: formData.frequencia_alcool,
        fumante: formData.fumante,
        cigarros_por_dia: Number(formData.cigarros_por_dia),
        horas_trabalho: Number(formData.horas_trabalho),
        usa_suplementos: formData.suplementacao.length > 0,
        suplementacao: formData.suplementacao,
        
        // Hábitos Alimentares
        intestino_regular: formData.intestino_regular,
        frequencia_intestino: formData.frequencia_intestino,
        problemas_digestivos: formData.problemas_digestivos,
        ja_fez_dieta: formData.ja_fez_dieta,
        dificuldades_dieta: formData.dificuldades_dieta,
        diario_alimentar: formData.diario_alimentar,
        aversao_alimentar: formData.alimentos_aversao.split('\n').filter(item => item.trim() !== ''),
        preferencia_alimentar: formData.alimentos_preferidos.split('\n').filter(item => item.trim() !== ''),
        consumo_refrigerante: formData.consumo_refrigerante,
        frequencia_refrigerante: formData.frequencia_refrigerante,
        alimentacao_fim_semana: formData.alimentacao_fim_semana,
        come_frente_tv: formData.come_frente_tv,
        consumo_agua: Number(formData.consumo_agua),
        urina_normal: formData.urina_normal,
        urina_caracteristicas: formData.urina_caracteristicas,
        intestino_diario: formData.intestino_diario,
        qtd_refeicoes: 5,
        restricao_alimentar: []
      };

      console.log('Dados processados para envio:', dadosParaEnviar);

      const { data, error } = await supabase
        .from('avaliacao_nutricional')
        .insert([dadosParaEnviar])
        .select();

      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        throw new Error(error.message);
      }

      console.log('Dados salvos com sucesso:', data);
      console.log('ID do registro criado:', data?.[0]?.id);
      console.log('User ID do registro:', data?.[0]?.user_id);
      setSucesso(true);
      
      // Aguarda 2 segundos antes de redirecionar
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Erro detalhado:', error);
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro('Erro ao salvar avaliação nutricional');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para validar cada etapa
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      // Validação da etapa 1 - Dados Pessoais e Medidas
      if (!formData.data_nascimento) errors.data_nascimento = "Data de nascimento é obrigatória";
      if (!formData.estado_civil) errors.estado_civil = "Estado civil é obrigatório";
      if (!formData.peso) errors.peso = "Peso é obrigatório";
      if (!formData.altura) errors.altura = "Altura é obrigatória";
      if (!formData.peso_habitual) errors.peso_habitual = "Peso habitual é obrigatório";
      if (!formData.objetivo) errors.objetivo = "Objetivo é obrigatório";
    } 
    else if (step === 2) {
      // Validação da etapa 2 - Histórico de Saúde
      if (formData.tem_doencas_cronicas && formData.doencas_cronicas.length === 0) {
        errors.doencas_cronicas = "Por favor, especifique as doenças crônicas";
      }
      if (formData.tem_cirurgias && formData.cirurgias_anteriores.length === 0) {
        errors.cirurgias_anteriores = "Por favor, especifique as cirurgias";
      }
      if (formData.tem_intolerancia && formData.intolerancia_alimentar.length === 0) {
        errors.intolerancia_alimentar = "Por favor, especifique as intolerâncias";
      }
      if (formData.tem_medicamentos && formData.medicamentos.length === 0) {
        errors.medicamentos = "Por favor, especifique os medicamentos";
      }
      if (formData.tem_historico_familiar && formData.historico_familiar_doencas.length === 0) {
        errors.historico_familiar_doencas = "Por favor, especifique as doenças do histórico familiar";
      }
    }
    else if (step === 3) {
      // Validação da etapa 3 - Estilo de Vida
      if (!formData.nivel_atividade) errors.nivel_atividade = "Nível de atividade é obrigatório";
      if (!formData.horas_sono) errors.horas_sono = "Horas de sono é obrigatório";
      if (!formData.horario_acordar) errors.horario_acordar = "Horário de acordar é obrigatório";
      if (!formData.horas_trabalho) errors.horas_trabalho = "Horas de trabalho é obrigatório";
    }
    else if (step === 4) {
      // Validação da etapa 4 - Hábitos Alimentares
      if (!formData.diario_alimentar) errors.diario_alimentar = "Diário alimentar é obrigatório";
      if (!formData.consumo_agua) errors.consumo_agua = "Consumo de água é obrigatório";
      if (formData.alimentos_aversao === undefined) errors.alimentos_aversao = "Campo obrigatório";
      if (formData.alimentos_preferidos === undefined) errors.alimentos_preferidos = "Campo obrigatório";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Função para avançar etapa
  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
    }
  };

  // Função para voltar etapa
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Função para confirmar última etapa
  const confirmStep4 = () => {
    setConfirmedStep4(true);
    setShowConfirmationMessage(true);
    setTimeout(() => {
      setShowConfirmationMessage(false);
    }, 5000);
  };

  if (!perfilData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${theme.background}`}>
        <div className="max-w-4xl mx-auto">
          <div className={`${theme.card} rounded-2xl p-8 relative overflow-hidden`}>
            {/* Elementos decorativos */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-full blur-3xl -z-10" />
            
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-8">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-slate-600 hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span>Voltar ao Dashboard</span>
              </button>
            </div>

            {/* Título e descrição */}
            <div className="flex flex-col items-center mb-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full mb-6 shadow-xl">
                  <ClipboardCheck className="h-12 w-12 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Avaliação Nutricional
              </h2>
              <p className={`${theme.textSecondary} text-center text-lg max-w-xl`}>
                Preencha o formulário para personalizar seu plano nutricional
              </p>
            </div>

            {/* Indicador de progresso */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep > index + 1 ? theme.stepIndicator.completed : 
                      currentStep === index + 1 ? theme.stepIndicator.active : theme.stepIndicator.inactive
                    }`}>
                      {currentStep > index + 1 ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-white font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <span className={`mt-2 text-sm font-medium ${
                      currentStep === index + 1 ? 'text-blue-600' : 'text-slate-500'
                    }`}>
                      {index === 0 ? 'Dados Pessoais' : 
                       index === 1 ? 'Histórico de Saúde' :
                       index === 2 ? 'Estilo de Vida' : 'Hábitos Alimentares'}
                    </span>
                    {index < totalSteps - 1 && (
                      <div className="absolute top-6 left-full w-full h-[2px] -ml-[2px]">
                        <div className={`h-full ${theme.progressBar.track}`}></div>
                        <div 
                          className={`absolute top-0 left-0 h-full transition-all duration-300 ${theme.progressBar.fill}`}
                          style={{ 
                            width: currentStep > index + 1 ? '100%' : 
                                  currentStep === index + 1 ? '50%' : '0%' 
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Mensagem de sucesso */}
              {sucesso && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="block sm:inline">Formulário enviado com sucesso! Sua avaliação nutricional foi registrada.</span>
                  </div>
                </div>
              )}
              
              {/* Mensagem de erro */}
              {erro && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="block sm:inline">{erro}</span>
                  </div>
                </div>
              )}
              
              {/* Mensagem de confirmação do Step 4 */}
              {showConfirmationMessage && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-6" role="alert">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="block sm:inline">Informações confirmadas! Clique em "Enviar Formulário" para finalizar.</span>
                  </div>
                </div>
              )}
              
              {/* Indicador de carregamento */}
              {loading && (
                <div className="flex justify-center items-center mb-6">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  <span className="ml-2 text-blue-600">Processando...</span>
                </div>
              )}

              {/* Etapa 1 - Dados Pessoais e Medidas */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label htmlFor="data_nascimento" className="block text-sm font-medium text-slate-700">
                        Data de Nascimento*
                      </label>
                      <p className="text-sm text-slate-500 mb-2">
                        Ex: 15/05/1985
                      </p>
                      <input
                        type="date"
                        id="data_nascimento"
                        name="data_nascimento"
                        value={formData.data_nascimento}
                        onChange={handleChange}
                        className={`${theme.input} w-full rounded-lg py-3 px-4 ${formErrors.data_nascimento ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.data_nascimento && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.data_nascimento}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label htmlFor="estado_civil" className="block text-sm font-medium text-slate-700">
                        Estado Civil*
                      </label>
                      <p className="text-sm text-slate-500 mb-2">
                        Ex: Solteiro, Casado, Divorciado
                      </p>
                      <select
                        id="estado_civil"
                        name="estado_civil"
                        value={formData.estado_civil}
                        onChange={handleChange}
                        className={`${theme.input} w-full rounded-lg py-3 px-4 ${formErrors.estado_civil ? 'border-red-500' : ''}`}
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="SOLTEIRO">Solteiro(a)</option>
                        <option value="CASADO">Casado(a)</option>
                        <option value="DIVORCIADO">Divorciado(a)</option>
                        <option value="VIUVO">Viúvo(a)</option>
                      </select>
                      {formErrors.estado_civil && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.estado_civil}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label htmlFor="peso" className="block text-sm font-medium text-slate-700">
                        Peso Atual (kg)*
                      </label>
                      <p className="text-sm text-slate-500 mb-2">
                        Ex: 75.5
                      </p>
                      <input
                        type="number"
                        id="peso"
                        name="peso"
                        value={formData.peso}
                        onChange={handleChange}
                        className={`${theme.input} w-full rounded-lg py-3 px-4 ${formErrors.peso ? 'border-red-500' : ''}`}
                        required
                        step="0.01"
                      />
                      {formErrors.peso && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.peso}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label htmlFor="altura" className="block text-sm font-medium text-slate-700">
                        Altura (m)*
                      </label>
                      <p className="text-sm text-slate-500 mb-2">
                        Ex: 1.75
                      </p>
                      <input
                        type="number"
                        id="altura"
                        name="altura"
                        value={formData.altura}
                        onChange={handleChange}
                        className={`${theme.input} w-full rounded-lg py-3 px-4 ${formErrors.altura ? 'border-red-500' : ''}`}
                        required
                        step="0.01"
                      />
                      {formErrors.altura && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.altura}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label htmlFor="peso_habitual" className="block text-sm font-medium text-slate-700">
                        Peso Habitual (kg)*
                      </label>
                      <p className="text-sm text-slate-500 mb-2">
                        Ex: 72.0 (seu peso normal/usual)
                      </p>
                      <input
                        type="number"
                        id="peso_habitual"
                        name="peso_habitual"
                        value={formData.peso_habitual}
                        onChange={handleChange}
                        className={`${theme.input} w-full rounded-lg py-3 px-4 ${formErrors.peso_habitual ? 'border-red-500' : ''}`}
                        required
                        step="0.01"
                      />
                      {formErrors.peso_habitual && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.peso_habitual}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label htmlFor="variacao_peso_6meses" className="block text-sm font-medium text-slate-700">
                        Variação de Peso nos Últimos 6 Meses
                      </label>
                      <p className="text-sm text-slate-500 mb-2">
                        Ex: Ganhou 5kg ou Perdeu 3kg
                      </p>
                      <input
                        type="text"
                        id="variacao_peso_6meses"
                        name="variacao_peso_6meses"
                        value={formData.variacao_peso_6meses}
                        onChange={handleChange}
                        className={`${theme.input} w-full rounded-lg py-3 px-4`}
                        placeholder="Ex: Ganhou 5kg ou Perdeu 3kg"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-700">
                        Possui filhos?
                      </label>
                      <p className="text-sm text-slate-500 mb-2">
                        Selecione sim ou não
                      </p>
                      <div className="flex gap-4">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="tem_filhos"
                            value="true"
                            checked={formData.tem_filhos === true}
                            onChange={handleChange}
                            className="form-radio text-blue-600"
                          />
                          <span className="ml-2 text-slate-700">Sim</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="tem_filhos"
                            value="false"
                            checked={formData.tem_filhos === false}
                            onChange={handleChange}
                            className="form-radio text-blue-600"
                          />
                          <span className="ml-2 text-slate-700">Não</span>
                        </label>
                      </div>
                    </div>

                    {formData.tem_filhos && (
                      <div className="space-y-4">
                        <label htmlFor="quantidade_filhos" className="block text-sm font-medium text-slate-700">
                          Quantidade de Filhos
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: 2
                        </p>
                        <input
                          type="number"
                          id="quantidade_filhos"
                          name="quantidade_filhos"
                          value={formData.quantidade_filhos}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4`}
                          min="0"
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <label htmlFor="objetivo" className="block text-sm font-medium text-slate-700">
                        Objetivo*
                      </label>
                      <p className="text-sm text-slate-500 mb-2">
                        Ex: Perder Peso, Ganhar Massa Muscular
                      </p>
                      <select
                        id="objetivo"
                        name="objetivo"
                        value={formData.objetivo}
                        onChange={handleChange}
                        className={`${theme.input} w-full rounded-lg py-3 px-4 ${formErrors.objetivo ? 'border-red-500' : ''}`}
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="PERDER_PESO">Perder Peso</option>
                        <option value="GANHAR_PESO">Ganhar Peso</option>
                        <option value="MANTER_PESO">Manter Peso</option>
                        <option value="GANHAR_MASSA">Ganhar Massa Muscular</option>
                        <option value="QUALIDADE_VIDA">Qualidade de Vida</option>
                      </select>
                      {formErrors.objetivo && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.objetivo}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-8">
                    <button
                      type="button"
                      onClick={nextStep}
                      className={`${theme.button} px-6 py-2 rounded-lg`}
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {/* Etapa 2 - Histórico de Saúde */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-xl p-6 border border-purple-100">
                    <div className="grid grid-cols-1 gap-8">
                      {/* Doenças Crônicas */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Possui doenças crônicas?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: diabetes, hipertensão, colesterol alto
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_doencas_cronicas"
                              value="true"
                              checked={formData.tem_doencas_cronicas === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_doencas_cronicas"
                              value="false"
                              checked={formData.tem_doencas_cronicas === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>

                        {formData.tem_doencas_cronicas && (
                          <div className="mt-4">
                            <label htmlFor="doencas_cronicas" className="block text-sm font-medium text-slate-700">
                              Quais doenças crônicas?*
                            </label>
                            <p className="text-sm text-slate-500 mb-2">
                              Ex: Diabetes tipo 2, Hipertensão
                            </p>
                            <textarea
                              id="doencas_cronicas"
                              name="doencas_cronicas"
                              value={formData.doencas_cronicas.join('\n')}
                              onChange={handleArrayChange}
                              className={`${theme.input} w-full rounded-lg py-3 px-4 mt-1 text-slate-700 ${
                                formErrors.doencas_cronicas ? 'border-red-500' : ''
                              }`}
                              rows={3}
                              placeholder="Digite uma doença por linha"
                            />
                            {formErrors.doencas_cronicas && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.doencas_cronicas}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Cirurgias */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Já realizou alguma cirurgia?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: apendicite, vesícula, ortopédica
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_cirurgias"
                              value="true"
                              checked={formData.tem_cirurgias === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_cirurgias"
                              value="false"
                              checked={formData.tem_cirurgias === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>

                        {formData.tem_cirurgias && (
                          <div className="mt-4">
                            <label htmlFor="cirurgias_anteriores" className="block text-sm font-medium text-slate-700">
                              Quais cirurgias?
                            </label>
                            <p className="text-sm text-slate-500 mb-2">
                              Ex: Apendicectomia (2015), Cirurgia no joelho (2020)
                            </p>
                            <textarea
                              id="cirurgias_anteriores"
                              name="cirurgias_anteriores"
                              value={formData.cirurgias_anteriores.join('\n')}
                              onChange={handleArrayChange}
                              className={`${theme.input} w-full rounded-lg py-3 px-4 mt-1`}
                              rows={3}
                              placeholder="Digite uma cirurgia por linha"
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Intolerância Alimentar */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Possui intolerância alimentar?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: lactose, glúten, frutos do mar
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_intolerancia"
                              value="true"
                              checked={formData.tem_intolerancia === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_intolerancia"
                              value="false"
                              checked={formData.tem_intolerancia === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>

                        {formData.tem_intolerancia && (
                          <div className="mt-4">
                            <label htmlFor="intolerancia_alimentar" className="block text-sm font-medium text-slate-700">
                              Quais intolerâncias?
                            </label>
                            <p className="text-sm text-slate-500 mb-2">
                              Ex: Lactose, Glúten, Amendoim
                            </p>
                            <textarea
                              id="intolerancia_alimentar"
                              name="intolerancia_alimentar"
                              value={formData.intolerancia_alimentar.join('\n')}
                              onChange={handleArrayChange}
                              className={`${theme.input} w-full rounded-lg py-3 px-4 mt-1`}
                              rows={3}
                              placeholder="Digite uma intolerância por linha"
                            />
                          </div>
                        )}
                      </div>

                      {/* Medicamentos */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Faz uso de medicamentos?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: anti-hipertensivos, antidepressivos
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_medicamentos"
                              value="true"
                              checked={formData.tem_medicamentos === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_medicamentos"
                              value="false"
                              checked={formData.tem_medicamentos === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>

                        {formData.tem_medicamentos && (
                          <div className="mt-4">
                            <label htmlFor="medicamentos" className="block text-sm font-medium text-slate-700">
                              Quais medicamentos?
                            </label>
                            <p className="text-sm text-slate-500 mb-2">
                              Ex: Losartana 50mg, Fluoxetina 20mg
                            </p>
                            <textarea
                              id="medicamentos"
                              name="medicamentos"
                              value={formData.medicamentos.join('\n')}
                              onChange={handleArrayChange}
                              className={`${theme.input} w-full rounded-lg py-3 px-4 mt-1`}
                              rows={3}
                              placeholder="Digite um medicamento por linha"
                            />
                          </div>
                        )}
                      </div>

                      {/* Histórico Familiar */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Possui histórico familiar de doenças?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: diabetes, câncer, doenças cardíacas
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_historico_familiar"
                              value="true"
                              checked={formData.tem_historico_familiar === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_historico_familiar"
                              value="false"
                              checked={formData.tem_historico_familiar === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>

                        {formData.tem_historico_familiar && (
                          <div className="mt-4">
                            <label htmlFor="historico_familiar_doencas" className="block text-sm font-medium text-slate-700">
                              Quais doenças?
                            </label>
                            <p className="text-sm text-slate-500 mb-2">
                              Ex: Diabetes (pai), Hipertensão (avós)
                            </p>
                            <textarea
                              id="historico_familiar_doencas"
                              name="historico_familiar_doencas"
                              value={formData.historico_familiar_doencas.join('\n')}
                              onChange={handleArrayChange}
                              className={`${theme.input} w-full rounded-lg py-3 px-4 mt-1`}
                              rows={3}
                              placeholder="Digite uma doença por linha"
                            />
                          </div>
                        )}
                      </div>

                      {/* Nível de Ansiedade */}
                      <div className="space-y-4">
                        <label htmlFor="nivel_ansiedade" className="block text-sm font-medium text-slate-700">
                          Nível de Ansiedade (0-10)
                        </label>
                        <input
                          type="number"
                          id="nivel_ansiedade"
                          name="nivel_ansiedade"
                          value={formData.nivel_ansiedade}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4`}
                          min="0"
                          max="10"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={prevStep}
                      className={`${theme.buttonSecondary} px-6 py-2 rounded-lg`}
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className={`${theme.button} px-6 py-2 rounded-lg`}
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {/* Etapa 3 - Estilo de Vida */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-xl p-6 border border-purple-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Nível de Atividade Física */}
                      <div className="space-y-4">
                        <label htmlFor="nivel_atividade" className="block text-sm font-medium text-slate-700">
                          Nível de Atividade Física*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: Sedentário (pouca atividade), Leve (1-3x/semana), Moderado (3-5x/semana), Intenso (6-7x/semana)
                        </p>
                        <select
                          id="nivel_atividade"
                          name="nivel_atividade"
                          value={formData.nivel_atividade}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${formErrors.nivel_atividade ? 'border-red-500' : ''}`}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="SEDENTARIO">Sedentário</option>
                          <option value="LEVE">Leve</option>
                          <option value="MODERADO">Moderado</option>
                          <option value="INTENSO">Intenso</option>
                        </select>
                        {formErrors.nivel_atividade && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.nivel_atividade}</p>
                        )}
                      </div>

                      {/* Horas de Sono */}
                      <div className="space-y-4">
                        <label htmlFor="horas_sono" className="block text-sm font-medium text-slate-700">
                          Horas de Sono*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: 7 (para 7 horas por noite)
                        </p>
                        <input
                          type="number"
                          id="horas_sono"
                          name="horas_sono"
                          value={formData.horas_sono}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${formErrors.horas_sono ? 'border-red-500' : ''}`}
                          required
                        />
                      </div>

                      {/* Horário de Acordar */}
                      <div className="space-y-4">
                        <label htmlFor="horario_acordar" className="block text-sm font-medium text-slate-700">
                          Horário que Costuma Acordar*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: 06:30
                        </p>
                        <input
                          type="time"
                          id="horario_acordar"
                          name="horario_acordar"
                          value={formData.horario_acordar}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${formErrors.horario_acordar ? 'border-red-500' : ''}`}
                          required
                        />
                        {formErrors.horario_acordar && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.horario_acordar}</p>
                        )}
                      </div>

                      {/* Consumo de Álcool */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Consome bebidas alcoólicas?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: cerveja, vinho, destilados
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="consumo_alcool"
                              value="true"
                              checked={formData.consumo_alcool === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="consumo_alcool"
                              value="false"
                              checked={formData.consumo_alcool === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>

                        {formData.consumo_alcool && (
                          <div className="mt-4">
                            <label htmlFor="frequencia_alcool" className="block text-sm font-medium text-slate-700">
                              Com que frequência?
                            </label>
                            <p className="text-sm text-slate-500 mb-2">
                              Ex: Diariamente, Semanalmente, Raramente
                            </p>
                            <select
                              id="frequencia_alcool"
                              name="frequencia_alcool"
                              value={formData.frequencia_alcool}
                              onChange={handleChange}
                              className={`${theme.input} w-full rounded-lg py-3 px-4`}
                            >
                              <option value="">Selecione</option>
                              <option value="DIARIAMENTE">Diariamente</option>
                              <option value="SEMANALMENTE">Semanalmente</option>
                              <option value="QUINZENALMENTE">Quinzenalmente</option>
                              <option value="MENSALMENTE">Mensalmente</option>
                              <option value="RARAMENTE">Raramente</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Fumante */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          É fumante?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: cigarros, eletrônicos, charutos
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="fumante"
                              value="true"
                              checked={formData.fumante === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="fumante"
                              value="false"
                              checked={formData.fumante === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>

                        {formData.fumante && (
                          <div className="mt-4">
                            <label htmlFor="cigarros_por_dia" className="block text-sm font-medium text-slate-700">
                              Quantos cigarros por dia?
                            </label>
                            <input
                              type="number"
                              id="cigarros_por_dia"
                              name="cigarros_por_dia"
                              value={formData.cigarros_por_dia}
                              onChange={handleChange}
                              className={`${theme.input} w-full rounded-lg py-3 px-4`}
                              min="0"
                            />
                          </div>
                        )}
                      </div>

                      {/* Horas de Trabalho */}
                      <div className="space-y-4">
                        <label htmlFor="horas_trabalho" className="block text-sm font-medium text-slate-700">
                          Horas de Trabalho por Dia*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: 8 (para 8 horas por dia)
                        </p>
                        <input
                          type="number"
                          id="horas_trabalho"
                          name="horas_trabalho"
                          value={formData.horas_trabalho}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${formErrors.horas_trabalho ? 'border-red-500' : ''}`}
                          required
                          min="0"
                          max="24"
                        />
                        {formErrors.horas_trabalho && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.horas_trabalho}</p>
                        )}
                      </div>

                      {/* Suplementação */}
                      <div className="space-y-4">
                        <label htmlFor="suplementacao" className="block text-sm font-medium text-slate-700">
                          Faz uso de suplementos? Quais?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: Whey Protein, Vitamina D, Creatina
                        </p>
                        <textarea
                          id="suplementacao"
                          name="suplementacao"
                          value={formData.suplementacao.join('\n')}
                          onChange={handleArrayChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4`}
                          rows={3}
                          placeholder="Digite um suplemento por linha"
                        />
                      </div>

                      {/* Intestino Regular */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Seu intestino funciona regularmente?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: Sim (evacua diariamente), Não (menos de 1x/dia)
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="intestino_regular"
                              value="true"
                              checked={formData.intestino_regular === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="intestino_regular"
                              value="false"
                              checked={formData.intestino_regular === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>

                        {!formData.intestino_regular && (
                          <div className="mt-4">
                            <label htmlFor="frequencia_intestino" className="block text-sm font-medium text-slate-700">
                              Com que frequência seu intestino funciona?
                            </label>
                            <p className="text-sm text-slate-500 mb-2">
                              Ex: A cada 2 dias, A cada 3 dias, Irregular
                            </p>
                            <select
                              id="frequencia_intestino"
                              name="frequencia_intestino"
                              value={formData.frequencia_intestino}
                              onChange={handleChange}
                              className={`${theme.input} w-full rounded-lg py-3 px-4`}
                            >
                              <option value="">Selecione</option>
                              <option value="A_CADA_2_DIAS">A cada 2 dias</option>
                              <option value="A_CADA_3_DIAS">A cada 3 dias</option>
                              <option value="SEMANALMENTE">Semanalmente</option>
                              <option value="IRREGULAR">Irregular</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Problemas Digestivos */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Possui problemas digestivos?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: azia, refluxo, gases, dor abdominal
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_problemas_digestivos"
                              value="true"
                              checked={formData.tem_problemas_digestivos === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_problemas_digestivos"
                              value="false"
                              checked={formData.tem_problemas_digestivos === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>

                        {formData.tem_problemas_digestivos && (
                          <div className="mt-4">
                            <label htmlFor="problemas_digestivos" className="block text-sm font-medium text-slate-700">
                              Quais problemas digestivos?
                            </label>
                            <textarea
                              id="problemas_digestivos"
                              name="problemas_digestivos"
                              value={formData.problemas_digestivos.join('\n')}
                              onChange={handleArrayChange}
                              className={`${theme.input} w-full rounded-lg py-3 px-4 mt-1`}
                              rows={3}
                              placeholder="Digite um problema por linha"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={prevStep}
                      className={`${theme.buttonSecondary} px-6 py-2 rounded-lg`}
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className={`${theme.button} px-6 py-2 rounded-lg`}
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {/* Etapa 4 - Hábitos Alimentares */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-xl p-6 border border-purple-100">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label htmlFor="diario_alimentar" className="block text-sm font-medium text-slate-700">
                          Diário Alimentar (Descreva suas refeições habituais)*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: 7h - Café: pão, ovo, café | 12h - Almoço: arroz, feijão, frango, salada | 19h - Jantar: sopa, pão
                        </p>
                        <textarea
                          id="diario_alimentar"
                          name="diario_alimentar"
                          value={formData.diario_alimentar}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.diario_alimentar ? 'border-red-500' : ''
                          }`}
                          rows={6}
                          placeholder="Descreva suas refeições diárias..."
                          required
                        />
                        {formErrors.diario_alimentar && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.diario_alimentar}</p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <label htmlFor="alimentos_aversao" className="block text-sm font-medium text-slate-700">
                          Alimentos que não gosta ou tem aversão
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: brócolis, fígado, berinjela
                        </p>
                        <textarea
                          id="alimentos_aversao"
                          name="alimentos_aversao"
                          value={formData.alimentos_aversao}
                          onChange={handleAlimentosChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4`}
                          rows={3}
                          placeholder="Liste os alimentos..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label htmlFor="alimentos_preferidos" className="block text-sm font-medium text-slate-700">
                          Alimentos preferidos
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: frango, batata doce, banana
                        </p>
                        <textarea
                          id="alimentos_preferidos"
                          name="alimentos_preferidos"
                          value={formData.alimentos_preferidos}
                          onChange={handleAlimentosChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4`}
                          rows={3}
                          placeholder="Liste os alimentos..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Consome refrigerante?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: normal ou zero/diet
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="consumo_refrigerante"
                              value="true"
                              checked={formData.consumo_refrigerante === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="consumo_refrigerante"
                              value="false"
                              checked={formData.consumo_refrigerante === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>

                        {formData.consumo_refrigerante && (
                          <div className="mt-4">
                            <label htmlFor="frequencia_refrigerante" className="block text-sm font-medium text-slate-700">
                              Com que frequência consome refrigerante?
                            </label>
                            <p className="text-sm text-slate-500 mb-2">
                              Ex: Diariamente, Semanalmente, Raramente
                            </p>
                            <select
                              id="frequencia_refrigerante"
                              name="frequencia_refrigerante"
                              value={formData.frequencia_refrigerante}
                              onChange={handleChange}
                              className={`${theme.input} w-full rounded-lg py-3 px-4`}
                            >
                              <option value="">Selecione</option>
                              <option value="DIARIAMENTE">Diariamente</option>
                              <option value="ALGUMAS_VEZES_SEMANA">Algumas vezes por semana</option>
                              <option value="SEMANALMENTE">Semanalmente</option>
                              <option value="QUINZENALMENTE">Quinzenalmente</option>
                              <option value="MENSALMENTE">Mensalmente</option>
                              <option value="RARAMENTE">Raramente</option>
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <label htmlFor="consumo_agua" className="block text-sm font-medium text-slate-700">
                          Consumo de água por dia (litros)*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: 2 (para 2 litros por dia)
                        </p>
                        <input
                          type="number"
                          id="consumo_agua"
                          name="consumo_agua"
                          value={formData.consumo_agua}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.consumo_agua ? 'border-red-500' : ''
                          }`}
                          required
                        />
                        {formErrors.consumo_agua && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.consumo_agua}</p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Costuma comer em frente à TV/Celular?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: Sim (se costuma comer enquanto assiste TV ou usa o celular)
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="come_frente_tv"
                              value="true"
                              checked={formData.come_frente_tv === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="come_frente_tv"
                              value="false"
                              checked={formData.come_frente_tv === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label htmlFor="urina_normal" className="block text-sm font-medium text-slate-700">
                          Urina normal?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: Sim, Não
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="urina_normal"
                              value="true"
                              checked={formData.urina_normal === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="urina_normal"
                              value="false"
                              checked={formData.urina_normal === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label htmlFor="urina_caracteristicas" className="block text-sm font-medium text-slate-700">
                          Descrição das características da urina
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: Cor, odor, presença de proteínas
                        </p>
                        <textarea
                          id="urina_caracteristicas"
                          name="urina_caracteristicas"
                          value={formData.urina_caracteristicas.join('\n')}
                          onChange={handleArrayChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4`}
                          rows={3}
                          placeholder="Digite uma descrição..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={prevStep}
                      className={`${theme.buttonSecondary} px-6 py-2 rounded-lg`}
                    >
                      Voltar
                    </button>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={confirmStep4}
                        className={`${theme.buttonSecondary} px-6 py-2 rounded-lg`}
                      >
                        Revisar
                      </button>
                      <button
                        type="submit"
                        className={`${theme.button} px-6 py-2 rounded-lg`}
                      >
                        Enviar Formulário
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}