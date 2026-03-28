'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { getAllProducts, getSectionCategoryMap, searchProducts } from '@/lib/data';
import { Filter, SlidersHorizontal, ChevronDown, X } from 'lucide-react';

const allProducts = getAllProducts();
const sectionCategoryMap = getSectionCategoryMap();

const SORT_OPTIONS = [
  { value: 'default',    label: 'Default' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc',   label: 'Name A\u2013Z' },
];

const SECTIONS = ['All', 'Footwear', 'Clothing'] as const;

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialGender   = searchParams.get('gender')   || '';
  const initialCategory = searchParams.get('category') || '';
  const initialQuery    = searchParams.get('q')        || '';
  const initialSection  = searchParams.get('section')  || '';

  const [query,            setQuery]            = useState(initialQuery);
  const [selectedGender,   setSelectedGender]   = useState(initialGender);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSection,  setSelectedSection]  = useState(initialSection);
  const [sort,             setSort]             = useState('default');
  const [minPrice,         setMinPrice]         = useState('');
  const [maxPrice,         setMaxPrice]         = useState('');
  const [sidebarOpen,      setSidebarOpen]      = useState(false);

  // Derive available categories based on selected section + gender
  const availableCategories = useMemo(() => {
    if (selectedSection) {
      const sectionData = sectionCategoryMap[selectedSection] || {};
      if (selectedGender) {
        return Object.keys(sectionData[selectedGender] || {});
      }
      // Merge all genders within this section
      const cats = new Set<string>();
      for (const genderData of Object.values(sectionData)) {
        for (const cat of Object.keys(genderData)) {
          cats.add(cat);
        }
      }
      return [...cats];
    }
    // No section selected — all categories, optionally filtered by gender
    if (selectedGender) {
      const cats = new Set<string>();
      for (const sectionData of Object.values(sectionCategoryMap)) {
        if (sectionData[selectedGender]) {
          for (const cat of Object.keys(sectionData[selectedGender])) {
            cats.add(cat);
          }
        }
      }
      return [...cats];
    }
    // Everything
    const cats = new Set<string>();
    for (const sectionData of Object.values(sectionCategoryMap)) {
      for (const genderData of Object.values(sectionData)) {
        for (const cat of Object.keys(genderData)) {
          cats.add(cat);
        }
      }
    }
    return [...cats];
  }, [selectedSection, selectedGender]);

  // Count for a category given current section + gender
  const getCategoryCount = (cat: string) => {
    let count = 0;
    const sections = selectedSection ? [selectedSection] : Object.keys(sectionCategoryMap);
    for (const sec of sections) {
      const sectionData = sectionCategoryMap[sec] || {};
      const genders = selectedGender ? [selectedGender] : Object.keys(sectionData);
      for (const g of genders) {
        count += (sectionData[g]?.[cat] || 0);
      }
    }
    return count;
  };

  const filtered = useMemo(() => {
    let result = searchProducts(
      query,
      selectedGender   || undefined,
      selectedCategory || undefined,
      minPrice ? parseInt(minPrice) : undefined,
      maxPrice ? parseInt(maxPrice) : undefined,
      selectedSection  || undefined,
    );
    if (sort === 'price_asc')       result = [...result].sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') result = [...result].sort((a, b) => b.price - a.price);
    else if (sort === 'name_asc')   result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [query, selectedGender, selectedCategory, selectedSection, sort, minPrice, maxPrice]);

  const hasFilters = query || selectedGender || selectedCategory || selectedSection || minPrice || maxPrice;
  const activeFilterCount = [selectedGender, selectedCategory, selectedSection, query, minPrice, maxPrice].filter(Boolean).length;

  const clearAll = () => {
    setQuery('');
    setSelectedGender('');
    setSelectedCategory('');
    setSelectedSection('');
    setMinPrice('');
    setMaxPrice('');
    setSort('default');
  };

  const handleGenderSelect = (g: string) => {
    setSelectedGender(g);
    setSelectedCategory('');
  };

  const handleSectionSelect = (s: string) => {
    const val = s === 'All' ? '' : s;
    setSelectedSection(val);
    setSelectedCategory('');
  };

  const pageTitle = selectedCategory
    ? `${selectedGender ? selectedGender + ' \u00b7 ' : ''}${selectedCategory}`
    : selectedGender || (selectedSection || 'All Styles');

  return (
    <div className="bg-[#FAFAF8] min-h-screen pb-[72px] md:pb-0">
      {/* Section tab pills */}
      <div className="border-b border-[#E0DFDC] sticky top-[68px] z-40 bg-[#FAFAF8]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex items-center gap-2">
            {SECTIONS.map(s => {
              const isActive = s === 'All' ? !selectedSection : selectedSection === s;
              return (
                <button
                  key={s}
                  onClick={() => handleSectionSelect(s)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-[#E11D48] text-white shadow-sm'
                      : 'bg-[#F1F0EE] text-[#78716C] hover:bg-[#E0DFDC] hover:text-[#0C0C0C]'
                  }`}
                  style={{ fontFamily: 'Outfit' }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Header bar */}
      <div className="border-b border-[#E0DFDC] sticky top-[118px] z-30 bg-[#FAFAF8]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-4">
          <div className="flex-1 flex items-center gap-2 sm:gap-3 border border-[#E0DFDC] bg-[#F1F0EE] px-3 sm:px-4 py-2 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-[#78716C] flex-shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search styles, colours..."
              className="flex-1 bg-transparent text-sm outline-none text-[#0C0C0C] placeholder:text-[#78716C] min-w-0"
              style={{ fontFamily: 'Figtree' }}
            />
            {query && <button onClick={() => setQuery('')}><X className="w-3.5 h-3.5 text-[#78716C]" /></button>}
          </div>

          <div className="relative hidden sm:block">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none bg-[#F1F0EE] border border-[#E0DFDC] px-4 py-2 pr-8 text-[12px] font-bold uppercase tracking-wider text-[#0C0C0C] outline-none cursor-pointer rounded-lg"
              style={{ fontFamily: 'Outfit' }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#78716C] pointer-events-none" />
          </div>

          {/* Mobile sort */}
          <div className="relative sm:hidden">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none bg-[#F1F0EE] border border-[#E0DFDC] pl-2 pr-6 py-2 text-[11px] font-bold uppercase text-[#0C0C0C] outline-none cursor-pointer rounded-lg"
              style={{ fontFamily: 'Outfit' }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#78716C] pointer-events-none" />
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 sm:gap-2 bg-[#0C0C0C] text-[#FAFAF8] px-3 sm:px-4 py-2 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0 rounded-lg"
            style={{ fontFamily: 'Outfit' }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-[#E11D48] text-white text-[8px] font-bold flex items-center justify-center rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          <p className="text-[11px] text-[#78716C] whitespace-nowrap hidden sm:block" style={{ fontFamily: 'Space Mono' }}>
            {filtered.length}/{allProducts.length}
          </p>
        </div>
      </div>

      {/* Mobile filter backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-[#0C0C0C]/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex gap-0">

        {/* Sidebar -- desktop inline, mobile bottom sheet */}
        <aside
          className={`
            md:block md:w-56 md:flex-shrink-0 md:border-r md:border-[#E0DFDC] md:py-8 md:pr-6 md:relative md:z-auto md:bg-transparent md:max-h-none md:overflow-visible md:rounded-none md:shadow-none
            ${sidebarOpen
              ? 'block fixed inset-x-0 bottom-0 z-50 bg-[#FAFAF8] max-h-[82vh] overflow-y-auto shadow-2xl rounded-t-2xl'
              : 'hidden'}
          `}
        >
          {/* Mobile sheet handle + header */}
          <div className="md:hidden">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-[3px] bg-[#E0DFDC] rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E0DFDC]">
              <div className="flex items-center gap-3">
                <p className="text-sm font-black uppercase tracking-wider text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>Filters</p>
                {hasFilters && (
                  <button
                    onClick={clearAll}
                    className="text-[10px] font-bold uppercase tracking-widest text-[#E11D48]"
                    style={{ fontFamily: 'Outfit' }}
                  >
                    Clear all
                  </button>
                )}
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1">
                <X className="w-5 h-5 text-[#0C0C0C]" />
              </button>
            </div>
          </div>

          <div className="md:sticky md:top-[170px] space-y-6 sm:space-y-8 px-5 py-5 md:px-0 md:py-0">
            {/* Desktop clear all */}
            {hasFilters && (
              <button onClick={clearAll} className="hidden md:flex w-full text-[11px] font-bold uppercase tracking-widest text-[#E11D48] items-center gap-1.5" style={{ fontFamily: 'Outfit' }}>
                <X className="w-3 h-3" /> Clear All
              </button>
            )}

            {/* Gender filter */}
            <div>
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-3 sm:mb-4" style={{ fontFamily: 'Space Mono' }}>Gender</p>
              <div className="space-y-2">
                {['', 'Men', 'Women'].map(g => {
                  const label = g || 'All';
                  const count = g
                    ? allProducts.filter(p => p.gender === g && (!selectedSection || p.section === selectedSection)).length
                    : (selectedSection ? allProducts.filter(p => p.section === selectedSection).length : allProducts.length);
                  const isActive = selectedGender === g;
                  return (
                    <label key={g} className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isActive ? 'bg-[#0C0C0C] border-[#0C0C0C]' : 'border-[#E0DFDC] group-hover:border-[#0C0C0C]'}`}>
                        {isActive && <span className="text-[8px] text-[#FAFAF8] font-bold">{'\u2713'}</span>}
                      </div>
                      <span className="text-[13px] text-[#0C0C0C] group-hover:text-[#E11D48] transition-colors">{label}</span>
                      <span className="text-[10px] text-[#78716C] ml-auto" style={{ fontFamily: 'Space Mono' }}>{count}</span>
                      <input type="radio" className="sr-only" checked={isActive} onChange={() => handleGenderSelect(g)} />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-3 sm:mb-4" style={{ fontFamily: 'Space Mono' }}>Category</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${!selectedCategory ? 'bg-[#0C0C0C] border-[#0C0C0C]' : 'border-[#E0DFDC] group-hover:border-[#0C0C0C]'}`}>
                    {!selectedCategory && <span className="text-[8px] text-[#FAFAF8] font-bold">{'\u2713'}</span>}
                  </div>
                  <span className="text-[13px] text-[#0C0C0C] group-hover:text-[#E11D48] transition-colors">All</span>
                  <input type="radio" className="sr-only" checked={!selectedCategory} onChange={() => setSelectedCategory('')} />
                </label>

                {availableCategories.map(cat => {
                  const count = getCategoryCount(cat);
                  const isActive = selectedCategory === cat;
                  return (
                    <label key={`${selectedSection || 'all'}-${selectedGender || 'all'}-${cat}`} className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isActive ? 'bg-[#0C0C0C] border-[#0C0C0C]' : 'border-[#E0DFDC] group-hover:border-[#0C0C0C]'}`}>
                        {isActive && <span className="text-[8px] text-[#FAFAF8] font-bold">{'\u2713'}</span>}
                      </div>
                      <span className="text-[13px] text-[#0C0C0C] group-hover:text-[#E11D48] transition-colors">{cat}</span>
                      <span className="text-[10px] text-[#78716C] ml-auto" style={{ fontFamily: 'Space Mono' }}>{count}</span>
                      <input type="radio" className="sr-only" checked={isActive} onChange={() => setSelectedCategory(cat)} />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price range */}
            <div>
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-3 sm:mb-4" style={{ fontFamily: 'Space Mono' }}>Price ({'\u20B9'})</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 text-[12px] bg-[#F1F0EE] border border-[#E0DFDC] rounded-lg outline-none text-[#0C0C0C] placeholder:text-[#78716C] focus:border-[#0C0C0C] transition-colors"
                  style={{ fontFamily: 'Space Mono' }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 text-[12px] bg-[#F1F0EE] border border-[#E0DFDC] rounded-lg outline-none text-[#0C0C0C] placeholder:text-[#78716C] focus:border-[#0C0C0C] transition-colors"
                  style={{ fontFamily: 'Space Mono' }}
                />
              </div>
            </div>

            {/* Mobile apply button */}
            <div className="md:hidden pt-2 pb-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full bg-[#0C0C0C] text-[#FAFAF8] py-4 text-[12px] font-bold uppercase tracking-widest rounded-lg"
                style={{ fontFamily: 'Outfit', fontWeight: 700 }}
              >
                View {filtered.length} Results
              </button>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <main className="flex-1 py-5 sm:py-8 md:pl-8">
          <div className="flex items-baseline justify-between mb-4 sm:mb-6">
            <h1 className="text-base sm:text-xl font-black uppercase tracking-tight" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
              {pageTitle}
            </h1>
            <span className="text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
              {filtered.length} results
            </span>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              {selectedSection && (
                <button
                  onClick={() => handleSectionSelect('All')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E11D48] text-white text-[11px] font-bold rounded-full"
                  style={{ fontFamily: 'Outfit' }}
                >
                  {selectedSection} <X className="w-2.5 h-2.5" />
                </button>
              )}
              {selectedGender && (
                <button
                  onClick={() => handleGenderSelect('')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0C0C0C] text-[#FAFAF8] text-[11px] font-bold rounded-full"
                  style={{ fontFamily: 'Outfit' }}
                >
                  {selectedGender} <X className="w-2.5 h-2.5" />
                </button>
              )}
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0C0C0C] text-[#FAFAF8] text-[11px] font-bold rounded-full"
                  style={{ fontFamily: 'Outfit' }}
                >
                  {selectedCategory} <X className="w-2.5 h-2.5" />
                </button>
              )}
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0C0C0C] text-[#FAFAF8] text-[11px] font-bold rounded-full"
                  style={{ fontFamily: 'Outfit' }}
                >
                  &ldquo;{query}&rdquo; <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="border border-[#E0DFDC] rounded-lg p-10 sm:p-16 text-center">
              <p className="text-[#78716C] mb-4">No products found.</p>
              <button onClick={clearAll} className="text-sm font-bold text-[#E11D48] underline" style={{ fontFamily: 'Outfit' }}>Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filtered.map(p => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    brand: p.category,
                    price: p.price,
                    priceFormatted: p.priceFormatted,
                    imageUrl: p.primaryImage,
                    color: p.color,
                    sizes: p.sizes,
                    section: p.section,
                  }}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-[#78716C] text-sm" style={{ fontFamily: 'Space Mono' }}>Loading...</div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
