import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import * as crypto from 'crypto';

// 常量定义
const SHENZHEN_LAT_RANGE = [22.43, 22.87];
const SHENZHEN_LON_RANGE = [113.76, 114.62];

const SHENZHEN_LOCATIONS = [
  { name: '南山区', lat: 22.5311, lon: 113.9335 },
  { name: '福田区', lat: 22.5431, lon: 114.0579 },
  { name: '罗湖区', lat: 22.5487, lon: 114.1306 },
  { name: '宝安区', lat: 22.5534, lon: 113.8833 },
  { name: '龙岗区', lat: 22.7215, lon: 114.2743 },
  { name: '龙华区', lat: 22.6905, lon: 114.0328 },
  { name: '光明区', lat: 22.7616, lon: 113.9388 },
  { name: '坪山区', lat: 22.687, lon: 114.353 },
  { name: '盐田区', lat: 22.556, lon: 114.2374 },
];

const CAR_STATUS = ['在线', '离线', '行驶中', '停车', '故障'];
const CAR_NAMES = [
  '比亚迪汉',
  '特斯拉Model 3',
  '小鹏P7',
  '蔚来ES6',
  '理想ONE',
  '广汽埃安S',
  '吉利几何A',
  '北汽EU5',
];

// 辅助函数
function md5(str: string): string {
  return crypto.createHash('md5').update(str).digest('hex');
}

function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

interface CarInfo {
  car_id: string;
  car_name: string;
  car_number: string;
  status: string;
  latitude: number;
  longitude: number;
  update_time: string;
  location_area: string;
}

interface TrajectoryInfo {
  trajectory_id: string;
  latitude: number;
  longitude: number;
  time: string;
  location_area: string;
  sequence: number;
}

function generateLatLon(
  baseLat?: number,
  baseLon?: number,
  offset: number = 0.01,
): [number, number] {
  let lat: number, lon: number;

  if (baseLat === undefined || baseLon === undefined) {
    const location =
      SHENZHEN_LOCATIONS[Math.floor(Math.random() * SHENZHEN_LOCATIONS.length)];
    baseLat = location.lat;
    baseLon = location.lon;
  }

  lat = baseLat + (Math.random() * 2 - 1) * offset;
  lon = baseLon + (Math.random() * 2 - 1) * offset;

  lat = Math.max(SHENZHEN_LAT_RANGE[0], Math.min(SHENZHEN_LAT_RANGE[1], lat));
  lon = Math.max(SHENZHEN_LON_RANGE[0], Math.min(SHENZHEN_LON_RANGE[1], lon));

  return [Number(lat.toFixed(6)), Number(lon.toFixed(6))];
}

function getCarId(carNumber: string): string {
  const hash = md5(carNumber);
  return `CAR_${hash.substring(0, 8).toUpperCase()}`;
}

function getCarStatus(carNumber: string): string {
  const hashVal = parseInt(md5(carNumber).substring(0, 8), 16);
  return CAR_STATUS[hashVal % CAR_STATUS.length];
}

function getCarName(carNumber: string): string {
  const hashVal = parseInt(md5(carNumber).substring(0, 8), 16);
  return CAR_NAMES[hashVal % CAR_NAMES.length];
}

// 工具定义

export const getCarInfoTool = tool(
  ({ car_number }: { car_number: string }) => {
    const carId = getCarId(car_number);
    const carName = getCarName(car_number);
    const status = getCarStatus(car_number);

    const hashVal = parseInt(md5(car_number).substring(0, 8), 16);
    const locationIdx = hashVal % SHENZHEN_LOCATIONS.length;
    const baseLocation = SHENZHEN_LOCATIONS[locationIdx];

    const timeOffset = hashVal % 60;
    const locationTime = new Date(Date.now() - timeOffset * 60 * 1000);

    const [lat, lon] = generateLatLon(baseLocation.lat, baseLocation.lon, 0.02);

    const result = {
      componentId: 'CarMap',
      data: {
        data: {
          car_id: carId,
          car_name: carName,
          car_number: car_number,
          status: status,
          latitude: lat,
          longitude: lon,
          location_time: formatDate(locationTime),
          location_area: baseLocation.name,
        },
      },
    };

    return JSON.stringify(result);
  },
  {
    name: 'get_car_info',
    description: '获取车辆信息',
    schema: z.object({
      car_number: z.string().describe('车牌号，例如：粤B12345'),
    }),
  },
);

export const getCarListTool = tool(
  ({
    customer_id,
    customer_name,
  }: {
    customer_id?: string;
    customer_name?: string;
  }) => {
    let seed = 'default';
    if (customer_id) seed = customer_id;
    else if (customer_name) seed = customer_name;

    const hashVal = parseInt(md5(seed).substring(0, 8), 16);
    const carCount = 3 + (hashVal % 8);

    const carList: CarInfo[] = [];
    for (let i = 0; i < carCount; i++) {
      const plateSeed = `${seed}_${i}`;
      const plateHash = parseInt(md5(plateSeed).substring(0, 8), 16);

      const plateNum = plateHash % 100000;
      const carNumber = `粤B${plateNum.toString().padStart(5, '0')}`;

      const carId = getCarId(carNumber);
      const carName = getCarName(carNumber);
      const status = getCarStatus(carNumber);

      const locationIdx = (plateHash + i) % SHENZHEN_LOCATIONS.length;
      const baseLocation = SHENZHEN_LOCATIONS[locationIdx];
      const [lat, lon] = generateLatLon(
        baseLocation.lat,
        baseLocation.lon,
        0.03,
      );

      const timeOffset = plateHash % 60;
      const updateTime = new Date(Date.now() - timeOffset * 60 * 1000);

      carList.push({
        car_id: carId,
        car_name: carName,
        car_number: carNumber,
        status: status,
        latitude: lat,
        longitude: lon,
        update_time: formatDate(updateTime),
        location_area: baseLocation.name,
      });
    }

    const result = {
      componentId: 'CarList',
      data: {
        data: carList,
        total: carList.length,
      },
    };

    return JSON.stringify(result);
  },
  {
    name: 'get_car_list',
    description: '获取车辆列表',
    schema: z.object({
      customer_id: z.string().optional().describe('客户ID'),
      customer_name: z.string().optional().describe('客户名称'),
    }),
  },
);

export const getCarTrajectoryListTool = tool(
  ({ car_number }: { car_number: string }) => {
    const hashVal = parseInt(md5(car_number).substring(0, 8), 16);
    const pointCount = 10 + (hashVal % 21);

    const startLocationIdx = hashVal % SHENZHEN_LOCATIONS.length;
    let currentLocation = SHENZHEN_LOCATIONS[startLocationIdx];

    const trajectoryList: TrajectoryInfo[] = [];
    const baseTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago

    let currentLat = currentLocation.lat;
    let currentLon = currentLocation.lon;

    for (let i = 0; i < pointCount; i++) {
      const trajectoryId = `TRJ_${getCarId(car_number)}_${(i + 1)
        .toString()
        .padStart(3, '0')}`;
      const moveHash = parseInt(md5(`${car_number}_${i}`).substring(0, 8), 16);

      let offset = 0.02;
      if (i < Math.floor(pointCount / 3)) {
        offset = 0.015;
      } else if (i < Math.floor((2 * pointCount) / 3)) {
        offset = 0.025;
        if (moveHash % 3 === 0) {
          const nextLocationIdx =
            (startLocationIdx + (moveHash % 3)) % SHENZHEN_LOCATIONS.length;
          currentLocation = SHENZHEN_LOCATIONS[nextLocationIdx];
        }
      }

      const [lat, lon] = generateLatLon(currentLat, currentLon, offset);

      currentLat = lat;
      currentLon = lon;

      const timeInterval = 3 + (moveHash % 8);
      const pointTime = new Date(
        baseTime.getTime() + i * timeInterval * 60 * 1000,
      );

      let minDistance = Infinity;
      let locationArea = currentLocation.name;

      for (const loc of SHENZHEN_LOCATIONS) {
        const distance = Math.sqrt(
          Math.pow(lat - loc.lat, 2) + Math.pow(lon - loc.lon, 2),
        );
        if (distance < minDistance) {
          minDistance = distance;
          locationArea = loc.name;
        }
      }

      trajectoryList.push({
        trajectory_id: trajectoryId,
        latitude: lat,
        longitude: lon,
        time: formatDate(pointTime),
        location_area: locationArea,
        sequence: i + 1,
      });
    }

    const result = {
      componentId: 'CarTrack',
      data: {
        data: trajectoryList,
        total: trajectoryList.length,
        car_number: car_number,
        start_time: trajectoryList.length > 0 ? trajectoryList[0].time : null,
        end_time:
          trajectoryList.length > 0
            ? trajectoryList[trajectoryList.length - 1].time
            : null,
      },
    };

    return JSON.stringify(result);
  },
  {
    name: 'get_car_trajectory_list',
    description: '获取车辆轨迹列表',
    schema: z.object({
      car_number: z.string().describe('车牌号，例如：粤B12345'),
    }),
  },
);
