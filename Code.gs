const userId = ""; // TODO: Fill in your Habitica user ID
const apiToken = ""; // TOOD: Fill in your Habitica API token: keep this secret!

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
const IS_QUEST_PENDING = "IS_QUEST_PENDING";
const INVITATION_TIME_STAMP = "INVITATION_TIMESTAMP";

/**
 * This function checks if there is an active quest running. If there is, do nothing.
 * If there is an invitation, start running the timer. If the timer exceeds the specified
 * maxWaitTimeHours, then force start the quest.
 */
function main() {
    const scriptProperties = PropertiesService.getScriptProperties();
    const party = getPartyInformation();


    const noQuestInvite = party.data.quest.key == undefined;
    const isQuestActive = party.data.quest.active == true;

    if (noQuestInvite && !isQuestActive) {
        console.log("There was active quest nor invite so about to send a chat message");
        scriptProperties.setProperty(IS_QUEST_PENDING, "false");
        sendChatInGroup();
        return;
    }


    if (isQuestActive) {
        console.log("Quest is already active so just setting IS_QUEST_PENDING property to false")
        scriptProperties.setProperty(IS_QUEST_PENDING, "false");
        return;
    }


    const now = new Date();
    const wasQuestAlreadyPending = scriptProperties.getProperty(IS_QUEST_PENDING) == "true";
    if (wasQuestAlreadyPending) {
        // There is an active invite that we have seen before, check the wait time.
        const waitTimeMs = now - Date.parse(scriptProperties.getProperty(INVITATION_TIME_STAMP));
        console.log("There is an active invite, but the quest hasn't started yet.\n"
            + "We have been waiting for " + waitTimeMs / (1000 * 60) + " minutes")

        if (waitTimeMs > maxWaitTimeMilliseconds) {
            forceQuestStart();
        }
        return;
    }

    const firstTimeWeSeeInvite = (party.data.quest.key != undefined) && (party.data.quest.active != true);
    if (firstTimeWeSeeInvite) {
        console.log("This is the first time we see an invite, so we set the INVITATION_TIMESTAMP and IS_QUEST_PENDING properties")
        scriptProperties.setProperty(IS_QUEST_PENDING, "true");
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
    scriptProperties.setProperty(IS_QUEST_PENDING, "false");
}
