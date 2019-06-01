import React, { Component } from 'react';
import './App.css';
import ResizableRect from 'react-resizable-rotatable-draggable'
// import Particles from "./particles";
import Typist from 'react-typist';
import { Stage, Layer} from 'react-konva';
import Rectangle from './components/Recangle';
import TransformerComponent from './components/TransformerComponent';


class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      rectangles: [
        {
          x: 10,
          y: 10,
          width: 100,
          height: 100,
          fill: 'red',
          name: 'rect1'
        },
        {
          x: 150,
          y: 150,
          width: 100,
          height: 100,
          fill: 'green',
          name: 'rect2'
        }
      ],
      selectedShapeName: ''
    };
    // this.state = {
    //   ...props,
    //   roomDimensions: [
    //     // Room 1
    //     {
    //       width: 100,
    //       height: 100,
    //       position: [0, 0],
    //       temperature: 23
    //     },
    //     // Room 2
    //     {
    //       width: 100,
    //       height: 100,
    //       position: [100, 0],
    //       temperature: 10
    //     },
    //     // Hallway between the rooms
    //     {
    //       width: 500,
    //       height: 50,
    //       position: [0, 100],
    //       temperature: 25
    //     },
    //   ]
    // }
  }
  
  handleStageMouseDown = e => {
    // clicked on stage - cler selection
    if (e.target === e.target.getStage()) {
      this.setState({
        selectedShapeName: ''
      });
      return;
    }
    // clicked on transformer - do nothing
    const clickedOnTransformer =
      e.target.getParent().className === 'Transformer';
    if (clickedOnTransformer) {
      return;
    }

    // find clicked rect by its name
    const name = e.target.name();
    const rect = this.state.rectangles.find(r => r.name === name);
    if (rect) {
      this.setState({
        selectedShapeName: name
      });
    } else {
      this.setState({
        selectedShapeName: ''
      });
    }
  };
  // temperatureToGradient(temperature){
  //     const map = {
  //       10: ["#00D4FF", "#00D4AA"],
  //       11: ["#00E4FF", "#00D4FF"],
  //       12: ["#00FFF4", "#00FFF4"],
  //       13: ["#00FFD0", "#00FFD0"],
  //       14: ["#00FFA8", "#00FFD0"],
  //       15: ["#00FFD0", "#00FFA8"],
  //       16: ["#00FF5C", "#00FFd0"],
  //       17: ["#00FF36", "#00FF5C"],
  //       18: ["#00FF24", "#00FF36"],
  //       19: ["#00FF10", "#00FF24"],
  //       20: ["#17FF00", "#00FF10"],
  //       21: ["#3EFF00", "#17FF00"],
  //       22: ["#65FF00", "#3EFF00"],
  //       23: ["#8AFF00", "#65FF00"],
  //       24: ["#B0FF00", "#8AFF00"],
  //       25: ["#D7FF00", "#B0FF00"],
  //       26: ["#FDFF00", "#D7FF00"],
  //       27: ["#FFFA00", "#FDFF00"],
  //       28: ["#FFF800", "#FFFA00"],
  //       29: ["#FFF000", "#FFF800"],
  //       30: ["#FFE600", "#FFF000"],
  //     }

  //     return map[temperature];
  // }

  componentDidMount() {
    const canvas = this.refs.canvas
    // const ctx = canvas.getContext("2d");

    // this.state.roomDimensions.map((room, id) => {
    //   var grd = ctx.createRadialGradient(room.position[0], room.position[1], Math.min(room.width, room.height) * 0.5, room.position[0], room.position[1], Math.min(room.width, room.height));
    //   grd.addColorStop(0, this.temperatureToGradient(room.temperature)[0]);
    //   grd.addColorStop(1, this.temperatureToGradient(room.temperature)[1]);

    //   ctx.fillStyle = grd;

    //   // console.log(room.temperature);
    //   // ctx.fillStyle = this.temperatureToGradient(room.temperature)
    //   ctx.fillRect(room.position[0], room.position[1], room.width, room.height);
    // });
  }



  render(){

    return (
      <div className="App">
        <header className="App-header">
        
        <Typist>
        <Typist.Delay ms={1000} />
            <hr></hr>
            <h1 className="desc" fontSize="1000">Pi-sensor</h1>
        </Typist> 
          {/* <canvas ref="canvas" width={640} height={425} style={{border: "1px solid #d3d3d3"}}></canvas> */}
          <div>
          <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={this.handleStageMouseDown}
      >
        <Layer>
          {this.state.rectangles.map((rect, i) => (
            <Rectangle key={i} {...rect} />
          ))}
          <TransformerComponent
            selectedShapeName={this.state.selectedShapeName}
          />
        </Layer>
      </Stage>
         
          </div>
        </header>
      </div>
    );
  }
}

export default App;
