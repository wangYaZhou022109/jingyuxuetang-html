
$(async function() {
  reload()
  initEarth()
})

function reload() {
  let timer = null
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  const hhs = [0, 6]
  timer = setInterval(() => {
    const hh = new Date().getHours()
    if (hhs.includes(hh)) {
      window.location.reload()
    }
  }, 60 * 60 * 1000)
}
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


async function initEarth() {
  const earth = document.querySelector('#earth')
  let timer = null
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  let myChart = echarts.getInstanceByDom(earth)
  if (myChart === undefined) {
    myChart = echarts.init(earth)
  }
  window.onresize = function () {
    myChart.resize()
  }
  earthConfig(myChart)
  timer = setInterval(async () => {
    earthConfig(myChart)
  }, 60 * 1000)
}

async function earthConfig (myChart) {
  try {
    const mapData = await $.get('https://log-statistics.rouchi.com/get_room_map')
    const startData = mapData.filter(val => val.role === 1) // 从老师出发
    const endData = mapData.filter(val => val.role === 2) // 到学生结束
    let lineWidth = 1
    let lineOpacity = 0.2
    if (startData.length < 50) {
      lineWidth = 2
      lineOpacity = 0.4
    }
    const series = startData.map((s, i) => {
      return {
        type: 'lines3D',
        name: s.name,
        effect: {
            show: true,
            trailWidth: 1,
            trailLength: 0.15,
            trailOpacity: 1,
            trailColor: 'rgb(30, 30, 60)'
        },
        lineStyle: {
            width: lineWidth,
            color: 'rgb(50, 50, 150)',
            // color: 'rgb(118, 233, 241)',
            opacity: lineOpacity
        },
        blendMode: 'lighter',
        data: endData.filter(e => e.room_id === s.room_id).map(v => {
          return [s.value, v.value]
        })
      }
    })
    const pointsData = mapData.map(val => val.value)
    series.push({
      type: 'scatter3D',
      coordinateSystem: 'globe',
      blendMode: 'lighter',
      symbolSize: 3,
      itemStyle: {
          color: 'rgb(50, 50, 150)',
          opacity: 0.6
      },
      data: pointsData
    })
    let option = {
      globe: {
        baseTexture: '/images/earth.jpg',
        shading: 'realistic',
        globeRadius: 70,
        light: {
          ambient: {
            color: '#fff',
            intensity: 3
          },
          main: {
            color: '#fff',
            intensity: 0.8
          },
          ambientCubemap: {
            diffuseIntensity: 0.5,
            specularIntensity: 0.5
          }
        },
        viewControl: {
          autoRotate: true,
          autoRotateSpeed: 3,
          zoomSensitivity: 0,
          rotateSensitivity: 0,
          panSensitivity: 0,
          autoRotateAfterStill: 0.001,
          autoRotateDirection: 'ccw',
          distance: 170,
          alpha: 10, // 沿X轴旋转20度，让中国更好的出现在北半球
          // targetCoord: [116.46, 39.92]
          beta: 210

        }
      },
      series: series
    }
    const getOpt = myChart.getOption()
    if (getOpt && getOpt.globe && getOpt.globe[0] && getOpt.globe[0].viewControl) {
      const getBeta = getOpt.globe[0].viewControl.beta || 0
      option.globe.viewControl.beta = getBeta
    }
    myChart.setOption(option, { notMerge: true }) // notMerge: true 不跟之前的option进行合并，否则数据减少了还是显示最多的数据
    
  } catch(err) {
    console.log(err)
  }
}
