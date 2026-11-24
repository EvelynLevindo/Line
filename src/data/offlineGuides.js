// Guia prático para situações de emergência sem chip (SIM Card), celular sem créditos, plano de fuga e comunicação sigilosa

export const NO_SIM_EMERGENCY_GUIDE = {
  directNumbers: [
    {
      number: '180',
      label: 'Central de Atendimento à Mulher',
      desc: 'Orientação especializada, denúncias anônimas, acolhimento humanizado e acionamento de rede.',
      badge: 'Gratuito · 24h',
      color: 'bg-primary text-on-primary'
    },
    {
      number: '190',
      label: 'Polícia Militar (Emergência Imediata)',
      desc: 'Flagrante delito, socorro urgente e intervenção de viatura no local.',
      badge: 'Gratuito · 24h',
      color: 'bg-red-700 text-white'
    },
    {
      number: '192',
      label: 'SAMU (Socorro Médico)',
      desc: 'Atendimento pré-hospitalar para lesões, fraturas, intoxicações e traumas.',
      badge: 'Gratuito · 24h',
      color: 'bg-amber-700 text-white'
    },
    {
      number: '193',
      label: 'Corpo de Bombeiros',
      desc: 'Resgate, rompimento de cárcere privado ou incêndio.',
      badge: 'Gratuito · 24h',
      color: 'bg-orange-700 text-white'
    }
  ],

  howNoSimWorks: {
    title: 'Como ligar sem chip ou sem saldo (Direito GSM/Anatel)',
    summary: 'Mesmo que o agressor tenha retirado seu chip (SIM card), bloqueado sua linha ou você não tenha créditos:',
    steps: [
      {
        title: 'Chamadas de Emergência não exigem chip',
        text: 'Qualquer celular GSM vendido no Brasil conecta-se automaticamente à torre de sinal de QUALQUER operadora próxima (Claro, Vivo, TIM) exclusivamente para chamadas de emergência (190, 112, 911).'
      },
      {
        title: 'Como discar na tela de bloqueio',
        text: 'Na tela de bloqueio com senha ou PIN, toque no botão "Emergência" (ou Emergency Call). Digite 190 ou 180 e pressione chamar. A chamada é completada sem desbloquear o aparelho.'
      },
      {
        title: '112 e 911 são redirecionados automaticamente',
        text: 'Se o sistema do aparelho rejeitar o 190 sem chip, digite 112 ou 911 (padrões internacionais de emergência aceitos por todas as antenas móveis no território nacional, que repassam direto à PM).'
      }
    ]
  },

  wifiAndSilentOptions: {
    title: 'Acionamento silencioso via Wi-Fi',
    summary: 'Se você estiver conectada à rede Wi-Fi da casa ou do vizinho e não puder falar:',
    tips: [
      {
        title: 'Chat Discreto da Plataforma (Line)',
        text: 'Use nosso Chat de Apoio ou acione as Respostas de 1 Toque. O tráfego não gera cobrança telefônica nem aparece na fatura do plano.'
      },
      {
        title: 'WhatsApp Oficial do Ligue 180',
        text: 'Adicione aos contatos com um nome discreto (ex: "Clínica Dra. Mariana") o número (61) 9610-0180. O atendimento é feito por assistentes humanas em ambiente seguro.'
      },
      {
        title: 'E-mail de Emergência Silencioso',
        text: 'Tenha rascunhado um e-mail com sua localização e envie para a central ou pessoa de extrema confiança (ex: "Preciso de ajuda urgente neste endereço").'
      }
    ]
  },

  escapePlan: {
    title: 'Plano de Fuga Seguro (Checklist Prático)',
    warning: 'Execute a saída apenas em momento de distração ou ausência do agressor, ou com apoio policial.',
    items: [
      {
        category: 'Documentos Essenciais',
        desc: 'RG, CPF, Certidão de Casamento/Nascimento dos filhos, Carteira de Vacinação, Cartão SUS e comprovante de endereço.'
      },
      {
        category: 'Recursos Financeiros',
        desc: 'Guarde pequenas quantias em dinheiro vivo em local secreto, ou cartão bancário próprio não compartilhado.'
      },
      {
        category: 'Palavra-Chave de Emergência',
        desc: 'Combine uma palavra neutra com uma amiga ou vizinha (ex: "Esqueci a receita do bolo"). Ao receber essa mensagem, a pessoa saberá que deve chamar a polícia para o seu endereço imediatamente.'
      },
      {
        category: 'Ponto de Encontro Seguro',
        desc: 'Defina com antecedência para onde você irá: delegacia mais próxima, farmácia 24h movimentada, casa de parente de confiança ou DEAM.'
      },
      {
        category: 'Aparelho e Histórico',
        desc: 'Antes de sair ou ao perceber aproximação suspeita, clique no botão "Saída Rápida" no topo desta tela para fechar o portal sem deixar histórico no navegador.'
      }
    ]
  }
};
