function getPlayers(sheet)
{
  var count_row=2;
  var players = getPlayersNames(sheet, count_row, 1);
  var tanks = createList(players, "Tank");
  
  players = getPlayersNames(sheet, count_row, 3);
  var healers = createList(players, "Healer");

  players = getPlayersNames(sheet, count_row, 5);
  var dps = createList(players, "DPS");
  return [tanks, healers, dps];  
}

function createList(names, player_role)
{
  var ret=[];
  for(let i = 0; i < names.length; ++i)
  {
    ret.push({name:names[i], role:player_role})
  }
  return ret;
}
function getPlayersNames(sheet, row_offset, col_offset)
{
  var num = sheet.getRange(row_offset, col_offset).getValue();
  return sheet.getRange(row_offset+1, col_offset,num,1).getValues();
}

function querySpoonFedPlayerData(players, difficulty)
{
  var ret =[];
  for (let index = 0; index < players.length; ++index)
  {
    var player = players[index];
    var player_name = player.name[0];
    if(player_name !="")
    {
      var results = queryCharacterParses(client_id, secret, player_name, "Illidan", "US", difficulty, player.role);
      var performance = results.data.characterData.character.zoneRankings.bestPerformanceAverage;
      ret.push({name:player_name, value:performance});
    }
  }
  return ret;
}

function fillData(sheet, row_offset,col_offset, data, difficulty)
{
  var values = new Array(data.length);
  for (let i = 0; i < data.length; ++i)
  {
    values[i] = new Array(2);
    values[i][0]= "=HYPERLINK(\"https://www.warcraftlogs.com/character/US/Illidan/"+data[i].name+"#difficulty="+difficulty+"\",\""+data[i].name+"\")";
    values[i][1]= data[i].value;
  }
  values.sort(compareSecondColumn);
  var range = sheet.getRange(row_offset, col_offset,data.length,2);
  range.setValues(values);
}

function parses(sheetName, difficulty) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);  
  var [tanks, healers, dps] = getPlayers(sheet);

  var results = querySpoonFedPlayerData(tanks, difficulty);
  fillData(sheet, 3, 1, results, difficulty);
  results = querySpoonFedPlayerData(healers, difficulty);
  fillData(sheet, 3, 3, results,difficulty);
  results = querySpoonFedPlayerData(dps, difficulty);
  fillData(sheet, 3, 5, results, difficulty);  
}

function ParsesMain()
{
  parses("Mythic Parses", "5")
  parses("Heroic Parses", "4")
  parses("Normal Parses", "3")
}