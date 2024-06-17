#!/bin/bash

# Get today's date in YYYY-MM-DD format
today=$(date -u +"%Y-%m-%d")

# Generate the sitemap
sitemap="<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">
  <url>
    <loc>https://argovis-api.colorado.edu/summary?id=argo_jsonld&amp;key=jsonld</loc>
    <lastmod>$today</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>"

# Write the sitemap to a file
echo "$sitemap" > /react/argovis/build/argo_sitemap.xml
