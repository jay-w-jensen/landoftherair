
import { GameWorld } from './GameWorld';

export class InstancedDungeon extends GameWorld {

  public partyOwner: string;

  get canMemorize(): boolean {
    return false;
  }

  get exitPoint() {
    const { kickMap, kickX, kickY } = this.state.map.properties;
    return { kickMap, kickX, kickY };
  }

  async onInit(options): Promise<void> {
    if(options.party) {
      this.partyOwner = options.party;

      // no party in an instanced dungeon means you probably quit in it
    } else {
      options.skipMostOfLoad = true;
    }

    await super.onInit(options);
  }

  async onJoin(client, options): Promise<boolean> {
    await super.onJoin(client, options);

    const player = this.state.findPlayer(options.username);
    if(!player.partyName || (this.partyOwner && player.partyName !== this.partyOwner)) {
      const { kickMap, kickX, kickY } = this.exitPoint;
      await this.teleport(player, { newMap: kickMap, x: kickX, y: kickY });
      return false;
    }

    return true;
  }

  requestJoin(options): boolean {
    return !this.partyOwner || this.partyOwner === options.party;
  }

  // don't save boss timers for now
  protected saveBossTimers() {}
}
