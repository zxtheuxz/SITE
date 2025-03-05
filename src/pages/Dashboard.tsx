import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Activity, Users, FileText, ArrowRight, Heart, Sparkles, ClipboardCheck, Scale, Loader2, Download, Clock, Sun, Moon } from 'lucide-react';
import '../styles/global.css';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { jsPDF } from 'jspdf';

// Adicione estas classes para os estilos de tema
const themeStyles = {
  light: {
    background: "bg-gradient-to-b from-gray-100 to-white",
    text: "text-slate-800",
    textSecondary: "text-slate-600",
    card: "bg-white shadow-lg border border-gray-200",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    buttonSecondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    input: "bg-white border border-gray-300 focus:border-blue-500",
    scrollbar: {
      track: "bg-gray-200",
      thumb: "bg-blue-400/50 hover:bg-blue-400/70"
    }
  },
  dark: {
    background: "bg-gradient-to-b from-slate-900 to-slate-800",
    text: "text-white",
    textSecondary: "text-blue-300",
    card: "bg-slate-800/50 backdrop-blur-sm border border-blue-500/20",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    buttonSecondary: "bg-slate-700 hover:bg-slate-600 text-white",
    input: "bg-slate-700 border border-slate-600 focus:border-blue-500",
    scrollbar: {
      track: "bg-slate-700",
      thumb: "bg-blue-500/50 hover:bg-blue-500/70"
    }
  }
};

interface Perfil {
  sexo?: string;
  nome_completo?: string;
  liberado?: string; // 'sim' ou 'nao'
  resultado_fisica?: string; // Texto com o resultado da avaliação física
  resultado_nutricional?: string; // Texto com o resultado da avaliação nutricional
}

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [activeTab, setActiveTab] = useState('avaliacoes');
  const [avaliacoes, setAvaliacoes] = useState({
    fisica: false,
    nutricional: false
  });
  const [gerandoFisica, setGerandoFisica] = useState(false);
  const [gerandoNutricional, setGerandoNutricional] = useState(false);
  const [perfilLiberado, setPerfilLiberado] = useState(false);
  const [carregandoResultados, setCarregandoResultados] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [formulariosCompletos, setFormulariosCompletos] = useState(false);
  const theme = isDarkMode ? themeStyles.dark : themeStyles.light;

  // Atualize o estilo da scrollbar dinamicamente
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        ${theme.scrollbar.track};
        border-radius: 10px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        ${theme.scrollbar.thumb};
        border-radius: 10px;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, [isDarkMode]);

  // Efeito principal para carregar dados do usuário - removida a dependência de activeTab
  useEffect(() => {
    // Aplicar um background mais vibrante e garantir que seja aplicado corretamente
    const applyBackground = () => {
      document.documentElement.style.background = 'linear-gradient(135deg, #f5f7ff 0%, #e0e6ff 100%)';
      document.documentElement.style.backgroundColor = '#f5f7ff';
      document.body.style.background = 'linear-gradient(135deg, #f5f7ff 0%, #e0e6ff 100%)';
      document.body.style.backgroundColor = '#f5f7ff';
      document.body.style.backgroundImage = "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")";
      
      // Adicionar um estilo global para garantir que o fundo seja aplicado
      const style = document.createElement('style');
      style.textContent = `
        html, body {
          background: linear-gradient(135deg, #f5f7ff 0%, #e0e6ff 100%) !important;
          background-color: #f5f7ff !important;
          min-height: 100vh;
        }
        #root {
          background: transparent !important;
          min-height: 100vh;
        }
      `;
      document.head.appendChild(style);
      
      console.log('Estilos de fundo aplicados com sucesso');
    };
    
    // Aplicar imediatamente e novamente após um pequeno delay para garantir
    applyBackground();
    setTimeout(applyBackground, 100);
    
    async function getUser() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          console.log("Usuário autenticado:", user.id);

          // Buscar o perfil do usuário para obter o sexo e nome completo
          const { data: perfilData, error: perfilError } = await supabase
            .from('perfis')
            .select('sexo, nome_completo, liberado, resultado_fisica, resultado_nutricional')
            .eq('user_id', user.id)
            .single();

          if (perfilError) {
            console.error('Erro ao buscar perfil do usuário:', perfilError);
          } else {
            console.log('Perfil do usuário:', perfilData);
            console.log('Sexo do usuário:', perfilData?.sexo);
            console.log('Tipo do sexo:', typeof perfilData?.sexo);
            console.log('Status de liberação:', perfilData?.liberado);
            setPerfil(perfilData);
            
            // Definir corretamente o estado de liberação do perfil
            if (perfilData?.liberado && typeof perfilData.liberado === 'string') {
              const liberado = perfilData.liberado.toLowerCase() === 'sim';
              setPerfilLiberado(liberado);
              console.log('perfilLiberado definido como:', liberado);
            } else {
              // Não forçar mais para true, respeitar o valor do banco de dados
              setPerfilLiberado(false);
              console.log('perfilLiberado definido como:', false);
            }
          }

          // Verificar se o usuário já tem avaliações físicas - usando contagem para maior precisão
          const { count: countFisica, error: errorFisicaCount } = await supabase
            .from('avaliacao_fisica')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          if (errorFisicaCount) {
            console.error('Erro ao contar avaliações físicas:', errorFisicaCount);
          }
          
          const temAvaliacaoFisica = countFisica !== null && countFisica > 0;
          console.log('Contagem de avaliações físicas:', countFisica);
          console.log('Tem avaliação física:', temAvaliacaoFisica);

          // Verificar se o usuário já tem avaliações nutricionais - usando contagem para maior precisão
          // Verificar primeiro na tabela avaliacao_nutricional
          let countNutricional = 0;
          const { count: countNutri, error: errorNutriCount } = await supabase
            .from('avaliacao_nutricional')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          if (errorNutriCount) {
            console.error('Erro ao contar avaliações nutricionais:', errorNutriCount);
          } else {
            countNutricional = countNutri || 0;
          }
          
          // Verificar também na tabela avaliacao_nutricional_feminino
          // Verificar independente do sexo para garantir que o formulário seja contabilizado
          console.log('Verificando avaliação nutricional feminina independente do sexo');
          
          // Primeiro vamos verificar se o registro existe
          const { data: avaliacaoFem, error: errorFemGet } = await supabase
            .from('avaliacao_nutricional_feminino')
            .select('id, user_id')
            .eq('user_id', user.id);
            
          console.log('Avaliação nutricional feminina encontrada:', avaliacaoFem);
          
          if (errorFemGet) {
            console.error('Erro ao buscar avaliação nutricional feminina:', errorFemGet);
          }
          
          // Agora fazemos a contagem
          const { count: countNutriFem, error: errorNutriFemCount } = await supabase
            .from('avaliacao_nutricional_feminino')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          console.log('Contagem de avaliações nutricionais femininas:', countNutriFem);
          
          if (errorNutriFemCount) {
            console.error('Erro ao contar avaliações nutricionais femininas:', errorNutriFemCount);
          } else {
            countNutricional += countNutriFem || 0;
            console.log('Contagem nutricional atualizada para:', countNutricional);
          }

          const temAvaliacaoNutricional = countNutricional > 0 || (Array.isArray(avaliacaoFem) && avaliacaoFem.length > 0);
          console.log('Contagem total de avaliações nutricionais:', countNutricional);
          console.log('Tem avaliação nutricional (com verificação direta):', temAvaliacaoNutricional);

          // Verificação adicional para garantir que o formulário feminino seja contabilizado
          if (!temAvaliacaoNutricional && Array.isArray(avaliacaoFem) && avaliacaoFem.length > 0) {
            console.log('Avaliação feminina encontrada, mas não contabilizada. Forçando contabilização...');
            // Forçar a contabilização
            setAvaliacoes(prev => ({
              ...prev,
              nutricional: true
            }));
            
            // Atualizar também o estado de formulários completos se a avaliação física estiver ok
            if (temAvaliacaoFisica) {
              setFormulariosCompletos(true);
              if (perfilData?.liberado?.toLowerCase() === 'sim') {
                setMostrarAviso(true);
              }
            }
          }

          // Atualizar o estado das avaliações
          setAvaliacoes({
            fisica: temAvaliacaoFisica,
            nutricional: temAvaliacaoNutricional
          });
          
          console.log('Avaliações definidas como:', { fisica: temAvaliacaoFisica, nutricional: temAvaliacaoNutricional });
          
          // Verificar se ambos os formulários estão preenchidos para mostrar o aviso
          const ambosFormulariosPreenchidos = temAvaliacaoFisica && temAvaliacaoNutricional;
          setFormulariosCompletos(ambosFormulariosPreenchidos);
          
          console.log('Ambos formulários preenchidos:', ambosFormulariosPreenchidos);
          console.log('Perfil liberado:', perfilData?.liberado);
          
          if (ambosFormulariosPreenchidos && perfilData?.liberado?.toLowerCase() === 'sim') {
            console.log('Ambos os formulários estão preenchidos e perfil liberado, mostrando aviso');
            setMostrarAviso(true);
          } else {
            console.log('Não mostrando aviso: formulários completos =', ambosFormulariosPreenchidos, 'perfil liberado =', perfilData?.liberado);
            // Se ambos os formulários estiverem preenchidos, mas o perfil não estiver liberado, forçar a exibição do aviso
            if (ambosFormulariosPreenchidos) {
              console.log('Ambos os formulários estão preenchidos, forçando exibição do aviso');
              setMostrarAviso(true);
            } else {
              setMostrarAviso(false);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      } finally {
        setLoading(false);
      }
    }

    getUser();
    
    // Limpar o estilo ao desmontar
    return () => {
      const styles = document.head.querySelectorAll('style');
      styles.forEach(style => {
        if (style.textContent?.includes('background: linear-gradient(135deg, #f5f7ff 0%, #e0e6ff 100%)')) {
          document.head.removeChild(style);
        }
      });
    };
  }, []); // Removida a dependência de activeTab

  // Efeito para esconder o aviso quando a aba de resultados estiver ativa
  useEffect(() => {
    console.log('Verificando condições para mostrar aviso:');
    console.log('- Tab ativa:', activeTab);
    console.log('- Formulários completos:', formulariosCompletos);
    console.log('- Perfil liberado:', perfil?.liberado);
    
    if (activeTab === 'resultados') {
      console.log('Tab de resultados ativa, escondendo aviso');
      setMostrarAviso(false);
    } else if (formulariosCompletos && perfil?.liberado?.toLowerCase() === 'sim') {
      console.log('Formulários completos e perfil liberado, mostrando aviso');
      setMostrarAviso(true);
    } else {
      console.log('Condições não atendidas, escondendo aviso');
      setMostrarAviso(false);
    }
  }, [activeTab, formulariosCompletos, perfil?.liberado]);

  // Função para obter o nome de exibição do usuário
  const getNomeExibicao = () => {
    if (perfil?.nome_completo) {
      // Se tiver nome completo, pega o primeiro nome
      const primeiroNome = perfil.nome_completo.split(' ')[0];
      return primeiroNome;
    }
    
    // Se não tiver nome completo, usa o email sem o domínio
    return user?.email?.split('@')[0] || 'Usuário';
  };

  // Função para determinar qual formulário nutricional mostrar com base no sexo
  const getNutricionalLink = () => {
    if (perfil?.sexo === 'feminino') {
      return '/avaliacao-nutricional/feminino';
    } else if (perfil?.sexo === 'masculino') {
      return '/avaliacao-nutricional/masculino';
    } else {
      // Se não tiver sexo definido, usar o formulário masculino como padrão
      return '/avaliacao-nutricional/masculino';
    }
  };

  // Função para gerar PDF
  const gerarPDF = async (tipo: 'FISICA' | 'NUTRICIONAL') => {
    try {
      // Atualizar o estado específico com base no tipo
      if (tipo === 'FISICA') {
        setGerandoFisica(true);
      } else {
        setGerandoNutricional(true);
      }
      
      console.log(`Iniciando geração do PDF ${tipo}...`);
      
      // Verificar se há conteúdo para gerar o PDF
      const conteudo = tipo === 'FISICA' 
        ? perfil?.resultado_fisica 
        : perfil?.resultado_nutricional;
        
      if (!conteudo || conteudo.trim() === '') {
        alert('Não há resultado disponível para gerar o PDF');
        return;
      }
      
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
          const nomeCliente = perfil?.nome_completo || 'Usuário';
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
      const linhasPorPagina = Math.floor(alturaUtil / 5);
      const totalPaginas = Math.ceil(paragrafos.length / linhasPorPagina) || 1;
      
      // Iniciar a primeira página
      let paginaAtual = 1;
      let posicaoY = margemSuperior;
      
      // Adicionar cabeçalho na primeira página
      adicionarCabecalho(paginaAtual);
      
      // Processar cada parágrafo
      for (let i = 0; i < paragrafos.length; i++) {
        const paragrafo = paragrafos[i].trim();
        
        // Pular parágrafos vazios
        if (!paragrafo) {
          posicaoY += 2;
          continue;
        }
        
        // Verificar se é um título (todo em maiúsculas ou contém "MÊS")
        const ehTitulo = paragrafo === paragrafo.toUpperCase() || paragrafo.includes('TÍTULO') || paragrafo.includes('RESULTADO');
        const contemMes = paragrafo.toUpperCase().includes('MÊS');
        
        // Calcular a altura do texto
        const linhasTexto = doc.splitTextToSize(paragrafo, larguraUtil);
        const alturaTexto = linhasTexto.length * 5;
        
        // Verificar se precisa de uma nova página
        if (posicaoY + alturaTexto > doc.internal.pageSize.height - margemInferior) {
          // Adicionar rodapé na página atual
          adicionarRodape(paginaAtual, totalPaginas);
          
          // Iniciar nova página
          doc.addPage();
          paginaAtual++;
          posicaoY = margemSuperior;
          
          // Adicionar cabeçalho na nova página
          adicionarCabecalho(paginaAtual);
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
      const nomeArquivoCliente = perfil?.nome_completo || 'usuario';
      const nomeArquivo = `resultado_${tipo.toLowerCase()}_${nomeArquivoCliente.replace(/\s+/g, '_').toLowerCase()}.pdf`;
      
      // Método direto de download
      doc.save(nomeArquivo);
      
      console.log(`PDF ${tipo} gerado com sucesso!`);
      alert(`PDF da avaliação ${tipo === 'FISICA' ? 'física' : 'nutricional'} gerado com sucesso!`);
    } catch (error) {
      console.error(`Erro ao gerar PDF ${tipo}:`, error);
      alert(`Erro ao gerar o PDF da avaliação ${tipo === 'FISICA' ? 'física' : 'nutricional'}. Tente novamente.`);
    } finally {
      // Pequeno atraso para evitar cliques múltiplos
      setTimeout(() => {
        // Resetar apenas o estado específico
        if (tipo === 'FISICA') {
          setGerandoFisica(false);
        } else {
          setGerandoNutricional(false);
        }
      }, 500);
    }
  };

  // Componente para exibir o estado de aguardando resultados
  const AguardandoResultado = () => (
    <div className="flex flex-col items-center justify-center py-6 md:py-10">
      <div className="bg-gradient-to-r from-gray-400 to-gray-600 p-3 md:p-4 rounded-full mb-3 md:mb-4 shadow-lg">
        <Clock className="h-6 w-6 md:h-8 md:w-8 text-white animate-pulse" />
      </div>
      <h3 className="text-lg md:text-xl font-medium text-gray-700 mb-2 text-center">Resultados em processamento</h3>
      <p className="text-sm md:text-base text-gray-500 text-center max-w-md mb-4 md:mb-6 px-4">
        Seus resultados estão sendo analisados pela nossa equipe. 
        Em breve você poderá visualizar e baixar o relatório completo.
      </p>
    </div>
  );

  // Função para renderizar o conteúdo do resultado com formatação adequada
  const renderizarResultado = (conteudo: string | null) => {
    if (!conteudo || conteudo.trim() === '') {
      return (
        <div className="text-center text-gray-500 italic font-medium p-4 bg-gray-100 rounded-lg">
          Resultado não disponível
        </div>
      );
    }

    const paragrafos = conteudo.split('\n');
    
    return paragrafos.map((paragrafo, index) => {
      // Verifica se é uma linha em branco
      const ehLinhaEmBranco = paragrafo.trim().length === 0;
      
      if (ehLinhaEmBranco) {
        return <div key={index} className="h-3"></div>;
      }
      
      // Verifica se contém a palavra MÊS
      const contemMes = paragrafo.toUpperCase().includes('MÊS');
      
      if (contemMes) {
        return (
          <p 
            key={index} 
            className="text-lg font-bold py-3 px-4 my-3 bg-yellow-500 text-black rounded-md shadow-md border border-yellow-400"
          >
            {paragrafo}
          </p>
        );
      }
      
      // Para todos os outros textos, sem formatação especial
      return (
        <p 
          key={index} 
          className="text-gray-700 py-1 my-1"
        >
          {paragrafo}
        </p>
      );
    });
  };

  // Efeito para monitorar mudanças na aba ativa
  useEffect(() => {
    if (activeTab === 'resultados') {
      console.log('Renderizando aba de resultados:');
      console.log('- perfilLiberado:', perfilLiberado);
      console.log('- avaliacoes:', avaliacoes);
      console.log('- perfil:', perfil);
      
      // Carregar os resultados quando a aba for ativada
      setCarregandoResultados(true);
      // Simular tempo de carregamento
      setTimeout(() => {
        setCarregandoResultados(false);
      }, 500); // Reduzido para 500ms para melhor experiência
    }
  }, [activeTab, perfilLiberado, avaliacoes, perfil]);

  // Função para ir para a aba de resultados
  const irParaResultados = () => {
    console.log('Navegando para a aba de resultados');
    setActiveTab('resultados');
    setMostrarAviso(false);
  };

  // Adicionar um efeito para logar informações sobre os resultados
  useEffect(() => {
    if (activeTab === 'resultados') {
      console.log('Informações da aba de resultados:');
      console.log('- Perfil liberado:', perfilLiberado);
      console.log('- Resultado físico disponível:', !!perfil?.resultado_fisica);
      console.log('- Resultado nutricional disponível:', !!perfil?.resultado_nutricional);
      
      // Mostrar o conteúdo real dos resultados para depuração
      console.log('Conteúdo do resultado físico:', perfil?.resultado_fisica);
      console.log('Conteúdo do resultado nutricional:', perfil?.resultado_nutricional);
      
      // Explicação sobre a lógica de exibição dos resultados:
      // 1. Se o perfil não estiver liberado (liberado !== 'sim'), mostramos o componente AguardandoResultado
      // 2. Se o perfil estiver liberado, verificamos se há resultados reais (perfil.resultado_xxx)
      // 3. Se não houver resultados reais, exibimos o texto de exemplo
      // 4. Se houver resultados reais, exibimos os resultados do perfil
      console.log('Lógica de exibição: perfil liberado? -> mostrar resultados reais ou exemplo, senão -> mostrar aguardando');
    }
  }, [activeTab, perfilLiberado, perfil?.resultado_fisica, perfil?.resultado_nutricional]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Bem-vindo(a), {getNomeExibicao()}!</h1>
          <p className="text-sm md:text-base text-gray-600">Complete suas avaliações para receber seu plano personalizado.</p>
        </div>
        
        {/* Aviso de formulários completos */}
        {mostrarAviso && (
          <div className="mb-6 p-3 md:p-4 bg-green-100 border-l-4 border-green-500 rounded-lg flex flex-col md:flex-row md:items-start">
            <div className="bg-green-500 rounded-full p-1 mr-3 mt-0.5 hidden md:block">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-green-800 font-medium text-sm md:text-base">Avaliações completas!</h3>
              <p className="text-green-700 text-xs md:text-sm mt-1">
                Você já preencheu todas as avaliações necessárias. Seus resultados estão disponíveis para visualização.
              </p>
            </div>
            <button 
              onClick={irParaResultados}
              className="mt-3 md:mt-0 md:ml-4 px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs md:text-sm font-medium w-full md:w-auto"
            >
              Ver Resultados
            </button>
          </div>
        )}
        
        {/* Abas de navegação */}
        <div className="mb-4 md:mb-6 border-b border-gray-200">
          <div className="flex space-x-4 md:space-x-8">
            <button
              className={`pb-2 md:pb-4 px-1 text-sm md:text-base ${
                activeTab === 'avaliacoes'
                  ? 'text-purple-600 border-b-2 border-purple-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('avaliacoes')}
            >
              Avaliações
            </button>
            <button
              className={`pb-2 md:pb-4 px-1 text-sm md:text-base ${
                activeTab === 'resultados'
                  ? 'text-purple-600 border-b-2 border-purple-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('resultados')}
            >
              Resultados
            </button>
          </div>
        </div>
        
        {/* Conteúdo da aba ativa */}
        {activeTab === 'avaliacoes' ? (
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
            {/* Card de Avaliação Física */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 md:p-6">
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="bg-blue-100 p-2 md:p-3 rounded-full mr-3 md:mr-4">
                    <ClipboardCheck className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800">Avaliação Física</h2>
                </div>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                  {avaliacoes.fisica 
                    ? "Você já completou sua avaliação física. Os resultados estão disponíveis na aba Resultados."
                    : "Complete sua avaliação física para receber um plano de treino personalizado."}
                </p>
                {avaliacoes.fisica ? (
                  <button 
                    onClick={irParaResultados}
                    className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                  >
                    Ver Resultados
                    <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                  </button>
                ) : (
                  <Link 
                    to="/avaliacao-fisica"
                    className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                  >
                    Iniciar Avaliação
                    <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                  </Link>
                )}
              </div>
              <div className="bg-blue-50 px-4 md:px-6 py-3 md:py-4">
                <div className="flex items-center text-blue-800 text-xs md:text-sm">
                  <Activity className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  <span className="font-medium">Medidas corporais e histórico de atividades</span>
                </div>
              </div>
            </div>

            {/* Card de Avaliação Nutricional */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 md:p-6">
                <div className="flex items-center mb-3 md:mb-4">
                  <div className="bg-green-100 p-2 md:p-3 rounded-full mr-3 md:mr-4">
                    <Scale className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800">Avaliação Nutricional</h2>
                </div>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                  {avaliacoes.nutricional 
                    ? "Você já completou sua avaliação nutricional. Os resultados estão disponíveis na aba Resultados."
                    : "Complete sua avaliação nutricional para receber um plano alimentar personalizado."}
                </p>
                {avaliacoes.nutricional ? (
                  <button 
                    onClick={irParaResultados}
                    className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
                  >
                    Ver Resultados
                    <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                  </button>
                ) : (
                  <Link 
                    to={getNutricionalLink()}
                    className="inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
                  >
                    Iniciar Avaliação
                    <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                  </Link>
                )}
              </div>
              <div className="bg-green-50 px-4 md:px-6 py-3 md:py-4">
                <div className="flex items-center text-green-800 text-xs md:text-sm">
                  <Heart className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  <span className="font-medium">Hábitos alimentares e objetivos nutricionais</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex items-center mb-4 md:mb-6">
              <div className="bg-purple-100 p-2 md:p-3 rounded-full mr-3 md:mr-4">
                <FileText className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">Seus Resultados</h2>
            </div>
            
            {(avaliacoes.fisica || avaliacoes.nutricional) ? (
              <div>
                {carregandoResultados ? (
                  <div className="flex items-center justify-center py-10 md:py-20">
                    <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-purple-500 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:gap-10 lg:grid-cols-2">
                    {/* Avaliação Física */}
                    <div>
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h2 className="text-base md:text-lg font-semibold flex items-center text-gray-800">
                          <ClipboardCheck className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-600" />
                          Avaliação Física
                        </h2>
                        
                        {avaliacoes.fisica && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (!gerandoFisica) {
                                gerarPDF('FISICA');
                              }
                            }}
                            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm"
                            disabled={gerandoFisica}
                          >
                            <Download className="h-3 w-3 md:h-4 md:w-4" />
                            {gerandoFisica ? 'Gerando...' : 'Baixar PDF'}
                          </button>
                        )}
                      </div>

                      <div id="resultado-fisica">
                        {!avaliacoes.fisica ? (
                          <div className="text-center py-4 md:py-6 bg-gray-50 rounded-lg">
                            <p className="text-sm md:text-base text-gray-500">Você ainda não completou a avaliação física.</p>
                          </div>
                        ) : !perfilLiberado ? (
                          <AguardandoResultado />
                        ) : (
                          <div className="space-y-2 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2 md:pr-4 custom-scrollbar bg-white rounded-lg p-4 md:p-6 text-sm md:text-base border border-gray-200 shadow-md">
                            {/* 
                              Exibindo apenas o resultado real da avaliação física.
                              Se não houver resultado, a função renderizarResultado mostrará "Resultado não disponível"
                            */}
                            {renderizarResultado(perfil?.resultado_fisica || '')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Avaliação Nutricional */}
                    <div>
                      <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h2 className="text-base md:text-lg font-semibold flex items-center text-gray-800">
                          <Scale className="h-4 w-4 md:h-5 md:w-5 mr-2 text-green-600" />
                          Avaliação Nutricional
                        </h2>
                        
                        {avaliacoes.nutricional && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (!gerandoNutricional) {
                                gerarPDF('NUTRICIONAL');
                              }
                            }}
                            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs md:text-sm"
                            disabled={gerandoNutricional}
                          >
                            <Download className="h-3 w-3 md:h-4 md:w-4" />
                            {gerandoNutricional ? 'Gerando...' : 'Baixar PDF'}
                          </button>
                        )}
                      </div>
                      
                      <div id="resultado-nutricional">
                        {!avaliacoes.nutricional ? (
                          <div className="text-center py-4 md:py-6 bg-gray-50 rounded-lg">
                            <p className="text-sm md:text-base text-gray-500">Você ainda não completou a avaliação nutricional.</p>
                          </div>
                        ) : !perfilLiberado ? (
                          <AguardandoResultado />
                        ) : (
                          <div className="space-y-2 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-2 md:pr-4 custom-scrollbar bg-white rounded-lg p-4 md:p-6 text-sm md:text-base border border-gray-200 shadow-md">
                            {/* 
                              Exibindo apenas o resultado real da avaliação nutricional.
                              Se não houver resultado, a função renderizarResultado mostrará "Resultado não disponível"
                            */}
                            {renderizarResultado(perfil?.resultado_nutricional || '')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 md:py-8">
                <div className="bg-gray-100 rounded-full p-3 md:p-4 inline-block mb-3 md:mb-4">
                  <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                </div>
                <p className="text-sm md:text-base text-gray-500 mb-2 md:mb-4">Você ainda não completou nenhuma avaliação.</p>
                <p className="text-xs md:text-sm text-gray-600">Complete pelo menos uma avaliação para ver seus resultados.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
