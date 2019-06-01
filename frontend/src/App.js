import React, { Component } from 'react';
import Treemap from 'react-vis/dist/treemap';
import ShowcaseButton from './ShowcaseButton';
import logo from './logo.svg';
import './App.css';

function _getRandomData(total) {
  const totalLeaves = total || Math.random() * 20;
  const leaves = [];
  for (let i = 0; i < totalLeaves; i++) {
    leaves.push({
      name: total ? total : String(Math.random()).slice(0, 3),
      size: Math.random() * 1000,
      color: Math.random(),
      style: {
        border: 'thin solid red'
      }
    });
  }
  return {
    title: '',
    color: 1,
    children: leaves
  };
}

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      ...props,
      roomDimensions: [
        // Room 1
        {
          width: 100,
          height: 100,
          position: [0, 0],
          temperature: 23
        },
        // Room 2
        {
          width: 100,
          height: 100,
          position: [100, 0],
          temperature: 10
        },
        // Hallway between the rooms
        {
          width: 500,
          height: 50,
          position: [0, 100],
          temperature: 25
        },
      ]
    }
  }

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

      return map[temperature];
  }

  componentDidMount() {
    const canvas = this.refs.canvas
    const ctx = canvas.getContext("2d");

    this.state.roomDimensions.map((room, id) => {
      var grd = ctx.createRadialGradient(room.position[0], room.position[1], Math.min(room.width, room.height) * 0.5, room.position[0], room.position[1], Math.min(room.width, room.height));
      grd.addColorStop(0, this.temperatureToGradient(room.temperature)[0]);
      grd.addColorStop(1, this.temperatureToGradient(room.temperature)[1]);

      ctx.fillStyle = grd;

      // console.log(room.temperature);
      // ctx.fillStyle = this.temperatureToGradient(room.temperature)
      ctx.fillRect(room.position[0], room.position[1], room.width, room.height);
    });
  }

  render(){
    return (
      <div className="App">
        <header className="App-header">
          <h1>Pi-Sensor</h1>
          <canvas ref="canvas" width={640} height={425} style={{border: "1px solid #d3d3d3"}}></canvas>
          <DynamicTreemapExample></DynamicTreemapExample>
          {/* <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a> */}
        </header>
      </div>
    );
  }
}

class DynamicTreemapExample extends React.Component {
  state = {
    hoveredNode: false,
    treemapData: _getRandomData(20),
    useCirclePacking: false
  };

  render() {
    const {hoveredNode, useCirclePacking} = this.state;
    const treeProps = {
      animation: {
        damping: 9,
        stiffness: 300
      },
      data: this.state.treemapData,
      onLeafMouseOver: x => this.setState({hoveredNode: x}),
      onLeafMouseOut: () => this.setState({hoveredNode: false}),
      onLeafClick: () => this.setState({treemapData: _getRandomData()}),
      height: 300,
      mode: this.state.useCirclePacking ? 'circlePack' : 'squarify',
      getLabel: x => x.name,
      width: 350
    };
    return (
      <div className="dynamic-treemap-example">
        <ShowcaseButton
          onClick={() => this.setState({useCirclePacking: !useCirclePacking})}
          buttonContent={'TOGGLE CIRCLE PACK'}
        />
        <Treemap {...treeProps} />
        click above to the update data
        {hoveredNode && hoveredNode.value}
      </div>
    );
  }
}

export default App;
