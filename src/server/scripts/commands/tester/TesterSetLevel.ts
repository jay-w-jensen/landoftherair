
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SubscriptionHelper } from '../../../helpers/account/subscription-helper';
import { TesterHelper } from '../../../helpers/tester/tester-helper';

export class TesterSetLevel extends Command {

  public name = '^level';
  public format = 'Level';

  async execute(player: Player, { args }) {
    if(!SubscriptionHelper.isGM(player) && !SubscriptionHelper.isTester(player)) return;

    const level = Math.floor(+args);
    if(level < 1 || isNaN(level)) return false;

    TesterHelper.setLevel(player, level);
  }

}
