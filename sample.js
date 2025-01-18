const Mustache = require('mustache');

export const Valeview = {
  title: "Joe",
  calc: () => ( 2 + 4 )
};

const output = Mustache.render("{{title}} spends {{calc}}", view);
console.log("v++");