import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import initialAllSessions from "@/data/allSessions.json";
import { ApiAllSessions, Session } from "@/types";
import { formatSessions } from "@/utils/sessions";
import * as Notifications from "expo-notifications";
import { subMinutes, isPast } from "date-fns";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { useBookmarkStore } from "./bookmarkStore";
import { formatSession } from "@/utils/sessions";

const doFetch = async (url: string) => {
  try {
    const result = await fetch(url);
    return await result.json();
  } catch {
    return null;
  }
};

type ConfState = {
  schedule: {
    dayOne: Session[];
    dayTwo: Session[];
  };
  allSessions: ApiAllSessions;
  isRefreshing?: boolean;
  lastRefreshed: string | null;
  refreshData: (options?: { ttlMs?: number }) => Promise<void>;
  shouldUseLocalTz: boolean;
  toggleLocalTz: () => void;
};

const getInitialSchedule = () => {
  const [dayOne, dayTwo] = formatSessions(initialAllSessions);
  return {
    schedule: {
      dayOne,
      dayTwo,
    },
    allSessions: initialAllSessions as ApiAllSessions,
  };
};

export const useReactConfStore = create(
  persist<ConfState>(
    (set, get) => ({
      ...getInitialSchedule(),
      isRefreshing: false,
      lastRefreshed: null,
      shouldUseLocalTz: false,
      refreshData: async (options) => {
        const ttlMs = options?.ttlMs || 0;
        const { isRefreshing, lastRefreshed } = get();

        // Bail out if already refreshing
        if (isRefreshing) {
          return;
        }

        // Bail out if last refresh was within TTL
        if (lastRefreshed) {
          const diff = new Date().getTime() - new Date(lastRefreshed).getTime();
          if (ttlMs && diff < ttlMs) {
            return;
          }
        }

        try {
          set({ isRefreshing: true });

          let allSessions = await doFetch(
            "https://sessionize.com/api/v2/7l5wob2t/view/All",
          );

          if (allSessions) {
            // DEV: Inject a couple of upcoming sessions to test notifications
            try {
              if (__DEV__) {
                const now = new Date();
                const mkIso = (d: Date) => d.toISOString();
                const addMinutes = (d: Date, m: number) =>
                  new Date(d.getTime() + m * 60_000);
                const addSeconds = (d: Date, s: number) =>
                  new Date(d.getTime() + s * 1000);
                const room = allSessions.rooms?.[0];
                const speaker = allSessions.speakers?.[0];
                if (room && speaker) {
                  const baseId = `dev-${now.getTime()}`;
                  const devSessions = [
                    {
                      id: `${baseId}-1`,
                      title: "DEV: Notification test (starts in 30s)",
                      description:
                        "This is a development-only session to test reminders.",
                      startsAt: mkIso(addSeconds(now, 30)),
                      endsAt: mkIso(addMinutes(now, 20)),
                      isServiceSession: false,
                      speakers: [speaker.id],
                      roomId: room.id,
                    },
                    {
                      id: `${baseId}-2`,
                      title: "DEV: Notification test (starts in 90s)",
                      description:
                        "Quick test session to verify immediate notifications.",
                      startsAt: mkIso(addSeconds(now, 90)),
                      endsAt: mkIso(addMinutes(now, 25)),
                      isServiceSession: false,
                      speakers: [speaker.id],
                      roomId: room.id,
                    },
                  ];
                  allSessions = {
                    ...allSessions,
                    sessions: [...allSessions.sessions, ...devSessions],
                  };
                }
              }
            } catch {}

            const [dayOne, dayTwo] = formatSessions(allSessions);
            set({
              schedule: {
                dayOne,
                dayTwo,
              },
              allSessions,
              lastRefreshed: new Date().toISOString(),
            });
            // After data refresh, reschedule notifications for existing bookmarks
            try {
              const status = await registerForPushNotificationsAsync();
              if (status === "granted") {
                const { bookmarks, setBookmarkNotificationId } =
                  useBookmarkStore.getState();
                // Iterate bookmarks and reschedule
                await Promise.all(
                  bookmarks.map(async (b) => {
                    const apiSession = allSessions.sessions.find(
                      (s) => s.id === b.sessionId,
                    );
                    if (!apiSession) return;
                    const session: Session = formatSession(
                      apiSession as any,
                      allSessions as any,
                    );
                    // Cancel previous notification if any
                    if (b.notificationId) {
                      try {
                        await Notifications.cancelScheduledNotificationAsync(
                          b.notificationId,
                        );
                      } catch {}
                    }
                    const offset = b.offsetMinutes ?? 10;
                    const whenToNotify = subMinutes(
                      new Date(session.startsAt),
                      offset,
                    );
                    if (isPast(whenToNotify)) {
                      setBookmarkNotificationId(session.id, undefined);
                      return;
                    }
                    const newId = await Notifications.scheduleNotificationAsync({
                      content: {
                        title: `"${session.title}" starts in ${offset} minutes`,
                        data: { url: `/talk/${session.id}` },
                      },
                      trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: whenToNotify,
                      },
                    });
                    setBookmarkNotificationId(session.id, newId);
                  }),
                );
              }
            } catch {}
          }
        } catch (e) {
          console.warn(e);
        } finally {
          set({ isRefreshing: false });
        }
      },
      toggleLocalTz: () => {
        set((state) => ({ shouldUseLocalTz: !state.shouldUseLocalTz }));
      },
    }),
    {
      name: "react-conf-2025-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const { isRefreshing: _, ...dataToPersist } = state;
        return dataToPersist;
      },
    },
  ),
);
