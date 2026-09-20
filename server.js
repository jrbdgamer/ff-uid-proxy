
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FF UID Proxy is running"
  });
});

app.get("/api/account", async (req, res) => {
  const uid = String(req.query.uid || "").trim();
  const region = String(req.query.region || "BD").trim();

  if (!uid) {
    return res.status(400).json({
      success: false,
      error: "UID is required"
    });
  }

  try {
    const apiURL =
      "https://free-ff-api-src-5plp.onrender.com/api/v1/account" +
      "?region=" + encodeURIComponent(region) +
      "&uid=" + encodeURIComponent(uid);

    const response = await fetch(apiURL);

    const text = await response.text();

    res.status(response.status).type("application/json").send(text);

  } catch (error) {
    console.error("API ERROR:", error);

    res.status(500).json({
      success: false,
      error: "Proxy error",
      message: error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("FF UID Proxy running on port " + PORT);
});
