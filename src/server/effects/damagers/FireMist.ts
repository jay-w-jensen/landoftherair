
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';
import { MessageHelper } from '../../helpers/world/message-helper';

export class FireMist extends SpellEffect {

  maxSkillForSkillGain = 7;
  skillMults = [[0, 3], [11, 4], [21, 5]];

  private range: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const range = this.range || 1;

    target.sendClientMessageToRadius({ message: 'You hear a soft sizzling noise.', subClass: 'combat magic' }, 10);

    MessageHelper.drawEffectInRadius(target, 'FIRE_MIST', target, range, 6);

    const attacked = target.$$room.state.getAllInRange(target, range, [], false);

    attacked.forEach(refTarget => {
      const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

      const dist = caster.distFrom(refTarget);

      let damageMod = 1;
      if(dist >= 2) damageMod = 0.75;
      if(dist >= 3) damageMod = 0.5;

      const atkName = refTarget === caster ? 'yourself' : refTarget.name;

      this.magicalAttack(caster, refTarget, {
        skillRef,
        atkMsg: `You engulf ${atkName} in a hot mist!`,
        defMsg: `${this.getCasterName(caster, target)} engulfed you in a hot mist!`,
        damage: Math.floor(damage * damageMod),
        damageClass: 'fire'
      });
    });
  }
}
