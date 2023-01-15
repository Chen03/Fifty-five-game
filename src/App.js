import { startTransition, useEffect, useState } from 'react';
import './App.css';
import Board from './Board';
import arrow from './arrow.svg';

function testAvali(stat) {
  let used = Array.from({length: 16}, (e, i) => false), ans = 0;
  let zy = 0;
  for (let i = 0; i < 4; ++i) {
    for (let j = 0; j < 4; ++j) {
      let t = i * 4 + j;
      if (stat[t] === 0) {
        zy = i;
        continue;
      }
      used[stat[t]] = true;
      for (let k = 16; k !== stat[t]; --k) {
        if (used[k])  ++ans;
      }
    }
  }

  console.log(ans);
  return (ans % 2) === (zy % 2);
}

function App() {
  const [board, setBoard] = useState(Array.from({length: 16}, (e, i) => i));
  const [target, setTarget] = useState(Array.from({length: 16}, (e, i) => i));

  const [step, setStep] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const [started, setStarted] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [stopTime, setStopTime] = useState(null);

  const [dist, setDist] = useState(0);

  const avali = testAvali(board);

  const durTime = started ? (
    stopTime ? stopTime : (((new Date()).getTime() - startTime) / 1000).toFixed(2)
  ) : "0.00";
  
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    if (!worker) {
      var worker = new Worker(new URL('./calc.worker.js', import.meta.url));
      worker.onmessage = (ev) => {
        switch(ev.data.type) {
          case 'stat':
            console.log(ev.data.stat, Math.random());
            startTransition(
              () => {
                setBoard(ev.data.stat);
                setStep(ev.data.step);
              });
            break;
          case 'stop':
            setStopped(true);
            setDist(ev.data.dist);
            break;
        }
      }
      setWorker(worker);
    }
  }, []);

  useEffect(() => {
    if (stopped) setStopTime((((new Date()).getTime() - startTime) / 1000).toFixed(2));
  }, [stopped]);

  return (
    <div className="App">
      <section className='container'>
        <Board board={board} setBoard={setBoard} draggable={true}/>
        <img style={{width: started ? 0 : '300px', opacity: started ? '0%' : '100%'}}
          className='arrow' onClick={() => {
              if (!avali) return;
              setStarted(true);
              setStartTime((new Date()).getTime());
              worker.postMessage({type: 'start',
                orig: board,
                dest: target
              });
            }} src={arrow} />
        <Board style={{width: started ? 0 : '300px', opacity: started ? 0 : 1}}
          board={target} setBoard={setTarget} draggable={false}/>
      </section>
      <footer>
        <div className='counter'>
          <span className='time'>{durTime}s</span>
          /
          <span className='step'>{step} step(s)</span>
        </div>
        <div className='info' style={{
          opacity: started && !stopped ? 0 : 1,
          color: avali ? 'black' : 'red'
          }}>{stopped ? '最优操作次数：' + dist : (
            avali ? '拖拽以改变顺序。点击箭头开始。' : '数据不合法。'
          )}</div>
      </footer>
    </div>
  );
}

export default App;
