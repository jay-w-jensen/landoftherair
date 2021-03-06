import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/character/npc-loader';

const GOLEM_ROCK = 'Antanian Golem Brain';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  npc.rightHand = await NPCLoader.loadItem(GOLEM_ROCK);
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  npc.parser.addCommand('hello')
    .set('syntax', ['hello'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      return `Hey! You! Help! I'm trapped in here. At least I think so. Name's Rocky, I'm a golem or somethin'. 
      They made me smart and stuff but I seem to be stuck between a ROCK and a hard place. Ha ha.`;
    });
  npc.parser.addCommand('rock')
    .set('syntax', ['rock'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      return `Yeah! Yeah! Get it, 'cause I'm made of rocks and we're in a place made of- nevermind. 
      Anyway, I can UPGRADE your gear to make it hard as a rock. Heh heh. 
      You might have a lil' trouble finding 'em though, I don't think these guys are as smart as me.`;
    });

  npc.parser.addCommand('upgrade')
    .set('syntax', ['upgrade'])
    .set('logic', (args, { player }) => {
      if(npc.distFrom(player) > 0) return 'Please move closer.';

      const REQUIRED_ROCKS = 4;

      if(NPCLoader.checkPlayerHeldItem(player, GOLEM_ROCK, 'left')) {

        const right = player.rightHand;
        if(!right) return 'Please hold an item in your right hand.';
        right.stats.defense = right.stats.defense || 0;
        if(right.stats.defense !== 0) return 'That item already has defense adds!';

        let indexes = NPCLoader.getItemsFromPlayerSackByName(player, GOLEM_ROCK);
        indexes = indexes.slice(0, REQUIRED_ROCKS);

        if(indexes.length < REQUIRED_ROCKS) return 'You do not have enough golem brains for that!';

        NPCLoader.takePlayerItem(player, GOLEM_ROCK, 'left');
        NPCLoader.takeItemsFromPlayerSack(player, indexes);

        right.stats.defense += 1;
        player.recalculateStats();

        return `Thanks, ${player.name}! I've upgraded your ${player.rightHand.itemClass.toLowerCase()}. 
        And thanks for the rocks, heheh. I'm gonna be the smartest rock in this cave.`;
      }

      return `Hold one golem brain in your left hand, and I'll take that one plus four from your sack. 
      Hold a piece of gear with no defensive adds in your right hand, and it will help you better in combat!`;
    });
};
