const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// CORS - Allow Vercel frontend
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "https://your-frontend-app.vercel.app",
      "https://*.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
// Database configuration
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test database connection
db.query("SELECT NOW()")
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Database connection failed:", err));

// ==================== API ENDPOINTS ====================

// 1. HEALTH CHECK
app.get("/healthz", (req, res) => {
  res.status(200).json({
    ok: true,
    version: "1.0",
  });
});

// 2. CREATE SHORT LINK
app.post("/api/links", async (req, res) => {
  try {
    const { longurl, shortcode } = req.body;

    // Validate URL format
    try {
      new URL(longurl);
    } catch (error) {
      return res.status(400).json({
        error_msg: "Invalid URL format. Include http:// or https://",
      });
    }

    // Validate short code format
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

    res.status(201).json({
      success: true,
      short_code: shortcode,
      long_url: longurl,
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

// 3. LIST ALL LINKS
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

// 4. GET SINGLE LINK BY SHORT CODE
app.get("/api/links/:code", async (req, res) => {
  try {
    const { code } = req.params;

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

// 5. DELETE LINK BY CODE
app.delete("/api/links/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const result = await db.query(
      "DELETE FROM links WHERE short_code = $1 RETURNING *",
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error_msg: "Link not found" });
    }

    res.status(200).json({
      message: "Link deleted successfully",
      deletedLink: result.rows[0],
    });
  } catch (error) {
    console.error("Delete link error:", error);
    res.status(500).json({ error_msg: "Failed to delete link" });
  }
});

// 6. REDIRECT ENDPOINT
app.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const result = await db.query("SELECT * FROM links WHERE short_code = $1", [
      code,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error_msg: "Short URL not found",
        message: `The short code '${code}' does not exist.`,
      });
    }

    const linkData = result.rows[0];
    const longUrl = linkData.long_url;

    // Update click count
    await db.query(
      "UPDATE links SET clicks = clicks + 1, last_clicked_at = NOW() WHERE short_code = $1",
      [code]
    );

    res.redirect(302, longUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    res.status(500).json({
      error_msg: "Server error during redirect",
      message: "Please try again later.",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
