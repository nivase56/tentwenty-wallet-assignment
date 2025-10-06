import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

interface DataItem {
  label: string;
  value: number;
  color: string;
}

const DonutChart: React.FC<{ data: DataItem[] }> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 95;
    const innerRadius = 50;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    data.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();

      ctx.fillStyle = item.color;
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();

      currentAngle += sliceAngle;
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "#2b2d31";
    ctx.fill();
  }, [data]);

  return (
    <div className="flex items-center justify-center p-1">
      <canvas ref={canvasRef} width={200} height={200} className="mx-auto" />
    </div>
  );
};

const CryptoPortfolio = () => {
  // Use the same portfolio with percentages and colors for chart and list
  const portfolioData: DataItem[] = [
    { label: "Bitcoin (BTC)", value: 21.0, color: "#A78BFA" },
    { label: "Ethereum (ETH)", value: 64.6, color: "#60A5FA" },
    { label: "Solana (SOL)", value: 14.4, color: "#34D399" },
    { label: "Dogecoin (DOGE)", value: 14.4, color: "#22D3EE" },
    { label: "Solana (SOL)", value: 14.4, color: "#FB923C" },
    { label: "Solana (SOL)", value: 14.4, color: "#F472B6" },
  ];

  const fallbackTotal = 10275.08;
  const lastUpdated = "3:42:12 PM";

  const reduxBalance = useSelector((state: RootState) => state.wallet.balance);

  const formattedBalance = reduxBalance?.formatted || "";
  const symbol = reduxBalance?.symbol || "";

  const displayBalanceNumber =
    formattedBalance && !isNaN(Number(formattedBalance))
      ? Number(formattedBalance).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : fallbackTotal.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  const displayBalance = symbol ? `${displayBalanceNumber} ${symbol}` : displayBalanceNumber;

  console.log("Redux Stored Balance in CryptoPortfolio:", reduxBalance);

  return (
    <div className="min-h-2/4 m-4 rounded-2xl bg-[#27272A] text-white">
      <div className="p-6">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-start gap-16">
          <div className="flex-1 pt-4">
            <div className="text-gray-300 text-sm mb-3 font-semibold">Portfolio Total</div>
            <div className="text-7xl tracking-tight">$ {displayBalance}</div>
            <div className="text-gray-500 text-xs mt-32">Last updated: {lastUpdated}</div>
          </div>

          <div className="flex-1 pt-4">
            <div className="text-gray-300 text-sm mb-3 font-semibold">Portfolio Breakdown</div>
            <div className="flex items-center gap-8">
              <div className="relative w-48 h-48 flex-shrink-0">
                {/* Pass portfolio data to DonutChart */}
                <DonutChart data={portfolioData} />
              </div>

              <div className="space-y-2 flex-1">
                {portfolioData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal" style={{ color: item.color }}>
                        {item.label}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm font-light">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="text-gray-400 text-sm mb-2">Portfolio Total</div>
          <div className="text-4xl font-normal mb-2">$ {displayBalance}</div>
          <div className="text-gray-500 text-xs mb-8">Last updated: {lastUpdated}</div>

          <div className="text-gray-400 text-sm mb-6">Portfolio Breakdown</div>

          <div className="relative w-56 h-56 mx-auto mb-8">
            <DonutChart data={portfolioData} />
          </div>

          <div className="space-y-3">
            {portfolioData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-normal" style={{ color: item.color }}>
                    {item.label}
                  </p>
                </div>
                <span className="text-gray-400 text-sm">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoPortfolio;
