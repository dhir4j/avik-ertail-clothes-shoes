import metroRaw from '../../data/metro_data.json';
import superkicksRaw from '../../data/superkicks_data.json';
import shop4shopsRaw from '../../data/shop4shops_data.json';

export interface Product {
  id: string;
  slug: string;
  name: string;
  gender: string;       // 'Men' | 'Women'
  category: string;     // 'Loafers', 'T-Shirts', etc.
  section: string;      // 'Footwear' | 'Clothing'
  color: string;
  price: number;
  mrp: number;
  priceFormatted: string;
  primaryImage: string;
  images: string[];
  sizes: string[];
  description: string;
  specifications: Record<string, string>;
  url: string;
  vendor?: string;
  tags?: string[];
}

export interface CategoryEntry {
  gender: string;
  category: string;
  section: string;
  count: number;
  sampleImage: string;
}

function formatPrice(num: number): string {
  return '₹' + num.toLocaleString('en-IN');
}

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseIndianPrice(priceStr: string): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[₹,\s]/g, '');
  return parseInt(cleaned) || 0;
}

// ─── Build unified product list ──────────────────────────────────────────────

const allProducts: Product[] = [];
const seenSlugs = new Set<string>();
let globalIndex = 0;

function addSlug(baseName: string): string {
  const baseSlug = toSlug(baseName);
  let slug = baseSlug;
  let counter = 1;
  while (seenSlugs.has(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }
  seenSlugs.add(slug);
  return slug;
}

// ─── 1. Parse metro_data.json (Footwear) ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const metro = metroRaw as Record<string, Record<string, Record<string, any>>>;

for (const gender of Object.keys(metro)) {
  const categories = metro[gender];
  for (const category of Object.keys(categories)) {
    const products = categories[category];
    for (const productName of Object.keys(products)) {
      const p = products[productName];
      const images: string[] = (p.images || []).filter(Boolean);
      const primaryImage: string = p.listing_image || images[0] || '';

      allProducts.push({
        id: String(globalIndex++),
        slug: addSlug(productName),
        name: productName,
        gender,
        category,
        section: 'Footwear',
        color: p.color || '',
        price: p.price || 0,
        mrp: p.mrp || p.price || 0,
        priceFormatted: formatPrice(p.price || 0),
        primaryImage,
        images,
        sizes: (p.sizes || []).map((s: string) => String(s).trim()),
        description: p.description || productName,
        specifications: p.specifications || {},
        url: p.url || '',
      });
    }
  }
}

// ─── 2. Parse superkicks_data.json (Premium Footwear) ───────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const superkicks = superkicksRaw as { brands: any[] };

for (const brand of superkicks.brands) {
  if (!brand.products) continue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const p of brand.products) {
    const priceNum = parseIndianPrice(p.price || '');
    const images: string[] = (p.images || []).map((img: string) =>
      img.startsWith('http') ? img : `https://${img}`
    );
    const primaryImage = images[0] || '';

    // Determine gender from URL or default to Men
    const urlLower = (p.url || '').toLowerCase();
    const gender = urlLower.includes('women') || urlLower.includes('wmns') ? 'Women' : 'Men';

    allProducts.push({
      id: String(globalIndex++),
      slug: addSlug(p.product_name || brand.name),
      name: p.product_name || '',
      gender,
      category: 'Premium Sneakers',
      section: 'Footwear',
      color: p.color || '',
      price: priceNum,
      mrp: priceNum,
      priceFormatted: p.price || formatPrice(priceNum),
      primaryImage,
      images,
      sizes: (p.sizes || []).map((s: string) => String(s).trim()),
      description: p.about?.description || p.about?.title || p.product_name || '',
      specifications: p.details || {},
      url: p.url || '',
      vendor: brand.name,
    });
  }
}

// ─── 3. Parse shop4shops_data.json (Clothing) ──────────────────────────────

// Tag-based sub-category mapping for clothing
const ARTICLE_TAG_MAP: Record<string, string> = {
  'article mens t-shirt': 'T-Shirts',
  'article mens polos': 'Polos',
  'article mens joggers': 'Joggers',
  'article mens shorts': 'Shorts',
  'article mens hooded sweatshirts': 'Hoodies & Sweatshirts',
  'article mens crewneck sweatshirts': 'Hoodies & Sweatshirts',
  'article mens pyjama sets': 'Pyjama Sets',
  'article mens pyjama pants': 'Pyjama Pants',
  'article mens athleisure': 'Athleisure',
  'article mens track pants': 'Track Pants',
  'article mens woven boxers': 'Boxers & Innerwear',
  'article mens under shirts': 'Boxers & Innerwear',
  'article mens briefs': 'Boxers & Innerwear',
  'article mens knitted boxers': 'Boxers & Innerwear',
  'article mens knit boxer': 'Boxers & Innerwear',
  'article mens cargo pants': 'Cargo Pants',
  'article mens shorty sets': 'Shorty Sets',
  'article mens jeans': 'Jeans',
  'article mens jeans and cargo': 'Jeans',
  'article mens jogging sets': 'Jogging Sets',
  'article mens knit shirt': 'Shirts',
  'article ladies athleisure': 'Athleisure',
  'article ladies tops and t-shirts': 'Tops & T-Shirts',
  'article ladies sweatshirts': 'Sweatshirts',
  'article ladies leggings': 'Leggings',
  'article ladies pyjama sets': 'Pyjama Sets',
  'article ladies capri': 'Capris',
  'article ladies jogging sets': 'Jogging Sets',
  'article ladies shorts': 'Shorts',
  'article ladies pyjama pants': 'Pyjama Pants',
  'article ladies joggers and tracks': 'Joggers & Tracks',
};

function deriveClothingCategory(tags: string[]): string {
  for (const tag of tags) {
    const mapped = ARTICLE_TAG_MAP[tag.toLowerCase()];
    if (mapped) return mapped;
  }
  return 'General';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const shop4shops = shop4shopsRaw as any;

for (const cat of shop4shops.categories || []) {
  const genderRaw: string = cat.category || '';
  const gender = genderRaw.toLowerCase().includes('women') ? 'Women' : 'Men';

  for (const col of cat.collections || []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const p of col.products || []) {
      const unitPriceStr: string = p.unit_price_inr || '';
      const priceNum = parseIndianPrice(unitPriceStr);
      const images: string[] = (p.images || []).filter(Boolean);
      const primaryImage = images[0] || '';
      const productTags: string[] = p.tags || [];

      // Derive sub-category from article tags
      const category = deriveClothingCategory(productTags);

      // Build specifications from MOQ details
      const specs: Record<string, string> = {};
      if (p.vendor) specs['Vendor'] = p.vendor;
      if (p.skus?.length) specs['SKU'] = p.skus.join(', ');
      if (p.moq_details?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        p.moq_details.forEach((moq: any, i: number) => {
          specs[`MOQ Option ${i + 1}`] = moq.raw || '';
        });
      }
      if (p.set_prices?.length) specs['Set Prices'] = p.set_prices.join(' / ');

      allProducts.push({
        id: String(globalIndex++),
        slug: addSlug(p.product_title || 'product'),
        name: p.product_title || '',
        gender,
        category,
        section: 'Clothing',
        color: '',
        price: priceNum,
        mrp: priceNum,
        priceFormatted: unitPriceStr || formatPrice(priceNum),
        primaryImage,
        images,
        sizes: p.available_sizes || [],
        description: p.description || p.product_title || '',
        specifications: specs,
        url: '',
        vendor: p.vendor || '',
        tags: p.tags || [],
      });
    }
  }
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export function getAllProducts(): Product[] {
  return allProducts;
}

export function getProductsBySection(section: string): Product[] {
  return allProducts.filter(p => p.section.toLowerCase() === section.toLowerCase());
}

export function getProductsByGender(gender: string): Product[] {
  return allProducts.filter(p => p.gender.toLowerCase() === gender.toLowerCase());
}

export function getProductsByCategory(gender: string, category: string): Product[] {
  return allProducts.filter(
    p => p.gender.toLowerCase() === gender.toLowerCase() &&
         p.category.toLowerCase() === category.toLowerCase()
  );
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find(p => p.slug === slug);
}

export function getCategories(): CategoryEntry[] {
  const map = new Map<string, { count: number; sampleImage: string; section: string }>();
  for (const p of allProducts) {
    const key = `${p.gender}||${p.category}`;
    if (!map.has(key)) {
      map.set(key, { count: 0, sampleImage: p.primaryImage, section: p.section });
    }
    map.get(key)!.count++;
  }
  return Array.from(map.entries()).map(([key, val]) => {
    const [gender, category] = key.split('||');
    return { gender, category, section: val.section, count: val.count, sampleImage: val.sampleImage };
  });
}

/** Returns { Men: { Loafers: 19, Boots: 13 }, Women: { ... } } */
export function getCategoryMap(): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  for (const p of allProducts) {
    if (!result[p.gender]) result[p.gender] = {};
    result[p.gender][p.category] = (result[p.gender][p.category] || 0) + 1;
  }
  return result;
}

/** Returns { Footwear: { Men: { Loafers: 19 } }, Clothing: { Men: { Menswear: 597 } } } */
export function getSectionCategoryMap(): Record<string, Record<string, Record<string, number>>> {
  const result: Record<string, Record<string, Record<string, number>>> = {};
  for (const p of allProducts) {
    if (!result[p.section]) result[p.section] = {};
    if (!result[p.section][p.gender]) result[p.section][p.gender] = {};
    result[p.section][p.gender][p.category] = (result[p.section][p.gender][p.category] || 0) + 1;
  }
  return result;
}

export function searchProducts(
  query: string,
  gender?: string,
  category?: string,
  minPrice?: number,
  maxPrice?: number,
  section?: string,
): Product[] {
  return allProducts.filter(p => {
    if (gender && p.gender.toLowerCase() !== gender.toLowerCase()) return false;
    if (category && p.category.toLowerCase() !== category.toLowerCase()) return false;
    if (section && p.section.toLowerCase() !== section.toLowerCase()) return false;
    if (minPrice !== undefined && p.price < minPrice) return false;
    if (maxPrice !== undefined && p.price > maxPrice) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.gender.toLowerCase().includes(q) ||
        p.section.toLowerCase().includes(q) ||
        (p.vendor?.toLowerCase().includes(q) ?? false) ||
        (p.tags?.some(t => t.toLowerCase().includes(q)) ?? false)
      );
    }
    return true;
  });
}

export function getFeaturedProducts(count = 8): Product[] {
  const seen = new Set<string>();
  const featured: Product[] = [];
  for (const p of allProducts) {
    const key = `${p.section}||${p.gender}||${p.category}`;
    if (!seen.has(key)) {
      seen.add(key);
      featured.push(p);
    }
    if (featured.length >= count) break;
  }
  return featured.slice(0, count);
}

export function getRelatedProducts(product: Product, count = 4): Product[] {
  return allProducts
    .filter(p => p.category === product.category && p.slug !== product.slug)
    .slice(0, count);
}

export { allProducts };
