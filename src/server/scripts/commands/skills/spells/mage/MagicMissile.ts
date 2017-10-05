
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../models/character';
import { MagicMissile as CastEffect } from '../../../../../effects/MagicMissile';

export class MagicMissile extends Skill {

  public name = 'magicmissile';
  public format = 'Target';

  static macroMetadata = {
    name: 'MagicMissile',
    macro: 'magicmissile',
    icon: 'missile-swarm',
    color: '#0059bd',
    mode: 'lockActivation'
  };

  flagSkills = [SkillClassNames.Conjuration];

  mpCost = () => 5;
  range = () => 5;

  execute(user: Character, { gameState, args, effect }) {
    if(!args) return false;

    const target = this.getTarget(user, args);
    if(!target) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
