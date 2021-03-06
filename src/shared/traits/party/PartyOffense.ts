
import { PartyTrait } from '../../models/partytrait';

export class PartyOffense extends PartyTrait {

  static traitName = 'PartyOffense';
  static description = 'Increase your offensive capabilities while in a party.';
  static icon = 'sword-clash';

  static tpCost = 20;
  static maxLevel = 10;

}
