import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Inventory from './components/Inventory';
import Orders from './components/Orders';
import Records from './components/Records';
import { initialInventory } from './data';
import './App.css';

function App() {
  const [inventory, setInventory] = useState([]);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const storedInventory = JSON.parse(localStorage.getItem('inventory'));
    if (storedInventory && storedInventory.length > 0) {
      setInventory(storedInventory);
    } else {
      const calculatedInventory = initialInventory.map(item => ({
        ...item,
        total: item.openingStock + item.received,
        balance: item.openingStock + item.received - item.consumed,
        currentStock: item.openingStock + item.received - item.consumed,
      }));
      setInventory(calculatedInventory);
    }

    const storedRecords = JSON.parse(localStorage.getItem('records')) || [];
    setRecords(storedRecords);
  }, []);

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('records', JSON.stringify(records));
  }, [records]);

  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Inventory inventory={inventory} setInventory={setInventory} />} />
          <Route path="/orders" element={<Orders inventory={inventory} setInventory={setInventory} records={records} setRecords={setRecords} />} />
          <Route path="/records" element={<Records records={records} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
