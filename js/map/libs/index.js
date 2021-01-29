$(function () {
	let mapData = []
	let positionChange = false
	let oldService = 0
	let oldToday = 0
	let oldOnline = 0
	$.fn.extend({
		runNum: function (val, params) {
			/*初始化动画参数*/
			var valString = val
			var par = params || {};
			var runNumJson = {
				el: $(this),
				value: valString,
				valueStr: valString.toString(10),
				height: par.height || 50,
				interval: par.interval || 3000,
				speed: par.speed || 1000,
				width: par.width || 40,
				length: valString.toString(10).length
			};
			$._runNum._list(runNumJson.el, runNumJson);
		}
	});
	/*jQuery对象添加  _runNum  属性*/
	$._runNum = {
		/*初始化数字列表*/
		_list: function (el, json) {
			var str = '';
			for (var i = 0; i < json.length; i++) {
				var w = json.width * i;
				var t = json.height * parseInt(json.valueStr[i]);
				var h = json.height * 10;
				str += '<li style="width:' + json.width + 'px;left:' + w + 'px;top: ' + -t + 'px;height:' + h +
					'px;">';
				for (var j = 0; j < 10; j++) {
					str += '<div style="height:' + json.height + 'px;line-height:' + json.height + 'px;">' + j +
						'</div>';
				}
				str += '</li>';
			}
			el.html(str);
		},
		/*执行动画效果*/
		_animate: function (el, value, json) {
			for (var x = 0; x < json.length; x++) {
				var topPx = value[x] * json.height;
				el.eq(x).animate({
					top: -topPx + 'px'
				}, json.speed);
			}
		},
		/*定期刷新动画列表*/
		_interval: function (el, json) {
			var val = json.value;
			$._runNum._animate(el, val.toString(10), json);
		}
	}
	// 数字居中
	let itemWidth = $('.runNum').width()
	function setCenter(ele) {
		let liItem = $(ele).find('li')
		let liWidth = liItem.length * liItem.width()
		let margin = (itemWidth - liWidth) / 2
		$(ele).css({
			'margin-left': margin
		})
	}
	let studentColor = '#f96d67'
	let teacherColor = '#f0e21c'
	let bgColor = '#0a2a44'
	let landColor = '#042e63'
	let mapBorderColor = '#0e6fad'
	let pointBorderColor = '#888888'
	let hoverColor = '#f0e21c'
	let symbolSize = function (val) {
		let value = val[2]
		if (value > 10) {
			value = 10
		}
		if (value < 2) {
			value = 5
		}
		return value
	}
	let rippleEffect = {//涟漪特效
		brushType: 'stroke',
		period: 4,               //时间
		scale: 4,                //缩放比例
		brushType: 'stroke',     //'stroke''fill'。
	}
	let myCharts = echarts.init(document.getElementById('map'));
	var sleep = async (duration) => {
		return new Promise((resolve, reject) => {
			setTimeout(resolve, duration);
		});
	}
	function subData(data) {
		$("#service").runNum(data.service_num)
		$("#today").runNum(data.today_class_num)
		$("#online").runNum(data.online_num)
	}
	let option = {
		
		legend: {
			orient: 'vertical',
			data: ['学生', '老师'],
			bottom: '20%',
			left: '5%',
			textStyle: {
				color: 'rgba(255,255,255,0.85)',
				fontSize: 20
			}
		},
		tooltip: {
			trigger: 'item',
			formatter(params) {
				let str = params.name + ' : ' + params.value[2]
				return str
			}
		},
		backgroundColor: bgColor,
		geo: {
			// left:'center',
			top: '11%',
			map: 'world',
			zoom: 1.2,//缩放
			show: true,
			label: {
				emphasis: {
					show: false
				}
			},
			// roam: true,
			itemStyle: {// 定义样式
				normal: {// 普通状态下的样式
					areaColor: landColor,
					borderColor: mapBorderColor
				},
				emphasis: {// 高亮状态下的样式,默认黄色
					areaColor: hoverColor
				}
			}
		},
		series: [
			{ // stu_online
				name: '学生',
				type: 'effectScatter',
				coordinateSystem: 'geo',
				data: [],
				symbolSize: symbolSize,
				showEffectOn: 'emphasis',
				rippleEffect: rippleEffect,
				itemStyle: {
					normal: {
						color: studentColor,
						borderColor: pointBorderColor
					}
				},
				zlevel: 5
			},
			{ // stu_outline
				name: '学生',
				type: 'effectScatter',
				coordinateSystem: 'geo',
				data: [],
				symbolSize: symbolSize,
				showEffectOn: 'emphasis',
				rippleEffect: rippleEffect,
				itemStyle: {
					normal: {
						color: 'rgba(249,109,103,0.8)',
						borderColor: pointBorderColor
					}
				},
				zlevel: 1
			},
			{ // tea_online
				name: '老师',
				type: 'effectScatter',
				coordinateSystem: 'geo',
				data: [],
				symbolSize: symbolSize,
				showEffectOn: 'emphasis', //配置何时显示特效  render emphasis
				rippleEffect: rippleEffect,
				itemStyle: {
					normal: {
						color: teacherColor,
						borderColor: pointBorderColor
					}
				},
				zlevel: 5
			},
			{ // tea_outline
				name: '老师',
				type: 'effectScatter',
				coordinateSystem: 'geo',
				data: [],
				symbolSize: symbolSize,
				showEffectOn: 'emphasis', //配置何时显示特效  render emphasis
				rippleEffect: rippleEffect,
				itemStyle: {
					normal: {
						color: 'rgba(240,226,28,0.8)',
						borderColor: pointBorderColor
					}
				},
				zlevel: 1
			}
		]
	};
	function showTime() {
		nowtime = new Date();
		year = nowtime.getFullYear();
		month = nowtime.getMonth() + 1;
		date = nowtime.getDate();
		document.getElementById("time").innerText = year + "年" + month + "月" + date + " " + nowtime.toLocaleTimeString();
	}
	setInterval(showTime, 500);
	async function repeatFn() {
		mapData = await $.get('https://log-statistics.rouchi.com/getmap')
		option.series[1].data = mapData.stu_outline
		option.series[3].data = mapData.tea_outline
		myCharts.setOption(option)
		let service_num = await $.get('https://log-statistics.rouchi.com/getmap_serviceNum')
		mapData.service_num = service_num.service_num
		let today_class_num = await $.get('https://log-statistics.rouchi.com/getmap_todayClassNum')
		mapData.today_class_num = today_class_num.today_class_num
		let value1 = mapData.service_num
		let runNumJson1 = {
			value: value1,
			valueStr: value1.toString(10),
			height: 50,
			interval: 3000,
			speed: 1000,
			width: 40,
			length: value1.toString(10).length
		}
		let value2 = mapData.today_class_num
		let runNumJson2 = {
			value: value2,
			valueStr: value2.toString(10),
			height: 50,
			interval: 3000,
			speed: 1000,
			width: 40,
			length: value2.toString(10).length
		}
		let value3 = mapData.online_num
		let runNumJson3 = {
			value: value3,
			valueStr: value3.toString(10),
			height: 50,
			interval: 3000,
			speed: 1000,
			width: 40,
			length: value3.toString(10).length
		}
		$._runNum._interval($('#service').children("li"), runNumJson1)
		$._runNum._interval($('#today').children("li"), runNumJson2)
		$._runNum._interval($('#online').children("li"), runNumJson3)
		setCenter('#service')
		setCenter('#today')
		setCenter('#online')
		if (oldService.toString().length != value1.toString().length) {
			positionChange = true
			oldService = value1
		}
		if (oldToday.toString().length != value2.toString().length) {
			positionChange = true
			oldToday = value2
		}
		if (oldOnline.toString().length != value3.toString().length) {
			positionChange = true
			oldOnline = value3
		}
		if (positionChange) {
			subData(mapData)
			positionChange = false
		}
	}
	(async () => {
		try {
			// let geoData = await $.get('./libs/echarts/world.geo.json')
			let geoData = await $.get('/js/map/libs/echarts/world.geo.json')
			echarts.registerMap('world', geoData);
			mapData = await $.get('https://log-statistics.rouchi.com/getmap')
			option.series[0].data = mapData.stu_online
			option.series[1].data = mapData.stu_outline
			option.series[2].data = mapData.tea_online
			option.series[3].data = mapData.tea_outline
			myCharts.setOption(option)
			let service_num = await $.get('https://log-statistics.rouchi.com/getmap_serviceNum')
			mapData.service_num = service_num.service_num
			let today_class_num = await $.get('https://log-statistics.rouchi.com/getmap_todayClassNum')
			mapData.today_class_num = today_class_num.today_class_num

			oldService = mapData.service_num
			oldToday = mapData.today_class_num
			oldOnline = mapData.online_num
			// subData(mapData)
		} catch (error) {
			console.log(error)
		}
		setInterval(() => {
			try {
				// repeatFn()
			} catch (error) {
                console.log(error);
			}
		}, 60000);
		setCenter('#service')
		setCenter('#today')
		setCenter('#online')
		while (true) {
			await sleep(400)
			option.series[0].data = mapData.stu_online
			option.series[2].data = mapData.tea_online
			myCharts.setOption(option);
			await sleep(1000)
			option.series[0].data = []
			option.series[2].data = []
			myCharts.setOption(option);
		}
	})()
	window.onresize = function () {
		myCharts.resize();
		setCenter('#service')
		setCenter('#today')
		setCenter('#online')
	}
});
