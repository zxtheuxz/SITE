import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Scale, AlertCircle, CheckCircle, Loader2, ClipboardCheck, ArrowLeft } from 'lucide-react';
import { Layout } from '../components/Layout';

// Estilos de tema consistentes com o formulário masculino
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

interface FormData {
  // Dados Pessoais
  data_nascimento: string;
  estado_civil: string;
  tem_filhos: boolean;
  quantidade_filhos: number;
  objetivo: string;
  // nome?: string; // Removido pois será obtido do cadastro do cliente
  
  // Medidas
  peso: string;
  altura: string;
  peso_habitual: string;
  perda_peso_recente: string;
  ganho_peso_recente: string;
  percepcao_corporal: string;
  
  // Campos de controle da interface
  tem_doencas_ginecologicas: boolean;
  tem_historico_familiar: boolean;
  tem_suspeita_doenca: boolean;
  tem_doencas_repetitivas: boolean;
  usa_contraceptivo: boolean;
  tem_intolerancia: boolean;
  
  // Resto dos campos do formulário
  doencas_ginecologicas: string[];
  faz_acompanhamento_periodico: boolean;
  suspeita_doenca: string;
  doencas_repetitivas: string;
  historico_familiar_ginecologico: string[];
  idade_primeira_menstruacao: string;
  ciclo_menstrual_regular: boolean;
  duracao_ciclo_menstrual: string;
  monitora_ciclo: boolean;
  sintomas_tpm: string[];
  sintoma_tpm_principal: string;
  tpm_afeta_alimentacao: string;
  
  // Histórico Gestacional
  ja_engravidou: boolean;
  quantidade_gestacoes: number;
  tipos_parto: string[];
  teve_perda_gestacional: boolean;
  tentando_engravidar: boolean;     
  metodo_contraceptivo: string;
  tempo_uso_contraceptivo: string;
  libido: string;
  
  // Estilo de Vida
  nivel_estresse: number;
  fumante: boolean;
  consumo_alcool: boolean;
  horas_sono: string;
  qualidade_sono: string;
  pratica_exercicios: boolean;
  detalhes_exercicios: string;
  consumo_agua: string;
  
  // Hábitos Intestinais
  intestino_regular: boolean;
  frequencia_intestinal: string;
  consistencia_fezes: string;
  tem_constipacao: boolean;
  tem_diarreia: boolean;
  frequencia_evacuacao: string;
  dificuldade_evacuar: boolean;
  sangramento_evacuar: boolean;
  observacoes_intestinais: string;
  
  // Hábitos Alimentares
  intolerancia_alimentar: string[];
  alimentos_essenciais: string[];
  preferencia_sabor: string;
  aversao_alimentar: string[];
  horario_mais_fome: string;
  rotina_diaria: string;
  rotina_alimentar: string;
  diario_alimentar: string;
  tipo_mastigacao?: string;
  numero_refeicoes: string;
  local_refeicoes: string;
  consumo_agua_litros: string;
  velocidade_comer: string;
  mastigacao: string;
  belisca_entre_refeicoes: boolean;
  alergias_alimentares: string;
  preferencias_alimentares: string;
}

export function AvaliacaoNutricionalFeminina() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get('mode') === 'view';
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [perfilData, setPerfilData] = useState<any>(null);
  const [avaliacaoExistente, setAvaliacaoExistente] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Dividir em 4 etapas como no formulário masculino
  const [confirmedStep4, setConfirmedStep4] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const theme = themeStyles.light;
  
  const [formData, setFormData] = useState<FormData>({
    // Dados Pessoais
    data_nascimento: '',
    estado_civil: '',
    tem_filhos: false,
    quantidade_filhos: 0,
    objetivo: '',
    // nome: '', // Removido pois será obtido do cadastro do cliente
    
    // Medidas
    peso: '',
    altura: '',
    peso_habitual: '',
    perda_peso_recente: '',
    ganho_peso_recente: '',
    percepcao_corporal: '',
    
    // Campos de controle da interface
    tem_doencas_ginecologicas: false,
    tem_historico_familiar: false,
    tem_suspeita_doenca: false,
    tem_doencas_repetitivas: false,
    usa_contraceptivo: false,
    tem_intolerancia: false,
    
    // Resto dos campos do formulário
    doencas_ginecologicas: [],
    faz_acompanhamento_periodico: false,
    suspeita_doenca: '',
    doencas_repetitivas: '',
    historico_familiar_ginecologico: [],
    idade_primeira_menstruacao: '',
    ciclo_menstrual_regular: false,
    duracao_ciclo_menstrual: '',
    monitora_ciclo: false,
    sintomas_tpm: [],
    sintoma_tpm_principal: '',
    tpm_afeta_alimentacao: '',
    
    // Histórico Gestacional
    ja_engravidou: false,
    quantidade_gestacoes: 0,
    tipos_parto: [],
    teve_perda_gestacional: false,
    tentando_engravidar: false,
    metodo_contraceptivo: '',
    tempo_uso_contraceptivo: '',
    libido: '',
    
    // Estilo de Vida
    nivel_estresse: 0,
    fumante: false,
    consumo_alcool: false,
    horas_sono: '',
    qualidade_sono: '',
    pratica_exercicios: false,
    detalhes_exercicios: '',
    consumo_agua: '',
    
    // Hábitos Intestinais
    intestino_regular: false,
    frequencia_intestinal: '',
    consistencia_fezes: '',
    tem_constipacao: false,
    tem_diarreia: false,
    frequencia_evacuacao: '',
    dificuldade_evacuar: false,
    sangramento_evacuar: false,
    observacoes_intestinais: '',
    
    // Hábitos Alimentares
    intolerancia_alimentar: [],
    alimentos_essenciais: [],
    preferencia_sabor: '',
    aversao_alimentar: [],
    horario_mais_fome: '',
    rotina_diaria: '',
    rotina_alimentar: '',
    diario_alimentar: '',
    numero_refeicoes: '',
    local_refeicoes: '',
    consumo_agua_litros: '',
    velocidade_comer: '',
    mastigacao: '',
    belisca_entre_refeicoes: false,
    alergias_alimentares: '',
    preferencias_alimentares: ''
  });

  // Aplica estilos de fundo consistentes com o dashboard
  useEffect(() => {
    document.documentElement.style.background = 'linear-gradient(135deg, #f5f7ff 0%, #e0e6ff 100%)';
    document.documentElement.style.backgroundColor = '#f5f7ff';
    document.body.style.background = 'linear-gradient(135deg, #f5f7ff 0%, #e0e6ff 100%)';
    document.body.style.backgroundColor = '#f5f7ff';
    document.body.style.backgroundImage = "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")";
  }, []);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.values(formData).some(value => value) && !sucesso) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, sucesso]);

  const carregarDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Carrega o perfil
      const { data: perfil, error: perfilError } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (perfilError) throw perfilError;
      setPerfilData(perfil);

      // Carrega avaliação existente
      const { data: avaliacao, error: avaliacaoError } = await supabase
        .from('avaliacao_nutricional_feminino')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (avaliacaoError && avaliacaoError.code !== 'PGRST116') {
        throw avaliacaoError;
      }

      if (avaliacao) {
        setAvaliacaoExistente(avaliacao);
        if (isViewMode) {
          // Em modo de visualização, carrega os dados existentes
          setFormData({
            ...formData,
            ...avaliacao,
            // Garante que os campos de controle da interface estejam corretos
            tem_doencas_ginecologicas: !!avaliacao.doencas_ginecologicas?.length,
            tem_historico_familiar: !!avaliacao.historico_familiar_ginecologico?.length,
            tem_suspeita_doenca: !!avaliacao.suspeita_doenca,
            tem_doencas_repetitivas: !!avaliacao.doencas_repetitivas,
            usa_contraceptivo: !!avaliacao.metodo_contraceptivo,
            tem_intolerancia: !!avaliacao.intolerancia_alimentar?.length
          });
        } else {
          // Se não estiver em modo de visualização e já existe avaliação, redireciona
          navigate('/dashboard');
        }
      } else if (isViewMode) {
        // Se está em modo de visualização mas não existe avaliação, redireciona
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados');
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
      
      setFormData(prev => {
        const newState = {
          ...prev,
          [name]: boolValue
        };
        
        // Resetar campos dependentes quando o valor for false
        if (name === 'tem_filhos' && !boolValue) {
          newState.quantidade_filhos = 0;
        }
        if (name === 'tem_doencas_ginecologicas' && !boolValue) {
          newState.doencas_ginecologicas = [];
        }
        if (name === 'tem_historico_familiar' && !boolValue) {
          newState.historico_familiar_ginecologico = [];
        }
        if (name === 'tem_suspeita_doenca' && !boolValue) {
          newState.suspeita_doenca = '';
        }
        if (name === 'tem_doencas_repetitivas' && !boolValue) {
          newState.doencas_repetitivas = '';
        }
        if (name === 'usa_contraceptivo' && !boolValue) {
          newState.metodo_contraceptivo = '';
          newState.tempo_uso_contraceptivo = '';
        }
        if (name === 'tem_intolerancia' && !boolValue) {
          newState.intolerancia_alimentar = [];
        }
        if (name === 'ja_engravidou' && !boolValue) {
          newState.quantidade_gestacoes = 0;
          newState.tipos_parto = [];
        }
        if (name === 'pratica_exercicios' && !boolValue) {
          newState.detalhes_exercicios = '';
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
    // Permitir quebras de linha e preservar espaços ou separação por vírgulas
    const isTextarea = e.target.tagName.toLowerCase() === 'textarea';
    
    setFormData(prev => ({
      ...prev,
      [name]: isTextarea 
        ? value.split('\n').filter(item => item !== '')
        : value.split(',').map(item => item.trim()).filter(item => item !== '')
    }));
  };

  // Função para calcular idade
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
      if (!formData.percepcao_corporal) errors.percepcao_corporal = "Percepção corporal é obrigatória";
      if (!formData.objetivo) errors.objetivo = "Objetivo é obrigatório";
    } 
    else if (step === 2) {
      // Validação da etapa 2 - Saúde Ginecológica
      if (!formData.idade_primeira_menstruacao) errors.idade_primeira_menstruacao = "Idade da primeira menstruação é obrigatória";
      if (!formData.duracao_ciclo_menstrual) errors.duracao_ciclo_menstrual = "Duração do ciclo menstrual é obrigatória";
      if (!formData.sintoma_tpm_principal) errors.sintoma_tpm_principal = "Sintoma principal de TPM é obrigatório";
      if (!formData.tpm_afeta_alimentacao) errors.tpm_afeta_alimentacao = "Este campo é obrigatório";
      if (formData.tem_doencas_ginecologicas && formData.doencas_ginecologicas.length === 0) {
        errors.doencas_ginecologicas = "Por favor, especifique as doenças ginecológicas";
      }
      if (formData.tem_historico_familiar && formData.historico_familiar_ginecologico.length === 0) {
        errors.historico_familiar_ginecologico = "Por favor, especifique o histórico familiar";
      }
      if (formData.tem_suspeita_doenca && !formData.suspeita_doenca) {
        errors.suspeita_doenca = "Por favor, especifique a suspeita de doença";
      }
    }
    else if (step === 3) {
      // Validação da etapa 3 - Estilo de Vida e Histórico Gestacional
      if (!formData.horas_sono) errors.horas_sono = "Horas de sono é obrigatório";
      if (!formData.qualidade_sono) errors.qualidade_sono = "Qualidade do sono é obrigatória";
      if (formData.pratica_exercicios && !formData.detalhes_exercicios) {
        errors.detalhes_exercicios = "Por favor, especifique os detalhes dos exercícios";
      }
      if (formData.ja_engravidou && formData.quantidade_gestacoes <= 0) {
        errors.quantidade_gestacoes = "Por favor, informe o número de gestações";
      }
      if (formData.usa_contraceptivo) {
        if (!formData.metodo_contraceptivo) errors.metodo_contraceptivo = "Método contraceptivo é obrigatório";
        if (!formData.tempo_uso_contraceptivo) errors.tempo_uso_contraceptivo = "Tempo de uso é obrigatório";
      }
      if (!formData.libido) errors.libido = "Informação sobre libido é obrigatória";
    }
    else if (step === 4) {
      // Validação da etapa 4 - Hábitos Intestinais e Alimentares
      if (!formData.frequencia_evacuacao) errors.frequencia_evacuacao = "Frequência de evacuação é obrigatória";
      if (!formData.consistencia_fezes) errors.consistencia_fezes = "Consistência das fezes é obrigatória";
      if (!formData.numero_refeicoes) errors.numero_refeicoes = "Número de refeições é obrigatório";
      if (!formData.consumo_agua_litros) errors.consumo_agua_litros = "Consumo de água é obrigatório";
      if (!formData.velocidade_comer) errors.velocidade_comer = "Velocidade ao comer é obrigatória";
      if (!formData.mastigacao) errors.mastigacao = "Informação sobre mastigação é obrigatória";
      if (formData.tem_intolerancia && formData.intolerancia_alimentar.length === 0) {
        errors.intolerancia_alimentar = "Por favor, especifique as intolerâncias";
      }
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
    if (validateStep(4)) {
      setConfirmedStep4(true);
      setShowConfirmationMessage(true);
      setTimeout(() => {
        setShowConfirmationMessage(false);
      }, 5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setLoading(true);
    setErro('');
    setSucesso(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Iniciando salvamento do formulário...');

      // Remove campos de controle da interface
      const {
        tem_doencas_ginecologicas,
        tem_historico_familiar,
        tem_suspeita_doenca,
        usa_contraceptivo,
        tem_intolerancia,
        tem_doencas_repetitivas,
        ...dadosLimpos
      } = formData;

      // Trata campos numéricos e outros tipos conforme o schema
      const dadosTratados = {
        user_id: user.id,
        nome: perfilData?.nome || null, // Usa o nome do perfil do cliente
        data_nascimento: dadosLimpos.data_nascimento,
        idade: calcularIdade(formData.data_nascimento),
        estado_civil: dadosLimpos.estado_civil || null,
        tem_filhos: dadosLimpos.tem_filhos,
        quantidade_filhos: Number(dadosLimpos.quantidade_filhos) || 0,
        objetivo: dadosLimpos.objetivo,
        peso: Number(dadosLimpos.peso) || 0,
        altura: Number(dadosLimpos.altura) || 0,
        peso_habitual: dadosLimpos.peso_habitual ? Number(dadosLimpos.peso_habitual) : null,
        perda_peso_recente: dadosLimpos.perda_peso_recente || null,
        ganho_peso_recente: dadosLimpos.ganho_peso_recente || null,
        percepcao_corporal: dadosLimpos.percepcao_corporal || null,
        doencas_ginecologicas: dadosLimpos.doencas_ginecologicas || [],
        faz_acompanhamento_periodico: dadosLimpos.faz_acompanhamento_periodico || false,
        suspeita_doenca: dadosLimpos.suspeita_doenca || null,
        doencas_repetitivas: dadosLimpos.doencas_repetitivas || null,
        historico_familiar_ginecologico: dadosLimpos.historico_familiar_ginecologico || [],
        idade_primeira_menstruacao: dadosLimpos.idade_primeira_menstruacao ? Number(dadosLimpos.idade_primeira_menstruacao) : null,
        ciclo_menstrual_regular: dadosLimpos.ciclo_menstrual_regular || false,
        duracao_ciclo_menstrual: dadosLimpos.duracao_ciclo_menstrual || null,
        monitora_ciclo: dadosLimpos.monitora_ciclo || false,
        sintomas_tpm: dadosLimpos.sintomas_tpm || [],
        sintoma_tpm_principal: dadosLimpos.sintoma_tpm_principal || null,
        tpm_afeta_alimentacao: dadosLimpos.tpm_afeta_alimentacao || null,
        ja_engravidou: dadosLimpos.ja_engravidou || false,
        quantidade_gestacoes: Number(dadosLimpos.quantidade_gestacoes) || 0,
        tipos_parto: dadosLimpos.tipos_parto || [],
        teve_perda_gestacional: dadosLimpos.teve_perda_gestacional || false,
        tentando_engravidar: dadosLimpos.tentando_engravidar || false,
        metodo_contraceptivo: dadosLimpos.metodo_contraceptivo || null,
        tempo_uso_contraceptivo: dadosLimpos.tempo_uso_contraceptivo || null,
        libido: dadosLimpos.libido || null,
        nivel_estresse: Number(dadosLimpos.nivel_estresse) || 0,
        fumante: dadosLimpos.fumante || false,
        consumo_alcool: dadosLimpos.consumo_alcool || false,
        horas_sono: dadosLimpos.horas_sono ? Number(dadosLimpos.horas_sono) : null,
        qualidade_sono: dadosLimpos.qualidade_sono || null,
        pratica_exercicios: dadosLimpos.pratica_exercicios || false,
        detalhes_exercicios: dadosLimpos.detalhes_exercicios || null,
        consumo_agua: dadosLimpos.consumo_agua ? Number(dadosLimpos.consumo_agua) : null,
        intestino_regular: dadosLimpos.intestino_regular || false,
        frequencia_intestinal: dadosLimpos.frequencia_intestinal || null,
        consistencia_fezes: dadosLimpos.consistencia_fezes || null,
        tem_constipacao: dadosLimpos.tem_constipacao || false,
        tem_diarreia: dadosLimpos.tem_diarreia || false,
        dificuldade_evacuar: dadosLimpos.dificuldade_evacuar || false,
        sangramento_evacuar: dadosLimpos.sangramento_evacuar || false,
        observacoes_intestinais: dadosLimpos.observacoes_intestinais || null,
        intolerancia_alimentar: dadosLimpos.intolerancia_alimentar || [],
        alimentos_essenciais: dadosLimpos.alimentos_essenciais || [],
        preferencia_sabor: dadosLimpos.preferencia_sabor || null,
        aversao_alimentar: dadosLimpos.aversao_alimentar || [],
        horario_mais_fome: dadosLimpos.horario_mais_fome || null,
        rotina_diaria: dadosLimpos.rotina_diaria || null,
        rotina_alimentar: dadosLimpos.rotina_alimentar || null,
        diario_alimentar: dadosLimpos.diario_alimentar || null,
        numero_refeicoes: dadosLimpos.numero_refeicoes || '',
        local_refeicoes: dadosLimpos.local_refeicoes || '',
        consumo_agua_litros: dadosLimpos.consumo_agua_litros || '',
        velocidade_comer: dadosLimpos.velocidade_comer || '',
        mastigacao: dadosLimpos.mastigacao || '',
        belisca_entre_refeicoes: dadosLimpos.belisca_entre_refeicoes || false,
        alergias_alimentares: dadosLimpos.alergias_alimentares || '',
        preferencias_alimentares: dadosLimpos.preferencias_alimentares || '',
        status: 'PENDENTE',
        ultima_atualizacao: new Date().toISOString()
      };

      console.log('Dados a serem enviados:', dadosTratados);

      const { error: avaliacaoError } = await supabase
        .from('avaliacao_nutricional_feminino')
        .insert([dadosTratados]);

      if (avaliacaoError) {
        console.error('Erro ao salvar avaliação:', avaliacaoError);
        throw avaliacaoError;
      }

      console.log('Avaliação nutricional salva com sucesso');
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
                Avaliação Nutricional Feminina
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
                       index === 1 ? 'Saúde Ginecológica' :
                       index === 2 ? 'Estilo de Vida' : 'Hábitos Alimentares'}
                    </span>
                    {index < totalSteps - 1 && (
                      <div className="absolute top-6 left-full w-full h-[2px]">
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
                        Ex: Solteira, Casada, Divorciada
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
                        <option value="Solteira">Solteira</option>
                        <option value="Casada">Casada</option>
                        <option value="Divorciada">Divorciada</option>
                        <option value="Viúva">Viúva</option>
                        <option value="União Estável">União Estável</option>
                      </select>
                      {formErrors.estado_civil && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.estado_civil}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-700">
                        Possui filhos?*
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
                      {formData.tem_filhos && (
                        <div className="mt-4">
                          <label htmlFor="quantidade_filhos" className="block text-sm font-medium text-slate-700">
                            Quantidade de Filhos
                          </label>
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
                    </div>

                    <div className="space-y-4">
                      <label htmlFor="peso" className="block text-sm font-medium text-slate-700">
                        Peso Atual (kg)*
                      </label>
                      <p className="text-sm text-slate-500 mb-2">
                        Ex: 65.5
                      </p>
                      <input
                        type="number"
                        id="peso"
                        name="peso"
                        step="0.01"
                        value={formData.peso}
                        onChange={handleChange}
                        className={`${theme.input} w-full rounded-lg py-3 px-4 ${formErrors.peso ? 'border-red-500' : ''}`}
                        required
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
                        Ex: 1.65
                      </p>
                      <input
                        type="number"
                        id="altura"
                        name="altura"
                        step="0.01"
                        value={formData.altura}
                        onChange={handleChange}
                        className={`${theme.input} w-full rounded-lg py-3 px-4 ${formErrors.altura ? 'border-red-500' : ''}`}
                        required
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
                        Ex: 63.0 (seu peso normal/usual)
                      </p>
                      <input
                        type="number"
                        id="peso_habitual"
                        name="peso_habitual"
                        step="0.01"
                        value={formData.peso_habitual}
                        onChange={handleChange}
                        className={`${theme.input} w-full rounded-lg py-3 px-4 ${formErrors.peso_habitual ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.peso_habitual && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.peso_habitual}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label htmlFor="perda_peso_recente" className="block text-sm font-medium text-slate-700">
                        Perda de peso recente?
                      </label>
                      <p className="text-sm text-slate-500 mb-2">
                        Quanto e em quanto tempo
                      </p>
                      <input
                        type="text"
                        id="perda_peso_recente"
                        name="perda_peso_recente"
                        value={formData.perda_peso_recente}
                        onChange={handleChange}
                        placeholder="Ex: 5kg em 3 meses"
                        className={`${theme.input} w-full rounded-lg py-3 px-4`}
                      />
                    </div>

                    <div className="space-y-4">
                      <label htmlFor="ganho_peso_recente" className="block text-sm font-medium text-slate-700">
                        Ganho de peso recente?
                      </label>
                      <p className="text-sm text-slate-500 mb-2">
                        Quanto e em quanto tempo
                      </p>
                      <input
                        type="text"
                        id="ganho_peso_recente"
                        name="ganho_peso_recente"
                        value={formData.ganho_peso_recente}
                        onChange={handleChange}
                        placeholder="Ex: 3kg em 2 meses"
                        className={`${theme.input} w-full rounded-lg py-3 px-4`}
                      />
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <label htmlFor="percepcao_corporal" className="block text-sm font-medium text-slate-700">
                        Percepção Corporal*
                      </label>
                      <p className="text-sm text-slate-500 mb-2">
                        Como você se sente em relação ao seu corpo atualmente?
                      </p>
                      <textarea
                        id="percepcao_corporal"
                        name="percepcao_corporal"
                        value={formData.percepcao_corporal}
                        onChange={handleChange}
                        rows={3}
                        className={`${theme.input} w-full rounded-lg py-3 px-4 ${formErrors.percepcao_corporal ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.percepcao_corporal && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.percepcao_corporal}</p>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <label htmlFor="objetivo" className="block text-sm font-medium text-slate-700">
                        Objetivo*
                      </label>
                      <p className="text-sm text-slate-500 mb-2">
                        Qual seu objetivo principal com a consulta nutricional?
                      </p>
                      <textarea
                        id="objetivo"
                        name="objetivo"
                        value={formData.objetivo}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Ex: Perda de peso, ganho de massa muscular, melhora da saúde em geral..."
                        className={`${theme.input} w-full rounded-lg py-3 px-4 ${formErrors.objetivo ? 'border-red-500' : ''}`}
                        required
                      />
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
{/* Etapa 2 - Saúde Ginecológica */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-xl p-6 border border-purple-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Doenças Ginecológicas */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Possui doenças ginecológicas?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: endometriose, SOP, miomas
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_doencas_ginecologicas"
                              value="true"
                              checked={formData.tem_doencas_ginecologicas === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_doencas_ginecologicas"
                              value="false"
                              checked={formData.tem_doencas_ginecologicas === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>

                        {formData.tem_doencas_ginecologicas && (
                          <div className="mt-4">
                            <label htmlFor="doencas_ginecologicas" className="block text-sm font-medium text-slate-700">
                              Quais doenças ginecológicas?*
                            </label>
                            <textarea
                              id="doencas_ginecologicas"
                              name="doencas_ginecologicas"
                              value={formData.doencas_ginecologicas.join('\n')}
                              onChange={handleArrayChange}
                              className={`${theme.input} w-full rounded-lg py-3 px-4 mt-1 ${
                                formErrors.doencas_ginecologicas ? 'border-red-500' : ''
                              }`}
                              rows={3}
                              placeholder="Digite uma doença por linha"
                            />
                            {formErrors.doencas_ginecologicas && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.doencas_ginecologicas}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Acompanhamento Periódico */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Faz acompanhamento ginecológico periódico?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Consultas regulares com ginecologista
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="faz_acompanhamento_periodico"
                              value="true"
                              checked={formData.faz_acompanhamento_periodico === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="faz_acompanhamento_periodico"
                              value="false"
                              checked={formData.faz_acompanhamento_periodico === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>
                      </div>

                      {/* Investigação de Doenças */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Está investigando alguma doença?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Realizando exames ou acompanhamento médico
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_suspeita_doenca"
                              value="true"
                              checked={formData.tem_suspeita_doenca === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_suspeita_doenca"
                              value="false"
                              checked={formData.tem_suspeita_doenca === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>
{formData.tem_suspeita_doenca && (
                          <div className="mt-4">
                            <label htmlFor="suspeita_doenca" className="block text-sm font-medium text-slate-700">
                              Qual doença está investigando?*
                            </label>
                            <textarea
                              id="suspeita_doenca"
                              name="suspeita_doenca"
                              value={formData.suspeita_doenca}
                              onChange={handleChange}
                              className={`${theme.input} w-full rounded-lg py-3 px-4 mt-1 ${
                                formErrors.suspeita_doenca ? 'border-red-500' : ''
                              }`}
                              rows={2}
                              placeholder="Descreva a suspeita de doença"
                            />
                            {formErrors.suspeita_doenca && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.suspeita_doenca}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Histórico Familiar */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Tem histórico familiar de doenças ginecológicas?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: câncer de mama, endometriose na família
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
                            <label htmlFor="historico_familiar_ginecologico" className="block text-sm font-medium text-slate-700">
                              Quais doenças no histórico familiar?*
                            </label>
                            <textarea
                              id="historico_familiar_ginecologico"
                              name="historico_familiar_ginecologico"
                              value={formData.historico_familiar_ginecologico.join('\n')}
                              onChange={handleArrayChange}
                              className={`${theme.input} w-full rounded-lg py-3 px-4 mt-1 ${
                                formErrors.historico_familiar_ginecologico ? 'border-red-500' : ''
                              }`}
                              rows={3}
                              placeholder="Digite uma doença por linha"
                            />
                            {formErrors.historico_familiar_ginecologico && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.historico_familiar_ginecologico}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Idade da Primeira Menstruação */}
                      <div className="space-y-4">
                        <label htmlFor="idade_primeira_menstruacao" className="block text-sm font-medium text-slate-700">
                          Idade da primeira menstruação*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Idade em anos (menarca)
                        </p>
                        <input
                          type="number"
                          id="idade_primeira_menstruacao"
                          name="idade_primeira_menstruacao"
                          value={formData.idade_primeira_menstruacao}
                          onChange={handleChange}
                          min="8"
                          max="18"
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.idade_primeira_menstruacao ? 'border-red-500' : ''
                          }`}
                          required
                        />
                        {formErrors.idade_primeira_menstruacao && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.idade_primeira_menstruacao}</p>
                        )}
                      </div>

                      {/* Ciclo Menstrual Regular */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Ciclo menstrual é regular?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Intervalos regulares entre as menstruações
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="ciclo_menstrual_regular"
                              value="true"
                              checked={formData.ciclo_menstrual_regular === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="ciclo_menstrual_regular"
                              value="false"
                              checked={formData.ciclo_menstrual_regular === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>
                      </div>

                      {/* Duração do Ciclo Menstrual */}
                      <div className="space-y-4">
                        <label htmlFor="duracao_ciclo_menstrual" className="block text-sm font-medium text-slate-700">
                          Duração do ciclo menstrual (em dias)*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: 28 (primeiro dia de uma menstruação até o dia anterior da próxima)
                        </p>
                        <input
                          type="number"
                          id="duracao_ciclo_menstrual"
                          name="duracao_ciclo_menstrual"
                          value={formData.duracao_ciclo_menstrual}
                          onChange={handleChange}
                          min="20"
                          max="45"
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.duracao_ciclo_menstrual ? 'border-red-500' : ''
                          }`}
                          required
                        />
                        {formErrors.duracao_ciclo_menstrual && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.duracao_ciclo_menstrual}</p>
                        )}
                      </div>

                      {/* Monitora Ciclo */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Monitora o ciclo menstrual?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Aplicativos, agenda ou outra forma de controle
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="monitora_ciclo"
                              value="true"
                              checked={formData.monitora_ciclo === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="monitora_ciclo"
                              value="false"
                              checked={formData.monitora_ciclo === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>
                      </div>

                      {/* Sintomas TPM */}
                      <div className="space-y-4">
                        <label htmlFor="sintomas_tpm" className="block text-sm font-medium text-slate-700">
                          Sintomas de TPM*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: inchaço, dor de cabeça, irritabilidade
                        </p>
                        <textarea
                          id="sintomas_tpm"
                          name="sintomas_tpm"
                          value={formData.sintomas_tpm.join('\n')}
                          onChange={handleArrayChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4`}
                          rows={3}
                          placeholder="Digite um sintoma por linha"
                        />
                      </div>

                      {/* Sintoma TPM Principal */}
                      <div className="space-y-4">
                        <label htmlFor="sintoma_tpm_principal" className="block text-sm font-medium text-slate-700">
                          Principal sintoma de TPM*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Sintoma que mais incomoda
                        </p>
                        <input
                          type="text"
                          id="sintoma_tpm_principal"
                          name="sintoma_tpm_principal"
                          value={formData.sintoma_tpm_principal}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.sintoma_tpm_principal ? 'border-red-500' : ''
                          }`}
                          required
                        />
                        {formErrors.sintoma_tpm_principal && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.sintoma_tpm_principal}</p>
                        )}
                      </div>

                      {/* TPM Afeta Alimentação */}
                      <div className="space-y-4">
                        <label htmlFor="tpm_afeta_alimentacao" className="block text-sm font-medium text-slate-700">
                          TPM afeta sua alimentação?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Impacto da TPM nos hábitos alimentares
                        </p>
                        <select
                          id="tpm_afeta_alimentacao"
                          name="tpm_afeta_alimentacao"
                          value={formData.tpm_afeta_alimentacao}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.tpm_afeta_alimentacao ? 'border-red-500' : ''
                          }`}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="NAO">Não afeta</option>
                          <option value="POUCO">Afeta pouco</option>
                          <option value="MODERADO">Afeta moderadamente</option>
                          <option value="MUITO">Afeta muito</option>
                        </select>
                        {formErrors.tpm_afeta_alimentacao && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.tpm_afeta_alimentacao}</p>
                        )}
                      </div>

                      {/* Método Contraceptivo */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Usa contraceptivo?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Pílula, DIU, implante, outros
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="usa_contraceptivo"
                              value="true"
                              checked={formData.usa_contraceptivo === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="usa_contraceptivo"
                              value="false"
                              checked={formData.usa_contraceptivo === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>

                        {formData.usa_contraceptivo && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <label htmlFor="metodo_contraceptivo" className="block text-sm font-medium text-slate-700">
                                Qual método contraceptivo?*
                              </label>
                              <input
                                type="text"
                                id="metodo_contraceptivo"
                                name="metodo_contraceptivo"
                                value={formData.metodo_contraceptivo}
                                onChange={handleChange}
                                className={`${theme.input} w-full rounded-lg py-3 px-4 mt-1 ${
                                  formErrors.metodo_contraceptivo ? 'border-red-500' : ''
                                }`}
                                placeholder="Ex: Pílula, DIU, Implante"
                              />
                              {formErrors.metodo_contraceptivo && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.metodo_contraceptivo}</p>
                              )}
                            </div>
                            <div>
                              <label htmlFor="tempo_uso_contraceptivo" className="block text-sm font-medium text-slate-700">
                                Há quanto tempo usa?*
                              </label>
                              <input
                                type="text"
                                id="tempo_uso_contraceptivo"
                                name="tempo_uso_contraceptivo"
                                value={formData.tempo_uso_contraceptivo}
                                onChange={handleChange}
                                className={`${theme.input} w-full rounded-lg py-3 px-4 mt-1 ${
                                  formErrors.tempo_uso_contraceptivo ? 'border-red-500' : ''
                                }`}
                                placeholder="Ex: 2 anos e 3 meses"
                              />
                              {formErrors.tempo_uso_contraceptivo && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.tempo_uso_contraceptivo}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Libido */}
                      <div className="space-y-4">
                        <label htmlFor="libido" className="block text-sm font-medium text-slate-700">
                          Como está sua libido?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Desejo sexual
                        </p>
                        <select
                          id="libido"
                          name="libido"
                          value={formData.libido}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.libido ? 'border-red-500' : ''
                          }`}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="BAIXA">Baixa</option>
                          <option value="NORMAL">Normal</option>
                          <option value="ALTA">Alta</option>
                        </select>
                        {formErrors.libido && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.libido}</p>
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
{/* Etapa 3 - Histórico Gestacional e Estilo de Vida */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-xl p-6 border border-purple-100">
                    <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Histórico Gestacional
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Já Engravidou */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Já engravidou?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Se já teve alguma gestação
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="ja_engravidou"
                              value="true"
                              checked={formData.ja_engravidou === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="ja_engravidou"
                              value="false"
                              checked={formData.ja_engravidou === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>

                        {formData.ja_engravidou && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <label htmlFor="quantidade_gestacoes" className="block text-sm font-medium text-slate-700">
                                Quantas gestações?*
                              </label>
                              <input
                                type="number"
                                id="quantidade_gestacoes"
                                name="quantidade_gestacoes"
                                value={formData.quantidade_gestacoes}
                                onChange={handleChange}
                                min="1"
                                className={`${theme.input} w-full rounded-lg py-3 px-4 mt-1 ${
                                  formErrors.quantidade_gestacoes ? 'border-red-500' : ''
                                }`}
                              />
                              {formErrors.quantidade_gestacoes && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.quantidade_gestacoes}</p>
                              )}
                            </div>
                            <div>
                              <label htmlFor="tipos_parto" className="block text-sm font-medium text-slate-700">
                                Tipos de parto
                              </label>
                              <textarea
                                id="tipos_parto"
                                name="tipos_parto"
                                value={formData.tipos_parto.join('\n')}
                                onChange={handleArrayChange}
                                className={`${theme.input} w-full rounded-lg py-3 px-4 mt-1`}
                                rows={2}
                                placeholder="Um tipo por linha. Ex: Normal, Cesárea"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Perda Gestacional */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Teve alguma perda gestacional?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Aborto espontâneo ou interrupção da gestação
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="teve_perda_gestacional"
                              value="true"
                              checked={formData.teve_perda_gestacional === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="teve_perda_gestacional"
                              value="false"
                              checked={formData.teve_perda_gestacional === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>
                      </div>

                      {/* Tentando Engravidar */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Está tentando engravidar?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Se está buscando uma gravidez atualmente
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tentando_engravidar"
                              value="true"
                              checked={formData.tentando_engravidar === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tentando_engravidar"
                              value="false"
                              checked={formData.tentando_engravidar === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-xl p-6 border border-purple-100 mt-8">
                    <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Estilo de Vida
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Nível de Estresse */}
                      <div className="space-y-4">
                        <label htmlFor="nivel_estresse" className="block text-sm font-medium text-slate-700">
                          Nível de Estresse (0-10)*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          0 = sem estresse, 10 = extremamente estressada
                        </p>
                        <input
                          type="range"
                          id="nivel_estresse"
                          name="nivel_estresse"
                          value={formData.nivel_estresse}
                          onChange={handleChange}
                          min="0"
                          max="10"
                          step="1"
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="text-center font-bold text-blue-600">{formData.nivel_estresse}</div>
                      </div>

                      {/* Fumante */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          É fumante?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Uso de cigarro ou outros produtos de tabaco
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
                      </div>

                      {/* Consumo de Álcool */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Consome bebidas alcoólicas?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Consumo de bebidas como cerveja, vinho, destilados
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
                      </div>

                      {/* Horas de Sono */}
                      <div className="space-y-4">
                        <label htmlFor="horas_sono" className="block text-sm font-medium text-slate-700">
                          Horas de Sono*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Média de horas de sono por noite
                        </p>
                        <input
                          type="number"
                          id="horas_sono"
                          name="horas_sono"
                          value={formData.horas_sono}
                          onChange={handleChange}
                          min="1"
                          max="12"
                          step="0.5"
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.horas_sono ? 'border-red-500' : ''
                          }`}
                          required
                        />
                        {formErrors.horas_sono && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.horas_sono}</p>
                        )}
                      </div>

                      {/* Qualidade do Sono */}
                      <div className="space-y-4">
                        <label htmlFor="qualidade_sono" className="block text-sm font-medium text-slate-700">
                          Qualidade do Sono*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Como você avalia a qualidade do seu sono
                        </p>
                        <select
                          id="qualidade_sono"
                          name="qualidade_sono"
                          value={formData.qualidade_sono}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.qualidade_sono ? 'border-red-500' : ''
                          }`}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="RUIM">Ruim</option>
                          <option value="REGULAR">Regular</option>
                          <option value="BOA">Boa</option>
                          <option value="OTIMA">Ótima</option>
                        </select>
                        {formErrors.qualidade_sono && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.qualidade_sono}</p>
                        )}
                      </div>

                      {/* Prática de Exercícios */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Pratica exercícios físicos?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Atividades físicas regulares
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="pratica_exercicios"
                              value="true"
                              checked={formData.pratica_exercicios === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="pratica_exercicios"
                              value="false"
                              checked={formData.pratica_exercicios === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>

                        {formData.pratica_exercicios && (
                          <div className="mt-4">
                            <label htmlFor="detalhes_exercicios" className="block text-sm font-medium text-slate-700">
                              Quais exercícios e com que frequência?*
                            </label>
                            <textarea
                              id="detalhes_exercicios"
                              name="detalhes_exercicios"
                              value={formData.detalhes_exercicios}
                              onChange={handleChange}
                              className={`${theme.input} w-full rounded-lg py-3 px-4 mt-1 ${
                                formErrors.detalhes_exercicios ? 'border-red-500' : ''
                              }`}
                              rows={3}
                              placeholder="Ex: Musculação 3x na semana, Corrida 2x na semana"
                            />
                            {formErrors.detalhes_exercicios && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.detalhes_exercicios}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Consumo de Água */}
                      <div className="space-y-4">
                        <label htmlFor="consumo_agua" className="block text-sm font-medium text-slate-700">
                          Consumo de Água (litros/dia)*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Quantidade aproximada de água que bebe por dia
                        </p>
                        <input
                          type="number"
                          id="consumo_agua"
                          name="consumo_agua"
                          value={formData.consumo_agua}
                          onChange={handleChange}
                          min="0"
                          step="0.5"
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.consumo_agua ? 'border-red-500' : ''
                          }`}
                          required
                        />
                        {formErrors.consumo_agua && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.consumo_agua}</p>
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
{/* Etapa 4 - Hábitos Intestinais e Alimentares */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-xl p-6 border border-purple-100">
                    <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Hábitos Intestinais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Intestino Regular */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Intestino é regular?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Funcionamento regular e previsível do intestino
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
                      </div>

                      {/* Frequência Intestinal */}
                      <div className="space-y-4">
                        <label htmlFor="frequencia_intestinal" className="block text-sm font-medium text-slate-700">
                          Frequência Intestinal
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Com que frequência evacua
                        </p>
                        <select
                          id="frequencia_intestinal"
                          name="frequencia_intestinal"
                          value={formData.frequencia_intestinal}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4`}
                        >
                          <option value="">Selecione</option>
                          <option value="DIARIO">Diariamente</option>
                          <option value="DIAS_ALTERNADOS">Dias alternados</option>
                          <option value="2_3_DIAS">A cada 2-3 dias</option>
                          <option value="SEMANAL">Semanalmente</option>
                          <option value="IRREGULAR">Irregular</option>
                        </select>
                      </div>

                      {/* Frequência de Evacuação */}
                      <div className="space-y-4">
                        <label htmlFor="frequencia_evacuacao" className="block text-sm font-medium text-slate-700">
                          Frequência de evacuação*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Quantas vezes evacua por dia
                        </p>
                        <select
                          id="frequencia_evacuacao"
                          name="frequencia_evacuacao"
                          value={formData.frequencia_evacuacao}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.frequencia_evacuacao ? 'border-red-500' : ''
                          }`}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="1">1x por dia</option>
                          <option value="2">2x por dia</option>
                          <option value="3">3x ou mais por dia</option>
                          <option value="0">Menos de 1x por dia</option>
                        </select>
                        {formErrors.frequencia_evacuacao && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.frequencia_evacuacao}</p>
                        )}
                      </div>

                      {/* Consistência das Fezes */}
                      <div className="space-y-4">
                        <label htmlFor="consistencia_fezes" className="block text-sm font-medium text-slate-700">
                          Consistência das fezes*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Tipo de consistência mais frequente
                        </p>
                        <select
                          id="consistencia_fezes"
                          name="consistencia_fezes"
                          value={formData.consistencia_fezes}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.consistencia_fezes ? 'border-red-500' : ''
                          }`}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="RESSECADA">Ressecada</option>
                          <option value="NORMAL">Normal</option>
                          <option value="AMOLECIDA">Amolecida</option>
                          <option value="LIQUIDA">Líquida</option>
                        </select>
                        {formErrors.consistencia_fezes && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.consistencia_fezes}</p>
                        )}
                      </div>

                      {/* Constipação */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Tem constipação com frequência?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Dificuldade para evacuar regularmente
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_constipacao"
                              value="true"
                              checked={formData.tem_constipacao === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_constipacao"
                              value="false"
                              checked={formData.tem_constipacao === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>
                      </div>

                      {/* Diarreia */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Tem diarreia com frequência?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Evacuações frequentes e líquidas
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_diarreia"
                              value="true"
                              checked={formData.tem_diarreia === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="tem_diarreia"
                              value="false"
                              checked={formData.tem_diarreia === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>
                      </div>

                      {/* Dificuldade para Evacuar */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Dificuldade para evacuar?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Esforço excessivo ou dificuldade durante a evacuação
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="dificuldade_evacuar"
                              value="true"
                              checked={formData.dificuldade_evacuar === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="dificuldade_evacuar"
                              value="false"
                              checked={formData.dificuldade_evacuar === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>
                      </div>

                      {/* Sangramento ao Evacuar */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Sangramento ao evacuar?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Presença de sangue nas fezes ou papel higiênico
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="sangramento_evacuar"
                              value="true"
                              checked={formData.sangramento_evacuar === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="sangramento_evacuar"
                              value="false"
                              checked={formData.sangramento_evacuar === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>
                      </div>

                      {/* Observações Intestinais */}
                      <div className="md:col-span-2 space-y-4">
                        <label htmlFor="observacoes_intestinais" className="block text-sm font-medium text-slate-700">
                          Observações adicionais sobre hábitos intestinais
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Outras informações relevantes sobre seu intestino
                        </p>
                        <textarea
                          id="observacoes_intestinais"
                          name="observacoes_intestinais"
                          value={formData.observacoes_intestinais}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4`}
                          rows={3}
                          placeholder="Qualquer outra informação relevante sobre seus hábitos intestinais"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-xl p-6 border border-purple-100 mt-8">
                    <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Hábitos Alimentares
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Intolerância Alimentar */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Tem intolerância alimentar?
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Ex: lactose, glúten, frutose
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
                              Quais intolerâncias?*
                            </label>
                            <textarea
                              id="intolerancia_alimentar"
                              name="intolerancia_alimentar"
                              value={formData.intolerancia_alimentar.join('\n')}
                              onChange={handleArrayChange}
                              className={`${theme.input} w-full rounded-lg py-3 px-4 mt-1 ${
                                formErrors.intolerancia_alimentar ? 'border-red-500' : ''
                              }`}
                              rows={3}
                              placeholder="Digite uma intolerância por linha"
                            />
                            {formErrors.intolerancia_alimentar && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.intolerancia_alimentar}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Alimentos Essenciais */}
                      <div className="space-y-4">
                        <label htmlFor="alimentos_essenciais" className="block text-sm font-medium text-slate-700">
                          Alimentos que não podem faltar
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Alimentos que você consome diariamente ou com frequência
                        </p>
                        <textarea
                          id="alimentos_essenciais"
                          name="alimentos_essenciais"
                          value={formData.alimentos_essenciais.join('\n')}
                          onChange={handleArrayChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4`}
                          rows={3}
                          placeholder="Digite um alimento por linha"
                        />
                      </div>

                      {/* Preferência de Sabor */}
                      <div className="space-y-4">
                        <label htmlFor="preferencia_sabor" className="block text-sm font-medium text-slate-700">
                          Preferência de sabor
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Qual sabor você prefere
                        </p>
                        <select
                          id="preferencia_sabor"
                          name="preferencia_sabor"
                          value={formData.preferencia_sabor}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4`}
                        >
                          <option value="">Selecione</option>
                          <option value="DOCE">Doce</option>
                          <option value="SALGADO">Salgado</option>
                          <option value="ACIDO">Ácido</option>
                          <option value="AMARGO">Amargo</option>
                          <option value="TODOS">Todos</option>
                        </select>
                      </div>

                      {/* Aversão Alimentar */}
                      <div className="space-y-4">
                        <label htmlFor="aversao_alimentar" className="block text-sm font-medium text-slate-700">
                          Alimentos que não gosta
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Alimentos que você evita ou tem aversão
                        </p>
                        <textarea
                          id="aversao_alimentar"
                          name="aversao_alimentar"
                          value={formData.aversao_alimentar.join('\n')}
                          onChange={handleArrayChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4`}
                          rows={3}
                          placeholder="Digite um alimento por linha"
                        />
                      </div>

                      {/* Número de Refeições */}
                      <div className="space-y-4">
                        <label htmlFor="numero_refeicoes" className="block text-sm font-medium text-slate-700">
                          Número de refeições por dia*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Quantas refeições faz por dia
                        </p>
                        <select
                          id="numero_refeicoes"
                          name="numero_refeicoes"
                          value={formData.numero_refeicoes}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.numero_refeicoes ? 'border-red-500' : ''
                          }`}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="2">2 refeições</option>
                          <option value="3">3 refeições</option>
                          <option value="4">4 refeições</option>
                          <option value="5">5 refeições</option>
                          <option value="6">6 refeições ou mais</option>
                        </select>
                        {formErrors.numero_refeicoes && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.numero_refeicoes}</p>
                        )}
                      </div>

                      {/* Local das Refeições */}
                      <div className="space-y-4">
                        <label htmlFor="local_refeicoes" className="block text-sm font-medium text-slate-700">
                          Local das refeições*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Onde costuma realizar as refeições
                        </p>
                        <select
                          id="local_refeicoes"
                          name="local_refeicoes"
                          value={formData.local_refeicoes}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.local_refeicoes ? 'border-red-500' : ''
                          }`}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="CASA">Em casa</option>
                          <option value="TRABALHO">No trabalho</option>
                          <option value="RESTAURANTE">Em restaurantes</option>
                          <option value="MISTO">Misto (casa e fora)</option>
                        </select>
                        {formErrors.local_refeicoes && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.local_refeicoes}</p>
                        )}
                      </div>

                      {/* Consumo de Água */}
                      <div className="space-y-4">
                        <label htmlFor="consumo_agua_litros" className="block text-sm font-medium text-slate-700">
                          Consumo de água diário (litros)*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Quantidade de água em litros por dia
                        </p>
                        <input
                          type="number"
                          id="consumo_agua_litros"
                          name="consumo_agua_litros"
                          value={formData.consumo_agua_litros}
                          onChange={handleChange}
                          step="0.5"
                          min="0"
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.consumo_agua_litros ? 'border-red-500' : ''
                          }`}
                          required
                        />
                        {formErrors.consumo_agua_litros && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.consumo_agua_litros}</p>
                        )}
                      </div>

                      {/* Velocidade ao Comer */}
                      <div className="space-y-4">
                        <label htmlFor="velocidade_comer" className="block text-sm font-medium text-slate-700">
                          Velocidade ao comer*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Quão rápido você come
                        </p>
                        <select
                          id="velocidade_comer"
                          name="velocidade_comer"
                          value={formData.velocidade_comer}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.velocidade_comer ? 'border-red-500' : ''
                          }`}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="DEVAGAR">Devagar</option>
                          <option value="NORMAL">Normal</option>
                          <option value="RAPIDO">Rápido</option>
                          <option value="MUITO_RAPIDO">Muito rápido</option>
                        </select>
                        {formErrors.velocidade_comer && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.velocidade_comer}</p>
                        )}
                      </div>
{/* Mastigação */}
                      <div className="space-y-4">
                        <label htmlFor="mastigacao" className="block text-sm font-medium text-slate-700">
                          Mastigação*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Como você classifica sua mastigação
                        </p>
                        <select
                          id="mastigacao"
                          name="mastigacao"
                          value={formData.mastigacao}
                          onChange={handleChange}
                          className={`${theme.input} w-full rounded-lg py-3 px-4 ${
                            formErrors.mastigacao ? 'border-red-500' : ''
                          }`}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="RUIM">Ruim</option>
                          <option value="REGULAR">Regular</option>
                          <option value="BOA">Boa</option>
                          <option value="OTIMA">Ótima</option>
                        </select>
                        {formErrors.mastigacao && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.mastigacao}</p>
                        )}
                      </div>

                      {/* Belisca Entre Refeições */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">
                          Belisca entre as refeições?*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Consome pequenos lanches fora dos horários das refeições
                        </p>
                        <div className="flex gap-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="belisca_entre_refeicoes"
                              value="true"
                              checked={formData.belisca_entre_refeicoes === true}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Sim</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="belisca_entre_refeicoes"
                              value="false"
                              checked={formData.belisca_entre_refeicoes === false}
                              onChange={handleChange}
                              className="form-radio text-blue-600"
                            />
                            <span className="ml-2 text-slate-700">Não</span>
                          </label>
                        </div>
                      </div>

                      {/* Diário Alimentar */}
                      <div className="md:col-span-2 space-y-4">
                        <label htmlFor="diario_alimentar" className="block text-sm font-medium text-slate-700">
                          Diário Alimentar*
                        </label>
                        <p className="text-sm text-slate-500 mb-2">
                          Descreva o que você come em um dia típico
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
                          placeholder="Ex: Café da manhã: pão com queijo e café | Almoço: arroz, feijão, carne e salada | Jantar: sopa de legumes"
                        />
                        {formErrors.diario_alimentar && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.diario_alimentar}</p>
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
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`${theme.button} px-6 py-2 rounded-lg ${
                          loading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Enviando...
                          </div>
                        ) : (
                          'Enviar Formulário'
                        )}
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