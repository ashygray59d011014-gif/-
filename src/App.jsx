import React, { useState, useEffect, useRef } from 'react';

// --- DATA & INITIAL STATE ---
const NAMED_CHARACTERS = [
  { name: '이기영', age: 25, personality: '용의주도한 전략가', jobs: '연금술사>생체연금소환사>드래곤 알케미스트>빛의 연금술사>희생과 부활의 신', rank: 'SS랭크', imageFile: '이기영-연금술사' },
  { name: '김현성', age: 22, personality: '선의의 중재자', jobs: '검사>검의 좌>노을빛 검성>노을빛 신', rank: 'SS랭크', imageFile: '김현성' },
  { name: '정하얀', age: 21, personality: '순수한 옹호자', jobs: '마법사>원소 마법사>대마법사>마법의 신', rank: 'SS랭크', imageFile: '정하얀-마법사_2' },
  { name: '박덕구', age: 23, personality: '단순무식한 열정가', jobs: '방패병>강철방패병', rank: 'B랭크', imageFile: '박덕구-탱커' },
  { name: '진청', age: 30, personality: '계획적인 전술가', jobs: '군단 마도사', rank: 'S랭크', imageFile: '진청-마도사_3' },
  { name: '이지혜', age: 29, personality: '이기적인 야망가', jobs: '지휘관', rank: 'C랭크', imageFile: '이지혜' },
  { name: '정진호', age: 29, personality: '계산적인 살인자', jobs: '마검사', rank: 'A랭크', imageFile: '정진호' },
  { name: '이상희', age: 33, personality: '이상적인 중재자', jobs: '성스러운 기사', rank: 'B랭크', imageFile: '이상희' },
  { name: '차희라', age: 28, personality: '예측 불가능한 혁신가', jobs: '용병여왕', rank: 'SS랭크', imageFile: '차희라-투사_3' },
  { name: '선희영', age: 32, personality: '이상적인 봉사자', jobs: '태양의 사제', rank: 'A랭크', imageFile: '선희영-사제_3' },
  { name: '김예리', age: 14, personality: '상처받은 도둑', jobs: '궁수', rank: 'C랭크', imageFile: '김예리' },
  { name: '정유라', age: 29, personality: '계산적인 전략가', jobs: '암살도적', rank: 'D랭크', imageFile: '정유라' },
  { name: '황정연', age: 34, personality: '호들갑떠는 낙천주의자', jobs: '마도학자', rank: 'B랭크', imageFile: '황정연' },
  { name: '카스가노 유노', age: 20, personality: '타락한 구도자', jobs: '무녀', rank: 'A랭크', imageFile: '카스가노 유노' },
  { name: '이토 소우타', age: 28, personality: '용의주도한 전략가', jobs: '무사', rank: 'B랭크', imageFile: '이토 소우타' },
  { name: '조혜진', age: 25, personality: '고지식한 원칙주의자', jobs: '창술전문가', rank: 'A랭크', imageFile: '조혜진-창술사' },
  { name: '샤오린', age: 22, personality: '호기심 많은 탐구자', jobs: '채찍기술자', rank: 'B랭크', imageFile: '샤오린' },
  { name: '유아영', age: 21, personality: '소심한 낙천주의자', jobs: '대장장이', rank: 'B랭크', imageFile: '유아영' },
  { name: '김기철', age: 25, personality: '이기적인 낙천주의자', jobs: '전사', rank: 'E랭크', imageFile: '김기철' },
  { name: '알렉산드로', age: 39, personality: '단순무식한 살인자', jobs: '로나프의 싸움꾼', rank: 'A랭크', imageFile: '알렉산드로' },
  { name: '엘레나', age: 231, personality: '호기심 많은 옹호자', jobs: '엘룬의 수호자', rank: 'C랭크', imageFile: '엘레나' },
  { name: '한소라', age: 21, personality: '불안한 이기주의자', jobs: '흑마법사', rank: 'B랭크', imageFile: '한소라-흑마법사' },
  { name: '김창렬', age: 23, personality: '침묵하는 낭만주의자', jobs: '암살자', rank: 'A랭크', imageFile: '김창렬-암살자' },
].map(character => {
  const jobPath = character.jobs.split('>').map(job => job.trim()).filter(Boolean);
  return {
    ...character,
    jobPath,
    jobStage: 0,
    role: jobPath[0],
    image: `./images/${character.imageFile || character.name}.png`,
  };
});

const NAMED_CHARACTER_MAP = Object.fromEntries(NAMED_CHARACTERS.map(character => [character.name, character]));

const createNamedMember = (name, overrides = {}) => {
  const character = NAMED_CHARACTER_MAP[name];
  return {
    ...character,
    jobPath: [...character.jobPath],
    jobStage: 0,
    role: character.jobPath[0],
    level: 1,
    maxLevel: 20,
    status: 'active',
    sanity: 100,
    ...overrides,
  };
};

const hydrateMemberProfile = (member) => {
  const character = NAMED_CHARACTER_MAP[member.name];
  if (!character) {
    const jobPath = Array.isArray(member.jobPath) && member.jobPath.length ? member.jobPath : [member.role || '일반'];
    return {
      ...member,
      age: member.age ?? null,
      personality: member.personality || '평범한 모험가',
      jobPath,
      jobStage: Number.isInteger(member.jobStage) ? member.jobStage : 0,
      role: member.role || jobPath[0],
    };
  }

  const jobPath = [...character.jobPath];
  const savedStage = Number.isInteger(member.jobStage) ? member.jobStage : jobPath.indexOf(member.role);
  const jobStage = Math.max(0, Math.min(savedStage < 0 ? 0 : savedStage, jobPath.length - 1));
  return {
    ...member,
    age: character.age,
    personality: character.personality,
    rank: character.rank,
    image: member.image || character.image,
    jobPath,
    jobStage,
    role: jobPath[jobStage],
  };
};

const INITIAL_GAME_STATE = {
  guild: {
    name: '파란 길드',
    masterGrade: 45,
    gold: 5000,
    support: 42,
    fame: 8,
    exp: 0, 
  },
  members: [
    createNamedMember('이기영', { id: 'm1', sanity: 85 }),
    createNamedMember('정하얀', { id: 'm2', sanity: 42 }),
    createNamedMember('김현성', { id: 'm3', sanity: 0, status: 'locked' }),
    createNamedMember('박덕구', { id: 'm4', sanity: 98 })
  ],
  quests: [
    { id: 'q1', title: '던전 토벌 임무', desc: '심연의 틈새에서 흘러나오는 마기를 정화해야 합니다.', rank: 'S급', successRate: 85, rewards: { gold: 1200, exp: 450, fame: 15 } },
    { id: 'q2', title: '베니고어 교단 방문', desc: '대주교와의 비밀 회담을 위해 호위 기사를 파견하십시오.', rank: 'A급', successRate: 92, rewards: { gold: 800, exp: 300, fame: 10 } },
    { id: 'q3', title: '대륙 보호 위원회 참여', desc: '봉사 활동 임무', rank: 'F급', successRate: 100, rewards: { gold: 100, exp: 50, fame: 5 } },
    { id: 'q4', title: '고블린 소굴 토벌', desc: '외곽 지역에 출몰하는 고블린 무리를 소탕해야 합니다.', rank: 'D급', successRate: 95, rewards: { gold: 200, exp: 100, fame: 5 } },
    { id: 'q5', title: '안개 숲 마수 토벌', desc: '숲을 장악한 거대한 마수들을 쫓아내고 평화를 되찾으세요.', rank: 'C급', successRate: 85, rewards: { gold: 500, exp: 200, fame: 10 } },
    { id: 'q6', title: '대주교의 만찬회 참석', desc: '베니고어 교단 대주교의 만찬회에 참석하여 교류를 다집니다.', rank: 'B급', successRate: 90, rewards: { gold: 800, exp: 300, fame: 20 } },
    { id: 'q7', title: '거울 던전 탐사', desc: '현실과 환상이 교차하는 거울 던전의 심연을 조사하십시오.', rank: 'A급', successRate: 75, rewards: { gold: 1500, exp: 500, fame: 30 } },
    { id: 'q8', title: '악마 소환사 추적', desc: '금지된 흑마법으로 악마를 부리는 이단자를 처단해야 합니다.', rank: 'S급', successRate: 60, rewards: { gold: 3000, exp: 1000, fame: 50 } },
    { id: 'q9', title: '고대 드래곤의 둥지 정찰', desc: '잠든 고대 드래곤의 둥지에 잠입하여 유물을 회수하십시오.', rank: 'SS급', successRate: 40, rewards: { gold: 5000, exp: 2500, fame: 100 } }
  ],
  activeQuests: [], 
  inventory: []
};

const GACHA_POOL = NAMED_CHARACTERS.map(character => ({ ...character, jobPath: [...character.jobPath] }));
const GENERIC_NAMES = ["행인", "모험가", "용병", "마법학도", "초보도적", "마을주민", "떠돌이", "신입창병", "견습사제", "은퇴한기사"];

const CHARACTER_DIALOGUES = {
  "정하얀": [
    {
      text: "\"오, 오빠... 무슨 일이에요? 헤헤.. 오랜만에 피, 피크닉 갈래요?\"",
      choices: [
        { reply: "응, 그러자.", nextText: "\"와아! 정말요? 당장 도시락 싸올게요! 헤헤... 소, 소라야아! 소라가 어디있지...?\"" },
        { reply: "지금은 바빠.", nextText: "\"아... 네... 오빠가 바쁘시면 어쩔 수 없죠... (어딘가 서늘한 미소를 지으며) 기다릴게요...?\"" }
      ]
    },
    {
      text: "\"마, 마법이 좋아요. 마, 마법의 신이 돼서 오빠를 지, 지켜줄거야!\"",
      choices: [
        { reply: "듬직하네.", nextText: "\"헤헤... 오빠한테 칭찬받았다! 더 열심히 할게요!\"" },
        { reply: "너무 무리하진 마.", nextText: "\"우으으으...알, 알았어요 오빠.. (얼굴이 붉어지며) 네, 명심할게요!\"" }
      ]
    }
  ],
  "김현성": [
    {
      text: "\"기영씨? 죄송합니다... 이런 모습을 보여드리다니\"",
      choices: [
        { reply: "괜찮아요.", nextText: "\"이해해 주셔서 감사합니다. 역시 기영씨밖에 없군요.\"" },
        { reply: "무슨 일 있었습니까?", nextText: "\"아닙니다. 그저... 옛날 생각이 조금 났을 뿐입니다.\"" }
      ]
    },
    {
      text: "\"가끔은 겨울 호수에서 낚시라도 어떻습니까?\"",
      choices: [
        { reply: "그럴까요?", nextText: "\"좋습니다. 제가 채비를 전부 준비해 두겠습니다.\"" },
        { reply: "너무 추울 것 같은데...", nextText: "\"하하, 핫팩을 넉넉히 챙기면 꽤 낭만 있습니다. 한 번쯤 경험해 보시죠.\"" }
      ]
    },
     {
      text: "\"저...그, 기영씨? 사업 출자금을 빌려주실 수 있으십니까?\"",
      choices: [
        { reply: "네?", nextText: "\"아니, 아무 것도 아닙니다...\"" },
        { reply: "시바 뭐라고?", nextText: "\"잘, 잘 못 들었습니다?\"" }
      ]
    }
  ],
  "박덕구": [
    {
      text: "\"형님!!! 요즘 많이 바쁘신거 같구만! 거 쉬엄쉬엄 좀 하쇼!\"",
      choices: [
        { reply: "고맙다.", nextText: "\"하하, 형님 건강은 이 덕구가 책임지는 거 아니겠수!\"" },
        { reply: "너나 훈련 열심히 해.", nextText: "\"크흑! 뼈 때리는 말씀! 당장 연병장 열 바퀴 돌고 오겠수다!\"" }
      ]
    },
    {
      text: "\"거...형님! 나는 언제나 형님을 믿고 있다는 거 아니겠소!\"",
      choices: [
        { reply: "고맙다.", nextText: "\"시킬 일 있으면 언제든 말하쇼!\"" },
        { reply: "그래, 알고 있지.", nextText: "\"내가 한다면 하는 사람이라니까!\"" }
      ]
    }
  ],
  "진청": [
    {
      text: "\"젠장... 굳이 면담 따위 할 필요 없다. 호들갑 떨지 마라.\"",
      choices: [
        { reply: "그래도 절차니까요.", nextText: "\"쳇... 귀찮은 놈. 용건이나 빨리 말해라.\"" },
        { reply: "그럼 나가보겠습니다.", nextText: "\"...심심한가 보군. 앉아라. 체스판을 가져오지.\"" }
      ]
    }
  ],
  "차희라": [
    {
      text: "\"자기~ 무슨 일이야? 거슬리는 놈이 있어?\"",
      choices: [
        { reply: "아무 것도 아니야 누나", nextText: "\"흥, 재미없게. 언제든 말만 해. 다 찢어버릴 테니까.\"" },
        { reply: "누나 생각나서 왔지.", nextText: "\"어머~ 우리 자기가 오늘은 웬일로 예쁜 짓을 할까?\"" }
      ]
    }
  ],
  "선희영": [
    {
      text: "\"...봉사를. 처벌을. 숙청을.\"",
      choices: [
        { reply: "진정하세요.", nextText: "\"하아... 죄송합니다. 이단들의 냄새가 짙어져서 잠시 이성을...\"" },
        { reply: "누구를 숙청할까요?", nextText: "\"여신의 빛을 거스르는 모든 자들... 명만 내려 주십시오.\"" }
      ]
    }
  ],
  "이기영": [
    {
      text: "\"꺼져...\"",
      choices: [
        { reply: "...", nextText: "\"거울 보고 혼잣말하는 기분이라 썩 좋지 않다...\"" }
      ]
    }
  ],
  "default": [
    {
      text: "\"불러주셔서 감사합니다. 지시하실 임무가 있습니까?\"",
      choices: [
        { reply: "열심히 해줘.", nextText: "\"네! 길드를 위해 뼈를 묻겠습니다!\"" },
        { reply: "쉬어도 좋아.", nextText: "\"정말입니까? 감사합니다!\"" }
      ]
    }
  ]
};

const BENIGORE_QUOTES = [
    "\"오늘 날씨가 참 맑네. 던전 탐험하기 딱 좋은 날이야.\"",
    "\"저기... 혹시 남는 골드 있니? 크흠, 그냥 물어봤어.\"",
    "\"위대한 베니고어의 이름으로... 앗, 구절을 까먹었다.\"",
    "\"연금술 솥에 이상한 거 넣지 마! 폭발하면 내 책임 아니다?\"",
    "\"악마? 흠, 걔네도 나름 귀여운 구석이... 농담이야!\"",
    "\"명성이 높아지는 건 좋은데, 찾아오는 사람이 너무 많음 귀찮아~ 앗! 듣고 있었어...?\"",
    "\"마법진을 그릴 때 말이야, 별 모양 보단 동그라미가 그리기 편하지 않니?\"",
    "\"흐헤헤... 신성! 신성이 쏟아진다앗!\"",
    "\"흠흠. 과연 빛의 성자. 이 베니고어 여신의 말씀을 대륙에 널리...\"",
    "\"이봐 기영 후배애애, 저기 저 구석에 쌓인 먼지 좀 치우는 게 어떨까? 여신의 품위가 떨어진다구우...\"",
    "\"아함~ 졸리다. 여신도 휴식이 필요하다고.\"",
    "\"가끔은 나도 대륙에 강림해서 맛있는 걸 먹어보고 싶단 말이지. 특히 그... 치킨?\"",
    "\"핫! 기영 후배! 내가 어제 꿈을 꿨는데 글쎄, ...루시퍼한테 붙으면 안 된다? ...안 된다?! \""
];

const ALCHEMY_MATERIALS = [
    { id: 'mat1', name: '물푸레나무', icon: 'forest' },
    { id: 'mat2', name: '성수', icon: 'water_drop' },
    { id: 'mat3', name: '인어의 눈물', icon: 'diamond' },
    { id: 'mat4', name: '만드라고라', icon: 'grass' },
    { id: 'mat5', name: '용의 비늘', icon: 'local_fire_department' },
];

const CHARACTER_IMAGES = Object.fromEntries(NAMED_CHARACTERS.map(character => [character.name, character.image]));

const createId = (prefix = 'id') => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

const makeAvatarPlaceholder = (label = '길드원') => {
  const safeLabel = String(label).slice(0, 6);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#353534"/><stop offset="1" stop-color="#131313"/></linearGradient></defs><rect width="300" height="300" fill="url(#g)"/><circle cx="150" cy="112" r="55" fill="#4d4635"/><path d="M55 285c8-68 43-102 95-102s87 34 95 102" fill="#4d4635"/><text x="150" y="270" text-anchor="middle" fill="#f2ca50" font-size="28" font-family="sans-serif">${safeLabel}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const handleImageError = (event) => {
  const image = event.currentTarget;
  image.onerror = null;
  image.src = makeAvatarPlaceholder(image.alt || '길드원');
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Jua&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block');

  :root {
    --color-surface: #131313;
    --color-surface-high: #2a2a2a;
    --color-surface-highest: #353534;
    --color-primary: #f2ca50;
    --color-secondary: #bdc2ff;
    --color-error: #ffb4ab;
    --color-on-surface: #e5e2e1;
    --color-on-surface-variant: #d0c5af;
    --color-outline: #4d4635;
  }

  body {
    font-family: 'Jua', sans-serif;
    background-color: var(--color-surface);
    color: var(--color-on-surface);
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }

  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .material-symbols-outlined.fill {
    font-variation-settings: 'FILL' 1;
  }

  .custom-scroll {
    overflow-y: auto;
    overflow-x: hidden;
  }
  .custom-scroll::-webkit-scrollbar { width: 4px; }
  .custom-scroll::-webkit-scrollbar-track { background: var(--color-surface-highest); }
  .custom-scroll::-webkit-scrollbar-thumb { background: var(--color-primary); border-radius: 2px; }

  /* Effects */
  .text-shadow-gold { text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(242, 202, 80, 0.5); }
  .soul-glow { text-shadow: 0 0 8px rgba(189, 194, 255, 0.6); }
  .divine-radiance { filter: drop-shadow(0 0 15px rgba(242, 202, 80, 0.6)); }
  
  .sanity-bar-fill {
      background-color: var(--color-primary);
      animation: pulse-glow 2s ease-in-out infinite;
  }
  
  @keyframes pulse-glow {
      0% { opacity: 0.8; box-shadow: 0 0 4px rgba(242, 202, 80, 0.4); }
      50% { opacity: 1.0; box-shadow: 0 0 12px rgba(242, 202, 80, 0.8); }
      100% { opacity: 0.8; box-shadow: 0 0 4px rgba(242, 202, 80, 0.4); }
  }

  .floating-particle {
      position: absolute;
      background-color: var(--color-primary);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--color-primary);
      opacity: 0.6;
      animation: floatUp var(--duration, 3s) ease-in infinite;
      pointer-events: none;
  }
  @keyframes floatUp {
      0% { transform: translateY(0) scale(1); opacity: 0; }
      20% { opacity: 0.6; }
      80% { opacity: 0.4; }
      100% { transform: translateY(-100px) scale(0.5); opacity: 0; }
  }

  .potion-glow {
      filter: drop-shadow(0 0 20px rgba(189,194,255,0.6)) drop-shadow(0 0 40px rgba(189,194,255,0.2));
      animation: float 4s ease-in-out infinite;
  }
  @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
      100% { transform: translateY(0px); }
  }

  .chat-bubble-arrow {
    position: absolute;
    bottom: -10px;
    left: 20px;
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid var(--color-surface-high);
  }

  .parchment-gradient {
      background-image: linear-gradient(135deg, rgba(42, 42, 42, 0.95), rgba(32, 31, 31, 0.98));
  }
`;

const TopBar = ({ guild, titleOverride = null }) => (
  <header className="fixed top-0 w-full z-[100] border-b border-[#4d4635] bg-[#131313]/95 backdrop-blur-md shadow-sm flex items-center px-4 h-16 justify-between">
    <div className="flex items-center gap-3">
      {titleOverride ? (
          <>
            <span className="material-symbols-outlined text-[#f2ca50]">menu</span>
            <h1 className="text-2xl text-[#f2ca50] tracking-tight">{titleOverride}</h1>
          </>
      ) : (
          <>
            <div className="w-10 h-10 rounded-full border border-[#f2ca50] overflow-hidden bg-[#2a2a2a]">
              <img className="w-full h-full object-cover" alt="이기영" src={CHARACTER_IMAGES['이기영']} onError={handleImageError} />
            </div>
            <div>
              <h1 className="text-xl text-[#f2ca50] tracking-widest leading-none">{guild.name}</h1>
              <p className="text-[10px] text-[#d0c5af] uppercase tracking-tighter">MASTER GRADE <span className="text-[#f2ca50] text-sm">{guild.masterGrade}</span></p>
            </div>
          </>
      )}
    </div>
    
    <div className="flex items-center gap-4">
       <div className="flex items-center gap-3">
         <button className="flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50] transition-colors active:scale-95" aria-label="알림">
           <span className="material-symbols-outlined">notifications</span>
         </button>
         <button className="flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50] transition-colors active:scale-95" aria-label="메시지">
           <span className="material-symbols-outlined">mail</span>
         </button>
         <button className="flex items-center justify-center text-[#d0c5af] hover:text-[#f2ca50] transition-colors active:scale-95" aria-label="설정">
           <span className="material-symbols-outlined">settings</span>
         </button>
       </div>

       <div className="flex items-center bg-[#353534] px-3 py-1 rounded-full border border-[#4d4635] gap-2">
        <span className="material-symbols-outlined text-[#f2ca50] text-sm fill">monetization_on</span>
        <span className="text-[#f2ca50] text-sm mr-1">{guild.gold}G</span>
        <span className="material-symbols-outlined text-[#4ade80] text-sm fill">star</span>
        <span className="text-[#4ade80] text-sm">{guild.exp || 0}E</span>
      </div>
    </div>
  </header>
);

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'members', icon: 'group', label: '길드원' },
    { id: 'quests', icon: 'explore', label: '외부 행사' },
    { id: 'home', icon: 'castle', label: '홈 화면', isCenter: true },
    { id: 'alchemy', icon: 'science', label: '연금술 연구' },
    { id: 'vault', icon: 'account_balance_wallet', label: '창고 관리' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-[100] bg-[#1c1b1b] border-t border-[#4d4635] shadow-[0_-4px_10px_rgba(0,0,0,0.5)] flex justify-around items-end h-[70px] pb-2 rounded-t-2xl backdrop-blur-md">
      {tabs.map(tab => (
        tab.isCenter ? (
           <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="relative -top-6 flex flex-col items-center justify-center group z-10 mx-2">
            <div className={`w-16 h-16 rounded-full border-[4px] border-[#131313] flex items-center justify-center transition-transform active:scale-95 shadow-2xl ${activeTab === tab.id ? 'bg-[#f2ca50]' : 'bg-[#d4af37]'}`}>
              <span className={`material-symbols-outlined text-3xl fill ${activeTab === tab.id ? 'text-[#131313]' : 'text-[#3c2f00]'}`}>{tab.icon}</span>
            </div>
            <span className={`text-[10px] absolute -bottom-5 font-bold whitespace-nowrap ${activeTab === tab.id ? 'text-[#f2ca50]' : 'text-[#d0c5af]'}`}>{tab.label}</span>
          </button>
        ) : (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center justify-center p-2 flex-1 active:scale-95 transition-all ${activeTab === tab.id ? 'text-[#f2ca50]' : 'text-[#99907c] hover:text-[#d0c5af]'}`}>
            <span className={`material-symbols-outlined text-2xl mb-1 ${activeTab === tab.id ? 'fill' : ''}`}>{tab.icon}</span>
            <span className="text-[10px] whitespace-nowrap">{tab.label}</span>
          </button>
        )
      ))}
    </nav>
  );
};

// 💡 홈 뷰가 길드 정보(guild)를 받아오도록 수정되었습니다.
const HomeView = ({ guild }) => {
  const [currentDialog, setCurrentDialog] = useState(BENIGORE_QUOTES[0]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const [position, setPosition] = useState({ x: 16, y: 130 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleChangeDialog = () => {
      const randomLine = BENIGORE_QUOTES[Math.floor(Math.random() * BENIGORE_QUOTES.length)];
      setCurrentDialog(randomLine);
  };

  const handleDragStart = (e) => {
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
      
      dragOffset.current = {
          x: clientX - position.x,
          y: clientY - position.y
      };
      setIsDragging(true);
  };

  useEffect(() => {
      const handleDragMove = (e) => {
          if (!isDragging) return;
          const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
          const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
          
          setPosition({
              x: clientX - dragOffset.current.x,
              y: clientY - dragOffset.current.y
          });
      };

      const handleDragEnd = () => {
          setIsDragging(false);
      };

      if (isDragging) {
          window.addEventListener('mousemove', handleDragMove);
          window.addEventListener('mouseup', handleDragEnd);
          window.addEventListener('touchmove', handleDragMove, { passive: false });
          window.addEventListener('touchend', handleDragEnd);
      }

      return () => {
          window.removeEventListener('mousemove', handleDragMove);
          window.removeEventListener('mouseup', handleDragEnd);
          window.removeEventListener('touchmove', handleDragMove);
          window.removeEventListener('touchend', handleDragEnd);
      };
  }, [isDragging]);

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img 
                src="./images/배경1.png" 
                alt="길드 배경" 
                className="w-full h-full object-cover"
                onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
        </div>

        <div className="absolute inset-0 flex items-end justify-center overflow-hidden z-10 pointer-events-none">
            <img 
                src="./images/이기영-빛의성자.png" 
                alt="이기영 빛의 성자" 
                className="h-[85%] max-h-[800px] object-contain object-bottom drop-shadow-[0_0_20px_rgba(242,202,80,0.15)]"
                onError={handleImageError} 
            />
        </div>

        <div className="absolute left-4 top-4 z-20 flex flex-col gap-2">
            <button 
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="flex items-center gap-1.5 bg-[#2a2a2a]/90 backdrop-blur border border-[#4d4635] px-3 py-1.5 rounded-full shadow-md text-[11px] text-[#d0c5af] hover:text-[#f2ca50] transition-colors w-max active:scale-95"
            >
                <span className="material-symbols-outlined text-[14px]">
                    {isStatusOpen ? 'visibility_off' : 'visibility'}
                </span>
                길드 현황 {isStatusOpen ? '접기' : '보기'}
            </button>

            {isStatusOpen && (
                <div className="flex flex-col gap-2 w-36 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-[#2a2a2a]/80 backdrop-blur p-2 rounded-lg border-l-2 border-[#f2ca50] shadow-md">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] text-[#d0c5af]">지지도</span>
                            {/* 💡 지지도가 42% 고정에서 실제 데이터로 변경되었습니다 */}
                            <span className="text-[11px] text-[#f2ca50] font-bold">{guild.support}%</span>
                        </div>
                        <div className="h-1 w-full bg-[#131313] rounded-full overflow-hidden">
                            <div className="h-full bg-[#f2ca50]" style={{ width: `${guild.support}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-[#2a2a2a]/80 backdrop-blur p-2 rounded-lg border-l-2 border-[#bdc2ff] shadow-md">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] text-[#d0c5af]">인지도</span>
                            {/* 💡 인지도 역시 고정 8%에서 실제 데이터로 변경되었습니다 */}
                            <span className="text-[11px] text-[#bdc2ff] font-bold">{guild.fame}%</span>
                        </div>
                        <div className="h-1 w-full bg-[#131313] rounded-full overflow-hidden">
                            <div className="h-full bg-[#bdc2ff]" style={{ width: `${Math.min(100, guild.fame)}%` }}></div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div 
            className={`absolute z-30 w-[220px] bg-[#14141e]/90 backdrop-blur-md border border-[#e9c349]/50 p-3 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-move transition-transform ${isDragging ? 'scale-105 opacity-90' : 'scale-100 opacity-100'}`}
            style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px`, 
                touchAction: 'none'
            }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
        >
            <div className="flex items-start gap-2 pointer-events-none">
                <div className="w-6 h-6 flex-shrink-0 bg-[#f2ca50]/20 rounded-full flex items-center justify-center border border-[#f2ca50]/40 mt-0.5">
                    <span className="material-symbols-outlined text-[#f2ca50] fill text-[14px] animate-pulse">notifications_active</span>
                </div>
                <div className="flex-1">
                    <p className="text-[9px] text-[#f2ca50] mb-0.5 tracking-wider font-bold">새로운 메시지 도착</p>
                    <p className="text-[11px] leading-snug italic text-[#e5e2e1] break-keep">
                        {currentDialog}
                    </p>
                </div>
            </div>
            
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    handleChangeDialog();
                }}
                onMouseDown={(e) => e.stopPropagation()} 
                onTouchStart={(e) => e.stopPropagation()} 
                className="mt-2 w-full py-1.5 bg-[#201f1f]/50 border border-[#4d4635] hover:bg-[#393939] transition-colors rounded text-[10px] text-[#d0c5af] flex items-center justify-center gap-1 active:scale-95"
            >
                다음 메시지 보기
                <span className="material-symbols-outlined text-[12px] pointer-events-none">refresh</span>
            </button>
        </div>
    </div>
  );
};

// 💡 onComplete 프롭스가 추가되어 버튼 클릭 시 작동하도록 연결되었습니다.
const InterviewModal = ({ member, onClose, onComplete }) => {
    const [scenario, setScenario] = useState(null);
    const [finalResponse, setFinalResponse] = useState(null);

    useEffect(() => {
        if (member) {
            const profileDialogue = [{
                text: `\"${member.role} ${member.name}, 면담 요청을 확인했습니다.\"`,
                choices: [
                    { reply: "요즘 길드 생활은 어때?", nextText: `\"제 성향을 한마디로 말하면 '${member.personality || '평범한 모험가'}'에 가깝겠군요. 맡은 역할은 다하겠습니다.\"` },
                    { reply: "앞으로의 목표가 궁금해.", nextText: `\"지금은 ${member.role}로서 더 강해지는 것이 목표입니다. 다음 임무도 맡겨 주십시오.\"` }
                ]
            }];
            const lines = CHARACTER_DIALOGUES[member.name] || profileDialogue;
            const randomScenario = lines[Math.floor(Math.random() * lines.length)];
            setScenario(randomScenario);
            setFinalResponse(null);
        }
    }, [member]);

    if (!member || !scenario) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-[#131313]/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#201f1f] border border-[#4d4635] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                
                <div className="p-4 border-b border-[#353534] flex justify-between items-center bg-[#2a2a2a]">
                    <h3 className="text-[#f2ca50] text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">chat</span>
                        {member.name}와의 면담
                    </h3>
                    <button onClick={onClose} className="text-[#d0c5af] hover:text-[#ffb4ab] transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center gap-6">
                    <div className="relative w-full">
                        <div className="bg-[#2a2a2a] p-4 rounded-xl border border-[#4d4635] shadow-inner relative z-10 min-h-[100px] flex items-center justify-center">
                            <p className={`text-center italic leading-relaxed ${finalResponse ? 'text-[#f2ca50]' : 'text-[#e5e2e1]'}`}>
                                {finalResponse ? finalResponse : scenario.text}
                            </p>
                        </div>
                        <div className="chat-bubble-arrow border-t-[#2a2a2a]"></div>
                    </div>
                    
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#353534] shadow-lg mt-2">
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" onError={handleImageError} />
                    </div>
                </div>

                <div className="p-4 bg-[#1c1b1b] border-t border-[#353534] flex flex-col gap-2">
                    {!finalResponse ? (
                        scenario.choices.map((choice, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setFinalResponse(choice.nextText)}
                                className="w-full py-3 bg-[#2a2a2a] border border-[#4d4635] text-[#d0c5af] rounded-lg hover:bg-[#353534] hover:text-[#f2ca50] hover:border-[#f2ca50]/50 active:scale-95 transition-all text-sm"
                            >
                                {choice.reply}
                            </button>
                        ))
                    ) : (
                        <button 
                            onClick={onComplete} 
                            className="w-full py-3 bg-[#f2ca50] text-[#3c2f00] font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_15px_rgba(242,202,80,0.3)]"
                        >
                            면담 종료
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

const MemberManagementView = ({ members, guildExp, onHealMember, onRecruitClick, onInterviewClick, onLevelUp, onLimitBreak }) => {
  return (
    <div className="w-full h-full flex flex-col space-y-4 px-4 pb-8">
      <div className="space-y-4">
        {members.map(member => {
          const reqExp = member.level * 50;
          const isMaxLevel = member.level >= member.maxLevel;
          const canLevelUp = guildExp >= reqExp;
          const isLocked = member.status === 'locked';
          const isQuesting = member.status === 'questing';
          const nextJob = Array.isArray(member.jobPath) ? member.jobPath[(member.jobStage || 0) + 1] : null;
          
          let cardStyle = 'border-[#4d4635]';
          if (isLocked) cardStyle = 'border-[#ffb4ab]/30 opacity-90';
          if (isQuesting) cardStyle = 'border-[#bdc2ff]/30 opacity-80';

          return (
            <div key={member.id} className={`parchment-gradient p-4 rounded-lg border shadow-lg flex flex-col gap-3 transition-transform active:scale-[0.98] ${cardStyle}`}>
              <div className="flex gap-4">
                <div className={`w-20 h-20 rounded-md overflow-hidden border flex-shrink-0 bg-[#131313] ${isLocked ? 'border-[#f2ca50] shadow-[0_0_10px_rgba(242,202,80,0.3)]' : 'border-[#e9c349] shadow-[inset_0_0_4px_rgba(233,195,73,0.3)]'}`}>
                  <img alt={member.name} className={`w-full h-full object-cover ${isLocked ? 'grayscale-[0.5]' : ''}`} src={member.image} onError={handleImageError} />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl text-[#e5e2e1] leading-tight">{member.name}</h2>
                        <span className="text-xs text-[#4ade80] font-bold">LV.{member.level}</span>
                        <span className="text-[10px] text-[#99907c]">(Max {member.maxLevel})</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                         <span className={`text-xs px-2 py-0.5 rounded ${member.rank.includes('S') ? 'bg-[#d4af37]/20 text-[#f2ca50] border border-[#f2ca50]/30' : member.rank.includes('A') ? 'bg-[#343d96]/50 text-[#bdc2ff]' : 'bg-[#353534] text-[#d0c5af]'}`}>{member.rank}</span>
                         {isLocked && <span className="text-[10px] text-[#d0c5af] opacity-50 tracking-widest">[잠금됨]</span>}
                         {isQuesting && <span className="text-[10px] text-[#bdc2ff] tracking-widest font-bold">[임무 중]</span>}
                      </div>
                    </div>
                    <div className="mt-1 grid grid-cols-[42px_1fr] gap-x-2 gap-y-0.5 text-[11px] leading-snug">
                      <span className="text-[#827968]">나이</span>
                      <span className="text-[#d0c5af]">{member.age != null ? `${member.age}세` : '미상'}</span>
                      <span className="text-[#827968]">성향</span>
                      <span className="text-[#d0c5af] break-keep">{member.personality || '미상'}</span>
                      <span className="text-[#827968]">직업</span>
                      <span className="text-[#f2ca50] break-keep">{member.role}</span>
                      <span className="text-[#827968]">등급</span>
                      <span className="text-[#d0c5af]">{member.rank}</span>
                    </div>
                    {nextJob && (
                      <p className="mt-1 text-[10px] text-[#bdc2ff]">다음 직업: {nextJob} · 한계돌파 시 획득</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className={`flex justify-between text-[10px] ${member.sanity < 30 ? 'text-[#ffb4ab]' : 'text-[#bdb2a1]'}`}>
                      <span>정신력</span><span>{member.sanity}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#131313] rounded-full overflow-hidden">
                      <div className={`h-full ${member.sanity < 30 ? 'bg-[#ffb4ab]/60' : 'sanity-bar-fill'}`} style={{ width: `${member.sanity}%` }}></div>
                    </div>
                    {isLocked && (
                        <div className="flex items-center gap-1 text-[#ffb4ab] text-[10px] mt-1">
                          <span className="material-symbols-outlined text-xs">error</span>
                          <span>퀘스트 불가 (정신력 0)</span>
                        </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#353534]">
                 <button 
                    onClick={() => onInterviewClick(member)}
                    disabled={member.name === '이기영'}
                    className="py-2 flex flex-col items-center gap-1 bg-transparent rounded text-[#d0c5af] hover:bg-[#353534] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                    <span className="material-symbols-outlined text-lg">chat</span>
                    <span className="text-[10px]">면담</span>
                 </button>
                 <button onClick={() => onHealMember(member.id)} disabled={isLocked || isQuesting || member.sanity >= 100} className="py-2 flex flex-col items-center gap-1 bg-transparent rounded text-[#f2ca50] hover:bg-[#353534] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    <span className="material-symbols-outlined text-lg">medication</span>
                    <span className="text-[10px]">포션</span>
                 </button>

                 {isMaxLevel ? (
                     <button onClick={() => onLimitBreak(member.id)} disabled={isLocked || isQuesting} className="py-2 flex flex-col items-center gap-1 bg-transparent rounded text-[#ffb4ab] hover:bg-[#353534] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                        <span className="material-symbols-outlined text-lg">local_fire_department</span>
                        <span className="text-[10px]">돌파(1000G)</span>
                     </button>
                 ) : (
                     <button onClick={() => onLevelUp(member.id)} disabled={isLocked || isQuesting || !canLevelUp} className="py-2 flex flex-col items-center gap-1 bg-transparent rounded text-[#4ade80] hover:bg-[#353534] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                        <span className="material-symbols-outlined text-lg">upgrade</span>
                        <span className="text-[10px]">LV UP({reqExp}E)</span>
                     </button>
                 )}

                 <button disabled={isLocked || isQuesting || member.sanity === 0} className="py-2 flex flex-col items-center gap-1 bg-transparent rounded text-[#d0c5af] hover:bg-[#353534] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    <span className="material-symbols-outlined text-lg">assignment</span>
                    <span className="text-[10px]">퀘스트</span>
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
          <button onClick={onRecruitClick} className="w-full p-6 bg-[#353534] border-2 border-[#f2ca50] hover:bg-[#201f1f] rounded-xl flex flex-col items-center gap-2 transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(242,202,80,0.15)] relative overflow-hidden group">
             <div className="absolute inset-0 bg-[#f2ca50] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"></div>
             <div className="flex items-center gap-4 relative z-10">
                 <div className="p-3 bg-[#d4af37] rounded-full ring-2 ring-[#f2ca50] ring-offset-2 ring-offset-[#353534] group-hover:rotate-12 transition-transform">
                    <span className="material-symbols-outlined text-[#3c2f00] text-3xl">casino</span>
                 </div>
                 <div className="flex flex-col items-start">
                   <div className="text-2xl text-[#f2ca50]">길드원 모집</div>
                   <div className="flex items-center gap-1">
                     <span className="text-xl text-[#f2ca50] font-bold">-1200G</span>
                     <span className="text-[10px] text-[#d0c5af] opacity-70">(10명 중 2명 선택)</span>
                   </div>
                 </div>
             </div>
          </button>
      </div>
    </div>
  );
};

const GachaView = ({ onSelectComplete }) => {
    const [pulled, setPulled] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        const newPulls = [];

        const pullNamedOrGeneric = (ranks, genericRole, namedChance = 0.65) => {
            const acceptedRanks = Array.isArray(ranks) ? ranks : [ranks];
            const namedPool = GACHA_POOL.filter(character => acceptedRanks.includes(character.rank));
            if (namedPool.length > 0 && Math.random() < namedChance) {
                const named = namedPool[Math.floor(Math.random() * namedPool.length)];
                return { ...named, jobPath: [...named.jobPath] };
            }

            const rank = acceptedRanks[Math.floor(Math.random() * acceptedRanks.length)];
            const role = genericRole;
            return {
                name: GENERIC_NAMES[Math.floor(Math.random() * GENERIC_NAMES.length)],
                age: 18 + Math.floor(Math.random() * 28),
                personality: '평범한 모험가',
                rank,
                role,
                jobPath: [role],
                jobStage: 0,
                image: makeAvatarPlaceholder(rank)
            };
        };
        
        for(let i = 0; i < 10; i++) {
            const rand = Math.random() * 100;
            let pulledChar;

            if (rand < 2) {
                // 2% 확률: S/SS랭크 네임드
                pulledChar = pullNamedOrGeneric(['S랭크', 'SS랭크'], '정예', 1);
            } else if (rand < 7) {
                // 5% 확률: A랭크
                pulledChar = pullNamedOrGeneric('A랭크', '정예', 0.8);
            } else if (rand < 27) {
                // 20% 확률: B랭크
                pulledChar = pullNamedOrGeneric('B랭크', '숙련', 0.65);
            } else {
                // 73% 확률: C/D/E랭크 (낮은 등급 네임드 포함)
                const lowRanks = ['C랭크', 'C랭크', 'C랭크', 'D랭크', 'D랭크', 'E랭크'];
                const selectedRank = lowRanks[Math.floor(Math.random() * lowRanks.length)];
                pulledChar = pullNamedOrGeneric(selectedRank, '일반', 0.6);
            }

            newPulls.push({
                ...pulledChar,
                id: createId(`g_${i}`),
                sanity: 100,
                status: 'active',
                level: 1,
                maxLevel: 20,
                jobStage: pulledChar.jobStage || 0
            });
        }
        
        setPulled(newPulls.sort(() => Math.random() - 0.5));
        const timer = setTimeout(() => setIsAnimating(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const toggleSelect = (id) => {
        if(selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selId => selId !== id));
        } else if (selectedIds.length < 2) {
            setSelectedIds([...selectedIds, id]);
        }
    };

    if (isAnimating) {
        return (
            <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-[#131313]">
                <span className="material-symbols-outlined text-[80px] text-[#f2ca50] animate-spin fill">casino</span>
                <p className="text-[#f2ca50] mt-4 text-xl animate-pulse">새로운 인연을 찾는 중...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col px-4 pb-8 space-y-4">
            <div className="text-center mt-4">
                <h2 className="text-3xl text-[#f2ca50] mb-2 text-shadow-gold">모집 결과</h2>
                <p className="text-[#d0c5af]">함께할 길드원을 2명 선택하세요. ({selectedIds.length}/2)</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto custom-scroll pr-2 content-start pb-[80px]">
                {pulled.map(char => {
                    const isSelected = selectedIds.includes(char.id);
                    const isSS = char.rank.includes('S');
                    return (
                        <div 
                            key={char.id} 
                            onClick={() => toggleSelect(char.id)}
                            className={`p-3 rounded-lg border-2 flex flex-col items-center text-center transition-all ${isSelected ? 'border-[#f2ca50] bg-[#f2ca50]/10 scale-105 shadow-[0_0_15px_rgba(242,202,80,0.3)]' : 'border-[#4d4635] bg-[#201f1f] hover:border-[#f2ca50]/50'}`}
                        >
                            <img src={char.image} alt={char.name} className={`w-20 h-20 rounded-full mb-2 object-cover border-2 ${isSS ? 'border-[#f2ca50]' : 'border-[#4d4635]'}`} onError={handleImageError} />
                            <div className={`text-lg font-bold ${isSS ? 'text-[#f2ca50]' : 'text-[#e5e2e1]'}`}>{char.name}</div>
                            <div className="text-xs text-[#d0c5af] bg-[#131313] px-2 py-1 rounded-full mt-1">{char.rank} - {char.role}</div>
                            <div className="text-[10px] text-[#99907c] mt-1">{char.age ?? '나이 미상'}{char.age != null ? '세' : ''} · {char.personality || '평범한 모험가'}</div>
                        </div>
                    );
                })}
            </div>
            
            <div className="fixed bottom-4 left-4 right-4 z-[210]">
                <button 
                    disabled={selectedIds.length !== 2}
                    onClick={() => {
                        const selectedChars = pulled.filter(c => selectedIds.includes(c.id));
                        onSelectComplete(selectedChars);
                    }}
                    className="w-full py-4 bg-[#f2ca50] text-[#3c2f00] font-bold text-xl rounded-xl shadow-lg disabled:opacity-50 disabled:bg-[#353534] disabled:text-[#99907c] transition-all active:scale-95"
                >
                    선택 완료
                </button>
            </div>
        </div>
    );
};

const SelectMemberModal = ({ quest, members, onConfirm, onClose }) => {
    const reqCount = quest.rank.includes('S') || quest.rank.includes('A') ? 2 : 1;
    const [selectedIds, setSelectedIds] = useState([]);
    const activeMembers = members.filter(m => m.status === 'active' && m.sanity > 0);
    
    const toggleSelect = (id) => {
        if(selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selId => selId !== id));
        } else if (selectedIds.length < reqCount) {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-[#131313]/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#201f1f] border border-[#4d4635] rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in duration-200">
                <h3 className="text-[#f2ca50] text-xl mb-4 border-b border-[#353534] pb-2 text-center">임무 수행자 배치</h3>
                <p className="text-[#e5e2e1] text-sm mb-4 text-center">
                    [{quest.title}]<br/>
                    <span className="text-[#f2ca50] font-bold text-xs">최소 {reqCount}명의 길드원이 필요합니다. ({selectedIds.length}/{reqCount})</span>
                </p>
                
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scroll pr-2 mb-4">
                    {activeMembers.map(m => {
                        const isSelected = selectedIds.includes(m.id);
                        return (
                            <button 
                                key={m.id} 
                                onClick={() => toggleSelect(m.id)}
                                className={`w-full flex items-center justify-between p-3 border rounded-lg active:scale-95 transition-all group ${isSelected ? 'bg-[#f2ca50]/20 border-[#f2ca50]' : 'bg-[#2a2a2a] border-[#4d4635] hover:border-[#f2ca50]/50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={m.image} alt={m.name} className={`w-10 h-10 rounded-full border object-cover ${isSelected ? 'border-[#f2ca50]' : 'border-[#4d4635]'}`} onError={handleImageError} />
                                        {isSelected && <div className="absolute -top-1 -right-1 bg-[#f2ca50] rounded-full w-4 h-4 flex items-center justify-center text-[#131313]"><span className="material-symbols-outlined text-[10px] font-bold">check</span></div>}
                                    </div>
                                    <div className="text-left">
                                        <div className={`font-bold ${isSelected ? 'text-[#f2ca50]' : 'text-[#e5e2e1]'}`}>{m.name}</div>
                                        <div className="text-xs text-[#d0c5af]">정신력: {m.sanity}% / LV.{m.level}</div>
                                    </div>
                                </div>
                                <span className="text-xs px-2 py-1 bg-[#353534] rounded text-[#d0c5af]">{m.rank}</span>
                            </button>
                        );
                    })}
                    {activeMembers.length === 0 && (
                        <div className="text-center text-[#ffb4ab] py-4">배치할 수 있는 길드원이 없습니다.<br/>포션을 사용해 회복하거나 모집하세요.</div>
                    )}
                </div>

                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-3 bg-[#353534] text-[#d0c5af] rounded-lg hover:bg-[#4d4635] active:scale-95 transition-all">취소</button>
                    <button 
                        disabled={selectedIds.length < reqCount} 
                        onClick={() => {
                            const selectedMembers = activeMembers.filter(m => selectedIds.includes(m.id));
                            onConfirm(quest, selectedMembers);
                        }} 
                        className="flex-1 py-3 bg-[#f2ca50] text-[#3c2f00] font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:bg-[#353534] disabled:text-[#99907c]"
                    >
                        출발하기
                    </button>
                </div>
            </div>
        </div>
    );
};

const ActiveQuestCard = ({ activeQuest, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(Math.max(0, activeQuest.endTime - Date.now()));

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(Math.max(0, activeQuest.endTime - Date.now()));
        }, 1000);
        return () => clearInterval(timer);
    }, [activeQuest.endTime, timeLeft]);

    const isDone = timeLeft <= 0;

    return (
        <div className="bg-[#2a2a2a] border border-[#bdc2ff]/50 rounded-xl p-4 shadow-lg relative overflow-hidden">
            {!isDone && <div className="absolute bottom-0 left-0 h-1 bg-[#bdc2ff] opacity-50 animate-pulse" style={{ width: '100%' }}></div>}
            
            <div className="flex justify-between items-start mb-3">
                <div>
                    <div className="text-xs text-[#bdc2ff] mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">swords</span>
                        임무 진행 중...
                    </div>
                    <h4 className="text-lg text-[#e5e2e1] font-bold">{activeQuest.quest.title}</h4>
                </div>
                <div className="text-right">
                    {isDone ? (
                        <span className="text-[#4ade80] font-bold animate-pulse flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>완료!
                        </span>
                    ) : (
                        <span className="text-[#f2ca50] font-bold font-mono">{Math.ceil(timeLeft / 1000)}초 남음</span>
                    )}
                </div>
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#4d4635]">
                <div className="flex -space-x-3">
                    {activeQuest.members.map(m => (
                        <img key={m.id} src={m.image} alt={m.name} className="w-8 h-8 rounded-full border-2 border-[#131313] object-cover bg-[#353534]" onError={handleImageError} />
                    ))}
                </div>
                {isDone && (
                    <button onClick={onComplete} className="px-4 py-2 bg-[#bdc2ff] text-[#131313] text-sm font-bold rounded-lg active:scale-95 transition-transform shadow-[0_0_10px_rgba(189,194,255,0.4)]">
                        결과 확인하기
                    </button>
                )}
            </div>
        </div>
    )
};

const QuestsView = ({ quests, members, activeQuests, onStartQuest, onCompleteQuest }) => {
    const [selectedQuest, setSelectedQuest] = useState(null);

    const availableQuests = quests.filter(quest => 
        !activeQuests.some(aq => aq.quest.id === quest.id)
    );

    return (
        <div className="w-full h-full px-4 pb-8 space-y-4">
            {activeQuests.length > 0 && (
                <div className="mb-6 space-y-3">
                    <h3 className="text-sm text-[#bdc2ff] font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
                        현재 진행 중인 임무
                    </h3>
                    {activeQuests.map(aq => (
                        <ActiveQuestCard key={aq.id} activeQuest={aq} onComplete={() => onCompleteQuest(aq)} />
                    ))}
                    <div className="border-b-2 border-dashed border-[#4d4635] pt-2 mb-4"></div>
                </div>
            )}

            <h3 className="text-sm text-[#d0c5af] font-bold">수행 가능한 임무</h3>
            
            {availableQuests.length === 0 ? (
                 <div className="text-center text-[#d0c5af] p-8 bg-[#2a2a2a] rounded-xl border border-[#4d4635]">
                     모든 임무가 진행 중입니다. 조금 기다려주세요!
                 </div>
            ) : (
                availableQuests.map(quest => (
                    <div key={quest.id} className="bg-[#1c1b1b] border border-[#f2ca50]/30 rounded-xl overflow-hidden shadow-lg transition-all hover:border-[#f2ca50]/60">
                        <div className="relative h-24 w-full bg-[#2a2a2a]">
                            <div className={`absolute top-3 left-3 text-[#131313] px-3 py-1 rounded-lg font-bold shadow-sm ${quest.rank.includes('S') ? 'bg-[#ffb4ab]' : quest.rank.includes('A') ? 'bg-[#bdc2ff]' : 'bg-[#f2ca50]'}`}>
                                {quest.rank}
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <h3 className={`text-xl font-bold ${quest.rank.includes('S') ? 'text-[#ffb4ab]' : 'text-[#f2ca50]'}`}>{quest.title}</h3>
                                <p className="text-sm text-[#d0c5af] mt-1">{quest.desc}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-[#d0c5af]">
                                    <span>기본 성공률</span>
                                    <span className="text-[#f2ca50]">{quest.successRate}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-[#353534] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#f2ca50]" style={{ width: `${quest.successRate}%` }}></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-[#2a2a2a] p-2 rounded-lg border border-[#4d4635]">
                                <div className="flex items-center gap-1 text-[#f2ca50]">
                                    <span className="material-symbols-outlined text-sm fill">payments</span>
                                    <span className="text-sm font-bold">{quest.rewards.gold}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[#4ade80]">
                                    <span className="material-symbols-outlined text-sm fill">star</span>
                                    <span className="text-sm font-bold">{quest.rewards.exp}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[#bdc2ff]">
                                    <span className="material-symbols-outlined text-sm fill">military_tech</span>
                                    <span className="text-sm font-bold">{quest.rewards.fame}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedQuest(quest)} className="w-full py-3 bg-[#f2ca50] text-[#3c2f00] font-bold rounded-xl active:scale-95 transition-transform hover:brightness-110">
                                임무 인원 배치
                            </button>
                        </div>
                    </div>
                ))
            )}
            
            {selectedQuest && (
                <SelectMemberModal 
                    quest={selectedQuest} 
                    members={members} 
                    onConfirm={(q, m) => { setSelectedQuest(null); onStartQuest(q, m); }} 
                    onClose={() => setSelectedQuest(null)} 
                />
            )}
        </div>
    );
};

const AlchemyView = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [selectedMats, setSelectedMats] = useState([]);
    
    // Step 2
    const [needlePos, setNeedlePos] = useState(0);
    const needleDir = useRef(1);
    const [isTimingActive, setIsTimingActive] = useState(true);
    const [timingScore, setTimingScore] = useState(0);

    // Step 3
    const [mashCount, setMashCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5.0);
    const [isMashingActive, setIsMashingActive] = useState(false);

    const toggleMat = (mat) => {
        if(selectedMats.find(m => m.id === mat.id)) {
            setSelectedMats(selectedMats.filter(m => m.id !== mat.id));
        } else if (selectedMats.length < 2) {
            setSelectedMats([...selectedMats, mat]);
        }
    };

    useEffect(() => {
        if (step === 2 && isTimingActive) {
            const interval = setInterval(() => {
                setNeedlePos(prev => {
                    let newPos = prev + (3 * needleDir.current);
                    if (newPos >= 100) { needleDir.current = -1; return 100; }
                    if (newPos <= 0) { needleDir.current = 1; return 0; }
                    return newPos;
                });
            }, 16);
            return () => clearInterval(interval);
        }
    }, [step, isTimingActive]);

    useEffect(() => {
        if (step === 3 && isMashingActive && timeLeft > 0) {
            const interval = setInterval(() => {
                setTimeLeft(prev => Math.max(0, prev - 0.1));
            }, 100);
            return () => clearInterval(interval);
        } else if (step === 3 && timeLeft === 0 && isMashingActive) {
            setIsMashingActive(false);
            finishAlchemy();
        }
    }, [step, isMashingActive, timeLeft]);

    const handleStopTiming = () => {
        setIsTimingActive(false);
        let score = 0;
        if(needlePos >= 60 && needlePos <= 85) score = 100; // Success zone
        else if (needlePos >= 50 && needlePos <= 95) score = 50;
        else score = 10;
        setTimingScore(score);
        setTimeout(() => setStep(3), 1500);
    };

    const handleMash = () => {
        if(!isMashingActive && timeLeft === 5.0) setIsMashingActive(true);
        if(isMashingActive && timeLeft > 0) setMashCount(prev => prev + 1);
    };

    const finishAlchemy = () => {
        const powerScore = Math.min(100, mashCount * 3); // ~33 taps for 100%
        const totalScore = (timingScore + powerScore) / 2;
        
        let rank = 'C급';
        let price = 50;
        
        if(totalScore >= 90) { rank = 'S급'; price = 500; }
        else if(totalScore >= 70) { rank = 'A급'; price = 300; }
        else if(totalScore >= 50) { rank = 'B급'; price = 150; }

        onComplete({
            rank,
            score: totalScore.toFixed(2),
            mats: selectedMats,
            price
        });
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            {step === 1 && (
                <div className="w-full max-w-md animate-in fade-in duration-300">
                    <div className="text-center mb-8">
                        <span className="text-[#f2ca50] text-sm tracking-widest border-b border-[#f2ca50]/30 pb-1">STEP 1</span>
                        <h2 className="text-3xl text-[#e5e2e1] mt-2">재료 선택</h2>
                        <p className="text-[#d0c5af] text-sm mt-2">섞을 재료 2가지를 고르세요.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {ALCHEMY_MATERIALS.map(mat => {
                            const isSelected = selectedMats.find(m => m.id === mat.id);
                            return (
                                <button 
                                    key={mat.id} 
                                    onClick={() => toggleMat(mat)}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${isSelected ? 'border-[#f2ca50] bg-[#f2ca50]/20 shadow-[0_0_15px_rgba(242,202,80,0.2)]' : 'border-[#4d4635] bg-[#2a2a2a] hover:border-[#f2ca50]/50'}`}
                                >
                                    <span className={`material-symbols-outlined text-4xl ${isSelected ? 'text-[#f2ca50]' : 'text-[#d0c5af]'}`}>{mat.icon}</span>
                                    <span className={`font-bold ${isSelected ? 'text-[#f2ca50]' : 'text-[#e5e2e1]'}`}>{mat.name}</span>
                                </button>
                            );
                        })}
                    </div>
                    <button 
                        disabled={selectedMats.length !== 2}
                        onClick={() => setStep(2)}
                        className="w-full py-4 bg-[#f2ca50] text-[#3c2f00] text-xl font-bold rounded-xl disabled:opacity-50 disabled:bg-[#353534] disabled:text-[#99907c] transition-all active:scale-95 shadow-lg"
                    >
                        다음 단계로
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="w-full max-w-md text-center animate-in fade-in slide-in-from-right-8 duration-300">
                    <span className="text-[#f2ca50] text-sm tracking-widest border-b border-[#f2ca50]/30 pb-1">STEP 2</span>
                    <h2 className="text-3xl text-[#e5e2e1] mt-2 mb-2">재료 다듬기</h2>
                    <p className="text-[#d0c5af] mb-12">녹색 구간에 맞춰 터치하세요!</p>
                    
                    <div className="h-14 w-full bg-[#0e0e0e] rounded-full border border-[#4d4635] relative mb-12 shadow-inner">
                        <div className="absolute h-full w-[25%] left-[60%] bg-gradient-to-r from-[#f2ca50] to-[#4ade80] opacity-60 rounded-full"></div>
                        <div className="absolute h-16 w-2 bg-white shadow-[0_0_15px_#fff] -top-1 z-10" style={{ left: `${needlePos}%` }}></div>
                    </div>
                    
                    {!isTimingActive && (
                        <div className={`text-4xl font-bold mb-8 animate-bounce ${timingScore === 100 ? 'text-[#4ade80]' : timingScore === 50 ? 'text-[#f2ca50]' : 'text-[#ffb4ab]'}`}>
                            {timingScore === 100 ? 'PERFECT!' : timingScore === 50 ? 'GOOD' : 'BAD'}
                        </div>
                    )}

                    <button 
                        disabled={!isTimingActive}
                        onClick={handleStopTiming}
                        className="w-full py-6 bg-[#f2ca50] text-[#3c2f00] text-2xl font-bold rounded-xl active:scale-95 transition-transform shadow-[0_4px_15px_rgba(242,202,80,0.4)] disabled:opacity-50 disabled:shadow-none"
                    >
                        터치!
                    </button>
                </div>
            )}

            {step === 3 && (
                <div className="w-full max-w-md text-center animate-in fade-in slide-in-from-right-8 duration-300">
                    <span className="text-[#f2ca50] text-sm tracking-widest border-b border-[#f2ca50]/30 pb-1">STEP 3</span>
                    <h2 className="text-3xl text-[#e5e2e1] mt-2 mb-2">마나 주입</h2>
                    <p className="text-[#d0c5af] mb-8">버튼을 빠르게 연타하여 게이지를 채우세요!<br/>남은 시간: <span className="text-[#f2ca50] font-bold text-xl">{timeLeft.toFixed(1)}</span>초</p>
                    
                    <div className="w-48 h-48 mx-auto border-4 border-[#4d4635] bg-[#1c1b1b] rounded-full flex items-center justify-center mb-12 relative overflow-hidden shadow-2xl">
                        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#f2ca50] to-[#e9c349] transition-all duration-75" style={{ height: `${Math.min(100, mashCount * 3)}%` }}></div>
                        <span className={`material-symbols-outlined text-6xl relative z-10 ${mashCount > 0 ? 'text-[#3c2f00]' : 'text-[#4d4635]'}`}>local_fire_department</span>
                    </div>

                    <button 
                        onClick={handleMash}
                        className={`w-full py-8 text-3xl font-bold rounded-xl active:scale-90 transition-transform shadow-lg ${isMashingActive ? 'bg-[#ffb4ab] text-[#690005]' : 'bg-[#f2ca50] text-[#3c2f00]'}`}
                    >
                        {isMashingActive ? '연타!!!' : '시작하기'}
                    </button>
                </div>
            )}
        </div>
    );
};

const AlchemyResultView = ({ result, onFinish, onSell }) => {
    if (!result) return null;
    return (
        <div className="absolute inset-0 z-[120] bg-[#131313] flex flex-col items-center justify-center px-4 animate-in fade-in duration-500">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-5xl text-[#f2ca50] font-bold text-shadow-gold">연금술 성공!</h2>
                <p className="text-[#d0c5af]">새로운 물약을 발견했습니다.</p>
            </div>
            
            <div className="relative w-full max-w-md flex justify-center mb-8">
                <div className="absolute inset-0 bg-[#bdc2ff]/20 rounded-full blur-3xl"></div>
                <div className="potion-glow w-48 h-48 bg-[#2a2a2a] rounded-full border-4 border-[#bdc2ff] flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(189,194,255,0.4)]">
                    <span className="material-symbols-outlined text-8xl text-[#bdc2ff] fill">science</span>
                </div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#f2ca50] rounded-full flex items-center justify-center transform rotate-12 z-20 shadow-lg border-4 border-[#131313]">
                    <span className="text-3xl font-bold text-[#3c2f00]">{result.rank}</span>
                </div>
            </div>

            <div className="w-full max-w-md bg-[#2a2a2a] border border-[#f2ca50]/30 rounded-xl p-6 mb-8 text-center shadow-lg relative overflow-hidden">
                 <div className="absolute inset-0 bg-[#f2ca50]/5 pointer-events-none"></div>
                 <h3 className="text-2xl text-[#e5e2e1] mb-4">의문의 마나 물약</h3>
                 <div className="space-y-2 text-sm">
                    <p className="text-[#d0c5af]"><span className="text-[#99907c]">사용된 재료:</span> {result.mats.map(m=>m.name).join(', ')}</p>
                    <p className="text-[#f2ca50]"><span className="text-[#99907c]">완성도:</span> {result.score}%</p>
                 </div>
            </div>

            <div className="w-full max-w-md grid grid-cols-2 gap-4">
                <button onClick={onFinish} className="py-4 bg-[#353534] text-[#e5e2e1] text-lg rounded-xl active:scale-95 transition-all border border-[#4d4635] hover:bg-[#4d4635] flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">inventory_2</span>
                    보관하기
                </button>
                <button onClick={() => onSell(result.price)} className="py-4 bg-[#f2ca50] text-[#3c2f00] text-lg font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_4px_15px_rgba(242,202,80,0.4)] border-b-4 border-[#d4af37]">
                    <span className="material-symbols-outlined fill">sell</span>
                    즉시 판매 (+{result.price}G)
                </button>
            </div>
        </div>
    );
};

const VaultView = ({ inventory }) => {
    return (
        <div className="w-full h-full p-4 pb-8 space-y-4">
            <h2 className="text-2xl text-[#f2ca50] mb-4 font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">account_balance_wallet</span>
                길드 창고
            </h2>
            {(!inventory || inventory.length === 0) ? (
                <div className="text-center text-[#d0c5af] py-20 bg-[#2a2a2a] rounded-xl border border-[#4d4635] shadow-inner">
                    <span className="material-symbols-outlined text-4xl opacity-50 mb-2">inventory_2</span>
                    <p>현재 창고에 보관 중인 아이템이 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {inventory.map(item => (
                        <div key={item.id} className="bg-[#2a2a2a] border border-[#4d4635] p-4 rounded-xl flex flex-col items-center gap-3 relative shadow-lg">
                            <div className="absolute top-2 right-2 bg-[#f2ca50] text-[#131313] text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                                {item.count}개
                            </div>
                            <div className="w-16 h-16 bg-[#131313] rounded-full border-2 border-[#bdc2ff] flex items-center justify-center shadow-[0_0_15px_rgba(189,194,255,0.2)]">
                                <span className="material-symbols-outlined text-4xl text-[#bdc2ff]">science</span>
                            </div>
                            <div className="text-center">
                                <div className="text-[#f2ca50] font-bold text-sm">{item.rank}</div>
                                <div className="text-[#e5e2e1] text-sm font-bold">{item.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const QuestResultView = ({ result, onClose }) => {
    if (!result) return null;
    const { success, quest, members } = result;

    return (
        <div className="absolute inset-0 z-[120] bg-[#131313]/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="text-center space-y-4 mb-8">
                <span className="material-symbols-outlined text-6xl" style={{ color: success ? '#4ade80' : '#ffb4ab' }}>
                    {success ? 'workspace_premium' : 'warning'}
                </span>
                <h2 className={`text-4xl font-bold ${success ? 'text-[#f2ca50]' : 'text-[#ffb4ab]'}`}>
                    {success ? '임무 성공!' : '임무 실패...'}
                </h2>
                <p className="text-[#d0c5af] text-lg">[{quest.title}]</p>
            </div>

            <div className="bg-[#2a2a2a] border border-[#4d4635] rounded-xl p-6 w-full max-w-sm mb-8 shadow-lg">
                {success ? (
                    <div className="space-y-4">
                        <h3 className="text-[#e5e2e1] text-center border-b border-[#4d4635] pb-2 mb-4">획득한 보상</h3>
                        <div className="flex justify-between items-center text-[#f2ca50]">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">payments</span>골드</span>
                            <span>+{quest.rewards.gold} G</span>
                        </div>
                        <div className="flex justify-between items-center text-[#4ade80]">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">star</span>경험치</span>
                            <span>+{quest.rewards.exp} E</span>
                        </div>
                        <div className="flex justify-between items-center text-[#bdc2ff]">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">military_tech</span>명성</span>
                            <span>+{quest.rewards.fame}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-2">
                        <p className="text-[#ffb4ab]">임무에 실패하여 보상을 얻지 못했습니다.</p>
                        <p className="text-[#d0c5af] text-sm">참여한 길드원들의 정신력이 크게 하락했습니다.</p>
                    </div>
                )}
                <div className="mt-6 pt-4 border-t border-[#4d4635]">
                     <p className="text-xs text-[#d0c5af] mb-2 text-center">참여 인원 (정신력 -20)</p>
                     <div className="flex justify-center gap-2">
                         {members.map(m => (
                             <img key={m.id} src={m.image} alt={m.name} className="w-10 h-10 rounded-full border border-[#4d4635] object-cover" onError={handleImageError} />
                         ))}
                     </div>
                </div>
            </div>

            <button
                onClick={onClose}
                className="w-full max-w-sm py-4 bg-[#f2ca50] text-[#3c2f00] text-xl font-bold rounded-xl active:scale-95 transition-all shadow-[0_4px_15px_rgba(242,202,80,0.3)] hover:brightness-110"
            >
                확인
            </button>
        </div>
    );
};

export default function App() {
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [activeTab, setActiveTab] = useState('home');
  const [currentView, setCurrentView] = useState('main');
  const [tempResult, setTempResult] = useState(null);
  const [interviewMember, setInterviewMember] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('paranGuildState');
      if (saved) {
          const parsed = JSON.parse(saved);
          if(parsed && parsed.guild) {
              parsed.guild.exp = parsed.guild.exp || 0;
              parsed.activeQuests = parsed.activeQuests || [];
              parsed.inventory = parsed.inventory || [];
              parsed.members = (parsed.members || INITIAL_GAME_STATE.members).map(m => hydrateMemberProfile({
                  ...m,
                  level: m.level || 1,
                  maxLevel: m.maxLevel || 20,
                  status: m.status || 'active'
              }));
              
              parsed.quests = INITIAL_GAME_STATE.quests; 
              
              setGameState(parsed); 
          }
      }
    } catch (e) {
      console.warn('저장 데이터를 불러오지 못했습니다.', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('paranGuildState', JSON.stringify(gameState));
    } catch (e) {
      console.warn('게임 진행 상황을 저장하지 못했습니다.', e);
    }
  }, [gameState]);

  // 💡 면담 완료 시 지지도를 2% 올리는 함수입니다.
  const handleInterviewComplete = () => {
    setGameState(prev => ({
        ...prev,
        guild: {
            ...prev.guild,
            support: Math.min(100, (prev.guild.support || 0) + 2)
        }
    }));
    setInterviewMember(null);
    alert(`${interviewMember.name}와의 면담을 완료하여 길드 지지도가 2% 상승했습니다!`);
  };

  const handleHealMember = (id) => {
      setGameState(prev => ({
          ...prev,
          guild: { ...prev.guild, gold: Math.max(0, prev.guild.gold - 50) },
          members: prev.members.map(m => m.id === id ? {...m, sanity: Math.min(100, m.sanity + 30)} : m)
      }));
  };

  const handleLevelUp = (memberId) => {
    setGameState(prev => {
      const member = prev.members.find(m => m.id === memberId);
      const reqExp = member.level * 50; 
      if (prev.guild.exp >= reqExp && member.level < member.maxLevel) {
        return {
          ...prev,
          guild: { ...prev.guild, exp: prev.guild.exp - reqExp },
          members: prev.members.map(m => m.id === memberId ? { ...m, level: m.level + 1 } : m)
        };
      }
      return prev;
    });
  };

  const handleLimitBreak = (memberId) => {
    setGameState(prev => {
      const member = prev.members.find(m => m.id === memberId);
      const cost = 1000;
      if (prev.guild.gold < cost) {
        alert("골드가 부족합니다!");
        return prev;
      }

      const rates = { "김현성": 70, "정하얀": 30, "박덕구": 50, "진청": 40, "차희라": 90, "선희영": 30 };
      const successRate = rates[member.name] || 50; 
      const isSuccess = Math.random() * 100 <= successRate;

      if (isSuccess) {
        const jobPath = Array.isArray(member.jobPath) && member.jobPath.length ? member.jobPath : [member.role];
        const currentJobStage = Number.isInteger(member.jobStage) ? member.jobStage : Math.max(0, jobPath.indexOf(member.role));
        const nextJobStage = Math.min(currentJobStage + 1, jobPath.length - 1);
        const unlockedJob = nextJobStage > currentJobStage ? jobPath[nextJobStage] : null;
        alert(unlockedJob
          ? `${member.name} 한계 돌파 성공!\n새 직업 [${unlockedJob}]을(를) 획득하고 최대 레벨이 20 상승했습니다.`
          : `${member.name} 한계 돌파 성공! 최대 레벨이 20 상승했습니다.`
        );
        return {
          ...prev,
          guild: { ...prev.guild, gold: prev.guild.gold - cost },
          members: prev.members.map(m => m.id === memberId ? {
            ...m,
            maxLevel: m.maxLevel + 20,
            jobStage: nextJobStage,
            role: jobPath[nextJobStage]
          } : m)
        };
      } else {
        alert(`${member.name} 한계 돌파 실패... 정신력이 0이 되어 퀘스트 불가 상태가 됩니다.`);
        return {
          ...prev,
          guild: { ...prev.guild, gold: prev.guild.gold - cost },
          members: prev.members.map(m => m.id === memberId ? { ...m, sanity: 0, status: 'locked' } : m)
        };
      }
    });
  };

  const handleDispatchQuest = (quest, selectedMembers) => {
      const duration = quest.rank.includes('S') ? 20 : quest.rank.includes('A') ? 15 : 10;
      
      const newActiveQuest = {
          id: createId('aq'),
          quest,
          members: selectedMembers,
          endTime: Date.now() + (duration * 1000)
      };

      const selectedMemberIds = selectedMembers.map(m => m.id);

      setGameState(prev => ({
          ...prev,
          activeQuests: [...(prev.activeQuests || []), newActiveQuest],
          members: prev.members.map(m => 
              selectedMemberIds.includes(m.id) ? { ...m, status: 'questing' } : m
          )
      }));
  };

  const handleCompleteQuest = (activeQuest) => {
      const avgSanity = activeQuest.members.reduce((acc, m) => acc + m.sanity, 0) / activeQuest.members.length;
      const actualRate = activeQuest.quest.successRate * (avgSanity / 100);
      const isSuccess = Math.random() * 100 <= actualRate;
      
      const memberIds = activeQuest.members.map(m => m.id);

      setTempResult({ success: isSuccess, quest: activeQuest.quest, members: activeQuest.members });
      
      setGameState(prev => {
          let newGold = prev.guild.gold;
          let newFame = prev.guild.fame;
          let newExp = prev.guild.exp || 0; 
          
          if(isSuccess) {
              newGold += activeQuest.quest.rewards.gold;
              newFame += activeQuest.quest.rewards.fame;
              newExp += activeQuest.quest.rewards.exp;
          }
          
          return {
              ...prev,
              guild: { ...prev.guild, gold: newGold, fame: newFame, exp: newExp },
              activeQuests: prev.activeQuests.filter(aq => aq.id !== activeQuest.id),
              members: prev.members.map(m => {
                  if (memberIds.includes(m.id)) {
                      const newSanity = Math.max(0, m.sanity - 20);
                      return { ...m, sanity: newSanity, status: newSanity === 0 ? 'locked' : 'active' };
                  }
                  return m;
              })
          };
      });
      setCurrentView('questResult');
  };

  const handleGachaComplete = (newMembers) => {
      setGameState(prev => {
          let addedExp = 0;
          const convertedMessages = [];
          const finalMembers = [...prev.members];

          newMembers.forEach(newMem => {
              const isDuplicate = finalMembers.some(m => m.name === newMem.name);
              if (isDuplicate) {
                  let expGain = 50;
                  if (newMem.rank.includes('SS')) expGain = 1000;
                  else if (newMem.rank.includes('S')) expGain = 500;
                  else if (newMem.rank.includes('A')) expGain = 300;
                  else if (newMem.rank.includes('B')) expGain = 200;
                  else if (newMem.rank.includes('C')) expGain = 100;
                  else if (newMem.rank.includes('D')) expGain = 50;
                  else expGain = 10;
                  
                  addedExp += expGain;
                  convertedMessages.push(`${newMem.name}(+${expGain}E)`);
              } else {
                  finalMembers.push(newMem);
              }
          });

          if (convertedMessages.length > 0) {
              alert(`중복된 길드원이 경험치로 변환되었습니다!\n\n${convertedMessages.join('\n')}`);
          }

          return {
              ...prev,
              guild: { 
                  ...prev.guild, 
                  gold: Math.max(0, prev.guild.gold - 1200), 
                  exp: (prev.guild.exp || 0) + addedExp 
              },
              members: finalMembers
          };
      });
      setCurrentView('main');
  };

  const handleAlchemyComplete = (result) => {
      setTempResult(result);
      setCurrentView('alchemyResult');
  };

  const handleAlchemyStore = (result) => {
      setGameState(prev => {
          const potionName = '의문의 마나 물약';
          const inventory = prev.inventory || [];
          
          const existingIdx = inventory.findIndex(i => i.rank === result.rank && i.name === potionName);
          
          let newInventory = [...inventory];
          if (existingIdx >= 0) {
              newInventory[existingIdx] = {
                  ...newInventory[existingIdx],
                  count: newInventory[existingIdx].count + 1
              };
          } else {
              newInventory.push({
                  id: createId('inv'),
                  name: potionName,
                  rank: result.rank,
                  count: 1
              });
          }
          return { ...prev, inventory: newInventory };
      });
      
      setCurrentView('main');
      setActiveTab('vault');
  };

  const handleAlchemySell = (price) => {
      setGameState(prev => ({
          ...prev,
          guild: { ...prev.guild, gold: prev.guild.gold + price }
      }));
      setCurrentView('main');
      setActiveTab('home');
  };

  const renderContent = () => {
      if(currentView === 'gacha') return <GachaView onSelectComplete={handleGachaComplete} />;

      switch(activeTab) {
          case 'home': return <HomeView guild={gameState.guild} />;
          case 'members': return <MemberManagementView 
                                    members={gameState.members} 
                                    guildExp={gameState.guild.exp}
                                    onHealMember={handleHealMember} 
                                    onRecruitClick={() => setCurrentView('gacha')} 
                                    onInterviewClick={(m) => setInterviewMember(m)} 
                                    onLevelUp={handleLevelUp}
                                    onLimitBreak={handleLimitBreak}
                                 />;
          case 'quests': return <QuestsView 
                                    quests={gameState.quests} 
                                    members={gameState.members} 
                                    activeQuests={gameState.activeQuests || []}
                                    onStartQuest={handleDispatchQuest} 
                                    onCompleteQuest={handleCompleteQuest}
                                 />;
          case 'alchemy': return <AlchemyView onComplete={handleAlchemyComplete} />;
          case 'vault': return <VaultView inventory={gameState.inventory || []} />;
          default: return <div className="pt-24 text-center text-[#d0c5af] font-bold text-xl">메뉴를 선택해주세요.</div>;
      }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#131313] text-[#e5e2e1] overflow-hidden relative">
      <style>{styles}</style>
      
      {currentView === 'main' && <TopBar guild={gameState.guild} titleOverride={activeTab === 'alchemy' ? '연금술 연구' : activeTab === 'members' ? '길드원 관리' : activeTab === 'quests' ? '외부 행사' : activeTab === 'vault' ? '창고 관리' : null} />}

      <div className="flex-1 overflow-hidden relative pb-[80px] pt-16">
         <div className="h-full w-full overflow-y-auto custom-scroll">
            {renderContent()}
         </div>
      </div>

      {currentView === 'main' && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}

      {currentView === 'questResult' && <QuestResultView result={tempResult} onClose={() => setCurrentView('main')} />}
      
      {currentView === 'alchemyResult' && <AlchemyResultView result={tempResult} onFinish={() => handleAlchemyStore(tempResult)} onSell={handleAlchemySell} />}

      {/* 💡 InterviewModal에 onComplete 프롭스로 handleInterviewComplete를 넘겨줍니다 */}
      {interviewMember && (
        <InterviewModal 
          member={interviewMember} 
          onClose={() => setInterviewMember(null)}
          onComplete={handleInterviewComplete}
        />
      )}
    </div>
  );
}
