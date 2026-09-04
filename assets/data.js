window.FIDEON = window.FIDEON || {};
window.FIDEON.config = {
  brand: "FIDEON",
  email: "fideon.official@gmail.com",
  instagram: "https://www.instagram.com/fideon.official/",
  domain: "https://fideon.com.tr",
  whatsapp: "",
  city: "İstanbul",
  previewMode: true
};

window.FIDEON.sampleProperties = [
  {
    id: "aurora-palm-villa",
    slug: "aurora-palm-villa",
    title: "Beylikdüzü Marina Residence",
    location: "Beylikdüzü · İstanbul",
    privacyLocation: "Beylikdüzü, İstanbul",
    type: "Daire",
    intent: "Buy",
    visibility: "Public",
    status: "Örnek",
    priceLabel: "Fiyat bilgisi için iletişime geçin",
    beds: 3,
    baths: 2,
    area: "165 m²",
    image: "/assets/property-palm.svg",
    hero: "/assets/hero-villa.svg",
    summary: "İstanbul odaklı ilan arayüzünü test etmek için kullanılan örnek kayıt. Gerçek ilan bilgileriyle değiştirilmelidir.",
    highlights: ["3+1 plan", "Geniş balkon", "Kapalı otopark", "Site yaşamı"],
    sample: true
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
    property: "Beylikdüzü Marina Residence",
    stage: "New",
    createdAt: new Date().toISOString(),
    note: "Admin arayüzünü test etmek için örnek kayıt."
  }
];