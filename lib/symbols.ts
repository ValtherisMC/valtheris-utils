export type MinecraftSymbol = {
  symbol: string;
  name: string;
  keywords: string[];
};

export type SymbolCategory = {
  id: string;
  label: string;
  description: string;
  symbols: MinecraftSymbol[];
};

export const symbolCategories: SymbolCategory[] = [
  {
    id: 'dividers',
    label: 'Dividers',
    description: 'Separatoare curate pentru titluri, lore si mesaje scurte.',
    symbols: [
      { symbol: '•', name: 'Bullet', keywords: ['dot', 'point', 'separator'] },
      { symbol: '·', name: 'Middle dot', keywords: ['dot', 'separator'] },
      { symbol: '◆', name: 'Diamond', keywords: ['rhombus', 'divider'] },
      { symbol: '◇', name: 'Outline diamond', keywords: ['rhombus', 'divider'] },
      { symbol: '■', name: 'Square', keywords: ['block', 'divider'] },
      { symbol: '□', name: 'Outline square', keywords: ['block', 'divider'] },
      { symbol: '▪', name: 'Small square', keywords: ['block', 'divider'] },
      { symbol: '▫', name: 'Small outline square', keywords: ['block', 'divider'] },
      { symbol: '▬', name: 'Bar', keywords: ['line', 'separator'] },
      { symbol: '━', name: 'Heavy line', keywords: ['line', 'separator'] },
      { symbol: '─', name: 'Line', keywords: ['line', 'separator'] },
      { symbol: '┃', name: 'Vertical bar', keywords: ['line', 'separator'] },
    ],
  },
  {
    id: 'arrows',
    label: 'Arrows',
    description: 'Sageti bune pentru meniuri, teleportari si indicatoare.',
    symbols: [
      { symbol: '➜', name: 'Arrow right', keywords: ['right', 'next'] },
      { symbol: '➤', name: 'Arrow head', keywords: ['right', 'next'] },
      { symbol: '»', name: 'Double right', keywords: ['right', 'menu'] },
      { symbol: '«', name: 'Double left', keywords: ['left', 'back'] },
      { symbol: '›', name: 'Single right', keywords: ['right', 'menu'] },
      { symbol: '‹', name: 'Single left', keywords: ['left', 'back'] },
      { symbol: '↑', name: 'Up arrow', keywords: ['up'] },
      { symbol: '↓', name: 'Down arrow', keywords: ['down'] },
      { symbol: '→', name: 'Right arrow', keywords: ['right'] },
      { symbol: '←', name: 'Left arrow', keywords: ['left'] },
      { symbol: '↳', name: 'Return arrow', keywords: ['sub', 'reply'] },
      { symbol: '↪', name: 'Hook arrow', keywords: ['next', 'redirect'] },
    ],
  },
  {
    id: 'ranks',
    label: 'Ranks',
    description: 'Accente pentru rank-uri, crates, reward-uri si anunturi.',
    symbols: [
      { symbol: '★', name: 'Star', keywords: ['rank', 'vip'] },
      { symbol: '☆', name: 'Outline star', keywords: ['rank', 'vip'] },
      { symbol: '✦', name: 'Spark star', keywords: ['rank', 'premium'] },
      { symbol: '✧', name: 'Outline spark', keywords: ['rank', 'premium'] },
      { symbol: '✪', name: 'Circled star', keywords: ['rank', 'badge'] },
      { symbol: '✰', name: 'Shadow star', keywords: ['rank', 'badge'] },
      { symbol: '✹', name: 'Sun star', keywords: ['crate', 'reward'] },
      { symbol: '✸', name: 'Heavy sparkle', keywords: ['crate', 'reward'] },
      { symbol: '♛', name: 'Crown', keywords: ['owner', 'king'] },
      { symbol: '♚', name: 'Outline crown', keywords: ['owner', 'king'] },
      { symbol: '✘', name: 'Cross', keywords: ['deny', 'bad'] },
      { symbol: '✔', name: 'Check', keywords: ['ok', 'confirm'] },
    ],
  },
  {
    id: 'decorative',
    label: 'Decorative',
    description: 'Simboluri decorative discrete pentru chat si scoreboard.',
    symbols: [
      { symbol: '✿', name: 'Flower', keywords: ['cute', 'decor'] },
      { symbol: '❀', name: 'Blossom', keywords: ['cute', 'decor'] },
      { symbol: '❖', name: 'Diamond sparkle', keywords: ['decor', 'premium'] },
      { symbol: '❯', name: 'Angle right', keywords: ['menu', 'decor'] },
      { symbol: '❮', name: 'Angle left', keywords: ['menu', 'decor'] },
      { symbol: '☄', name: 'Comet', keywords: ['event', 'decor'] },
      { symbol: '☾', name: 'Moon', keywords: ['night', 'decor'] },
      { symbol: '☀', name: 'Sun', keywords: ['day', 'decor'] },
      { symbol: '♢', name: 'Small diamond', keywords: ['decor', 'divider'] },
      { symbol: '♧', name: 'Club', keywords: ['decor'] },
      { symbol: '♤', name: 'Spade', keywords: ['decor'] },
      { symbol: '♨', name: 'Hot springs', keywords: ['hot', 'decor'] },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    description: 'Semne clare pentru status, reguli si mesaje administrative.',
    symbols: [
      { symbol: '⚠', name: 'Warning', keywords: ['alert', 'warn'] },
      { symbol: '⚑', name: 'Flag', keywords: ['claim', 'report'] },
      { symbol: '⚒', name: 'Tools', keywords: ['build', 'staff'] },
      { symbol: '⚔', name: 'Swords', keywords: ['pvp', 'combat'] },
      { symbol: '⚡', name: 'Lightning', keywords: ['fast', 'boost'] },
      { symbol: '☑', name: 'Checked box', keywords: ['done', 'ok'] },
      { symbol: '☒', name: 'Crossed box', keywords: ['deny', 'no'] },
      { symbol: '⊕', name: 'Plus circle', keywords: ['add', 'plus'] },
      { symbol: '⊖', name: 'Minus circle', keywords: ['remove', 'minus'] },
      { symbol: '∞', name: 'Infinity', keywords: ['forever', 'unlimited'] },
      { symbol: '⌛', name: 'Hourglass', keywords: ['time', 'wait'] },
      { symbol: '⌚', name: 'Watch', keywords: ['time', 'cooldown'] },
    ],
  },
];
