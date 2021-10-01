const userId = ""; // TODO: Fill in your Habitica user ID
const apiToken = ""; // TODO: Fill in your Habitica API token: keep this secret!
const headers = {"x-api-user": userId, "x-api-key": apiToken};

/**
 * This function automatically accepts quests if you are invited.
 */
function scheduleJoinQuest() {
    const getOptions = {
        "method": "get",
        "headers": headers
    };
    const response = UrlFetchApp.fetch("https://habitica.com/api/v3/groups/party", getOptions);
    const party = JSON.parse(response);
    const quest = party.data.quest;


    if (shouldAcceptQuest(quest)) {
        const acceptQuestOptions = {
            "method": "post",
            "headers": headers
        };
        UrlFetchApp.fetch("https://habitica.com/api/v3/groups/party/quests/accept", acceptQuestOptions);
        const msg = {
            "googleAppScriptQuestAcceptTime": new Date(),
            "quest.key": quest.key
        };
        Logger.log(msg);
    } else {
        Logger.log("Nothing to accept: quest.key=" + quest.key);
    }
}


function shouldAcceptQuest(quest) {
    if (quest.key == undefined) {
        Logger.log("No invitation");
        return false;
    }
    if (quest.active === true) {
        Logger.log("Quest already active.");
        return false;
    }

    if (quest.members[usedId] != undefined) {
        Logger.log("You already accepted");
        return false;
    }

    return true;
}


