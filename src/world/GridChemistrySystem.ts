import { GRID_MINERALS, type GridMineralKind } from './GridMineralSystem';

/**
 * Grid Chemistry is the elemental foundation beneath minerals, geology,
 * crafting, refining, ecology and future world generation.
 *
 * Element names/symbols/atomic numbers follow the modern periodic table.
 * Grid mineral names remain fictional, while their natural chemistry stays
 * traceable to real minerals and elements.
 */

export interface GridElementDefinition {
  atomicNumber: number;
  symbol: string;
  name: string;
  category: 'ALKALI_METAL'|'ALKALINE_EARTH'|'TRANSITION_METAL'|'POST_TRANSITION_METAL'|'METALLOID'|'NONMETAL'|'HALOGEN'|'NOBLE_GAS'|'LANTHANIDE'|'ACTINIDE';
  period: number;
  group?: number;
}

const ELEMENT_ROWS: Array<[number,string,string,GridElementDefinition['category'],number,number?]> = [
[1,'H','Hydrogen','NONMETAL',1,1],[2,'He','Helium','NOBLE_GAS',1,18],
[3,'Li','Lithium','ALKALI_METAL',2,1],[4,'Be','Beryllium','ALKALINE_EARTH',2,2],[5,'B','Boron','METALLOID',2,13],[6,'C','Carbon','NONMETAL',2,14],[7,'N','Nitrogen','NONMETAL',2,15],[8,'O','Oxygen','NONMETAL',2,16],[9,'F','Fluorine','HALOGEN',2,17],[10,'Ne','Neon','NOBLE_GAS',2,18],
[11,'Na','Sodium','ALKALI_METAL',3,1],[12,'Mg','Magnesium','ALKALINE_EARTH',3,2],[13,'Al','Aluminium','POST_TRANSITION_METAL',3,13],[14,'Si','Silicon','METALLOID',3,14],[15,'P','Phosphorus','NONMETAL',3,15],[16,'S','Sulfur','NONMETAL',3,16],[17,'Cl','Chlorine','HALOGEN',3,17],[18,'Ar','Argon','NOBLE_GAS',3,18],
[19,'K','Potassium','ALKALI_METAL',4,1],[20,'Ca','Calcium','ALKALINE_EARTH',4,2],[21,'Sc','Scandium','TRANSITION_METAL',4,3],[22,'Ti','Titanium','TRANSITION_METAL',4,4],[23,'V','Vanadium','TRANSITION_METAL',4,5],[24,'Cr','Chromium','TRANSITION_METAL',4,6],[25,'Mn','Manganese','TRANSITION_METAL',4,7],[26,'Fe','Iron','TRANSITION_METAL',4,8],[27,'Co','Cobalt','TRANSITION_METAL',4,9],[28,'Ni','Nickel','TRANSITION_METAL',4,10],[29,'Cu','Copper','TRANSITION_METAL',4,11],[30,'Zn','Zinc','TRANSITION_METAL',4,12],[31,'Ga','Gallium','POST_TRANSITION_METAL',4,13],[32,'Ge','Germanium','METALLOID',4,14],[33,'As','Arsenic','METALLOID',4,15],[34,'Se','Selenium','NONMETAL',4,16],[35,'Br','Bromine','HALOGEN',4,17],[36,'Kr','Krypton','NOBLE_GAS',4,18],
[37,'Rb','Rubidium','ALKALI_METAL',5,1],[38,'Sr','Strontium','ALKALINE_EARTH',5,2],[39,'Y','Yttrium','TRANSITION_METAL',5,3],[40,'Zr','Zirconium','TRANSITION_METAL',5,4],[41,'Nb','Niobium','TRANSITION_METAL',5,5],[42,'Mo','Molybdenum','TRANSITION_METAL',5,6],[43,'Tc','Technetium','TRANSITION_METAL',5,7],[44,'Ru','Ruthenium','TRANSITION_METAL',5,8],[45,'Rh','Rhodium','TRANSITION_METAL',5,9],[46,'Pd','Palladium','TRANSITION_METAL',5,10],[47,'Ag','Silver','TRANSITION_METAL',5,11],[48,'Cd','Cadmium','TRANSITION_METAL',5,12],[49,'In','Indium','POST_TRANSITION_METAL',5,13],[50,'Sn','Tin','POST_TRANSITION_METAL',5,14],[51,'Sb','Antimony','METALLOID',5,15],[52,'Te','Tellurium','METALLOID',5,16],[53,'I','Iodine','HALOGEN',5,17],[54,'Xe','Xenon','NOBLE_GAS',5,18],
[55,'Cs','Caesium','ALKALI_METAL',6,1],[56,'Ba','Barium','ALKALINE_EARTH',6,2],[57,'La','Lanthanum','LANTHANIDE',6],[58,'Ce','Cerium','LANTHANIDE',6],[59,'Pr','Praseodymium','LANTHANIDE',6],[60,'Nd','Neodymium','LANTHANIDE',6],[61,'Pm','Promethium','LANTHANIDE',6],[62,'Sm','Samarium','LANTHANIDE',6],[63,'Eu','Europium','LANTHANIDE',6],[64,'Gd','Gadolinium','LANTHANIDE',6],[65,'Tb','Terbium','LANTHANIDE',6],[66,'Dy','Dysprosium','LANTHANIDE',6],[67,'Ho','Holmium','LANTHANIDE',6],[68,'Er','Erbium','LANTHANIDE',6],[69,'Tm','Thulium','LANTHANIDE',6],[70,'Yb','Ytterbium','LANTHANIDE',6],[71,'Lu','Lutetium','LANTHANIDE',6],
[72,'Hf','Hafnium','TRANSITION_METAL',6,4],[73,'Ta','Tantalum','TRANSITION_METAL',6,5],[74,'W','Tungsten','TRANSITION_METAL',6,6],[75,'Re','Rhenium','TRANSITION_METAL',6,7],[76,'Os','Osmium','TRANSITION_METAL',6,8],[77,'Ir','Iridium','TRANSITION_METAL',6,9],[78,'Pt','Platinum','TRANSITION_METAL',6,10],[79,'Au','Gold','TRANSITION_METAL',6,11],[80,'Hg','Mercury','TRANSITION_METAL',6,12],[81,'Tl','Thallium','POST_TRANSITION_METAL',6,13],[82,'Pb','Lead','POST_TRANSITION_METAL',6,14],[83,'Bi','Bismuth','POST_TRANSITION_METAL',6,15],[84,'Po','Polonium','POST_TRANSITION_METAL',6,16],[85,'At','Astatine','HALOGEN',6,17],[86,'Rn','Radon','NOBLE_GAS',6,18],
[87,'Fr','Francium','ALKALI_METAL',7,1],[88,'Ra','Radium','ALKALINE_EARTH',7,2],[89,'Ac','Actinium','ACTINIDE',7],[90,'Th','Thorium','ACTINIDE',7],[91,'Pa','Protactinium','ACTINIDE',7],[92,'U','Uranium','ACTINIDE',7],[93,'Np','Neptunium','ACTINIDE',7],[94,'Pu','Plutonium','ACTINIDE',7],[95,'Am','Americium','ACTINIDE',7],[96,'Cm','Curium','ACTINIDE',7],[97,'Bk','Berkelium','ACTINIDE',7],[98,'Cf','Californium','ACTINIDE',7],[99,'Es','Einsteinium','ACTINIDE',7],[100,'Fm','Fermium','ACTINIDE',7],[101,'Md','Mendelevium','ACTINIDE',7],[102,'No','Nobelium','ACTINIDE',7],[103,'Lr','Lawrencium','ACTINIDE',7],
[104,'Rf','Rutherfordium','TRANSITION_METAL',7,4],[105,'Db','Dubnium','TRANSITION_METAL',7,5],[106,'Sg','Seaborgium','TRANSITION_METAL',7,6],[107,'Bh','Bohrium','TRANSITION_METAL',7,7],[108,'Hs','Hassium','TRANSITION_METAL',7,8],[109,'Mt','Meitnerium','TRANSITION_METAL',7,9],[110,'Ds','Darmstadtium','TRANSITION_METAL',7,10],[111,'Rg','Roentgenium','TRANSITION_METAL',7,11],[112,'Cn','Copernicium','TRANSITION_METAL',7,12],[113,'Nh','Nihonium','POST_TRANSITION_METAL',7,13],[114,'Fl','Flerovium','POST_TRANSITION_METAL',7,14],[115,'Mc','Moscovium','POST_TRANSITION_METAL',7,15],[116,'Lv','Livermorium','POST_TRANSITION_METAL',7,16],[117,'Ts','Tennessine','HALOGEN',7,17],[118,'Og','Oganesson','NOBLE_GAS',7,18],
];

export const GRID_ELEMENTS: Readonly<Record<string, GridElementDefinition>> =
  Object.fromEntries(ELEMENT_ROWS.map(([atomicNumber,symbol,name,category,period,group]) => [
    symbol,
    { atomicNumber, symbol, name, category, period, group }
  ]));

export interface GridMineralChemistry {
  mineral: GridMineralKind;
  formula: string;
  mineralClass: 'NATIVE_ELEMENT'|'SILICATE'|'OXIDE'|'CARBONATE'|'HALIDE'|'SULFIDE'|'ORGANIC_LIKE';
  elements: readonly string[];
  formationFamilies: readonly ('IGNEOUS'|'HYDROTHERMAL'|'METAMORPHIC'|'SEDIMENTARY'|'EVAPORITE'|'WEATHERING')[];
}

export const GRID_MINERAL_CHEMISTRY: Readonly<Record<GridMineralKind, GridMineralChemistry>> = {
  GRID_AUREL:{mineral:'GRID_AUREL',formula:'Au',mineralClass:'NATIVE_ELEMENT',elements:['Au'],formationFamilies:['HYDROTHERMAL','METAMORPHIC']},
  GRID_CUPRIX:{mineral:'GRID_CUPRIX',formula:'Cu',mineralClass:'NATIVE_ELEMENT',elements:['Cu'],formationFamilies:['HYDROTHERMAL','WEATHERING']},
  GRID_ARGENT:{mineral:'GRID_ARGENT',formula:'Ag',mineralClass:'NATIVE_ELEMENT',elements:['Ag'],formationFamilies:['HYDROTHERMAL']},
  GRID_QUARTZ:{mineral:'GRID_QUARTZ',formula:'SiO2',mineralClass:'SILICATE',elements:['Si','O'],formationFamilies:['IGNEOUS','HYDROTHERMAL','METAMORPHIC','SEDIMENTARY']},
  GRID_AMETHYST:{mineral:'GRID_AMETHYST',formula:'SiO2',mineralClass:'SILICATE',elements:['Si','O'],formationFamilies:['IGNEOUS','HYDROTHERMAL']},
  GRID_FLUORITE:{mineral:'GRID_FLUORITE',formula:'CaF2',mineralClass:'HALIDE',elements:['Ca','F'],formationFamilies:['HYDROTHERMAL','SEDIMENTARY']},
  GRID_GARNET:{mineral:'GRID_GARNET',formula:'X3Y2(SiO4)3',mineralClass:'SILICATE',elements:['Si','O','Ca','Fe','Mg','Al','Mn'],formationFamilies:['IGNEOUS','METAMORPHIC']},
  GRID_OPAL:{mineral:'GRID_OPAL',formula:'SiO2·nH2O',mineralClass:'SILICATE',elements:['Si','O','H'],formationFamilies:['WEATHERING','SEDIMENTARY']},
  GRID_TOURMALINE:{mineral:'GRID_TOURMALINE',formula:'complex borosilicate',mineralClass:'SILICATE',elements:['B','Si','O','Al','Na','Li','Ca','Fe','Mg'],formationFamilies:['IGNEOUS','HYDROTHERMAL','METAMORPHIC']},
  GRID_CITRINE:{mineral:'GRID_CITRINE',formula:'SiO2',mineralClass:'SILICATE',elements:['Si','O'],formationFamilies:['IGNEOUS','HYDROTHERMAL']},
  GRID_TOPAZ:{mineral:'GRID_TOPAZ',formula:'Al2SiO4(F,OH)2',mineralClass:'SILICATE',elements:['Al','Si','O','F','H'],formationFamilies:['IGNEOUS','HYDROTHERMAL']},
  GRID_OBSIDIAN:{mineral:'GRID_OBSIDIAN',formula:'volcanic glass; variable',mineralClass:'SILICATE',elements:['Si','O','Al','Na','K','Ca','Fe','Mg'],formationFamilies:['IGNEOUS']},
  GRID_DIAMOND:{mineral:'GRID_DIAMOND',formula:'C',mineralClass:'NATIVE_ELEMENT',elements:['C'],formationFamilies:['METAMORPHIC','IGNEOUS']},
};

export function getGridElement(symbol: string) {
  return GRID_ELEMENTS[symbol];
}

export function getMineralChemistry(kind: GridMineralKind) {
  return GRID_MINERAL_CHEMISTRY[kind];
}

export function getMineralElements(kind: GridMineralKind) {
  return GRID_MINERAL_CHEMISTRY[kind].elements.map(getGridElement).filter(Boolean);
}
