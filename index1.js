

var fs = require('fs');
var CsvReadableStream = require('csv-reader');



let readFile = fileName => {
  return new Promise(function (res) {
    var inputStream = fs.createReadStream(fileName, 'utf8');
    var rows = []
    inputStream
       .pipe(CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, delimiter: ','}))
       .on('data', function (row) {
         rows.push(row);
       })
       .on('end', function () {
         res(rows);
       });
  });
};


let restructure = data => {
  var stands = {};
  data.forEach(function (row) {
    if(!stands[row[0]]) stands[row[0]] = {};
    let stand = stands[row[0]];
    if(!stand[row[1]]) stand[row[1]] = {waitime: []};
    let week = stand[row[1]];
    week.waitime.push(row[3]);
  });
  return stands;
};




let calculate2 = stands => {
  var longestIncrease = {
    waitime: 0,
    standNumber: 0,
    weekNumber: 0
  };

  for(let standkey in stands) {
    if(stands.hasOwnProperty(standkey)) {
      let weeks = stands[standkey];
      let lastWait = 0;
      let first = true;
      for(let weekKey in weeks) {
        if(weeks.hasOwnProperty(weekKey)) {
          let week = weeks[weekKey];
          let waitTime = week.waitime;
          let len = waitTime.length;
          for(let i = 0; i < len; i += 1) {
            let increase = waitTime[i] - lastWait;
            if(increase > longestIncrease.waitime && !first) {
              longestIncrease.waitime = increase;
              longestIncrease.standNumber = standkey;
              longestIncrease.weekNumber = weekKey;
            }
            first = false;
            lastWait = waitTime[i];
          }
        }
      }
    }
  }
  return longestIncrease;
};


readFile('__filename')
  .then(data => {
    let newStructure = restructure(data);
    //console.log(newStructure);
    calculate2(newStructure);
    //console.log(newStructure);

  });
