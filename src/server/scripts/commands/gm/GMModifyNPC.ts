
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { merge } from 'lodash';

export class GMModifyNPC extends Command {

  public name = '@npcmod';
  public format = 'Target Props...';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    const [npcish, props] = args.split(' ', 2);
    const possTargets = room.getPossibleMessageTargets(player, npcish);
    if(!possTargets.length) return player.sendClientMessage('You do not see that person.');

    const target = possTargets[0];
    if(!target) return false;

    const fullProps = args.substring(args.indexOf(props));

    const mergeObj = this.getMergeObjectFromArgs(fullProps);

    merge(target, mergeObj);

  }
}