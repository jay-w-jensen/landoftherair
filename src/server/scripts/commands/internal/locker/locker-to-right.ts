
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../models/player';
import { MapLayer } from '../../../../../models/gamestate';

export class LockerToRight extends Command {

  public name = '~WtR';
  public format = 'ItemSlot LockerID';

  async execute(player: Player, { room, gameState, args }) {

    const [slotId, lockerId] = args.split(' ');

    const slot = +slotId;
    if(isUndefined(slot)) return false;

    // check if player standing on locker and region is same as room region
    const interactable = find(gameState.map.layers[MapLayer.Interactables].objects, { x: player.x * 64, y: (player.y + 1) * 64, type: 'Locker' });

    if(!interactable) return player.sendClientMessage('There is no locker there.');

    const locker = await room.loadLocker(player, lockerId);
    if(!locker) return false;

    const item = locker.items[slot];
    if(!item) return false;

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full.');
    if(player.rightHand && !player.leftHand) {
      player.setLeftHand(player.rightHand);
    }

    player.setRightHand(item);
    locker.takeItemFromLocker(slot);
    room.updateLocker(player, locker);
  }

}
