import Notification from "../models/Notification.js";
import { getIO } from "../config/socket.js";

export const createNotificationService = async ({
  recipientId,
  type,
  title,
  message,
  relatedId = null,
}) => {
  try {
    // Save notification in MongoDB first.
    const notification =
      await Notification.create({
        recipientId,
        type,
        title,
        message,
        relatedId,
      });

    // Get Socket.IO instance.
    const io = getIO();

    // Send notification only to the intended user.
    io.to(recipientId.toString()).emit(
      "new-notification",
      notification,
    );

    return notification;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const viewMyNotificationsService = async (
  userId,
) => {
  try {
    const notifications =
      await Notification.find({
        recipientId: userId,
      }).sort({
        createdAt: -1,
      });

    return notifications;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const viewUnreadNotificationsService =
  async (userId) => {
    try {
      const notifications =
        await Notification.find({
          recipientId: userId,
          isRead: false,
        }).sort({
          createdAt: -1,
        });

      return notifications;
    } catch (error) {
      throw new Error(error.message);
    }
  };

export const markNotificationReadService =
  async (
    notificationId,
    userId,
  ) => {
    try {
      const notification =
        await Notification.findOne({
          _id: notificationId,
          recipientId: userId,
        });

      if (!notification) {
        throw new Error(
          "Notification not found",
        );
      }

      notification.isRead = true;

      await notification.save();

      return notification;
    } catch (error) {
      throw new Error(error.message);
    }
  };

export const markAllNotificationsReadService =
  async (userId) => {
    try {
      await Notification.updateMany(
        {
          recipientId: userId,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        },
      );

      return {
        success: true,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };