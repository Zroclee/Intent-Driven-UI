const express = require("express");
const cors = require("cors");

const apiRouter = require("./routes/api");
// const remoteRouter = require("./routes/remote");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello from Express server!");
});

app.use("/api/v1", apiRouter);
// app.use("/remote/v1", remoteRouter);

app.listen(3001, () => {
	console.log("Server running at http://localhost:3001 (Nodemon active)");
});
