
$(async function() {
  getTime()
  initPieChart()
  initLineChart()
  initUserChart()
})


function getTime() {
  const t = document.querySelector('#time')
  let timer = null
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  let date = new Date().Format('yyyy.MM.dd HH:mm:ss')
  t.innerHTML = date
  timer = setInterval(() => {
    date = new Date().Format('yyyy.MM.dd HH:mm:ss')
    t.innerHTML = date
  }, 1000)
}
async function initLineChart() {
  const line1 = document.querySelector('#chart-line1')
  const line2 = document.querySelector('#chart-line2')
  let timer = null
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  let myChart1 = echarts.getInstanceByDom(line1)
  let myChart2 = echarts.getInstanceByDom(line2)
  if (myChart1 === undefined) {
    myChart1 = echarts.init(line1)
  }
  if (myChart2 === undefined) {
    myChart2 = echarts.init(line2)
  }
  try {
    const mapData = await $.get('https://log-statistics.rouchi.com/get_room_infos')
    lineChartConfig(mapData, myChart1, 1)
    lineChartConfig(mapData, myChart2, 2)
  } catch (error) {
    console.log(error)
  }
  timer = setInterval(async () => {
    try {
      const mapData = await $.get('https://log-statistics.rouchi.com/get_room_infos')
      lineChartConfig(mapData, myChart1, 1)
      lineChartConfig(mapData, myChart2, 2)
    } catch (error) {
      console.log(error)
    }
  }, 60 * 1000)
}
async function lineChartConfig(mapData = {}, myChart, type) {
  const { online_nums, online_rooms, today_room_nums, servcie_nums, roomNums } = mapData
  document.querySelector('.cur-online-rooms').innerHTML = online_rooms || 0
  document.querySelector('.cur-online-users').innerHTML = online_nums || 0
  document.querySelector('.today-rooms-num').innerHTML = today_room_nums || 0
  document.querySelector('.servcie-num').innerHTML = servcie_nums || 0
  const option = {
    grid: {
      show: false
    },
    xAxis: {
      show: false,
        type: 'category',
        boundaryGap: false,
    },
    yAxis: {
      show: false,
      type: 'value'
    },
    series: [{
        data: type === 1 ? roomNums: [],
        type: 'line',
        smooth: true,
        smoothMonotone: 'average',
        symbol: 'none',
        itemStyle: {
          color: '#89d5fc',
          width: 5
        },
        areaStyle: {
          origin: 'start',
          opacity: 0.8,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: '#157DFA' // 0% 处的颜色
            }, {
              offset: 1, color: '#172547' // 100% 处的颜色
            }],
          global: false // 缺省为 false
        }
      }
    }]
  }
  myChart.setOption(option)
}

function getClassTimeData (timeClass) {
  const timeBox = document.querySelector('#class-time')
  let timer = null
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  getClassTimeList(timeBox, timeClass, 'init')
  timer = setInterval(() => {
    getClassTimeList(timeBox, timeClass)
  }, 24 * 60 * 60 * 1000)
}
async function getClassTimeList(timeBox, data, flag) {
  let timeClass = []
  if (flag !== 'init') {
    try {
      const mapData = await $.get('https://log-statistics.rouchi.com/get_class_info')
      timeClass = mapData.timeClass || []
    } catch (error) {
      console.log(error)
    }
  } else {
    timeClass = data
  }
  const ct = new Date().getTime()
  const timedata = timeClass.map(val => {
    const st = new Date(val.startTime).getTime()
    const et = new Date(val.endTime).getTime()
    return {
      startTime: val.startTime.split(' ')[1].split(':')[0] + ':00',
      endTime: val.endTime.split(' ')[1].split(':')[0] + ':00',
      total: val.total_cnt,
      st,
      et
    }
  })
  let str = ''
  timedata.forEach(val => {
    let activeClass = ''
    if (val.st <= ct && ct <= val.et) {
      activeClass = 'active'
    } else {
      activeClass = ''
    }
    str += '<li class="class-time-list '+ activeClass +'">'+
            '<div class="item">'+val.startTime+'</div>' +
            '<div class="item">'+val.endTime+'</div>'+
            '<div class="item">'+val.total+'</div>'+
        '</li>'
  })
  timeBox.innerHTML = str
  if (timedata.length > 5) {
    seamscroll.init({
      dom: document.getElementById('class-time'),
      step: 0.5
    })
  }
}
function initUserChart() {
  const ranging = document.querySelector('#user-ranging')
  let myChart = echarts.getInstanceByDom(ranging)
  if (myChart === undefined) {
    myChart = echarts.init(ranging)
  }
  let timer = null
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  initUserRanging(myChart)
  timer = setInterval(() => {
    initUserRanging(myChart)
  }, 10 * 60 * 1000)
}
async function initUserRanging(myChart) {
  try {
    const mapData = await $.get('https://log-statistics.rouchi.com/get_class_info')
    const { countryInfos = [], timeClass = [] } = mapData
    if (timeClass.length) {
      getClassTimeData(timeClass)
    }
    const countryName = countryInfos.map(val => val.name)
    const countryCount = countryInfos.map(val => val.count)
    const option = {
      grid: {
        left:10,
        top: -5,
        right:30,
        bottom:0,
        show: false,
        containLabel: true
      },
      xAxis: {
        show: false,
        position: 'top'
        // type: 'log'
      },
      yAxis: {
        type: 'category',
        max: 13,
        inverse: true,
        offset: 2,
        axisTick:{ //y轴刻度线
          show:false
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          textStyle: {
            color: '#9FAFC1'
          }
        },
        data: countryName
      },
      series: [
          {
            type: 'bar',
            encode: {},
            barWidth: 5,
            itemStyle: {
              color: '#157DFA'
            },
            label: {
              normal: {
                position: 'right',
                show: true,
                color: '#fff'
              },
            },
            data: countryCount
          }
      ]
    }
    myChart.setOption(option)
  } catch (error) {
    console.log(error)
  }
}

async function initPieChart() {
  const pie1 = document.querySelector('#pie1')
  const pie2 = document.querySelector('#pie2')
  const pie3 = document.querySelector('#pie3')
  // const pie4 = document.querySelector('#pie4')
  let timer = null
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  let myChart1 = echarts.getInstanceByDom(pie1)
  let myChart2 = echarts.getInstanceByDom(pie2)
  let myChart3 = echarts.getInstanceByDom(pie3)
  // let myChart4 = echarts.getInstanceByDom(pie4)
  if (myChart1 === undefined) {
    myChart1 = echarts.init(pie1)
  }
  if (myChart2 === undefined) {
    myChart2 = echarts.init(pie2)
  }
  if (myChart3 === undefined) {
    myChart3 = echarts.init(pie3)
  }
  // if (myChart4 === undefined) {
  //   myChart4 = echarts.init(pie4)
  // }
  try {
    const mapData = await $.get('https://log-statistics.rouchi.com/get_log_rates')
    initPie(myChart1, '信令成功率', 1, mapData)
    initPie(myChart2, '课件成功率', 2, mapData)
    initPie(myChart3, '音视频成功率', 3, mapData)
    // initPie(myChart4, '进入教室成功率', 4, mapData)
  } catch (error) {
    console.log(error)
  }
  timer = setInterval(async () => {
    try {
      const mapData = await $.get('https://log-statistics.rouchi.com/get_log_rates')
      initPie(myChart1, '信令成功率', 1, mapData)
      initPie(myChart2, '课件成功率', 2, mapData)
      initPie(myChart3, '音视频成功率', 3, mapData)
      // initPie(myChart4, '进入教室成功率', 4, mapData)
    } catch (error) {
      console.log(error)
    }
  }, 10000)
}
async function initPie(myChart, subtext, num, mapData={}) {
  const arr = [97, 98, 99, 100]
  const percent = arr[parseInt(Math.random()*arr.length)]
  const { classroom = {}, courseware = {}, media = {}, signaling = {} } = mapData
  const styleConfig = {
    1: {
      defaultPieColor: '#131014',
      pieColor: '#157DFB',
      percent: signaling.firstRate ? +signaling.firstRate.split('%')[0] : percent
    },
    2: {
      pieColor: '#4B9AE3',
      defaultPieColor: '#121016',
      percent: courseware.firstRate ? +courseware.firstRate.split('%')[0] : percent
    },
    3: {
      defaultPieColor: '#12121e',
      pieColor: '#89d5fc',
      percent: media.firstRate ? +media.firstRate.split('%')[0] : percent
    },
    4: {
      defaultPieColor: '#141b26',
      pieColor: '#b2e2ff',
      percent: classroom.firstRate ? +classroom.firstRate.split('%')[0] : percent
    }
  }
  
  const option = {
    title: {
      subtext,
      textAlign: 'center',
      subtextStyle: {
        color: 'rgb(159, 175, 193)',
        fontSize: 12,
        lineHeight: 17
      },
      bottom: 10,
      left: 35
    },
    series: [
      {
        type: 'pie',
        center : ['50%', '34%'],
        radius: ['82%', '90%'],
        avoidLabelOverlap: false,
        hoverOffset: 0,
        startAngle: 0,
        label: {
          show: true,
          position: 'center',
          textStyle: {
            fontSize: 16
          }
        },
        labelLine: {
          show: false
        },
        data: [
          {
            value: styleConfig[num].percent, 
            name: styleConfig[num].percent + '%',
            itemStyle: {
              color: styleConfig[num].pieColor
            },
          },
          {
            value: (100 - styleConfig[num].percent),
            name: '',
            itemStyle: {
              color: styleConfig[num].defaultPieColor
            },
          },
        ]
      }
    ]
  }
  myChart.setOption(option)
}


Date.prototype.Format = function (fmt) {
  var o = {
      "M+": this.getMonth() + 1, //月份 
      "d+": this.getDate(), //日 
      "H+": this.getHours(), //小时 
      "m+": this.getMinutes(), //分 
      "s+": this.getSeconds(), //秒 
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
      "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}
