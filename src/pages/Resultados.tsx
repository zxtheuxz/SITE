import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ClipboardCheck, Scale, ArrowLeft, Loader2, Download, Clock, Sun, Moon, FileText, Activity, Heart } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useTheme } from '../contexts/ThemeContext';

// Adicione estas classes ao seu arquivo de estilos globais ou como uma constante
const themeStyles = {
  light: {
    background: "bg-gradient-to-b from-gray-100 to-white",
    text: "text-gray-800",
    textSecondary: "text-gray-600",
    card: "bg-white shadow-lg border border-gray-200",
    button: "bg-orange-500 hover:bg-orange-600 text-white",
    buttonSecondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    input: "bg-white border border-gray-300 focus:border-orange-500",
    scrollbar: {
      track: "bg-gray-200",
      thumb: "bg-orange-400/50 hover:bg-orange-400/70"
    }
  },
  dark: {
    background: "bg-gradient-to-b from-slate-900 to-slate-800",
    text: "text-white",
    textSecondary: "text-gray-300",
    card: "bg-slate-800/80 backdrop-blur-sm border border-orange-500/20",
    button: "bg-orange-500 hover:bg-orange-600 text-white",
    buttonSecondary: "bg-slate-700 hover:bg-slate-600 text-white",
    input: "bg-slate-700 border border-slate-600 focus:border-orange-500",
    scrollbar: {
      track: "bg-slate-700",
      thumb: "bg-orange-500/50 hover:bg-orange-500/70"
    }
  }
};

interface Perfil {
  liberado: string; // 'sim' ou 'nao'
  resultado_fisica: string; // Texto com o resultado da avaliação física
  resultado_nutricional: string; // Texto com o resultado da avaliação nutricional
  nome?: string; // Optional nome
  nome_completo?: string;
}

export function Resultados() {
  const navigate = useNavigate();
  const [gerandoFisica, setGerandoFisica] = useState(false);
  const [gerandoNutricional, setGerandoNutricional] = useState(false);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [perfilLiberado, setPerfilLiberado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const location = useLocation();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const themeStyle = isDarkMode ? themeStyles.dark : themeStyles.light;
  const [activeTab, setActiveTab] = useState<'fisica' | 'nutricional'>('fisica');
  const [error, setError] = useState<string | null>(null);
  
  // Obter o ID da query string
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');

  // Atualize o estilo da scrollbar dinamicamente
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        ${themeStyle.scrollbar.track};
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        ${themeStyle.scrollbar.thumb};
        border-radius: 10px;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, [isDarkMode]);

  useEffect(() => {
    const buscarPerfil = async () => {
      try {
        setCarregando(true);
        
        if (!id) {
          console.log('ID não fornecido na URL, buscando perfil do usuário logado');
          
          // Obter o usuário logado
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.error('Usuário não autenticado');
            setCarregando(false);
            return;
          }
          
          // Buscar o perfil do usuário logado
          const { data: perfilUsuario, error: perfilError } = await supabase
            .from('perfis')
            .select('*, nome_completo')
            .eq('user_id', user.id)
            .single();
            
          if (perfilError) {
            console.error('Erro ao buscar perfil do usuário:', perfilError);
            setCarregando(false);
            return;
          }
          
          console.log('Dados do perfil do usuário logado:', perfilUsuario);
          
          if (!perfilUsuario) {
            console.error('Nenhum perfil encontrado para o usuário logado');
            setCarregando(false);
            return;
          }
          
          console.log('Campo liberado:', perfilUsuario.liberado, typeof perfilUsuario.liberado);
          
          // Verificar se o campo liberado é 'sim' (case insensitive)
          const liberado = typeof perfilUsuario.liberado === 'string' && 
                          perfilUsuario.liberado.toLowerCase() === 'sim';
          
          console.log('Perfil liberado?', liberado);
          
          setPerfil(perfilUsuario);
          setPerfilLiberado(liberado);
          setCarregando(false);
          return;
        }
        
        console.log('Buscando perfil com ID:', id);
        
        const { data, error } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Erro ao buscar perfil:', error);
          throw error;
        }
        
        console.log('Dados do perfil recebidos:', data);
        
        if (!data) {
          console.error('Nenhum dado de perfil encontrado');
          setCarregando(false);
          return;
        }
        
        console.log('Campo liberado:', data.liberado, typeof data.liberado);
        
        // Verificar se o campo liberado é 'sim' (case insensitive)
        const liberado = typeof data.liberado === 'string' && 
                        data.liberado.toLowerCase() === 'sim';
        
        console.log('Perfil liberado?', liberado);
        
        setPerfil(data);
        setPerfilLiberado(liberado);
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        alert('Erro ao carregar os dados. Por favor, tente novamente.');
      } finally {
        setCarregando(false);
      }
    };

    buscarPerfil();
  }, [id]);

  const gerarPDF = async (tipo: 'FISICA' | 'NUTRICIONAL') => {
    if (!perfil) {
      alert('Perfil não encontrado. Não é possível gerar o PDF.');
      return;
    }
    
    const conteudo = tipo === 'FISICA' 
      ? perfil.resultado_fisica 
      : perfil.resultado_nutricional;
      
    if (!conteudo) {
      alert('Não há resultado disponível para gerar o PDF');
      return;
    }

    try {
      // Definir o estado de geração para o tipo específico
      if (tipo === 'FISICA') {
        setGerandoFisica(true);
      } else {
        setGerandoNutricional(true);
      }
      
      console.log(`Iniciando geração do PDF ${tipo}...`);
      
      // Configuração do documento
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Definições de margens e dimensões
      const margemEsquerda = 20;
      const margemDireita = 20;
      const margemSuperior = 30;
      const margemInferior = 20;
      const larguraUtil = doc.internal.pageSize.width - margemEsquerda - margemDireita;
      const alturaUtil = doc.internal.pageSize.height - margemSuperior - margemInferior;
      
      // Configurações de fonte
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      
      // Título do documento baseado no tipo
      const titulo = tipo === 'FISICA' 
        ? 'RESULTADO DA AVALIAÇÃO FÍSICA' 
        : 'RESULTADO DA AVALIAÇÃO NUTRICIONAL';
      
      // Função para adicionar cabeçalho
      const adicionarCabecalho = (pagina: number) => {
        // Cabeçalho apenas na primeira página
        if (pagina === 1) {
          // Retângulo do cabeçalho
          doc.setFillColor(230, 240, 255);
          doc.rect(margemEsquerda, 10, larguraUtil, 15, 'F');
          
          // Título
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(14);
          doc.setTextColor(0, 50, 150);
          doc.text(titulo, doc.internal.pageSize.width / 2, 18, { align: 'center' });
          
          // Data
          const dataAtual = new Date().toLocaleDateString('pt-BR');
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(`Data: ${dataAtual}`, margemEsquerda, 25);
          
          // Nome do usuário
          const nomeCliente = perfil?.nome_completo || perfil?.nome || 'Usuário';
          doc.text(`Cliente: ${nomeCliente}`, doc.internal.pageSize.width - margemDireita, 25, { align: 'right' });
        }
        
        // Resetar configurações
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
      };
      
      // Função para adicionar rodapé
      const adicionarRodape = (pagina: number, totalPaginas: number) => {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Página ${pagina} de ${totalPaginas}`, 
          doc.internal.pageSize.width / 2, 
          doc.internal.pageSize.height - 10, 
          { align: 'center' }
        );
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
      };
      
      // Dividir o conteúdo em parágrafos
      const paragrafos = conteudo.split('\n');
      
      // Estimar o número total de páginas (aproximado)
      const linhasPorPagina = Math.floor(alturaUtil / 5); // 5mm por linha (estimativa)
      const totalPaginas = Math.ceil(paragrafos.length / linhasPorPagina) || 1;
      
      // Adicionar primeira página
      let paginaAtual = 1;
      adicionarCabecalho(paginaAtual);
      
      // Posição Y inicial para o conteúdo
      let posicaoY = margemSuperior;
      
      // Processar cada parágrafo
      for (let i = 0; i < paragrafos.length; i++) {
        const paragrafo = paragrafos[i].trim();
        
        // Pular linhas em branco
        if (paragrafo === '') {
          posicaoY += 3;
          continue;
        }
        
        // Verificar se contém a palavra MÊS
        const contemMes = paragrafo.toUpperCase().includes('MÊS');
        
        // Verificar se é um título
        const ehTitulo = paragrafo.length < 50 && 
                         paragrafo === paragrafo.toUpperCase() && 
                         paragrafo.trim().length > 0;
        
        // Calcular altura necessária
        const linhasTexto = doc.splitTextToSize(paragrafo, larguraUtil);
        const alturaTexto = linhasTexto.length * 5 + (ehTitulo ? 2 : 0);
        
        // Verificar se precisa de nova página antes de adicionar o texto
        if (posicaoY + alturaTexto > doc.internal.pageSize.height - margemInferior - 10) {
          adicionarRodape(paginaAtual, totalPaginas);
          doc.addPage();
          paginaAtual++;
          adicionarCabecalho(paginaAtual);
          posicaoY = margemSuperior;
        }
        
        // Adicionar destaque amarelo se contiver MÊS
        if (contemMes) {
          doc.setFillColor(255, 255, 200);
          // Encontrar a linha que contém "MÊS"
          const linhaComMes = linhasTexto.find((linha: string) => linha.toUpperCase().includes('MÊS'));
          if (linhaComMes) {
            const indexLinhaMes = linhasTexto.indexOf(linhaComMes);
            const alturaRetangulo = 7; // Altura fixa para uma linha
            const posicaoYRetangulo = posicaoY + (indexLinhaMes * 5) - 4;
            
            doc.rect(
              margemEsquerda - 1,
              posicaoYRetangulo,
              larguraUtil + 2,
              alturaRetangulo,
              'F'
            );
          }
        }
        
        // Aplicar estilo e adicionar texto
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        if (ehTitulo) {
          doc.text(paragrafo, margemEsquerda, posicaoY);
          posicaoY += 7;
        } else {
          doc.text(linhasTexto, margemEsquerda, posicaoY);
          posicaoY += alturaTexto + 2;
        }
      }
      
      // Adicionar rodapé na última página
      adicionarRodape(paginaAtual, totalPaginas);
      
      // Salvar o PDF
      const nomeArquivoCliente = perfil?.nome_completo || perfil?.nome || 'usuario';
      const nomeArquivo = `resultado_${tipo.toLowerCase()}_${nomeArquivoCliente.replace(/\s+/g, '_').toLowerCase()}.pdf`;
      
      // Método direto de download
      doc.save(nomeArquivo);
      
      console.log(`PDF ${tipo} gerado com sucesso!`);
      alert(`PDF da avaliação ${tipo === 'FISICA' ? 'física' : 'nutricional'} gerado com sucesso!`);
    } catch (error) {
      console.error(`Erro ao gerar PDF ${tipo}:`, error);
      alert(`Erro ao gerar o PDF da avaliação ${tipo === 'FISICA' ? 'física' : 'nutricional'}. Tente novamente.`);
    } finally {
      // Resetar o estado de geração para o tipo específico
      setTimeout(() => {
        if (tipo === 'FISICA') {
          setGerandoFisica(false);
        } else {
          setGerandoNutricional(false);
        }
      }, 1000); // Pequeno atraso para evitar cliques múltiplos
    }
  };

  // Adicionar um efeito para garantir que os estados de geração sejam resetados quando o componente for desmontado
  useEffect(() => {
    return () => {
      // Limpar os estados quando o componente for desmontado
      setGerandoFisica(false);
      setGerandoNutricional(false);
    };
  }, []);
  
  // Adicionar um efeito para logar informações sobre os botões de download
  useEffect(() => {
    console.log('Estado dos botões de download:');
    console.log('- Gerando PDF Física:', gerandoFisica);
    console.log('- Gerando PDF Nutricional:', gerandoNutricional);
  }, [gerandoFisica, gerandoNutricional]);

  // Adicionar efeito de fundo e garantir que o conteúdo seja visível
  useEffect(() => {
    const background = isDarkMode 
      ? '#0f172a'
      : '#ffffff';
    
    document.documentElement.style.background = background;
    document.documentElement.style.backgroundColor = background;
    document.body.style.background = background;
    document.body.style.backgroundColor = background;
    
    // Remover o padrão de fundo
    document.body.style.backgroundImage = 'none';
    
    // Garantir que o conteúdo seja visível
    const resultadosContainer = document.querySelector('.resultados-container');
    if (resultadosContainer) {
      (resultadosContainer as HTMLElement).style.display = 'block';
      (resultadosContainer as HTMLElement).style.visibility = 'visible';
      (resultadosContainer as HTMLElement).style.opacity = '1';
    }
  }, [isDarkMode]);

  // Adicionar estilos de scrollbar personalizados
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      ::-webkit-scrollbar {
        width: 10px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 5px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: rgba(251, 146, 60, 0.5);
        border-radius: 5px;
        transition: all 0.3s ease;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(251, 146, 60, 0.7);
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.5s ease-out forwards;
      }
      
      .animate-slideIn {
        animation: slideIn 0.5s ease-out forwards;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  if (carregando) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
        </div>
      </Layout>
    );
  }

  // Componente para exibir o estado de aguardando resultados
  const AguardandoResultado = () => (
    <div className="flex flex-col items-center justify-center py-8 md:py-12">
      <div className="bg-orange-600/20 rounded-full p-4 mb-4 shadow-lg shadow-orange-900/10">
        <Clock className="w-10 h-10 text-orange-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Avaliação em Análise</h3>
      <p className="text-gray-300 text-center max-w-md mb-4">
        Suas avaliações estão sendo analisadas por nossos especialistas. 
        Em breve seus resultados estarão disponíveis.
      </p>
      <div className="flex space-x-2 items-center">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-100"></span>
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse delay-200"></span>
      </div>
    </div>
  );

  // Função para renderizar o conteúdo do resultado com formatação adequada
  const renderizarResultado = (conteudo: string | null) => {
    if (!conteudo) {
      return (
        <div className={`text-center p-4 ${
          isDarkMode 
            ? 'text-gray-400' 
            : 'text-gray-900'
        }`}>
          Resultado não disponível
        </div>
      );
    }

    const paragrafos = conteudo.split('\n');
    
    return paragrafos.map((paragrafo, index) => {
      const ehLinhaEmBranco = paragrafo.trim().length === 0;
      
      if (ehLinhaEmBranco) {
        return <div key={index} className="h-4"></div>;
      }
      
      const contemMes = paragrafo.toUpperCase().includes('MÊS');
      
      if (contemMes) {
        return (
          <div 
            key={index} 
            className="text-base py-3 px-4 my-4 bg-orange-500 text-white rounded-lg"
          >
            {paragrafo}
          </div>
        );
      }
      
      return (
        <div 
          key={index} 
          className={`text-base py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
        >
          {paragrafo}
        </div>
      );
    });
  };

  return (
    <Layout>
      <div className={`resultados-container p-6 ${
        isDarkMode 
          ? 'bg-slate-900/50 text-white' 
          : 'bg-white text-gray-900'
      }`}>
        <div className="resultados-header mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors self-start"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Início
              </button>
              <div className="flex items-center">
                <div className="bg-orange-500 p-2 rounded-lg mr-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Meus Resultados</h1>
              </div>
            </div>
            {!carregando && perfilLiberado && (
              <button
                onClick={() => gerarPDF(activeTab === 'fisica' ? 'FISICA' : 'NUTRICIONAL')}
                disabled={gerandoFisica || gerandoNutricional}
                className="inline-flex items-center px-4 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
              >
                {gerandoFisica || gerandoNutricional ? (
                  <>
                    <span className="animate-pulse mr-2">●</span>
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </>
                )}
              </button>
            )}
          </div>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            Visualize os resultados das suas avaliações e recomendações personalizadas
          </p>
        </div>

        {perfil?.liberado !== 'sim' ? (
          <div className="animate-fadeIn">
            <AguardandoResultado />
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full sm:w-[400px] flex-shrink-0">
                <button
                  onClick={() => setActiveTab('fisica')}
                  className={`inline-flex items-center justify-center w-full sm:w-[200px] px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'fisica'
                      ? 'bg-orange-500 text-white'
                      : isDarkMode 
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Activity className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Avaliação Física</span>
                </button>
                <button
                  onClick={() => setActiveTab('nutricional')}
                  className={`inline-flex items-center justify-center w-full sm:w-[200px] px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'nutricional'
                      ? 'bg-orange-500 text-white'
                      : isDarkMode 
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Heart className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Avaliação Nutricional</span>
                </button>
              </div>
            </div>
            
            <div className="w-full max-w-[1200px] mx-auto">
              {activeTab === 'fisica' ? (
                <div className={`${isDarkMode ? 'bg-slate-800/80 border-orange-500/20' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg animate-slideIn`}>
                  <div className="flex items-center mb-6">
                    <div className="bg-orange-500 p-2 rounded-lg mr-3">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Resultado da Avaliação Física
                    </h2>
                  </div>
                  
                  <div id="resultado-fisica" className="space-y-4">
                    {renderizarResultado(perfil?.resultado_fisica || null)}
                  </div>
                </div>
              ) : (
                <div className={`${isDarkMode ? 'bg-slate-800/80 border-orange-500/20' : 'bg-white border-gray-200'} border rounded-xl p-6 shadow-lg animate-slideIn`}>
                  <div className="flex items-center mb-6">
                    <div className="bg-orange-500 p-2 rounded-lg mr-3">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Resultado da Avaliação Nutricional
                    </h2>
                  </div>
                  
                  <div id="resultado-nutricional" className="space-y-4">
                    {renderizarResultado(perfil?.resultado_nutricional || null)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 