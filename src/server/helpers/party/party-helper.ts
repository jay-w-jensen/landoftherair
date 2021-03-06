
import { Player } from '../../../shared/models/player';
import { Allegiance } from '../../../shared/models/character';

export class PartyHelper {

  static shareRepWithParty(player: Player, allegiance: Allegiance, delta: number) {
    const party = player.party;

    const members = party.members;

    members.forEach(({ username }) => {
      if(username === player.username) return;

      const partyMember = player.$$room.state.findPlayer(username);

      if(!partyMember || player.distFrom(partyMember) > 7) return;

      partyMember.changeRep(allegiance, delta, true);
    });
  }

  static shareSkillWithParty(player: Player, skill: number) {
    const party = player.party;

    const members = party.members;

    if(members.length > 4) {
      skill = skill * 0.75;
    }

    if(members.length > 7) {
      skill = skill * 0.75;
    }

    skill = Math.floor(skill);

    members.forEach(({ username }) => {
      if(username === player.username) return;

      const partyMember = player.$$room.state.findPlayer(username);

      if(!partyMember || player.distFrom(partyMember) > 7) return;

      partyMember.gainCurrentSkills(skill);
    });
  }

  static shareExpWithParty(player: Player, exp: number): number {
    const party = player.party;

    const members = party.members;

    if(members.length > 4) {
      exp = exp * 0.75;
    }

    if(members.length > 7) {
      exp = exp * 0.75;
    }

    exp = Math.floor(exp);

    let foundMembers = 0;

    members.forEach(({ username }) => {
      if(username === player.username) return;

      const partyMember = player.$$room.state.findPlayer(username);

      if(!partyMember || player.distFrom(partyMember) > 7) return;

      foundMembers++;

      partyMember.gainExp(exp);
    });

    return foundMembers;
  }

  static shareKillsWithParty(player: Player, questOpts) {
    const party = player.party;

    const members = party.members;

    members.forEach(({ username }) => {
      if(username === player.username) return;

      const partyMember = player.$$room.state.findPlayer(username);

      if(!partyMember || player.distFrom(partyMember) > 7) return;

      partyMember.checkForQuestUpdates(questOpts);
    });
  }
}
