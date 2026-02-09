const router = require("express").Router();

router.get("/info", (req, res) => {
	res.json({
		code: 0,
		data: {
			name: "来自远程服务的业务数据",
			timestamp: Date.now(),
		},
	});
});

router.get("/customer/sign/list", (req, res) => {
	const { customerName } = req.query;
	const statuses = ["已签约", "签约中", "已解约"];

	const status = statuses[Math.floor(Math.random() * statuses.length)];
	const item = {
		id: i.toString(),
		customerCode: `CUST${20240000 + i}`,
		customerName: customerName,
		signTime: new Date(
			Date.now() - Math.floor(Math.random() * 10000000000)
		).toLocaleString(),
		signStatus: status,
	};
	const list = [item];

	res.json({
		data: {
			data: list,
		},
		componentId: "CustomerSignList",
	});
});

module.exports = router;
