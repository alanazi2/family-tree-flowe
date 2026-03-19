import React, { useEffect, useState } from "react";
import PageTransition from "../../components/ui/PageTransition";
import AnimatedCard from "../../components/ui/AnimatedCard";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaSitemap,
  FaCalendarAlt,
  FaHandsHelping,
  FaArrowLeft,
  FaLandmark,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { listUpcomingEvents } from "../../lib/db";

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  event_date: string;
  event_time?: string | null;
  location?: string | null;
  is_public: boolean;
};

const services = [
  "توثيق شجرة العائلة وحفظ السجلات",
  "تنسيق المناسبات والاجتماعات الأسرية",
  "دعم الترابط وصلة الرحم بين أفراد الأسرة",
  "حصر البيانات والمعلومات العائلية",
  "التعريف بتاريخ الأسرة ورموزها",
  "إدارة الفعاليات والتكريمات العائلية",
];

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

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
}

export default function UserDashboardPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    async function loadEvents() {
      try {
        const rows = await listUpcomingEvents();
        setUpcomingEvents(rows as EventItem[]);
      } catch (e) {
        console.error(e);
      }
    }

    loadEvents();
  }, []);

  return (
    <PageTransition>
      <div className="dashboardWrap">
        <section className="heroPanel">
          <div className="heroContent">
            <div className="heroBadge">السجل الرسمي لأسرة </div>
            <h1 className="heroTitle">الـمـحسن</h1>
            <p className="heroText">
              منصة رسمية أنيقة لحفظ الامتداد الأسري، إدارة المناسبات، وتوثيق شجرة
              العائلة بصورة حديثة تليق باسم المحسن.
            </p>

            <div className="rowWrap">
              <Link className="btnPrimary" to="/tree/demo">
                <FaSitemap /> عرض الشجرة
              </Link>
              <Link className="btnGhost" to="/my-families">
                <FaArrowLeft /> العوائل
              </Link>
            </div>
          </div>

          <div className="heroStatBox">
            <div className="heroMiniCard">
              <span>السجل العائلي</span>
              <strong>رسمي · موثّق · متجدد</strong>
            </div>
            <div className="heroMiniCard">
              <span>الهوية</span>
              <strong>أبيض × ذهبي</strong>
            </div>
          </div>
        </section>

        <div className="grid3 compactGrid" style={{ marginTop: 18 }}>
          <AnimatedCard title="عدد الأفراد" subtitle="إحصائية عامة">
            <div className="statCard">
              <div className="statIcon">
                <FaUsers />
              </div>
              <div>
                <div className="statValue">248</div>
                <div className="muted">إجمالي الأفراد المسجلين</div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard title="عدد الفروع" subtitle="امتداد الأسرة">
            <div className="statCard">
              <div className="statIcon">
                <FaLandmark />
              </div>
              <div>
                <div className="statValue">12</div>
                <div className="muted">فروع وأسر متفرعة</div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard title="المناسبات القادمة" subtitle="أقرب الفعاليات">
            <div className="statCard">
              <div className="statIcon">
                <FaCalendarAlt />
              </div>
              <div>
                <div className="statValue">{upcomingEvents.length}</div>
                <div className="muted">فعاليات مجدولة قريبًا</div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        <div className="grid2 compactGrid" style={{ marginTop: 18 }}>
          <AnimatedCard title="المناسبات القادمة" subtitle="رزنامة الأسرة">
            <div className="listStack">
              {upcomingEvents.length === 0 ? (
                <div className="muted">لا توجد فعاليات قادمة حاليًا.</div>
              ) : (
                upcomingEvents.map((event) => {
                  const mapLink = buildMapLink(event.location);

                  return (
                    <div key={event.id} className="eventCardPro">
                      <div className="eventMain">
                        <div className="eventTitle">{event.title}</div>

                        <div className="eventMeta">
                          <span>{event.event_date}</span>
                          {event.event_time ? <span>• {event.event_time}</span> : null}
                        </div>

                        {event.description ? (
                          <div className="eventDescription">{event.description}</div>
                        ) : null}
                      </div>

                      <div className="eventActions">
                        <span className="eventBadge">قادم</span>

                        {mapLink ? (
                          <a
                            className="btnGhost mapBtn"
                            href={mapLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <FaMapMarkedAlt /> فتح الموقع
                          </a>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </AnimatedCard>

          <AnimatedCard title="الأرقام العامة" subtitle="ملخص سريع">
            <div className="numbersGrid">
              <div className="numberBox">
                <span>الأجيال الموثقة</span>
                <strong>9</strong>
              </div>
              <div className="numberBox">
                <span>الزيجات الموثقة</span>
                <strong>74</strong>
              </div>
              <div className="numberBox">
                <span>أحدث الإضافات</span>
                <strong>18</strong>
              </div>
              <div className="numberBox">
                <span>الخدمات النشطة</span>
                <strong>6</strong>
              </div>
            </div>
          </AnimatedCard>
        </div>

        <div style={{ marginTop: 18 }}>
          <AnimatedCard
            title="الخدمات التي تقدمها المكنصة"
            subtitle="خدمات تنظيمية وتوثيقية للأسرة"
            right={
              <span className="pillBadge">
                <FaHandsHelping /> خدمات الأسرة
              </span>
            }
          >
            <div className="servicesGrid">
              {services.map((service, index) => (
                <div key={index} className="serviceCard">
                  <div className="serviceIndex">{index + 1}</div>
                  <div className="serviceText">{service}</div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
}
