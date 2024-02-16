import React from "react";
import './index.css'
import './App.css'
import SearchComponent from "./ui/SearchComponent";

const App: React.FC = () => {
  return (
    <div className={'app-wrapper'}>
      <SearchComponent/>
    </div>
  );
}

export default App;
