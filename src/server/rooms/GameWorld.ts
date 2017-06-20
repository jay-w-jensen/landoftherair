
import { omitBy, startsWith, isString, isObject, cloneDeep, sample, find } from 'lodash';

import { Parser } from 'mingy';

import { LootRoller, LootFunctions, LootTable } from 'lootastic';
import { species } from 'fantastical';

import { Room } from 'colyseus';
import { GameState, MapLayer } from '../../models/gamestate';

import { DB } from '../database';
import { Player } from '../../models/player';

import { CommandExecutor } from '../helpers/command-executor';
import { NPC } from '../../models/npc';
import { Logger } from '../logger';
import { Spawner } from '../base/spawner';

import * as Classes from '../classes';
import { Character } from '../../models/character';
import { ItemCreator } from '../helpers/item-creator';
import { Item } from '../../models/item';

const TickRates = {
  PlayerAction: 60,
  PlayerSave: 360
};

export class GameWorld extends Room<GameState> {

  private allMapNames;

  private spawners: Spawner[] = [];

  private dropTables = {
    region: [],
    map: []
  };

  ticks = {
    Player: 0
  };

  constructor(opts) {
    super(opts);

    this.allMapNames = opts.allMapNames;

    this.setPatchRate(1000 / 20);
    this.setSimulationInterval(this.tick.bind(this), 1000 / 60);
    this.setState(new GameState({
      players: [],
      map: cloneDeep(require(opts.mapPath)),
      mapName: opts.mapName
    }));

    this.onInit();
  }

  savePlayer(player: Player) {
    if(player.$doNotSave) return;

    if(player._id) {
      delete player._id;
    }

    const savePlayer = player.toJSON();
    delete savePlayer.$fov;

    if(player.leftHand && player.leftHand.itemClass === 'Corpse') {
      savePlayer.leftHand = null;
    }

    if(player.rightHand && player.rightHand.itemClass === 'Corpse') {
      savePlayer.rightHand = null;
    }

    return DB.$players.update({ username: savePlayer.username, charSlot: savePlayer.charSlot }, { $set: savePlayer });
  }

  sendPlayerLogMessage(player: Player, messageData) {
    const client = find(this.clients, { username: player.username });
    this.sendClientLogMessage(client, messageData);
  }

  sendClientLogMessage(client, messageData) {

    let overMessage = messageData;
    let overName = '';

    if(isObject(messageData)) {
      const { message, name } = messageData;
      overMessage = message;
      overName = name;
    }

    this.send(client, { action: 'log_message', name: overName, message: overMessage });
  }

  showGroundWindow(client) {
    this.send(client, { action: 'show_ground' });
  }

  showTrainerWindow(client, npc: NPC) {
    this.send(client, { action: 'show_trainer', trainSkills: npc.trainSkills, classTrain: npc.classTrain, uuid: npc.uuid });
  }

  showShopWindow(client, npc: NPC) {
    this.send(client, { action: 'show_shop', vendorItems: npc.vendorItems, uuid: npc.uuid });
  }

  showBankWindow(client, npc: NPC) {
    this.send(client, { action: 'show_bank', uuid: npc.uuid, bankId: npc.bankId });
  }

  teleport(client, player, { newMap, x, y }) {
    if(newMap && !this.allMapNames[newMap]) {
      this.sendClientLogMessage(client, `Warning: map "${newMap}" does not exist.`);
      return;
    }

    player.x = x;
    player.y = y;

    this.state.resetPlayerStatus(player);

    if(newMap && player.map !== newMap) {
      player.map = newMap;
      this.savePlayer(player);
      player.$doNotSave = true;
      this.send(client, { action: 'change_map', map: newMap });
    }
  }

  placeItemOnGround(ref, item) {
    this.state.addItemToGround(ref, item);
    if(item.$heldBy) item.$heldBy = null;
  }

  removeItemFromGround(item) {
    this.state.removeItemFromGround(item);
  }

  // TODO check if player is in this map, return false if not - also, modify this to take a promise? - also fail if in game already
  requestJoin(opts) {
    // console.log('req', opts);
    return true;
  }

  async onJoin(client, options) {
    const playerData = await DB.$players.findOne({ username: client.username, map: this.state.mapName, charSlot: options.charSlot });

    if(!playerData) {
      this.send(client, { error: 'invalid_char', prettyErrorName: 'Invalid Character Data', prettyErrorDesc: 'No idea how this happened!' });
      return false;
    }

    const player = new Player(playerData);
    player.$room = this;
    player.initServer();
    this.setUpClassFor(player);
    this.state.addPlayer(player);
  }

  onLeave(client) {
    const player = this.state.findPlayer(client.username);
    this.corpseCheck(player);
    this.savePlayer(player);
    this.state.removePlayer(client.username);
  }

  onMessage(client, data) {
    if(!data.command) return;
    const player = this.state.findPlayer(client.username);

    data.gameState = this.state;
    data.room = this;
    data.client = client;

    const wasSuccess = CommandExecutor.executeCommand(player, data.command, data);

    if(!wasSuccess) {
      this.sendClientLogMessage(client, `Command "${data.command}" is invalid. Try again.`);
      return;
    }
  }

  // TODO retrieve boss timers
  // TODO retrieve tied items
  onInit() {
    this.loadNPCsFromMap();
    this.loadSpawners();
    this.loadDropTables();
  }

  // TODO store boss timers
  // TODO store tied items (or maybe whole ground state?)
  onDispose() {

  }

  async loadDropTables() {
    this.dropTables.map = await DB.$mapDrops.findOne({ mapName: this.state.mapName }).drops || [];
    if(this.state.map.properties.region) {
      this.dropTables.region = await DB.$regionDrops.findOne({ regionName: this.state.map.properties.region }).drops || [];
    }
  }

  loadNPCsFromMap() {
    const npcs = this.state.map.layers[MapLayer.NPCs].objects;

    npcs.forEach(npcData => {
      const data = npcData.properties;
      data.name = npcData.name;
      data.sprite = npcData.gid - this.state.map.tilesets[3].firstgid;
      data.x = npcData.x / 64;
      data.y = npcData.y / 64;
      const npc = new NPC(data);
      npc.$room = this;

      this.setUpClassFor(npc);

      try {
        if(npc.script) {
          const { setup, responses } = require(`${__dirname}/../scripts/npc/${npc.script}`);
          setup(npc);

          if(npc.hostility === 'Never') {
            npc.parser = new Parser();
            responses(npc);
          }
        }
      } catch(e) {
        Logger.error(e);
      }

      if(!npc.name) this.determineNPCName(npc);

      this.state.addNPC(npc);
    });
  }

  loadSpawners() {
    const spawners = this.state.map.layers[MapLayer.Spawners].objects;

    spawners.forEach(spawnerData => {
      const spawner = require(`${__dirname}/../scripts/spawners/${spawnerData.properties.script}`);
      const spawnerProto = spawner[Object.keys(spawner)[0]];
      this.spawners.push(new spawnerProto(this, { map: this.state.mapName, x: spawnerData.x, y: spawnerData.y }));
    });
  }

  determineNPCName(npc: NPC) {
    let func = 'human';

    switch(npc.allegiance) {
      case 'None': func = 'human'; break;
      case 'Pirates': func = 'dwarf'; break;
      case 'Townsfolk': func = 'human'; break;
      case 'Royalty': func = sample(['elf', 'highelf']); break;
      case 'Adventurers': func = 'human'; break;
      case 'Wilderness': func = sample(['fairy', 'highfairy']); break;
      case 'Underground': func = sample(['goblin', 'orc', 'ogre']); break;
    }

    if(func === 'human') return species[func]({ allowMultipleNames: false });
    return species[func](sample(['male', 'female']));
  }

  getPossibleMessageTargets(player: Player, findStr: string) {
    const allTargets = this.state.mapNPCs;
    const possTargets = allTargets.filter(target => {
      const diffX = target.x - player.x;
      const diffY = target.y - player.y - 1;

      if(!player.canSee(diffX, diffY)) return false;

      return target.uuid === findStr || startsWith(target.name.toLowerCase(), findStr.toLowerCase());
    });

    return possTargets;
  }

  setUpClassFor(char: Character) {
    Classes[char.baseClass || 'Undecided'].becomeClass(char);
  }

  tick() {
    this.ticks.Player++;

    // tick players every second or so
    if(this.ticks.Player % TickRates.PlayerAction === 0) {
      this.state.tickPlayers();
      this.spawners.forEach(spawner => spawner.npcTick());
    }

    // save players every minute or so
    if(this.ticks.Player % TickRates.PlayerSave === 0) {
      this.state.players.forEach(player => this.savePlayer(player));
    }

    this.spawners.forEach(spawner => spawner.tick());
  }

  async calculateLootDrops(npc: NPC, killer: Character) {
    const tables = [];
    const bonus = killer.getTotalStat('luk');

    if(this.dropTables.map.length > 0) {
      tables.push({
        table: new LootTable(this.dropTables.map, bonus),
        func: LootFunctions.EachItem,
        args: 0
      });
    }

    if(this.dropTables.region.length > 0) {
      tables.push({
        table: new LootTable(this.dropTables.region, bonus),
        func: LootFunctions.EachItem,
        args: 0
      });
    }

    if(npc.drops && npc.drops.length > 0) {
      tables.push({
        table: new LootTable(npc.drops, bonus),
        func: LootFunctions.EachItem,
        args: 0
      });
    }

    const items = LootRoller.rollTables(tables);

    const itemPromises: Array<Promise<Item>> = items.map(itemName => ItemCreator.getItemByName(itemName));
    const allItems: Item[] = await Promise.all(itemPromises);

    if(npc.gold) {
      const gold = await ItemCreator.getItemByName('Gold Coin');
      gold.value = npc.gold;
      allItems.push(gold);
    }

    this.createCorpse(npc, allItems);
  }

  async createCorpse(target: Character, searchItems) {
    const corpse = await ItemCreator.getItemByName('Corpse');
    corpse.sprite = target.sprite + 4;
    corpse.searchItems = searchItems;
    corpse.desc = `the corpse of a ${target.name}`;

    this.placeItemOnGround(target, corpse);

    target.$corpseRef = corpse;
  }

  dropCorpseItems(corpse: Item) {
    if(!corpse.searchItems) return;

    corpse.searchItems.forEach(item => {
      this.placeItemOnGround(corpse, item);
    });

    corpse.searchItems = null;
  }

  corpseCheck(player) {
    if(player.leftHand && player.leftHand.itemClass === 'Corpse') {
      this.placeItemOnGround(player, player.leftHand);
      player.leftHand.$heldBy = null;
      player.setLeftHand(null);
    }

    if(player.rightHand && player.rightHand.itemClass === 'Corpse') {
      this.placeItemOnGround(player, player.rightHand);
      player.rightHand.$heldBy = null;
      player.setRightHand(null);
    }
  }
}
