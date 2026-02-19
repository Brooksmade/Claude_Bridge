const fs = require('fs');
const data = JSON.parse(fs.readFileSync('E:/github/FigmaPlugin/variables_data.json', 'utf8')).data;
const collections = data.collections;

// Build hex-to-variableId map for COLOR variables
const colorMap = {};
for (const col of collections) {
  for (const v of col.variables) {
    const modes = v.valuesByMode || {};
    for (const modeId of Object.keys(modes)) {
      const val = modes[modeId];
      let hexVal = null;
      if (typeof val === 'string' && val.startsWith('#')) {
        hexVal = val.toUpperCase();
      } else if (val && typeof val === 'object' && 'r' in val) {
        const r = Math.round(val.r * 255).toString(16).padStart(2, '0');
        const g = Math.round(val.g * 255).toString(16).padStart(2, '0');
        const b = Math.round(val.b * 255).toString(16).padStart(2, '0');
        hexVal = '#' + (r + g + b).toUpperCase();
      }
      // Only add color hex values (skip numbers, strings that aren't colors)
      if (hexVal && !colorMap[hexVal]) {
        colorMap[hexVal] = {id: v.id, name: v.name, collection: col.name};
      }
    }
  }
}

console.log('Color variables mapped: ' + Object.keys(colorMap).length);
const entries = Object.entries(colorMap).sort((a,b) => a[0].localeCompare(b[0]));
for (const [hex, info] of entries) {
  console.log('  ' + hex + ' -> ' + info.name + ' (' + info.id + ')');
}

fs.writeFileSync('E:/github/FigmaPlugin/color_var_map.json', JSON.stringify(colorMap, null, 2));
