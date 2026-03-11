module.exports = [
    {
        code: 'en',
        title: 'English',
        isDefault: true,
        flag: '🇺🇸',
        strings: {
            WELCOME: "Welcome",
            HOME: "Home",
            TEST: {
                TEST: {
                    TEST: {
                        TEST: "Nested Key Test Value (EN)"
                    }
                }
            },
            HERO: {
                TITLE: "Modern & Scalable Node.js Starter",
                SUBTITLE: "A robust foundation with MongoDB, Express, and built-in i18n support."
            },
            LEARN: {
                MORE: "Learn More"
            },
            GET: {
                STARTED: "Get Started"
            },
            LANG: {
                EN: "English",
                TR: "Turkish"
            }
        }
    },
    {
        code: 'tr',
        title: 'Türkçe',
        isDefault: false,
        flag: '🇹🇷',
        strings: {
            WELCOME: "Hoşgeldiniz",
            HOME: "Anasayfa",
            TEST: {
                TEST: {
                    TEST: {
                        TEST: "İç içe Anahtar Test Değeri (TR)"
                    }
                }
            },
            HERO: {
                TITLE: "Modern & Ölçeklenebilir Node.js Başlangıç Kiti",
                SUBTITLE: "MongoDB, Express ve yerleşik i18n desteği ile sağlam bir temel."
            },
            LEARN: {
                MORE: "Daha Fazla Bilgi"
            },
            GET: {
                STARTED: "Hemen Başla"
            },
            LANG: {
                EN: "İngilizce",
                TR: "Türkçe"
            }
        }
    }
];
