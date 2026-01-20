import os
import pathlib

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
