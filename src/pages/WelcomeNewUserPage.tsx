 import React from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition";

export default function WelcomeNewUserPage() {
  return (
    <PageTransition>
      <div className="welcomeNewPage" dir="rtl">
        <div className="welcomeCard">
          <img
            src="/almohseen logo.png"
            alt="Saudi Logo"
            className="welcomeLogo"
          />

          <div className="welcomeBadge">حيّاكم الله أسرة المحسن </div>

          <h1 className="welcomeTitle">
            نشتغل من أجلكم، علشان تكون عندكم منصة عائلية تليق فيكم
          </h1>

          <p className="welcomeText">
            بياناتكم وصلت وانحفظت عندنا، وحنا الآن جالسين نرتّبها ونجهّزها بالشكل
            اللي يخدمكم صح. هدفنا يكون عندكم مكان واحد يجمع العائلة، يسهّل
            الوصول للمعلومة، ويرتب لكم كل شيء بصورة مرتبة وفخمة وبسيطة.
          </p>

          <p className="welcomeText soft">
            شويّة وقت بس، وإن شاء الله تشوفون منصة تشرح الصدر وتخدم احتياجكم
            بالشكل اللي يبيض الوجه.
          </p>

          <div className="welcomeActions">
            <Link to="/login" className="btnPrimary">
              انهج لتسجيل الدخول
            </Link>

            
          </div>
        </div>
      </div>
    </PageTransition>
  );
}