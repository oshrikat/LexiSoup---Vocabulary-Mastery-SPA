# 🍲 LexiSoup — מערכת עתידנית לשינון מילים מובלע (Implicit Vocabulary Mastery)

> **פילוסופיית הליבה**: "החבאת ירקות במרק טעים" (Implicit Learning) — במקום כרטיסיות שינון משעממות, המערכת מציעה סשנים מהירים ומלאי אדרנלין של 5-10 דקות יומיות עם תרחישים עסקיים/טכנולוגיים אמיתיים. המוח סופג את המילים וההקשרים שלהן באופן בלתי מודע, כך שהשימוש בהן הופך לטבעי לחלוטין.

---

## ⚡ הוראות הפעלה מהירה (Quick Start)

האפליקציה בנויה כ-Single Page Application (SPA) מתקדמת, קלת משקל ואפס-תלויות (Vanilla JS/CSS3/HTML5). **אין צורך ב-npm install, build step או שרת מיוחד!**

### אפשרות א': הפעלה מקומית ישירה (Zero-Setup)
1. חלץ את קובץ ה-ZIP של הפרויקט לכל תיקייה במחשב.
2. לחץ לחיצה כפולה על קובץ `index.html` לפתיחתו בכל דפדפן מודרני (Chrome, Edge, Brave, Safari, Firefox).
3. **המערכת מוכנה מיד לפעולה!** 300 מילות ה-Advanced Corporate English מהקובץ Burlington English כבר מוטענות במערכת עם תרחישים מלאים.

### אפשרות ב': הפעלה באמצעות שרת סטטי מקומי (מומלץ למפתחים)
בטרמינל בתוך תיקיית הפרויקט:
```bash
# באמצעות Python
python3 -m http.server 8080

# או באמצעות Node.js
npx serve .
```
גש בדפדפן אל: `http://localhost:8080`

### אפשרות ג': פריסה מהירה ל-GitHub Pages
1. פתח מאגר (Repository) חדש ב-GitHub.
2. דחוף את כל קבצי הפרויקט ל-branch הראשי (`main`):
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of LexiSoup"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/lexisoup.git
   git push -u origin main
   ```
3. בהגדרות המאגר ב-GitHub: עבור אל **Settings** > **Pages** > בחר Source: **Deploy from a branch** ובחר `main` / `root`.
4. האפליקציה תהיה באוויר תוך דקה בכתובת ציבורית עם תמיכת HTTPS מלאה!

---

## 🎮 מיני-גיימס ומנגנוני גיימיפיקציה

1. **סווייפ הקשרים (Context Swipe — בסגנון טינדר)**:
   - מוצג משפט אמיתי מעולם ההייטק/תאגידים באנגלית שבו משובצת המילה.
   - החלק ימינה (או לחץ על חץ ימינה במקלדת / כפתור ירוק) אם המילה משמשת בהקשר תקני ומדויק.
   - החלק שמאלה (או חץ שמאלה במקלדת / כפתור אדום) אם יש סתירה לשונית או משמעות מעוותת.
   - הסבר מנומק בעברית נחשף מיידית להבנת הדקויות.

2. **סימולטור צ'אט ארגוני (Corporate SMS / Slack Chat)**:
   - הדמיית ממשק סמארטפון מודרני של שיחה דחופה עם דמויות מפתח (CTO, Tech Lead, Product Lead).
   - הודעה מגיעה עם מקום ריק `[ _______ ]`. על המשתמש לבחור תוך שניות מבין 4 כפתורי תגובה מהירה את המילה המתאימה ביותר כדי לשמור על מקצועיות.

3. **פצצת זמן ונרדפים (Time-Bomb Synonym Blitz)**:
   - פצצה מתקתקת עם פתיל בוער שנשרף תוך 15 שניות לצלילי תקתוק מואץ.
   - על השחקן להתאים את המונח או הנרדף הנכון לפני שהפצצה מתפוצצת כדי לזכות בבונוס מהירות מיוחד.

4. **ספרינט יומי ממוקד (5-10 דקות)**:
   - משלב את כל המיני-גיימס ברצף מהיר.
   - כולל מונה נקודות, מד רצף הצלחות (Combo Multipliers של x1.5, x2.0, x3.0), וטיימר מוגדר מראש לשמירה על אנרגיה גבוהה.

5. **סבב שיפור ציון (Mistake Recovery Round)**:
   - מנגנון המבודד אוטומטית שגיאות קודמות ומילים עם רמת מאסטרי נמוכה (מתחת ל-60%) לתרגול ממוקד שמחזיר נקודות ומבסס זיכרון לטווח ארוך.

6. **ממשק משתמש אדפטיבי (Adaptive Cyber Glow)**:
   - צבעי התאורה הניאוניים והאפקטים החזותיים משתנים בזמן אמת לפי ביצועי המשתמש:
     - תכלת סייברברי (`#00f0ff`) — מצב שגרה רגוע.
     - ירוק אמרלד זוהר (`#00ff9d`) — בעת רצף הצלחות גבוה (God-mode streak).
     - סגול חשמלי (`#b026ff`) — שילוב קומבו מתקדם.
     - כתום אזהרה (`#ff5e00`) — בעת רצף טעויות לריכוז מוגבר.

---

## 🏛️ סיור ארכיטקטוני למפתחים (Architectural Walkthrough)

הקוד תוכנן בקפידה לפי עקרונות **Separation of Concerns (SoC)** ו-**Clean Architecture**:

```
lexisoup/
├── index.html                   # עוגן יחיד (Single Page Root)
├── README.md                    # תיעוד ארכיטקטוני והוראות
├── css/
│   ├── main.css                 # משתני עיצוב, טיפוגרפיה, רשת ועיצוב כללי
│   ├── animations.css           # אנימציות CSS3 טהורות (סווייפ, פצצה, דופק)
│   ├── components.css           # כפתורים, מודאלים, שדות קלט ובארים
│   └── games.css                # סגנונות ייעודיים לכל מיני-גיים
└── js/
    ├── app.js                   # Bootstrapper, Dependency Injector & Routing
    ├── data/
    │   └── defaultVocab.js      # מאגר ברירת מחדל מועשר (300 מילות תאגידים)
    ├── models/
    │   ├── Word.js              # ישות מילה, סטטיסטיקות, חישוב SM-2
    │   ├── GameSession.js       # ניהול מצב משחק, ניקוד, טיימר וקומבו
    │   └── UserProfile.js       # ניהול פרופיל שחקן, XP, דרגות והגדרות
    ├── storage/
    │   ├── StorageInterface.js  # חוזה אבסטרקטי לשכבת השמירה
    │   ├── LocalStorageAdapter.js # יישום סינכרוני מהיר
    │   └── IndexedDBAdapter.js  # יישום אסינכרוני של מסד נתונים מקומי
    ├── services/
    │   ├── AudioService.js      # סינתיסייזר צלילים עצמאי (Web Audio API)
    │   ├── SpacedRepetitionService.js # אלגוריתם תזמון חזרות Leitner/SM-2
    │   ├── FileParserService.js # מפענח טקסט ו-PDF מקומי בדפדפן
    │   ├── AIService.js         # Facade מופשט לחיבור שירותי LLM
    │   └── providers/
    │       ├── BaseLLMProvider.js   # מחלקת בסיס לספקי מודלים
    │       ├── GeminiProvider.js    # יישום Google Gemini v1beta JSON schema
    │       ├── GroqProvider.js      # יישום Groq Cloud Llama-3
    │       └── LocalRuleProvider.js # מנוע כללים מקומי ללא צורך במפתח
    ├── controllers/
    │   ├── GameController.js    # ניהול זרימת המשחק, אירועי תשובה, שינוי עיצוב
    │   ├── VocabController.js   # ניהול המאגר, חיפוש, סינון והעלאת קבצים
    │   └── SettingsController.js # ניהול הגדרות, מפתחות ובדיקות חיבור
    └── views/
        ├── BaseView.js          # מחלקת בסיס לתצוגה
        ├── DashboardView.js     # לוח בקרה ראשי, מדדים ומשגר ספרינט
        ├── SwipeGameView.js     # תצוגת סווייפ כרטיסיות ומחוות גרירה
        ├── ChatGameView.js      # תצוגת סימולציית סמארטפון וצ'אט
        ├── TimeBombGameView.js  # תצוגת פצצה מתקתקת ונרדפים
        ├── VocabListView.js     # תצוגת מילון, סינון והשמעת הגייה
        ├── UploadModalView.js   # מודאל גרירת קבצים עם טרמינל לוגים
        ├── SettingsModalView.js # מודאל הגדרות API ומודל
        └── ViewCoordinator.js   # תיאום בין התצוגות, עדכון HUD עליון
```

### 1. הפשטת שירות ה-AI (AI Service Abstraction)
- המחלקה `AIService` פועלת כ-**Facade & Factory**.
- כל ספק LLM יורש מ-`BaseLLMProvider` ומממש שתי מתודות עיקריות:
  - `parseAndGenerateVocab(rawText, onProgress)`
  - `testConnection()`
- **GeminiProvider**: שולח בקשות ל-`https://generativelanguage.googleapis.com/v1beta/models/...:generateContent` עם `response_mime_type: "application/json"` ומקבל מבנה מובנה לחלוטין של כרטיסיות סווייפ, תרחישי צ'אט ונרדפים.
- **מעבר קל ל-Groq / ספק אחר**: רוצה להחליף מודל או ספק? פשוט בחר ב-SettingsModalView את Groq (או הוסף Provider חדש בשורות קוד בודדות) — שאר האפליקציה (הבקרים, המודלים וה-UI) אינה מודעת כלל לספק הספציפי.

### 2. שכבת האחסון המקומי (Decoupled Storage Layer)
- מוגדרת תחת `StorageInterface`.
- `IndexedDBAdapter` מספק מסד נתונים מקומי מלא בדפדפן (Stores: `vocabulary`, `sessions`, `keyval`).
- כולל מנגנון Fallback אוטומטי ל-`LocalStorageAdapter` במקרים שבהם הדפדפן מגביל IndexedDB (למשל בחלון גלישה בסתר).

### 3. מנוע האודיו הדיגיטלי (Web Audio API)
- `AudioService.js` אינו טוען קבצי mp3/wav חיצוניים. הוא מייצר את כל הצלילים (צ'יימס נכונים, באס טעות, סווייפ, תקתוק פצצה ופיצוץ) מתמטית באמצעות אוסילטורים בזמן אמת.
- עובד 100% אופליין באפס latency.

---

## 🔑 שימוש במפתח Gemini API

1. לחץ על סמל גלגל השיניים (⚙️) בפינה העליונה.
2. הדבק את מפתח ה-Gemini API שלך (הוא נשמר בבטחה רק ב-LocalStorage של הדפדפן שלך).
3. לחץ על **בדוק חיבור API 📡** כדי לאמת שהמפתח פעיל.
4. כעת תוכל ללחוץ על סמל התיקייה (📁) ולהעלות כל קובץ PDF או TXT חדש של מילים — ה-AI ייצר עבורו אוטומטית שאלות הקשר ותרחישי צ'אט!
