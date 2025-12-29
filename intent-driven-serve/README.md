# Python + FastAPI


## 项目依赖


使用以下命令直接安装 FastAPI 及所有可选依赖:
```
source .venv/bin/activate
pip install "fastapi[all]"
```
这会安装：
- fastapi - FastAPI 框架
- uvicorn[standard] - ASGI 服务器
- python-multipart - 表单和文件上传支持
- jinja2 - 模板引擎
- python-jose - JWT 令牌支持
- passlib - 密码哈希
- bcrypt - 密码加密
- python-dotenv - 环境变量支持v

## 项目启动
```
source .venv/bin/activate

python3 ./main.py
```