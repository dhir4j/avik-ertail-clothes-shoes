import json
import re
import logging
from app.extensions import db
from app.models.product import Product
from app.models.product_variant import ProductVariant
from app.models.product_image import ProductImage
from app.utils.url_normalizer import normalize_image_url

logger = logging.getLogger(__name__)


def parse_price(price_str):
    """Strip currency symbol and commas, return Decimal-friendly float."""
    cleaned = re.sub(r"[^\d.]", "", price_str.replace(",", ""))
    return float(cleaned) if cleaned else 0.0


def slugify(name, brand, color):
    """Generate a URL slug from product attributes."""
    raw = f"{brand}-{name}-{color}".lower()
    slug = re.sub(r"[^a-z0-9]+", "-", raw).strip("-")
    return slug


def import_products(dataset_path, initial_stock=0, force_stock=False):
    with open(dataset_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    brands = data.get("brands", [])
    stats = {"created": 0, "updated": 0, "variants_created": 0, "variants_updated": 0, "images_synced": 0}

    for brand_entry in brands:
        for prod_data in brand_entry.get("products", []):
            source_url = prod_data.get("url", "").strip()
            if not source_url:
                continue

            name = prod_data.get("product_name", "").strip()
            brand = prod_data.get("brand", brand_entry.get("name", "")).strip()
            color = prod_data.get("color", "").strip()
            price = parse_price(prod_data.get("price", "0"))
            description = (prod_data.get("about") or {}).get("description", "")
            about_title = (prod_data.get("about") or {}).get("title", "")
            images = prod_data.get("images", [])
            sizes = prod_data.get("sizes", [])
            details = prod_data.get("details", {})
            sku = details.get("Article Code", "")

            slug = slugify(name, brand, color)
            primary_image = normalize_image_url(images[0]) if images else None

            # Upsert product by source_url
            product = Product.query.filter_by(source_url=source_url).first()
            if product:
                product.name = name
                product.brand = brand
                product.price = price
                product.description = description
                product.about_title = about_title
                product.color = color
                # Only update slug if it was manually changed or something, usually we wouldn't, but let's keep it sync
                # Wait, if we update slug to a non-unique one, it will still crash. Let's just not update the slug on upsert.
                product.primary_image_url = primary_image
                stats["updated"] += 1
            else:
                # Ensure slug uniqueness for new products
                original_slug = slug
                counter = 1
                while Product.query.filter_by(slug=slug).first() is not None:
                    slug = f"{original_slug}-{counter}"
                    counter += 1
                    
                product = Product(
                    name=name,
                    brand=brand,
                    price=price,
                    description=description,
                    about_title=about_title,
                    color=color,
                    slug=slug,
                    source_url=source_url,
                    primary_image_url=primary_image,
                )
                db.session.add(product)
                stats["created"] += 1

            db.session.flush()

            # Sync images
            ProductImage.query.filter_by(product_id=product.id).delete()
            for idx, img_url in enumerate(images):
                db.session.add(ProductImage(
                    product_id=product.id,
                    image_url=normalize_image_url(img_url),
                    sort_order=idx,
                ))
                stats["images_synced"] += 1

            # Sync variants
            existing_variants = {
                (v.size, v.color): v
                for v in ProductVariant.query.filter_by(product_id=product.id).all()
            }

            seen_keys = set()
            for size in sizes:
                size = size.strip()
                key = (size, color)
                seen_keys.add(key)

                if key in existing_variants:
                    v = existing_variants[key]
                    v.sku = sku
                    v.is_active = True
                    if force_stock:
                        v.stock_quantity = initial_stock
                    stats["variants_updated"] += 1
                else:
                    db.session.add(ProductVariant(
                        product_id=product.id,
                        size=size,
                        color=color,
                        sku=sku,
                        stock_quantity=initial_stock,
                    ))
                    stats["variants_created"] += 1

            # Deactivate variants no longer in dataset
            for key, v in existing_variants.items():
                if key not in seen_keys:
                    v.is_active = False

    db.session.commit()
    logger.info("Import complete: %s", stats)
    return stats

