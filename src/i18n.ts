import i18n from "i18next"
import {initReactI18next} from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import enCommon from "./locales/en/common.json"
import esCommon from "./locales/es/common.json"
import frCommon from "./locales/fr/common.json"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
        en: {
            common: enCommon
        },
        es: {
            common: esCommon
        },
        fr: {
            common: frCommon
        }
    },
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common"],
    debug: process.env.NODE_ENV === "development",
    interpolation: {
        escapeValue: false
    },
    detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage']
    }
  })

export default i18n