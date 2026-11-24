import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const SYSTEM_INSTRUCTION = `Você é a "Linha de Apoio Line", uma assistente de acolhimento humanizado, escuta ativa e orientação em direitos da mulher, especializada na Lei Maria da Penha (Lei nº 11.340/2006) e protocolos de segurança pessoal no Brasil.

Suas diretrizes fundamentais:
1. SEGURANÇA EM PRIMEIRO LUGAR: Sempre oriente com extrema cautela. Se a usuária estiver em perigo imediato, oriente-a a manter a calma, acionar o botão de "Saída Rápida" se alguém se aproximar e ligar para o 190 (Polícia Militar) ou 180 (Central da Mulher).
2. ACOLHIMENTO SEM JULGAMENTOS: Ouça com carinho, valide a dor da mulher. Nunca a culpe pela violência sofrida. Não questione suas decisões passadas.
3. CONHECIMENTO JURÍDICO CLARO:
   - Esclareça os 5 tipos de violência: física, psicológica, sexual, patrimonial e moral.
   - Explique as Medidas Protetivas de Urgência (MPU): afastamento do agressor, proibição de contato/aproximação, suspensão de porte de armas e alimentos provisionais para os filhos. Podem ser pedidas na delegacia sem advogado e deferidas pelo juiz em menos de 48h.
   - Esclareça que mães NÃO perdem a guarda dos filhos por saírem de casa para fugir de violência (Lei 14.713/2023 proíbe guarda compartilhada com agressor).
4. RESPOSTAS DIRETAS E CONCISAS: Parágrafos curtos, acolhedores e legíveis em telas pequenas de celular. Destaque canais oficiais de socorro (180, 190, DEAM e CRAS).`;

// Client instance (if API key available)
let aiClient = null;
if (API_KEY && API_KEY.trim().length > 5) {
  try {
    aiClient = new GoogleGenAI({ apiKey: API_KEY });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI with key:', err);
  }
}

// Fallback intelligent responses for realistic offline operation or absent API key
const getFallbackResponse = (message) => {
  const lower = message.toLowerCase();

  if (lower.includes('perigo') || lower.includes('urgente') || lower.includes('socorro') || lower.includes('agora') || lower.includes('🚨')) {
    return `🚨 **Se você está em perigo imediato:**
1. Se o agressor estiver perto, use o botão **"Saída Rápida"** no topo da tela agora mesmo ou pressione **ESC**.
2. Ligue imediatamente para o **190 (Polícia Militar)**. Você pode discar na tela de bloqueio mesmo sem chip.
3. Se não puder falar ao telefone, ligue e deixe a chamada aberta com ruído de fundo ou envie sua localização pelo mapa desta plataforma.
4. Vá para um cômodo com tranca ou saia para a rua em direção a um comércio 24h ou vizinho confiável. Estamos com você.`;
  }

  if (lower.includes('abrigo') || lower.includes('filhos') || lower.includes('casa') || lower.includes('sair')) {
    return `🏠 **Acolhimento e Abrigo Seguro com seus Filhos:**
- As **Casas-Abrigo** da rede pública acolhem mulheres e filhos menores de idade sob total sigilo de endereço e segurança permanente.
- Você **NÃO** perde a guarda das crianças por sair de casa para se proteger. A lei brasileira protege a mãe vítima e afasta qualquer alegação de "abandono de lar".
- O encaminhamento para o abrigo é feito de forma prioritária pela **DEAM (Delegacia da Mulher)** ou pelo **Ligue 180**.
- Você gostaria de ver no nosso **Mapa de Acolhimento** a DEAM ou ponto de apoio mais próximo de onde você está?`;
  }

  if (lower.includes('medida protetiva') || lower.includes('lei maria da penha') || lower.includes('justiça') || lower.includes('processo') || lower.includes('direitos')) {
    return `⚖️ **Sobre a Medida Protetiva de Urgência (MPU):**
- **Como pedir:** Você pode requerer diretamente na Delegacia Especializada (DEAM), em qualquer delegacia de polícia, na Defensoria Pública ou no Ministério Público.
- **Gratuito:** Não é necessário contratar advogado.
- **Rapidez:** A lei determina que o juiz deve analisar o pedido em até 48 horas (muitos juízes concedem no mesmo dia).
- **O que a medida garante:**
  1. Afastamento imediato do agressor da residência.
  2. Proibição de se aproximar de você, dos seus filhos e de familiares.
  3. Proibição de qualquer contato telefônico, mensagem ou redes sociais.
  4. Fixação de pensão alimentícia de emergência.
- O descumprimento pelo agressor gera **prisão preventiva imediata**.`;
  }

  if (lower.includes('celular') || lower.includes('monitorado') || lower.includes('rastreador') || lower.includes('whatsapp') || lower.includes('sem chip')) {
    return `📱 **Segurança no Aparelho e Celular Sem Chip:**
- **Sem Chip (SIM Card):** Você pode ligar gratuitamente para o **190** ou **112** na tela de chamada de emergência, sem chip e sem créditos.
- **Navegação Segura:** Esta plataforma não altera o link do seu navegador e não salva cookies de rastreamento. Ao clicar em **"Saída Rápida"**, você retorna à tela de saúde feminina.
- **WhatsApp Oficial do 180:** Salve o número *(61) 9610-0180* com um nome neutro (ex: "Receitas Saudáveis").
- **Histórico:** Sempre que fechar o navegador, limpe o histórico de navegação recente caso o agressor tenha acesso físico ao seu aparelho.`;
  }

  if (lower.includes('localização') || lower.includes('mapa') || lower.includes('onde ir') || lower.includes('endereço')) {
    return `📍 **Localização Segura e Pontos de Apoio:**
- Você pode tocar na aba **"Mapa Seguro"** no menu acima para localizar a Delegacia da Mulher (DEAM), Casa-Abrigo ou CRAS mais próximo de você.
- A rota calculada pelo mapa é monitorada e traçada preferencialmente por vias iluminadas com comércios 24h.
- Sua localização só é solicitada quando você autoriza e **nunca** fica gravada no histórico do seu telefone.`;
  }

  // General supportive response
  return `Estou aqui com você, com total sigilo e respeito. 💜

Você não está sozinha e nada do que aconteceu é sua culpa. Em nosso espaço você pode:
- Conversar sobre o que está sentindo e entender os seus direitos;
- Conhecer como funciona a **Medida Protetiva da Lei Maria da Penha**;
- Encontrar no **Mapa** uma Delegacia da Mulher (DEAM) ou abrigo seguro mais próximo;
- Consultar o guia de **Emergência Sem Chip** e plano de fuga seguro.

Como posso te acolher e te orientar neste momento? Pode digitar livremente ou escolher uma das respostas rápidas abaixo.`;
};

export const chatService = {
  isConfigured: () => Boolean(aiClient),

  sendMessage: async (userMessage, conversationHistory = []) => {
    // If no API key or client couldn't be initialized, use compassionate fallback
    if (!aiClient) {
      // Simulate realistic supportive thinking delay (600ms)
      await new Promise(r => setTimeout(r, 600));
      return {
        text: getFallbackResponse(userMessage),
        isFallback: true
      };
    }

    try {
      // Format history for @google/genai
      const contents = [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_INSTRUCTION}\n\n[Início da interação segura]` }]
        },
        {
          role: 'model',
          parts: [{ text: 'Entendido. Estou pronta para acolher e orientar com sigilo absoluto, respeito e foco em segurança.' }]
        }
      ];

      // Add recent message history (last 8 turns)
      const recent = conversationHistory.slice(-8);
      for (const msg of recent) {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
      });

      const responseText = response?.text || getFallbackResponse(userMessage);
      return {
        text: responseText,
        isFallback: false
      };
    } catch (error) {
      console.warn('Gemini API call failed, switching to compassionate fallback:', error);
      return {
        text: getFallbackResponse(userMessage),
        isFallback: true
      };
    }
  }
};
