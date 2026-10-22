# מדריך API עבור פיתוח React — המשתלה החכמה

מסמך זה מסביר כיצד לחבר את צד ה-React לשרת.
**אין כאן קוד React** — רק הסבר על ה-API ודוגמאות.

---

## כתובת בסיס (Base URL)

- **פיתוח מקומי:** `http://localhost:3000/api`
- **Production:** `https://your-app-name.onrender.com/api`

כל הקריאות מתחילות מהכתובת הזו.

---

## אימות (Authentication)

המערכת משתמשת ב-**JWT (JSON Web Token)**.

### איך זה עובד:
1. שולחים בקשת Login עם אימייל וסיסמה
2. מקבלים Token בתשובה
3. שולחים את ה-Token בכל בקשה מוגנת בכותרת:
   ```
   Authorization: Bearer <your-token-here>
   ```

### דוגמה לשליחת Token ב-fetch:
```
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + token
}
```

---

## Endpoints לפי מסך

### מסך: הרשמה / התחברות

#### הרשמה
```
POST /api/auth/register
```
**Body:**
```json
{
  "email": "dana@example.com",
  "password": "mypassword123",
  "name": "דנה כהן"
}
```
**תשובה (201):**
```json
{
  "user": {
    "id": 3,
    "email": "dana@example.com",
    "name": "דנה כהן",
    "role": "CUSTOMER",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```
**שדות חובה:** email, password (לפחות 6 תווים), name (לפחות 2 תווים)

#### התחברות
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "dana@example.com",
  "password": "mypassword123"
}
```
**תשובה (200):** אותו פורמט כמו הרשמה — user + token

#### פרטי המשתמש המחובר
```
GET /api/auth/me
```
**דורש Token**
**תשובה (200):**
```json
{
  "id": 3,
  "email": "dana@example.com",
  "name": "דנה כהן",
  "role": "CUSTOMER",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

### מסך: קטלוג צמחים

#### רשימת צמחים (עם חיפוש וסינון)
```
GET /api/plants
GET /api/plants?search=פוטוס
GET /api/plants?category=פנימי
GET /api/plants?difficulty=EASY
GET /api/plants?search=פוטוס&category=פנימי
```
**לא דורש Token** — ציבורי
**תשובה (200):**
```json
[
  {
    "id": 1,
    "name": "פוטוס זהוב",
    "description": "צמח פנימי קל לגידול",
    "categoryId": 1,
    "price": "45.00",
    "imageUrl": null,
    "difficulty": "EASY",
    "sunlight": "PARTIAL_SHADE",
    "wateringFrequencyDays": 7,
    "season": "כל השנה",
    "inStock": true,
    "createdAt": "...",
    "updatedAt": "...",
    "category": {
      "id": 1,
      "name": "פנימי"
    }
  }
]
```

**פרמטרים אפשריים:**
| פרמטר | סוג | תיאור |
|--------|------|--------|
| search | string | חיפוש לפי שם |
| category | string | סינון לפי שם קטגוריה |
| difficulty | EASY / MEDIUM / HARD | סינון לפי רמת קושי |

#### רשימת קטגוריות
```
GET /api/categories
```
**תשובה (200):**
```json
[
  { "id": 1, "name": "פנימי" },
  { "id": 2, "name": "חיצוני" },
  { "id": 3, "name": "סוקולנט" },
  { "id": 4, "name": "תבלין" },
  { "id": 5, "name": "פריחה" }
]
```

---

### מסך: דף צמח

#### פרטי צמח בודד
```
GET /api/plants/1
```
**תשובה (200):** אובייקט צמח בודד (כמו ברשימה)

---

### מסך: הזמנה

#### הזמנת צמח
```
POST /api/orders
```
**דורש Token** — לקוח בלבד
**Body:**
```json
{
  "plantId": 1
}
```
**תשובה (201):**
```json
{
  "id": 1,
  "userId": 3,
  "plantId": 1,
  "status": "PENDING",
  "createdAt": "...",
  "updatedAt": "...",
  "plant": { ... }
}
```

**שגיאות אפשריות:**
- `400` — הצמח אזל מהמלאי
- `404` — הצמח לא נמצא

---

### מסך: ההזמנות שלי

#### רשימת הזמנות
```
GET /api/orders
```
**דורש Token**
- לקוח רואה רק את ההזמנות שלו
- עובד רואה את כל ההזמנות

**תשובה (200):**
```json
[
  {
    "id": 1,
    "userId": 3,
    "plantId": 1,
    "status": "PENDING",
    "createdAt": "...",
    "plant": { ... },
    "user": { "id": 3, "name": "דנה כהן", "email": "dana@example.com" }
  }
]
```

**סטטוסים אפשריים:**
| סטטוס | משמעות |
|--------|---------|
| PENDING | ממתינה לאיסוף ותשלום |
| COMPLETED | הושלמה — הצמח בגן שלי |
| CANCELLED | בוטלה |

---

### מסך: הגן שלי

#### הצמחים שלי + תזכורות להיום
```
GET /api/my-garden
```
**דורש Token** — לקוח בלבד
**תשובה (200):**
```json
[
  {
    "id": 1,
    "userId": 3,
    "plantId": 1,
    "addedAt": "...",
    "plant": {
      "id": 1,
      "name": "פוטוס זהוב",
      "description": "...",
      "category": { "id": 1, "name": "פנימי" },
      ...
    },
    "careReminders": [
      {
        "id": 1,
        "type": "WATERING",
        "message": "הגיע הזמן להשקות את הפוטוס זהוב שלך!",
        "dueDate": "2024-01-15",
        "isDone": false
      },
      {
        "id": 2,
        "type": "SUNLIGHT",
        "message": "ודא שהצמח שלך מקבל אור חלקי היום",
        "dueDate": "2024-01-15",
        "isDone": false
      }
    ]
  }
]
```

#### תזכורות להיום (בלבד)
```
GET /api/care-reminders
```
**דורש Token** — לקוח בלבד

#### סימון תזכורת כ"בוצע"
```
PATCH /api/care-reminders/1/done
```
**דורש Token** — לקוח בלבד (שלו בלבד)
**אין צורך ב-Body**
**תשובה (200):** התזכורת המעודכנת

> **הערה חשובה:** כשמסמנים תזכורת השקיה כ"בוצע", השרת יוצר אוטומטית את התזכורת הבאה לפי תדירות ההשקיה של הצמח.

---

### מסך: פנייה לעובד / הודעות

#### שליחת פנייה
```
POST /api/messages
```
**דורש Token** — לקוח בלבד
**Body:**
```json
{
  "content": "העלים של הצמח שלי מצהיבים, מה לעשות?",
  "plantId": 1
}
```
`plantId` הוא אופציונלי — אפשר לשלוח גם בלי.

#### רשימת הפניות שלי
```
GET /api/messages
```
**דורש Token**
- לקוח רואה רק את שלו
- עובד רואה הכל

**תשובה (200):**
```json
[
  {
    "id": 1,
    "userId": 3,
    "plantId": 1,
    "content": "העלים של הצמח שלי מצהיבים",
    "reply": "נסי להפחית השקיה ולהעביר לאור עקיף",
    "repliedBy": 1,
    "repliedAt": "2024-01-16T09:00:00.000Z",
    "createdAt": "2024-01-15T14:00:00.000Z",
    "user": { "id": 3, "name": "דנה כהן", "email": "dana@example.com" },
    "plant": { ... },
    "staff": { "id": 1, "name": "מנהל המשתלה" }
  }
]
```

---

### מסך: פאנל ניהול (עובד בלבד)

#### ניהול צמחים

**הוספת צמח:**
```
POST /api/plants
```
**Body:**
```json
{
  "name": "צמח חדש",
  "description": "תיאור הצמח",
  "categoryId": 1,
  "price": 39.90,
  "imageUrl": null,
  "difficulty": "EASY",
  "sunlight": "FULL_SUN",
  "wateringFrequencyDays": 5,
  "season": "כל השנה",
  "inStock": true
}
```
**שדות חובה:** name, description, categoryId, price, difficulty, sunlight, wateringFrequencyDays

**עריכת צמח:**
```
PUT /api/plants/1
```
Body — שדות שרוצים לשנות (לא חייב את כולם)

**מחיקת צמח:**
```
DELETE /api/plants/1
```

#### ניהול הזמנות

**שינוי סטטוס הזמנה:**
```
PATCH /api/orders/1/status
```
**Body:**
```json
{
  "status": "COMPLETED"
}
```
ערכים אפשריים: `COMPLETED` או `CANCELLED`

> כש-status משתנה ל-COMPLETED, הצמח מתווסף אוטומטית לגן של הלקוח ונוצרות תזכורות טיפול.

#### מענה לפניות

**תשובה לפנייה:**
```
PATCH /api/messages/1/reply
```
**Body:**
```json
{
  "reply": "נסי להפחית את ההשקיה ולהעביר לאור עקיף"
}
```

---

## קודי שגיאה

| קוד | משמעות |
|------|---------|
| 200 | הצלחה |
| 201 | נוצר בהצלחה |
| 400 | שגיאת ולידציה או בקשה לא תקינה |
| 401 | לא מחובר (Token חסר או לא תקין) |
| 403 | אין הרשאה (למשל לקוח מנסה פעולת עובד) |
| 404 | לא נמצא |
| 409 | כבר קיים (למשל אימייל כפול) |
| 500 | שגיאת שרת |

**פורמט שגיאה:**
```json
{
  "error": "הודעת השגיאה"
}
```

**שגיאת ולידציה (400):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```

---

## ערכי Enum

### difficulty (רמת קושי)
| ערך | משמעות |
|------|---------|
| EASY | קל |
| MEDIUM | בינוני |
| HARD | קשה |

### sunlight (שמש)
| ערך | משמעות |
|------|---------|
| FULL_SUN | שמש מלאה |
| PARTIAL_SHADE | צל חלקי |
| SHADE | צל |

### OrderStatus (סטטוס הזמנה)
| ערך | משמעות |
|------|---------|
| PENDING | ממתינה |
| COMPLETED | הושלמה |
| CANCELLED | בוטלה |

### CareType (סוג טיפול)
| ערך | משמעות |
|------|---------|
| WATERING | השקיה |
| SUNLIGHT | שמש |

### Role (תפקיד)
| ערך | משמעות |
|------|---------|
| CUSTOMER | לקוח |
| STAFF | עובד |

---

## בדיקת Health
```
GET /api/health
```
**תשובה:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

אם הבקשה הזו מצליחה — השרת פעיל ועובד.
