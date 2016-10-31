/*
* @Author: hedgehog
* @Date:   2016-10-28 16:56:19
* @Last Modified by:   hedgehog
* @Last Modified time: 2016-10-31 15:17:16
*/

var App = function () {
  const _this = this;
  this.init = function () {
    // 地图
    $.getJSON('js/mapdata.json', function(data) {
      _this.mapData = data;
    });
    $.getJSON('js/prodata.json', function(data) {
      _this.proData = data;
    })
    $.getJSON('js/constellationdata.json', function(data) {
      _this.constellationData = data;
    })
  }
}
// 年龄
App.prototype.newAgePanel = function(ele, data) {
  if (!!this.agePanel) {
    this.agePanel.destroy();
    delete this.agePanel;
  }
  var Stat = G2.Stat;
  var chart = new G2.Chart({
    id: $(ele)[0].id,
    width: $(ele).width(),
    height: 500,
  });
  chart.source(data);
  //chart.axis('tem',{title: null,labels: null});
  // area 支持的图形类型：'area','smooth','line','dotLine','smoothLine','dotSmoothLine'
  chart.area().position('年龄*数量').color('类型').shape('area');
  chart.render();
  this.agePanel = chart;
}
// 地图
App.prototype.newMapPanel = function(ele, data) {
  if (!!this.mapPanel) {
    this.mapPanel.destroy();
    delete this.mapPanel;
  }
  var Stat = G2.Stat;
  var userData = [];
  var features = this.mapData.features;
  for(var i=0; i<features.length; i++) {
    var name = features[i].properties.name;
    userData.push({
      "name": name,
      "value": data[name] || 0,
    });
  }
  // console.log(userData);
  var chart = new G2.Chart({
    id: $(ele)[0].id,
    width: 1000,
    height: 500,
    plotCfg: {
      margin: [30, 180]
    }
  });
  $(ele).css({'margin': '0 auto', 'width': 1000});
  // 泡泡地图
  chart.source(userData);
  var gmap = new G2.Plugin.GMap({
    chart: chart,
    mapData: this.mapData,
    style: {
      stroke: '#006cb5',
      fill: '#4fb6fb'// '#4870b3'
    }
  }).draw();
  chart.tooltip(true,{
    crosshairs: false,
  });
  chart.legend('value', false);
  chart.point().position(Stat.map.center('name', this.mapData))
    .size('value', 26).opacity(0.75)
    .shape('circle')
    .color('value')
    .label('name',{
      label:{
        'fill': '#333',
      }
  });
  chart.render();
  this.mapPanel = chart;
}
// 性别
App.prototype.newGenderPanel = function(ele, data) {
  if (!!this.genderPanel) {
    this.genderPanel.destroy();
    delete this.genderPanel;
  }
  const Stat = G2.Stat;
  var chart = new G2.Chart({
    id: $(ele).attr('id'),
    width: $(ele).width(),
    height: 500,
    plotCfg: {
      margin: [40, 40]
    }
  });
  chart.source(data);
  chart.coord('theta',{
    radius: 0.7,
    inner: 0.6
  });
  chart.legend(false);

  chart.intervalStack()
    .position(Stat.summary.percent('num'))
    // .color('gender')
    .color('gender','rgb(72,112,179)-rgb(52, 158, 173)')
    .opacity(.85)
    .label('gender*..percent', (gender, percent)=>{
      // console.log(percent);
      return (gender + ' ' + (percent*100).toFixed(2) + '%');
    }, {offset: 10,label:{'fill':'#333'}});; // 这个时候需要保证 num 的总和为 100
  chart.render();
  this.genderPanel = chart;
}
// 星座
App.prototype.getConstellation = function(month, day) {
  var tmp = '';
  if (day < this.constellationData[month - 1].split) {
    tmp = this.constellationData[month - 1].name;
  } else {
    if (month === 12) {
      month = 0;
    }
    tmp = this.constellationData[month].name;
  }
  return tmp;
}
App.prototype.newConstellationPanel = function(ele, data) {
  if (!!this.constellationPanel) {
    this.constellationPanel.destroy();
    delete this.constellationPanel;
  }
  const Stat = G2.Stat;
  var chart = new G2.Chart({
    id: $(ele).attr('id'),
    width: $(ele).width(),
    height: 500,
    plotCfg: {
      margin: [50, 100]
    }
  });
  chart.source(data);
  chart.coord('polar');
  chart.axis('num',{
    labels: null,
    min: 0,
  });
  chart.axis('name',{
    gridAlign: 'middle',
    offset: 30,
    labels: {
      label: {
        'text-anchor': 'middle', // 设置坐标轴 label 的文本对齐方向
        'fill': '#333'
      }
    }
  });
  chart.legend(false);
  chart.interval().position('name*num')
    .color('name','rgb(78,125,202)-rgb(228,233,142)-rgb(200,45,61)')
    // .color('name','rgb(252,143,72)-rgb(255,215,135)')
    .label('num',{offset: -15,label: {'text-anchor': 'middle', 'font-weight': 'normal', }})
    .shape('stroke');
  chart.render();
  this.constellationPanel = chart;
}

var myApp = new App();
myApp.init();


// ready
$(document).ready(function() {

  $("#btn-primary").on('click', function() {
    if (!$('#id-num').val()) {
      alert('请按规定格式输入身份证号');
      return ;
    }
    if ($(this).hasClass('disabled')) {
      return ;
    }
    $(this).addClass('disabled');
    var arr = $('#id-num').val().replace(/[^0-9x\s,]/g, '').trim().replace(/[\s|,]/g, ' ').split(' ');

    // map后for再次整理出来的数据
    var ageObjArr = [];
    var areaObjPro = {};
    var genderObjArr = [];
    var constellationObjArr = [];

    // 第一次map整理出来的数据
    var ageObj = {};
    var areaObj = {};
    var genderObj = {};
    var constellationObj = {};

    arr.map(function(UUserCard, idx) {
      // 年龄
      var myDate = new Date();
      var month = myDate.getMonth() + 1;
      var day = myDate.getDate();

      var age = myDate.getFullYear() - UUserCard.substring(6, 10) - 1;
      if (UUserCard.substring(10, 12) < month || UUserCard.substring(10, 12) == month && UUserCard.substring(12, 14) <= day) {
        age++;
      }
      if (!ageObj[age]) {
        ageObj[age] = 1;
      } else {
        ageObj[age]++;
      }
      // 地区
      var tmpAreaPro = UUserCard.substring(0, 2);
      if (!areaObj[tmpAreaPro]) {
        areaObj[tmpAreaPro] = 1;
      } else {
        areaObj[tmpAreaPro]++;
      }
      // 性别
      if (parseInt(UUserCard.substr(16, 1)) % 2 == 1) {
        //男
        if (!genderObj['男性']) {
          genderObj['男性'] = 1;
        } else {
          genderObj['男性']++;
        }
      } else {
        //女
        if (!genderObj['女性']) {
          genderObj['女性'] = 1;
        } else {
          genderObj['女性']++;
        }
      }
      // 星座
      var tmpM = parseInt(UUserCard.substr(10, 2)), tmpD = parseInt(UUserCard.substr(12, 2));
      var tmpConstellation = myApp.getConstellation(tmpM, tmpD);
      if (!constellationObj[tmpConstellation]) {
        constellationObj[tmpConstellation] = 1;
      } else {
        constellationObj[tmpConstellation]++;
      }
    });

    // 年龄
    var age;
    for (age in ageObj) {
      if (ageObj.hasOwnProperty(age)) {
        ageObjArr.push({
          "类型": "年龄",
          "年龄": parseInt(age),
          "数量": ageObj[age],
        });
      }
    }
    // 地区
    var area;
    for (area in areaObj) {
      if (areaObj.hasOwnProperty(area)) {
        areaObjPro[myApp.proData[area]] = areaObj[area];
      }
    }
    // 性别
    var gender;
    for (gender in genderObj) {
      if (genderObj.hasOwnProperty(gender)) {
        genderObjArr.push({
          gender: gender,
          num: genderObj[gender],
        })
      }
    }
    // 星座
    var constellation;
    for (constellation in constellationObj) {
      if (constellationObj.hasOwnProperty(constellation)) {
        constellationObjArr.push({
          name: constellation,
          num: constellationObj[constellation],
        })
      }
    }

    // console.log(ageObj, ageObjArr);
    // console.log(areaObj, areaObjPro);
    // console.log(genderObj, genderObjArr);
    // console.log(constellationObj, constellationObjArr);
    myApp.newAgePanel('#agePanel', ageObjArr);
    myApp.newMapPanel('#mapPanel', areaObjPro);
    myApp.newGenderPanel('#genderPanel', genderObjArr);
    myApp.newConstellationPanel('#constellationPanel', constellationObjArr);
    var _this = this;
    setTimeout(function(){
      $(_this).removeClass('disabled');
    }, 5000);
  })
})
