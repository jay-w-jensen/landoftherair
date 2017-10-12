"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../../base/Command");
const item_1 = require("../../../../../models/item");
class MerchantToRight extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.name = '~MtR';
        this.format = 'MerchantUUID ItemUUID';
    }
    execute(player, { room, gameState, args }) {
        const [containerUUID, itemUUID] = args.split(' ');
        if (!this.checkPlayerEmptyHand(player))
            return;
        if (!this.checkMerchantDistance(player, containerUUID))
            return;
        const item = this.checkMerchantItems(player, containerUUID, itemUUID);
        if (!item)
            return;
        if (player.gold < item.value)
            return player.sendClientMessage('You do not have enough gold for that.');
        player.loseGold(item.value);
        const newItem = new item_1.Item(item);
        newItem.regenerateUUID();
        this.trySwapRightToLeft(player);
        player.setRightHand(newItem);
    }
}
exports.MerchantToRight = MerchantToRight;
//# sourceMappingURL=merchant-to-right.js.map