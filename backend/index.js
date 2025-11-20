const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3001", // Your React frontend
    credentials: true,
  })
);
app.use(express.json());

// Database configuration
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

// Create PostgreSQL connection pool
const db = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    require: true,
  },
});

// Test database connection
const initializeDBAndServer = async () => {
  try {
    // Test connection
    await db.query("SELECT NOW()");
    console.log("Database connected successfully!");

    // Start server
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// ==================== API ENDPOINTS ====================

// 1. HEALTH CHECK - Updated to match PDF exactly
app.get("/healthz", (req, res) => {
  res.status(200).json({
    ok: true,
    version: "1.0",
  });
});

// 2. CREATE SHORT LINK - Changed from /generate to /api/links
app.post("/api/links", async (req, res) => {
  try {
    const { longurl, shortcode } = req.body;

    console.log("Received create request:", { longurl, shortcode });

    // Validate URL format
    try {
      new URL(longurl);
    } catch (error) {
      return res.status(400).json({
        error_msg: "Invalid URL format. Include http:// or https://",
      });
    }

    // Validate short code format (alphanumeric, 6-8 chars as per PDF) - FIXED THIS
    const codeRegex = /^[A-Za-z0-9]{6,8}$/;
    if (!codeRegex.test(shortcode)) {
      return res.status(400).json({
        error_msg:
          "Short code must be 6-8 characters, letters and numbers only",
      });
    }

    // Check if short code already exists
    const existing = await db.query(
      "SELECT * FROM links WHERE short_code = $1",
      [shortcode]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error_msg: `Short code '${shortcode}' already exists. Choose another.`,
      });
    }

    // Insert into database
    const result = await db.query(
      `INSERT INTO links (short_code, long_url, clicks, created_at, last_clicked_at) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [shortcode, longurl, 0, new Date(), null]
    );

    const newLink = result.rows[0];
    const shortUrl = `http://localhost:3000/${shortcode}`;

    console.log("Created new link:", newLink);

    res.status(201).json({
      success: true,
      shortUrl: shortUrl,
      short_code: shortcode, // Added for frontend compatibility
      id: newLink.id,
      message: "URL shortened successfully!",
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error_msg: "Internal server error. Please try again.",
    });
  }
});

// 3. LIST ALL LINKS - New endpoint as per PDF
app.get("/api/links", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM links ORDER BY created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get all links error:", error);
    res.status(500).json({ error_msg: "Failed to fetch links" });
  }
});

// 4. GET SINGLE LINK BY ID - Keep your original but add the PDF endpoint
app.get("/url/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM links WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error_msg: "Link not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get link stats error:", error);
    res.status(500).json({ error_msg: "Failed to fetch link stats" });
  }
});

// 5. GET SINGLE LINK BY SHORT CODE (STATS) - Changed from /stats/:shortcode to /api/links/:code
app.get("/api/links/:code", async (req, res) => {
  try {
    const { code } = req.params;

    console.log("Fetching stats for code:", code);

    const result = await db.query("SELECT * FROM links WHERE short_code = $1", [
      code,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error_msg: "Link not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get link stats error:", error);
    res.status(500).json({ error_msg: "Failed to fetch link stats" });
  }
});

// 6. DELETE LINK BY ID - Keep your original but add the PDF endpoint
app.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Deleting link with id:", id);

    const result = await db.query(
      "DELETE FROM links WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error_msg: "Link not found" });
    }

    console.log("Deleted link:", result.rows[0]);
    res.json({
      message: "Link deleted successfully",
      deletedLink: result.rows[0],
    });
  } catch (error) {
    console.error("Delete link error:", error);
    res.status(500).json({ error_msg: "Failed to delete link" });
  }
});

// 7. DELETE LINK BY CODE - New endpoint as per PDF
app.delete("/api/links/:code", async (req, res) => {
  try {
    const { code } = req.params;

    console.log("Deleting link with code:", code);

    const result = await db.query(
      "DELETE FROM links WHERE short_code = $1 RETURNING *",
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error_msg: "Link not found" });
    }

    console.log("Deleted link:", result.rows[0]);
    res.status(200).json({
      message: "Link deleted successfully",
      deletedLink: result.rows[0],
    });
  } catch (error) {
    console.error("Delete link error:", error);
    res.status(500).json({ error_msg: "Failed to delete link" });
  }
});

// 8. REDIRECT ENDPOINT - MAIN REDIRECT FUNCTIONALITY (No change needed)
app.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    console.log("Redirect request for code:", code);

    // First check if this is a valid short code
    const result = await db.query("SELECT * FROM links WHERE short_code = $1", [
      code,
    ]);

    if (result.rows.length === 0) {
      console.log("Short code not found:", code);
      return res.status(404).json({
        error_msg: "Short URL not found",
        message: `The short code '${code}' does not exist.`,
      });
    }

    const linkData = result.rows[0];
    const longUrl = linkData.long_url;

    console.log(`Redirecting ${code} to ${longUrl}`);
    console.log(`Previous clicks: ${linkData.clicks}`);

    // Update click count and last clicked time
    const updateResult = await db.query(
      "UPDATE links SET clicks = clicks + 1, last_clicked_at = NOW() WHERE short_code = $1 RETURNING *",
      [code]
    );

    const updatedLink = updateResult.rows[0];
    console.log(
      `Click counted for: ${code}, New click count: ${updatedLink.clicks}`
    );

    // Redirect to the long URL
    console.log(`Sending redirect to: ${longUrl}`);
    res.redirect(302, longUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    res.status(500).json({
      error_msg: "Server error during redirect",
      message: "Please try again later.",
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled Error:", error);
  res.status(500).json({
    error_msg: "Internal server error",
    message: "Something went wrong!",
  });
});

console.log("Backend initialization complete!");
