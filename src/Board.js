import './Board.css';

export default function Board({board, setBoard, style, draggable}) {

  const swap = (a, b) => {
    a = Number(a); b = Number(b);
    setBoard(board.map(val => val === a ? b : (val === b ? a : val)));
  }

  return (
    <div className='Board' style={style ?? {}}>{
      board.map((val, index) => <div key={index} draggable={draggable}
        onDragStart={e => {
          // e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.setData('text/plain', val);
          e.dataTransfer.dropEffect = 'move';
        }}
        onDragOver={e => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={e => {
          e.preventDefault();
          let data = e.dataTransfer.getData('text/plain');
          swap(e.target.innerText, data);
        }}
      >{val === 0 ? ' ' : val}</div>)
    }</div>
  )
}