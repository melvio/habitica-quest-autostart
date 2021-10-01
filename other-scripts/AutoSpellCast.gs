const userId = ""; // TODO: Fill in your Habitica user ID
const apiToken = ""; // TODO: Fill in your Habitica API token: keep this secret!
const headers = {"x-api-user": userId, "x-api-key": apiToken};

function buffParty() {
    const ntimes = 3;
    const skillId = "toolsOfTrade";
    /*
    Below is a list  of options of the party buff skills.
    Replace the value in skillId above for the skill you desire. Ensure you copy the quotes.
    See http://habitica.fandom.com/wiki/Skills for more information on skills.
    Options for skills:
      Warrior Valorous Presence (STR): "valorousPresence"
      Warrior Intimidating Gaze (CON): "intimidate"
      Rogue Tools of Trade (PER): "toolsOfTrade"
      Healer Protective Aura (CON): "protectAura"
      Healer Blessing (HP): "healAll"
      Mage Ethereal Surge (mana): "mpheal"
      Mage EarthQuake (INT): "earth"
    */
    const url = "https://habitica.com/api/v3/user/class/cast/" + skillId;

    const castParams = {
        "method": "post",
        "headers": headers
    };

    const sleepTime = 30000;
    for (let i = 0; i < ntimes; i++) {
        let result = UrlFetchApp.fetch(url, castParams);
        Logger.log(result);

        // pause in the loop for 30000 milliseconds (30 seconds)
        Utilities.sleep(sleepTime);
    }
}
