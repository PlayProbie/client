import './App.css';

import { useState } from 'react';

import logo from '/logo.png';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="/">
          <img
            src={logo}
            className="logo"
            alt="PlayProbie logo"
          />
        </a>
      </div>
      <h1>PlayProbie</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the logo to learn more</p>
    </>
  );
}

export default App;
