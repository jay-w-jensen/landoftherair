
import { Trait } from '../../models/trait';

export class EagleEye extends Trait {

  static traitName = 'EagleEye';
  static description = 'Sharpen your vision, increasing your accuracy by 1 per point.';
  static icon = 'bullseye';

  static tpCost = 10;
  static maxLevel = 10;

}
