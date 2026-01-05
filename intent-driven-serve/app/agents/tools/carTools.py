from langchain_core.tools import tool


# 获取车辆列表
@tool('get_car_list', description='获取车辆列表') 
def get_car_list() -> str:
    """
    获取车辆列表。
    """
    return '["car1", "car2", "car3"]'

