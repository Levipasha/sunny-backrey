import React, { useState } from 'react';
import { initialInventory } from '../data';

const Inventory = ({ inventory, setInventory }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleValueChange = (id, field, value) => {
    const newInventory = inventory.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        newItem.total = newItem.openingStock + newItem.received;
        newItem.balance = newItem.total - newItem.consumed;
        newItem.currentStock = newItem.balance;
        return newItem;
      }
      return item;
    });
    setInventory(newInventory);
  };

  const prepareForNextDay = () => {
    if (window.confirm('Are you sure you want to prepare for the next day? This will set the current stock as the new opening stock and reset received/consumed values.')) {
      const nextDayInventory = inventory.map(item => {
        const newOpeningStock = item.currentStock;
        return {
          ...item,
          openingStock: newOpeningStock,
          received: 0,
          consumed: 0,
          total: newOpeningStock,
          balance: newOpeningStock,
          currentStock: newOpeningStock,
        };
      });
      setInventory(nextDayInventory);
    }
  };

  const resetData = () => {
    const calculatedInventory = initialInventory.map(item => ({
      ...item,
      total: item.openingStock + item.received,
      balance: item.openingStock + item.received - item.consumed,
      currentStock: item.openingStock + item.received - item.consumed,
    }));
    setInventory(calculatedInventory);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Inventory Management</h2>
        <div className="d-flex align-items-center">
          <input type="text" className="form-control w-auto me-3" placeholder="Search for an item..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <button className="btn btn-primary me-2" onClick={prepareForNextDay}>Prepare for Next Day</button>
          <button className="btn btn-danger" onClick={resetData}>Reset Data</button>
        </div>
      </div>
      
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Item Name</th>
            <th>Opening Stock</th>
            <th>Received</th>
            <th>Total</th>
            <th>Consumed</th>
            <th>Balance</th>
            <th>Current Stock</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {filteredInventory.map((item, index) => (
            <tr key={item.id} className={item.currentStock < 5 ? 'table-danger' : ''}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>{item.openingStock}</td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={item.received}
                  onChange={e => handleValueChange(item.id, 'received', parseFloat(e.target.value) || 0)}
                />
              </td>
              <td>{item.total}</td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={item.consumed}
                  onChange={e => handleValueChange(item.id, 'consumed', parseFloat(e.target.value) || 0)}
                />
              </td>
              <td>{item.balance}</td>
              <td>{item.currentStock}</td>
              <td>{item.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
