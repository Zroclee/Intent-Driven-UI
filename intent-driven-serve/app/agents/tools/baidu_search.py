from langchain_core.tools import BaseTool
import os, requests

class  BaiduSearchTool(BaseTool):
    """
    百度AI搜索工具
    使用百度千帆AI搜索引擎中进行搜索。
    """
    name: str = "baidu_search"
    description: str = "使用百度AI搜索获取网络信息，适用于获取最新新闻、事实性信息、当前事件、技术资讯等。输入应为搜索关键词。"
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._api_key = os.getenv("BAIDU_API_KEY", "")

        if not self._api_key:
            raise ValueError("BAIDU_API_KEY environment variable not set")
    
    def _run(self, query: str) -> str:
        """
        执行搜索操作
        :param query: 搜索关键词
        :return: 搜索结果
        """
        if not self._api_key:
            return "错误: 百度AI搜索API密钥未配置，请设置BAIDU_API_KEY环境变量。"

        print(f"启动百度AI搜索工具: {query}")

        try:
            search_url = "https://qianfan.baidubce.com/v2/ai_search/chat/completions"
            body = {
                "messages": [
                    {
                        "role": "user",
                        "content": query
                    }
                ],
                "search_source": "baidu_search_v2",
				"resource_type_filter": [
					{ "type": "web", "top_k": 5 },
					{ "type": "video", "top_k": 5 },
				],
            }
            headers = {
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json"
            }
            response = requests.post(
                search_url,
                json=body,
                headers=headers
            )
            response.raise_for_status()

             # 处理搜索结果
            results = response.json()

            if not results or "references" not in results or not results["references"]:
                return f'未找到与"{query}"相关的结果。'
            
            # # 提取搜索结果内容
            content_list = []
            for ref in results["references"]:
                if "content" in ref:
                    content_list.append(ref["content"])

            content = "\n".join(content_list)
            # print(f"搜索结果: {content}")
            print('搜索完成')
            return content
        except requests.RequestException as e:
            return f"搜索请求失败: {str(e)}"
        