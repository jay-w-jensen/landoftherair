
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class PotionToRight extends Command {

  public name = '~PtR';
  public format = '';

  async execute(player: Player) {
    if(this.isAccessingLocker(player)) return;
    if(!player.potionHand) return false;

    this.trySwapRightToLeft(player);

    player.setRightHand(player.potionHand);
    player.setPotionHand(null);
  }

}
