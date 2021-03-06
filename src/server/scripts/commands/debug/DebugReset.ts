
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class DebugReset extends Command {

  public name = '~~reset';

  execute(player: Player) {
    player.clearEffects();
    player.resetAdditionalStats();

  }

}
