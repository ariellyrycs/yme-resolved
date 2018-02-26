


var fs = require('fs');
var CsvReadableStream = require('csv-reader');



let readFile = fileName => {
  return new Promise(function (res) {
    var inputStream = fs.createReadStream(fileName, 'utf8');
    var rows = []
    inputStream
       .pipe(CsvReadableStream({
         parseNumbers: true,
         parseBooleans: true,
         trim: true,
         delimiter: ','
       }))
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
  data.forEach(function (row, index) {
    if(!stands[row[0]]) stands[row[0]] = {};
    let stand = stands[row[0]];
    if(!stand[row[1]]) stand[row[1]] = [];
    let week = stand[row[1]];
    week.push({
      price: row[2],
      waitTime: row[3],
      tastiness: row[4],
      satisfaccion: row[3] / row[4],
      id: index
    });
  });
  return stands;
};




let calculate2 = stands => {
  var longestIncrease = {
    waitTime: 0,
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
          let info = weeks[weekKey];
          let len = info.length;
          for(let i = 0; i < len; i += 1) {
            var item = info[i];
            let increase = item.waitTime - lastWait;
            if(increase > longestIncrease.waitTime && !first) {
              longestIncrease.waitTime = increase;
              longestIncrease.standNumber = standkey;
              longestIncrease.weekNumber = weekKey;
            }
            first = false;
            lastWait = item.waitTime;
          }
        }
      }
    }
  }
  return longestIncrease;
};

let calculate3 = stands => {
  var availableTimeStands = {
    45: {
      stands: [],
      spentTime: 0,
      totalTastiness: 0
    },
    20: {
      stands: [],
      spentTime: 0,
      totalTastiness: 0
    }
  };
  for(let standkey in stands) {
    if(stands.hasOwnProperty(standkey)) {
      let bestOption = {45: {satisfaccion: 0}, 20: {satisfaccion: 0}};
      let weeks = stands[standkey];
      for(let weekKey in weeks) {
        if(weeks.hasOwnProperty(weekKey)) {
            let info = weeks[weekKey];
            info.forEach(item => {
              if(item.waitTime <= 45 && bestOption[45].satisfaccion < item.satisfaccion) {
                bestOption[45] = item;
              }
              if(item.waitTime <= 20  && bestOption[20].satisfaccion < item.satisfaccion) {
                if(bestOption[45].id === item.id) {
                    bestOption[20] = item;
                }
              }
            });
        }
      }

      if(bestOption[45].satisfaccion) {
        availableTimeStands[45].stands.push(bestOption[45]);
        availableTimeStands[45].spentTime += bestOption[45].waitTime;
        availableTimeStands[45].totalTastiness += bestOption[45].tastiness;
      }
      if(bestOption[20].satisfaccion) {
        availableTimeStands[20].stands.push(bestOption[20]);
        availableTimeStands[20].spentTime += bestOption[20].waitTime;
        availableTimeStands[20].totalTastiness += bestOption[20].tastiness;
      }
    }
  }

  return availableTimeStands;
};

readFile('__filename')
  .then(data => {
    let newStructure = restructure(data);
    //console.log(newStructure);
    console.log(calculate2(newStructure));

    console.log(calculate3(newStructure));
    //console.log(newStructure);

  });
