import {
  useContext,
  useEffect,
} from "react";

import {
  useQueryClient,
} from "@tanstack/react-query";

import AuthContext from "../context/AuthContextValue";

import socket from "../socket/socket";

function NotificationSocket() {
  const {
    user,
  } = useContext(AuthContext);

  const queryClient =
    useQueryClient();

  useEffect(() => {
    /*
     * There is no authenticated user,
     * so there is no reason to maintain
     * a notification socket connection.
     */
    if (!user?._id) {
      return;
    }

    /*
     * Connect the socket after the user's
     * profile has been successfully loaded.
     */
    socket.connect();

    /*
     * Join the user's private notification room.
     *
     * The backend uses the user ID as the
     * Socket.IO room name.
     */
    socket.emit(
      "join-user-room",
      user._id,
    );

    /*
     * Listen for notifications created
     * by the backend.
     */
    const handleNewNotification =
      (notification) => {
        /*
         * Add the new notification to the
         * existing notification query cache.
         *
         * This makes the notification appear
         * immediately without another API request.
         */
        queryClient.setQueryData(
          ["my-notifications"],
          (oldNotifications = []) => {
            /*
             * Prevent duplicate notifications
             * if the same event is received again.
             */
            const alreadyExists =
              oldNotifications.some(
                (item) =>
                  item._id ===
                  notification._id,
              );

            if (alreadyExists) {
              return oldNotifications;
            }

            return [
              notification,
              ...oldNotifications,
            ];
          },
        );

        /*
         * Update the unread notification
         * cache if it has already been loaded.
         */
        queryClient.setQueryData(
          ["unread-notifications"],
          (oldNotifications = []) => {
            const alreadyExists =
              oldNotifications.some(
                (item) =>
                  item._id ===
                  notification._id,
              );

            if (alreadyExists) {
              return oldNotifications;
            }

            return [
              notification,
              ...oldNotifications,
            ];
          },
        );
      };

    socket.on(
      "new-notification",
      handleNewNotification,
    );

    /*
     * Cleanup when the authenticated user
     * changes or the component unmounts.
     */
    return () => {
      socket.off(
        "new-notification",
        handleNewNotification,
      );

      socket.disconnect();
    };
  }, [
    user?._id,
    queryClient,
  ]);

  /*
   * This component does not render UI.
   * It only manages the Socket.IO connection.
   */
  return null;
}

export default NotificationSocket;