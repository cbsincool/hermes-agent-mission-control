"use client";

import { useEffect, useState } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  agentId: string | null;
  startTime: string;
  endTime: string | null;
  recurrence: string | null;
  source: string;
  status: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calendar/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEvents(data.events);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSourceEmoji = (source: string) => {
    switch (source) {
      case "hermes-cron":
        return "⏰";
      case "google-calendar":
        return "📅";
      default:
        return "📌";
    }
  };

  return (
    <div className="p-8 max-w-[1000px] mx-auto">
      <h1 className="text-[32px] font-semibold tracking-[-0.02em] mb-2">Calendar</h1>
      <p className="text-[var(--ink-2)] mb-8">
        Scheduled work across all your agents. Wire this to whatever scheduling system you prefer
        (Google Calendar, a cron table, your own db model).
      </p>

      {loading ? (
        <div
          className="p-8 rounded-xl text-center text-[var(--ink-3)]"
          style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        >
          Loading...
        </div>
      ) : events.length === 0 ? (
        <div
          className="p-8 rounded-xl text-center text-[var(--ink-3)]"
          style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        >
          <p className="mb-4">No scheduled events yet.</p>
          <p className="text-sm">
            Run the sync script to import your Hermes Cron tasks.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-4 rounded-xl flex items-start gap-4"
              style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
            >
              <div className="text-2xl">{getSourceEmoji(event.source)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium text-[14px]">{event.title}</div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider"
                    style={{
                      background: event.status === "scheduled" ? "var(--accent)" : "var(--line)",
                      color: event.status === "scheduled" ? "#000" : "var(--ink-3)",
                    }}
                  >
                    {event.status}
                  </span>
                </div>
                {event.description && (
                  <div className="text-[12px] text-[var(--ink-3)] mb-2">
                    {event.description}
                  </div>
                )}
                <div className="flex items-center gap-4 text-[12px] text-[var(--ink-3)]">
                  <div>🕐 {formatDateTime(event.startTime)}</div>
                  {event.endTime && (
                    <div>→ {formatDateTime(event.endTime)}</div>
                  )}
                  {event.recurrence && (
                    <div>🔁 {event.recurrence}</div>
                  )}
                  {event.agentId && (
                    <div>🤖 {event.agentId}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
