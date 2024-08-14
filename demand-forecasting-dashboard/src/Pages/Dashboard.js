import React, { useState } from 'react';
import TimeSeriesChart from '../Components/timeSeriesChart';
import BarChart from '../Components/barChart';
import Heatmap from '../Components/heatmapChart';

const Dashboard = ({ results }) => {
  const [data, setData] = useState(results);

  return (
    <div>
      <h2>Demand Forecasting Dashboard</h2>
      <div>
        <h3>Time-Series Chart for Sales Forecasts</h3>
        <TimeSeriesChart data={data} />
        <br></br><br></br>
      </div>
      <div>
        <h3>Bar Chart Comparing Stock Levels vs. Forecast</h3>
        <BarChart data={data} />
      </div>
      <div>
        <h3>Heatmap for Seasonal Demand Trends</h3>
        <Heatmap data={data} />
      </div>
    </div>
  );
};

export default Dashboard;
