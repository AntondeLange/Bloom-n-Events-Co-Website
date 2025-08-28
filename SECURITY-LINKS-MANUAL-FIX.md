# 🔒 Manual Security Links Fix Guide

## What needs to be done:
Add `rel="noopener noreferrer"` to ALL external social media links in the footer of remaining pages.

## Files to fix:
- contact.html
- gallery.html  
- events.html
- workshops.html
- displays.html
- capabilities.html
- team.html
- policies.html
- tandcs.html
- 404.html

## Find and Replace Pattern:

**FIND:** `<a href="https://www.facebook.com/bloomneventsco/" aria-label="Facebook">`
**REPLACE:** `<a href="https://www.facebook.com/bloomneventsco/" aria-label="Facebook" rel="noopener noreferrer">`

**FIND:** `<a href="https://www.instagram.com/bloomneventsco/" aria-label="Instagram">`
**REPLACE:** `<a href="https://www.instagram.com/bloomneventsco/" aria-label="Instagram" rel="noopener noreferrer">`

**FIND:** `<a href="https://www.linkedin.com/in/tamara-de-lange-nee-lilly-3421825b/" aria-label="LinkedIn">`
**REPLACE:** `<a href="https://www.linkedin.com/in/tamara-de-lange-nee-lilly-3421825b/" aria-label="LinkedIn" rel="noopener noreferrer">`

**FIND:** `<a href="https://pin.it/1K3o7UFvI" aria-label="Pinterest">`
**REPLACE:** `<a href="https://pin.it/1K3o7UFvI" aria-label="Pinterest" rel="noopener noreferrer">`

**FIND:** `<a href="https://www.tiktok.com/@bloomneventsco" aria-label="TikTok">`
**REPLACE:** `<a href="https://www.tiktok.com/@bloomneventsco" aria-label="TikTok" rel="noopener noreferrer">`

## ✅ Already Fixed:
- index.html (homepage social CTAs + footer)
- about.html (footer)

## 🔍 How to verify:
After making changes, search each file for external links and ensure they all contain `rel="noopener noreferrer"`
