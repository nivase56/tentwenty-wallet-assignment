import CryptoPortfolio from "./pieChart.Card";
import DonutTitle from "../navbar/donut.title";

const Dashboard = () => {
  return (
    <div className="m-2 p-2">
      <DonutTitle />
      <CryptoPortfolio />
    </div>
  );
};

export default Dashboard;
