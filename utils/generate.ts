import { translations } from './translations';
import { obfuscateTree } from './obfuscation';
import * as fs from 'fs';

const obfuscated = obfuscateTree(translations);
fs.writeFileSync('./utils/obfuscated_data.json', JSON.stringify(obfuscated, null, 2));
console.log("Obfuscation successful!");
