import { startTransition, useEffect, useState } from 'react';
import './App.css';
import Board from './Board';
import arrow from './arrow.svg';

function App() {
  const [board, setBoard] = useState(Array.from({length: 16}, (e, i) => i));
  const [target, setTarget] = useState(Array.from({length: 16}, (e, i) => i));

  const [step, setStep] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const [started, setStarted] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [stopTime, setStopTime] = useState(null);

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
        <Board board={board} setBoard={setBoard} />
        <img style={{width: started ? 0 : '300px', opacity: started ? '0%' : '100%'}}
          className='arrow' onClick={() => {
              setStarted(true);
              setStartTime((new Date()).getTime());
              worker.postMessage({type: 'start',
                orig: board,
                dest: target
              });
            }} src={arrow} />
        <Board style={{width: started ? 0 : '300px', opacity: started ? 0 : 1}}
          board={target} setBoard={setTarget} />
      </section>
      <footer>
        <div className='counter'>
          <span className='time'>{durTime}s</span>
          /
          <span className='step'>{step} step(s)</span>
        </div>
        <div className='info' style={{opacity: started ? 0 : 1}}>拖拽以改变顺序。点击箭头开始。</div>
      </footer>
    </div>
  );
}

export default App;
