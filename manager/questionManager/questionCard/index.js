import QuesitonCard from './question.jsx';
import GreetingCard from './greeting.jsx';
import InputCard from './input.jsx';
import TandCCard from './tandc.jsx';
import CarouselCard from './carousel.jsx';

let allCards = [
  GreetingCard,
  QuesitonCard,
  InputCard,
  TandCCard,
  CarouselCard,
];

export let questionCardGeneratorMap = allCards.reduce((map, questionCard) => {
  map[questionCard.getType()] = questionCard.getGenerator();
  return map;
}, {});

export let questionWithNextMap = allCards.reduce((map, questionCard) => {
  map[questionCard.getType()] = questionCard.canHaveNext();
  return map;
}, {});
