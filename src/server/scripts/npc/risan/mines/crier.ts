import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/character/npc-loader';
import { RandomlyShouts, CrierResponses } from '../../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  CrierResponses(npc);
  RandomlyShouts(npc, [
    'You should not go far without armor or weapons!',
    'Potions can be a saving grace!',
    'The Alchemist can make your potions last longer!',
    'Thieves prefer to hide!',
    'The Banker can hold onto your gold!',
    'The Smith can repair your broken and breaking gear!',
    'Try asking the Healer to RECALL you!',
    'The Healer can REVIVE your comrades!',
    'The hidden library is rumored to have great treasures!'
  ]);

};
