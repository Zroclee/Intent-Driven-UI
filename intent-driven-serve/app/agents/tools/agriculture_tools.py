"""
智慧农业贷后监管工具函数
提供农业基地监测数据的挡板数据，包括气象监测、土壤监测、水质监测、设备列表、肉牛列表、监控视频等
"""

import json
import random
import hashlib
from datetime import datetime, timedelta
from langchain_core.tools import tool

# 农业基地配置
AGRICULTURE_BASES = {
    "智慧茶园": {
        "base_id": "AG_BASE_001",
        "base_type": "茶园",
        "device_count": 8,
        "device_types": ["气象监测", "土壤监测", "监控摄像头"]
    },
    "芒果园": {
        "base_id": "AG_BASE_002",
        "base_type": "芒果园",
        "device_count": 6,
        "device_types": ["气象监测", "土壤监测", "监控摄像头"]
    },
    "油橄榄基地": {
        "base_id": "AG_BASE_003",
        "base_type": "油橄榄基地",
        "device_count": 10,
        "device_types": ["气象监测", "土壤监测", "水质监测", "监控摄像头"]
    },
    "智慧肉牛基地": {
        "base_id": "AG_BASE_004",
        "base_type": "智慧肉牛基地",
        "device_count": 12,
        "device_types": ["监控摄像头", "温度传感器", "喂食器"]
    }
}

# 设备状态
DEVICE_STATUS = ['在线', '离线', '故障']

# 监测状态
MONITOR_STATUS = ['正常', '异常', '离线']

# 肉牛品种
CATTLE_BREEDS = ['西门塔尔牛', '安格斯牛', '夏洛莱牛', '利木赞牛', '秦川牛']

# 肉牛健康状态
CATTLE_HEALTH = ['健康', '生病', '治疗中']


def get_base_info(base_name: str):
    """获取基地基础信息"""
    return AGRICULTURE_BASES.get(base_name)


def generate_device_id(base_name: str, device_type: str, index: int) -> str:
    """生成设备ID"""
    hash_val = hashlib.md5(f"{base_name}_{device_type}_{index}".encode()).hexdigest()[:8].upper()
    return f"DEV_{hash_val}"


def get_device_status(base_name: str, device_id: str) -> str:
    """根据基地和设备ID生成确定的设备状态"""
    hash_val = int(hashlib.md5(f"{base_name}_{device_id}".encode()).hexdigest()[:8], 16)
    return DEVICE_STATUS[hash_val % len(DEVICE_STATUS)]


def get_monitor_status(base_name: str, monitor_type: str) -> str:
    """生成监测状态"""
    hash_val = int(hashlib.md5(f"{base_name}_{monitor_type}".encode()).hexdigest()[:8], 16)
    # 80%概率返回正常，15%返回异常，5%返回离线
    rand_val = hash_val % 100
    if rand_val < 80:
        return "正常"
    elif rand_val < 95:
        return "异常"
    else:
        return "离线"


@tool('get_weather_monitor', description='获取气象监测数据')
def get_weather_monitor(base_name: str) -> str:
    """获取气象监测数据。

    参数：
    - base_name: 农业基地名称，例如："智慧茶园"、"芒果园"、"油橄榄基地"

    返回格式：
    {
        "code": 200,
        "data": {
            "base_name": "基地名称",
            "base_id": "基地ID",
            "temperature": "温度（℃）",
            "humidity": "湿度（%）",
            "wind_speed": "风速（m/s）",
            "rainfall": "降雨量（mm）",
            "air_pressure": "大气压（hPa）",
            "co2": "二氧化碳浓度（ppm）",
            "update_time": "数据更新时间",
            "monitor_status": "监测状态（正常/异常/离线）"
        },
        "componentName": "WeatherMonitor"
    }
    """
    base_info = get_base_info(base_name)
    if not base_info:
        return json.dumps({
            "code": 404,
            "message": f"未找到基地：{base_name}"
        }, ensure_ascii=False)

    # 生成监测状态
    monitor_status = get_monitor_status(base_name, "weather")

    # 根据基地生成固定的气象数据
    hash_val = int(hashlib.md5(f"{base_name}_weather".encode()).hexdigest()[:8], 16)

    # 气象数据范围
    temperature = 15 + (hash_val % 20)  # 15-35℃
    humidity = 50 + (hash_val % 40)  # 50-90%
    wind_speed = (hash_val % 10) / 2  # 0-4.5m/s
    rainfall = (hash_val % 5)  # 0-4mm
    air_pressure = 1000 + (hash_val % 30)  # 1000-1030hPa
    co2 = 350 + (hash_val % 100)  # 350-450ppm

    # 生成更新时间（最近30分钟内）
    time_offset = (hash_val % 30)
    update_time = (datetime.now() - timedelta(minutes=time_offset)).strftime('%Y-%m-%d %H:%M:%S')

    result = {
        "code": 200,
        "data": {
            "base_name": base_name,
            "base_id": base_info["base_id"],
            "temperature": round(temperature, 1),
            "humidity": humidity,
            "wind_speed": round(wind_speed, 1),
            "rainfall": rainfall,
            "air_pressure": air_pressure,
            "co2": co2,
            "update_time": update_time,
            "monitor_status": monitor_status
        },
        "componentName": "WeatherMonitor"
    }

    return json.dumps(result, ensure_ascii=False, indent=2)


@tool('get_soil_monitor', description='获取土壤监测数据')
def get_soil_monitor(base_name: str) -> str:
    """获取土壤监测数据。

    参数：
    - base_name: 农业基地名称，例如："智慧茶园"、"芒果园"、"油橄榄基地"

    返回格式：
    {
        "code": 200,
        "data": {
            "base_name": "基地名称",
            "base_id": "基地ID",
            "ph_value": "PH值",
            "soil_humidity": "土壤湿度（%）",
            "soil_temperature": "土壤温度（℃）",
            "nitrogen": "氮含量（mg/kg）",
            "phosphorus": "磷含量（mg/kg）",
            "potassium": "钾含量（mg/kg）",
            "update_time": "数据更新时间",
            "monitor_status": "监测状态（正常/异常/离线）"
        },
        "componentName": "SoilMonitor"
    }
    """
    base_info = get_base_info(base_name)
    if not base_info:
        return json.dumps({
            "code": 404,
            "message": f"未找到基地：{base_name}"
        }, ensure_ascii=False)

    # 生成监测状态
    monitor_status = get_monitor_status(base_name, "soil")

    # 根据基地生成固定的土壤数据
    hash_val = int(hashlib.md5(f"{base_name}_soil".encode()).hexdigest()[:8], 16)

    # 土壤数据范围
    ph_value = 5.5 + (hash_val % 25) / 10  # 5.5-8.0
    soil_humidity = 40 + (hash_val % 40)  # 40-80%
    soil_temperature = 10 + (hash_val % 20)  # 10-30℃
    nitrogen = 80 + (hash_val % 60)  # 80-140mg/kg
    phosphorus = 50 + (hash_val % 60)  # 50-110mg/kg
    potassium = 80 + (hash_val % 70)  # 80-150mg/kg

    # 生成更新时间（最近30分钟内）
    time_offset = (hash_val % 30)
    update_time = (datetime.now() - timedelta(minutes=time_offset)).strftime('%Y-%m-%d %H:%M:%S')

    result = {
        "code": 200,
        "data": {
            "base_name": base_name,
            "base_id": base_info["base_id"],
            "ph_value": round(ph_value, 1),
            "soil_humidity": soil_humidity,
            "soil_temperature": round(soil_temperature, 1),
            "nitrogen": nitrogen,
            "phosphorus": phosphorus,
            "potassium": potassium,
            "update_time": update_time,
            "monitor_status": monitor_status
        },
        "componentName": "SoilMonitor"
    }

    return json.dumps(result, ensure_ascii=False, indent=2)


@tool('get_water_quality_monitor', description='获取水质监测数据')
def get_water_quality_monitor(base_name: str) -> str:
    """获取水质监测数据（仅油橄榄基地支持）。

    参数：
    - base_name: 农业基地名称，仅支持"油橄榄基地"

    返回格式：
    {
        "code": 200,
        "data": {
            "base_name": "基地名称",
            "base_id": "基地ID",
            "water_temperature": "水温（℃）",
            "water_ph": "水质PH值",
            "conductivity": "电导率（μS/cm）",
            "ion_content": "离子含量（mg/L）",
            "turbidity": "水质浊度（NTU）",
            "update_time": "数据更新时间",
            "monitor_status": "监测状态（正常/异常/离线）"
        },
        "componentName": "WaterQualityMonitor"
    }
    """
    if base_name != "油橄榄基地":
        return json.dumps({
            "code": 400,
            "message": "水质监测功能仅支持油橄榄基地"
        }, ensure_ascii=False)

    base_info = get_base_info(base_name)

    # 生成监测状态
    monitor_status = get_monitor_status(base_name, "water")

    # 根据基地生成固定的水质数据
    hash_val = int(hashlib.md5(f"{base_name}_water".encode()).hexdigest()[:8], 16)

    # 水质数据范围
    water_temperature = 15 + (hash_val % 15)  # 15-30℃
    water_ph = 6.5 + (hash_val % 15) / 10  # 6.5-8.0
    conductivity = 200 + (hash_val % 400)  # 200-600μS/cm
    ion_content = 100 + (hash_val % 300)  # 100-400mg/L
    turbidity = (hash_val % 10) / 2  # 0-4.5NTU

    # 生成更新时间（最近30分钟内）
    time_offset = (hash_val % 30)
    update_time = (datetime.now() - timedelta(minutes=time_offset)).strftime('%Y-%m-%d %H:%M:%S')

    result = {
        "code": 200,
        "data": {
            "base_name": base_name,
            "base_id": base_info["base_id"],
            "water_temperature": round(water_temperature, 1),
            "water_ph": round(water_ph, 1),
            "conductivity": conductivity,
            "ion_content": ion_content,
            "turbidity": round(turbidity, 1),
            "update_time": update_time,
            "monitor_status": monitor_status
        },
        "componentName": "WaterQualityMonitor"
    }

    return json.dumps(result, ensure_ascii=False, indent=2)


@tool('get_device_list', description='获取设备列表')
def get_device_list(base_name: str) -> str:
    """获取设备列表。

    参数：
    - base_name: 农业基地名称，例如："智慧茶园"、"芒果园"、"油橄榄基地"

    返回格式：
    {
        "code": 200,
        "data": [
            {
                "device_id": "设备ID",
                "device_name": "设备名称",
                "device_type": "设备类型",
                "status": "设备状态（在线/离线/故障）",
                "last_active_time": "最后活跃时间",
                "location": "设备所在位置"
            }
        ],
        "total": "设备总数",
        "base_name": "基地名称",
        "componentName": "DeviceList"
    }
    """
    base_info = get_base_info(base_name)
    if not base_info:
        return json.dumps({
            "code": 404,
            "message": f"未找到基地：{base_name}"
        }, ensure_ascii=False)

    device_list = []
    device_types = base_info["device_types"]
    device_count = base_info["device_count"]

    # 为每种设备类型生成设备
    for device_type in device_types:
        # 计算该类型设备数量（平均分配）
        type_count = max(1, device_count // len(device_types))

        for i in range(type_count):
            device_id = generate_device_id(base_name, device_type, i)
            device_name = f"{base_name}-{device_type}-{i+1}号"

            # 获取设备状态
            status = get_device_status(base_name, device_id)

            # 生成最后活跃时间
            hash_val = int(hashlib.md5(f"{base_name}_{device_id}".encode()).hexdigest()[:8], 16)
            if status == "在线":
                time_offset = hash_val % 60  # 在线：最近1小时内
            elif status == "离线":
                time_offset = 60 + (hash_val % 720)  # 离线：1-13小时前
            else:
                time_offset = 720 + (hash_val % 4320)  # 故障：13小时-3天前

            last_active_time = (datetime.now() - timedelta(minutes=time_offset)).strftime('%Y-%m-%d %H:%M:%S')

            # 设备位置
            locations = ["东区", "西区", "南区", "北区", "中心区", "1号田", "2号田", "3号田"]
            location = locations[hash_val % len(locations)]

            device_list.append({
                "device_id": device_id,
                "device_name": device_name,
                "device_type": device_type,
                "status": status,
                "last_active_time": last_active_time,
                "location": location
            })

    result = {
        "code": 200,
        "data": device_list,
        "total": len(device_list),
        "base_name": base_name,
        "componentName": "DeviceList"
    }

    return json.dumps(result, ensure_ascii=False, indent=2)


@tool('get_cattle_list', description='获取肉牛列表')
def get_cattle_list(base_name: str = "智慧肉牛基地") -> str:
    """获取肉牛列表。

    参数：
    - base_name: 基地名称，默认为"智慧肉牛基地"

    返回格式：
    {
        "code": 200,
        "data": [
            {
                "cattle_id": "肉牛ID",
                "cattle_tag": "耳标号",
                "breed": "品种",
                "age": "年龄（月）",
                "weight": "体重（kg）",
                "health_status": "健康状态（健康/生病/治疗中）",
                "location": "当前位置",
                "last_feed_time": "最后喂食时间"
            }
        ],
        "total": "肉牛总数",
        "base_name": "基地名称",
        "componentName": "CattleList"
    }
    """
    if base_name != "智慧肉牛基地":
        return json.dumps({
            "code": 400,
            "message": "肉牛列表功能仅支持智慧肉牛基地"
        }, ensure_ascii=False)

    base_info = get_base_info(base_name)

    # 根据基地生成肉牛数量（20-50头）
    hash_val = int(hashlib.md5(base_name.encode()).hexdigest()[:8], 16)
    cattle_count = 20 + (hash_val % 31)  # 20-50头

    cattle_list = []
    for i in range(cattle_count):
        # 生成肉牛ID和耳标号
        cattle_hash = int(hashlib.md5(f"{base_name}_cattle_{i}".encode()).hexdigest()[:8], 16)
        cattle_id = f"CATTLE_{cattle_hash:08X}"
        cattle_tag = f"TAG{20240001 + i}"

        # 品种
        breed = CATTLE_BREEDS[cattle_hash % len(CATTLE_BREEDS)]

        # 年龄（12-60个月）
        age = 12 + (cattle_hash % 49)

        # 体重（300-800kg，与年龄相关）
        weight = 300 + int((age - 12) * 12) + (cattle_hash % 50)

        # 健康状态（90%健康，7%生病，3%治疗中）
        health_rand = cattle_hash % 100
        if health_rand < 90:
            health_status = "健康"
        elif health_rand < 97:
            health_status = "生病"
        else:
            health_status = "治疗中"

        # 当前位置
        locations = ["1号牛舍", "2号牛舍", "3号牛舍", "运动场", "隔离区"]
        if health_status == "治疗中":
            location = "隔离区"
        elif health_status == "生病":
            location = "3号牛舍"
        else:
            location = locations[cattle_hash % 3]

        # 最后喂食时间（最近4小时内）
        feed_offset = cattle_hash % 240
        last_feed_time = (datetime.now() - timedelta(minutes=feed_offset)).strftime('%Y-%m-%d %H:%M:%S')

        cattle_list.append({
            "cattle_id": cattle_id,
            "cattle_tag": cattle_tag,
            "breed": breed,
            "age": age,
            "weight": weight,
            "health_status": health_status,
            "location": location,
            "last_feed_time": last_feed_time
        })

    result = {
        "code": 200,
        "data": cattle_list,
        "total": len(cattle_list),
        "base_name": base_name,
        "componentName": "CattleList"
    }

    return json.dumps(result, ensure_ascii=False, indent=2)


@tool('get_monitor_video', description='获取监控视频链接')
def get_monitor_video(base_name: str) -> str:
    """获取监控视频链接。

    参数：
    - base_name: 农业基地名称，例如："智慧茶园"、"芒果园"、"智慧肉牛基地"

    返回格式：
    {
        "code": 200,
        "data": {
            "base_name": "基地名称",
            "video_url": "监控视频链接",
            "stream_url": "实时流媒体地址",
            "update_time": "视频更新时间",
            "camera_count": "摄像头数量"
        },
        "componentName": "MonitorVideo"
    }
    """
    base_info = get_base_info(base_name)
    if not base_info:
        return json.dumps({
            "code": 404,
            "message": f"未找到基地：{base_name}"
        }, ensure_ascii=False)

    # 生成摄像头数量（2-6个）
    hash_val = int(hashlib.md5(base_name.encode()).hexdigest()[:8], 16)
    camera_count = 2 + (hash_val % 5)

    # 生成视频链接
    video_url = f"https://example.com/monitor/{base_name}/video.mp4"
    stream_url = f"rtsp://stream.example.com/{base_name}/live"

    # 生成更新时间（当前时间）
    update_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    result = {
        "code": 200,
        "data": {
            "base_name": base_name,
            "video_url": video_url,
            "stream_url": stream_url,
            "update_time": update_time,
            "camera_count": camera_count
        },
        "componentName": "MonitorVideo"
    }

    return json.dumps(result, ensure_ascii=False, indent=2)


# 测试代码
if __name__ == "__main__":
    print("=== 气象监测测试 ===")
    print(get_weather_monitor.invoke("智慧茶园"))

    print("\n=== 土壤监测测试 ===")
    print(get_soil_monitor.invoke("智慧茶园"))

    print("\n=== 水质监测测试 ===")
    print(get_water_quality_monitor.invoke("油橄榄基地"))

    print("\n=== 设备列表测试 ===")
    print(get_device_list.invoke("智慧茶园"))

    print("\n=== 肉牛列表测试 ===")
    print(get_cattle_list.invoke())

    print("\n=== 监控视频测试 ===")
    print(get_monitor_video.invoke("智慧茶园"))
