/* eslint-disable no-unused-expressions */
import React, { Component } from 'react';
import './App.css';
import ResizableRect from 'react-resizable-rotatable-draggable'
// import Particles from "./particles";
import Typist from 'react-typist';
import { Stage, Layer, Rect, Transformer } from 'react-konva';


class Rectangle extends React.Component {
  render() {
    return (
      <Rect
        x={this.props.x}
        y={this.props.y}
        width={this.props.width}
        height={this.props.height}
        fill={this.props.fill}
        name={this.props.name}
        draggable
      />
    );
  }
}

class TransformerComponent extends React.Component {
  componentDidMount() {
    this.checkNode();
  }
  componentDidUpdate() {
    this.checkNode();
  }
  checkNode() {
    // here we need to manually attach or detach Transformer node
    const stage = this.transformer.getStage();
    const { selectedShapeName } = this.props;

    const selectedNode = stage.findOne('.' + selectedShapeName);
    // do nothing if selected node is already attached
    if (selectedNode === this.transformer.node()) {
      return;
    }

    if (selectedNode) {
      // attach to another node
      this.transformer.attachTo(selectedNode);
    } else {
      // remove transformer
      this.transformer.detach();
    }
    this.transformer.getLayer().batchDraw();
  }
  render() {
    return (
      <Transformer
        ref={node => {
          this.transformer = node;
        }}
      />
    );
  }
}


class RoomManager extends Component {
  constructor(props){
    super(props);
    
    this.state = {
      ...props,
      roomDimensions: [
        // Room 1
        {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          position: [0, 0],
          temperature: 23,
          name: "MeetingRoom"
        },
        // Room 2
        {
          x: 100,
          y: 0,
          width: 100,
          height: 100,
          position: [100, 0],
          temperature: 10,
          name: "OfficeSpace"
        },
        // Hallway between the rooms
        {
          x: 0, 
          y: 100,
          width: 500,
          height: 50,
          position: [0, 100],
          temperature: 25,
          name: "hallway1"
        },
      ],
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
    }

    console.log(window.innerWidth);

    this.state.roomDimensions.map((room, i) => {
      this.state.roomDimensions[i] = {...room, fill: this.temperatureToGradient(room.temperature)[0]}
    })
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
    const rect = this.state.roomDimensions.find(r => r.name === name);
    console.log(rect);
    console.log(name);
    console.log(this.state);
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

  
  temperatureToGradient(temperature){
      const map = {
        10: ["#00D4FF", "#00D4AA"],
        11: ["#00E4FF", "#00D4FF"],
        12: ["#00FFF4", "#00FFF4"],
        13: ["#00FFD0", "#00FFD0"],
        14: ["#00FFA8", "#00FFD0"],
        15: ["#00FFD0", "#00FFA8"],
        16: ["#00FF5C", "#00FFd0"],
        17: ["#00FF36", "#00FF5C"],
        18: ["#00FF24", "#00FF36"],
        19: ["#00FF10", "#00FF24"],
        20: ["#17FF00", "#00FF10"],
        21: ["#3EFF00", "#17FF00"],
        22: ["#65FF00", "#3EFF00"],
        23: ["#8AFF00", "#65FF00"],
        24: ["#B0FF00", "#8AFF00"],
        25: ["#D7FF00", "#B0FF00"],
        26: ["#FDFF00", "#D7FF00"],
        27: ["#FFFA00", "#FDFF00"],
        28: ["#FFF800", "#FFFA00"],
        29: ["#FFF000", "#FFF800"],
        30: ["#FFE600", "#FFF000"],
      }

      return map[temperature][0];
  }

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
          <p>Room - {this.state.selectedShapeName}</p>
          {/* <canvas ref="canvas" width={640} height={425} style={{border: "1px solid #d3d3d3"}}></canvas> */}
          <div style={{overflow: 'auto'}}>
            <Stage
              width={window.innerWidth}
              height={window.innerHeight}
              onMouseDown={this.handleStageMouseDown}
            >
              <Layer>
                {this.state.roomDimensions.map((rect, i) => (
                  <Rectangle key={i} {...{...rect, fill: this.temperatureToGradient(rect.temperature)}} />
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

export default RoomManager;
