


import * as dice from 'dice.js';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { Poison as CastEffect } from '../../../../effects/dots/Poison';
import { CombatHelper } from '../../../../helpers/world/combat-helper';

export class PoisonBiteStrong extends Skill {

  name = 'poisonbitestrong';
  execute() {}

  canUse(user: Character, target: Character) {
    return user.distFrom(target) <= this.range() && !target.hasEffect('Poison');
  }

  use(user: Character, target: Character) {
    const damage = +dice.roll(`6d${user.getTotalStat('str')}`);
    CombatHelper.dealDamage(user, target, {
      damage,
      damageClass: 'physical',
      attackerDamageMessage: '',
      defenderDamageMessage: `${user.name} bit you!`
    });
    const effect = new CastEffect({ potency: 15, duration: 10 });
    effect.cast(user, target, this);
  }

}
