
import { find } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';

export class PotionToMerchant extends Command {

  public name = '~PtM';
  public format = 'MerchantUUID';

  execute(player: Player, { room, gameState, args }) {

    const merchantUUID = args;

    if(!this.checkPlayerEmptyHand(player)) return;

    const container = room.state.findNPC(merchantUUID);
    if(!container) return player.sendClientMessage('That person is not here.');
    if(container.distFrom(player) > 2) return player.sendClientMessage('That person is too far away.');

    const item = player.potionHand;
    if(!item) return false;

    player.setPotionHand(null);
    player.sellItem(item);
  }

}