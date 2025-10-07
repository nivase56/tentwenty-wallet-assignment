import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

interface DataItem {
  label: string;
  value: number;
  color: string;
}

const DonutChart: React.FC<{ data: DataItem[] }> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });

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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    data.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        outerRadius,
        currentAngle,
        currentAngle + sliceAngle
      );
      ctx.arc(
        centerX,
        centerY,
        innerRadius,
        currentAngle + sliceAngle,
        currentAngle,
        true
      );
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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 95;
    const innerRadius = 50;

    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < innerRadius || distance > outerRadius) {
      setTooltip({ visible: false, x: 0, y: 0, content: "" });
      return;
    }

    let angle = Math.atan2(dy, dx);
    if (angle < -Math.PI / 2) {
      angle += 2 * Math.PI;
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2;

    let hoveredItem: DataItem | null = null;

    for (const item of data) {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      if (angle >= currentAngle && angle < currentAngle + sliceAngle) {
        hoveredItem = item;
        break;
      }
      currentAngle += sliceAngle;
    }

    if (hoveredItem) {
      setTooltip({
        visible: true,
        x: e.clientX + 10,
        y: e.clientY + 10,
        content: `${hoveredItem.label}: ${hoveredItem.value.toFixed(1)}%`,
      });
    } else {
      setTooltip({ visible: false, x: 0, y: 0, content: "" });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, content: "" });
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ display: "block", margin: "0 auto" }}
      />
      {tooltip.visible && (
        <div
          style={{
            position: "fixed",
            top: tooltip.y,
            left: tooltip.x,
            backgroundColor: "rgba(43, 45, 49, 0.85)",
            color: "white",
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 14,
            pointerEvents: "none",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            whiteSpace: "nowrap",
            transition: "opacity 0.2s ease",
            zIndex: 1000,
          }}
        >
          {tooltip.content}
          <div
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid rgba(43, 45, 49, 0.85)",
              bottom: "-6px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </div>
      )}
    </div>
  );
};

const CryptoPortfolio = () => {
  const portfolioTotal = useSelector(
    (state: RootState) => state.wallet.portfolioTotal
  );

  const portfolioData: DataItem[] = [
    { label: "Bitcoin (BTC)", value: 21.0, color: "#A78BFA" },
    { label: "Ethereum (ETH)", value: 64.6, color: "#60A5FA" },
    { label: "Solana (SOL)", value: 14.4, color: "#34D399" },
    { label: "Dogecoin (DOGE)", value: 14.4, color: "#22D3EE" },
    { label: "USDC (USDC)", value: 14.4, color: "#FB923C" },
    { label: "Stellar (XLM)", value: 14.4, color: "#F472B6" },
  ];

  const lastUpdated = new Date().toLocaleTimeString() || "3:42:12 PM";

  return (
    <div className="min-h-2/4 mx-1 my-2 rounded-2xl shadow-xs bg-[#27272A] text-white">
      <div className="px-5 py-2">
        <div className="hidden md:flex items-start gap-16">
          <div className="flex-1 pt-4">
            <div className="text-gray-300 text-sm mb-3 font-semibold">
              Portfolio Total
            </div>
            <div className="text-7xl tracking-tight">
              {portfolioTotal?.formatted || "$0.00"}
            </div>
            <div className="text-gray-500 text-xs mt-32">
              Last updated: {lastUpdated}
            </div>
          </div>

          <div className="flex-1 pt-4">
            <div className="text-gray-300 text-sm mb-3 font-semibold">
              Portfolio Breakdown
            </div>
            <div className="flex items-center gap-8">
              <div className="relative w-48 h-48 flex-shrink-0">
                <DonutChart data={portfolioData} />
              </div>

              <div className="space-y-2 flex-1">
                {portfolioData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-normal"
                        style={{ color: item.color }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm font-light">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div className="text-gray-400 text-sm mb-2">Portfolio Total</div>
          <div className="text-4xl font-normal mb-2">
            {portfolioTotal?.formatted || "$0.00"}
          </div>
          <div className="text-gray-500 text-xs mb-8">
            Last updated: {lastUpdated}
          </div>

          <div className="text-gray-400 text-sm mb-6">Portfolio Breakdown</div>

          <div className="relative w-56 h-56 mx-auto mb-8">
            <DonutChart data={portfolioData} />
          </div>

          <div className="space-y-3">
            {portfolioData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p
                    className="text-sm font-normal"
                    style={{ color: item.color }}
                  >
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