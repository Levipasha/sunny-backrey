import React, { useState } from 'react';
import { recipes } from '../recipes';

const Orders = ({ inventory, setInventory, records, setRecords }) => {
  const [orderItems, setOrderItems] = useState([{ id: 1, name: '', quantity: 0 }]);
  const [batchNumber, setBatchNumber] = useState('');

  const availableItems = [...Object.keys(recipes), ...inventory.map(item => item.name)];

  const handleAddItem = () => {
    setOrderItems([...orderItems, { id: Date.now(), name: '', quantity: 0 }]);
  };

  const handleItemChange = (id, field, value) => {
    const newOrderItems = orderItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setOrderItems(newOrderItems);
  };

  const handleRemoveItem = id => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const placeOrder = () => {
    let newInventory = [...inventory];
    const lowStockAlerts = [];
    const deductionSummary = [];
    const orderRecord = {
      orderId: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      batchNumber,
      items: [],
    };

    orderItems.forEach(orderItem => {
      if (!orderItem.name || orderItem.quantity <= 0) return;

      const recipe = recipes[orderItem.name];
      if (recipe) {
        // It's a finished product with a recipe
        const consumedIngredients = [];
        let recipeSummary = `For ${orderItem.quantity} ${recipes[orderItem.name]?.unit || ''} of ${orderItem.name}, deducted:\n`;

        recipe.ingredients.forEach(ingredient => {
          const inventoryItemIndex = newInventory.findIndex(invItem => invItem.name === ingredient.name);
          if (inventoryItemIndex !== -1) {
            const requiredQuantity = ingredient.quantity * orderItem.quantity;
            consumedIngredients.push({ name: ingredient.name, quantity: requiredQuantity });
            recipeSummary += `  - ${ingredient.name}: ${requiredQuantity.toFixed(3)}\n`;
            newInventory[inventoryItemIndex].consumed += requiredQuantity;
            const item = newInventory[inventoryItemIndex];
            item.balance = item.total - item.consumed;
            item.currentStock = item.balance;
            if (item.currentStock < 5) {
              lowStockAlerts.push(`${item.name} is low in stock!`);
            }
          }
        });
        deductionSummary.push(recipeSummary);
        orderRecord.items.push({ 
          name: orderItem.name, 
          quantity: orderItem.quantity, 
          isRecipe: true,
          consumed: consumedIngredients
        });
      } else {
        // It's a raw material
        orderRecord.items.push({ name: orderItem.name, quantity: orderItem.quantity, isRecipe: false });
        const inventoryItemIndex = newInventory.findIndex(invItem => invItem.name === orderItem.name);
        if (inventoryItemIndex !== -1) {
          newInventory[inventoryItemIndex].consumed += orderItem.quantity;
          const item = newInventory[inventoryItemIndex];
          item.balance = item.total - item.consumed;
          item.currentStock = item.balance;
          deductionSummary.push(`Deducted ${orderItem.quantity} of ${orderItem.name}.`);
          if (item.currentStock < 5) {
            lowStockAlerts.push(`${item.name} is low in stock!`);
          }
        }
      }
    });

    setInventory(newInventory);

    const newRecords = [...records, orderRecord];
    setRecords(newRecords);

    let alertMessage = `Order Placed!\n\nStock Deduction Summary:\n${deductionSummary.join('\n')}`;
    if (lowStockAlerts.length > 0) {
      alertMessage += `\n\nLow Stock Warnings:\n${lowStockAlerts.join('\n')}`;
    }
    alert(alertMessage);

    // Reset form
    setBatchNumber('');
    setOrderItems([{ id: 1, name: '', quantity: 0 }]);
  };

  return (
    <div>
      <h2>Order Management</h2>
      <div className="card mb-4">
        <div className="card-header">Create New Batch Order</div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Batch Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter batch number (e.g., BATCH-001)"
              value={batchNumber}
              onChange={e => setBatchNumber(e.target.value)}
            />
          </div>
          <h5>Order Items</h5>
          {orderItems.map((item, index) => (
            <div key={item.id} className="row mb-2 align-items-center">
              <div className="col-md-6">
                <select
                  className="form-select"
                  value={item.name}
                  onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                >
                  <option value="">Select Item...</option>
                  {availableItems.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-md-3">
                <button className="btn btn-danger" onClick={() => handleRemoveItem(item.id)}>Remove</button>
              </div>
            </div>
          ))}
          <button className="btn btn-primary me-2" onClick={handleAddItem}>+ Add Item</button>
          <button className="btn btn-success" onClick={placeOrder}>Place Order</button>
        </div>
      </div>

      <h3>Current Stock Levels</h3>
      <div className="row">
        {inventory.map(item => (
          <div key={item.id} className="col-md-3 mb-3">
            <div className={`card ${item.currentStock < 5 ? 'border-danger' : ''}`}>
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className={`card-text ${item.currentStock < 5 ? 'text-danger' : ''}`}>
                  Stock: {item.currentStock.toFixed(2)} {item.unit}
                  {item.currentStock < 5 && <span> - Low</span>}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
