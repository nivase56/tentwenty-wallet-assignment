import CryptoPortfolio from "../container/pieChart.Card";
import CryptoPortfolioTable from "../container/tableChart.card";
import DonutTitle from "../navbar/donut.title";
import WatchListTitle from "../navbar/watchlist.title";

const Dashboard = () => {
  return (
    <div className="mx-2 p-2">
      <DonutTitle />
      <CryptoPortfolio />
      <WatchListTitle />
      <CryptoPortfolioTable  />
    </div>
  );
};

export default Dashboard;
