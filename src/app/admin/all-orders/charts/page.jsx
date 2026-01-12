 "use client";

import React, { useEffect, useState } from "react";
import API from "../../../../utils/axiosInstance";

import CustomShapeBarChart from "../../../components/Section/charts/Barchart";
import PieChartWithCustomizedLabel from "../../../components/Section/charts/Piechart";
import CustomizedDotLineChart from "../../../components/Section/charts/Linechart";

export default function OrdersChartPage() {
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);

  useEffect(() => {
    fetchOrderStats();
  }, []);

  const fetchOrderStats = async () => {
    try {
      const { data } = await API.get(`/admin/orders?page=1&limit=500`);
      const orders = data.orders || [];

      const processing = orders.filter(
        (o) => o.orderStatus === "Processing"
      ).length;
      const soon = orders.filter((o) => o.orderStatus === "Soon").length;
      const total = processing + soon; // Delivered ignore, total = processing + soon

      // ✅ PIE DATA
      setPieData([
        { name: "Processing", value: processing },
        { name: "Soon", value: soon },
        { name: "Total Orders", value: total },
      ]);

      // ✅ BAR DATA
      setBarData([
        { name: "Processing", value: processing },
        { name: "Soon", value: soon },
        { name: "Total Orders", value: total },
      ]);

      // ✅ LINE DATA
      setLineData([
        { name: "Processing", pv: processing, uv: processing },
        { name: "Soon", pv: soon, uv: soon },
        { name: "Total Orders", pv: total, uv: total },
      ]);
    } catch (err) {
      console.log("Error fetching chart data:", err);
    }
  };

  return (
    <div className="p-6 max-w-6xl  w-full mx-auto">
      <h2 className="text-3xl font-bold  text-center mb-10 text-gray-800">
        Orders Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PIE CHART */}
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Orders Distribution
          </h3>
          <PieChartWithCustomizedLabel data={pieData} />
        </div>

        {/* BAR CHART */}
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Orders Status (Bar Chart)
          </h3>
          <CustomShapeBarChart data={barData} />
        </div>

        {/* LINE CHART */}
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center md:col-span-2">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Orders Trend (Line Chart)
          </h3>
          <CustomizedDotLineChart data={lineData} />
        </div>
      </div>
    </div>
  );
}
