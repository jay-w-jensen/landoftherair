
import { Trait } from '../../models/trait';

export class MagicFocus extends Trait {

  static baseClass = 'Mage';
  static traitName = 'MagicFocus';
  static description = 'Deal 4% more energy damage per point.';
  static icon = 'plasma-bolt';

  static tpCost = 10;
  static maxLevel = 10;

}
