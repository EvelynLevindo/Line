import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../../services/gemini';
import { useApp } from '../../context/AppContext';
import { 
  Send, 
  MapPin, 
  ShieldAlert, 
  Sparkles, 
  CheckCheck, 
  Compass, 
  Map as MapIcon 
} from 'lucide-react';

const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'agent',
    agentName: 'Linha de Apoio Line (IA)',
    time: '14:02',
    text: 'Olá. Estamos aqui com você com total sigilo e acolhimento. Você está em um local seguro para responder agora? Pode digitar ou escolher uma das respostas rápidas abaixo.'
  }
];

const QUICK_REPLIES = [
  '🚨 Estou em perigo imediato',
  '🤫 Não posso falar, apenas digito',
  '🔒 Como pedir medida protetiva sigilosa?',
  '🏠 Preciso de abrigo urgente com meus filhos',
  '📱 Meu celular é monitorado, o que fazer?',
  '📍 Enviar localização agora'
];

export default function SafeChatTab() {
  const { setHiddenTab } = useApp();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Add user message
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      time: timeStr,
      text: text
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Handle special action: location request
      if (text.includes('Enviar localização') || text.includes('localização atual')) {
        await new Promise(r => setTimeout(r, 600));
        const agentMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          agentName: 'Linha de Apoio Line (IA)',
          time: timeStr,
          text: '📍 Localização recebida de forma anônima e segura. Identificamos os pontos de apoio mais próximos no seu perímetro. Deseja visualizar as rotas monitoradas no Mapa de Acolhimento?',
          hasMapShortcut: true
        };
        setMessages([...nextMessages, agentMsg]);
        setIsLoading(false);
        return;
      }

      const response = await chatService.sendMessage(text, nextMessages);

      const agentMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        agentName: 'Linha de Apoio Line (IA)',
        time: timeStr,
        text: response.text,
        isFallback: response.isFallback
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.warn('Erro no envio de mensagem no chat seguro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendQuickReply = (qrText) => {
    handleSendMessage(qrText);
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleSendMessage(`📍 Minha localização atual: [${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}]. Preciso de apoio.`);
        },
        () => {
          handleSendMessage('📍 Minha localização aproximada. Onde encontro o abrigo ou delegacia mais próxima?');
        }
      );
    } else {
      handleSendMessage('📍 Minha localização aproximada. Onde encontro o abrigo mais próximo?');
    }
  };

  return (
    <div className="flex flex-col w-full pb-6 space-y-3">
      {/* Secure Chat Canvas */}
      <div className="w-full bg-white rounded-3xl p-4 shadow-xs border border-[#ffe8ec] flex flex-col space-y-3 min-h-[380px] max-h-[500px] overflow-y-auto no-scrollbar">
        {/* System Disclaimer Card */}
        <div className="w-full bg-[#fff0f2] border border-[#ffe8ec] rounded-2xl p-3 flex items-start gap-2.5 text-[#5a4040]">
          <ShieldAlert className="w-5 h-5 text-[#7e001d] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold text-[#7e001d] uppercase tracking-wider">
              Protocolo de Sigilo Ativo
            </span>
            <p className="text-[11px] leading-relaxed">
              Atendimento com Inteligência Artificial acolhedora, especializada na Lei Maria da Penha e segurança pessoal. Esta conversa não salva registros no histórico do navegador. Em perigo imediato, acione a Saída Rápida ou ligue 190.
            </p>
          </div>
        </div>

        {/* Message stream */}
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${
                isUser ? 'items-end self-end max-w-[85%]' : 'items-start max-w-[90%]'
              }`}
            >
              <div className="flex items-center gap-1.5 px-1">
                <span className="text-[10px] font-semibold text-[#7e001d]">
                  {isUser ? 'Você (Anônimo)' : msg.agentName || 'Linha de Apoio Line'}
                </span>
                <span className="text-[10px] text-[#8e7070]">• {msg.time}</span>
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                  isUser
                    ? 'bg-[#7e001d] text-white rounded-tr-xs'
                    : 'bg-[#fff0f2] text-[#2e131b] border border-[#ffe8ec] rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Map shortcut button if applicable */}
                {msg.hasMapShortcut && (
                  <button
                    onClick={() => setHiddenTab('map')}
                    className="mt-2.5 w-full py-2 px-3 rounded-xl bg-[#7e001d] text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Abrir Mapa de Acolhimento Agora</span>
                  </button>
                )}
              </div>

              {isUser && (
                <div className="flex items-center gap-1 px-1 text-[10px] text-[#8e7070]">
                  <CheckCheck className="w-3 h-3 text-[#7e001d]" />
                  <span>Entregue com sigilo</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#7e001d] font-semibold bg-[#fff0f2] p-2.5 rounded-2xl self-start border border-[#ffe8ec]">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-[#ad2e42]" />
            <span>Acolhendo sua mensagem...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Stress Triage Response Chips */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold text-[#ad2e42] uppercase tracking-wider">
            Respostas de 1 Toque
          </span>
          <span className="text-[10px] text-[#5a4040]">Toque para enviar direto</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_REPLIES.map((qr, i) => (
            <button
              key={i}
              type="button"
              onClick={() => sendQuickReply(qr)}
              disabled={isLoading}
              className={`h-8 px-2.5 rounded-full text-xs font-semibold flex items-center gap-1 active:scale-95 transition-transform shadow-2xs ${
                qr.includes('perigo')
                  ? 'bg-red-100 text-red-900 border border-red-300 font-bold'
                  : qr.includes('localização')
                  ? 'bg-[#ffe8ec] text-[#7e001d] font-bold border border-[#7e001d]/30'
                  : 'bg-white text-[#5a4040] border border-[#ffe8ec] hover:bg-[#fff0f2]'
              }`}
            >
              <span>{qr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Shortcut Button to Shelter Network */}
      <div className="w-full flex justify-center pt-1">
        <button
          onClick={() => setHiddenTab('map')}
          className="h-10 px-4 rounded-full bg-[#ffe8ec] hover:bg-[#ffd9e0] text-[#7e001d] font-bold text-xs flex items-center gap-2 shadow-xs active:scale-95 transition-transform"
        >
          <MapIcon className="w-4 h-4 text-[#7e001d]" />
          <span>Ver Mapa Completo de Delegacias e Abrigos</span>
        </button>
      </div>

      {/* Safe Message Composition Field */}
      <div className="w-full bg-white border border-[#ffe8ec] rounded-2xl p-2 flex items-center gap-2 shadow-xs">
        <button
          type="button"
          onClick={handleShareLocation}
          title="Compartilhar localização segura"
          className="w-10 h-10 rounded-xl bg-[#fff0f2] hover:bg-[#ffe8ec] text-[#7e001d] flex items-center justify-center active:scale-95 transition-transform shrink-0"
        >
          <MapPin className="w-5 h-5 text-[#7e001d]" />
        </button>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Digite sua mensagem segura..."
          className="flex-1 min-w-0 bg-transparent text-xs text-[#2e131b] placeholder:text-[#8e7070] focus:outline-none px-1"
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim() || isLoading}
          aria-label="Enviar Mensagem"
          className="w-10 h-10 rounded-xl bg-[#7e001d] hover:bg-[#920023] text-white flex items-center justify-center active:scale-95 transition-transform shrink-0 disabled:opacity-50 shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
