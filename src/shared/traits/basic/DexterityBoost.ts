
import { Trait } from '../../models/trait';
import { Player } from '../../models/player';

export class DexterityBoost extends Trait {

  static increaseLevel = false;
  static traitName = 'DexterityBoost';
  static description = 'Increase your dexterity by 1 point.';
  static icon = 'bowman';

  static tpCost = 10;
  static maxLevel = 15;

  static currentLevel(player: Player): number {
    return player.baseStats.dex;
  }

  static canBuy(player: Player) {
    return Trait.canBuy(player) && player.baseStats.dex < 15;
  }

  static buy(player: Player) {
    Trait.buy(player);
    player.gainBaseStat('dex');
  }

}
