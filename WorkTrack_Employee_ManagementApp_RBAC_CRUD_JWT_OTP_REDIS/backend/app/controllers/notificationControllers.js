import {
  viewMyNotificationsService,
  viewUnreadNotificationsService,
  markNotificationReadService,
  markAllNotificationsReadService,
} from "../services/notificationServices.js";

export const viewMyNotificationsController =
  async (req, res) => {
    try {
      const notifications =
        await viewMyNotificationsService(
          req.user._id,
        );

      return res.status(200).json({
        success: true,
        message:
          "Notifications fetched successfully",
        data: notifications,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

export const viewUnreadNotificationsController =
  async (req, res) => {
    try {
      const notifications =
        await viewUnreadNotificationsService(
          req.user._id,
        );

      return res.status(200).json({
        success: true,
        message:
          "Unread notifications fetched successfully",
        data: notifications,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

export const markNotificationReadController =
  async (req, res) => {
    try {
      const notification =
        await markNotificationReadService(
          req.params.notificationId,
          req.user._id,
        );

      return res.status(200).json({
        success: true,
        message:
          "Notification marked as read",
        data: notification,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

export const markAllNotificationsReadController =
  async (req, res) => {
    try {
      const result =
        await markAllNotificationsReadService(
          req.user._id,
        );

      return res.status(200).json({
        success: true,
        message:
          "All notifications marked as read",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };