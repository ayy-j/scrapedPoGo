const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'shinies.min.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const fixes = [
  { find: 'pm79.f_2020.s.icon.png', replace: 'pm79.f2020.s.icon.png' },
  { find: 'pm80.f_2021.s.icon.png', replace: 'pm80.f2021.s.icon.png' },
  { find: 'pm225.cWINTER_2018.s.icon.png', replace: 'pm225.fWINTER_2020.s.icon.png' },
  { find: 'pm302.fFALL_2020.s.icon.png', replace: 'pokemon_icon_302_00_shiny.png', pathChange: true },
  { find: 'pm569.fGIGANTAMAX.s.icon.png', replace: 'pokemon_icon_569_00_shiny.png', pathChange: true }
];

let changeCount = 0;

data.forEach(pokemon => {
  fixes.forEach(fix => {
    if (pokemon.imageUrl && pokemon.imageUrl.includes(fix.find)) {
      if (fix.pathChange) {
        // Change to base path
        pokemon.imageUrl = `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon%20-%20256x256/${fix.replace}`;
      } else {
        pokemon.imageUrl = pokemon.imageUrl.replace(fix.find, fix.replace);
      }
      console.log(`Fixed: #${pokemon.dexNumber} ${pokemon.name}`);
      changeCount++;
    }
  });
  
  // Also check forms
  if (pokemon.forms) {
    pokemon.forms.forEach(form => {
      fixes.forEach(fix => {
        if (form.imageUrl && form.imageUrl.includes(fix.find)) {
          if (fix.pathChange) {
            form.imageUrl = `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Pokemon%20-%20256x256/${fix.replace}`;
          } else {
            form.imageUrl = form.imageUrl.replace(fix.find, fix.replace);
          }
          console.log(`Fixed form: #${pokemon.dexNumber} ${pokemon.name} - ${form.name}`);
          changeCount++;
        }
      });
    });
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data));
console.log(`\nTotal fixes applied: ${changeCount}`);
console.log('Data file updated successfully!');
