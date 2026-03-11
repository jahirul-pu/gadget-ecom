import { Product } from "@/store/useStore";

// Mock Database Storage (In-Memory)
// During a Node process restart, this data resets.

export const db = {
  products: [
    {
      id: "prod_1x",
      name: "Zenith Pro Earbuds",
      brand: "Zenith",
      price: 12900,
      originalPrice: 15900,
      discount: "19%",
      rating: 4.8,
      reviewsCount: 124,
      stockStatus: "In Stock",
      stock: 45,
      status: "Active",
      images: ["/images/wireless_earbuds_hero_1773260569058.png"],
      category: "Audio",
      badge: "Best Seller",
      colors: [{ name: "Matte Black", value: "#222" }, { name: "Cloud White", value: "#f4f4f4" }],
      storage: [],
      highlights: ["Active Noise Cancellation", "30h Battery Life", "Spatial Audio"],
      description: "Experience premium sound quality with the Zenith Pro Earbuds. Featuring advanced noise cancellation and a comfortable fit for all-day listening.",
      specs: {
        "Bluetooth": "5.3",
        "Battery": "Up to 30 hours",
        "Water Resistance": "IPX4",
        "Charging": "Wireless & USB-C"
      },
      reviews: [{ id: "r1", user: "Alex D.", rating: 5, comment: "Best earbuds I've ever owned. The ANC is incredible.", date: "2 weeks ago" }]
    },
    {
      id: "prod_2y",
      name: "NovaWatch Series 5",
      brand: "Nova",
      price: 24500,
      originalPrice: 28000,
      discount: "12%",
      rating: 4.6,
      reviewsCount: 89,
      stockStatus: "Low Stock",
      stock: 5,
      status: "Low Stock",
      images: ["/images/smartwatch_hero_1773260634812.png"],
      category: "Wearables",
      badge: "New Arrival",
      colors: [{ name: "Midnight Aluminum", value: "#1e293b" }, { name: "Starlight", value: "#f8fafc" }],
      storage: [],
      highlights: ["Always-On Retina Display", "Blood Oxygen App", "ECG App"],
      description: "Stay connected and healthy with the NovaWatch Series 5. Your ultimate fitness and communication companion on your wrist.",
      specs: {
        "Display": "1.9\" OLED",
        "Battery": "Up to 18 hours",
        "Water Resistance": "50m",
        "Sensors": "Heart rate, ECG, SpO2"
      },
      reviews: [{ id: "r2", user: "Sarah M.", rating: 4, comment: "Great watch, but battery life could be better.", date: "1 month ago" }]
    },
    {
      id: "prod_3z",
      name: "Lumax X1 Smartphone",
      brand: "Lumax",
      price: 89900,
      originalPrice: 95000,
      discount: "5%",
      rating: 4.9,
      reviewsCount: 302,
      stockStatus: "In Stock",
      stock: 120,
      status: "Active",
      images: ["/images/smartphone_hero_1773260880923.png"],
      category: "Phones",
      badge: "Trending",
      colors: [{ name: "Phantom Black", value: "#111" }, { name: "Aurora Blue", value: "#0ea5e9" }],
      storage: ["128GB", "256GB", "512GB"],
      highlights: ["108MP Pro-grade Camera", "Snapdragon 8 Gen 2", "120Hz AMOLED"],
      description: "Capture the world in stunning detail with the Lumax X1. Power and elegance combined in a sleek design.",
      specs: {
        "Display": "6.8\" AMOLED 120Hz",
        "Processor": "Snapdragon 8 Gen 2",
        "Camera": "108MP Main, 12MP Ultrawide",
        "Battery": "5000mAh, 65W Fast Charge"
      },
      reviews: [{ id: "r3", user: "John K.", rating: 5, comment: "The camera is absolutely mind-blowing.", date: "3 days ago" }]
    },
    {
        id: "prod_4a",
        name: "Aura Smart Frame",
        brand: "Aura",
        price: 15500,
        originalPrice: 18000,
        discount: "14%",
        rating: 4.7,
        reviewsCount: 45,
        stockStatus: "In Stock",
        stock: 30,
        status: "Active",
        images: ["/images/smart_home_cam_1773260594833.png"],
        category: "Smart Home",
        badge: "Sale",
        colors: [{ name: "Charcoal", value: "#333" }, { name: "White", value: "#fff" }],
        storage: [],
        highlights: ["10.1\" HD IPS Display", "Unlimited Cloud Storage", "Auto-Dimming"],
        description: "Share your favorite memories instantly with the Aura Smart Frame. Simply connect via Wi-Fi and upload photos from anywhere.",
        specs: {
          "Display": "10.1\" IPS LT",
          "Power": "AC Adapter",
          "Connectivity": "Wi-Fi 802.11ac",
          "Features": "Built-in Speaker, Auto-dimming"
        },
        reviews: []
    }
  ],
  orders: [
    { id: '#ORD-1092', customer: 'Emma Thompson', total: 64500, status: 'Processing', date: '2026-03-12' },
    { id: '#ORD-1091', customer: 'James Wilson', total: 12900, status: 'Shipped', date: '2026-03-11' },
    { id: '#ORD-1090', customer: 'Sophia Lee', total: 89900, status: 'Delivered', date: '2026-03-10' },
    { id: '#ORD-1089', customer: 'Michael Chen', total: 24500, status: 'Delivered', date: '2026-03-09' },
  ]
};
