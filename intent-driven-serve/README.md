# 意图识别UI - 后端服务
## 项目依赖
- fastapi - FastAPI 框架
- uvicorn[standard] - ASGI 服务器
- python-dotenv - 环境变量支持
- LangChain  - 智能体高级框架
- LangGraph  - 智能体底层框架
- pydantic

## 准备工作
1. 准备deepseek Api key
2. 根目录创建.env文件
3. 写入key：DEEPSEEK_API_KEY=你的api key

## 项目启动
```bash
# 1. 创建虚拟环境
python3 -m venv .venv
# 2. 启动虚拟环境
source .venv/bin/activate
# 3. 下载依赖库
pip install -r requirements.txt
# 4. 启动项目
python3 ./main.py
```
启动后再浏览器访问
http://localhost:8000/chat/agriculture?query=帮我评估芒果园的贷款风险
或
http://localhost:8000/chat/quickStart?query=帮我评估车辆粤B12345贷款风险

