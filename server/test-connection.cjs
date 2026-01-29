require("dotenv").config();

console.log("🔧 Environment Variables Check:");
console.log(
  "   MONGODB_URI:",
  process.env.MONGODB_URI ? "✅ Found" : "❌ Missing",
);
console.log("   PORT:", process.env.PORT || "Not set");
console.log("");

if (process.env.MONGODB_URI) {
  console.log(
    "Full URI:",
    process.env.MONGODB_URI.replace(/sachin123/, "****"),
  );
} else {
  console.log("❌ .env file not loaded properly");
  console.log("   Current directory:", process.cwd());
  console.log(
    "   Looking for .env at:",
    require("path").join(process.cwd(), ".env"),
  );
}
