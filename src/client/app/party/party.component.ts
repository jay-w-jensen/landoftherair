import { Component } from '@angular/core';
import { ColyseusGameService } from '../colyseus.game.service';

import { startCase } from 'lodash';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss']
})
export class PartyComponent {

  get partyPointProgressPercent() {
    return (this.colyseusGame.character.partyExp.__current / this.colyseusGame.character.partyExp.maximum * 100).toFixed(2);
  }

  get partyExpString() {
    return `${this.colyseusGame.character.partyExp.__current} / ${this.colyseusGame.character.partyExp.maximum}`;
  }

  constructor(
    public colyseusGame: ColyseusGameService
  ) { }

  locationFor(character) {
    if(character.username === this.colyseusGame.character.username) return '✧';
    if(character.map !== this.colyseusGame.character.map)           {
      return startCase(character.map).split('Dungeon').join('(Dungeon)');
    }
    if(character.z > this.colyseusGame.character.z)                 return 'Above';
    if(character.z < this.colyseusGame.character.z)                 return 'Below';

    const dir = this.colyseusGame.directionTo(character);
    const distance = this.colyseusGame.distanceTo(character);

    if(distance === 0) return '✧';

    return `${distance} ${dir}`;
  }
}
