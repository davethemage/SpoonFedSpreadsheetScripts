function queryGear(player, server)
{
  return raiderIoQuery(player, server, "gear")
}

function raiderIoQuery(player, server, fields)
{
  query = "https://raider.io/api/v1/characters/profile?region=us&realm="+server+"&name="+player +"&fields=" + fields
  var response = UrlFetchApp.fetch(query)
  return JSON.parse(response.getContentText());
}

function queryTier(player, server)
{
  items = queryGear(player,server).gear.items
  helm = getTierilvl(items.head)
  // shoulder
  shoulder = getTierilvl(items.shoulder)
  // chest
  chest = getTierilvl(items.chest)
  // gloves
  gloves = getTierilvl(items.hands)
  // pants
  pants = getTierilvl(items.legs)
  return [helm, shoulder, chest, gloves, pants]
}

function queryMythicPlus(player, server)
{
  return raiderIoQuery(player, server, "mythic_plus_weekly_highest_level_runs")
}

function queryIllidanMythicPlus(player)
{
  return queryMythicPlus(player, "Illidan")
}

function queryIllidanTier(player)
{
  return queryTier(player, "Illidan")
}

function getTierilvl(item)
{
  if(item.tier)
  {
    return item.item_level 
  }
  return 0
}

function getWeeklyKeys(raiderIoOutput)
{
  babyKeys= 0 //<10
  mediumKeys= 0 //10-14
  vaultKeys= 0 //15+
  runs = raiderIoOutput.mythic_plus_weekly_highest_level_runs
  lastReset = new Date(getLastTuesdayOf(new Date()))
  for (let i = 0; i < runs.length; ++i)
  {
    keyDate = new Date(runs[i].completed_at)
    if (keyDate >= lastReset)
    {
      keyLevel = runs[i].mythic_level
      if (keyLevel < 10)
      {
        babyKeys += 1
      }
      else if (keyLevel < 15)
      {
        mediumKeys += 1
      }
      else if (keyLevel >= 15)
      {
        vaultKeys += 1
      }
    }
  }
  return [babyKeys, mediumKeys, vaultKeys]
}
function tierMain()
{ 
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("TierCheck(Raider.io Automatic)");
  players = sheet.getRange(2, 1, 1000, 1).getValues().filter(String);
  for (let index = 0; index < players.length; ++index)
  {
    player_data = queryIllidanTier(players[index])
    var range = sheet.getRange(2+index, 2, 1, player_data.length);
    range.setValues([player_data])
  }
}
function MythicPlusRuns()
{
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Weekly Key Count");
  players = sheet.getRange(2, 1, 1000, 1).getValues().filter(String);
  for (let index = 0; index < players.length; ++index)
  {
    keys = getWeeklyKeys(queryIllidanMythicPlus(players[index]))
    var range = sheet.getRange(2+index, 2, 1, keys.length);
    range.setValues([keys])
  }
}