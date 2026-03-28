def normalize_image_url(url):
    """Ensure image URL has https:// scheme."""
    if not url:
        return url
    url = url.strip()
    if url.startswith("//"):
        return "https:" + url
    if not url.startswith("http://") and not url.startswith("https://"):
        return "https://" + url
    return url
