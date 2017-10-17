
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { Cure as CastEffect } from '../../../../../effects/Cure';

export class Cure extends Skill {

  static macroMetadata = {
    name: 'Cure',
    macro: 'cast cure',
    icon: 'tentacle-heart',
    color: '#080',
    mode: 'clickToTarget'
  };

  public name = ['cure', 'cast cure'];
  public format = 'Target';

  flagSkills = [SkillClassNames.Restoration];

  mpCost = () => 5;
  range = () => 5;

  execute(user: Character, { gameState, args, effect }) {

    const target = this.getTarget(user, args, true);
    if(!target) return;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
