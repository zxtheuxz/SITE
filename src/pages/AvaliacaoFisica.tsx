import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ClipboardCheck, AlertCircle, Upload, ArrowLeft, CheckCircle } from 'lucide-react';
import { Layout } from '../components/Layout';

// Estilos de tema consistentes com o dashboard
const themeStyles = {
  light: {
    background: "bg-gradient-to-br from-blue-50 via-white to-purple-50",
    text: "text-slate-800",
    textSecondary: "text-slate-600",
    card: "bg-white/80 backdrop-blur-sm shadow-xl border border-white/20",
    button: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25 text-white",
    buttonSecondary: "bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 shadow-sm",
    input: "bg-white/80 backdrop-blur-sm border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900",
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

export function AvaliacaoFisica() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [formData, setFormData] = useState({
    sexo: '',
    idade: '',
    objetivo: '',
    tempo_inativo: '',
    experiencia_musculacao: '',
    disponibilidade_semanal: '',
    nivel_experiencia: '',
    sente_dores: '',
    tem_laudo_medico: '',
    laudo_medico_url: '',
    usa_medicamentos: '',
    doenca_pre_existente: '',
    doenca_impossibilita: '',
    tem_lesao: ''
  });
  const [laudoFile, setLaudoFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3; // Dividir o formulário em etapas lógicas
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmedStep3, setConfirmedStep3] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const theme = themeStyles.light;

  // Adicione esta função para validar cada etapa
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      // Validação da etapa 1 - Informações Básicas
      if (!formData.sexo) errors.sexo = "Por favor, selecione o sexo";
      if (!formData.idade) errors.idade = "Por favor, selecione a idade";
      if (!formData.objetivo) errors.objetivo = "Por favor, selecione o objetivo";
      if (!formData.tempo_inativo) errors.tempo_inativo = "Por favor, selecione o tempo sem atividade física";
    } 
    else if (step === 2) {
      // Validação da etapa 2 - Experiência
      if (!formData.experiencia_musculacao) errors.experiencia_musculacao = "Por favor, selecione a experiência com musculação";
      if (!formData.disponibilidade_semanal) errors.disponibilidade_semanal = "Por favor, selecione a disponibilidade semanal";
      if (!formData.nivel_experiencia) errors.nivel_experiencia = "Por favor, selecione o nível de experiência";
    }
    else if (step === 3) {
      // Validação da etapa 3 - Saúde
      if (!formData.sente_dores) 
        errors.sente_dores = "Por favor, responda esta pergunta";
      
      if (formData.sente_dores === 'true') {
        if (!formData.tem_laudo_medico)
          errors.tem_laudo_medico = "Por favor, responda esta pergunta";
        
        if (formData.tem_laudo_medico === 'true' && !laudoFile) 
          errors.laudo = "É necessário enviar um laudo médico";
      }
      
      if (!formData.usa_medicamentos) 
        errors.usa_medicamentos = "Por favor, responda esta pergunta";
      if (!formData.doenca_pre_existente) 
        errors.doenca_pre_existente = "Por favor, selecione uma opção";
      if (!formData.doenca_impossibilita) 
        errors.doenca_impossibilita = "Por favor, responda esta pergunta";
      if (!formData.tem_lesao) 
        errors.tem_lesao = "Por favor, responda esta pergunta";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Modifique a função nextStep para validar antes de avançar
  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
    } else {
      // Exibir mensagem de erro geral
      setErro('Por favor, preencha todos os campos obrigatórios antes de continuar.');
      
      // Opcional: role até o primeiro erro
      const firstErrorElement = document.querySelector('[id$="-error"]');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Modifique a função validateForm para usar a validação de etapas
  const validateForm = () => {
    // Validar todas as etapas antes de enviar
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);
    
    if (!step1Valid) {
      setCurrentStep(1);
      setErro('Por favor, complete a etapa 1 antes de enviar.');
      return false;
    }
    
    if (!step2Valid) {
      setCurrentStep(2);
      setErro('Por favor, complete a etapa 2 antes de enviar.');
      return false;
    }
    
    if (!step3Valid) {
      setCurrentStep(3);
      setErro('Por favor, complete a etapa 3 antes de enviar.');
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    // Remover qualquer rascunho existente ao carregar o componente
    localStorage.removeItem('avaliacao_fisica_draft');
    
    // Aplicar background consistente com o dashboard
    document.documentElement.style.background = 'linear-gradient(135deg, #f5f7ff 0%, #e0e6ff 100%)';
    document.documentElement.style.backgroundColor = '#f5f7ff';
    document.body.style.background = 'linear-gradient(135deg, #f5f7ff 0%, #e0e6ff 100%)';
    document.body.style.backgroundColor = '#f5f7ff';
    document.body.style.backgroundImage = "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")";
  }, []);

  // Modificar a função clearDraft para garantir que todos os campos fiquem vazios
  const clearDraft = () => {
    localStorage.removeItem('avaliacao_fisica_draft');
    // Reset do formulário para valores iniciais
    setFormData({
      sexo: '',
      idade: '',
      objetivo: '',
      tempo_inativo: '',
      experiencia_musculacao: '',
      disponibilidade_semanal: '',
      nivel_experiencia: '',
      sente_dores: '',
      tem_laudo_medico: '',
      laudo_medico_url: '',
      usa_medicamentos: '',
      doenca_pre_existente: '',
      doenca_impossibilita: '',
      tem_lesao: ''
    });
    setLaudoFile(null);
    setFormErrors({});
    setCurrentStep(1);
    setConfirmedStep3(false);
    setShowConfirmationMessage(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErro('Por favor, envie apenas arquivos PDF, PNG ou JPEG');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErro('O arquivo deve ter no máximo 5MB');
        return;
      }
      setLaudoFile(file);
      setErro('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErro('Por favor, envie apenas arquivos PDF, PNG ou JPEG');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErro('O arquivo deve ter no máximo 5MB');
        return;
      }
      setLaudoFile(file);
      setErro('');
    }
  };

  const uploadLaudo = async (userId: string): Promise<string | null> => {
    if (!laudoFile) return null;

    const fileName = `${userId}/${Date.now()}-${laudoFile.name}`;
    
    // Corrigindo o erro de linter removendo onUploadProgress
    const { data, error } = await supabase.storage
      .from('laudos')
      .upload(fileName, laudoFile);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('laudos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificação adicional para evitar envio automático
    if (!e.isTrusted) {
      console.warn('Tentativa de envio automático detectada e bloqueada');
      return;
    }
    
    // Verificação adicional para garantir que o usuário interagiu com o formulário
    const userInteracted = sessionStorage.getItem('user_interacted_with_form');
    if (!userInteracted) {
      setErro('Por favor, revise e confirme suas respostas antes de enviar o formulário.');
      sessionStorage.setItem('user_interacted_with_form', 'true');
      return;
    }
    
    setLoading(true);
    setErro('');
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let laudoUrl = null;
      if (formData.sente_dores === 'true' && laudoFile) {
        laudoUrl = await uploadLaudo(user.id);
      }

      // Converter strings para booleanos antes de enviar para o banco de dados
      const formDataFormatado = {
        ...formData,
        sente_dores: formData.sente_dores === 'true',
        tem_laudo_medico: formData.tem_laudo_medico === 'true',
        usa_medicamentos: formData.usa_medicamentos === 'true',
        doenca_impossibilita: formData.doenca_impossibilita === 'true',
        tem_lesao: formData.tem_lesao === 'true'
      };

      console.log('Dados formatados para envio:', formDataFormatado);

      const { error } = await supabase
        .from('avaliacao_fisica')
        .insert([
          {
            user_id: user.id,
            ...formDataFormatado,
            laudo_medico_url: laudoUrl
          }
        ]);

      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro('Erro ao salvar avaliação física');
      }
    } finally {
      setLoading(false);
    }
  };

  // Adicionar um efeito para detectar interação do usuário
  useEffect(() => {
    const handleUserInteraction = () => {
      sessionStorage.setItem('user_interacted_with_form', 'true');
    };
    
    // Adicionar listeners para detectar interação do usuário
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('change', handleUserInteraction);
    
    return () => {
      // Remover listeners quando o componente for desmontado
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('change', handleUserInteraction);
    };
  }, []);

  // Adicionar esta função para confirmar a etapa 3
  const confirmStep3 = () => {
    setConfirmedStep3(true);
    setShowConfirmationMessage(true);
    sessionStorage.setItem('user_interacted_with_form', 'true');
    
    // Esconder a mensagem após 5 segundos
    setTimeout(() => {
      setShowConfirmationMessage(false);
    }, 5000);
  };

  // Resetar a confirmação quando mudar de etapa
  useEffect(() => {
    if (currentStep !== 3) {
      setConfirmedStep3(false);
    }
  }, [currentStep]);

  return (
    <Layout>
      <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${theme.background}`}>
        <div className="max-w-4xl mx-auto">
          <div className={`${theme.card} rounded-2xl p-8 relative overflow-hidden`}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-full blur-3xl -z-10"></div>
            
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
            
            <div className="flex flex-col items-center mb-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full mb-6 shadow-xl">
                  <ClipboardCheck className="h-12 w-12 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Avaliação Física
              </h2>
              <p className={`${theme.textSecondary} text-center text-lg max-w-xl`}>
                Preencha o formulário para personalizar seu treino e alcançar seus objetivos
              </p>
            </div>

            {erro && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700">{erro}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Progress Steps */}
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
                        {index === 0 ? 'Informações Básicas' : 
                         index === 1 ? 'Experiência' : 'Saúde'}
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

              {/* Form content - keep existing form fields but update their styling */}
              <div className="space-y-6">
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label htmlFor="sexo" className="block text-sm font-medium text-slate-700">1. Sexo</label>
                      <select
                        id="sexo"
                        name="sexo"
                        value={formData.sexo}
                        onChange={handleChange}
                        required
                        className={`${theme.input} w-full rounded-lg py-3 px-4 transition-all duration-200 shadow-sm`}
                      >
                        <option value="">Selecione</option>
                        <option value="MASCULINO">MASCULINO</option>
                        <option value="FEMININO">FEMININO</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label htmlFor="idade" className="block text-sm font-medium text-slate-700">2. Idade</label>
                      <select
                        id="idade"
                        name="idade"
                        value={formData.idade}
                        onChange={handleChange}
                        required
                        className={`${theme.input} w-full rounded-lg py-3 px-4 transition-all duration-200 shadow-sm`}
                      >
                        <option value="">Selecione</option>
                        <option value="14 A 18 ANOS">14 A 18 ANOS</option>
                        <option value="18 A 60 ANOS">18 A 60 ANOS</option>
                        <option value="60 A 80 ANOS">60 A 80 ANOS</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label htmlFor="objetivo" className="block text-sm font-medium text-slate-700">3. Objetivo</label>
                      <select
                        id="objetivo"
                        name="objetivo"
                        value={formData.objetivo}
                        onChange={handleChange}
                        required
                        className={`${theme.input} w-full rounded-lg py-3 px-4 transition-all duration-200 shadow-sm`}
                      >
                        <option value="">Selecione</option>
                        <option value="EMAGRECIMENTO">EMAGRECIMENTO</option>
                        <option value="HIPERTROFIA">HIPERTROFIA</option>
                        <option value="HIPERTROFIA / EMAGRECIMENTO">HIPERTROFIA / EMAGRECIMENTO</option>
                        <option value="FORTALECIMENTO">FORTALECIMENTO</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label htmlFor="tempo_inativo" className="block text-sm font-medium text-slate-700">4. Tempo sem atividade física</label>
                      <select
                        id="tempo_inativo"
                        name="tempo_inativo"
                        value={formData.tempo_inativo}
                        onChange={handleChange}
                        required
                        className={`${theme.input} w-full rounded-lg py-3 px-4 transition-all duration-200 shadow-sm`}
                      >
                        <option value="">Selecione</option>
                        <option value="NUNCA PRATIQUEI ATIVIDADE FÍSICA">NUNCA PRATIQUEI ATIVIDADE FÍSICA</option>
                        <option value="ATÉ 6 MESES PARADO">ATÉ 6 MESES PARADO</option>
                        <option value="6 MESES OU MAIS PARADO">6 MESES OU MAIS PARADO</option>
                        <option value="NÃO ESTOU PARADO">NÃO ESTOU PARADO</option>
                      </select>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label htmlFor="experiencia_musculacao" className="block text-sm font-medium text-slate-700">5. Experiência com musculação</label>
                      <select
                        id="experiencia_musculacao"
                        name="experiencia_musculacao"
                        value={formData.experiencia_musculacao}
                        onChange={handleChange}
                        required
                        className={`${theme.input} w-full rounded-lg py-3 px-4 transition-all duration-200 shadow-sm`}
                      >
                        <option value="">Selecione</option>
                        <option value="NUNCA PRATIQUEI MUSCULAÇÃO">NUNCA PRATIQUEI MUSCULAÇÃO</option>
                        <option value="1 A 6 MESES">1 A 6 MESES</option>
                        <option value="6 A 12 MESES">6 A 12 MESES</option>
                        <option value="1 A 2 ANOS">1 A 2 ANOS</option>
                        <option value="HÁ MAIS DE 3 ANOS">HÁ MAIS DE 3 ANOS</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label htmlFor="disponibilidade_semanal" className="block text-sm font-medium text-slate-700">6. Disponibilidade semanal</label>
                      <select
                        id="disponibilidade_semanal"
                        name="disponibilidade_semanal"
                        value={formData.disponibilidade_semanal}
                        onChange={handleChange}
                        required
                        className={`${theme.input} w-full rounded-lg py-3 px-4 transition-all duration-200 shadow-sm`}
                      >
                        <option value="">Selecione</option>
                        <option value="3 DIAS POR SEMANA">3 DIAS POR SEMANA</option>
                        <option value="4 DIAS POR SEMANA">4 DIAS POR SEMANA</option>
                        <option value="5 DIAS POR SEMANA">5 DIAS POR SEMANA</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label htmlFor="nivel_experiencia" className="block text-sm font-medium text-slate-700">7. Nível de experiência</label>
                      <select
                        id="nivel_experiencia"
                        name="nivel_experiencia"
                        value={formData.nivel_experiencia}
                        onChange={handleChange}
                        required
                        className={`${theme.input} w-full rounded-lg py-3 px-4 transition-all duration-200 shadow-sm`}
                      >
                        <option value="">Selecione</option>
                        <option value="NUNCA TIVE EXPERIÊNCIA C/MUSCULAÇÃO">NUNCA TIVE EXPERIÊNCIA C/MUSCULAÇÃO</option>
                        <option value="INICIANTE">INICIANTE</option>
                        <option value="INTERMEDIÁRIO">INTERMEDIÁRIO</option>
                        <option value="AVANÇADO">AVANÇADO</option>
                      </select>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    {showConfirmationMessage && (
                      <div className="bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                        Respostas confirmadas! Agora você pode enviar o formulário clicando em "Salvar Avaliação".
                      </div>
                    )}
                    
                    <div className="bg-white/80 backdrop-blur-sm shadow-md border border-gray-100 rounded-xl p-6">
                      <div>
                        <label htmlFor="sente_dores" className="block text-sm font-medium text-slate-700 mb-2">
                          8. Sente dores no peito, tontura ou falta de ar durante atividade física?
                        </label>
                        <select
                          id="sente_dores"
                          name="sente_dores"
                          value={formData.sente_dores}
                          onChange={handleChange}
                          required
                          aria-describedby="sente_dores-error"
                          className={`${theme.input} mt-1 block w-full rounded-lg py-3 px-4 transition-all duration-200 shadow-sm`}
                        >
                          <option value="">Selecione</option>
                          <option value="true">SIM</option>
                          <option value="false">NÃO</option>
                        </select>
                        {formErrors.sente_dores && (
                          <p id="sente_dores-error" className="mt-1 text-sm text-red-400">{formErrors.sente_dores}</p>
                        )}
                      </div>

                      {formData.sente_dores === 'true' && (
                        <div className="mt-4">
                          <label htmlFor="tem_laudo_medico" className="block text-sm font-medium text-slate-700 mb-2">
                            Possui laudo médico?
                          </label>
                          <select
                            id="tem_laudo_medico"
                            name="tem_laudo_medico"
                            value={formData.tem_laudo_medico}
                            onChange={handleChange}
                            required
                            aria-describedby="tem_laudo_medico-error"
                            className={`${theme.input} mt-1 block w-full rounded-lg py-3 px-4 transition-all duration-200 shadow-sm`}
                          >
                            <option value="">Selecione</option>
                            <option value="true">SIM</option>
                            <option value="false">NÃO</option>
                          </select>
                          {formErrors.tem_laudo_medico && (
                            <p id="tem_laudo_medico-error" className="mt-1 text-sm text-red-400">{formErrors.tem_laudo_medico}</p>
                          )}
                        </div>
                      )}

                      {formData.sente_dores === 'true' && formData.tem_laudo_medico === 'true' && (
                        <div className="mt-4">
                          <label htmlFor="laudo" className="block text-sm font-medium text-slate-700 mb-2">
                            Upload do Laudo Médico (PDF, PNG ou JPEG até 5MB)
                          </label>
                          <div 
                            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                              isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                            } border-dashed rounded-lg hover:border-blue-400 transition-colors`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                          >
                            <div className="space-y-1 text-center">
                              <Upload className="mx-auto h-12 w-12 text-blue-500" />
                              <div className="flex text-sm text-slate-600">
                                <label
                                  htmlFor="laudo"
                                  className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                >
                                  <span>Enviar arquivo</span>
                                  <input
                                    id="laudo"
                                    name="laudo"
                                    type="file"
                                    accept=".pdf, .png, .jpg, .jpeg"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                    required={formData.tem_laudo_medico === 'true'}
                                  />
                                </label>
                                <p className="pl-1">ou arraste e solte</p>
                              </div>
                              <p className="text-xs text-slate-500">
                                {laudoFile ? laudoFile.name : 'PDF, PNG ou JPEG até 5MB'}
                              </p>
                            </div>
                          </div>
                          {formErrors.laudo && (
                            <p id="laudo-error" className="mt-1 text-sm text-red-400">{formErrors.laudo}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm shadow-md border border-gray-100 rounded-xl p-6">
                      <div>
                        <label htmlFor="usa_medicamentos" className="block text-sm font-medium text-slate-700 mb-2">
                          9. Usa algum medicamento regularmente?
                        </label>
                        <select
                          id="usa_medicamentos"
                          name="usa_medicamentos"
                          value={formData.usa_medicamentos}
                          onChange={handleChange}
                          required
                          aria-describedby="usa_medicamentos-error"
                          className={`${theme.input} mt-1 block w-full rounded-lg py-3 px-4 transition-all duration-200 shadow-sm`}
                        >
                          <option value="">Selecione</option>
                          <option value="true">SIM</option>
                          <option value="false">NÃO</option>
                        </select>
                        {formErrors.usa_medicamentos && (
                          <p id="usa_medicamentos-error" className="mt-1 text-sm text-red-400">{formErrors.usa_medicamentos}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm shadow-md border border-gray-100 rounded-xl p-6">
                      <div>
                        <label htmlFor="doenca_pre_existente" className="block text-sm font-medium text-slate-700 mb-2">
                          10. Possui alguma doença pré-existente?
                        </label>
                        <select
                          id="doenca_pre_existente"
                          name="doenca_pre_existente"
                          value={formData.doenca_pre_existente}
                          onChange={handleChange}
                          required
                          aria-describedby="doenca_pre_existente-error"
                          className={`${theme.input} mt-1 block w-full rounded-lg py-3 px-4 transition-all duration-200 shadow-sm`}
                        >
                          <option value="">Selecione</option>
                          <option value="NÃO POSSUO">NÃO POSSUO</option>
                          <option value="DIABETES">DIABETES</option>
                          <option value="HIPERTENSÃO">HIPERTENSÃO</option>
                          <option value="CARDIOPATIA">CARDIOPATIA</option>
                          <option value="OUTRA">OUTRA</option>
                        </select>
                        {formErrors.doenca_pre_existente && (
                          <p id="doenca_pre_existente-error" className="mt-1 text-sm text-red-400">{formErrors.doenca_pre_existente}</p>
                        )}
                      </div>

                      <div className="mt-4">
                        <label htmlFor="doenca_impossibilita" className="block text-sm font-medium text-slate-700 mb-2">
                          11. Essa doença impossibilita a prática de atividade física?
                        </label>
                        <select
                          id="doenca_impossibilita"
                          name="doenca_impossibilita"
                          value={formData.doenca_impossibilita}
                          onChange={handleChange}
                          required
                          aria-describedby="doenca_impossibilita-error"
                          className={`${theme.input} mt-1 block w-full rounded-lg py-3 px-4 transition-all duration-200 shadow-sm`}
                        >
                          <option value="">Selecione</option>
                          <option value="true">SIM</option>
                          <option value="false">NÃO</option>
                        </select>
                        {formErrors.doenca_impossibilita && (
                          <p id="doenca_impossibilita-error" className="mt-1 text-sm text-red-400">{formErrors.doenca_impossibilita}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm shadow-md border border-gray-100 rounded-xl p-6">
                      <div>
                        <label htmlFor="tem_lesao" className="block text-sm font-medium text-slate-700 mb-2">
                          12. Possui alguma lesão que impossibilite a prática de atividade física?
                        </label>
                        <select
                          id="tem_lesao"
                          name="tem_lesao"
                          value={formData.tem_lesao}
                          onChange={handleChange}
                          required
                          aria-describedby="tem_lesao-error"
                          className={`${theme.input} mt-1 block w-full rounded-lg py-3 px-4 transition-all duration-200 shadow-sm`}
                        >
                          <option value="">Selecione</option>
                          <option value="true">SIM</option>
                          <option value="false">NÃO</option>
                        </select>
                        {formErrors.tem_lesao && (
                          <p id="tem_lesao-error" className="mt-1 text-sm text-red-400">{formErrors.tem_lesao}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between mt-12">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className={`${theme.buttonSecondary} py-3 px-6 rounded-lg text-base font-semibold transition-all duration-300 flex items-center`}
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Voltar
                  </button>
                )}
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className={`${theme.button} ml-auto py-3 px-6 rounded-lg text-base font-semibold transition-all duration-300 flex items-center`}
                  >
                    Próximo
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <>
                    {!confirmedStep3 ? (
                      <button
                        type="button"
                        onClick={confirmStep3}
                        className={`${theme.button} ml-auto py-3 px-6 rounded-lg text-base font-semibold transition-all duration-300 flex items-center`}
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Confirmar Respostas
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className={`${theme.button} w-full flex justify-center items-center py-3 px-6 rounded-lg text-base font-semibold transition-all duration-300`}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Salvando...
                          </>
                        ) : (
                          <>
                            <ClipboardCheck className="h-5 w-5 mr-2" />
                            Salvar Avaliação
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center justify-end mt-4">
                <button
                  type="button"
                  onClick={clearDraft}
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Limpar formulário
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}