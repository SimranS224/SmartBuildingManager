/* eslint-disable no-unused-expressions */
import React, { Component } from 'react';
import './App.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form'; 
import ResizableRect from 'react-resizable-rotatable-draggable'
// import Particles from "./particles";
import Typist from 'react-typist';
import Rectangle from './components/Recangle';
import TransformerComponent from './components/TransformerComponent';
import Fullpage, { FullPageSections, FullpageSection } from '@ap.cx/react-fullpage'
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import { ListGroup, ListGroupItem } from 'reactstrap';
import Buttonmui from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import Calendar from "./Calendar";


class ExampleModal extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      show: false,
    };
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }

  handleSubmit(event) {
    event.preventDefault();
    var form = event.target;
    if (!this.props.time){
      if (form.elements.room_name){
        var newRoomName = form.elements.room_name.value;
      }
      var newRoomTemperature = form.elements.room_temperature.value;

      // Add room to props
      if (!form.elements.room_name){
        this.props.handleFormSubmit(newRoomName, newRoomTemperature);

      } else {
        this.props.handleFormSubmit(this.props.previousName, newRoomTemperature);
      }
    } else {
      var timeOffset = form.elements.time_offset.value;
      console.log(timeOffset);
      this.props.handleFormSubmit(timeOffset);
    }

    this.setState({show: false});
  }

  render() {
    return (
      <>
        <Button variant="primary" onClick={this.handleShow}>
          {this.props.buttonText}
        </Button>
          <Modal show={this.state.show} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>{this.props.buttonText}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {!this.props.time && 
              <Form onSubmit={this.handleSubmit}>
                <Form.Group>
                  <Form.Label >Room name</Form.Label>
                  <Form.Control name="room_name" type="input"/>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Temperature</Form.Label>
                  <Form.Control name="room_temperature" type="input"/>
                </Form.Group>
                <Button variant="secondary" onClick={this.handleClose}>
                  Close
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
                </Form>
              }
              {this.props.time &&
                <Form onSubmit={this.handleSubmit}>
                  <Form.Group>
                    <Form.Label>Time offset (in minutes)</Form.Label>
                    <Form.Control name="time_offset" type="input"/>
                  </Form.Group>
                  <Button variant="secondary" onClick={this.handleClose}>
                  Close
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button> 
                </Form>
              }
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
          </Modal>
      </>
    );
  }
}

// const StyledButton = withStyles({
//   root: {
//     background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
//     borderRadius: 3,
//     border: 0,
//     color: 'white',
//     height: 48,
//     padding: '0 30px',
//     boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
//   },
//   label: {
//     textTransform: 'capitalize',
//   },
// })(Buttonmui);
const styles = {
  button: {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    borderRadius: 3,
    border: 0,
    color: 'white',
    height: 48,
    padding: '0 30px',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  },
  buttonBlue: {
    background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .30)',
  },
};

class App extends Component {
  constructor(props){
    super(props);
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.editFormSubmit = this.editFormSubmit.bind(this);
    this.updateColours = this.updateColours.bind(this);
    this.editTimeSubmit = this.editTimeSubmit.bind(this);

    this.state = {
      ...props,
      color: 'default',
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
        {
          x: 0,
          y: 150,
          width: 1030,
          height: 200,
          postion: [0, 200],
          temperature: 30,
          name: "diningHall"
        },
        {
          x: 500,
          y: 0,
          width: 530,
          height: 150,
          position: [0, 0],
          temperature: 17,
          name: "Washroom"
        }
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
      selectedShapeName: '',
      temp_colors: {
        10: ["#1400D6", "#00D4AA"],
        11: ["#1D00CD", "#00D4FF"],
        12: ["#2600C4", "#00FFF4"],
        13: ["#3000BB", "#00FFD0"],
        14: ["#3900B3", "#00FFD0"],
        15: ["#4300AA", "#00FFA8"],
        16: ["#4C00A1", "#00FFd0"],
        17: ["#550098", "#00FF5C"],
        18: ["#5F0090", "#00FF36"],
        19: ["#680087", "#00FF24"],
        20: ["#72007E", "#00FF10"],
        21: ["#7B0075", "#17FF00"],
        22: ["#84006D", "#3EFF00"],
        23: ["#8E0064", "#65FF00"],
        24: ["#97005B", "#8AFF00"],
        25: ["#A10052", "#B0FF00"],
        26: ["#AA004A", "#D7FF00"],
        27: ["#B30041", "#FDFF00"],
        28: ["#BD0038", "#FFFA00"],
        29: ["#C6002F", "#FFF800"],
        30: ["#D00127", "#FFF000"],
      },
      update: false,
      timeOffset: 0
    }

    // console.log(this.state.temp_colors);
    console.log(window.innerWidth);

    this.state.roomDimensions.map((room, i) => {
      this.state.roomDimensions[i] = {...room, fill: this.temperatureToGradient(room.temperature)}
    })
  }

  handleStageMouseDown = e => {
    // clicked on stage - cler selection
    if (e.target === e.target.getStage()) {
      this.setState({
        selectedShapeName: '',
        temperature: null
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
    if (rect) {
      this.setState({
        selectedShapeName: name,
        selectedShapeTemperature: rect.temperature
      });
    } else {
      this.setState({
        selectedShapeName: '',
        temperature: null
      });
    }
  };

  handleFormSubmit(newRoom, temperature){
    this.setState({
      roomDimensions: [...this.state.roomDimensions,
        {
          x: 0, 
          y: 100,
          width: 500,
          height: 50,
          position: [0, 100],
          temperature: temperature,
          name: newRoom
        }
      ]
    });

    setTimeout(() => {
      this.state.roomDimensions.map((room, i) => {
        this.state.roomDimensions[i] = {...room, fill: this.temperatureToGradient(room.temperature)}
      });
    }, 500);

    // this.setState({
    //   roomDimensions: [...this.state.roomDimensions]
    // });

  }
  
  temperatureToGradient(temperature){
      const map = this.state.temp_colors;
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
  

  manageBox = () => {
    this.setState({
      showModal: true,
    })
  }
  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }

  createListofColors(){
    console.log(this.state.temp_colors[0]);
    // console.log(Object.keys(all_temps));
    var arr = [];

    for (var key in this.state.temp_colors) {
      arr.push([key,this.state.temp_colors[key][0]]);
    }
    // console.log(arr);
    // let all_temps = Object.values(this.state.temp_colors).forEach(function (actual_key,value) {
    //   <li color="blue" key={actual_key}>{value}</li>
    //   console.log('key: ', value);  
    //   console.log('items: ', actual_key[0]);  
    //   // console.log("true value", this.state.temp_colors[value]);
    // });
    // console.log(all_temps);
    return arr;
  }

  editFormSubmit(roomName, temperature){
    this.setState({
      // roomDimensions: [...this.state.roomDimensions],
      update: !this.state.update,
    });

    setTimeout(() => {
      this.state.roomDimensions.map((room, i) => {
        if (room.name === this.state.selectedShapeName && roomName){
          this.state.roomDimensions[i] = {...room, fill: this.temperatureToGradient(temperature), temperature: temperature, name: roomName}
        } else if (room.name === this.state.selectedShapeName) {
          this.state.roomDimensions[i] = {...room, fill: this.temperatureToGradient(temperature), temperature: temperature}
        }
      });
    }, 500);

    this.setState({
      roomDimensions: [...this.state.roomDimensions]
    });

  }

  updateColours(responseData){
    var temperatures = [];
    console.log(Object.keys(responseData));
    for (var key in responseData){
      if (!responseData.hasOwnProperty(key)) continue;
      
      var obj = responseData[key];
      
      // your code
      var pos = parseInt(key, 10);

      var newList = [];
      this.state.roomDimensions.map((room) => {
        var newTemp = Math.floor(room.temperature + responseData[key].numberOfPeople * 0.5);
        if (newTemp < 10 || newTemp > 30){
          newTemp = 15;
        }

        newList.push({
          ...room,
          fill: this.temperatureToGradient(newTemp),
          temperature: newTemp
        })
      });

      console.log(newList);

      this.setState({
        roomDimensions: newList
      })

      // if (pos < this.state.roomDimensions.length - 1){
      //   // console.log(pos);
      //   console.log(this.state.roomDimensions[pos]);
      //   if (this.state.roomDimensions[pos]){
      //     setTimeout(() => {
      //       this.state.roomDimensions[pos] = {...this.state.roomDimensions[pos], fill: this.temperatureToGradient(Math.floor(this.state.roomDimensions[pos].temperature + responseData[key].numberOfPeople / 2)), temperature: Math.floor(this.state.roomDimensions[pos].temperature + responseData[key].numberOfPeople / 2)}
      //       console.log(responseData[key]);
      //       // this.state.roomDimensions[pos] = {...this.state.roomDimensions[pos], fill: this.temperatureToGradient(responseData[key]), temperature: responseData[key]}
      //     }, 100)
      // }
      // for (var prop in obj) {
      //   // skip loop if the property is from prototype
      //   if(!obj.hasOwnProperty(prop)) continue;

      //   // your code
      //   var pos = parseInt(key, 10);
      //   // console.log(pos);
      //   // console.log(this.state.roomDimensions[pos]);
      //   if (this.state.roomDimensions[pos]){
      //     setTimeout(() => {
      //       this.state.roomDimensions[pos] = {...this.state.roomDimensions[pos], fill: this.temperatureToGradient(Math.floor(this.state.roomDimensions[pos].temperature + responseData[key].numberOfPeople / 2)), temperature: Math.floor(this.state.roomDimensions[pos].temperature + responseData[key].numberOfPeople / 2)}
      //       console.log(responseData[key]);
      //       // this.state.roomDimensions[pos] = {...this.state.roomDimensions[pos], fill: this.temperatureToGradient(responseData[key]), temperature: responseData[key]}
      //     }, 100)
      //   }
      }
    }

    // this.setState({update: !this.state.update});
  // }
  

  updateTemperature = () => {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    var hour = date.getHours();
    var minute = date.getMinutes() + this.state.timeOffset;
    var seconds = date.getSeconds();

    if (minute > 59 || minute < 0){
      minute = 30;
    }

    // console.log(year);
    // console.log(month);
    // console.log(day);
    // console.log(hour);
    // console.log(minute);
    // console.log(seconds);

    axios.get(`https://tsflo-242417.appspot.com/predict/getPopulation/${this.year}-${this.month}-${this.day}%20${this.hour}:${this.minute}:${this.second}`)
      .then(response => {
        this.updateColours(response.data);
        console.log(response);
      }).catch(error => {
        console.log(error);
      })
  }

  editTimeSubmit = (newTimeOffset) => {
    console.log(newTimeOffset);

    this.setState({
      timeOffset: newTimeOffset
    });
  }

  render(){
    const {all_temps} = this.state;  // Essentially does: const vals = this.state.vals;
    console.log(this.state.roomDimensions);

    return (
      
      <div className="App">
        <header className="App-header">
        <Fullpage>

          <FullPageSections>

            <FullpageSection style={{
                backgroundColor: '#8bcef8',
                height: '40vh',
                padding: '1em',
              }}>
              
              <Typist>
              <Typist.Delay ms={1000} />
                  <hr></hr>
                  <h1 className="desc" fontSize="1000">Pi-sensor</h1>
                  <h1 className="desc" fontSize="1000">A machine learning solution for energy consumption in large buildings. </h1>
              </Typist>
            
            </FullpageSection>
            <FullpageSection style={{
                backgroundColor: '#002233',
                height: '100vh',
                padding: '1em',
              }}>
            <p style={{color: 'white'}}>Room - {this.state.selectedShapeName} | Temperature - {this.state.selectedShapeTemperature} | Future Temperature - </p>
            
            <div style={{display: 'flex', flexDirection: "row"}}>
              <div className="rectangle-stage" backgroundColor="white">
              <Stage
              style={{backgroundColor:"#white"}}
              width={window.innerWidth * 0.7}
              height={window.innerHeight * 0.4}
              onMouseDown={this.handleStageMouseDown}
            >
              
            <Layer>
              {this.state.roomDimensions.map((rect, i) => (
                <Rectangle key={i} {...rect} />
              ))}
              <TransformerComponent
                selectedShapeName={this.state.selectedShapeName}
              />
            </Layer>
            {/* {`${item}`} */}
            </Stage>
               
                {/* <p style={{color: 'black'}}>Hello world</p> */}
                <div style={{height: "40vh", width: "40vw"}}>
                    <h6 style={{width:"15vw"}}> Temperature scale</h6>
                    <ul>
                      {this.createListofColors().map(item => (
                      //   <Button backgroundColor={`#${item}`}
                      //   >
                      //   {'dynamic inline-style'}
                      // </Button>
                        // <StyledButton style={{color:item}}> </StyledButton>
                        <div style={{backgroundColor: `${item[1]}`, width:"20vw"}}>
                        <ul style={{color: "white", fontSize: "18px", backgroundColor: `${item[1]}`, width:"0vw"}} key={item}> {item[0]}</ul>
                        </div>
                      ))}
                    </ul>
                </div>
              </div>
              <div className="legend-box">
              </div>
            </div>

            <ExampleModal handleFormSubmit={this.handleFormSubmit} buttonText="Create a Room" previousName={this.state.selectedShapeName}/>
            {this.state.selectedShapeName && 
              <ExampleModal handleFormSubmit={this.editFormSubmit} buttonText="Edit Room" previousName={this.state.selectedShapeName}/>
            }
            <ExampleModal handleFormSubmit={this.editTimeSubmit} buttonText="Change time offset" previousName={this.state.selectedShapeName} time/>
            <Button onClick={this.updateTemperature}>Update Temperature</Button>

            </FullpageSection>
            <FullpageSection style={{
                height: '50vh',
                backgroundColor: '#8bcef8',
                padding: '1em',
              }}>
                <h1>Schedule</h1>
                <main>
              <Calendar />
            </main>
             {/* {console.log(this.createListofColors())}; */}
              
                
            </FullpageSection>

          </FullPageSections>

        </Fullpage>
        
         
          {/* <canvas ref="canvas" width={640} height={425} style={{border: "1px solid #d3d3d3"}}></canvas> */}
         
          {/* <Typist>
          <Typist.Delay ms={1000} />
              <hr></hr>
              <h1 className="desc" fontSize="1000">Pi-sensor</h1>
          </Typist> 
          <p>Room - {this.state.selectedShapeName}</p>
          {/* <canvas ref="canvas" width={640} height={425} style={{border: "1px solid #d3d3d3"}}></canvas> */}
            {/* <div className="rectangle-stage">
              <Stage
                width={window.innerWidth * 0.7}
                height={window.innerHeight * 0.6}
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
              </Stage> */}
            {/* </div>  */}
          {/* <Button onClick={this.manageBox}>Create Room </Button> */}
          </header>
        </div>
    );
  }
}

export default App;
