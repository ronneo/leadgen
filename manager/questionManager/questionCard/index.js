import QuesitonCard from './question.jsx';
import GreetingCard from './greeting.jsx';
import InputCard from './input.jsx';
import TandCCard from './tandc.jsx';

let allCards = [
  GreetingCard,
  QuesitonCard,
  InputCard,
  TandCCard,
];

export let questionCardGeneratorMap = allCards.reduce((map, questionCard) => {
  map[questionCard.getType()] = questionCard.getGenerator();
  return map;
}, {});

export let questionWithNextMap = allCards.reduce((map, questionCard) => {
  map[questionCard.getType()] = questionCard.canHaveNext();
  return map;
}, {});
