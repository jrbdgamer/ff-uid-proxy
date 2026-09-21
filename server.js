const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const API_KEY = process.env.GAMESKINBO_API_KEY;


// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FF UID Proxy is running",
    endpoints: {
      account: "/api/account?uid=2840232092&region=BD",
      usage: "/api/usage"
    }
  });
});


// ===============================
// GAMES KINBO USAGE TEST
// ===============================

app.get("/api/usage", async (req, res) => {

  try {

    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        error: "GAMESKINBO_API_KEY is missing"
      });
    }

    const response = await fetch(
      "https://api.gameskinbo.com/api/usage",
      {
        method: "GET",
        headers: {
          "x-api-key": API_KEY,
          "Accept": "application/json"
        }
      }
    );

    const rawText = await response.text();

    let data;

    try {
      data = JSON.parse(rawText);
    } catch {
      data = {
        raw: rawText
      };
    }

    console.log(
      "Games Kinbo Usage Status:",
      response.status
    );

    return res.status(response.status).json(data);

  } catch (error) {

    console.error(
      "USAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Could not connect to Games Kinbo",
      message: error.message
    });

  }

});


// ===============================
// FREE FIRE ACCOUNT API
// ===============================

app.get("/api/account", async (req, res) => {

  try {

    const uid =
      String(req.query.uid || "").trim();

    const region =
      String(req.query.region || "BD")
        .trim()
        .toUpperCase();


    // UID required

    if (!uid) {

      return res.status(400).json({
        success: false,
        error: "UID is required"
      });

    }


    // Numbers only

    if (!/^[0-9]+$/.test(uid)) {

      return res.status(400).json({
        success: false,
        error: "UID must contain numbers only",
        received_uid: uid
      });

    }


    // API key check

    if (!API_KEY) {

      return res.status(500).json({
        success: false,
        error: "GAMESKINBO_API_KEY is missing"
      });

    }


    // Games Kinbo URL

    const apiURL =
      "https://api.gameskinbo.com/ff-info/get" +
      "?uid=" +
      encodeURIComponent(uid) +
      "&region=" +
      encodeURIComponent(region);


    console.log("--------------------------------");
    console.log("UID:", uid);
    console.log("REGION:", region);
    console.log("Calling Games Kinbo API...");


    const response = await fetch(
      apiURL,
      {
        method: "GET",
        headers: {
          "x-api-key": API_KEY,
          "Accept": "application/json"
        }
      }
    );


    const rawText =
      await response.text();


    console.log(
      "Games Kinbo Status:",
      response.status
    );


    let data;

    try {

      data =
        JSON.parse(rawText);

    } catch {

      data = null;

    }


    // API error

    if (!response.ok) {

      console.error(
        "Games Kinbo Error:",
        rawText
      );

      return res.status(response.status).json({

        success: false,

        error:
          (data &&
            (data.error ||
             data.message)) ||
          "Games Kinbo API error",

        api_status:
          response.status,

        api_response:
          data || rawText

      });

    }


    // Success

    return res.json({

      success: true,

      data: data

    });


  } catch (error) {

    console.error(
      "SERVER ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      error:
        "Could not connect to Games Kinbo API",

      message:
        error.message

    });

  }

});


// ===============================
// START SERVER
// ===============================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      "FF UID Proxy running on port " +
      PORT
    );

  }
);
