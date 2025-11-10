import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { isPast, subMinutes } from "date-fns";

import { useBookmarkStore } from "@/store/bookmarkStore";
import { useReactConfStore } from "@/store/reactConfStore";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { formatSession } from "@/utils/sessions";
import { Session } from "@/types";
import { differenceInMinutes } from "date-fns";

export function useBookmark() {
  const toggleBookmarked = useBookmarkStore((state) => state.toggleBookmarked);
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const setReminderOffset = useBookmarkStore((state) => state.setReminderOffset);
  const allSessions = useReactConfStore((state) => state.allSessions);

  const scheduleNotification = async (
    session: Session,
    offsetMinutes: number,
  ) => {
    const whenToNotify = subMinutes(new Date(session.startsAt), offsetMinutes);

    if (isPast(whenToNotify)) {
      return undefined;
    }

    const status = await registerForPushNotificationsAsync();

    if (status === "granted") {
      return Notifications.scheduleNotificationAsync({
        content: {
          title: `"${session.title}" starts in ${offsetMinutes} minutes`,
          data: {
            url: `/talk/${session.id}`,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: whenToNotify,
        },
      });
    }
  };

  const toggleBookmark = async (session: Session, withHaptics = true) => {
    if (Platform.OS !== "web" && withHaptics) {
      Haptics.selectionAsync();
    }

    const currentBookmark = bookmarks.find((b) => b.sessionId === session.id);
    // If session starts sooner than our default offset, schedule at start time (offset 0)
    const minutesUntilStart = Math.max(
      0,
      differenceInMinutes(new Date(session.startsAt), new Date()),
    );
    const offset =
      currentBookmark?.offsetMinutes ?? (minutesUntilStart < 10 ? 0 : 10);

    if (currentBookmark) {
      // Remove bookmark and cancel notification
      if (currentBookmark.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(
          currentBookmark.notificationId,
        );
      }
      toggleBookmarked(session.id);
    } else {
      // Add bookmark and schedule notification
      const notificationId = await scheduleNotification(session, offset);
      toggleBookmarked(session.id, notificationId, offset);
    }
  };

  const isBookmarked = (sessionId: string) => {
    return bookmarks.some((b) => b.sessionId === sessionId);
  };

  const getBookmark = (sessionId: string) => {
    return bookmarks.find((b) => b.sessionId === sessionId);
  };

  const getSessionById = (sessionId: string): Session | undefined => {
    const apiSession = allSessions.sessions.find(
      (session) => session.id === sessionId,
    );
    if (apiSession) {
      return formatSession(apiSession, allSessions);
    }
    return undefined;
  };

  const toggleBookmarkById = async (sessionId: string, withHaptics = true) => {
    const session = getSessionById(sessionId);
    if (session) {
      await toggleBookmark(session, withHaptics);
    }
  };

  return {
    toggleBookmark,
    toggleBookmarkById,
    isBookmarked,
    getBookmark,
    getSessionById,
    bookmarks,
    setReminderOffset,
  };
}
