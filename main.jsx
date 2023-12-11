// import './style.css'
// import './src/sand.jpg'
// import '@assets/styles/tailwind.css';

import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import sand from './src/sand.jpg';

import 'tailwindcss/tailwind.css';

const localStorageSetAsync = async (key, value) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({[key]: value}, () => {
      resolve();
    });
  });
};

const localStorageGetAsync = async (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
};

class App extends React.Component {
  state = {count: 0, sourceImg: sand, img: sand, checked: false};

  incrementCount = () => {
    this.setState({count: this.state.count + 1});
  };
  checkboxChange = async () => {
    let nextValue = !this.state.checked;
    this.setState({checked: nextValue});
    await localStorageSetAsync('lcm', nextValue);
  }

  async componentDidMount() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (state.checked) {
        this.setState({img: request.imageURL, sourceImg: request.sourceImageURL});
      } else {
        this.setState({img: null, sourceImg: request.sourceImageURL});
      }
    });
    this.setState({checked: await localStorageGetAsync('lcm')});
  }

  render() {
    return (
      <div className="overflow-hidden">
        <header className="mt-6 mb-6">
          <h1 className="text-4xl font-bold">render pipe</h1>
          <h2 className="text-xl">
            anything to anything anywhere to anywhere
          </h2>
        </header>
        <div className="rounded-xl overflow-hidden h-full
        grid grid-cols-3 grid-flow-col gap-4 bg-initial
        
        ">
          <div
            className="  flex-grow overflow-hidden aspect-square flex justify-center items-center bg-gray-200 h-full">
            <img src={this.state.sourceImg} alt="Sand" className="object-scale-down "/>
            {/* <button onClick={this.incrementCount}>Count: {this.state.count}</button> */}
          </div>
          {/* // Checkbox */}
          <div className="overflow-hidden flex-shrink flex justify-center items-center bg-gray-200 h-full">
            {/* Controls */}
            <div className="flex flex-col items-center justify-center space-y-2">

              <div className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-gray-600" checked={this.state.checked}
                       onChange={this.checkboxChange}/>
                <span className="ml-2 text-gray text-lg">LCM i2i</span>
              </div>
              <div className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-gray-600" onChange={this.checkboxChange}/>
                <span className="ml-2 text-gray text-lg">Mirror</span>
              </div>
              <div className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-gray-600" onChange={this.checkboxChange}/>
                <span className="ml-2 text-gray text-lg">Invert</span>
              </div>

            </div>
          </div>

          <div className=" flex-grow overflow-hidden aspect-square flex justify-center items-center bg-gray-200 h-full">
            {this.state.img ? <img src={this.state.img} alt="Sand" className="object-scale-down"/> :
              <div className="text-3xl text-gray-400">no output</div>}
          </div>

        </div>
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('app'));
