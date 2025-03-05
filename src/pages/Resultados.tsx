import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ClipboardCheck, Scale, ArrowLeft, Loader2, Download, Clock, Sun, Moon } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

// Adicione estas classes ao seu arquivo de estilos globais ou como uma constante
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
  const [isDarkMode, setIsDarkMode] = useState(true); // ou integre com seu sistema de tema
  const theme = isDarkMode ? themeStyles.dark : themeStyles.light;
  
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
    <div className="flex flex-col items-center justify-center py-10">
      <div className="bg-gradient-brand p-4 rounded-full mb-4 shadow-glow-blue">
        <Clock className="h-8 w-8 text-white animate-pulse" />
      </div>
      <h3 className="text-xl font-medium text-brand-blue mb-2 text-center">Resultados em processamento</h3>
      <p className="text-gray-100 text-center max-w-md mb-6">
        Seus resultados estão sendo analisados pela nossa equipe. 
        Em breve você poderá visualizar e baixar o relatório completo.
      </p>
      <Button
        variant="secondary"
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-5 w-5" />
        Voltar ao Dashboard
      </Button>
    </div>
  );

  // Função para renderizar o conteúdo do resultado com formatação adequada
  const renderizarResultado = (conteudo: string | null) => {
    if (!conteudo) {
      return (
        <div className="text-center text-white italic font-medium p-4 bg-gray-800 rounded-lg">
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
      
      // Verifica se é um título
      const ehTitulo = paragrafo.length < 50 && 
                       paragrafo === paragrafo.toUpperCase() && 
                       paragrafo.trim().length > 0;
      
      if (ehTitulo) {
        if (contemMes) {
          return (
            <h3 
              key={index} 
              className="text-lg font-bold py-3 px-4 my-3 bg-yellow-500 text-black rounded-md shadow-md border-2 border-yellow-400"
            >
              {paragrafo}
            </h3>
          );
        }
        
        return (
          <h3 
            key={index} 
            className="text-lg font-bold pb-2 pt-4 text-white border-b-2 border-white/70"
          >
            {paragrafo}
          </h3>
        );
      }
      
      // Verifica se é um item numerado (começa com número seguido de traço ou ponto)
      const ehItemNumerado = /^\d+[\s]*[-\.]\s+/.test(paragrafo);
      
      if (ehItemNumerado) {
        return (
          <p 
            key={index} 
            className="text-white leading-relaxed font-semibold pl-3 border-l-4 border-blue-500 py-2 my-2 bg-blue-800/60 rounded-r-md px-3 shadow-sm"
          >
            {paragrafo}
          </p>
        );
      }
      
      return (
        <p 
          key={index} 
          className={contemMes 
            ? 'bg-yellow-500 text-black px-4 py-3 rounded-md shadow-md font-semibold my-3 border-2 border-yellow-400' 
            : 'text-white leading-relaxed py-1 my-1 font-medium'}
        >
          {paragrafo}
        </p>
      );
    });
  };

  return (
    <Layout>
      <div className="mb-8 flex items-center">
        <Button
          variant="secondary"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </Button>
      </div>
      
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">
              Resultados da Avaliação
            </h1>
            <p className="text-brand-blue">
              {perfil?.nome ? `Resultados para ${perfil.nome}` : 'Carregando dados...'}
            </p>
          </div>
          
          {!perfilLiberado && (
            <div className="flex items-center mt-4 md:mt-0 px-4 py-3 bg-amber-600/40 border-amber-500/70 rounded-lg border shadow-md">
              <Clock className="h-5 w-5 mr-2 text-amber-200" />
              <span className="text-amber-100 font-medium">
                Aguardando liberação dos resultados
              </span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center text-white bg-brand-blue/20 px-4 py-2 rounded-lg">
                <ClipboardCheck className="h-5 w-5 mr-2 text-brand-blue" />
                Avaliação Física
              </h2>
              
              {perfilLiberado && perfil?.resultado_fisica && (
                <div data-button-id="download-fisica" className="relative">
                  <Button
                    onClick={() => {
                      if (!gerandoFisica) {
                        gerarPDF('FISICA');
                      }
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    disabled={gerandoFisica}
                  >
                    <Download className="h-5 w-5" />
                    {gerandoFisica ? 'Gerando PDF...' : 'Baixar PDF'}
                  </Button>
                </div>
              )}
            </div>
            
            <div id="resultado-fisica">
              {!perfilLiberado ? (
                <AguardandoResultado />
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-xl">
                  {renderizarResultado(perfil?.resultado_fisica || null)}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center text-white bg-brand-blue/20 px-4 py-2 rounded-lg">
                <Scale className="h-5 w-5 mr-2 text-brand-blue" />
                Avaliação Nutricional
              </h2>
              
              {perfilLiberado && perfil?.resultado_nutricional && (
                <div data-button-id="download-nutricional" className="relative">
                  <Button
                    onClick={() => {
                      if (!gerandoNutricional) {
                        gerarPDF('NUTRICIONAL');
                      }
                    }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    disabled={gerandoNutricional}
                  >
                    <Download className="h-5 w-5" />
                    {gerandoNutricional ? 'Gerando PDF...' : 'Baixar PDF'}
                  </Button>
                </div>
              )}
            </div>
            
            <div id="resultado-nutricional">
              {!perfilLiberado ? (
                <AguardandoResultado />
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar bg-gray-800 rounded-lg p-6 border-2 border-blue-500/30 shadow-xl">
                  {renderizarResultado(perfil?.resultado_nutricional || null)}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Layout>
  );
} 