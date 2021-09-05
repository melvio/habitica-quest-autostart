const userId = ""; // TODO: Fill in your Habitica user ID
const apiToken = ""; // TODO: Fill in your Habitica API token: keep this secret!
const xClientHeader = "79551d98-31e9-42b4-b7fa-9d89b0944319-habitica-quest-autostart";

// Autostart the quest after these many hours:
const maxWaitTimeHours = 23;

// Message to send to the group chat when no quest is active
const chatMessage = "Hiyaa all. We can start a new quest :smiley:. I wish you all a wonderful day =D";

const maxWaitTimeMilliseconds = maxWaitTimeHours * 60 * 60 * 1000;
const authenticationHeaders = {
    "x-client": xClientHeader,
    "x-api-user": userId,
    "x-api-key": apiToken
};


// Keywords to use with the PropertyService
const IS_QUEST_INVITE_PENDING = "IS_QUEST_INVITE_PENDING";
const INVITATION_TIME_STAMP = "INVITATION_TIMESTAMP";

/**
 * This function checks if there is an active quest running. If there is, do nothing.
 * If there is an invitation, start running the timer. If the timer exceeds the specified
 * maxWaitTimeHours, then force start the quest.
 */
function main() {
    const scriptProperties = PropertiesService.getScriptProperties();
    const party = getPartyInformation();
    Logger.log({"party.data.quest": party.data.quest})
        .log({
            "party.data.memberCount": party.data.memberCount,
            "party.data.id (groupId)": party.data.id,
            "party.data.leader": party.data.leader
        });


    const isQuestInvite = party.data.quest.key !== undefined;
    const isQuestActive = party.data.quest.active === true;

    if ((!isQuestInvite) && (!isQuestActive)) {
        Logger.log("There was no invite and no active quest thus we're about to send a chat message.");
        scriptProperties.setProperty(IS_QUEST_INVITE_PENDING, "false");
        sendChatInGroup();
        return;
    }


    if (isQuestActive) {
        Logger.log("Quest is already active so just setting IS_QUEST_INVITE_PENDING property to false");
        scriptProperties.setProperty(IS_QUEST_INVITE_PENDING, "false");
        return;
    }


    const now = new Date();
    const isQuestInviteAlreadyPending = scriptProperties.getProperty(IS_QUEST_INVITE_PENDING) === "true";
    if (isQuestInviteAlreadyPending) {
        const waitTimeMs = now - Date.parse(scriptProperties.getProperty(INVITATION_TIME_STAMP));
        Logger.log("There is an active invite, but the quest hasn't started yet.\n"
            + "We have been waiting for " + waitTimeMs / (1000 * 60) + " minutes");

        if (waitTimeMs > maxWaitTimeMilliseconds) {
            forceQuestStart();
        }
        return;
    }

    const isFirstTimeWeSeeInvite = isQuestInvite && (!isQuestActive);
    if (isFirstTimeWeSeeInvite) {
        Logger.log("This is the first time we see an invite, so we set the INVITATION_TIMESTAMP and IS_QUEST_INVITE_PENDING properties");
        scriptProperties.setProperty(IS_QUEST_INVITE_PENDING, "true");
        scriptProperties.setProperty(INVITATION_TIME_STAMP, now);
    }
}

function sendChatInGroup() {
    // https://habitica.com/apidoc/#api-Chat-PostChat
    const chatUrl = "https://habitica.com/api/v3/groups/party/chat";
    const chatMessagePayload = {"message": chatMessage};
    const chatOptions = {
        "method": "post",
        "headers": authenticationHeaders,
        "payload": chatMessagePayload
    };

    // https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
    UrlFetchApp.fetch(chatUrl, chatOptions);
}


function getPartyInformation() {
    const getPartyUrl = "https://habitica.com/api/v3/groups/party";
    const getPartyOptions = {
        "method": "get",
        "headers": authenticationHeaders,
    };
    const response = UrlFetchApp.fetch(getPartyUrl, getPartyOptions);

    return JSON.parse(response);
}


function forceQuestStart() {
    const forceQuestStartUrl = "https://habitica.com/api/v3/groups/party/quests/force-start";
    const forceQuestStartOptions = {
        "method": "post",
        "headers": authenticationHeaders
    };
    UrlFetchApp.fetch(forceQuestStartUrl, forceQuestStartOptions);

    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty(IS_QUEST_INVITE_PENDING, "false");
}
