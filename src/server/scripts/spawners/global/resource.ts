
import { Spawner } from '../../../base/Spawner';
import { extend } from 'lodash';

export class ResourceSpawner extends Spawner {

  constructor(room, opts, properties) {

    const spawnerProps = extend({
      respawnRate: 3600,
      initialSpawn: 1,
      maxSpawn: 1,
      spawnRadius: 0,
      randomWalkRadius: 0,
      leashRadius: 0,
      shouldSerialize: true,
      alwaysSpawn: true,
      requireDeadToRespawn: true,
      npcAISettings: ['resource']
    }, properties);

    spawnerProps.npcIds = properties.resourceIds || [];

    super(room, opts, spawnerProps);
  }

}
