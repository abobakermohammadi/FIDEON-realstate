window.FIDEON = window.FIDEON || {};
window.FIDEON.config = {
  brand: "FIDEON",
  email: "fideon.official@gmail.com",
  instagram: "https://www.instagram.com/fideon.official/",
  domain: "https://fideon.com.tr",
  previewMode: true
};

window.FIDEON.sampleProperties = [
  {
    id: "aurora-palm-villa",
    slug: "aurora-palm-villa",
    title: "Aurora Palm Villa",
    location: "Palm Jumeirah · Dubai",
    privacyLocation: "Palm Jumeirah, Dubai",
    type: "Villa",
    intent: "Buy",
    visibility: "Public",
    status: "Showcase",
    priceLabel: "Price on request",
    beds: 6,
    baths: 7,
    area: "1,020 m²",
    image: "/assets/property-palm.svg",
    hero: "/assets/hero-villa.svg",
    summary: "A development-only showcase layout for a waterfront residence. Replace with verified FIDEON inventory before public launch.",
    highlights: ["Waterfront setting", "Private pool", "Indoor–outdoor living", "Guest suite"],
    sample: true
  },
  {
    id: "skyline-residence",
    slug: "skyline-residence",
    title: "Skyline Residence",
    location: "Dubai Marina · Dubai",
    privacyLocation: "Dubai Marina, Dubai",
    type: "Penthouse",
    intent: "Buy",
    visibility: "Public",
    status: "Showcase",
    priceLabel: "Price on request",
    beds: 4,
    baths: 5,
    area: "540 m²",
    image: "/assets/property-skyline.svg",
    hero: "/assets/property-skyline.svg",
    summary: "A sample penthouse presentation used to exercise FIDEON's editorial property-detail system.",
    highlights: ["Full-height glazing", "Private lift lobby", "Skyline outlook", "Entertaining terrace"],
    sample: true
  },
  {
    id: "waterfront-house",
    slug: "waterfront-house",
    title: "The Waterfront House",
    location: "Jumeirah · Dubai",
    privacyLocation: "Jumeirah, Dubai",
    type: "Villa",
    intent: "Buy",
    visibility: "Private",
    status: "Private",
    priceLabel: "Private",
    beds: 5,
    baths: 6,
    area: "780 m²",
    image: "/assets/property-waterfront.svg",
    hero: "/assets/property-waterfront.svg",
    summary: "A private-collection sample that demonstrates discreet inventory treatment without exposing a precise address.",
    highlights: ["Private shoreline", "Landscape courtyard", "Cinema room", "Staff accommodation"],
    sample: true
  },
  {
    id: "desert-retreat",
    slug: "desert-retreat",
    title: "Desert Retreat",
    location: "Dubai · UAE",
    privacyLocation: "Dubai, UAE",
    type: "Estate",
    intent: "Buy",
    visibility: "Private",
    status: "Private",
    priceLabel: "By introduction",
    beds: 7,
    baths: 9,
    area: "1,450 m²",
    image: "/assets/property-desert.svg",
    hero: "/assets/property-desert.svg",
    summary: "A private showcase record used for development and QA only.",
    highlights: ["Large private grounds", "Wellness suite", "Guest pavilion", "Courtyard architecture"],
    sample: true
  }
];

window.FIDEON.seedLeads = [
  {
    id: "lead-demo-001",
    name: "Preview lead",
    channel: "Website",
    source: "Development seed",
    property: "Aurora Palm Villa",
    stage: "New",
    createdAt: new Date().toISOString(),
    note: "Sample record for admin UI validation. Remove before production."
  }
];