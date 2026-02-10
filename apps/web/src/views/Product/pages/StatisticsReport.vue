<template>
	<div class="statistics-report-container">
		<!-- 顶部 Tab 切换 -->
		<div class="tabs-header">
			<div
				v-for="tab in tabs"
				:key="tab.value"
				class="tab-item"
				:class="{ active: currentTab === tab.value }"
				@click="handleTabChange(tab.value)"
			>
				{{ tab.label }}
			</div>
		</div>

		<!-- 主体内容 -->
		<div class="main-content">
			<!-- 左侧行业数据列表 -->
			<div class="left-sidebar">
				<!-- 总量显示 -->
				<div class="total-stats">
					<div class="stat-label">{{ currentTabLabel }}总量</div>
					<div class="stat-value">{{ currentTotal }}</div>
				</div>

				<!-- 行业列表 -->
				<div class="industry-list">
					<div
						class="industry-item"
						:class="{ active: currentIndustry === '' }"
						@click="currentIndustry = ''"
					>
						<span class="industry-name">全部行业</span>
					</div>
					<div
						v-for="item in currentIndustryData"
						:key="item.name"
						class="industry-item"
						:class="{ active: currentIndustry === item.name }"
						@click="currentIndustry = item.name"
					>
						<span class="industry-name">{{ item.name }}</span>
						<span class="industry-count">{{ item.count }}</span>
					</div>
				</div>
			</div>

			<!-- 右侧图表区域 -->
			<div class="right-content">
				<!-- 上方：增量折线图 -->
				<div class="chart-section top-section">
					<div class="chart-header">
						<h3 class="chart-title">{{ currentTabLabel }}增量趋势</h3>
					</div>
					<div class="chart-container" ref="lineChartRef"></div>
				</div>

				<!-- 下方：柱状图和饼图 -->
				<div class="bottom-section">
					<!-- 左下：行业总量柱状图 -->
					<div class="chart-section half-width">
						<div class="chart-header">
							<h3 class="chart-title">各行业{{ currentTabLabel }}总量</h3>
						</div>
						<div class="chart-container" ref="barChartRef"></div>
					</div>

					<!-- 右下：行业占比饼图 -->
					<div class="chart-section half-width">
						<div class="chart-header">
							<h3 class="chart-title">{{ currentTabLabel }}行业占比</h3>
						</div>
						<div class="chart-container" ref="pieChartRef"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from "vue";
import * as echarts from "echarts";

// --- 类型定义 ---
type TabValue = "client" | "asset" | "device";

interface TabOption {
	label: string;
	value: TabValue;
}

interface IndustryData {
	name: string;
	count: number;
}

// --- 状态定义 ---
const currentTab = ref<TabValue>("client");
const currentIndustry = ref<string>("");

const tabs: TabOption[] = [
	{ label: "客户", value: "client" },
	{ label: "资产", value: "asset" },
	{ label: "设备", value: "device" },
];

const industries = [
	"智慧车联",
	"智慧制造",
	"智慧基建",
	"智慧农业",
	"智能能源",
	"智慧厅堂",
	"智慧物流",
	"智慧航运",
];

// Mock 数据生成
const generateRandomData = (count: number, max: number) => {
	return Array.from({ length: count }, () => Math.floor(Math.random() * max));
};

// 存储不同 Tab 的随机数据，保证切换回来看还是原来的数据，但不同 Tab 数据不同
const mockDataMap = ref<Record<TabValue, IndustryData[]>>({
	client: [],
	asset: [],
	device: [],
});

// 初始化 Mock 数据
const initMockData = () => {
	tabs.forEach((tab) => {
		mockDataMap.value[tab.value] = industries.map((name) => ({
			name,
			count: Math.floor(Math.random() * 1000) + 100,
		}));
	});
};

initMockData();

// 图表实例引用
const lineChartRef = ref<HTMLElement | null>(null);
const barChartRef = ref<HTMLElement | null>(null);
const pieChartRef = ref<HTMLElement | null>(null);

let lineChart: echarts.ECharts | null = null;
let barChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;

// --- 计算属性 ---
const currentTabLabel = computed(() => {
	return tabs.find((t) => t.value === currentTab.value)?.label || "";
});

// 获取当前 Tab 的行业数据
const currentIndustryData = computed<IndustryData[]>(() => {
	return mockDataMap.value[currentTab.value];
});

const currentTotal = computed(() => {
	return currentIndustryData.value.reduce((sum, item) => sum + item.count, 0);
});

// --- 图表配置与渲染 ---

const initCharts = () => {
	if (lineChartRef.value) {
		lineChart = echarts.init(lineChartRef.value);
	}
	if (barChartRef.value) {
		barChart = echarts.init(barChartRef.value);
	}
	if (pieChartRef.value) {
		pieChart = echarts.init(pieChartRef.value);
	}
	updateCharts();
};

const updateCharts = () => {
	const label = currentTabLabel.value;
	const themeColor = "#409eff";

	// 1. 折线图 (Line Chart)
	const lineOption = {
		tooltip: {
			trigger: "axis",
		},
		grid: {
			left: "3%",
			right: "4%",
			bottom: "3%",
			containLabel: true,
		},
		xAxis: {
			type: "category",
			boundaryGap: false,
			data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
		},
		yAxis: {
			type: "value",
		},
		series: [
			{
				name: `新增${label}`,
				type: "line",
				smooth: true,
				data: generateRandomData(7, 50),
				itemStyle: { color: themeColor },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: "rgba(64, 158, 255, 0.5)" },
						{ offset: 1, color: "rgba(64, 158, 255, 0.1)" },
					]),
				},
			},
		],
	};
	lineChart?.setOption(lineOption);

	// 2. 柱状图 (Bar Chart)
	const barData = currentIndustryData.value.map((item) => item.count);
	const barOption = {
		tooltip: {
			trigger: "axis",
			axisPointer: { type: "shadow" },
		},
		grid: {
			left: "3%",
			right: "4%",
			bottom: "3%",
			containLabel: true,
		},
		xAxis: {
			type: "category",
			data: industries,
			axisLabel: { interval: 0, rotate: 30 },
		},
		yAxis: {
			type: "value",
		},
		series: [
			{
				name: `${label}总量`,
				type: "bar",
				data: barData,
				itemStyle: { color: themeColor },
				barWidth: "40%",
			},
		],
	};
	barChart?.setOption(barOption);

	// 3. 饼图 (Pie Chart)
	const pieData = currentIndustryData.value.map((item) => ({
		value: item.count,
		name: item.name,
	}));
	const pieOption = {
		tooltip: {
			trigger: "item",
		},
		legend: {
			orient: "vertical",
			left: "left",
			type: "scroll",
		},
		series: [
			{
				name: "行业占比",
				type: "pie",
				radius: ["40%", "70%"],
				avoidLabelOverlap: false,
				itemStyle: {
					borderRadius: 10,
					borderColor: "#fff",
					borderWidth: 2,
				},
				label: {
					show: false,
					position: "center",
				},
				emphasis: {
					label: {
						show: true,
						fontSize: 16,
						fontWeight: "bold",
					},
				},
				labelLine: {
					show: false,
				},
				data: pieData,
			},
		],
	};
	pieChart?.setOption(pieOption);
};

// --- 事件处理 ---
const handleTabChange = (val: TabValue) => {
	currentTab.value = val;
	currentIndustry.value = "";
	// 模拟数据更新
	nextTick(() => {
		updateCharts();
	});
};

// 窗口大小调整处理
const handleResize = () => {
	lineChart?.resize();
	barChart?.resize();
	pieChart?.resize();
};

onMounted(() => {
	initCharts();
	window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
	window.removeEventListener("resize", handleResize);
	lineChart?.dispose();
	barChart?.dispose();
	pieChart?.dispose();
});

// 监听行业选择变化（这里暂时只影响高亮，实际可能需要联动图表高亮）
watch(currentIndustry, (newVal) => {
	if (newVal) {
		// 可以添加图表联动逻辑，例如高亮柱状图某一项
		barChart?.dispatchAction({
			type: "highlight",
			seriesIndex: 0,
			dataIndex: industries.indexOf(newVal),
		});
	} else {
		barChart?.dispatchAction({
			type: "downplay",
			seriesIndex: 0,
		});
	}
});
</script>

<style scoped>
.statistics-report-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	padding: 0;
	background-color: #f5f7fa;
	box-sizing: border-box;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
		"Helvetica Neue", Arial, sans-serif;
}

/* Tab 样式 (复用 DataLedger) */
.tabs-header {
	display: flex;
	gap: 12px;
	background-color: #fff;
	border-radius: 8px;
	padding: 12px 16px;
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.tab-item {
	padding: 8px 24px;
	cursor: pointer;
	background-color: #f5f7fa;
	border-radius: 4px;
	font-weight: 500;
	color: #606266;
	transition: all 0.3s;
	font-size: 14px;
}

.tab-item:hover {
	color: #409eff;
	background-color: #ecf5ff;
}

.tab-item.active {
	color: #fff;
	background-color: #409eff;
	font-weight: 500;
}

/* 主体布局 */
.main-content {
	display: flex;
	flex: 1;
	gap: 16px;
	overflow: hidden;
	padding-top: 16px;
}

/* 左侧列表 (复用 DataLedger) */
.left-sidebar {
	width: 180px;
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	background-color: #fff;
	border-radius: 8px;
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	padding: 16px;
	gap: 12px;
}

.total-stats {
	padding: 16px;
	text-align: center;
	background: linear-gradient(135deg, #ecf5ff 0%, #f0f9eb 100%);
	border-radius: 8px;
	border: 1px solid #d9ecff;
}

.stat-label {
	font-size: 13px;
	color: #606266;
	margin-bottom: 8px;
}

.stat-value {
	font-size: 28px;
	font-weight: bold;
	color: #409eff;
}

.industry-list {
	display: flex;
	flex-direction: column;
	gap: 4px;
	overflow-y: auto;
	flex: 1;
}

.industry-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 12px;
	cursor: pointer;
	border-radius: 6px;
	transition: all 0.2s;
	font-size: 14px;
	color: #606266;
}

.industry-item:hover {
	background-color: #f5f7fa;
	color: #409eff;
}

.industry-item.active {
	background-color: #ecf5ff;
	color: #409eff;
	font-weight: 600;
}

.industry-count {
	font-size: 12px;
	color: #909399;
	background-color: #f4f4f5;
	padding: 2px 8px;
	border-radius: 10px;
	min-width: 20px;
	text-align: center;
}

.industry-item.active .industry-count {
	color: #409eff;
	background-color: #fff;
}

/* 右侧内容 - 图表区域 */
.right-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 16px;
	overflow-y: auto; /* 允许滚动 */
	padding-right: 4px; /* 防止滚动条遮挡 */
}

.chart-section {
	background-color: #fff;
	border-radius: 8px;
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	padding: 16px;
	display: flex;
	flex-direction: column;
}

.top-section {
	flex: 0 0 40%; /* 占比 40% */
	min-height: 300px;
}

.bottom-section {
	flex: 1;
	display: flex;
	gap: 16px;
	min-height: 300px;
}

.half-width {
	flex: 1;
}

.chart-header {
	margin-bottom: 16px;
	border-left: 4px solid #409eff;
	padding-left: 12px;
}

.chart-title {
	font-size: 16px;
	font-weight: 600;
	color: #303133;
	margin: 0;
}

.chart-container {
	flex: 1;
	width: 100%;
	min-height: 250px;
}
</style>
