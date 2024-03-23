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

        let questCounter = 0;
        let negativeQuestCounter = 0;

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
                    const prevValue = Number(reward.value);
                    if (prevValue < 0.0 && !this.modConfig["apply_to_negative_rep"])
                    {
                        negativeQuestCounter++;
                        continue;
                    }
                    // round this to nearest 1/100th
                    reward.value = Math.ceil(prevValue * Number(this.modConfig["multiplier"]) * 100) / 100;
                    questCounter++;
                }
            }
        }

        logger.log(`[RepMultiplier] ${questCounter} quests were modified.`, LogTextColor.WHITE);
        if (!this.modConfig["apply_to_negative_rep"]) 
        {
            logger.log(`[RepMultiplier] Skipped over ${negativeQuestCounter} negative rep quest "rewards"`, LogTextColor.WHITE);
        }
    }
}

module.exports = { mod: new RepMultiplier() };
