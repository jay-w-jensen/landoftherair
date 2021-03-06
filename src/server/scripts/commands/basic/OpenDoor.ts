
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MapLayer } from '../../../../shared/models/maplayer';
import { find, includes } from 'lodash';
import { MoveHelper } from '../../../helpers/character/move-helper';

export class OpenDoor extends Command {

  public name = ['open', 'close'];
  public format = 'DIR';

  execute(player: Player, { gameState, args }) {
    if(!args) return false;

    let { x, y } = player.getXYFromDir(args);

    if(includes(args, ' ')) {
      [x, y] = args.split(' ').map(z => +z);
    }

    const map = gameState.map;
    const interactables = map.layers[MapLayer.Interactables].objects;

    const targetX = (player.x + x);
    const targetY = (player.y + y + 1);

    const door = find(interactables, { x: targetX * 64, y: targetY * 64, type: 'Door' });

    if(!door) {
      player.sendClientMessage('There is no door there.');
      return;
    }

    MoveHelper.tryToOpenDoor(player, door, { gameState });
  }

}
