import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const Records = ({ records }) => {
  const [selectedMonth, setSelectedMonth] = useState('All');

  const availableMonths = ['All', ...Array.from(new Set(records.map(r => new Date(r.date).toLocaleString('default', { month: 'long', year: 'numeric' }))))];

  const filteredRecords = records.filter(record => {
    if (selectedMonth === 'All') return true;
    const recordMonth = new Date(record.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    return recordMonth === selectedMonth;
  });

  const monthlySummary = filteredRecords.reduce((summary, record) => {
    record.items.forEach(item => {
      if (item.isRecipe && item.consumed) {
        item.consumed.forEach(consumedItem => {
          const existing = summary.find(s => s.name === consumedItem.name);
          if (existing) {
            existing.quantity += consumedItem.quantity;
          } else {
            summary.push({ name: consumedItem.name, quantity: consumedItem.quantity });
          }
        });
      } else if (!item.isRecipe) {
        const existing = summary.find(s => s.name === item.name);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          summary.push({ name: item.name, quantity: item.quantity });
        }
      }
    });
    return summary;
  }, []);

  const exportToExcel = () => {
    const worksheetData = filteredRecords.flatMap(record => {
      if (record.items.every(item => !item.isRecipe)) {
        return record.items.map(item => ({
          'Order ID': record.orderId,
          'Date': new Date(record.date).toLocaleDateString(),
          'Batch No.': record.batchNumber,
          'Item Name': item.name,
          'Quantity': item.quantity,
          'Action': 'Stock Deducted'
        }));
      }
      return record.items.flatMap(item => {
        if (item.isRecipe) {
          return item.consumed.map(consumedItem => ({
            'Order ID': record.orderId,
            'Date': new Date(record.date).toLocaleDateString(),
            'Batch No.': record.batchNumber,
            'Item Name': `${item.name} -> ${consumedItem.name}`,
            'Quantity': consumedItem.quantity,
            'Action': 'Stock Deducted'
          }));
        } else {
          return {
            'Order ID': record.orderId,
            'Date': new Date(record.date).toLocaleDateString(),
            'Batch No.': record.batchNumber,
            'Item Name': item.name,
            'Quantity': item.quantity,
            'Action': 'Stock Deducted'
          };
        }
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Records');

    if (monthlySummary.length > 0) {
      const summaryWorksheetData = monthlySummary.map(item => ({
        'Item Name': item.name,
        'Total Consumed': item.quantity.toFixed(3)
      }));
      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryWorksheetData);
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Monthly Summary');
    }

    XLSX.writeFile(workbook, `BakeryOrderRecords_${selectedMonth.replace(' ', '_')}.xlsx`);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Order Records</h2>
        <div>
          <select className="form-select d-inline-block w-auto me-3" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
            {availableMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <button className="btn btn-success" onClick={exportToExcel}>Export to Excel</button>
        </div>
      </div>
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Batch No.</th>
            <th>Items</th>
            <th>Action Taken</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map(record => (
            <tr key={record.orderId}>
              <td>{record.orderId}</td>
              <td>{new Date(record.date).toLocaleString()}</td>
              <td>{record.batchNumber}</td>
              <td>
                <ul>
                  {record.items.map((item, index) => (
                    <li key={index}>
                      <strong>{item.name} - {item.quantity} {recipes[item.name]?.unit || ''}</strong>
                      {item.isRecipe && (
                        <ul>
                          {item.consumed.map((consumedItem, cIndex) => (
                            <li key={cIndex}>{consumedItem.name}: {consumedItem.quantity.toFixed(3)}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </td>
              <td>Stock Deducted</td>
            </tr>
          ))}
        </tbody>
      </table>

      {monthlySummary.length > 0 && (
        <>
          <h3 className="mt-5">Monthly Consumption Summary ({selectedMonth})</h3>
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Item Name</th>
                <th>Total Consumed</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummary.sort((a, b) => a.name.localeCompare(b.name)).map(item => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.quantity.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

// Dummy recipes object to resolve potential undefined error if recipes are not available here
// A better approach would be to manage this in a global state (React Context)
const recipes = {
  'ALFA COOKIES': { unit: 'kg' },
  'GOODDAY': { unit: 'kg' },
  'Bun': { unit: 'kg' },
};

export default Records;
