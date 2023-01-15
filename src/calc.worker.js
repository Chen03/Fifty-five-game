import { HashSet } from 'js-sdsl';
import { MinHeap } from 'mnemonist';

const row = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3],
  col = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3];

// 估价函数
function dist(stat) {
  let ans = 0;
  for (let i = 0; i < 4; ++i) {
    for (let j = 0; j < 4; ++j) {
      if (stat[i*4 + j] !== i * 4 + j) ++ans;
      // ans += Math.abs(i - row[stat[i * 4 + j]]) + Math.abs(j - col[stat[i * 4 + j]]);
    }
  }
  return ans;
}

// 状态类
function sta(_step, _stat) {
  this.step = _step ? _step : 0;
  this.stat = _stat ? _stat : Array.from({length: 16}, (e, i) => i);
  this.calc = function() {
    return dist(this.stat);
  }
}

function equal(arr1, arr2) {
  return arr1.toString() === arr2.toString();
}

let dest = Array.from({length: 16}, (e, i) => i + 1);
dest[15] = 0;
let now = new sta();

//小根堆
let queue = new MinHeap((a, b) => a.step + a.calc() - b.step - b.calc());
let hashSet = new HashSet();

// 交换格子
function swap(stat, p1, p2) {
  let ans = Array.from(stat);
  ans[p1] ^= ans[p2];
  ans[p2] ^= ans[p1];
  ans[p1] ^= ans[p2];

  return ans;
}

// --- Calculation --- //
// 核心算法过程
let lim = 0;
let hasStopped = true;
function calculate() {
  console.log('calculate');
  while (queue.size !== 0 && !equal(dest, queue.peek().stat)) {
    now = queue.pop();
    if (!hashSet.find(now.stat.toString()).equals(hashSet.end()))  continue;
    else hashSet.insert(now.stat.toString());
    ++lim;

    console.log(now.step, now.calc(), now.stat.toString());
    if (lim % 23 === 0) {
      postMessage({type: 'stat', stat: now.stat, step: lim})
    }

    let zero = 0;
    for (; zero < 16; ++zero) {
      if (now.stat[zero] === 0)  break;
    }
    let zy = Math.floor(zero / 4), zx = zero % 4;

    if (zy !== 0) queue.push(new sta(now.step + 1, swap(now.stat, zero, zero - 4)));
    if (zy !== 3) queue.push(new sta(now.step + 1, swap(now.stat, zero, zero + 4)));
    if (zx !== 0) queue.push(new sta(now.step + 1, swap(now.stat, zero, zero - 1)));
    if (zx !== 3) queue.push(new sta(now.step + 1, swap(now.stat, zero, zero + 1)));
  }

  hasStopped = true;
  postMessage({type: 'stop', time: ((new Date).getTime())});
  postMessage({type: 'stat', stat: dest, step: lim});
}

// --- Messages --- //
// 以下为与网页交互内容
onmessage = (ev) => {
  switch (ev.data.type) {
    case 'start':
      queue.push(new sta(0, ev.data.orig));
      dest = ev.data.dest;
      hasStopped = false;
      startMessage();
      calculate();
      break;
  }
}
