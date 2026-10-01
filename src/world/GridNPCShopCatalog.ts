export interface GridNPCShopDefinition{id:string;type:'GENERAL'|'FOOD'|'CRAFT'|'ARMORY'|'PAWN'|'APOTHECARY'|'MOUNT'|'ART'|'MAGIC'|'TECH';name:string;services:string[];inventoryTags:string[];}
export const GRID_NPC_SHOPS:GridNPCShopDefinition[]=[
{id:'general',type:'GENERAL',name:'General Exchange',services:['buy','sell','repair'],inventoryTags:['supplies','bags','tools']},
{id:'food',type:'FOOD',name:'World Kitchen',services:['buy','eat','takeaway'],inventoryTags:['digi-food','ingredients','recipes']},
{id:'craft',type:'CRAFT',name:'Artisan Foundry',services:['craft','orders','materials'],inventoryTags:['ore','wood','crystal','tools']},
{id:'armory',type:'ARMORY',name:'Sentinel Armory',services:['buy','repair','upgrade'],inventoryTags:['armor','weapons','shields']},
{id:'pawn',type:'PAWN',name:'Grid Pawn & Exchange',services:['appraise','buy','sell','loan'],inventoryTags:['collectibles','gear','currency','art']},
{id:'apothecary',type:'APOTHECARY',name:'Living Apothecary',services:['buy','craft'],inventoryTags:['herbs','potions','remedies']},
{id:'mount',type:'MOUNT',name:'Wayfarer Stables',services:['buy','breed','care'],inventoryTags:['mounts','feed','tack']},
{id:'art',type:'ART',name:'Gallery Exchange',services:['buy','display','commission'],inventoryTags:['art','media','sculpture']},
{id:'magic',type:'MAGIC',name:'Aether Curio',services:['buy','identify','trade'],inventoryTags:['relics','runes','aether']},
{id:'tech',type:'TECH',name:'Omni Techworks',services:['buy','repair','craft'],inventoryTags:['devices','modules','drones']}
];