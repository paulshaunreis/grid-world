export type GridGameKind='MONSTER_BATTLE'|'GRID_DUEL'|'DICE'|'SOLITAIRE'|'POKER_SOCIAL'|'CHESS'|'CHECKERS'|'RACING'|'PUZZLE'|'ARENA';
export interface GridGameDefinition{id:GridGameKind;name:string;inWorld:boolean;web:boolean;mobile:boolean;cashWagering:boolean;rewardKinds:string[];}
export const GRID_GAMES:GridGameDefinition[]=[
{id:'MONSTER_BATTLE',name:'Grid Monsters',inWorld:true,web:true,mobile:true,cashWagering:false,rewardKinds:['GRID','ITEM','COSMETIC']},
{id:'GRID_DUEL',name:'Grid Duel',inWorld:true,web:true,mobile:true,cashWagering:false,rewardKinds:['GRID','CARD','COSMETIC']},
{id:'DICE',name:'Grid Dice',inWorld:true,web:true,mobile:true,cashWagering:false,rewardKinds:['GRID','ITEM']},
{id:'SOLITAIRE',name:'Grid Solitaire',inWorld:false,web:true,mobile:true,cashWagering:false,rewardKinds:['ACHIEVEMENT','COSMETIC']},
{id:'POKER_SOCIAL',name:'Grid Poker',inWorld:true,web:true,mobile:true,cashWagering:false,rewardKinds:['ACHIEVEMENT','COSMETIC']},
{id:'CHESS',name:'Grid Chess',inWorld:true,web:true,mobile:true,cashWagering:false,rewardKinds:['GRID','COSMETIC']},
{id:'CHECKERS',name:'Grid Checkers',inWorld:true,web:true,mobile:true,cashWagering:false,rewardKinds:['GRID','COSMETIC']},
{id:'RACING',name:'Grid Racing',inWorld:true,web:true,mobile:true,cashWagering:false,rewardKinds:['GRID','ITEM','COSMETIC']},
{id:'PUZZLE',name:'Grid Puzzles',inWorld:true,web:true,mobile:true,cashWagering:false,rewardKinds:['GRID','ACHIEVEMENT']},
{id:'ARENA',name:'Grid Arena',inWorld:true,web:true,mobile:true,cashWagering:false,rewardKinds:['GRID','ITEM','COSMETIC']}
];