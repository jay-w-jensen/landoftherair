import { NPC } from '../../../../shared/models/npc';
import { NPCLoader } from '../../../helpers/character/npc-loader';
import { EncrusterResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.rightHand = await NPCLoader.loadItem('Antanian Purple Gem');
};

export const responses = (npc: NPC) => {
  EncrusterResponses(npc);
};
