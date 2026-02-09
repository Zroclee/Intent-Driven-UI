let loading: Promise<any> | null = null;

export function loadRemoteUI(): Promise<any> {
	if ((window as any).RemoteUI) {
		return Promise.resolve((window as any).RemoteUI);
	}

	if (!loading) {
		loading = new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = "http://localhost:3001/remote/v1/ui.js";
			script.async = true;

			script.onload = () => {
				resolve((window as any).RemoteUI);
			};

			script.onerror = reject;
			document.head.appendChild(script);
		});
	}

	return loading;
}
