import './App.css';
import Excel_datas from './components/Excel_datas';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Tableview from './components/Tableview';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Excel_datas />} />
          <Route path="/tableview/:tableName" element={<Tableview />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
