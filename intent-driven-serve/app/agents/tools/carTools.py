import json
import random
import hashlib
from datetime import datetime, timedelta
from langchain_core.tools import tool

# 深圳市经纬度范围
# 纬度: 22.43°N - 22.87°N
# 经度: 113.76°E - 114.62°E
SHENZHEN_LAT_RANGE = (22.43, 22.87)
SHENZHEN_LON_RANGE = (113.76, 114.62)

# 深圳主要区域坐标（用于生成更真实的坐标）
SHENZHEN_LOCATIONS = [
    {"name": "南山区", "lat": 22.5311, "lon": 113.9335},
    {"name": "福田区", "lat": 22.5431, "lon": 114.0579},
    {"name": "罗湖区", "lat": 22.5487, "lon": 114.1306},
    {"name": "宝安区", "lat": 22.5534, "lon": 113.8833},
    {"name": "龙岗区", "lat": 22.7215, "lon": 114.2743},
    {"name": "龙华区", "lat": 22.6905, "lon": 114.0328},
    {"name": "光明区", "lat": 22.7616, "lon": 113.9388},
    {"name": "坪山区", "lat": 22.6870, "lon": 114.3530},
    {"name": "盐田区", "lat": 22.5560, "lon": 114.2374},
]

# 车辆状态列表
CAR_STATUS = ['在线', '离线', '行驶中', '停车', '故障']

# 车辆名称列表
CAR_NAMES = ['比亚迪汉', '特斯拉Model 3', '小鹏P7', '蔚来ES6', '理想ONE', '广汽埃安S', '吉利几何A', '北汽EU5']


def generate_lat_lon(base_lat=None, base_lon=None, offset=0.01):
    """生成深圳市内的经纬度坐标

    Args:
        base_lat: 基准纬度，如果为None则随机选择
        base_lon: 基准经度，如果为None则随机选择
        offset: 偏移量（度），默认0.01度约1km
    """
    if base_lat is None or base_lon is None:
        # 随机选择一个深圳区域
        location = random.choice(SHENZHEN_LOCATIONS)
        base_lat = location['lat']
        base_lon = location['lon']

    # 在基准坐标附近生成偏移
    lat = base_lat + random.uniform(-offset, offset)
    lon = base_lon + random.uniform(-offset, offset)

    # 确保坐标在深圳范围内
    lat = max(SHENZHEN_LAT_RANGE[0], min(SHENZHEN_LAT_RANGE[1], lat))
    lon = max(SHENZHEN_LON_RANGE[0], min(SHENZHEN_LON_RANGE[1], lon))

    return round(lat, 6), round(lon, 6)


def get_car_id(car_number: str) -> str:
    """根据车牌号生成唯一的车辆ID"""
    hash_obj = hashlib.md5(car_number.encode())
    return f"CAR_{hash_obj.hexdigest()[:8].upper()}"


def get_car_status(car_number: str) -> str:
    """根据车牌号生成确定的车辆状态"""
    hash_val = int(hashlib.md5(car_number.encode()).hexdigest()[:8], 16)
    return CAR_STATUS[hash_val % len(CAR_STATUS)]


def get_car_name(car_number: str) -> str:
    """根据车牌号生成确定的车辆名称"""
    hash_val = int(hashlib.md5(car_number.encode()).hexdigest()[:8], 16)
    return CAR_NAMES[hash_val % len(CAR_NAMES)]


@tool('get_car_info', description='获取车辆信息')
def get_car_info(car_number: str) -> str:
    """获取车辆信息。

    参数：
    - car_number: 车牌号，例如：粤B12345

    返回格式：
    {
        "code": 200,
        "data": {
            "car_id": "车辆ID",
            "car_name": "车辆名称",
            "car_number": "车牌号",
            "status": "车辆状态",
            "latitude": "纬度",
            "longitude": "经度",
            "location_time": "位置更新时间"
        }
    }
    """
    # 生成车辆信息
    car_id = get_car_id(car_number)
    car_name = get_car_name(car_number)
    status = get_car_status(car_number)

    # 根据车牌号生成确定的坐标（同一车牌号每次生成相同坐标）
    hash_val = int(hashlib.md5(car_number.encode()).hexdigest()[:8], 16)
    location_idx = hash_val % len(SHENZHEN_LOCATIONS)
    base_location = SHENZHEN_LOCATIONS[location_idx]

    # 生成时间偏移
    time_offset = (hash_val % 60)  # 0-59分钟前
    location_time = (datetime.now() - timedelta(minutes=time_offset)).strftime('%Y-%m-%d %H:%M:%S')

    # 生成坐标
    lat, lon = generate_lat_lon(base_location['lat'], base_location['lon'], offset=0.02)

    result = {
        "code": 200,
        "data": {
            "car_id": car_id,
            "car_name": car_name,
            "car_number": car_number,
            "status": status,
            "latitude": lat,
            "longitude": lon,
            "location_time": location_time,
            "location_area": base_location['name']  # 所在区域
        },
        "componentName": 'CarMap'
    }

    return json.dumps(result, ensure_ascii=False, indent=2)


# info = get_car_info.invoke('粤B12345')
# print(info)

@tool('get_car_list', description='获取车辆列表')
def get_car_list(customer_id: str = None, customer_name: str = None) -> str:
    """获取车辆列表。

    参数：
    - customer_id: 客户ID（可选）
    - customer_name: 客户名称（可选）

    返回格式：
    {
        "code": 200,
        "data": [
            {
                "car_id": "车辆ID",
                "car_name": "车辆名称",
                "car_number": "车牌号",
                "status": "状态",
                "latitude": "纬度",
                "longitude": "经度",
                "update_time": "更新时间"
            }
        ]
    }
    """
    # 根据客户ID或名称生成车辆数量（3-10辆）
    if customer_id:
        seed = customer_id
    elif customer_name:
        seed = customer_name
    else:
        seed = "default"

    hash_val = int(hashlib.md5(seed.encode()).hexdigest()[:8], 16)
    car_count = 3 + (hash_val % 8)  # 3-10辆车

    # 生成车牌号（使用客户相关的种子）
    car_list = []
    for i in range(car_count):
        # 生成车牌号：粤B + 随机5位数字/字母
        plate_seed = f"{seed}_{i}"
        plate_hash = int(hashlib.md5(plate_seed.encode()).hexdigest()[:8], 16)

        # 生成车牌号
        plate_num = plate_hash % 100000
        car_number = f"粤B{plate_num:05d}"

        car_id = get_car_id(car_number)
        car_name = get_car_name(car_number)
        status = get_car_status(car_number)

        # 生成坐标
        location_idx = (plate_hash + i) % len(SHENZHEN_LOCATIONS)
        base_location = SHENZHEN_LOCATIONS[location_idx]
        lat, lon = generate_lat_lon(base_location['lat'], base_location['lon'], offset=0.03)

        # 生成更新时间（最近1小时内）
        time_offset = plate_hash % 60
        update_time = (datetime.now() - timedelta(minutes=time_offset)).strftime('%Y-%m-%d %H:%M:%S')

        car_list.append({
            "car_id": car_id,
            "car_name": car_name,
            "car_number": car_number,
            "status": status,
            "latitude": lat,
            "longitude": lon,
            "update_time": update_time,
            "location_area": base_location['name']
        })

    result = {
        "code": 200,
        "data": car_list,
        "total": len(car_list),
        "componentName": 'CarList'
    }

    return json.dumps(result, ensure_ascii=False, indent=2)


# list = get_car_list.invoke('深圳桃子二手车公司')
# print(list)


@tool('get_car_trajectory_list', description='获取车辆轨迹列表')
def get_car_trajectory_list(car_number: str) -> str:
    """获取车辆轨迹列表。

    参数：
    - car_number: 车牌号，例如：粤B12345

    返回格式：
    {
        "code": 200,
        "data": [
            {
                "trajectory_id": "轨迹ID",
                "latitude": "纬度",
                "longitude": "经度",
                "time": "时间",
                "location_area": "所在区域"
            }
        ]
    }
    """
    # 根据车牌号生成固定的轨迹点数量和起始位置
    hash_val = int(hashlib.md5(car_number.encode()).hexdigest()[:8], 16)

    # 轨迹点数量：10-30个点
    point_count = 10 + (hash_val % 21)

    # 选择起始区域
    start_location_idx = hash_val % len(SHENZHEN_LOCATIONS)
    current_location = SHENZHEN_LOCATIONS[start_location_idx]

    # 生成轨迹点（模拟车辆移动）
    trajectory_list = []
    base_time = datetime.now() - timedelta(hours=2)  # 从2小时前开始

    # 初始坐标
    current_lat, current_lon = current_location['lat'], current_location['lon']

    for i in range(point_count):
        # 生成轨迹ID
        trajectory_id = f"TRJ_{get_car_id(car_number)}_{i+1:03d}"

        # 模拟车辆移动：每次移动到一个新的区域方向
        move_hash = int(hashlib.md5(f"{car_number}_{i}".encode()).hexdigest()[:8], 16)

        # 计算移动方向和距离
        if i < point_count // 3:
            # 前1/3：在起始区域附近
            offset = 0.015
        elif i < 2 * point_count // 3:
            # 中间1/3：向相邻区域移动
            offset = 0.025
            # 偶尔切换到相邻区域
            if move_hash % 3 == 0:
                next_location_idx = (start_location_idx + move_hash % 3) % len(SHENZHEN_LOCATIONS)
                current_location = SHENZHEN_LOCATIONS[next_location_idx]
        else:
            # 后1/3：在另一个区域
            offset = 0.02

        # 生成新坐标
        lat, lon = generate_lat_lon(current_lat, current_lon, offset=offset)

        # 更新当前坐标
        current_lat = lat
        current_lon = lon

        # 生成时间点（每隔几分钟）
        time_interval = 3 + (move_hash % 8)  # 3-10分钟间隔
        point_time = (base_time + timedelta(minutes=i * time_interval)).strftime('%Y-%m-%d %H:%M:%S')

        # 确定所在区域
        min_distance = float('inf')
        location_area = current_location['name']
        for loc in SHENZHEN_LOCATIONS:
            distance = ((lat - loc['lat']) ** 2 + (lon - loc['lon']) ** 2) ** 0.5
            if distance < min_distance:
                min_distance = distance
                location_area = loc['name']

        trajectory_list.append({
            "trajectory_id": trajectory_id,
            "latitude": lat,
            "longitude": lon,
            "time": point_time,
            "location_area": location_area,
            "sequence": i + 1  # 轨迹序号
        })

    result = {
        "code": 200,
        "data": trajectory_list,
        "total": len(trajectory_list),
        "car_number": car_number,
        "start_time": trajectory_list[0]['time'] if trajectory_list else None,
        "end_time": trajectory_list[-1]['time'] if trajectory_list else None,
        "componentName": 'CarTrack'
    }

    return json.dumps(result, ensure_ascii=False, indent=2)


# traj = get_car_trajectory_list.invoke('粤B12345')
# print(traj)