
import { startsWith } from 'lodash';

import * as dice from 'dice.js';

import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../models/character';
import { Poison as CastEffect } from '../../../../effects/Poison';
import { CombatHelper } from '../../../../helpers/combat-helper';

export class Bite extends Skill {

  name = '';
  execute() {}
  range = () => 0;

  use(user: Character, target: Character) {
    const damage = +dice.roll(`1d${user.getTotalStat('str')}`);
    CombatHelper.dealDamage(user, target, {
      damage,
      damageClass: 'physical',
      attackerDamageMessage: '',
      defenderDamageMessage: `${user.name} bit you!`
    });
    const effect = new CastEffect({ potency: 5, duration: 10 });
    effect.cast(user, target, this);
  }

}
