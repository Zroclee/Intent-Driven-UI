import os
import pathlib
import re
import yaml

# 获取当前文件所在目录
current_dir = pathlib.Path(__file__).parent.absolute()

def load_prompt_from_markdown(file_name=None, file_path=None):
    """
    从Markdown文件中加载提示词
    
    Args:
        file_name: Markdown文件的名称（不含路径，将从prompts目录下查找）
        file_path: Markdown文件的完整路径（优先级高于file_name）
        
    Returns:
        str: Markdown文件的内容作为提示词
    """
    if file_path is None and file_name is None:
        raise ValueError("必须提供file_name或file_path参数")
    
    # 如果只提供了文件名，则在prompts目录下查找
    if file_path is None:
        # 如果文件名不包含.md后缀，则添加
        if not file_name.endswith('.md'):
            file_name = f"{file_name}.md"
        file_path = os.path.join(current_dir, file_name)
    
    # 读取文件内容
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    return content

# 预加载默认RAG提示词
carManager = load_prompt_from_markdown(file_name="carManager")
agriculture_manager = load_prompt_from_markdown(file_name="agriculture_manager")
core_manager = load_prompt_from_markdown(file_name="core_manager")


def _parse_frontmatter(content):
    """解析Markdown Frontmatter中的元数据"""
    if not content.startswith("---"):
        return {}
    
    try:
        # 找到第二个 --- 的位置（从第3个字符开始找）
        end_index = content.find("\n---", 3)
        if end_index != -1:
            frontmatter_str = content[3:end_index]
            # 使用 yaml.safe_load 解析元数据
            return yaml.safe_load(frontmatter_str) or {}
    except Exception:
        pass
        
    return {}


def create_core_prompt():
    """
    组装主管智能体提示词
    
    Returns:
        str: 组装好的主管智能体提示词
    """
    # 解析子智能体元数据
    agents = []
    # 遍历已加载的子智能体提示词
    for content in [agriculture_manager, carManager]:
        meta = _parse_frontmatter(content)
        if meta:
            agents.append(meta)
            
    # 构建子智能体描述列表
    agents_desc_list = []
    for agent in agents:
        name = agent.get('name', 'Unknown')
        description = agent.get('description', 'No description')
        agents_desc_list.append(f"- **{name}**: {description}")
    
    agents_info = "\n".join(agents_desc_list)
    
    prompt = f"""你是一个智能意图识别与分发助手（主管智能体）。你的主要职责是根据用户的输入，分析其意图，并根据以下子智能体的能力进行路由分发或信息补全。

### 可用子智能体及其能力
{agents_info}

### 你的功能与回复规则

请根据用户输入的内容，严格按照以下三种情况进行处理：

1. **意图不明确**
   - **触发条件**：用户输入的目标不清晰，或者无法明确匹配到上述任何一个子智能体。
   - **回复策略**：请简要介绍上述子智能体的功能，并引导用户进行选择。

2. **目标明确但缺乏必要数据**
   - **触发条件**：用户意图明确指向某个子智能体，但是**缺乏该子智能体执行任务所需的关键信息**（例如：农业基地名称 `base_name`、车牌号 `car_number`、客户姓名 `customer_name` 等，具体请参考各智能体的描述）。
   - **回复策略**：请返回提示信息，明确指出为了执行任务还需要用户提供哪些具体信息。

3. **目标明确且关键信息完整（路由）**
   - **触发条件**：用户意图明确，且已经提供了该子智能体所需的关键信息。
   - **回复策略**：请返回该子智能体的名称和用户的具体提问，格式为：`子智能体名称-用户提问：用户提问内容`（例如 `farm_agent-用户提问：xxx农业基地的贷款风险` 或 `car_agent-用户提问：粤B12345的违章记录`）。
   - **注意**：在此情况下，请严格按照上述格式返回，不要添加其他多余解释。
"""
    return prompt
