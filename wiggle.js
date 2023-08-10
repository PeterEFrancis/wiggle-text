function rand_sign() {
	return Math.random() > 0.5 ? 1 : -1;
}


function factorial(m) {
	if (m == 0) {
		return 1;
	}
	return m * factorial(m - 1);
}

function choose(n, k) {
	return factorial(n) / factorial(k) / factorial(n - k);
}

function dist(a, b) {
	return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** (1/2);
}

function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function get_random_UD_path(n) {
	let m = Math.floor(n / 2);
	let arr = [...new Array(m).fill(1), ...new Array(m).fill(-1)];
	if (n % 2 == 1) {
		arr.push(0);
	}
	return shuffle(arr);
}

function partial_sums(arr) {
	let ret = [0];
	for (let i = 0; i < arr.length; i++) {
		ret.push(ret[ret.length - 1] + arr[i]);
	}
	return ret;
}

function get_max_spread(UD_path) {
	let ps = partial_sums(UD_path);
	return Math.max(...ps.map(x => Math.abs(x)));
}

function get_bounded_UD_path(n, bound, start) {
	if (n == 0) {
		return start;
	}

	start = start || [];

	let add = Math.min(n, 15);
	
	while (true) {
		let UD = get_random_UD_path(add);
		if (get_max_spread(UD) < bound) {
			start = [...start, ...UD];
			return get_bounded_UD_path(n - add, bound, start);
		}
	}
}

function bezier(points) {
	// returns bezier path function

	const n = points.length - 1;

	return function (t) {
		let sum = [0, 0];
		for (let i = 0; i <= n; i++) {
			let fact = choose(n, i) * ((1 - t) ** (n - i)) * (t ** i);
			sum[0] += fact * points[i][0];
			sum[1] += fact * points[i][1];
		}
		return sum;
	}
}

function approx_length(path) {
	let ret = 0;
	let T = 10000;
	for (let i = 1; i < T; i++) {
		ret += dist(path((i - 1) / T), path(i / T));
	}
	return ret;
}

function get_points(path) {
	let num_steps = approx_length(path) / 5;
	let ret = [];
	for (let i = 0; i < num_steps; i++) {
		ret.push(path(i / num_steps))
	}
	ret.push(path(1));
	return ret;
}



const c = 0.55228474983079;
const circ = [
	[[1, 0], [1, c], [c, 1], [0, 1]],
	[[0, 1], [-c, 1], [-1, c], [-1, 0]],
	[[-1, 0], [-1, -c], [-c, -1], [0, -1]],
	[[0, -1], [c, -1], [1, -c], [1, 0]]
];

function circle_points(pos, r) {
	let ret = [];
	for (let i = 0; i < circ.length; i++) {
		ret.push([]);
		for (let j = 0; j < circ[i].length; j++) {
			ret[i].push([
				pos[0] + r * circ[i][j][0],
				pos[1] + r * circ[i][j][1]	
			]);
		}
		
	}
	return ret;
}



const LETTERS = " qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890!@#$%^&*()-_=+{}|[]\\;':\",./<>?`";


var letter_dict_cache = {};
function letter_dict(letter, h) {
	let str = JSON.stringify([letter, h]);
	if (!(str in letter_dict_cache)) {
	
		let w = h * 2/3;
		let w1 = h * 0.9;
		let dict = {
			' ': [],
			"A": [
				[[0, h], [w/2, 0]],
				[[w/2, 0], [w, h]],
				[[w/4, h/2], [w * 3/4, h/2]]
			],
			// "B": [
			// 	[[0, 0], [0, h]],
			// 	[[0, 0], [w*2/3*7/9, 0], [w*2/3, h/2*2/9], [w*2/3, h/4]],
			// 	[[w*2/3, h/4], [w*2/3, h/2*7/9], [w*2/3*7/9, h/2], [0, h/2]],
			// 	[[0, h/2], [w*7/9, h/2], [w*8/9, h/2 + h/2*1/9], [w*8/9, h*3/4]],
			// 	[[w*8/9, h*3/4], [w*8/9, h/2 + h/2*8/9], [w*7/9, h], [0,h]]
			// ],
			"B": [
				[[0, 0], [0, h]],
				[[0, 0], [w*2/3*7/9, 0], [w*2/3, h/2*2/9], [w*2/3, h/4], [w*2/3, h/2*7/9], [w*2/3*7/9, h/2], [0, h/2]],
				[[0, h/2], [w/2, h/2], [w*7/9, h/2], [w*8/9, h/2 + h/2*1/9], [w*8/9, h*3/4], [w*8/9, h/2 + h/2*8/9], [w*7/9, h], [w/2, h], [0,h]]
			],
			"C": [
				[[w, h/10], [w, 0], [w/2, -h/15], [0, 0], [0, 0], [0, h/2], [0, h], [0, h], [w/2, h*16/15], [w, h], [w, h*8/9]].map(x => [x[0] - w/20, x[1]])
			],
			// "C": [
			// 	[[w, h/9], [w*8/9, 0], [w/2 + w/9, 0], [w/2, 0]],
			// 	[[w/2, 0], [w*5/18, 0], [0, h*2/9], [0, h/2]],
			// 	[[0, h/2], [0, h*7/9], [w*5/18, h], [w/2, h]],
			// 	[[w/2, h], [w/2 + w/9, h], [w*8/9, h], [w, h*8/9]]
			// ],
			"D": [
				[[0, 0], [0, h]],
				[[0, 0], [w, 0], [w, 0], [w, h/2], [w, h], [w, h], [0, h]]
			],
			"E": [
				[[0, 0], [0, h]],
				[[0, 0], [w, 0]],
				[[0, h/2], [w/2, h/2]],
				[[0, h], [w, h]]
			],
			"F": [
				[[0, 0], [0, h]],
				[[0, 0], [w, 0]],
				[[0, h/2], [w/2, h/2]],
			],
			"G": [
				[[w1, h/9], [w1*8/9, 0], [w1/2 + w1/9, 0], [w1/2, 0], [0, 0], [0, 0], [0, h*4/5], [0, h], [w1*2/3, h]],
				[[w1*2/3, h], [w1, h*15/16]],
				[[w1, h*15/16], [w1, h * 2/3]],
				[[w1 * 2/3, h * 2/3], [w1, h * 2/3]]
			].map(x => x.map(y => [y[0] - w1/15, y[1]])),
			"H": [
				[[0, 0], [0, h]],
				[[w, 0], [w, h]],
				[[0, h/2], [w, h/2]]
			],
			"I": [
				[[0, 0], [w, 0]],
				[[w/2, 0], [w/2, h]],
				[[0, h], [w, h]]
			],
			"J": [
				[[0, 0], [w, 0]],
				[[w*2/3, 0], [w*2/3, h], [w*2/3, h*3/4], [w*2/3, h], [w/3, h], [0, h], [0, h*3/4]]
			],
			"K": [
				[[0, 0], [0, h]],
				[[0, h/2], [w, 0]],
				[[w/4, h/2 - h/8], [w, h]]
			],
			"L": [
				[[0, 0], [0, h]],
				[[0, h], [w, h]]
			],
			"M": [
				[[0, 0], [0, h]],
				[[0, 0], [w/2, h/2]],
				[[w/2, h/2], [w, 0]],
				[[w, 0], [w, h]]
			],
			"N": [
				[[0, 0], [0, h]],
				[[0, 0], [w, h]],
				[[w, 0], [w, h]]
			],
			"O":circle_points([h/2, h/2], h/2),
			// "O": [
			// 	[[w1/2, 0], [w1*2/9, 0], [0, h*2/9], [0, h/2]],
			// 	[[0, h/2], [0, h*7/9], [w1*2/9, h], [w1/2, h]],
			// 	[[w1/2, h], [w1*7/9, h], [w1, h*7/9], [w1, h/2]],
			// 	[[w1, h/2], [w1, h*2/9], [w1*7/9, 0], [w1/2,0]]
			// 	// [[w/2, 0], [w/9, 0], [0, h/9], [0, h/2], [0, h*8/9], [w/9, h], [w/2, h], [w*8/9, h], [w, h*8/9], [w, h/2], [w, h/9], [w*8/9, 0], [w/2, 0]]
			// ],
			"P": [
				[[0, 0], [0, h]],
				[[0, 0], [w, 0],[w, 0], [w, h/2], [w, h/2], [0, h/2]]
			],
			"Q": [
				// [[w1/2, 0], [w1*2/9, 0], [0, h*2/9], [0, h/2]],
				// [[0, h/2], [0, h*7/9], [w1*2/9, h], [w1/2, h]],
				// [[w1/2, h], [w1*7/9, h], [w1, h*7/9], [w1, h/2]],
				// [[w1, h/2], [w1, h*2/9], [w1*7/9, 0], [w1/2,0]],
				...circle_points([h/2, h/2], h/2),
				[[w1 * 2/3, h*2/3], [w1, h]]
			],
			"R": [
				[[0, 0], [0, h]],
				[[0, 0], [w, 0],[w, 0], [w, h/2], [w, h/2], [0, h/2]],
				[[w/3, h/2], [w, h]]
			],
			"S": [
				[[w*9/10, h/10], [w*7/10, 0], [w/2, 0], [0, 0], [0, 0], [0, h/2], [0, h/2], [w/2, h/2]],
				[[w/2, h/2], [w*.9, h/2], [w, h/2], [w, h*8/9], [w, h], [w*8/9, h], [w/2, h], [w/8, h], [0, h*8/9]]
			],
			"T": [
				[[0, 0], [w, 0]],
				[[w/2, 0], [w/2, h]]
			],
			"U": [
				[[0, 0], [0, h], [0, h], [w/2, h*1.1], [w, h], [w, h], [w, 0]]
			],
			"V": [
				[[0, 0], [w/2, h]],
				[[w/2, h], [w, 0]]
			],
			"W": [
				[[0, 0], [w/5, h]],
				[[w/5, h], [w/2, h/3]],
				[[w/2, h/3], [w*4/5, h]],
				[[w*4/5, h], [w,0]]
			],
			"X": [
				[[0, 0], [w, h]],
				[[0, h], [w, 0]]
			],
			"Y": [
				[[0, 0], [w/2, h/2]],
				[[w/2, h/2], [w/2, h]],
				[[w/2, h/2], [w, 0]]
			],
			"Z": [
				[[0, 0], [w, 0]],
				[[w, 0], [0, h]],
				[[0, h], [w, h]]
			],
			// "a": [
			// 	[[w*0.1, h/2], [w*2/3, h/2], [w*2/3, h/2], [w*2/3, h]],
			// 	[[w*.66, h*2/3], [w/3, h/2], [0, h/2], [0, h*3/4], [0, h*.9], [0, h], [w/3, h], [w*2/3, h*.95]]
			// ].map(x => x.map(y => [y[0] - w*0.04, y[1]])),
			"a": [
				...circle_points([h/4, h*3/4], h/4),
				[[h/2, h*.6], [h/2, h]],
			],
			"b": [
				...circle_points([h/4, h*3/4], h/4),
				[[0, 0], [0, h]],
				// [[0, h*7/9], [0, h/2], [w/2.5, h/3], [w*7/9, h/2], [w*8/9, h/2 + h/2*1/9], [w*8/9, h*3/4], [w*8/9, h/2 + h/2*8/9], [w*7/9, h], [w/2, h], [0, h*1.05], [0,h*8/9]]
			],
			"c": [
				[[w*2/3, h/2 +h/20], [w*2/3, h/2], [w/3, h/2-h/30], [0, h/2], [0, h/2], [0, h*3/4], [0, h], [0, h], [w/3, h/2 + h*8/15], [w*2/3, h], [w*2/3, h/2 + h*4/9]].map(x => [x[0] - w/20, x[1]])
				// [[w*2/3, h*0.6], [w*2/3, h*0.4], [w/3, h*0.5], [0, h*0.5], [0, h*0.6], [0, h*0.75], [0, h], [0, h], [w/3, h], [w*2/3, h]]
			],
			"d": [
				...circle_points([h/4, h*3/4], h/4),
				[[h/2, 0], [h/2, h]],
			],
			"e": [
				[[w*2/3, h*3/4], [w*2/3, h/2], [w/3, h/2], [0, h/2], [0, h*3/4]],
				[[0, h*3/4], [w*2/3, h*3/4]],
				[[0, h*3/4], [0, h], [w/6, h], [w/2, h], [w*2/3, h], [w*2/3, h*0.9]]
			],
			"f": [
				[[w/3, h*0.1], [w/3, 0], [w*2/3, 0], [w*2/3, h*0.1]],
				[[w/3, h*0.1], [w/3, h]],
				[[0, h/2.5], [w*2/3, h/2.5]]
			],
			"g": [
				...circle_points([h/4, h*3/4], h/4),
				[[h/2, h/2], [h/2, h*5/4]],
				[[h/2, h*5/4], [h/2, h*3/2], [0, h*3/2], [0, h*5/4]]
			],
			"h": [
				[[0, 0], [0, h]],
				[[0, h], [0, h*.5], [w*2/9, h/2], [w*4/9, h/2], [w*2/3, h/2], [w*2/3, h*.7], [w*2/3, h]]
			],
			"i": [
				...circle_points([w/20, h*0.38], w/20),
				[[w/20, h/1.8], [w/20, h]]
			],
			"j": [
				...circle_points([w*2/3, h*0.4], w/20),
				[[w*2/3, h/2], [w*2/3, h*5/4]],
				[[w*2/3, h*5/4], [w*2/3, h*1.6], [w*0.2, h*3/2], [w*0.2, h*1.4]]
			].map(x => x.map(y => [y[0] - w*0.2, y[1]])),
			"k": [
				[[0, 0], [0, h]],
				[[0, h/1.5], [w*2/3, h/4]],
				[[w*0.2, h/1.5 + (w*2/3 - w*0.2) * ((h/4 - h/1.5) / w*2/3)], [w*2/3, h]]
			],
			"l": [
				[[0, 0], [0, h]]
			],
			"m": [
				[[0, h/2], [0, h]],
				[[0, h], [0, h/2], [w/8, h/2], [w*3/8, h/2], [w/2, h/2], [w/2, h*.7], [w/2, h]],
				[[w/2, h], [w/2, h/2], [w*5/8, h/2], [w*7/8, h/2], [w, h/2], [w, h*.7], [w, h]]
			],
			"n": [
				[[0, h/2], [0, h]],
				[[0, h], [0, h*.5], [w*2/9, h/2], [w*4/9, h/2], [w*2/3, h/2], [w*2/3, h*.7], [w*2/3, h]]
			],
			"o": [
				...circle_points([h/4, h*3/4], h/4),
			],
			"p": [
				...circle_points([h/4, h*3/4], h/4),
				[[0, h/2], [0, h*3/2]],
			],
			"q": [
				...circle_points([h/4, h*3/4], h/4),
				[[h/2, h/2], [h/2, h*3/2]]
			],
			"r": [
				[[0, h/2], [0, h]],
				[[0, h], [0, h/2], [w/9, h/2], [w*4/9, h/2.1], [w*2/3, h/1.8]]
			],
			"s": [
				[[w*2/3*9/10, h/2 + h/20], [w*2/3*7/10, h/2], [w*2/3/2, h/2], [0, h/2], [0, h/2], [0, h*3/4], [0, h*3/4], [w*2/3/2, h*3/4]],
				[[w*2/3/2, h*3/4], [w*2/3*.9, h*3/4], [w*2/3, h*3/4], [w*2/3, h/2 + h*4/9], [w*2/3, h], [w*2/3*8/9, h], [w*2/3/2, h], [w*2/3/8, h], [0, h/2 + h*4/9]]
			],
			"t": [
				[[w/3, 0], [w/3, h]],
				[[0, h/2.5], [w*2/3, h/2.5]]
			],
			"u": [
				[[0, h/2], [0, h], [0, h], [w/3, h], [w*2/3, h], [w*2/3, h], [w*2/3, h/2]]
			],
			"v": [
				[[0, h/2], [w/3, h]],
				[[w/3, h], [w*2/3, h/2]]
			],
			"w": [
				[[0, h/2], [w/4, h]],
				[[w/4, h], [w/2, h/2]],
				[[w/2, h/2], [w*3/4, h]],
				[[w*3/4, h], [w, h/2]]
			],
			"x": [
				[[0, h/2], [w/2, h]],
				[[0, h], [w/2, h/2]]
			],
			"y": [
				[[0, h/2], [w/3, h]],
				[[w*2/3, h/2], [0, h*3/2]]
			],
			"z": [
				[[0, h/2], [w/2, h/2]],
				[[w/2, h/2], [0, h]],
				[[0, h], [w/2, h]]
			],		
			"1": [
				[[w/2 - w/5, 0], [w/2 - w/5, h]],
				[[0, h], [w*3/5,h]],
				[[w/2 - w/5, 0], [0, h/3]]
			],
			"2": [
				[[0, h], [w*7/9, h]],
				[[0, h], [w, h/3], [w, 0], [w/2, -h/9], [0, 0], [0, h/4]]
			],
			"3": [
				[[0, h/9], [0, 0], [w/3, 0], [w*2.5/3, 0], [w, 0], [w, h/4], [w, h/2.25], [w/3, h/2]],
				[[w/3, h/2], [w, h/2.25], [w, h*0.6], [w, h], [w, h], [w/2, h], [0, h], [0, h*8/9]],
			],
			"4": [
				[[w*3/4, 0], [0, h*2/3]],
				[[0, h*2/3], [w, h*2/3]],
				[[w*3/4, 0], [w*3/4, h]]
			],
			"5": [
				[[w*8/9, 0], [0, 0]],
				[[0, 0], [0, h*0.5]],
				[[0, h*0.5], [0, h*0.4], [w/2, h*0.2], [w, h*2/5], [w, h*2/5], [w, h], [w, h], [w/2, h*1.1], [0, h], [0, h*8/9]]
			],
			"6": [
				[[w*7.3/9, h/15], [w/3, -h/7], [0, h/9], [0, h/2], [0, h/2], [0, h], [0, h], [w/2, h*4.2/3], [w, h], [w, h], [w, h/2], [w, h/2], [w/2.4, h/5], [w/10, h*2/3], [w/7.1, h*3.1/4]].map(x => [x[0] - w * 0.08, x[1]])
			],
			"7": [
				[[0, 0], [w, 0]],
				[[w, 0], [w/4, h]]
			],
			"8": [
				...circle_points([h/4, h/4], h/4),
				...circle_points([h/4, h*3/4], h/4)
				// [[w/2, h/2], [w, h/2], [w*4/3, 0], [w/2, -h/3], [-w/3, 0], [0, h/2], [w/2, h/2]],
				// [[w/2, h/2], [w, h/2], [w*4/3, h], [w/2, h*4/3], [-w/3, h], [0, h/2], [w/2, h/2]],
			],
			"9": [
				[[w*7.3/9, h/15], [w/3, -h/7], [0, h/9], [0, h/2], [0, h/2], [0, h], [0, h], [w/2, h*4.2/3], [w, h], [w, h], [w, h/2], [w, h/2], [w/2.4, h/5], [w/10, h*2/3], [w/7.1, h*3.1/4]].map(x => [w - x[0] - w * 0.18, h - x[1]])
			],
			"0": [
				[[w/2, 0], [w*2/9, 0], [0, h*2/9], [0, h/2]],
				[[0, h/2], [0, h*7/9], [w*2/9, h], [w/2, h]],
				[[w/2, h], [w*7/9, h], [w, h*7/9], [w, h/2]],
				[[w, h/2], [w, h*2/9], [w*7/9, 0], [w/2,0]],
				[[w*7.3/9, h*1/9], [w*1.7/9, h*8/9]]
			],
			"!": [
				...circle_points([w/20, h - w/20], w/20),
				[[w/20, 0], [w/20, h*0.8]]
			],
			"@": [
				[[w, h], [w*0.6, h*1.1], [w/2, h*1.1], [w/3, h], [0, h], [0, h], [0, h/3], [0, h/3], [w/3, h/3], [w/2, h/3], [w, h/3], [w, h/2], [w, h/2], [w, h/2], [w, h/2], [w, h], [w, h], [w*0.9, h], [w*0.8, h*0.9], [w*0.72, h], [w*0.72, h], [w*0.73, h*0.6]],
				[[w*0.73, h*0.6], [w*0.2, h*0.5], [w*0.2, h*0.97], [w*0.73, h*0.9]]
				// [[w, h], [w, h/2], [w, h/3], [w/2, h/3], [0, h/3], [0, h/2], [0, h], [w/5, h], [w/4, h], [w*3/4, h], [w*0.95, h], [w*0.85, h*0.6]],
			].map(x => x.map(y => [y[0] - w*0.15, y[1]])),
			"#": [
				[[w/2, 0], [w/6, h]],
				[[w*5/6, 0], [w/2, h]],
				[[0, h/3], [w, h/3]],
				[[0, h*2/3], [w, h*2/3]]
			],
			"$": [
				...[[[w*9/10, h/10], [w*7/10, 0], [w/2, 0], [0, 0], [0, 0], [0, h/2], [0, h/2], [w/2, h/2]],
				[[w/2, h/2], [w*.9, h/2], [w, h/2], [w, h*8/9], [w, h], [w*8/9, h], [w/2, h], [w/8, h], [0, h*8/9]]].map(x => x.map(y => [y[0] * 0.8, y[1]*0.8 + h*0.1])),
				[[w*0.4, 0], [w*0.4, h]]

			],
			"%": [
				...circle_points([w/3, h/4], w/6),
				[[w, h/4], [0, h*3/4]],
				...circle_points([w*2/3, h*3/4], w/6)
			],
			"^": [
				[[0, h/4], [w/3, 0]],
				[[w/3, 0], [w*2/3, h/4]]
			],
			"&": [
				[[w/2, h/2.5], [w*2.5/3, h/4], [w*2.5/3, 0], [w/2, 0], [w/3, h/8], [0, 0], [w, h]],
				[[w, h/2], [w, h], [w/2, h*1.2], [0, h], [0, h/1.5], [w/2, h/2.5]]
			].map(x => x.map(y => [y[0] - w * 0.18, y[1]])),
			"*": [
				[[w/4, h*2/7], [w/4, h*5/7]],
				[[0, h*2/5], [w/2, h*3/5]],
				[[w/2, h*2/5], [0, h*3/5]]
			],
			"(": [
				[[w/2, 0], [0, h/2], [w/2, h]].map(x => [x[0] - w*.25, x[1]])
			],
			")": [
				[[0, 0], [w/2, h/2], [0, h]]
			],
			"-": [
				[[0, h/2], [w, h/2]]
			],
			"_": [
				[[0, h], [w, h]]
			],
			"+": [
				[[w/3, h/4], [w/3, h*3/4]],
				[[0, h/2], [w*2/3, h/2]],
			],
			"=": [
				[[0, h*2/5], [w/2, h*2/5]],
				[[0, h*3/5], [w/2, h*3/5]],
			],
			"[": [
				[[0, 0], [w/4, 0]],
				[[0, 0], [0, h]],
				[[0, h], [w/4, h]]
			],
			"]": [
				[[0, 0], [w/4, 0]],
				[[w/4, 0], [w/4, h]],
				[[0, h], [w/4, h]]
			],
			"{": [
				[[w/3, 0], [0, 0], [w/3, h/2], [0, h/2]],
				[[w/3, h], [0, h], [w/3, h/2], [0, h/2]]
			],
			"}": [
				[[0, 0], [w/3, 0], [0, h/2], [w/3, h/2]],
				[[0, h], [w/3, h], [0, h/2], [w/3, h/2]],
			],
			"/": [
				[[0, h], [w/3, 0]]
			],
			"\\": [
				[[0, 0], [w/3, h]]
			],
			"?": [
				...circle_points([w/2, h-w/20], w/20),
				[[0, h/3], [0, 0], [w/2, -h/6], [w, 0], [w, h/3], [w, h/2], [w/2, h/3], [w/2, h*0.8]]
			],
			".": [
				...circle_points([w/20, h-w/20], w/20)
			],
			"<": [
				[[w, h/4], [0, h/2]],
				[[0, h/2], [w, h*3/4]]
			],
			">": [
				[[0, h/4], [w, h/2]],
				[[w, h/2], [0, h*3/4]]
			],
			",": [
				[[w*2/9, h*8/9], [w/9, h*10.5/9], [0, h*10/9]]
			],
			":": [
				...circle_points([w/20, h/4], w/20),
				...circle_points([w/20, h * 3 / 4], w/20)
			],
			";": [
				...circle_points([w/10, h/4], w/20),
				[[w*2/9, h*8/9], [w/9, h*10.5/9], [0, h*10/9]].map(x => [x[0], x[1] - h*0.2])
			],
			"\'": [
				[[0, 0], [0, h/5]]
			],
			"\"": [
				[[0, 0], [0, h/5]],
				[[w/5, 0], [w/5, h/5]]
			],
			"|": [
				[[0, 0], [0, h]]
			],
			"~": [
				[[0, h*0.6], [w/4, h/3], [w/2, h/2], [w*3/4, h*2/3], [w, h*0.4]]
			],
			"`": [
				[[0, 0], [w/5, h/5]]
			],
			"box": [
				[[0, 0], [w, h]],
				[[0, h], [w, 0]],
				[[0, 0], [w, 0]],
				[[w, 0], [w, h]],
				[[w, h], [0, h]],
				[[0, h], [0, 0]]
			]
		}
		if (letter in dict) {
			letter_dict_cache[str] = dict[letter];
		} else {
			letter_dict_cache[str] = dict['box'];
		}
	}
	return letter_dict_cache[str];
}


function get_width_helper(letter, height) {
	if (letter == " ") {
		return height/2;
	}

	let bez_points = letter_dict(letter, height);

	let xs = [];
	for (let cmd of bez_points) {
		let points = get_points(bezier(cmd));
		for (let pt of points) {
			xs.push(pt[0]);
		}
	}

	return Math.max(...xs) - Math.min(...xs);
}
// var width_dict = {};
// for (let letter of LETTERS) {
// 	width_dict[letter] = get_width_helper(letter, 100);
// }
var width_dict = {"0":240,"1":144,"2":186.66666666666666,"3":224.45033348456477,"4":240,"5":213.73916654024327,"6":183.65256809151686,"7":240,"8":180,"9":183.65256809151703," ":180,"q":180.00000000000003,"w":240,"e":160,"r":160,"t":160,"y":160,"u":160,"i":24,"o":180,"p":180,"a":180,"s":151.56034273650343,"d":180.00000000000003,"f":160,"g":180,"h":160,"j":124,"k":160,"l":0,"z":120,"x":120,"c":149.53121773707232,"v":160,"b":180,"n":160,"m":240,"Q":360,"W":240,"E":240,"R":240,"T":240,"Y":240,"U":240,"I":240,"O":360,"P":224.9891860732131,"A":240,"S":227.34989822067473,"D":232.49902221001935,"F":240,"G":301.6384358269238,"H":240.00000000000003,"J":240,"K":240,"L":240,"Z":240,"X":240,"C":224.2912419235504,"V":240,"B":199.99993896393926,"N":240.00000000000003,"M":240.00000000000003,"!":24,"@":205.8854711653851,"#":240,"$":181.88160831424358,"%":240,"^":160,"&":197.53473647512007,"*":120,"(":59.9902014995162,")":59.9902014995162,"-":240,"_":240,"=":120,"+":160,"{":80,"}":80,"|":0,"[":60,"]":60.00000000000001,"\\":80,";":53.333333333333336,"'":0,":":24,"\"":48,",":53.333333333333336,".":24,"/":80,"<":240,">":240,"?":207.16850583096533};
function get_width(letter, height) {
	if (letter in width_dict) {
		return width_dict[letter] * height / 360;
	}
	return height * 2/3;
}





function get_word_width(word, height, spacing) {
	let ret = 0;
	for (let letter of word) {
		ret += get_width(letter, height) + spacing;
	}
	return ret;
}





function plot_point_path(ctx, points, offset, pert) {
	// let xs = [];
	offset = offset || [0, 0];
	ctx.beginPath();
	let x = offset[0] + points[0][0];
	let y =  offset[1] + points[0][1];
	ctx.moveTo(x, y);
	// xs.push(x);
	let ps = partial_sums(get_bounded_UD_path(points.length, 5));
	for (let i = 1; i < points.length; i++) {
		x = offset[0] + points[i][0] + ps[i] * pert;
		y = offset[1] + points[i][1] + ps[i] * pert;
		ctx.lineTo(x, y);
		// xs.push(x);
	}
	x = offset[0] + points[points.length - 1][0];
	y = offset[1] + points[points.length - 1][1];
	ctx.lineTo(x, y);
	// xs.push(x);
	ctx.stroke();
	// return [Math.min(...xs), Math.max(...xs)];
}




function draw_letter(ctx, letter, pos, s, dots, pert) {
	let cmd = letter_dict(letter, s);
	// let ranges = [];
	for (let stroke of cmd) {
		// ranges.push()
		plot_point_path(ctx, get_points(bezier(stroke)), pos, pert);
		if (dots) {
			for (let point of stroke) {
				ctx.beginPath();
				ctx.arc(pos[0] + point[0], pos[1] + point[1], 2, 0, 2 * Math.PI);
				ctx.fill();
			}
		}
	}

	// let width = null; 
	// if (letter == " ") {
	// 	width = s/2;
	// } else {
	// 	width = Math.max(...ranges.map(x => x[1])) - Math.min(...ranges.map(x => x[0]));
	// }

	let width = get_width(letter, s);

	// ctx.strokeStyle="rgba(255, 0, 0, 0.3)";
	// ctx.beginPath();
	// ctx.moveTo(pos[0], pos[1]);
	// ctx.lineTo(pos[0] + width, pos[1]);
	// ctx.lineTo(pos[0] + width, pos[1] + s);
	// ctx.lineTo(pos[0], pos[1] + s);
	// ctx.lineTo(pos[0], pos[1]);
	// ctx.lineTo(pos[0], pos[1] + s/2);
	// ctx.lineTo(pos[0] + width, pos[1] + s/2);
	// ctx.stroke();
	// ctx.strokeStyle="black";

	return width;
}


function draw_textline(ctx, text, pos, s, spacing, dots, pert, just, margin) {
	// ctx.strokeStyle = 'rgba(0, 0, 255, 0.2)';
	// ctx.beginPath();
	// ctx.moveTo(pos[0], pos[1]);
	// ctx.lineTo(10000, pos[1]);
	// ctx.stroke();
	// ctx.beginPath();
	// ctx.moveTo(pos[0], pos[1] + s);
	// ctx.lineTo(10000, pos[1] + s);
	// ctx.stroke();

	ctx.strokeStyle = "black";
	let cursor = 0;
	if (just == "center") {
		cursor = (canvas.width - get_word_width(text, s, spacing)) / 2;
	} else if (just == "left") {
		cursor = margin;
	} else if (just == "right") {
		cursor = canvas.width - get_word_width(text, s, spacing) - margin;
	}
	for (let i = 0; i < text.length; i++) {
		let let_pos = [pos[0] + cursor, pos[1]]
		let width = draw_letter(ctx, text[i], let_pos, s, dots, pert);
		cursor += spacing + width;
	}
}
