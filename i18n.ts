import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "debug_test": "Debug Test Message",
      "welcome": "Welcome",
      "protected_dashboard": "Protected Dashboard",
      "welcome_user": "Welcome, {{name}}!",
      "protected_page_message": "This is a protected page. You can only see this if you're logged in.",
      "your_profile": "Your Profile:",
      "loading": "Loading...",
      "error": "Error: {{message}}",
      "login": "Login",
      "logout": "Logout",
      "please_log_in": "Please log in to view your profile.",
      "profile_information": "Profile Information",
      "language": "Language",
      "english": "English",
      "spanish": "Spanish"
    }
  },
  es: {
    translation: {
      "welcome": "Bienvenido",
      "protected_dashboard": "Tablero Protegido",
      "welcome_user": "¡Bienvenido, {{name}}!",
      "protected_page_message": "Esta es una página protegida. Solo puedes verla si has iniciado sesión.",
      "your_profile": "Tu Perfil:",
      "loading": "Cargando...",
      "error": "Error: {{message}}",
      "login": "Iniciar sesión",
      "logout": "Cerrar sesión",
      "please_log_in": "Por favor, inicia sesión para ver tu perfil.",
      "profile_information": "Información del Perfil",
      "language": "Idioma",
      "english": "Inglés",
      "spanish": "Español"
    }
  }
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18next;
