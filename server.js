const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const FREE_FIRE_API =
  "https://free-ff-api-src-5plp.onrender.com/api/v1/account";

// Home test
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FF UID Proxy is running",
    endpoint: "/api/account?uid=2840232092&region=BD"
  });
});

// UID API + DEBUG
app.get("/api/account", async (req, res) => {
  const uid = String(req.query.uid || "").trim();
  const region = String(req.query.region || "BD").trim();

  if (!uid) {
    return res.status(400).json({
      success: false,
      error: "UID is required"
    });
  }

  if (!/^[0-9]+$/.test(uid)) {
    return res.status(400).json({
      success: false,
      error: "UID must contain numbers only"
    });
  }

  const apiURL =
    FREE_FIRE_API +
    "?region=" +
    encodeURIComponent(region) +
    "&uid=" +
    encodeURIComponent(uid);

  console.log("=================================");
  console.log("UID:", uid);
  console.log("REGION:", region);
  console.log("REQUEST URL:", apiURL);

  try {
    const response = await fetch(apiURL, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    const rawText = await response.text();

    console.log("STATUS:", response.status);
    console.log("RAW RESPONSE:");
    console.log(rawText);
    console.log("=================================");

    let parsedData = null;

    try {
      parsedData = JSON.parse(rawText);
    } catch (e) {
      parsedData = null;
    }

    res.status(200).json({
      proxy: true,
      uid: uid,
      region: region,
      upstream_status: response.status,
      upstream_ok: response.ok,
      upstream_json: parsedData,
      upstream_raw: rawText
    });

  } catch (error) {
    console.error("FETCH ERROR:", error);

    res.status(500).json({
      proxy: true,
      success: false,
      error: "Could not connect to Free Fire API",
      message: error.message,
      request_url: apiURL
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("FF UID Proxy running on port " + PORT);
});
