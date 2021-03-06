import { NPC } from '../../../../shared/models/npc';
import { NPCLoader } from '../../../helpers/character/npc-loader';
import { RandomlyShouts, TannerResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  TannerResponses(npc);
  RandomlyShouts(npc, [
    'Best furs made from your kills!',
    'Bring your kills, leave with furs!',
    'You kill them, we clean them!',
    'Most fur is better than a tunic!'
  ]);

};
