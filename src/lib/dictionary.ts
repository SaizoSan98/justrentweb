export const dictionaries = {
  en: {
    header: {
      home: "Home",
      fleet: "Our Fleet",
      contact: "Contact",
      login_register: "Log in | Register",
      welcome: "Welcome",
      sign_out: "Sign Out",
      my_profile: "My Profile",
      lang_code: "ENG | EUR"
    },
    hero: {
      title: "Premium Car Rental",
      subtitle: "Experience the thrill of driving the world's finest automobiles.",
      cta: "View Fleet",
      pickup_return: "Pick-up & Return",
      pickup_date: "Pick-up Date",
      return_date: "Return Date",
      time: "Time",
      show_cars: "Show Cars"
    }
  },
  he: {
    header: {
      home: "בית",
      fleet: "הצי שלנו",
      contact: "צור קשר",
      login_register: "התחברות | הרשמה",
      welcome: "ברוך הבא",
      sign_out: "התנתק",
      my_profile: "הפרופיל שלי",
      lang_code: "עברית | EUR"
    },
    hero: {
      title: "השכרת רכב פרימיום",
      subtitle: "חוו את הריגוש בנהיגה ברכבים המשובחים בעולם.",
      cta: "צפה בצי הרכבים",
      pickup_return: "איסוף והחזרה",
      pickup_date: "תאריך איסוף",
      return_date: "תאריך החזרה",
      time: "שעה",
      show_cars: "הצג רכבים"
    }
  }
}

export type Locale = keyof typeof dictionaries
export type Dictionary = typeof dictionaries.en
