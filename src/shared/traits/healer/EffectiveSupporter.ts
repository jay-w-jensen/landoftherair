
import { Trait } from '../../models/trait';

export class EffectiveSupporter extends Trait {

  static baseClass = 'Healer';
  static traitName = 'EffectiveSupporter';
  static description = 'Your support spells last 10% longer per point.';
  static icon = 'burning-passion';

  static tpCost = 10;
  static maxLevel = 10;

}
