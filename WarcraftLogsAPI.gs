//https://github.com/googleworkspace/apps-script-oauth2
function getService(name, client_id, secret)
{
  return OAuth2.createService(name)
      // Set the endpoint URLs, which are the same for all Google services.
      .setAuthorizationBaseUrl('https://www.warcraftlogs.com/oauth/authorize')
      .setTokenUrl('https://www.warcraftlogs.com/oauth/token')
      // Set the client ID and secret, from the Google Developers Console.
      .setClientId(client_id)
      .setClientSecret(secret)
      .setGrantType('client_credentials');
}
function queryData(service_name, client_id, secret, query)
{
  var service = getService(service_name, client_id,secret);
  var result;
  if(service.hasAccess())
  {
    var url = "https://www.warcraftlogs.com/api/v2/client"
    var response = UrlFetchApp.fetch(url, 
    {
      "method":"post",     
      headers: {
        "accept":"application/json",
        "contentType":"application/json",        
        Authorization: 'Bearer ' + service.getAccessToken()
      },
      "payload":query,
      muteHttpExceptions: true
    });

    result = JSON.parse(response.getContentText());
  } else {
    Logger.log(service.getLastError());
  }
  service.reset();
  return result;
}

function queryGuildAttendance(client_id, secret, guild_id, tag_id)
{
    query = {"query":"{guildData {\nguild(id: "+guild_id+") {\nattendance("};
    if(tag_id !== null)
    {
      query.query +="guildTagID: "+tag_id;
    }
    query.query +=") {\ndata {\nstartTime,\nplayers {\nname,\npresence\n}\n}\n}\n}\n}\n}";
    return queryData(client_id,secret,guild_id,tag_id);
}

function queryCharacterParses(client_id, secret, player_name, player_server, server_region, difficulty, role)
{
  var metric = "dps";
  if(role === "Healer")
  {
    metric="hps";
  }
  var query={"query": "{characterData {character(name:\""+player_name+"\", serverSlug:\""+player_server+"\", serverRegion:\""+server_region+"\") {zoneRankings(difficulty:"+difficulty+", role:"+role+", metric:"+metric+")}}}"};
  return queryData(player_name, client_id, secret, query);
}