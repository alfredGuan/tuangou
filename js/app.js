 var Util = {
	tpl: function (id) {
		return document.getElementById(id).innerHTML;
	},
	ajax: function (url, fn) {
		// 创建xhr对象
		var xhr = new XMLHttpRequest();
		// 订阅
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					var data = JSON.parse(xhr.responseText)
					fn && fn(data)
				}
			}
		}
		xhr.open('GET', url, true)
		xhr.send(null);
	}
}
Vue.filter('price', function (price) {
	return price + '元';
})
Vue.filter('orignPrice', function (price) {
	return '门市价：' + price + '元';
})
Vue.filter('sales', function (num) {
	return '已售' + num;
})
// Util.ajax('data/home.json', function (data) {
	
// })
// 定义组件
var HomComponent = Vue.extend({
	template: Util.tpl('tpl_home'),
	data: function () {
		return{
			types: [
				{id: 1, title: '美食', url: '01.png'},
				{id: 2, title: '电影', url: '02.png'},
				{id: 3, title: '酒店', url: '03.png'},
				{id: 4, title: '休闲娱乐', url: '04.png'},
				{id: 5, title: '外卖', url: '05.png'},
				{id: 6, title: 'KTV', url: '06.png'},
				{id: 7, title: '周边游', url: '07.png'},
				{id: 8, title: '丽人', url: '08.png'},
				{id: 9, title: '小吃快餐', url: '09.png'},
				{id: 10, title: '火车票', url: '10.png'}
			],
			ad: [],
			list: []
		}
	},

	created: function () {
		this.$dispatch('show-search', true)
		var me = this;
		Util.ajax('data/home.json',function (res) {
			if(res && res.errno === 0) {
				me.ad = res.data.ad;
				me.list = res.data.list;
			}
		})
	}
})
// 列表
var ListComponent = Vue.extend({
	template: Util.tpl('tpl_list'),
		// 获取父组件传递的search数据
	props: ['csearch'],
	data: function () {
		return {
			types: [
				{value: '价格排序', key: 'price'},
				{value: '销量排序', key: 'sales'},
				{value: '好评排序', key: 'evaluate'},
				{value: '优惠排序', key: 'discount'}
			],
			// 默认保留前三个
			list: [],
			// 保留剩下的
			other: []
		}
	},
	methods: {
		// 将其他几条产品显示出来
		loadMore: function () {
			// this可以访问到组件的实例化对象
			this.list = [].concat(this.list, this.other)
			// this.list = this.list.concat(this.other);
			this.other = [];
		},
		// 列表排序方法
		sortBy: function (type) {
			if (type === 'discount') {
				// 优惠排序，市场价 - 现价
				this.list.sort(function (a, b) {
					var ap = a.orignPrice - a.price;
					var bp = b.orignPrice - b.price;
					// 得到优惠排序，就是做ap与bp的差值
					return ap - bp;
				})
			} else {
				this.list.sort(function (a, b) {
					// 正序
					// return a[type] - b[type]
					// 倒序
					return b[type] - a[type]
				})
			}
			
		}
	},
	created: function () {
		this.$dispatch('show-search', true)
			var me = this;
			var query = me.$parent.query;
			var str = '?';
			if (query[0] && query[1]) {
			str += query[0] + '=' + query[1]
		}
		// 发送异步请求获取异步数据
		Util.ajax('data/list.json', function (res) {
			// 保留返回数据
			if (res && res.errno === 0) {
				me.list = res.data.slice(0, 3)
				me.other = res.data.slice(3)
			}
		})
	}
	
})
var ProductComponent = Vue.extend({
	template: Util.tpl('tpl_product'),
	props: ['csearch'],
	data: function () {
		return {
			data: {
				src: '01.jpg'
			}
		}
	},
	created: function() {
		this.$dispatch('show-search', false)
		var me = this;
		Util.ajax('data/product.json', function (res) {
			if (res && res.errno === 0) {
				me.data = res.data;
				
			}
		})

	}
})
// 注册
Vue.component('home',HomComponent)
Vue.component('list',ListComponent)
Vue.component('product',ProductComponent)
// Vue实例化
var app = new Vue({
	el: '#app',
	data: {
		view: '',
		query: [],
		search: '',
		dealSearch: '',
		showSearch: true
	},
	methods: {
		goSearch: function () {
			// 将search 内容复制给dealSearch，将dealSearch传递给子组件
			this.dealSearch = this.search
		},
		goBack: function () {
			history.go(-1);
		}
	},
		events: {
		'show-search': function (val) {
			this.showSearch = val;
		}
	}
})
// 路由
function router() {
	var str = location.hash;
	// 处理掉#
	str = str.slice(1);
	// 处理/
	str = str.replace(/^\//,'')
	// 获取/前的字符串
	str = str.split('/')
	// 映射列表
	var map = {
		home:true,
		list:true,
		product:true
	}
	if (map[str[0]]) {
		app.view = str[0];
	} else {
		app.view = 'home'
	}
	app.query = str.slice(1);
}
window.addEventListener('load', router)
window.addEventListener('hashchange', router)
