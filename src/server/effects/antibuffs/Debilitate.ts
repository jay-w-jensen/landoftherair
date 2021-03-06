
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { RecentlyDebilitated } from '../recents/RecentlyDebilitated';

export class Debilitate extends SpellEffect {

  iconData = {
    name: 'one-eyed',
    color: '#f00',
    tooltipDesc: 'All hidden attacks against this target are counted as backstabs.'
  };

  maxSkillForSkillGain = 16;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagCasterName(caster.name);

    this.duration = 10;

    if(target.hasEffect('RecentlyDebilitated') || target.hasEffect('Debilitate')) {
      return this.effectMessage(caster, `${target.name} resisted your debilitation!`);
    }

    target.addAgro(caster, 30);
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You feel like you see daggers in every corner of your vision!');
  }

  effectEnd(char: Character) {
    const recentlyDebilitated = new RecentlyDebilitated({});
    recentlyDebilitated.cast(char, char);
    this.effectMessage(char, 'Your perception of the hidden is heightened!');
  }
}
