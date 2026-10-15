const sampleProducts = [
  // ── Electronics (10 items) ──────────────────────────────────────────────────
  {
    name: 'Noise Cancelling Headphones',
    description: 'Wireless over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio fidelity.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    stock: 25
  },
  {
    name: 'Mechanical RGB Keyboard',
    description: 'Tactile mechanical gaming keyboard with customizable RGB backlighting and blue switches for rapid typing feedback.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    stock: 15
  },
  {
    name: 'Ergonomic Wireless Mouse',
    description: 'Precision wireless mouse with adjustable DPI sensor, quiet clicks, and ergonomic contoured thumb rest.',
    price: 1499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    stock: 30
  },
  {
    name: 'Ultra HD 4K IPS Monitor',
    description: '27-inch 4K UHD frameless IPS monitor with 99% sRGB color gamut and HDR support for creators and gamers.',
    price: 18999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    stock: 12
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Rugged IPX7 waterproof portable speaker with 360-degree sound, deep bass, and 20-hour playback.',
    price: 2499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
    stock: 40
  },
  {
    name: 'Smart Fitness Band Series 8',
    description: 'Advanced activity tracker with AMOLED touch display, heart-rate & SpO2 sensors, and 5ATM water resistance.',
    price: 3499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80',
    stock: 22
  },
  {
    name: 'Fast Wireless Charging Pad',
    description: '15W Qi-certified high-speed wireless charging pad with temperature control and ultra-slim aluminum base.',
    price: 1299,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1622445262464-84b14e4b75a3?auto=format&fit=crop&w=800&q=80',
    stock: 50
  },
  {
    name: 'USB-C 7-in-1 Multi-Port Hub',
    description: 'Aluminum hub featuring 4K HDMI, 100W Power Delivery pass-through, SD card reader, and 3 USB 3.0 ports.',
    price: 1799,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=800&q=80',
    stock: 35
  },
  {
    name: 'Studio Condenser Microphone',
    description: 'Cardioid USB condenser mic with built-in pop filter, zero-latency monitoring, and desktop tripod mount.',
    price: 4299,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    stock: 18
  },
  {
    name: 'Compact Drone with 4K Camera',
    description: 'Lightweight foldable drone with 3-axis gimbal, GPS return-to-home, and 31-minute maximum flight time.',
    price: 24999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
    stock: 8
  },

  // ── Fashion (10 items) ──────────────────────────────────────────────────────
  {
    name: 'Classic Denim Jacket',
    description: 'Premium cotton trucker denim jacket featuring double chest flap pockets and vintage wash finish.',
    price: 3499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
    stock: 20
  },
  {
    name: 'Urban Canvas Backpack',
    description: 'Durable water-resistant backpack with padded 15-inch laptop sleeve and multiple utility compartments.',
    price: 2199,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    stock: 30
  },
  {
    name: 'Merino Wool Knit Sweater',
    description: 'Ultra-soft 100% Australian merino wool crewneck sweater with ribbed cuffs and hem for cold-weather layering.',
    price: 3999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    stock: 16
  },
  {
    name: 'Vintage Aviator Sunglasses',
    description: 'Polarized UV400 protective sunglasses with lightweight gold-tone alloy frame and scratch-resistant lenses.',
    price: 1499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    stock: 45
  },
  {
    name: 'Water-Resistant Trench Coat',
    description: 'Double-breasted classic belted trench coat made with weatherproof gabardine cotton and storm flap detailing.',
    price: 6499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80',
    stock: 14
  },
  {
    name: 'Minimalist Leather Sneakers',
    description: 'Handcrafted low-top sneakers made from full-grain white leather with comfortable cushioned EVA insoles.',
    price: 4499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
    stock: 25
  },
  {
    name: 'Genuine Leather Bi-Fold Wallet',
    description: 'Slim RFID-blocking bi-fold wallet made from vegetable-tanned genuine leather with 8 card slots.',
    price: 1199,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    stock: 55
  },
  {
    name: 'Tailored Linen Button-Down Shirt',
    description: 'Breathable pure European linen casual shirt with modern slim fit and mother-of-pearl buttons.',
    price: 2499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    stock: 28
  },
  {
    name: 'Breathable Athletic Running Shoes',
    description: 'Engineered mesh running shoes featuring responsive foam cushioning and high-traction rubber outsoles.',
    price: 3799,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    stock: 35
  },
  {
    name: 'Structured Crossbody Leather Bag',
    description: 'Compact crossbody bag with gold hardware, adjustable strap, and dual zip compartments for daily essentials.',
    price: 2999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    stock: 22
  },

  // ── Books (10 items) ────────────────────────────────────────────────────────
  {
    name: 'Clean Code Developer Book',
    description: 'A handbook of agile software craftsmanship covering principles, naming conventions, and refactoring techniques.',
    price: 899,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80',
    stock: 50
  },
  {
    name: 'Designing Data-Intensive Applications',
    description: 'The definitive guide to reliability, scalability, and maintainability in modern distributed storage systems.',
    price: 1499,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    stock: 35
  },
  {
    name: 'Atomic Habits Hardcover Edition',
    description: 'An easy and proven framework for improving every day through tiny behavioral changes that compound over time.',
    price: 699,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    stock: 60
  },
  {
    name: 'The Pragmatic Programmer',
    description: 'Your journey to mastery: pragmatic techniques, architecture tips, and coding philosophies from seasoned pros.',
    price: 1199,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    stock: 40
  },
  {
    name: 'System Design Interview Guide',
    description: 'Insider preparation guide for large-scale distributed systems architecture interviews at top tech companies.',
    price: 1299,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
    stock: 25
  },
  {
    name: 'Deep Work: Rules for Focused Success',
    description: 'Master the ability to focus without distraction on cognitively demanding tasks in an easily distracted world.',
    price: 599,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80',
    stock: 45
  },
  {
    name: 'The Psychology of Money',
    description: 'Timeless lessons on wealth, greed, and happiness exploring how people truly behave when managing personal finances.',
    price: 499,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1554774853-719586f82d77?auto=format&fit=crop&w=800&q=80',
    stock: 70
  },
  {
    name: 'Refactoring: Improving Code Design',
    description: 'Martin Fowler’s masterwork on restructuring existing code safely to improve readability and future flexibility.',
    price: 1399,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    stock: 30
  },
  {
    name: 'Thinking, Fast and Slow',
    description: 'Nobel laureate Daniel Kahneman’s groundbreaking exploration of the two systems that drive how we think and choose.',
    price: 649,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=800&q=80',
    stock: 38
  },
  {
    name: 'Zero to One: Notes on Startups',
    description: 'Peter Thiel’s contrarian insights on building novel inventions and pioneering monopoly businesses from scratch.',
    price: 549,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&w=800&q=80',
    stock: 52
  },

  // ── Home (10 items) ─────────────────────────────────────────────────────────
  {
    name: 'Minimalist Ceramic Coffee Mug',
    description: 'Handcrafted 350ml matte ceramic mug with comfortable handle designed to keep morning brews warm for longer.',
    price: 499,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    stock: 50
  },
  {
    name: 'Smart Ambient LED Desk Lamp',
    description: 'Eye-friendly dimmable LED desk lamp featuring wireless phone charging base, timer, and touch color controls.',
    price: 1999,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    stock: 25
  },
  {
    name: 'Ultrasonic Essential Oil Diffuser',
    description: 'Whisper-quiet 500ml ultrasonic aromatherapy diffuser with 7 ambient color lights and auto-shutoff security.',
    price: 1699,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=800&q=80',
    stock: 32
  },
  {
    name: 'Handwoven Cotton Throw Blanket',
    description: 'Breathable 100% organic cotton herringbone throw blanket with fringe edges for couch and bed comfort.',
    price: 1499,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    stock: 28
  },
  {
    name: 'Ergonomic Memory Foam Pillow',
    description: 'Contoured cervical support pillow with cooling gel layer and breathable bamboo removable washable cover.',
    price: 2199,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    stock: 20
  },
  {
    name: 'Bamboo Fiber Bath Towel Set',
    description: 'Set of 4 ultra-absorbent, hypoallergenic towels woven with premium bamboo and combed cotton fibers.',
    price: 1899,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=800&q=80',
    stock: 35
  },
  {
    name: 'Matte Black French Press',
    description: 'Double-walled stainless steel 1-liter French press coffee maker with 4-level filtration system.',
    price: 1599,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    stock: 40
  },
  {
    name: 'Stainless Steel Insulated Tumbler',
    description: 'Vacuum-insulated 750ml travel tumbler with leakproof lid, keeping drinks hot for 12h or cold for 24h.',
    price: 999,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80',
    stock: 65
  },
  {
    name: 'Modern Minimalist Wall Clock',
    description: '12-inch non-ticking silent quartz wall clock featuring clean Scandinavian numerals and glass front cover.',
    price: 1299,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=800&q=80',
    stock: 24
  },
  {
    name: 'Indoor Ceramic Planter with Stand',
    description: 'Glossy ceramic indoor plant pot with drainage hole and elevated natural beechwood display stand.',
    price: 1199,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    stock: 30
  }
];

export default sampleProducts;
