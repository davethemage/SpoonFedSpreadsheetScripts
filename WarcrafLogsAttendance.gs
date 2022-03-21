function calculatePlayerWeights(raids)
{
  var ret=[];
  var raid_times=[];
  var max_value= 0
  for(let i =0; i< raids.length; ++i)
  {
    max_value += raids.length-i;
  }

  for(let i = 0; i < raids.length; ++i)
  {
    raid_times.push(new Date(raids[i].startTime));    
    var raid = raids[i].players;
    for(let ii=0; ii<raid.length; ++ii)
    {
      var player_name = raid[ii].name;
      var player_presence = raid[ii].presence;

      var weighted_value = (raids.length - i)/max_value
      var result = ret.find(({name})=> name == player_name)
      if(result === undefined)
      {
        ret.push({name:player_name, 
          weighted:weighted_value, 
          total:1,
          attended:[{key:i, value:player_presence}],
          max:raids.length})
      }
      else
      {
        result.weighted += weighted_value;
        result.attended.push({key:i, value:player_presence});
        result.total+=1;
      }
    }
  }
  return [ret, raid_times];
}

function cleanUpSheet(sheet, row_offset)
{
  sheet.getRange(row_offset,1,sheet.getMaxRows(),sheet.getMaxColumns()).setValue("");
}
function addAttendanceToSheet(weighted_results, raid_times)
{
  var sheetName = "Attendance";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  cleanUpSheet(sheet, 2);

  sheet.getRange(1,4,1,raid_times.length).setValues([raid_times]);
  var row = 2;
  var col = 1;
  for (let i = 0; i < weighted_results.length; ++i)
  {
    var col = 1;
    var player = weighted_results[i];
    sheet.getRange(row,col).setValue(player.name);
    sheet.getRange(row,++col).setValue(player.weighted);
    sheet.getRange(row,++col).setValue(player.total/raid_times.length);
    for(let ii = 0; ii < player.attended.length; ++ii)
    {
      var attendance = player.attended[ii];
      var next_col = 4+attendance.key;
      sheet.getRange(row, next_col).setValue(attendance.value);
    }
    ++row;
  }
  sheet.autoResizeColumns(1,raid_times.length+3);
  sheet.sort(1).sort(2,false);
}
function attendanceMain()
{
  var client_id="9465c043-bceb-4bdd-8074-f4fa89183cde";
  var secret="KE56ziCXb1QTuQbIqyHAUSQw7VMUfdRWOF4XeZr9"; 
  var json_query = {"query":"{guildData {\nguild(id: "+guild_id+") {\nattendance(guildTagID: 48651) {\ndata {\nstartTime,\nplayers {\nname,\npresence\n}\n}\n}\n}\n}\n}"}

  var result = queryData("Attendance", client_id, secret, json_query);
  if(result !== null)
  {
    var raids = result.data.guildData.guild.attendance.data;
    var [weighted_results, raid_times] = calculatePlayerWeights(raids);
    addAttendanceToSheet(weighted_results, raid_times);
  }
}
