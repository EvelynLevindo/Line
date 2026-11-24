// Posts comunitários iniciais realistas e acolhedores
// Persistência em localStorage gerenciada pelo storage service

export const INITIAL_FORUM_POSTS = [
  {
    id: 'post-1',
    author: 'Girassol_24',
    avatarColor: 'bg-amber-100 text-amber-700',
    timestamp: 'Há 2 horas',
    tag: 'Vitória & Superação',
    tagColor: 'bg-emerald-100 text-emerald-800',
    title: 'Consegui a medida protetiva hoje de manhã!',
    content: 'Meninas, eu passei meses com medo de ir até a DEAM achando que ninguém acreditaria em mim por não ter marcas físicas (era violência psicológica e financeira diária). A delegada e a assistente social da Sala Lilás me acolheram com um carinho que me fez chorar de alívio. O juiz concedeu a medida em menos de 18 horas e ele teve que desocupar a casa. Para quem está com medo: vocês não estão sozinhas. Há leis e pessoas boas dispostas a lutar com a gente.',
    likes: 42,
    likedByUser: false,
    reported: false,
    comments: [
      {
        id: 'c-101',
        author: 'Orquídea_88',
        timestamp: 'Há 1 hora',
        text: 'Que notícia maravilhosa! Me deu até um arrepio de emoção. Estou juntando forças para dar esse mesmo passo.'
      },
      {
        id: 'c-102',
        author: 'FlorDeLótus_12',
        timestamp: 'Há 45 min',
        text: 'Parabéns pela coragem! Mantenha a cópia da medida protetiva sempre na bolsa e no celular em formato PDF seguro.'
      }
    ]
  },
  {
    id: 'post-2',
    author: 'LírioBranco_33',
    avatarColor: 'bg-rose-100 text-rose-700',
    timestamp: 'Há 5 horas',
    tag: 'Plano de Segurança',
    tagColor: 'bg-blue-100 text-blue-800',
    title: 'Dica prática: Pasta de emergência na nuvem e com amiga',
    content: 'Se você está planejando sair de casa, guarde fotos de: certidão de nascimento dos filhos, carteira de vacinação, comprovantes de renda/bancários e RG. Envie para o e-mail de uma amiga de muita confiança ou crie um drive secreto cujo acesso você só faça em janela anônima. Ter os documentos em mãos agiliza a matrícula escolar das crianças e o pedido de alimentos no mesmo dia.',
    likes: 38,
    likedByUser: false,
    reported: false,
    comments: [
      {
        id: 'c-201',
        author: 'Margarida_09',
        timestamp: 'Há 3 horas',
        text: 'Fiz exatamente isso! E deixei uma bolsa pequena escondida na casa da minha tia com duas mudas de roupa e remédios básicos.'
      }
    ]
  },
  {
    id: 'post-3',
    author: 'EstrelaGuia_19',
    avatarColor: 'bg-purple-100 text-purple-700',
    timestamp: 'Há 1 dia',
    tag: 'Apoio Psicológico',
    tagColor: 'bg-purple-100 text-purple-800',
    title: 'A culpa que você sente não é sua',
    content: 'Precisei ouvir isso dezenas de vezes até internalizar: as explosões, os gritos e as ameaças não foram causados por você "ter falado errado" ou "não ter feito o jantar no horário". O agressor manipula nossa mente para acharmos que somos culpadas pela violência que sofremos. O nome disso é gaslighting. Você merece paz, dignidade e respeito todos os dias da sua vida.',
    likes: 85,
    likedByUser: false,
    reported: false,
    comments: [
      {
        id: 'c-301',
        author: 'Esperança_77',
        timestamp: 'Há 18 horas',
        text: 'Lendo isso aos prantos... eu precisava tanto dessa palavra hoje. Obrigada por existir esse espaço seguro.'
      }
    ]
  },
  {
    id: 'post-4',
    author: 'BrisaLeve_55',
    avatarColor: 'bg-teal-100 text-teal-700',
    timestamp: 'Há 2 dias',
    tag: 'Dúvida Jurídica',
    tagColor: 'bg-amber-100 text-amber-800',
    title: 'Ele ameaça tirar a guarda dos meus filhos se eu sair. Isso é verdade?',
    content: 'Queria esclarecer para todas: agressores SEMPRE usam essa ameaça para manter a mulher em cárcere emocional. O Código Civil e a Lei Maria da Penha determinam que o genitor que comete violência contra a mãe NÃO tem preferência e a guarda unilateral ou proteção prioritária fica com a vítima. Não acreditem nas chantagens jurídicas deles. A Defensoria Pública defende a gente gratuitamente.',
    likes: 64,
    likedByUser: false,
    reported: false,
    comments: [
      {
        id: 'c-401',
        author: 'AdvogadaVoluntaria_SP',
        timestamp: 'Há 1 dia',
        text: 'Correto! Além disso, a Lei 14.713/2023 proíbe a concessão de guarda compartilhada em caso de violência doméstica ou risco iminente.'
      }
    ]
  }
];

export const RANDOM_ANONYMOUS_NICKNAMES = [
  'Girassol_24', 'LírioBranco_33', 'EstrelaGuia_19', 'Orquídea_88', 
  'FlorDeLótus_12', 'Margarida_09', 'Esperança_77', 'BrisaLeve_55', 
  'Violeta_91', 'Aurora_42', 'IpêRosa_14', 'ClaraLuz_63', 'Ametista_28'
];
