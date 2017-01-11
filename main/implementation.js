/* @flow */

let Wit = null;
let interactive = null;
Wit = require('node-wit').Wit;
interactive = require('node-wit').interactive;

const accessToken = (() => {
  if (process.argv.length !== 3) {
    console.log('usage: node main/implementation');
    process.exit(1);
  }
  return process.argv[2];
})();

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const actions = {
  send (request, response) {
    console.log('sending...', JSON.stringify(response));
  },
  getForecast ({context, entities}) {
    const location = firstEntityValue(entities, 'location');
    if (location) {
     /* global fetch */
      return fetch(
      `https://api.apixu.com/v1/forecast.json?key=b0fdaddb182f4868b47201624170601&q=${location}`
    )
.then(response => response.json())
    .then(responseJSON => {
      context.forecast = `It s currently ${responseJSON.current.temp_c} °C in ${location} And the weather conditions is: ${responseJSON.current.condition.text}`;
      delete context.missingLocation;
      return context;
    });
    } else {
      context.missingLocation = true;
      delete context.forecast;
    }
    return context;
  }
};

const client = new Wit({accessToken, actions});
interactive(client);
