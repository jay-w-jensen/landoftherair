
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SubscriptionHelper } from '../../../helpers/account/subscription-helper';
import { TesterHelper } from '../../../helpers/tester/tester-helper';

export class TesterSetHP extends Command {

  public name = '^hp';
  public format = 'HP';

  async execute(player: Player, { args }) {
    if(!SubscriptionHelper.isGM(player) && !SubscriptionHelper.isTester(player)) return;

    const hp = Math.floor(+args);
    if(hp < 1 || isNaN(hp)) return false;

    TesterHelper.setHP(player, hp);
  }

}
