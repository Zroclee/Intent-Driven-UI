const path = require("path");
const router = require("express").Router();

router.get("/ui.js", (req, res) => {
	const filePath = path.join(__dirname, "../remote/remote-ui.umd.js");
	res.setHeader("Content-Type", "application/javascript; charset=utf-8");
	res.sendFile(filePath);
});

module.exports = router;
