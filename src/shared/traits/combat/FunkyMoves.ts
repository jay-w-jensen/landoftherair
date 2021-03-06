
import { Trait } from '../../models/trait';

export class FunkyMoves extends Trait {

  static traitName = 'FunkyMoves';
  static description = 'Learn to dance better, increasing your defense by 1 per point.';
  static icon = 'wingfoot';

  static tpCost = 20;
  static maxLevel = 5;

}
