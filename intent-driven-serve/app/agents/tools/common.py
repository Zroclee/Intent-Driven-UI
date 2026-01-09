from langchain_core.tools import tool
from datetime import datetime, timezone
import json


# 获取当前时间
@tool('get_current_time', description='获取当前时间，格式为：YYYY-MM-DD HH:mm:ss')
def get_current_time(fmt: str = "%Y-%m-%d %H:%M:%S", tz: str = "local") -> str:
    """获取当前时间。
    可选参数：
    - fmt: 时间格式化字符串，默认 "%Y-%m-%d %H:%M:%S"
    - tz: 时区，"UTC" 或 "local"，默认 "local"
    返回格式化后的当前时间字符串。
    """
    if tz == "UTC":
        dt = datetime.now(timezone.utc)
    else:
        dt = datetime.now()

    dt_str = {
        "code": 200,
        "data": dt.strftime(fmt)
    }
    return json.dumps(dt_str)

