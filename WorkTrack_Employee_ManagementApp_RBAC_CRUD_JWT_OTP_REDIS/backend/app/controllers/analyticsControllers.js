import {
  getAnalyticsOverviewService,
} from "../services/analyticsServices.js";

export const getAnalyticsOverviewController =
  async (req, res) => {
    try {
      const analytics =
        await getAnalyticsOverviewService(
          req.user,
        );

      return res.status(200).json({
        success: true,
        message:
          "Analytics fetched successfully",
        data: analytics,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };