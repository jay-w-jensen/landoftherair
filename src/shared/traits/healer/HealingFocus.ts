
import { Trait } from '../../models/trait';

export class HealingFocus extends Trait {

  static baseClass = 'Healer';
  static traitName = 'HealingFocus';
  static description = 'Heal 4% more health per point when you use restorative magic.';
  static icon = 'health-increase';

  static tpCost = 10;
  static maxLevel = 10;

}
