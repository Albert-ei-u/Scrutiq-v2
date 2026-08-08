"use client";

import { useState, useEffect, useRef } from "react";
import {
  BarChart3,
  Target,
  FileText,
  Database,
  RefreshCcw,
  Zap,
  ArrowUp,
  ArrowDown,
  Activity,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import ExcelJS from "exceljs";
import api from "@/lib/api";
import { toast } from "@/lib/toast";

const COLORS = [
  "#2C7BE5",
  "#E63757",
  "#F6AD55",
  "#48BB78",
  "#744210",
  "#805AD5",
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"performance" | "distribution">(
    "performance",
  );
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly" | "annual">(
    "weekly",
  );
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  // Click away listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        setExpandedCategory(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async (range = timeRange) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/stats?range=${range}`);
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Resource error: Could not sync analytics data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    toast.success("System alignment synced.");
  };

  const handleGenerateReport = async () => {
    if (!stats) {
      toast.error("Resource error: No synchronization data available.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("System Analytics");

    // Standard styling for sections
    const fontName = "Poppins";
    const headerFont = {
      name: fontName,
      family: 4,
      size: 12,
      bold: true,
      underline: true,
    };
    const labelFont = { name: fontName, family: 4, size: 10, bold: true };
    const contentFont = { name: fontName, family: 4, size: 10 };

    const applyTableBorders = (
      startR: number,
      endR: number,
      startC: number,
      endC: number,
    ) => {
      for (let r = startR; r <= endR; r++) {
        for (let c = startC; c <= endC; c++) {
          const cell = worksheet.getCell(r, c);
          cell.border = {
            top: { style: r === startR ? "double" : "thin" },
            left: { style: c === startC ? "double" : "thin" },
            bottom: { style: r === endR ? "double" : "thin" },
            right: { style: c === endC ? "double" : "thin" },
          };
        }
      }
    };

    let currentRow = 1;

    // --- SECTION 1: SYSTEM Metrics ---
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    const sec1Title = worksheet.getCell(`A${currentRow}`);
    sec1Title.value = "SYSTEM Metrics";
    sec1Title.font = headerFont;
    sec1Title.alignment = { horizontal: "center" };
    const startRow1 = currentRow;
    currentRow++;

    const sec1Header = worksheet.getRow(currentRow);
    sec1Header.values = ["Metric", "Value"];
    sec1Header.font = labelFont;
    currentRow++;

    const metricsData = [
      ["Screening Accuracy", `${Math.round(stats.matchSuccessRate || 0)}%`],
      ["Active Jobs", stats.activeJobs || 0],
      ["Active Applicants", stats.candidates || 0],
    ];

    metricsData.forEach((row) => {
      const r = worksheet.getRow(currentRow);
      r.values = row;
      r.font = contentFont;
      currentRow++;
    });

    applyTableBorders(startRow1, currentRow - 1, 1, 2);

    currentRow += 2; // Two blank rows

    // --- SECTION 2: Role distribution ---
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    const sec2Title = worksheet.getCell(`A${currentRow}`);
    sec2Title.value = "Role distribution";
    sec2Title.font = headerFont;
    sec2Title.alignment = { horizontal: "center" };
    const startRow2 = currentRow;
    currentRow++;

    const sec2Header = worksheet.getRow(currentRow);
    sec2Header.values = ["Role / Department", "Job Count"];
    sec2Header.font = labelFont;
    currentRow++;

    (stats.jobDistribution || []).forEach((item: any) => {
      const r = worksheet.getRow(currentRow);
      r.values = [item.name, item.value];
      r.font = contentFont;
      currentRow++;
    });

    applyTableBorders(startRow2, currentRow - 1, 1, 2);

    currentRow += 2; // Two blank rows

    // --- SECTION 3: Screening Metrics ---
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    const sec3Title = worksheet.getCell(`A${currentRow}`);
    sec3Title.value = "Screening Metrics";
    sec3Title.font = headerFont;
    sec3Title.alignment = { horizontal: "center" };
    const startRow3 = currentRow;
    currentRow++;

    const sec3Header = worksheet.getRow(currentRow);
    sec3Header.values = ["Timeline Interval", "Volume"];
    sec3Header.font = labelFont;
    currentRow++;

    chartData.forEach((item: any) => {
      const r = worksheet.getRow(currentRow);
      r.values = [item.name, item.screenings];
      r.font = contentFont;
      currentRow++;
    });

    applyTableBorders(startRow3, currentRow - 1, 1, 2);

    // Adjust column widths to fit content
    worksheet.getColumn(1).width = 40;
    worksheet.getColumn(2).width = 20;

    // Generate and download buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `Scrutiq_Unified_Analytics_${new Date().toISOString().split("T")[0]}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);

    toast.success("Unified technical report generated successfully.");
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCcw className="size-10 text-scrutiq-blue animate-spin" />
        <p className="text-xs font-bold text-scrutiq-muted tracking-widest">
          Synchronizing real-time metrics...
        </p>
      </div>
    );
  }

  const metricCards = [
    {
      label: "Screening accuracy",
      value: `${Math.round(stats?.matchSuccessRate || 0)}%`,
      change: "+0.4%",
      isUp: true,
      icon: Target,
      color: "blue",
    },
    {
      label: "Active job postings",
      value: stats?.activeJobs || 0,
      change: "Stable",
      isUp: true,
      icon: Zap,
      color: "emerald",
    },
    {
      label: "Applicant registry",
      value: stats?.candidates || 0,
      change: "+12",
      isUp: true,
      icon: FileText,
      color: "amber",
    },
  ];

  const generateChartData = () => {
    if (!stats) return [];

    const dataMap = new Map();
    (stats.performanceData || []).forEach((d: any) => {
      dataMap.set(d.name, d);
    });

    const result = [];
    const count =
      timeRange === "weekly" ? 7 : timeRange === "monthly" ? 30 : 12;

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      if (timeRange === "annual") {
        d.setMonth(d.getMonth() - i);
        const monthStr = d.toISOString().substring(0, 7); // YYYY-MM
        const existing = dataMap.get(monthStr);
        result.push({
          name: d.toLocaleDateString("en-US", { month: "short" }),
          screenings: existing ? existing.screenings : 0,
          quality: existing ? existing.quality : 0,
        });
      } else {
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const existing = dataMap.get(dateStr);
        result.push({
          name:
            timeRange === "weekly"
              ? d.toLocaleDateString("en-US", { weekday: "short" })
              : d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
          screenings: existing ? existing.screenings : 0,
          quality: existing ? existing.quality : 0,
        });
      }
    }
    return result;
  };

  const chartData = generateChartData();

  const jobDistribution =
    stats?.jobDistribution?.length > 0
      ? stats.jobDistribution
      : [{ name: "No data", value: 1 }];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-scrutiq-surface p-4 sm:p-6 md:p-8 rounded-2xl border border-scrutiq-border shadow-sm gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-scrutiq-dark tracking-tighter">
            System analytics
          </h1>
          <p className="text-sm font-bold text-scrutiq-muted tracking-wide max-w-lg">
            Monitor real-time system performance, ai alignment fidelity, and
            candidate registry growth metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className={`p-4 rounded-xl border border-scrutiq-border bg-scrutiq-surface transition-all hover:bg-scrutiq-bg active:scale-95`}
          >
            <RefreshCcw
              className={`size-5 text-scrutiq-muted ${isRefreshing ? "animate-spin text-scrutiq-blue" : ""}`}
            />
          </button>
          <div className="h-10 w-px bg-scrutiq-border mx-2" />
          <button
            onClick={handleGenerateReport}
            className="btn-primary flex items-center gap-2 shadow-xl shadow-scrutiq-blue/20"
          >
            <Database className="size-4" />
            <span>Generate report</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {metricCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="admin-card p-6 md:p-8 bg-scrutiq-surface group hover-lift relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="size-24" />
            </div>

            <div className="relative z-10 flex flex-col gap-6">
              <div className="size-14 rounded-2xl bg-scrutiq-bg flex items-center justify-center">
                <stat.icon className={`size-7 text-scrutiq-blue`} />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-scrutiq-muted tracking-widest">
                  {stat.label}
                </p>
                <div className="flex items-end gap-3">
                  <h3 className="text-4xl font-black text-scrutiq-dark tracking-tighter">
                    {stat.value}
                  </h3>
                  <div
                    className={`flex items-center gap-1 text-[10px] font-black pb-1.5 ${stat.change.includes("+") ? "text-emerald-500" : "text-scrutiq-muted"}`}
                  >
                    {stat.change}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 admin-card p-6 md:p-10 bg-scrutiq-surface min-h-[450px] md:min-h-[500px] flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-12 gap-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-scrutiq-dark tracking-tight">
                Active performance
              </h2>
              <p className="text-[10px] md:text-xs font-bold text-scrutiq-muted tracking-widest leading-relaxed">
                Visualizing weekly screening volume and quality metrics
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-scrutiq-bg border border-scrutiq-border text-[9px] md:text-[10px] font-black py-2 px-3 md:px-4 rounded-xl outline-none focus:ring-2 focus:ring-scrutiq-blue/20 transition-all cursor-pointer"
              >
                <option value="weekly">Weekly View</option>
                <option value="monthly">Monthly View</option>
                <option value="annual">Annual View</option>
              </select>
              <div className="flex p-1 bg-scrutiq-bg border border-scrutiq-border rounded-xl">
                <button
                  onClick={() => setActiveTab("performance")}
                  className={`px-3 md:px-4 py-2 text-[9px] md:text-[10px] font-black rounded-lg transition-all ${activeTab === "performance" ? "bg-scrutiq-surface text-scrutiq-blue shadow-sm" : "text-scrutiq-muted hover:text-scrutiq-dark"}`}
                >
                  Screenings
                </button>
                <button
                  onClick={() => setActiveTab("distribution")}
                  className={`px-3 md:px-4 py-2 text-[9px] md:text-[10px] font-black rounded-lg transition-all ${activeTab === "distribution" ? "bg-scrutiq-surface text-scrutiq-blue shadow-sm" : "text-scrutiq-muted hover:text-scrutiq-dark"}`}
                >
                  Quality
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[300px] md:min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2C7BE5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2C7BE5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fontWeight: 800, fill: "#94a3b8" }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "10px",
                    fontWeight: 800,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={
                    activeTab === "performance" ? "screenings" : "quality"
                  }
                  stroke="#2C7BE5"
                  strokeWidth={4}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#2C7BE5" }}
                  fillOpacity={1}
                  fill="url(#colorBlue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card p-8 md:p-10 bg-scrutiq-surface flex flex-col">
          <div className="space-y-1 mb-8">
            <h2 className="text-2xl font-black text-scrutiq-dark tracking-tight">
              Role distribution
            </h2>
            <p className="text-[10px] md:text-xs font-bold text-scrutiq-muted tracking-widest">
              Jobs categorized by department
            </p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={jobDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {jobDistribution.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div
            ref={listRef}
            className="space-y-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar"
          >
            {jobDistribution.map((job: any, i: number) => {
              const isExpanded = expandedCategory === job.name;
              const subJobs = (stats?.detailedDistribution || []).filter(
                (d: any) => d.department === job.name,
              );

              return (
                <div key={i} className="flex flex-col gap-2">
                  <div
                    onClick={() =>
                      setExpandedCategory(isExpanded ? null : job.name)
                    }
                    className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${isExpanded ? "bg-scrutiq-bg" : "hover:bg-scrutiq-bg/50"}`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-scrutiq-muted tracking-widest">
                          {job.name}
                        </span>
                        <span className="text-[9px] font-black text-scrutiq-blue bg-scrutiq-blue/10 px-1.5 py-0.5 rounded-md">
                          {job.value}
                        </span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="text-scrutiq-muted/50"
                    >
                      <ChevronDown className="size-3" />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-5 border-l-2 border-scrutiq-border/30 ml-1 ml-4"
                      >
                        <div className="py-1 space-y-2">
                          {subJobs.map((sj: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 group"
                            >
                              <div className="size-1 rounded-full bg-scrutiq-blue/20 group-hover:bg-scrutiq-blue transition-colors" />
                              <p className="text-[9px] font-bold text-scrutiq-muted leading-tight">
                                {sj.title}
                              </p>
                            </div>
                          ))}
                          {subJobs.length === 0 && (
                            <p className="text-[9px] italic text-scrutiq-muted opacity-50">
                              No sub-roles assigned.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Technical Status */}
      <div className="admin-card border-[#2C7BE5]/10 bg-scrutiq-blue/5 p-8 relative overflow-hidden group">
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="size-20 rounded-3xl bg-scrutiq-surface flex items-center justify-center shadow-lg shadow-scrutiq-blue/5 border border-scrutiq-border">
            <Activity className="size-10 text-scrutiq-blue" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="text-lg font-black text-scrutiq-dark tracking-tight">
              Active synchronization
            </h3>
            <p className="text-xs font-bold text-scrutiq-muted tracking-widest leading-relaxed max-w-3xl">
              Technical dashboard is now reflecting live production data. All
              counts for jobs, applicants, and historical screening activity are
              synced with your company registry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
