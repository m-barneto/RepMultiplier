import { DependencyContainer } from "tsyringe";

import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { QuestRewardType } from "@spt-aki/models/enums/QuestRewardType";

class RepMultiplier implements IPostAkiLoadMod
{
    private modConfig = require("../config/config.json");

    public postAkiLoad(container: DependencyContainer): void {
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        const logger = container.resolve<ILogger>("WinstonLogger");

        const questTable = databaseServer.getTables().templates.quests;

        // Iterate over all traders
        for (const questId in questTable)
        {
            const quest = questTable[questId];
            const questRewards = quest.rewards.Success;

            for (const rewardIdx in questRewards)
            {
                const reward = questRewards[rewardIdx];
                if (reward.type == QuestRewardType.TRADER_STANDING)
                {
                    const prevValue = reward.value;
                    // round this to nearest 1/100th?
                    reward.value = Number(reward.value) * Number(this.modConfig['multiplier'])
                    logger.log(`[RepMultiplier] Quest ${quest.QuestName} rep went from ${prevValue} to ${reward.value}`, LogTextColor.WHITE);
                }
            }
        }
    }
}

module.exports = { mod: new RepMultiplier() };
