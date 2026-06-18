import mongoose from "mongoose";

const VisitSchema = new mongoose.Schema(
  {
    portfolioOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    // Useful metadata for premium SaaS metrics
    browser: { type: String, default: "Unknown" },
    country: { type: String, default: "Unknown" },
  },
  { timestamps: false }
);

// 🔥 CRITICAL FOR PRODUCTION: Compound index for blazing fast aggregation filtering
VisitSchema.index({ portfolioOwnerId: 1, timestamp: -1 });

export const Visit = mongoose.models.Visit || mongoose.model("Visit", VisitSchema);