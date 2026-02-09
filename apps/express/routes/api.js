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

module.exports = router;
