import { tool } from '@langchain/core/tools';
import * as z from 'zod';
import * as crypto from 'crypto';

// 农业基地配置
const AGRICULTURE_BASES: Record<
  string,
  {
    base_id: string;
    base_type: string;
    device_count: number;
    device_types: string[];
  }
> = {
  智慧茶园: {
    base_id: 'AG_BASE_001',
    base_type: '茶园',
    device_count: 8,
    device_types: ['气象监测', '土壤监测', '监控摄像头'],
  },
  芒果园: {
    base_id: 'AG_BASE_002',
    base_type: '芒果园',
    device_count: 6,
    device_types: ['气象监测', '土壤监测', '监控摄像头'],
  },
  油橄榄基地: {
    base_id: 'AG_BASE_003',
    base_type: '油橄榄基地',
    device_count: 10,
    device_types: ['气象监测', '土壤监测', '水质监测', '监控摄像头'],
  },
  智慧肉牛基地: {
    base_id: 'AG_BASE_004',
    base_type: '智慧肉牛基地',
    device_count: 12,
    device_types: ['监控摄像头', '温度传感器', '喂食器'],
  },
};

// 设备状态
const DEVICE_STATUS = ['在线', '离线', '故障'];

// 肉牛品种
const CATTLE_BREEDS = [
  '西门塔尔牛',
  '安格斯牛',
  '夏洛莱牛',
  '利木赞牛',
  '秦川牛',
];

// 辅助函数：MD5哈希
function md5(str: string): string {
  return crypto.createHash('md5').update(str).digest('hex');
}

// 辅助函数：获取基地信息
async function getBaseInfo(baseName: string) {
  return Promise.resolve(AGRICULTURE_BASES[baseName]);
}

// 辅助函数：生成设备ID
function generateDeviceId(
  baseName: string,
  deviceType: string,
  index: number,
): string {
  const hashVal = md5(`${baseName}_${deviceType}_${index}`)
    .slice(0, 8)
    .toUpperCase();
  return `DEV_${hashVal}`;
}

// 辅助函数：根据基地和设备ID生成确定的设备状态
function getDeviceStatus(baseName: string, deviceId: string): string {
  const hashVal = parseInt(md5(`${baseName}_${deviceId}`).slice(0, 8), 16);
  return DEVICE_STATUS[hashVal % DEVICE_STATUS.length];
}

// 辅助函数：生成监测状态
function getMonitorStatus(baseName: string, monitorType: string): string {
  const hashVal = parseInt(md5(`${baseName}_${monitorType}`).slice(0, 8), 16);
  // 80%概率返回正常，15%返回异常，5%返回离线
  const randVal = hashVal % 100;
  if (randVal < 80) {
    return '正常';
  } else if (randVal < 95) {
    return '异常';
  } else {
    return '离线';
  }
}

// 格式化时间
function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 获取气象监测数据
export const getWeatherMonitorTool = tool(
  async ({ base_name }: { base_name: string }) => {
    const baseInfo = await getBaseInfo(base_name);
    if (!baseInfo) {
      return JSON.stringify({
        code: 404,
        message: `未找到基地：${base_name}`,
      });
    }

    // 生成监测状态
    const monitorStatus = getMonitorStatus(base_name, 'weather');

    // 根据基地生成固定的气象数据
    const hashVal = parseInt(md5(`${base_name}_weather`).slice(0, 8), 16);

    // 气象数据范围
    const temperature = 15 + (hashVal % 20); // 15-35℃
    const humidity = 50 + (hashVal % 40); // 50-90%
    const windSpeed = (hashVal % 10) / 2; // 0-4.5m/s
    const rainfall = hashVal % 5; // 0-4mm
    const airPressure = 1000 + (hashVal % 30); // 1000-1030hPa
    const co2 = 350 + (hashVal % 100); // 350-450ppm

    // 生成更新时间（最近30分钟内）
    const timeOffset = hashVal % 30;
    const updateTime = new Date(Date.now() - timeOffset * 60 * 1000);

    const result = {
      componentId: 'FarmingWeather',
      data: {
        data: {
          base_name: base_name,
          base_id: baseInfo.base_id,
          temperature: Number(temperature.toFixed(1)),
          humidity: humidity,
          wind_speed: Number(windSpeed.toFixed(1)),
          rainfall: rainfall,
          air_pressure: airPressure,
          co2: co2,
          update_time: formatDate(updateTime),
          monitor_status: monitorStatus,
        },
      },
    };

    return JSON.stringify(result);
  },
  {
    name: 'get_weather_monitor',
    description: '获取气象监测数据, 支持：智慧茶园、芒果园、油橄榄基地',
    schema: z.object({
      base_name: z
        .string()
        .describe('农业基地名称，例如："智慧茶园"、"芒果园"、"油橄榄基地"'),
    }),
  },
);

// 获取土壤监测数据
export const getSoilMonitorTool = tool(
  async ({ base_name }: { base_name: string }) => {
    const baseInfo = await getBaseInfo(base_name);
    if (!baseInfo) {
      return JSON.stringify({
        code: 404,
        message: `未找到基地：${base_name}`,
      });
    }

    // 生成监测状态
    const monitorStatus = getMonitorStatus(base_name, 'soil');

    // 根据基地生成固定的土壤数据
    const hashVal = parseInt(md5(`${base_name}_soil`).slice(0, 8), 16);

    // 土壤数据范围
    const phValue = 5.5 + (hashVal % 25) / 10; // 5.5-8.0
    const soilHumidity = 40 + (hashVal % 40); // 40-80%
    const soilTemperature = 10 + (hashVal % 20); // 10-30℃
    const nitrogen = 80 + (hashVal % 60); // 80-140mg/kg
    const phosphorus = 50 + (hashVal % 60); // 50-110mg/kg
    const potassium = 80 + (hashVal % 70); // 80-150mg/kg

    // 生成更新时间（最近30分钟内）
    const timeOffset = hashVal % 30;
    const updateTime = new Date(Date.now() - timeOffset * 60 * 1000);

    const result = {
      componentId: 'FarmingSoil',
      data: {
        data: {
          base_name: base_name,
          base_id: baseInfo.base_id,
          ph_value: Number(phValue.toFixed(1)),
          soil_humidity: soilHumidity,
          soil_temperature: Number(soilTemperature.toFixed(1)),
          nitrogen: nitrogen,
          phosphorus: phosphorus,
          potassium: potassium,
          update_time: formatDate(updateTime),
          monitor_status: monitorStatus,
        },
      },
    };

    return JSON.stringify(result);
  },
  {
    name: 'get_soil_monitor',
    description: '获取土壤监测数据，支持：智慧茶园、芒果园、油橄榄基地',
    schema: z.object({
      base_name: z
        .string()
        .describe('农业基地名称，例如："智慧茶园"、"芒果园"、"油橄榄基地"'),
    }),
  },
);

// 获取水质监测数据
export const getWaterQualityMonitorTool = tool(
  async ({ base_name }: { base_name: string }) => {
    if (base_name !== '油橄榄基地') {
      return JSON.stringify({
        code: 400,
        message: '水质监测功能仅支持油橄榄基地',
      });
    }

    const baseInfo = await getBaseInfo(base_name);

    // 生成监测状态
    const monitorStatus = getMonitorStatus(base_name, 'water');

    // 根据基地生成固定的水质数据
    const hashVal = parseInt(md5(`${base_name}_water`).slice(0, 8), 16);

    // 水质数据范围
    const waterTemperature = 15 + (hashVal % 15); // 15-30℃
    const waterPh = 6.5 + (hashVal % 15) / 10; // 6.5-8.0
    const conductivity = 200 + (hashVal % 400); // 200-600μS/cm
    const ionContent = 100 + (hashVal % 300); // 100-400mg/L
    const turbidity = (hashVal % 10) / 2; // 0-4.5NTU

    // 生成更新时间（最近30分钟内）
    const timeOffset = hashVal % 30;
    const updateTime = new Date(Date.now() - timeOffset * 60 * 1000);

    const result = {
      componentId: 'FarmingWater',
      data: {
        data: {
          base_name: base_name,
          base_id: baseInfo.base_id,
          water_temperature: Number(waterTemperature.toFixed(1)),
          water_ph: Number(waterPh.toFixed(1)),
          conductivity: conductivity,
          ion_content: ionContent,
          turbidity: Number(turbidity.toFixed(1)),
          update_time: formatDate(updateTime),
          monitor_status: monitorStatus,
        },
      },
    };

    return JSON.stringify(result);
  },
  {
    name: 'get_water_quality_monitor',
    description: '获取水质监测数据，仅支持油橄榄基地',
    schema: z.object({
      base_name: z.string().describe('农业基地名称，仅支持"油橄榄基地"'),
    }),
  },
);

// 获取设备列表
export const getDeviceListTool = tool(
  async ({ base_name }: { base_name: string }) => {
    const baseInfo = await getBaseInfo(base_name);
    if (!baseInfo) {
      return JSON.stringify({
        code: 404,
        message: `未找到基地：${base_name}`,
      });
    }

    const deviceList: Array<{
      device_id: string;
      device_name: string;
      device_type: string;
      status: string;
      last_active_time: string;
      location: string;
    }> = [];
    const deviceTypes = baseInfo.device_types;
    const deviceCount = baseInfo.device_count;

    // 为每种设备类型生成设备
    for (const deviceType of deviceTypes) {
      // 计算该类型设备数量（平均分配）
      const typeCount = Math.max(
        1,
        Math.floor(deviceCount / deviceTypes.length),
      );

      for (let i = 0; i < typeCount; i++) {
        const deviceId = generateDeviceId(base_name, deviceType, i);
        const deviceName = `${base_name}-${deviceType}-${i + 1}号`;

        // 获取设备状态
        const status = getDeviceStatus(base_name, deviceId);

        // 生成最后活跃时间
        const hashVal = parseInt(
          md5(`${base_name}_${deviceId}`).slice(0, 8),
          16,
        );
        let timeOffset = 0;
        if (status === '在线') {
          timeOffset = hashVal % 60; // 在线：最近1小时内
        } else if (status === '离线') {
          timeOffset = 60 + (hashVal % 720); // 离线：1-13小时前
        } else {
          timeOffset = 720 + (hashVal % 4320); // 故障：13小时-3天前
        }

        const lastActiveTime = new Date(Date.now() - timeOffset * 60 * 1000);

        // 设备位置
        const locations = [
          '东区',
          '西区',
          '南区',
          '北区',
          '中心区',
          '1号田',
          '2号田',
          '3号田',
        ];
        const location = locations[hashVal % locations.length];

        deviceList.push({
          device_id: deviceId,
          device_name: deviceName,
          device_type: deviceType,
          status: status,
          last_active_time: formatDate(lastActiveTime),
          location: location,
        });
      }
    }

    const result = {
      componentId: 'FarmingDevice',
      data: {
        data: deviceList,
        total: deviceList.length,
        base_name: base_name,
      },
    };

    return JSON.stringify(result);
  },
  {
    name: 'get_device_list',
    description: '获取设备列表，支持：智慧茶园、芒果园、油橄榄基地',
    schema: z.object({
      base_name: z
        .string()
        .describe('农业基地名称，例如："智慧茶园"、"芒果园"、"油橄榄基地"'),
    }),
  },
);

// 获取肉牛列表
export const getCattleListTool = tool(
  async ({ base_name = '智慧肉牛基地' }: { base_name?: string }) => {
    if (base_name !== '智慧肉牛基地') {
      return JSON.stringify({
        code: 400,
        message: '肉牛列表功能仅支持智慧肉牛基地',
      });
    }

    await getBaseInfo(base_name);

    // 根据基地生成肉牛数量（20-50头）
    const hashVal = parseInt(md5(base_name).slice(0, 8), 16);
    const cattleCount = 20 + (hashVal % 31); // 20-50头

    const cattleList: Array<{
      cattle_id: string;
      cattle_tag: string;
      breed: string;
      age: number;
      weight: number;
      health_status: string;
      location: string;
      last_feed_time: string;
    }> = [];
    for (let i = 0; i < cattleCount; i++) {
      // 生成肉牛ID和耳标号
      const cattleHash = parseInt(
        md5(`${base_name}_cattle_${i}`).slice(0, 8),
        16,
      );
      const cattleId = `CATTLE_${cattleHash
        .toString(16)
        .toUpperCase()
        .padStart(8, '0')}`;
      const cattleTag = `TAG${20240001 + i}`;

      // 品种
      const breed = CATTLE_BREEDS[cattleHash % CATTLE_BREEDS.length];

      // 年龄（12-60个月）
      const age = 12 + (cattleHash % 49);

      // 体重（300-800kg，与年龄相关）
      const weight = 300 + Math.floor((age - 12) * 12) + (cattleHash % 50);

      // 健康状态（90%健康，7%生病，3%治疗中）
      const healthRand = cattleHash % 100;
      let healthStatus = '健康';
      if (healthRand < 90) {
        healthStatus = '健康';
      } else if (healthRand < 97) {
        healthStatus = '生病';
      } else {
        healthStatus = '治疗中';
      }

      // 当前位置
      const locations = ['1号牛舍', '2号牛舍', '3号牛舍', '运动场', '隔离区'];
      let location = '';
      if (healthStatus === '治疗中') {
        location = '隔离区';
      } else if (healthStatus === '生病') {
        location = '3号牛舍';
      } else {
        location = locations[cattleHash % 3];
      }

      // 最后喂食时间（最近4小时内）
      const feedOffset = cattleHash % 240;
      const lastFeedTime = new Date(Date.now() - feedOffset * 60 * 1000);

      cattleList.push({
        cattle_id: cattleId,
        cattle_tag: cattleTag,
        breed: breed,
        age: age,
        weight: weight,
        health_status: healthStatus,
        location: location,
        last_feed_time: formatDate(lastFeedTime),
      });
    }

    const result = {
      componentId: 'CattleList',
      data: {
        data: cattleList,
        total: cattleList.length,
        base_name: base_name,
      },
    };

    return JSON.stringify(result);
  },
  {
    name: 'get_cattle_list',
    description: '获取肉牛列表',
    schema: z.object({
      base_name: z
        .string()
        .optional()
        .describe('基地名称，默认为"智慧肉牛基地"'),
    }),
  },
);

// 获取监控视频
export const getMonitorVideoTool = tool(
  async ({ base_name }: { base_name: string }) => {
    const baseInfo = await getBaseInfo(base_name);
    if (!baseInfo) {
      return JSON.stringify({
        code: 404,
        message: `未找到基地：${base_name}`,
      });
    }

    // 生成摄像头数量（2-6个）
    const hashVal = parseInt(md5(base_name).slice(0, 8), 16);
    const cameraCount = 2 + (hashVal % 5);

    // 摄像头类型和位置
    const cameraTypes = ['球机', '枪机', '半球'];
    const locations = [
      '东区入口',
      '西区入口',
      '南区入口',
      '北区入口',
      '中心广场',
      '1号田',
      '2号田',
      '3号田',
      '1号牛舍',
      '2号牛舍',
      '运动场',
    ];
    const resolutions = ['1080P', '4K', '720P'];

    const cameras: Array<{
      camera_id: string;
      camera_name: string;
      camera_type: string;
      location: string;
      video_url: string;
      stream_url: string;
      status: string;
      last_active_time: string;
      resolution: string;
    }> = [];
    for (let i = 0; i < cameraCount; i++) {
      // 为每个摄像头生成确定的属性
      const cameraHash = parseInt(
        md5(`${base_name}_camera_${i}`).slice(0, 8),
        16,
      );

      const cameraId = `CAM_${baseInfo.base_id}_${(i + 1)
        .toString()
        .padStart(3, '0')}`;
      const cameraName = `${base_name}-摄像头${i + 1}号`;
      const cameraType = cameraTypes[cameraHash % cameraTypes.length];
      const location = locations[cameraHash % locations.length];

      // 生成状态（85%在线，15%离线）
      const status = cameraHash % 100 < 85 ? '在线' : '离线';

      // 生成最后活跃时间
      let timeOffset = 0;
      if (status === '在线') {
        timeOffset = cameraHash % 30; // 在线：最近30分钟内
      } else {
        timeOffset = 30 + (cameraHash % 1440); // 离线：30分钟-24小时前
      }

      const lastActiveTime = new Date(Date.now() - timeOffset * 60 * 1000);

      // 视频链接
      const videoUrl = `https://example.com/monitor/${base_name}/${cameraId}/video.mp4`;
      const streamUrl = `rtsp://stream.example.com/${base_name}/${cameraId}/live`;
      const resolution = resolutions[cameraHash % resolutions.length];

      cameras.push({
        camera_id: cameraId,
        camera_name: cameraName,
        camera_type: cameraType,
        location: location,
        video_url: videoUrl,
        stream_url: streamUrl,
        status: status,
        last_active_time: formatDate(lastActiveTime),
        resolution: resolution,
      });
    }

    const result = {
      componentId: 'FarmingCamera',
      data: {
        data: cameras,
      },
    };

    return JSON.stringify(result);
  },
  {
    name: 'get_monitor_video',
    description: '获取监控视频链接, 支持：智慧茶园、芒果园、智慧肉牛基地',
    schema: z.object({
      base_name: z
        .string()
        .describe('农业基地名称，例如："智慧茶园"、"芒果园"、"智慧肉牛基地"'),
    }),
  },
);
