import React from 'react';
import '../styles/dashboard.css'; // Import the CSS file

const Dashboard = ({ results }) => {
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Demand Forecasting Dashboard</h2>
      <p className="dashboard-description">
        This dashboard provides insights into demand forecasting, helping to predict future product demand, optimize inventory levels, and reduce stockouts. 
        It includes visualizations of sales forecasts, stock levels, and seasonal trends to assist with decision-making.
      </p>
      <div className="iframe-container">
        <iframe 
          title="Demand Forecasting Report" 
          className="dashboard-iframe"
          src="https://app.powerbi.com/reportEmbed?reportId=a88fb4f9-c7e3-44dc-8fa9-789387fe41f1&autoAuth=true&ctid=253c8147-cad4-44b8-8f59-834edf7b1ef9" 
        ></iframe>
      </div>
    </div>
  );
};

export default Dashboard;