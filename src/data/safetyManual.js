// Anuário de Segurança e Direitos da Mulher (Offline-First)
// Dados consolidados do Fórum Brasileiro de Segurança Pública, CNJ e Lei Maria da Penha (Lei nº 11.340/2006)

export const SAFETY_MANUAL = {
  stats: [
    {
      metric: '29 Milhões',
      label: 'de mulheres relataram ter sofrido algum tipo de violência no Brasil nos últimos 12 meses.',
      source: 'DataSenado / FBSP'
    },
    {
      metric: '93% dos Casos',
      label: 'permanecem na subnotificação, com vítimas sem registro formal por medo, dependência ou falta de canais discretos.',
      source: 'Fórum Brasileiro de Segurança Pública'
    },
    {
      metric: '18 Horas',
      label: 'prazo médio para apreciação judicial de Medidas Protetivas de Urgência solicitadas via delegacia.',
      source: 'Conselho Nacional de Justiça (CNJ)'
    },
    {
      metric: 'Disque 180',
      label: 'ligação 100% gratuita, anônima, disponível 24h em todo o território nacional, com WhatsApp oficial.',
      source: 'Ministério das Mulheres'
    }
  ],

  violenceTypes: [
    {
      id: 'fisica',
      title: '1. Violência Física',
      badge: 'Art. 7º, I da Lei 11.340',
      icon: 'shield_alert',
      description: 'Qualquer conduta que ofenda a integridade ou a saúde corporal da mulher.',
      examples: [
        'Bater, socar, chutar, empurrar ou puxar o cabelo',
        'Apertar o pescoço (sufocamento / esganadura)',
        'Arremessar objetos em direção à vítima',
        'Queimar, cortar ou ferir com objetos cortantes ou armas',
        'Prender a mulher em cômodos ou impedir que busque atendimento médico'
      ]
    },
    {
      id: 'psicologica',
      title: '2. Violência Psicológica',
      badge: 'Art. 7º, II da Lei 11.340',
      icon: 'psychology',
      description: 'Conduta que cause dano emocional, diminuição da autoestima, perturbe o pleno desenvolvimento ou vise degradar/controlar suas ações e crenças.',
      examples: [
        'Ameaças constantes ("se você me deixar, acabo com você")',
        'Humilhações públicas ou ofensas diárias',
        'Isolamento de amigos, colegas de trabalho e familiares',
        'Vigilância constante (checar mensagens no celular sem consentimento, rastrear passos)',
        'Gaslighting (distorcer fatos para fazer a mulher achar que está "louca")',
        'Proibir de trabalhar, estudar ou sair de casa'
      ]
    },
    {
      id: 'sexual',
      title: '3. Violência Sexual',
      badge: 'Art. 7º, III da Lei 11.340',
      icon: 'heart_broken',
      description: 'Qualquer conduta que a constranja a presenciar, a manter ou a participar de relação sexual não desejada.',
      examples: [
        'Forçar ato sexual mediante intimidação, ameaça, coação ou uso da força (estupro marital)',
        'Obrigar a praticar atos sexuais que causem repulsa ou desconforto',
        'Impedir o uso de métodos contraceptivos (pílula, camisinha) ou forçar a gravidez',
        'Forçar o aborto contra a vontade da mulher',
        'Limitar ou anular o exercício dos direitos sexuais e reprodutivos'
      ]
    },
    {
      id: 'patrimonial',
      title: '4. Violência Patrimonial',
      badge: 'Art. 7º, IV da Lei 11.340',
      icon: 'account_balance_wallet',
      description: 'Conduta que configure retenção, subtração, destruição parcial ou total de seus objetos, instrumentos de trabalho, documentos e bens.',
      examples: [
        'Destruir celular, computador ou roupas da vítima de propósito',
        'Reter carteira de trabalho, RG, CPF ou cartões bancários',
        'Controlar todo o salário da mulher sem prestar contas ou tirar seu dinheiro',
        'Vender bens do casal sem autorização',
        'Deixar de pagar pensão alimentícia de forma deliberada como vingança'
      ]
    },
    {
      id: 'moral',
      title: '5. Violência Moral',
      badge: 'Art. 7º, V da Lei 11.340',
      icon: 'record_voice_over',
      description: 'Qualquer conduta que configure calúnia, difamação ou injúria contra a honra da mulher.',
      examples: [
        'Calúnia: afirmar falsamente que a mulher cometeu um crime',
        'Difamação: espalhar mentiras para manchar sua reputação perante parentes, vizinhos ou colegas de trabalho',
        'Injúria: xingar, ofender a dignidade com adjetivos pejorativos e misóginos',
        'Divulgar fotos ou vídeos íntimos sem consentimento (Revenge Porn)'
      ]
    }
  ],

  rightsAndProtections: [
    {
      title: 'Medidas Protetivas de Urgência (MPU)',
      highlight: 'Não precisa de advogado para pedir',
      items: [
        'Afastamento imediato do agressor do lar ou local de convivência.',
        'Proibição de aproximação da vítima, familiares e testemunhas (limite mínimo em metros).',
        'Proibição de qualquer contato (chamada, WhatsApp, recado por terceiros, redes sociais).',
        'Suspensão imediata da posse ou porte de arma de fogo do agressor.',
        'Fixação de alimentos provisionais (pensão de emergência para sustento dos filhos).'
      ]
    },
    {
      title: 'Proteção ao Trabalho e Moradia',
      highlight: 'Garantias trabalhistas e sociais',
      items: [
        'Manutenção do vínculo trabalhista por até 6 meses com afastamento do local de trabalho (quando necessário).',
        'Prioridade na matrícula dos dependentes em escola mais próxima do novo domicílio ou abrigo.',
        'Acesso prioritário a programas habitacionais (Minha Casa Minha Vida) e auxílio-aluguel municipal.',
        'Inclusão prioritária no Bolsa Família ou auxílios sociais de emergência.'
      ]
    }
  ],

  reportingStepByStep: [
    {
      step: '1',
      title: 'Em Risco Imediato: Ligue 190',
      action: 'A Polícia Militar deve intervir em flagrante delito para proteger sua integridade física e retirar o agressor da residência.',
      tip: 'Se não puder falar, deixe a ligação aberta emitindo ruído ou use o chat silencioso da plataforma.'
    },
    {
      step: '2',
      title: 'Registro de Boletim de Ocorrência (B.O.)',
      action: 'Dirija-se a uma DEAM (Delegacia Especializada) ou delegacia comum mais próxima. Em muitos estados (como SP, RJ, RS, MG) o B.O. pode ser feito pela Delegacia Eletrônica da Mulher.',
      tip: 'Leve prints de conversas, áudios, fotos de lesões ou nomes de testemunhas. Não lave o corpo caso tenha sofrido violência física/sexual recente.'
    },
    {
      step: '3',
      title: 'Requerimento de Medida Protetiva',
      action: 'No próprio ato do B.O., solicite à autoridade policial a expedição de Medidas Protetivas de Urgência. O pedido é remetido ao juiz em até 48 horas (frequentemente deferido no mesmo dia).',
      tip: 'Você receberá uma cópia do despacho judicial. Mantenha-a sempre acessível.'
    },
    {
      step: '4',
      title: 'Acompanhamento pela Patrulha Maria da Penha',
      action: 'Guarnições especializadas da PM ou Guarda Civil realizam visitas periódicas à residência e ao local de trabalho da vítima para fiscalizar o cumprimento da medida pelo agressor.',
      tip: 'Qualquer descumprimento por parte dele é CRIME autônomo (Art. 24-A) inafiançável com prisão preventiva imediata.'
    }
  ]
};
