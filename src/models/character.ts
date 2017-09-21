
import {
  omitBy, merge, find, includes, compact, pull, values, floor,
  capitalize, startsWith, isUndefined, clone, isString, random
} from 'lodash';
import {
  Item, EquippableItemClassesWithWeapons, EquipHash, GivesBonusInHandItemClasses, ValidItemTypes
} from './item';
import * as RestrictedNumber from 'restricted-number';
import { Signal } from 'signals.js';
import { MapLayer } from './maplayer';
import { environment } from '../client/environments/environment';

import * as Classes from '../server/classes';
import { Effect } from '../server/base/Effect';
import * as Effects from '../server/effects';
import { Sack } from './container/sack';
import { Belt } from './container/belt';

export type Allegiance =
  'None'
| 'Pirates'
| 'Townsfolk'
| 'Royalty'
| 'Adventurers'
| 'Wilderness'
| 'Underground'
| 'Enemy';

export type Sex = 'Male' | 'Female';

export type Direction = 'N' | 'S' | 'E' | 'W' | 'C';

export type Alignment = 'Good' | 'Neutral' | 'Evil';

export type CharacterClass =
  'Undecided'
| 'Mage'
| 'Healer'
| 'Warrior'
| 'Thief';

export const SkillClassNames = {
  Mace: 'Mace',
  Axe: 'Axe',
  Dagger: 'Dagger',
  OneHanded: 'Onehanded',
  TwoHanded: 'Twohanded',
  Shortsword: 'Shortsword',
  Polearm: 'Polearm',
  Ranged: 'Ranged',
  Martial: 'Martial',
  Staff: 'Staff',
  Throwing: 'Throwing',
  Thievery: 'Thievery',
  Wand: 'Wand',
  Conjuration: 'Conjuration',
  Restoration: 'Restoration'
};

export class Skills {
  mace = 0;
  axe = 0;
  dagger = 0;
  onehanded = 0;
  twohanded = 0;
  shortsword = 0;
  polearm = 0;
  ranged = 0;
  martial = 0;
  staff = 0;
  throwing = 0;
  thievery = 0;
  wand = 0;
  conjuration = 0;
  restoration = 0;
}

export class Stats {
  str = 0;
  dex = 0;
  agi = 0;

  int = 0;
  wis = 0;
  wil = 0;

  luk = 0;
  cha = 0;
  con = 0;

  move = 3;
  hpregen = 1;
  mpregen = 1;

  hp = 100;
  mp = 0;

  armorClass = 0;
  accuracy = 0;
  offense = 0;
  defense = 0;

  magicalResist = 0;
  physicalResist = 0;
  necroticResist = 0;
  energyResist = 0;
  waterResist = 0;
  fireResist = 0;
  iceResist = 0;
}

export const MaxSizes = {
  Belt: 5,
  Sack: 25,
  Buyback: 5
};

export const AllNormalGearSlots = [
  'rightHand', 'leftHand', 'gear.Armor', 'gear.Robe1', 'gear.Robe2', 'gear.Ring1', 'gear.Ring2',
  'gear.Head', 'gear.Neck', 'gear.Waist', 'gear.Wrists', 'gear.Hands', 'gear.Feet', 'gear.Ear'
];

export class Character {
  name: string;
  agro: any = {};
  uuid: string;

  hp: RestrictedNumber = new RestrictedNumber(0, 100, 100);
  mp: RestrictedNumber = new RestrictedNumber(0, 0, 0);
  exp = 1000;

  gold = 0;

  stats: Stats = new Stats();
  private totalStats: Stats = new Stats();

  private skills: Skills = new Skills();

  get allSkills() {
    return clone(this.skills);
  }

  allegiance: Allegiance = 'None';
  sex: Sex = 'Male';
  dir: Direction = 'S';

  x = 0;
  y = 0;
  map: string;

  level = 1;
  highestLevel = 1;

  skillOnKill: number;

  baseClass: CharacterClass = 'Undecided';

  sack: Sack = new Sack({ size: this.sackSize });
  belt: Belt = new Belt({ size: this.beltSize });

  effects: Effect[] = [];

  gear: any = {};
  leftHand: Item;
  rightHand: Item;
  potionHand: Item;

  swimLevel: number;

  $fov: any;
  $$map: any;
  $$deathTicks: number;
  $$room: any;
  $$corpseRef: Item;

  $$ai: any;

  sprite: number;

  alignment: Alignment = 'Neutral';
  allegianceReputation: any = {};

  get sackSize() {
    return MaxSizes.Sack;
  }

  get beltSize() {
    return MaxSizes.Belt;
  }

  getSprite() {
    return 0;
  }

  getTotalStat(stat) {
    return this.totalStats[stat] || 0;
  }

  initAI() {
    this.$$ai = {
      tick: new Signal()
    };
  }

  initHpMp() {
    this.hp = new RestrictedNumber(this.hp.minimum, this.hp.maximum, this.hp.__current);
    this.mp = new RestrictedNumber(this.mp.minimum, this.mp.maximum, this.mp.__current);
  }

  initSack() {
    this.sack = new Sack(this.sack);
  }

  initBelt() {
    this.belt = new Belt(this.belt);
  }

  initHands() {
    if(this.leftHand) this.leftHand = new Item(this.leftHand);
    if(this.rightHand) this.rightHand = new Item(this.rightHand);
    if(this.potionHand) this.potionHand = new Item(this.potionHand);
  }

  initGear() {
    Object.keys(this.gear).forEach(slot => {
      if(!this.gear[slot]) return;
      this.gear[slot] = new Item(this.gear[slot]);
    });
  }

  initEffects() {
    this.effects = this.effects.map(x => new Effects[x.name](x));
  }

  constructor(opts) {
    merge(this, opts);

    this.initHpMp();
    this.init();
  }

  init() {}
  initServer() {}

  toJSON() {
    return omitBy(this, (value, key) => {
      if(key === '$fov') return false;
      if(!Object.getOwnPropertyDescriptor(this, key)) return true;
      if(startsWith(key, '$$')) return true;
      if(key === '_id') return true;
      return false;
    });
  }

  hasEmptyHand() {
    return !this.leftHand || !this.rightHand;
  }

  determineItemType(itemClass) {
    return EquipHash[itemClass] || itemClass;
  }

  private getItemSlotToEquipIn(item: Item) {

    let slot = item.itemClass;

    if(item.isRobe()) {
      const armor = this.gear.Armor;
      const robe1 = this.gear.Robe1;
      const robe2 = this.gear.Robe2;

      if(armor && robe1 && robe2) return false;

      if(!armor) {
        slot = 'Armor';
      } else if(!robe1) {
        slot = 'Robe1';
      } else if(!robe2) {
        slot = 'Robe2';
      }

    } else if(item.isArmor()) {
      const armor = this.gear.Armor;
      if(armor) return false;

      slot = 'Armor';

    } else if(item.itemClass === 'Ring') {
      const ring1 = this.gear.Ring1;
      const ring2 = this.gear.Ring2;

      if(ring1 && ring2) return false;

      if(!ring1) {
        slot = 'Ring1';
      } else if(!ring2) {
        slot = 'Ring2';
      }
    } else {
      const realSlot = this.determineItemType(item.itemClass);
      if(!includes(['Head', 'Neck', 'Waist', 'Wrists', 'Hands', 'Feet', 'Ear'], realSlot)) return false;
      if(this.gear[realSlot]) return false;

      slot = realSlot;
    }

    return slot;
  }

  loseStat(stat, value = 1) {
    this.stats[stat] = Math.max(this.stats[stat] - value, 1);
    this.recalculateStats();
  }

  recalculateStats() {
    const allGear = compact(values(this.gear));

    const canGetBonusFromItemInHand = (item) => {
      return this.checkCanEquipWithoutGearCheck(item) && includes(GivesBonusInHandItemClasses, item.itemClass);
    };

    Object.keys(this.stats).forEach(stat => {
      this.totalStats[stat] = this.stats[stat];
    });

    const addStatsForItem = (item) => {
      Object.keys(item.stats).forEach(stat => {
        this.totalStats[stat] += item.stats[stat];
      });
    };

    allGear.forEach(item => {
      if(!item.stats || !this.checkCanEquipWithoutGearCheck(item)) return;
      addStatsForItem(item);
    });

    if(this.leftHand && this.leftHand.stats && canGetBonusFromItemInHand(this.leftHand))    addStatsForItem(this.leftHand);
    if(this.rightHand && this.rightHand.stats && canGetBonusFromItemInHand(this.rightHand)) addStatsForItem(this.rightHand);

    this.hp.maximum = Math.max(1, this.getTotalStat('hp'));
    this.hp.__current = Math.min(this.hp.__current, this.hp.maximum);

    this.mp.maximum = Math.max(0, this.getTotalStat('mp'));
    this.mp.__current = Math.min(this.mp.__current, this.mp.maximum);
  }

  itemCheck(item: Item) {
    if(!item) return;
    if(item.itemClass === 'Corpse') return;
    if(item.binds && !item.owner) {
      item.setOwner(this);
      if(item.tellsBind) {
        this.sendClientMessageToRadius({
          message: `${this.name} has looted ${item.desc}.`,
          subClass: 'always loot'
        }, 4);
      }

      this.sendClientMessage(`The ${item.itemClass.toLowerCase()} feels momentarily warm to the touch as it molds to fit your grasp.`);
    }
  }

  setLeftHand(item: Item, recalc = true) {
    this.leftHand = item;
    this.itemCheck(item);
    if(recalc) {
      this.recalculateStats();
    }
  }

  setRightHand(item: Item, recalc = true) {
    this.rightHand = item;
    this.itemCheck(item);
    if(recalc) {
      this.recalculateStats();
    }
  }

  setPotionHand(item: Item) {
    this.itemCheck(item);
    this.potionHand = item;
  }

  equip(item: Item) {
    if(!this.canEquip(item)) return false;
    const slot = this.getItemSlotToEquipIn(item);
    if(!slot) return false;

    this.gear[slot] = item;
    this.recalculateStats();
    this.itemCheck(item);
    return true;
  }

  private checkCanEquipWithoutGearCheck(item: Item) {
    if(!item.hasCondition()) return false;
    if(!includes(EquippableItemClassesWithWeapons, item.itemClass)) return false;
    if(item.requirements) {
      if(item.requirements.level && this.level < item.requirements.level) return false;
      if(item.requirements.class && !includes(item.requirements.class, this.baseClass)) return false;
    }
    return true;
  }

  canEquip(item: Item) {
    if(!item.isOwnedBy(this)) return false;
    if(!this.checkCanEquipWithoutGearCheck(item)) return false;

    const slot = this.getItemSlotToEquipIn(item);
    if(!slot || this.gear[slot]) return false;
    return true;
  }

  unequip(slot: string) {
    this.gear[slot] = null;
    this.recalculateStats();
  }

  addItemToSack(item: Item) {
    if(item.itemClass === 'Coin') {
      this.gainGold(item.value);
      return true;
    }

    const result = this.sack.addItem(item);
    if(result) {
      this.sendClientMessage(result);
      return false;
    }

    this.itemCheck(item);
    return true;
  }

  addItemToBelt(item: Item) {
    const result = this.belt.addItem(item);
    if(result) {
      this.sendClientMessage(result);
      return false;
    }

    this.itemCheck(item);
    return true;
  }

  gainGold(gold: number) {
    if(gold <= 0) return;
    this.gold += gold;
  }

  loseGold(gold: number) {
    this.gold -= gold;
    if(this.gold <= 0) this.gold = 0;
  }

  getDirBasedOnDiff(x, y): string {

    const checkX = Math.abs(x);
    const checkY = Math.abs(y);

    if(checkX >= checkY) {
      if(x > 0) {
        return 'East';
      } else if(x < 0) {
        return 'West';
      }

    } else if(checkY > checkX) {
      if(y > 0) {
        return 'South';
      } else if(y < 0) {
        return 'North';
      }
    }

    return 'South';
  }

  setDirBasedOnXYDiff(x, y) {
    if(x === 0 && y === 0) return;
    this.dir = <Direction>this.getDirBasedOnDiff(x, y).substring(0, 1);
  }

  canSee(xOffset, yOffset) {
    if(!this.$fov) return false;
    if(!this.$fov[xOffset]) return false;
    if(!this.$fov[xOffset][yOffset]) return false;
    return true;
  }

  getXYFromDir(dir: Direction) {
    const checkDir = dir.toUpperCase();
    switch(checkDir) {
      case 'N':  return { x: 0,   y: -1 };
      case 'E':  return { x: 1,   y: 0 };
      case 'S':  return { x: 0,   y: 1 };
      case 'W':  return { x: -1,  y: 0 };
      case 'NW': return { x: -1,  y: 1 };
      case 'NE': return { x: 1,   y: 1 };
      case 'SW': return { x: -1,  y: -1 };
      case 'SE': return { x: -1,  y: 1 };
      default:   return { x: 0,   y: 0 };
    }
  }

  takeSequenceOfSteps(steps: any[], isChasing = false) {
    const denseTiles = this.$$map.layers[MapLayer.Walls].data;
    const denseObjects: any[] = this.$$map.layers[MapLayer.DenseDecor].objects;
    const interactables = this.$$map.layers[MapLayer.Interactables].objects;
    const denseCheck = denseObjects.concat(interactables);

    steps.forEach(step => {
      const nextTileLoc = ((this.y + step.y) * this.$$map.width) + (this.x + step.x);
      const nextTile = denseTiles[nextTileLoc];

      if(nextTile === 0) {
        const object = find(denseCheck, { x: (this.x + step.x) * 64, y: (this.y + step.y + 1) * 64 });
        if(object && object.density) {
          return;
        }
      } else {
        return;
      }

      if(!isChasing && !this.isValidStep(step)) return;
      this.x += step.x;
      this.y += step.y;

    });

    if(this.x < 0) this.x = 0;
    if(this.y < 0) this.y = 0;

    if(this.x > this.$$map.width)  this.x = this.$$map.width;
    if(this.y > this.$$map.height) this.y = this.$$map.height;
  }

  isValidStep(step) {
    return true;
  }

  isDead() {
    return this.hp.atMinimum();
  }

  changeBaseClass(newClass) {
    this.baseClass = newClass;
    Classes[this.baseClass].becomeClass(this);
  }

  kill(dead: Character) {}

  flagSkill(skills) {}

  canDie() {
    return this.hp.atMinimum();
  }

  die(killer?: Character) {
    this.dir = 'C';
    this.effects = [];

    // 3 minutes to rot
    if(environment.production) {
      this.$$deathTicks = 60 * 3;
    } else {
      this.$$deathTicks = 6 * 3;
    }
  }

  restore(force = false) {}

  gainExp(xp: number) {
    if(this.isDead()) return;

    this.exp += xp;

    if(this.exp <= 100) {
      this.exp = 100;
    }

    if(xp < 0) {
      do {
        const prevLevelXp = this.calcLevelXP(this.level);
        if(this.exp < prevLevelXp && this.level >= 2) {
          this.level -= 1;
        } else {
          break;
        }
      } while(true);
    }
  }

  tryLevelUp(maxLevel = 0) {
    do {
      if(this.level >= maxLevel) break;

      const neededXp = this.calcLevelXP(this.level + 1);
      if(this.exp > neededXp) {
        this.level += 1;
        if(this.level > this.highestLevel) {
          this.highestLevel = this.level;
          this.gainLevelStats();
        }
      } else {
        break;
      }
    } while(this.level < maxLevel);
  }

  gainLevelStats() {
    Classes[this.baseClass].gainLevelStats(this);
  }

  calcLevelXP(level: number) {
    if(level <= 20) {
      return Math.pow(2, level - 1) * 1000;
    }

    return 99999999999999999999999 * level;
  }

  isValidSkill(type) {
    return includes(ValidItemTypes, type);
  }

  gainSkill(type, skillGained = 1) {
    if(!this.isValidSkill(type) || !this.canGainSkill(type)) return;
    this._gainSkill(type, skillGained);
  }

  _gainSkill(type, skillGained) {
    type = type.toLowerCase();

    this.skills[type] += skillGained;

    if(this.skills[type] <= 0 || isNaN(this.skills[type])) this.skills[type] = 0;
  }

  canGainSkill(type) {
    const curLevel = this.calcSkillLevel(type);
    return curLevel < this.$$room.state.maxSkill;
  }

  calcSkillLevel(type) {
    return Math.floor(Math.pow((this.skills[type.toLowerCase()] || 0) / 100, 1 / 2));
  }

  calcSkillXP(level: number) {
    return Math.pow(2, level) * 100;
  }

  applyEffect(effect: Effect) {
    const existingEffect = this.hasEffect(effect.name);
    if(existingEffect) {
      this.unapplyEffect(effect);
    }

    if(effect.duration > 0) {
      this.effects.push(effect);
    }

    effect.effectStart(this);
  }

  unapplyEffect(effect: Effect) {
    this.effects = this.effects.filter(eff => eff.name !== effect.name);
  }

  hasEffect(effectName) {
    return find(this.effects, { name: effectName });
  }

  useItem(source: 'leftHand' | 'rightHand' | 'potionHand') {
    const item = this[source];
    if(!item || !item.use(this)) return;

    let remove = false;

    if(item.ounces === 0) {
      this.sendClientMessage('The bottle was empty.');
      remove = true;

    } else if(item.ounces > 0) {
      item.ounces--;
      if(item.ounces <= 0) remove = true;
    }

    if(remove) {
      this[source] = null;
      this.recalculateStats();
    }
  }

  sendClientMessage(message) {}
  sendClientMessageToRadius(message, radius = 0, except = []) {
    const sendMessage = isString(message) ? { message, subClass: 'chatter' } : message;
    this.$$room.state.getPlayersInRange(this, radius, except).forEach(p => {

      // outta range, generate a "you heard X in the Y dir" message
      if(radius > 4 && this.distFrom(p) > 5) {
        const dirFrom = this.getDirBasedOnDiff(this.x - p.x, this.y - p.y);
        sendMessage.dirFrom = dirFrom.toLowerCase();
        p.sendClientMessage(sendMessage);
      } else {
        p.sendClientMessage(sendMessage);
      }
    });
  }

  isPlayer() {
    return false;
  }

  tick() {
    if(this.isDead()) {
      if(this.$$corpseRef && this.$$corpseRef.$heldBy) {
        const holder = this.$$room.state.findPlayer(this.$$corpseRef.$heldBy);
        this.x = holder.x;
        this.y = holder.y;
      }

      if(this.$$deathTicks > 0) {
        this.$$deathTicks--;
        if(this.$$deathTicks <= 0) {
          this.restore(true);
        }
      }

      return;
    }

    const hpRegen = this.getTotalStat('hpregen');
    const mpRegen = this.getTotalStat('mpregen');

    this.hp.add(hpRegen);
    this.mp.add(mpRegen);

    this.effects.forEach(eff => eff.tick(this));
  }

  distFrom(point, vector?) {
    let checkX = this.x;
    let checkY = this.y;

    if(vector) {
      checkX += vector.x || 0;
      checkY += vector.y || 0;
    }

    return Math.sqrt(Math.pow(point.x - checkX, 2) + Math.pow(point.y - checkY, 2));
  }

  addAgro(char: Character, value) {
    if(!char) return;
    this.agro[char.uuid] = this.agro[char.uuid] || 0;
    this.agro[char.uuid] += value;

    if(this.agro[char.uuid] <= 0) this.removeAgro(char);
  }

  removeAgro(char: Character) {
    delete this.agro[char.uuid];
  }

  changeRep(allegiance: Allegiance, modifier) {
    this.allegianceReputation[allegiance] = this.allegianceReputation[allegiance] || 0;
    this.allegianceReputation[allegiance] += modifier;
  }

  receiveMessage(from, message) {}

  dropHands() {
    if(this.rightHand) {
      this.$$room.addItemToGround(this, this.rightHand);
      this.setRightHand(null);
    }

    if(this.leftHand) {
      this.$$room.addItemToGround(this, this.leftHand);
      this.setLeftHand(null);
    }
  }

  strip({ x, y }, spread = 0) {
    this.dropHands();

    this.sendClientMessage('You feel an overwhelming heat as your equipment disappears from your body!');

    const pickSlot = () => ({ x: random(x - spread, x + spread), y: random(y - spread, y + spread) });

    if(this.gold > 0) {
      const gold = new Item({
        name: 'Gold Coin',
        sprite: 212,
        value: this.gold,
        isBeltable: false,
        desc: 'gold coins'
      });

      this.$$room.addItemToGround(pickSlot(), gold);
      this.gold = 0;
    }

    Object.keys(this.gear).forEach(gearSlot => {
      const item = this.gear[gearSlot];
      if(!item) return;

      const point = pickSlot();
      this.$$room.addItemToGround(point, item);
      this.unequip(gearSlot);
    });

    for(let i = this.sack.items.length; i >= 0; i--) {
      const item = this.sack.takeItemFromSlot(i);
      if(!item) continue;

      const point = pickSlot();
      this.$$room.addItemToGround(point, item);
    }

    for(let i = this.belt.items.length; i >= 0; i--) {
      const item = this.belt.takeItemFromSlot(i);
      if(!item) continue;

      const point = pickSlot();
      this.$$room.addItemToGround(point, item);
    }
  }
}
