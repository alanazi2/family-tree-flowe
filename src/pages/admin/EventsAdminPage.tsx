import React, { useEffect, useState } from "react";
import PageTransition from "../../components/ui/PageTransition";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { createEvent, deleteEvent, listEvents } from "../../lib/db";
import {
  FaMapMarkedAlt,
  FaTrashAlt,
  FaCalendarAlt,
  FaGlobe,
} from "react-icons/fa";

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  event_date: string;
  event_time?: string | null;
  location?: string | null;
  is_public: boolean;
};

function buildMapLink(location?: string | null) {
  if (!location) return null;

  const value = location.trim();
  if (!value) return null;

  const isUrl =
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.includes("google.com/maps") ||
    value.includes("maps.app.goo.gl");

  if (isUrl) return value;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    value
  )}`;
}

function shortLocationText(location?: string | null) {
  if (!location) return "";
  const text = location.trim();
  if (text.length <= 70) return text;
  return text.slice(0, 70) + "...";
}

export default function EventsAdminPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const rows = await listEvents();
      setEvents(rows as EventItem[]);
    } catch (e) {
      console.error(e);
      alert("تعذر تحميل الفعاليات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !eventDate) {
      alert("أدخل عنوان الفعالية وتاريخها");
      return;
    }

    try {
      setBusy(true);

      await createEvent({
        title: title.trim(),
        description: description.trim() || null,
        event_date: eventDate,
        event_time: eventTime.trim() || null,
        location: location.trim() || null,
        is_public: isPublic,
      });

      setTitle("");
      setDescription("");
      setEventDate("");
      setEventTime("");
      setLocation("");
      setIsPublic(true);

      await load();
      alert("تمت إضافة الفعالية بنجاح");
    } catch (e) {
      console.error(e);
      alert("تعذر إضافة الفعالية");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    const ok = window.confirm("هل أنت متأكد من حذف الفعالية؟");
    if (!ok) return;

    try {
      await deleteEvent(id);
      await load();
      alert("تم حذف الفعالية");
    } catch (e) {
      console.error(e);
      alert("تعذر حذف الفعالية");
    }
  }

  return (
    <PageTransition>
      <div className="dashboardWrap adminEventsPage">
        <div className="adminPageHeader">
          <h1 className="pageTitle">إدارة الفعاليات</h1>
          <p className="muted">
            أضف الفعالية وحدد التاريخ والمكان، وستظهر مباشرة للناس في الصفحة العامة.
          </p>
        </div>

        <div className="adminEventsGrid">
          <AnimatedCard title="إضافة فعالية جديدة" subtitle="بيانات المناسبة">
            <form className="form" onSubmit={onCreate}>
              <label className="label">عنوان الفعالية</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: عيد آل محسن"
              />

              <label className="label">الوصف</label>
              <textarea
                className="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب وصفًا مختصرًا للفعالية"
              />

              <label className="label">التاريخ</label>
              <input
                className="input"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />

              <label className="label">الوقت</label>
              <input
                className="input"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="مثال: بعد صلاة المغرب"
              />

              <label className="label">الموقع أو رابط الخرائط</label>
              <input
                className="input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="ألصق رابط Google Maps أو اكتب اسم الموقع"
              />

              {location.trim() ? (
                <a
                  className="btnGhost previewMapBtn"
                  href={buildMapLink(location) ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaMapMarkedAlt /> معاينة الموقع
                </a>
              ) : null}

              <label className="label">هل تظهر للعامة؟</label>
              <select
                className="select"
                value={isPublic ? "yes" : "no"}
                onChange={(e) => setIsPublic(e.target.value === "yes")}
              >
                <option value="yes">نعم</option>
                <option value="no">لا</option>
              </select>

              <button className="btnPrimary" disabled={busy} type="submit">
                {busy ? "جاري الحفظ..." : "إضافة الفعالية"}
              </button>
            </form>
          </AnimatedCard>

          <AnimatedCard title="الفعاليات الحالية" subtitle="فتح الموقع أو حذف الفعالية">
            {loading ? (
              <div className="muted">جاري التحميل...</div>
            ) : events.length === 0 ? (
              <div className="muted">لا توجد فعاليات حالياً.</div>
            ) : (
              <div className="adminEventsList">
                {events.map((event) => {
                  const mapLink = buildMapLink(event.location);

                  return (
                    <div key={event.id} className="adminEventCard">
                      <div className="adminEventTop">
                        <div className="adminEventTitleWrap">
                          <div className="adminEventTitle">{event.title}</div>
                          <div className="adminEventMeta">
                            <span>
                              <FaCalendarAlt style={{ marginLeft: 6 }} />
                              {event.event_date}
                            </span>
                            {event.event_time ? <span>• {event.event_time}</span> : null}
                            <span>• {event.is_public ? "عام" : "خاص"}</span>
                          </div>
                        </div>

                        <div className="adminEventBadge">
                          <FaGlobe />
                        </div>
                      </div>

                      {event.location ? (
                        <div className="adminEventLocation">
                          الموقع: {shortLocationText(event.location)}
                        </div>
                      ) : null}

                      {event.description ? (
                        <div className="adminEventDescription">{event.description}</div>
                      ) : null}

                      <div className="adminEventActions">
                        {mapLink ? (
                          <a
                            className="btnGhost eventActionBtn"
                            href={mapLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FaMapMarkedAlt /> فتح الموقع
                          </a>
                        ) : null}

                        <button
                          className="btnDanger eventActionBtn"
                          type="button"
                          onClick={() => onDelete(event.id)}
                        >
                          <FaTrashAlt /> حذف الفعالية
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
}

    