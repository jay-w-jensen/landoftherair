import { NPC } from '../../../../shared/models/npc';
import { NPCLoader } from '../../../helpers/character/npc-loader';
import { DiplomatResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
};

export const responses = (npc: NPC) => {
  DiplomatResponses(npc);
};
