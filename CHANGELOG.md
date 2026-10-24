# Changelog

All notable changes to the Seema's Resort website are recorded here, newest first.
Dates are written as YYYY-MM-DD. For changes before 2026-10-22, see the repository commit history.

---

## 2026-10-23 — Split into a multi-page site

**Not changed:** design, colours, fonts, room carousels, the WhatsApp booking flow, and the Web3Forms email form.

### Added
- Seven pages: `index.html` (Home), `rooms.html`, `gallery.html`, `amenities-reviews.html`, `contact-booking.html`, `faq.html`, `terms.html`. Each has its own title, meta description, canonical URL, Open Graph / Twitter tags and one unique `<h1>`.
- Shared `css/style.css` and `js/main.js` (cached across pages). The script now works on any page; booking form and review pop-up code only run where those elements exist.
- Header, footer and mobile action bar on every page, with the current page highlighted in the menu (`aria-current="page"`) and a footer link row. "Home" appears in the mobile menu.
- Visible breadcrumbs and `BreadcrumbList` structured data on every inner page.
- A light page header (breadcrumb, `<h1>`, one-line intro) on every inner page, and an "Explore the resort" section on Home linking to each page.
- Gallery page now shows all 13 photos (resort and every room type), not just 3.
- "Check dates" on a room card now opens the booking page with that room already selected (`contact-booking?room=...`).
- Each room card has an `id` (for example `#room-elite-room`), so the room `@id` values in the structured data point at real anchors.

### Changed
- **Structured data moved to the page it describes:** full resort + rooms on Home; rooms and offers on Rooms; amenities and Google reviews on Amenities & Reviews; resort contact details + `ContactPage` on Contact & Booking; `FAQPage` on FAQ (generated from the visible questions and answers, so they match exactly).
- Room `url` and `@id` values in the JSON-LD now point at `rooms.html`.
- All internal links now point at the right page (for example `#book` became `contact-booking#book`).
- `sitemap.xml` lists all seven pages with their images and a new `lastmod`.
- The logo `<img>` now uses its real pixel size to avoid layout shift.
- `404.html` links to Rooms and Contact & Booking.

### Images
- Compressed `D46.jpg` (542 KB to about 214 KB) and `D48.jpg` (457 KB to about 229 KB).
- Deleted the stray files `images/a` and `images/logo s.webp`.

---

## 2026-10-22 — Technical SEO upgrade

Goal: rank higher on Google Search and Google Maps for "resort in Neral", "resort near Matheran / Karjat", weekend getaways from Mumbai and Pune, couple cottages, pool resorts and group outings.

**Not changed:** the visual design, CSS theme, room image carousels, the WhatsApp booking flow and the Web3Forms email form all work exactly as before.

### Changed — `index.html`

**Page title, description and brand**
- `<title>` is now: *Seema's Resort Neral | Best Pool Resort & Cottages Near Matheran & Karjat*
- Meta description (also used for Open Graph and Twitter cards) now names the highway, Matheran, the room types, the pool, rain dance and the AP buffet.
- `robots` meta now allows large image previews and unlimited text and video snippets: `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`.
- Brand name standardised to **Seema's Resort & Restaurant** (alternates: "Seema Resort", "Seema's Resort Neral") in the meta tags, structured data, logo alt text and footer.

**Headings** (search engines weight these heavily)

| Section | Old | New |
|---|---|---|
| Hero `<h1>` | Right on the highway. Best resort in Neral, near Karjat. | Seema's Resort & Restaurant, Neral — Best Pool Resort & Cottages Near Matheran & Karjat |
| Route strip | No detour required — we're right on the road | Highway-Touch Resort on Neral-Karjat Road — 1.5 to 2 Hrs from Mumbai & Pune |
| Check-in slots | Pick whichever slot fits your drive | Flexible Check-In Slots & Unlimited Buffet (AP Meal Plan) |
| Rooms | Featured rooms — plus more categories to choose from | AC Cottages, Couple Suites, Family Rooms & Dormitories in Neral |
| Amenities | Enough to fill a weekend without leaving the property | Resort with Swimming Pool, Rain Dance & Outdoor Games in Neral |
| Stays | A resort near Karjat for families, couples and groups | Family Stays, Couple Getaways & Group Outings Near Matheran & Karjat |
| Good to know | The fine print, before you book | Buffet Dining, Pool Timings & Resort Booking Policies |
| Gallery | Around the resort | Photos of Our Swimming Pool, Hill-Facing Rooms & AC Dining Hall |
| Reviews | What our guests say on Google | Guest Reviews for Seema's Resort Neral |
| Booking | Find us, then stop looking at the map | Location, Directions & Direct Room Booking — Seema's Resort Neral |
| FAQ | Frequently asked questions | Frequently Asked Questions About Seema's Resort Neral |

- The hero heading is now a two-tier heading (bigger name, smaller gold line) and the hero text box is 60px wider, so the longer text fits.

**FAQ**
- 4 new questions added, to both the visible FAQ and the `FAQPage` structured data (now 11 in total):
  distance from Neral station and Matheran, couple-friendly policy and ID, outdoor activities and games, and dormitories for groups and corporate outings.

**Getting there**
- The "Getting there" text under the booking section now covers road and train access, including the 3 km (5–10 min by auto-rickshaw) trip from Neral station.

**Image alt text**
- All 13 photos and the logo now have descriptive alt text: what the photo shows, plus "at Seema's Resort Neral near Matheran & Karjat".

### Added — structured data (JSON-LD)
- Business type is now `Resort` + `LodgingBusiness` + `Restaurant`, with `servesCuisine`.
- The 4 featured rooms (Deluxe Suite Couple Cottage, Elite Room, Couple Deluxe Premium Room, Family Executive Room) are listed as rooms with an `Offer` for the AP plan and one for room only, in INR (₹2,800 to ₹7,500).
- New amenities: Rain Dance, Kids' Pool, Kids' Play Area, Dormitories for Groups, Hill-Facing Rooms, Unlimited Veg & Non-Veg Buffet, On-site Restaurant.
- The 9 Google reviews shown on the page are included as `Review` objects (5 stars each).
- Logo, pets-not-allowed flag and more image URLs added.

### Fixed — content hidden from Googlebot
- **Problem:** about 80% of the page started at `opacity: 0` and was only revealed when scrolled into view. Crawlers that do not scroll could treat that content as hidden.
- **Fix:** nothing is hidden in the static HTML/CSS any more. A small script in `<head>` turns the fade-in animation on only for real browsers (not crawlers, headless tools or reduced-motion users), and only for blocks below the first screen. If a visitor does not scroll within 5 seconds, everything is revealed anyway.
- Tested: with a Googlebot user agent, 0 content blocks are hidden.

### Removed — test game
- The "Games" nav link, the whole `#play` section (Memory Match and Tic-Tac-Toe), its CSS and its JavaScript. This was test-only code that added weight and distracted from the page's keywords.

### Changed — `sitemap.xml`
- `lastmod` set to 2026-10-22.
- Now lists all 13 resort photos (pool, hill rooms, dining hall and every room photo) with descriptive `<image:title>` tags.

### Changed — documentation
- `README.md` rewritten: SEO features, a "keep these in sync" table, the animation rule, image and sitemap rules, a monthly SEO checklist.
- Wiki updated: Home, SEO, Images, Updating Content, and a new Change Log page.

### Known open items
- No one-day picnic FAQ yet. Add one when package details and prices are final.
- The Dasturi Naka FAQ answer gives no distance; add the exact figure from the resort if wanted.
- `D46.jpg` and `D48.jpg` are over the 250 KB image guideline; compress them.
- `images/a` (a 2-byte stray file) and `images/logo s.webp` (a space in the file name) should be cleaned up.
- Biggest remaining ranking levers are off the site: Google Business Profile, Google reviews, listings, and separate pages for rooms, dining, events and corporate outings.
