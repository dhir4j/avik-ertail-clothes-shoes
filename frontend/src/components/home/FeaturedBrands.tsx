'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const BRANDS = [
    { name: 'Nike', slug: 'nike', logo: 'N' },
    { name: 'Air Jordan', slug: 'jordan', logo: 'AJ' },
    { name: 'Yeezy', slug: 'yeezy', logo: 'Y' },
    { name: 'New Balance', slug: 'newbalance', logo: 'NB' },
    { name: 'Asics', slug: 'asics', logo: 'A' },
    { name: 'Salomon', slug: 'salomon', logo: 'S' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function FeaturedBrands() {
    return (
        <section className="py-24 bg-background relative border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-brand font-bold tracking-tight mb-4">
                        SHOP BY BRAND
                    </h2>
                    <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
                >
                    {BRANDS.map((brand) => (
                        <motion.div key={brand.slug} variants={itemVariants}>
                            <Link href={`/products?brand=${brand.slug}`}>
                                <div className="glass-card aspect-square rounded-2xl flex flex-col items-center justify-center p-6 group overflow-hidden relative cursor-pointer">
                                    {/* Subtle brand glow on hover */}
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />

                                    <span className="text-4xl md:text-5xl font-black font-brand text-white/20 group-hover:text-primary transition-colors duration-500 mb-4 tracking-tighter">
                                        {brand.logo}
                                    </span>

                                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                                        {brand.name}
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
