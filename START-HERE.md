# איך להעלות את השרת לאינטרנט — מדריך צעד אחר צעד

מדריך זה מיועד לסטודנטים שמעולם לא העלו שרת לאינטרנט.
עקבי אחרי הצעדים בזהירות — צעד אחד בכל פעם.

---

## חלק א׳ — GitHub (העלאת הקוד)

### 1. פתיחת חשבון GitHub
1. היכנסי לאתר **github.com**
2. לחצי על **Sign up**
3. הזיני אימייל, סיסמה ושם משתמש
4. אשרי את האימייל שנשלח אלייך

### 2. יצירת Repository חדש
1. לחצי על כפתור **+** בפינה הימנית העליונה
2. בחרי **New repository**
3. בשדה **Repository name** כתבי: `smart-nursery-backend`
4. ודאי ש-**Public** מסומן
5. **אל** תסמני "Add a README file" (כבר יש לנו)
6. לחצי **Create repository**

### 3. חילוץ ה-ZIP והעלאת הקבצים
1. חלצי את קובץ ה-ZIP לתיקייה במחשב
2. בדף ה-Repository שנפתח, לחצי על הקישור **uploading an existing file**
3. גררי את **כל הקבצים והתיקיות** מתוך התיקייה שחילצת (חוץ מ-node_modules)
4. למטה בדף, בשדה "Commit changes", כתבי: `Initial commit`
5. לחצי **Commit changes**
6. המתיני שההעלאה תסתיים

### 4. בדיקה שהקבצים עלו
1. רפרשי את הדף
2. ודאי שאת רואה את הקבצים: `package.json`, `src/`, `prisma/`, `render.yaml` ועוד

---

## חלק ב׳ — בסיס נתונים (PostgreSQL)

נשתמש ב-**Supabase** — שירות חינמי שנותן בסיס נתונים PostgreSQL.

### 1. פתיחת חשבון Supabase
1. היכנסי לאתר **supabase.com**
2. לחצי **Start your project**
3. התחברי עם חשבון GitHub שלך

### 2. יצירת פרויקט חדש
1. לחצי **New project**
2. בשדה **Name** כתבי: `smart-nursery`
3. בשדה **Database Password** — בחרי סיסמה חזקה **ושמרי אותה בצד!**
4. ב-**Region** בחרי את האזור הקרוב אלייך
5. לחצי **Create new project**
6. המתיני כ-2 דקות עד שהפרויקט מוכן

### 3. קבלת Connection String
1. בתפריט השמאלי לחצי על **Project Settings** (גלגל שיניים)
2. לחצי על **Database**
3. גללי למטה ל-**Connection string**
4. בחרי בלשונית **URI**
5. העתיקי את הכתובת — היא נראית כך:
   ```
   postgresql://postgres.[project-id]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
6. החליפי `[YOUR-PASSWORD]` בסיסמה שבחרת בשלב 2
7. **שמרי את הכתובת הזו בצד — זה ה-DATABASE_URL שלך**

### 4. שמירת הכתובת בבטחה
- **לעולם** אל תשמרי את הכתובת הזו בקוד
- היא תוגדר כ-environment variable בשלב הבא
- אם מישהו מקבל את הכתובת הזו, הוא יכול לגשת לבסיס הנתונים שלך

---

## חלק ג׳ — Render (העלאת השרת)

### 1. פתיחת חשבון Render
1. היכנסי לאתר **render.com**
2. לחצי **Get Started for Free**
3. התחברי עם חשבון GitHub שלך

### 2. חיבור ל-GitHub
1. Render תבקש גישה ל-GitHub שלך — אשרי
2. בחרי האם לתת גישה לכל ה-Repositories או רק ל-`smart-nursery-backend`

### 3. יצירת Web Service
1. לחצי **New** → **Web Service**
2. בחרי **Build and deploy from a Git repository**
3. לחצי **Next**
4. מצאי את `smart-nursery-backend` ולחצי **Connect**

### 4. הגדרות ה-Service
מלאי את השדות הבאים:

| שדה | ערך |
|------|------|
| **Name** | `smart-nursery-api` |
| **Region** | בחרי אזור קרוב |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `npx prisma migrate deploy && npm start` |
| **Instance Type** | **Free** |

### 5. הגדרת משתני סביבה (Environment Variables)
גללי למטה ל-**Environment Variables** ולחצי **Add Environment Variable** עבור כל אחד:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | הכתובת מ-Supabase (מחלק ב׳ שלב 3) |
| `JWT_SECRET` | מחרוזת ארוכה ואקראית (לפחות 32 תווים) |
| `CORS_ORIGIN` | `*` (אפשר לשנות אחר כך לכתובת ה-React) |
| `SEED_ADMIN_PASSWORD` | סיסמה בטוחה למנהל |
| `SEED_USER_PASSWORD` | סיסמה בטוחה ללקוח לדוגמה |

**ליצירת JWT_SECRET:** פתחי את הטרמינל והריצי:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Deploy
1. לחצי **Create Web Service**
2. Render תתחיל לבנות את הפרויקט — זה לוקח כמה דקות
3. עקבי אחרי הלוג — אם הכל תקין תראי `Server running on port...`

### 7. הרצת ה-Seed (פעם ראשונה בלבד)
אחרי שה-Deploy הצליח, צריך להריץ את ה-Seed כדי למלא נתוני דוגמה.
1. ב-Render, לכי ל-Service שלך
2. לחצי על לשונית **Shell**
3. הריצי: `npm run prisma:seed`
4. המתיני לסיום

---

## חלק ד׳ — בדיקה שהכל עובד

### 1. בדיקת Health
פתחי בדפדפן:
```
https://smart-nursery-api.onrender.com/api/health
```
(החליפי את הכתובת בכתובת שלך מ-Render)

צריכה להופיע תשובה:
```json
{"status":"ok","timestamp":"..."}
```

### 2. פתיחת Swagger
פתחי בדפדפן:
```
https://smart-nursery-api.onrender.com/api-docs
```

### 3. התחברות מ-Swagger
1. מצאי את **POST /auth/login**
2. לחצי עליו → לחצי **Try it out**
3. בשדה ה-Request Body כתבי:
   ```json
   {
     "email": "admin@nursery.com",
     "password": "הסיסמה שהגדרת ב-SEED_ADMIN_PASSWORD"
   }
   ```
4. לחצי **Execute**
5. העתיקי את ה-`token` מהתשובה

### 4. שימוש ב-Authorize
1. לחצי על כפתור **Authorize** בראש הדף
2. הדביקי את ה-Token שהעתקת
3. לחצי **Authorize** → **Close**

### 5. קריאה ל-Endpoint מוגן
1. מצאי את **GET /orders**
2. לחצי **Try it out** → **Execute**
3. אם מקבלת תשובה 200 — הכל עובד!

### 6. הוספת רשומה
1. מצאי את **POST /plants**
2. לחצי **Try it out**
3. כתבי JSON של צמח חדש ולחצי **Execute**
4. ודאי שחזר 201

### 7. שליפת הרשומה
1. מצאי את **GET /plants**
2. לחצי **Try it out** → **Execute**
3. ודאי שהצמח החדש מופיע ברשימה

---

## חלק ה׳ — פתרון בעיות נפוצות

| בעיה | פתרון |
|------|--------|
| **Build Failed** | בדקי את הלוג ב-Render. בדרך כלל חסרה חבילה או שגיאת TypeScript. |
| **DATABASE_URL שגוי** | ודאי שהעתקת את כל הכתובת מ-Supabase, כולל הסיסמה. |
| **בעיית Prisma** | ודאי שה-Build Command כולל `npx prisma generate`. |
| **JWT_SECRET חסר** | הוסיפי את המשתנה ב-Environment Variables של Render. |
| **שגיאת CORS** | ודאי שה-CORS_ORIGIN מוגדר נכון. לפיתוח: `*` |
| **401 Unauthorized** | ה-Token פג תוקף או לא נשלח. התחברי מחדש. |
| **403 Forbidden** | אין לך הרשאה לפעולה הזו. בדקי שאת מחוברת עם הסוג הנכון (עובד/לקוח). |
| **Swagger לא נפתח** | ודאי שאת ניגשת ל-`/api-docs` (עם מקף). |
| **השרת לא עולה** | בדקי את הלוגים ב-Render. ודאי שכל משתני הסביבה מוגדרים. |
| **ה-Seed נכשל** | ודאי שה-DATABASE_URL תקין ושה-migrations רצו (Start Command). |

---

**בהצלחה!** 🌱
