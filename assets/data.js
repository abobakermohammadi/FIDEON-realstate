window.FIDEON = window.FIDEON || {};
window.FIDEON.config = {
  brand: "FIDEON",
  email: "fideon.official@gmail.com",
  instagram: "https://www.instagram.com/fideon.official/",
  domain: "https://fideon.com.tr",
  whatsapp: "905013575635",
  phone: "+90 501 357 56 35",
  city: "İstanbul",
  previewMode: true
};

window.FIDEON.sampleProperties = [
  {
    id: "asiyan-konaklari-adnan-kahveci-3-1",
    slug: "asiyan-konaklari-adnan-kahveci-3-1",
    title: "Aşiyan Konakları'nda Geniş 3+1 Aile Dairesi",
    location: "Adnan Kahveci · Beylikdüzü · İstanbul",
    privacyLocation: "Adnan Kahveci, Beylikdüzü, İstanbul",
    project: "Aşiyan Konakları",
    type: "Daire",
    intent: "Buy",
    visibility: "Public",
    status: "Satılık",
    priceLabel: "Fiyat için WhatsApp'tan sorun",
    beds: 3,
    roomPlan: "3+1",
    image: "/assets/asiyan-exterior.svg",
    hero: "/assets/asiyan-exterior.svg",
    reelPreview: "/assets/asiyan-reel-preview.svg",
    reference: "FIDEON-AK-001",
    summary: "Beylikdüzü Adnan Kahveci'de, Aşiyan Konakları içerisinde yer alan geniş ve ferah 3+1 aile dairesi. Site olanakları, merkezi konumu ve günlük ihtiyaç noktalarına kolay erişimiyle konforlu bir yaşam sunar.",
    description: "Aşiyan Konakları'nda merkezi konumda bulunan bu 3+1 daire; geniş kullanım alanı, aile yaşamına uygun planı, site içi sosyal olanakları ve güçlü ulaşım bağlantılarıyla öne çıkıyor. Beylikdüzü Yaşam Vadisi, Beylikdüzü Pazarı, toplu taşıma durakları, okullar, marketler ve alışveriş noktalarına kolay ulaşım sağlanıyor. Detaylı bilgi, güncel fiyat ve randevu için FIDEON ile doğrudan WhatsApp üzerinden iletişime geçebilirsiniz.",
    siteFeatures: [
      "Otopark",
      "Asansör",
      "Spor salonu",
      "Sauna",
      "Çocuk parkı ve oyun alanı",
      "Sosyal alan",
      "Yangın güvenlik sistemi"
    ],
    locationAdvantages: [
      "Beylikdüzü Yaşam Vadisi'ne yakın",
      "Beylikdüzü Pazarı'na yakın",
      "Dolmuş ve otobüs duraklarına yakın",
      "Okul ve günlük ihtiyaç noktalarına kolay ulaşım",
      "Market ve alışveriş alanlarına yakın"
    ],
    highlights: [
      "3+1 geniş aile planı",
      "Otopark",
      "Asansör",
      "Spor salonu",
      "Sauna",
      "Çocuk parkı ve oyun alanı",
      "Sosyal alan",
      "Yangın güvenlik sistemi",
      "Beylikdüzü Yaşam Vadisi'ne yakın",
      "Beylikdüzü Pazarı'na yakın",
      "Dolmuş ve otobüs duraklarına yakın",
      "Okul, market ve günlük ihtiyaç noktalarına kolay ulaşım"
    ],
    whatsappMessage: "Merhaba FIDEON, Aşiyan Konakları Adnan Kahveci'deki 3+1 satılık daire (FIDEON-AK-001) hakkında fiyat ve randevu bilgisi almak istiyorum.",
    sample: false
  },
  {
    id: "skyline-residence",
    slug: "skyline-residence",
    title: "Büyükçekmece Deniz Manzaralı Daire",
    location: "Büyükçekmece · İstanbul",
    privacyLocation: "Büyükçekmece, İstanbul",
    type: "Daire",
    intent: "Buy",
    visibility: "Public",
    status: "Örnek",
    priceLabel: "Fiyat bilgisi için iletişime geçin",
    beds: 4,
    baths: 2,
    area: "210 m²",
    image: "/assets/property-skyline.svg",
    hero: "/assets/property-skyline.svg",
    summary: "FIDEON'un mobil ve masaüstü ilan sunumunu test etmek için kullanılan örnek kayıt.",
    highlights: ["4+1 plan", "Deniz manzarası", "Ebeveyn banyosu", "Geniş salon"],
    sample: true
  },
  {
    id: "waterfront-house",
    slug: "waterfront-house",
    title: "Sarıyer Müstakil Villa",
    location: "Sarıyer · İstanbul",
    privacyLocation: "Sarıyer, İstanbul",
    type: "Villa",
    intent: "Buy",
    visibility: "Private",
    status: "Özel",
    priceLabel: "Bilgi için iletişime geçin",
    beds: 5,
    baths: 4,
    area: "420 m²",
    image: "/assets/property-waterfront.svg",
    hero: "/assets/property-waterfront.svg",
    summary: "Özel ilan akışını test etmek için kullanılan örnek kayıt. Kesin adres gibi hassas bilgiler yalnızca gerektiğinde paylaşılır.",
    highlights: ["Müstakil bahçe", "5+1 plan", "Otopark", "Özel konum"],
    sample: true
  },
  {
    id: "desert-retreat",
    slug: "desert-retreat",
    title: "Başakşehir Aile Dairesi",
    location: "Başakşehir · İstanbul",
    privacyLocation: "Başakşehir, İstanbul",
    type: "Daire",
    intent: "Rent",
    visibility: "Public",
    status: "Örnek",
    priceLabel: "Kira bilgisi için iletişime geçin",
    beds: 3,
    baths: 2,
    area: "150 m²",
    image: "/assets/property-desert.svg",
    hero: "/assets/property-desert.svg",
    summary: "Kiralık ilan görünümünü test etmek için kullanılan örnek kayıt.",
    highlights: ["3+1 plan", "Aile sitesi", "Ulaşım bağlantıları", "Kapalı otopark"],
    sample: true
  }
];

window.FIDEON.seedLeads = [
  {
    id: "lead-demo-001",
    name: "Örnek talep",
    channel: "Website",
    source: "Development seed",
    property: "Aşiyan Konakları 3+1",
    stage: "New",
    createdAt: new Date().toISOString(),
    note: "Admin arayüzünü test etmek için örnek kayıt."
  }
];