# **Petrol Pump Nearby — 7-Step Framework**

## **Step 1 — Data Fetch (APIs & radius)**

* **Radius runs:** 400 m (tight), 800 m (core), 1200 m (extended).

* **APIs:**

  * **Places Nearby / TextSearch:** `gas_station`

  * **Place Details:** `name, types, rating, user_ratings_total, business_status, reviews.text, photos`.

  * **Street View Static:** frontage size, forecourt, branding boards, parking lanes.

  ---

  ## **Step 2 — What to Query (deep dive \+ examples)**

👉 Query ko sirf “petrol pump hai ya nahi” tak limit mat karo. Tumhe **type, brand, scale, aur customer behaviour** pakadna hai.

### **(A) Fuel Company / Brand Signal**

* **Premium PSU/Private brands:** Indian Oil, HP, BPCL, Reliance, Nayara, Shell.

* Shell, Reliance, Nayara → affluent car crowd, premium fuels.

* Indian Oil/HP/BPCL → mass coverage, mixed crowd.

  ### **(B) Size / Infra**

* Large format pumps on highways/arterials: multiple fueling bays, CNG/diesel, attached ATMs.

* Small “basti” pumps: 1–2 bays, congested.

  ### **(C) Add-on Ecosystem (very important for footfall proxy)**

* Convenience store: “IOCL Xpress Mart”, “HPCL Club HP”.

* Food courts: McDonald’s, KFC, CCD, Subway (attached with pump).

* Service stations: tyre, puncture, car wash, nitrogen air.

* ATM presence.

  ### **(D) Review Keywords**

* **Positive:** “24x7”, “clean washroom”, “card/UPI accepted”, “air station available”.

* **Negative:** “short fuel”, “long queue”, “cash only”, “crowded”.

  ### **(E) Traffic Profile (indirect cues)**

* Highways pumps: truck-heavy.

* City arterial pumps: cars \+ 2-wheelers.

* Local galli pumps: mostly 2-wheelers.

  ---

  ## **Step 3 — Proxies / Signals**

1. **Brand type:** Shell/Reliance/Nayara → premium catchment; PSU → mass.

2. **Scale:** multiple bays \+ attached CNG/diesel → large pump.

3. **Add-on ecosystem:** F\&B, convenience store, washroom → strong non-fuel footfall.

4. **Business status:** “Open 24x7” vs “closed at night”.

5. **Ratings/URT:** higher URT → popular/large volume pump.

6. **Reviews cues:** safe/clean vs shady/crowded.

   ---

   ## **Step 4 — Interpret / Normalize**

* Build a **Pump Quality Index (0–100):**

  * Brand (premium vs mass) → 25%

  * Scale (bays, CNG/diesel) → 20%

  * Add-on ecosystem (F\&B, store, washroom) → 25%

  * Popularity (URT, rating) → 15%

  * Service quality (review sentiment) → 10%

  * Business hours (24x7 bonus) → 5%

  ---

  ## **Step 5 — Slab Assignment Rules**

* **Slab 1 — Weak / Low value pump**

  * Small local pump, 1–2 bays, no add-ons.

  * URT \<50, reviews negative (“fraud”, “long queue”).

* **Slab 2 — Basic PSU pump**

  * Normal Indian Oil/HP/BPCL, limited bays.

  * No F\&B, only basic air/washroom.

* **Slab 3 — Standard organized pump**

  * Bigger PSU/Private, multiple bays, URT \~100–200.

  * Some add-ons (ATM, car wash, 24x7).

* **Slab 4 — Premium pump hub**

  * Shell/Reliance/Nayara or large PSU with **convenience store \+ F\&B \+ washroom**.

  * URT ≥200, reviews highlight “clean, safe, 24x7”.

* **Slab 5 — Destination pump complex**

  * Highway/arterial mega pump: Shell/Reliance with **McDonald’s/KFC/Subway \+ store \+ service station**.

  * URT ≥500, review sentiment strong.

  ---

  ## **Step 6 — Integration into Location Engine**

* **Weightage:** 1–3% only (supportive, not direct sales driver).

* **Use case:**

  * Slab 1–2 → ignore for decision.

  * Slab 3 → stable but not differentiator.

  * Slab 4–5 → extra anchor, especially for delivery riders (food \+ fuel combo).

* **Confidence:** depends on review density & Street View clarity.

  ---

  ## **Step 7 — Example Output**

* **Petrol Pump Slab:** **4** (Pump Quality Index 72, confidence 78).

* **Why:** “Nearby Reliance pump with Xpress Mart \+ CCD; 24x7, URT 310, reviews: ‘clean washrooms, UPI accepted’. Multiple fueling bays visible in Street View.”

* **Interpretation:** Pump doubles as F\&B \+ pitstop node. Good support for snack/delivery business.  
* 

  # **Food Brand Presence —** 

  # **Step 1 — Data Fetch (APIs & radius)**

* **Radius runs:** 400 m (tight catchment), 800 m (core), 1200 m (extended).

* **APIs:**

  * **Places Nearby / TextSearch**: `restaurant`, `cafe`, `fast_food`, `meal_takeaway`, `meal_delivery`, `bakery`, `food_court`.

  * **Place Details:** `name`, `types`, `rating`, `user_ratings_total`, `price_level`, `opening_hours`, `reviews.text`.

  * **Street View Static:** check frontage (mall food court vs local dhaba).

  ---

  ## **Step 2 — What to Query (deep dive \+ brand examples)**

👉 isko 4 layer me tod do: 

**Global QSR, Indian National Chains, Regional Chains, Local/Street Players.**

### **A) Global QSR (High weight — premium signal)**

* **Burgers:** McDonald’s, Burger King, Wendy’s.

* **Pizza:** Domino’s, Pizza Hut, Papa John’s, Sbarro.

* **Chicken:** KFC, Popeyes.

* **Coffee/Café:** Starbucks, Costa, Tim Hortons, Dunkin Donuts.

* **Bakery/Donuts:** Krispy Kreme.

  ### **B) Indian National Chains (Pan-India presence, mid-premium signal)**

* **Wow\! Momo, Wow\! China, Biryani Blues, Behrouz Biryani, Faasos (Rebel Foods), Box8, Oven Story, FreshMenu, EatSure brands.**

* **South Indian:** Sagar Ratna, Vaango, Adyar Ananda Bhavan, Saravana Bhavan.

* **Café chains:** CCD, Chaayos, Chai Point, Haldiram’s (restaurant formats), Bikanervala.

  ### **C) Regional Chains (strong in Tier 2–3, category leaders)**

* **North India:** Nirula’s, Karim’s, Al-Bake, BTW (Bittoo Tikki Wala).

* **South India:** Meghana Biryani, Paradise Biryani, Truffles (BLR), Empire (BLR).

* **West:** Shiv Sagar, Natural Ice Cream, Gajalee.

* **East:** Keventers (milkshakes), Bhojohori Manna, Arsalan (Kolkata).

  ### **D) Local/Street Food Aggregates (mass signal)**

* “Momo stall”, “Chaat corner”, “Rolls”, “Tandoori momo”, “Chinese fast food”.

* Keywords: *“street food”, “dhaba”, “snack corner”, “fast food joint”*.

* Indicators: “₹” price-level, low URT, avg rating 3.5–3.8.

  ---

  ## **Step 3 — Proxies / Signals**

* **Brand tier mix:** count how many **global QSR / national / regional / local** within radius.

* **Density:** higher number \= mature F\&B catchment.

* **Price proxy:** `price_level` → 1=budget, 2–3=mid, 4=luxury dining.

* **Review cues:** “family dining”, “delivery”, “student hangout”.

* **Footfall proxy:** URT ≥ 500 \= high churn/volume; \<150 \= niche or weak.

* **Daypart coverage:** breakfast cafés, lunch thalis, late-night outlets.

  ---

  ## **Step 4 — Interpret / Normalize**

* **Weights:**

  * Global QSR count → 30%

  * Indian National Chains → 25%

  * Regional Chains → 20%

  * Local eateries density → 15%

  * Price & review quality → 10%

* Create **Food Brand Presence Index (0–100)** \= weighted average.

  ---

  ## **Step 5 — Slab Assignment Rules**

* **Slab 1 — Basic / Street-led**

  * 90%+ outlets local, no branded chains, only small eateries.

* **Slab 2 — Semi-organized**

  * 1–2 regional chains, mostly local.

  * No global/national QSR.

* **Slab 3 — Mixed catchment**

  * 2–3 national chains or 4+ regional, local strong.

  * 1–2 global QSR possible but not clustered.

* **Slab 4 — Organized hub**

  * 3–4 global QSR \+ 4+ national chains.

  * URT median ≥ 300, price\_level mid-high.

* **Slab 5 — Premium F\&B cluster**

  * Multiple global QSR (≥5) \+ multiple national chains.

  * Reviews: “high street”, “mall food court”, “expensive”.

  * Example: Connaught Place, Cyber Hub, Phoenix Marketcity.

  ---

  ## **Step 6 — Integration into Location Engine**

* **Weightage:** 5–8% (Food brand presence \= maturity proxy, not primary driver).

* **Use case:**

  * Slab 1–2 → untapped demand, but risk (no organized F\&B crowd).

  * Slab 3 → best balance (street \+ branded co-exist).

  * Slab 4–5 → competitive but validated demand; rent high, ROI check required.

  ---

  ## **Step 7 — Example Output**

* **Food Brand Presence Slab:** **3** (Index 58, confidence 80).

* **Why:** “Nearby: Domino’s, Wow\! Momo, CCD (national chains), 1 KFC (global), 7 local eateries (momos, rolls). URT median \~260, price\_level \~2.”

* **Interpretation:** Balanced mid catchment → good for cart/kiosk. Delivery brands already active → demand proven.  
* 

  # **CLOTHING BRAND PRESENCE — 7-Step Framework**

  ## **Step 1 — Data Fetch (APIs & radius)**

* **Radius runs:** 400 m (tight), 800 m (core), 1200 m (extended)

* **APIs:**

  * **Places Nearby/TextSearch:** `clothing_store`, `department_store`, `shopping_mall`, `store`

  * **Place Details:** `name, types, rating, user_ratings_total, price_level, opening_hours, reviews.text, photos`

  * *(Optional)* **Street View Static:** façade quality, mall frontage, anchor signage

    ---

    ## **Step 2 — What to Query (deep \+ brand examples)**

Layered query \= **Luxury → Premium/Fast Fashion → Mid/National → Value/Budget → Ethnic/Boutique**.  
 Use TextSearch with brand names \+ generic keywords.

### **(A) Luxury / Designer (Slab-5 signal)**

* **Brands (mono-brand & luxury MBO):** Louis Vuitton, Gucci, Dior, Chanel, Hermès, Prada, Burberry, Armani, Versace, Fendi, Balenciaga, Zegna, Moncler, Bottega Veneta, **Hugo Boss** (upper-premium), Coach, Michael Kors, Tory Burch, Kate Spade

* **Keywords:** “boutique”, “couture”, “luxury”, “designer”, “haute”

* **Place type combos:** `clothing_store` \+ `shopping_mall` (luxury mall), reviews: “expensive”, “valet”, “concierge”

  ### **(B) Premium / International Fast Fashion (Slab-4 signal)**

* **Fast fashion & intl premium:** Zara, H\&M, Uniqlo, Massimo Dutti, Mango, Marks & Spencer, Superdry, GAP (city-dependent), Abercrombie (rare), Hollister (rare)

* **Premium American/Euro labels (apparel/accessories):** Tommy Hilfiger, Calvin Klein, US Polo Assn, GANT, Guess, Nautica

* **Keywords:** “flagship”, “trial rooms”, “exchange policy”, “new collection”

  ### **(C) Indian National / Mid Organized (Slab-3 signal)**

* **Department/anchors:** Lifestyle, Westside, Shoppers Stop, Pantaloons

* **Mens/formals:** Raymond, Park Avenue, ColorPlus, Van Heusen, Louis Philippe, Allen Solly, Peter England, Blackberrys

* **Denim/casual:** Levi’s, Wrangler, Lee, Pepe, Jack & Jones, Flying Machine, Spykar, Killer, Mufti

* **Ethnic (national):** Fabindia, Manyavar, Biba, W, Aurelia

* **Kids/Maternity:** FirstCry (retail), Mothercare (where present)

  ### **(D) Value/Budget Organized (Slab-2 signal)**

* **Value chains:** Zudio, Reliance Trends, Max Fashion, Easybuy, V-Mart, Vishal Mega Mart, Citykart

* **Keywords:** “factory outlet”, “sale”, “discount”, “budget”

  ### **(E) Local / Ethnic / Boutique / Tailoring (Slab-1 to 3 spread)**

* Saree/lehenga houses, fabric stores, tailor/boutique (non-chain)

* **Keywords:** “saree”, “lehenga”, “boutique”, “tailor”, “fabric”, “wholesale”

* *Signal nuance:* heavy fabric/wholesale clusters → budget/occasion-led, not premium dailywear

**Extra query boosters (any tier):**

* “factory outlet”, “outlet store”, “warehouse sale” (value bias)

* Mall anchors list in one go (Lifestyle, Westside, Zara, H\&M, M\&S) to detect **anchor strength**

  ---

  ## **Step 3 — Proxies / Signals**

* **Brand-tier mix:** luxury / premium / mid / value counts & diversity

* **Anchor strength:** \# of anchors (Lifestyle/Westside/Shoppers Stop/Pantaloons) \+ \# of **intl fast fashion** anchors

* **Popularity:** median **URT** & count of high-URT stores (e.g., ≥500)

* **Price proxy:** `price_level` median (if present); reviews with “expensive/affordable”

* **Quality cues (reviews):** “trial rooms clean”, “staff helpful”, “exchange hassle-free”

* **Form factor:** mall presence, high-street façades, window displays (Street View/photos)

  ---

  ## **Step 4 — Interpret / Normalize → Clothing Index (0–100)**

Suggested weights (calibrate later):

* Brand-tier composition **35%** (Luxury=100, Premium=75, Mid=55, Value=30 scaled by counts)

* Anchor strength **20%** (≥2 anchors \+ intl fast fashion \= big boost)

* Popularity (URT) **15%**

* Price proxy **10%**

* Category diversity **10%** (men/women/kids/ethnic/denim)

* Rating & review quality **10%**

City-wise min–max normalize on a rolling baseline.

---

## **Step 5 — Slab Assignment (deterministic)**

* **Slab 1 — Local/Value lane:** value chains \+ local boutiques, **no** anchors/intl; low URT, sale/discount heavy

* **Slab 2 — Organized value:** Zudio/Max/Trends present; single anchor possible; no intl fast fashion

* **Slab 3 — Mid organized hub:** 2+ anchors (Lifestyle/Westside/SS/Pantaloons), denim/formal brands cluster; limited intl

* **Slab 4 — Premium high street/mall:** Zara/H\&M/Uniqlo/M\&S ≥1, anchors ≥2; URT↑; price\_level ≥2.5

* **Slab 5 — Luxury retail node:** 1–2+ luxury mono-brands or luxury MBO \+ intl fast fashion 2+; premium mall corridor

**Tie-breakers:** intl fast fashion **≥2** ⇒ min Slab-4; luxury mono-brand present ⇒ push to Slab-5 (context check 800–1200 m).

---

## **Step 6 — Integration in tool**

* **Weight (default):** 3–5% (shopping maturity proxy)

* **Use with Spending Capacity/Nightlife** to judge aspirational pull & weekend crowd

  ---

  ## **Step 7 — Example Output**

* **Clothing Slab:** **4** (Index 71, confidence 84\)

* **Why:** “Anchors: Westside \+ Lifestyle; intl: Zara \+ H\&M; denim: Levi’s/J\&J; URT median \~520; reviews ‘expensive but good exchange’.”

* **Note:** “Premium-leaning; luxury absent → price to mid-premium, not luxe.  
  * 

  # **FOOTWEAR BRAND PRESENCE — 7-Step Framework**

  ## **Step 1 — Data Fetch (APIs & radius)**

* **Radius runs:** 400 m / 800 m / 1200 m

* **APIs:**

  * **Places Nearby/TextSearch:** `shoe_store`, `store`, `shopping_mall`

  * **Place Details:** `name, types, rating, user_ratings_total, price_level, opening_hours, reviews.text, photos`

  * *(Optional)* Street View for façade & mall positioning

  ---

  ## **Step 2 — What to Query (deep \+ brand examples)**

Layered query \= **Luxury → Premium/Intl Sports & Fashion → Mid/National → Value/Budget**.

### **(A) Luxury / Designer (Slab-5 signal)**

* Christian Louboutin, Jimmy Choo, Salvatore Ferragamo, Tod’s, Bally, Gucci, Prada, Louis Vuitton, **Fendi**

* Keywords: “designer shoes”, “luxury footwear”, “boutique”

  ### **(B) Premium / International Sports & Fashion (Slab-4 signal)**

* **Sports/sneakers:** Nike, Adidas, Puma, New Balance, Asics, Reebok (select), Under Armour (limited), Skechers

* **Casual/fashion:** Aldo, Steve Madden, Birkenstock, Crocs, Vans, Converse, Timberland, Clarks, Hush Puppies, Cole Haan

* **Outdoor/boots:** Woodland, Decathlon (sporting goods but footwear traffic driver)

* Keywords: “factory outlet”, “sneaker”, “authentic”, “exclusive store”, “brand outlet”

  ### **(C) Mid / Indian National & Multi-brand (Slab-3 signal)**

* Metro Shoes, Mochi, Regal, Pavers England, Clarks (in some markets), Bata (premium lines/Hush Puppies), Red Tape (shoes), Liberty, Khadim’s

* Multi-brand stores with genuine mix across price points

  ### **(D) Value / Budget Organized \+ Mass (Slab-1–2 signal)**

* Bata (budget), Relaxo (Sparx/Flite), Paragon, Campus, Action, local chappal/sandal stores, wholesale bazaars

* Keywords: “discount”, “wholesale”, “budget footwear”, “school shoes”

**Extra query boosters:** “orthopedic shoes”, “formal shoes men”, “bridal footwear”, “kids shoes”, “sports outlet”, “warehouse outlet”, “sneaker resale” (affluence/enthusiast proxy)

---

## **Step 3 — Proxies / Signals**

* **Brand-tier mix:** luxury / premium / mid / value counts

* **Specialization markers:** sneaker boutiques, running specialty, hiking/outdoor (affluent hobbyist signal)

* **Popularity:** median URT \+ count of URT≥300 shoe stores

* **Price proxy:** `price_level` \+ reviews (“MRP”, “discount”, “overpriced”, “authentic”)

* **Quality cues:** “genuine”, “warranty”, “exchange”, “sizes availability”

* **Mall anchor ties:** Nike/Adidas/Skechers/Aldo often cluster in premium malls

  ---

  ## **Step 4 — Interpret / Normalize → Footwear Index (0–100)**

Suggested weights:

* Brand-tier composition **40%** (Luxury=100, Premium=75, Mid=55, Value=30)

* Popularity (URT) **20%**

* Price proxy **10%**

* Specialization markers **15%** (sneaker/running/outdoor)

* Rating & review quality **10%**

* Mall/high-street form factor **5%**

City baseline min–max normalize.

---

## **Step 5 — Slab Assignment**

* **Slab 1 — Budget footwear lane:** Local/value brands dominate; “discount/wholesale” heavy; low URT

* **Slab 2 — Organized value:** Bata/Liberty/Khadim’s cluster; few mid MBO; no global sports/premium

* **Slab 3 — Mid organized hub:** Metro/Mochi \+ Hush Puppies/Clarks; some sports (Skechers)

* **Slab 4 — Premium/sports corridor:** Nike/Adidas/Puma/Skechers \+ Aldo/Steve Madden/Birkenstock; higher URT & price\_level

* **Slab 5 — Luxury footwear node:** Louboutin/Jimmy Choo/Ferragamo present, often alongside luxury apparel; premium mall/high street

**Tie-breakers:** ≥3 global sports mono-brand stores within 800 m ⇒ min Slab-4; a single luxury mono-brand ⇒ Slab-5 (context-check).

---

## **Step 6 — Integration in tool**

* **Weight (default):** 2–3% (supporting affluence proxy)

* Combine with **Clothing Index \+ Shopping Preferences** to sharpen spending profile

  ---

  ## **Step 7 — Example Output**

* **Footwear Slab:** **3** (Index 59, confidence 80\)

* **Why:** “Metro \+ Mochi \+ Hush Puppies; 1 Skechers; URT median \~310; reviews ‘genuine & exchange friendly’; no Nike/Adidas mono-brand nearby.”

* **Note:** “Mid-organized; premium sports missing → aspirational but not luxe.”

  ---

  ## **Quick Implementation Tips (dono categories)**

* **De-dup per brand per mall** (same brand multiple pins \= 1 count)

* **Use 800 m as base**; 400 m/1200 m for **consistency** flags (mixed corridor)

* **Photos/Street View**: window displays, store size, mall corridors help differentiate premium vs value when price\_level missing

* **Reviews window**: last 12–18 months keywords weight karo (“expensive”, “authentic”, “sale”)  
* 

  # **Nearby Schools / Colleges — 7-Step Framework (Google-only)**

  ## **Step 1 — Data Fetch (APIs & radius)**

* **Radius runs:** 400 m (tight), 800 m (core), 1200 m (extended).

* **APIs:**

  * **Places Nearby / TextSearch:** `school`, `secondary_school`, `primary_school`, `university`, `college`, `library`, `book_store`, `training`, `institute`.

  * **Place Details:** `name`, `types`, `rating`, `user_ratings_total`, `opening_hours`, `reviews.text`, `photos`.

  * **Street View Static:** gates, playgrounds, coaching banners, student crowds.

  ---

  ## **Step 2 — What to Query (deep dive \+ examples)**

  ### **(A) Schools (K-12)**

* **Premium/International:** DPS, Ryan International, GD Goenka, Amity, Pathways, Heritage, Indus, Oakridge.

* **CBSE/ICSE Affiliated:** St. Xavier’s, St. Mary’s, Apeejay, DAV, Birla Vidya Niketan, La Martiniere.

* **Budget/Local Schools:** “Public School”, “Model School”, “Convent School”, “Children’s Academy”.

* **Keywords in reviews:** “fees high/affordable”, “CBSE board”, “ICSE syllabus”, “hostel facility”.

  ### **(B) Colleges / Universities**

* **Top National/Private:** Delhi University, Amity University, Symbiosis, Christ, SRCC, JNU, IITs/NITs.

* **Regional Private Colleges:** Manav Rachna, Lovely Professional University (LPU), Galgotias, Bennett, Sharda, Chitkara.

* **Professional Institutes:** IHM (Hotel Mgmt), NIFT, NID, AIIMS/Nursing Colleges, Law Colleges.

* **Keywords:** “campus”, “placements”, “canteen”, “hostel”, “students”.

  ### **(C) Coaching / Tuition Ecosystem (strong student signal)**

* **National Coaching Brands:** Aakash, Allen, FIITJEE, Byju’s, Career Launcher, Resonance, Narayana.

* **Local Coaching Hubs:** “XYZ Academy”, “XYZ Tutorials”, “XYZ Classes”.

* **Keywords in reviews:** “NEET/JEE coaching”, “CAT prep”, “SSC coaching”, “affordable fees”.

  ### **(D) Support Ecosystem**

* **Libraries/Bookstores:** “City Library”, “State Library”, “Exam Library”, “Book Depot”.

* **Stationery Shops / Xerox / Cafes near colleges:** indicates student zones.

  ---

  ## **Step 3 — Proxies / Signals**

1. **Count density:** total \#schools, \#colleges, \#coaching institutes within 800 m.

2. **Tier of institutions:** Premium/International vs Govt vs Budget.

3. **Scale proxies:** reviews, photos (multi-building campus \= bigger).

4. **URT & Rating:** high URT colleges \= large active student body.

5. **Reviews cues:** “canteen”, “hostel”, “admissions”, “placements”, “crowded”.

6. **Daypart proxy:** coaching \= evening-heavy; schools \= morning-afternoon; universities \= all day.

7. **Street View cues:** student uniforms, crowd near gates, food stalls around.

   ---

   ## **Step 4 — Interpret / Normalize (build Education Index 0–100)**

Suggested weights:

* Count density (schools/colleges/coaching) → **30%**

* Tier/quality (premium vs budget) → **25%**

* URT & Rating → **15%**

* Reviews/keywords (student volume) → **15%**

* Support ecosystem (libraries, bookshops, canteens) → **10%**

* Street View validation → **5%**

  ---

  ## **Step 5 — Slab Assignment Rules**

* **Slab 1 — Very weak education presence**

  * Only 1–2 small local schools, no college/coaching, URT \<50.

* **Slab 2 — Budget schools / few coaching**

  * 2–3 small schools \+ 1 coaching institute, no big college.

  * Reviews: “affordable fees”, “basic facilities”.

* **Slab 3 — Mid cluster**

  * Mix of 2–3 reputed schools \+ 1–2 colleges OR 3–5 coaching institutes.

  * URT 100–200, reviews mention “canteen”, “hostel nearby”.

* **Slab 4 — Strong education hub**

  * ≥3 reputed schools \+ 2 colleges/universities OR 5+ coaching centers.

  * URT ≥300, keywords: “crowded with students”, “placements”.

* **Slab 5 — Prime student zone**

  * University cluster OR famous coaching hub (Kota, Mukherjee Nagar, Kota Road Patna, Kota-like areas).

  * 1–2 universities \+ 10+ coaching \+ multiple hostels.

  * Reviews/photos: heavy student footfall.

  ---

  ## **Step 6 — Integration in Location Engine**

* **Weightage:** 7–10% (student crowd is core driver for momos/snacking).

* **Interpretation:**

  * Slab 1–2: weak student catchment, don’t target carts here.

  * Slab 3: balanced → good for cart.

  * Slab 4–5: strong repeat student base → priority expansion.

  ---

  ## **Step 7 — Example Output**

* **Nearby Schools/Colleges Slab:** **4** (Index 69, confidence 83).

* **Why:** “2 reputed schools (DPS, Ryan), 1 private university (Amity), 4 coaching institutes (Aakash, Allen, 2 locals); URT median \~280; reviews ‘students crowd outside for snacks’.”

* **Interpretation:** Student-heavy, strong for **cart or kiosk format**. Delivery model secondary.  
* 

# 

# **Footfall**  

## **1\. Digital Proxies (Google \+ APIs)**

* **Google Reviews Count (user\_ratings\_total)**

  * Zyada reviews \= zyada log aate hain.

  * Eg. 50 reviews (low), 200–500 (mid), 1000+ (high).

* **Opening Hours / Peak Hours (from Google Popular Times if accessible)**

  * Sunday evening busy \= family crowd.

  * Weekdays lunch busy \= office crowd.

* **Category Mix**

  * Nearby schools/colleges → youth/student footfall.

  * Offices/IT parks → office lunch footfall.

  * Malls/high street → shopping \+ weekend crowd.

* **Transport Access**

  * Bus stand, metro, parking, petrol pump \= high mobility → higher footfall.

* **Street View (if available)**

  * Footpath width, number of parked vehicles, visible pedestrians.

---

## **2\. Physical Proxies (On-Ground ya Telco data)**

(agar tum data buy karte ho ya kabhi pilot me banda bhejte ho)

* **Vehicle mix count** (2W vs cars vs SUV).

* **Pedestrian count sample** (5 min interval average).

* **Weekly bazaar / event ground nearby**.

* **Mobile tower density (Airtel/Jio insights)**.

---

## **3\. Economic Proxies**

* **Rent per sqft (MagicBricks, Propstack)**

  * Low rent \= mass crowd.

  * High rent \= posh footfall.

* **Avg ticket size of nearby restaurants (Zomato/Swiggy scraping)**.

* **Brand presence (our Food/Clothing/Footwear slabs)**.

---

# **🟢 Part 2: Slabing (1 se 5\)**

Main tumhe ek **uniform framework** de raha hoon, jisme tum Footfall ko 5 slabs me tod sakte ho:

---

### **Slab 1 – Garib/Mass Footfall**

* Indicators:

  * 90% 2-wheelers, autos, tractors.

  * Govt schools \+ budget chai/lassi stalls dominate.

  * Reviews count low (\<50 per POI).

  * Rent \< ₹50/sqft.

  * Nearby: small dhabas, Relaxo/Bata, Vishal Mega Mart.

* Typical crowd: **daily wage, lower middle-class**.

---

### **Slab 2 – Budget Low-Mid Footfall**

* Indicators:

  * 70% 2W, some hatchbacks.

  * Budget private schools, small colleges.

  * Reviews 50–200.

  * Rent ₹50–100/sqft.

  * Brands: Chai Sutta Bar, Max, Pantaloons, Bata, Khadim’s.

* Typical crowd: **small town salaried, shopkeepers**.

---

### **Slab 3 – Mid Market Footfall**

* Indicators:

  * Mix 50% 2W \+ 50% cars.

  * CBSE/ICSE schools, established private colleges.

  * Reviews 200–500.

  * Rent ₹100–200/sqft.

  * Brands: Wow\! Momo, Haldiram’s, Bikanervala, Lifestyle, Metro Shoes.

* Typical crowd: **middle-class families \+ students \+ office mix**.

---

### **Slab 4 – Premium Footfall**

* Indicators:

  * Cars/SUVs dominate.

  * Premium private/International schools nearby.

  * Reviews 500–1000.

  * Rent ₹200–400/sqft.

  * Brands: Starbucks, Chaayos, Blue Tokai, Zara, H\&M, Nike/Adidas outlets.

* Typical crowd: **upper middle class, aspirational youth**.

---

### **Slab 5 – Posh/Elite Footfall**

* Indicators:

  * SUVs \+ luxury cars.

  * Elite IB/IGCSE boarding schools nearby.

  * Reviews \>1000 per POI, avg rating \>4.2.

  * Rent ₹400+/sqft.

  * Brands: McDonald’s flagship, LV, Gucci, Jimmy Choo, Doon School, Pathways World.

* Typical crowd: **affluent, high spenders**.

# **Target Audience Fit (TAF)**

---

## **1\. Step 1 – Data uthao Google Maps se**

Google Places API se tumko ye sab data lena hai (800 meter radius me search karo, fir 400m aur 1200m bhi compare karna useful hoga):

* Name of place

* Types (restaurant, café, school, clothing store, etc.)

* Rating

* Total reviews (user\_ratings\_total)

* Price level (0–4)

* Opening hours

* Business status (open/closed)

* Reviews text (keywords)

---

## **2\. Step 2 – 4 Audience buckets define karo**

hamare brand ke liye location ko 4 type ki audience se judge karna hai:

* **Students/Youth** → schools, colleges, coaching centers, budget cafés

* **Office crowd** → offices, co-working, banks, business parks, lunch cafés

* **Families** → apartments, residential societies, parks, schools for kids, grocery stores

* **Aspirational Youth** → Starbucks, premium cafés, gyms, boutique clothing, bars, malls

---

## **3\. Step 3 – Har bucket ke liye signals**

**Students/Youth**

* Schools, universities, coaching centers, libraries nearby

* Budget cafés (Chai Sutta, MBA Chaiwala, Keventers kiosks)

* Agar aise POI ke reviews \>100 to matlab regular student crowd

**Office Crowd**

* “Co-working”, “IT Park”, “Business Park”, offices ke names

* Banks aur courier hubs nearby

* Lunch cafés jo afternoon me open hote hain

**Families**

* “Apartment”, “Society”, “Township” type names

* Parks, kids schools (play school, Montessori)

* Grocery/supermarkets aur casual family dining

**Aspirational Youth**

* Starbucks, Blue Tokai, Third Wave, Costa Coffee, premium gyms

* Premium brands (Zara, H\&M, Uniqlo)

* Bars, multiplexes

* Price level 3+ aur reviews 500+

---

## **4\. Step 4 – Har audience ka ek index banao**

* Students/Youth Index → jitne jyada schools, colleges, coaching \+ budget cafés, utna high score

* Office Index → jitne jyada offices, co-working spaces, utna high score

* Family Index → jitne jyada apartments, schools, parks, utna high score

* Aspirational Youth Index → jitne jyada premium cafés, gyms, malls, utna high score

---

## **5\. Step 5 – Target Audience Fit (TAF) score nikalo**

* Har index ko normalize karke (0–100 scale) combine karo

* Example weights:

  * Students 30%

  * Office 30%

  * Families 20%

  * Aspirational Youth 20%

* Iska final average nikalo → ye TAF % hoga

---

## **6\. Step 6 – Slabs me map karo (1 \= garib, 5 \= posh)**

* **Slab 1 (Garib/Mass):** TAF \<35, price\_level 0–1, mostly local stalls/schools, reviews kam

* **Slab 2 (Budget):** 35–50, kuch private schools/coaching, budget cafés, offices sparse

* **Slab 3 (Mid):** 50–65, students+offices dono visible, national food brands, avg price 2

* **Slab 4 (Premium):** 65–80, co-working/IT hubs \+ premium cafés \+ malls, avg price 2.5+

* **Slab 5 (Posh/Elite):** 80+, premium cafés cluster, Zara/H\&M type stores, international schools, SUVs visible

---

## **7\. Step 7 – Adjustments (Google-only signals se)**

* Agar nearest metro/bus ≤ 8 min hai → thoda score aur increase karo (accessibility)

* Agar area ke cafés raat 10–11 tak open rehte hain → aspirational youth fit aur strong hai

* Agar reviews me “expensive”, “premium”, “clean washroom” type keywords zyada milte hain → posh signal

---

## **8\. Step 8 – Output kya hona chahiye**

Har location evaluation ke liye tumhare tool ko ye dena chahiye:

* Final **TAF %** (0–100)

* Assigned **Slab (1–5)**

* Breakdown: Students %, Office %, Family %, Aspirational %

* Key reasons (jaise: “2 co-working spaces \+ 3 premium cafés nearby”)

* Confidence level (kitna data mila aur kitna consistent tha)

# **Competition Pricing (Momo)**

# **Step 1 – Google Maps API se data uthao**

* **Places API (NearbySearch/TextSearch)**

  * Query: `"momo" OR "momos" OR "dumpling" OR "restaurant" OR "cafe"`

  * Radius: 800m (plus 400m & 1200m for context)

* **Place Details API**

  * Fields:

    * `name`

    * `types`

    * `rating`

    * `user_ratings_total`

    * `price_level` (0–4, given by Google)

    * `reviews.text` (keywords like “cheap”, “affordable”, “expensive”, “overpriced”)

    * `photos` (optional, outlet size proxy)

---

# **🔍 Step 2 – Competition Pricing ke liye proxies**

1. **Google Price Level**

   * 0 \= free/unknown

   * 1 \= budget cheap

   * 2 \= moderate

   * 3 \= expensive

   * 4 \= very expensive

2. **Menu references in Reviews**

   * “50 rupees momos”, “100 for plate” → cheap

   * “Rs. 200+ for momos” → premium

3. **Brand Name as Proxy**

   * Local cart/dhaba → budget

   * Wow\! Momo, Nazeer, Biryani Blues → mid

   * Starbucks, premium cafés offering momos (rare) → posh

4. **Outlet Type (types field)**

   * `fast_food` \= usually cheap/mid

   * `cafe` \= mid-premium

   * `restaurant` with international/dining vibe \= posh

---

# **🔍 Step 3 – Slab Assignment (Competition Pricing for Momos)**

### **Slab 1 – Budget / Street Pricing**

* Price\_level \= 0–1

* Avg momo plate ≤ ₹70–80

* Keywords: “cheap”, “affordable”, “roadside”, “galli momos”

* Outlets: carts, local dhabas, hawker stalls

* Audience: daily-wage, students low spend

---

### **Slab 2 – Entry-level Organized Pricing**

* Price\_level \= 1–2

* Momo plate ₹80–120

* Brands: local cloud kitchens, Chatori Zaika, Aggarwal fast food joints

* Keywords: “reasonable”, “budget friendly”

* Outlets: small dine-in cafés or kiosks

* Audience: lower middle class, small-town office-goers

---

### **Slab 3 – Mid-Market Pricing**

* Price\_level \= 2

* Momo plate ₹120–180

* Brands: Wow\! Momo, Haldiram’s side menu, Biryani Blues momos, Faasos

* Keywords: “good value”, “decent price”

* Outlets: branded kiosks, mall food courts, quick dine-in

* Audience: middle class, students \+ families

---

### **Slab 4 – Premium Casual Pricing**

* Price\_level \= 2–3

* Momo plate ₹180–250

* Brands: premium cafés (Chaayos serving momos, Third Wave/Blue Tokai experiment menus)

* Keywords: “pricey but tasty”, “nice ambience”, “worth the money”

* Outlets: premium cafés, malls in metro cities

* Audience: aspirational youth, working professionals

---

### **Slab 5 – Posh / Elite Pricing**

* Price\_level \= 3–4

* Momo plate ₹250+

* Brands: high-end restaurants, fine dining menus (e.g. Pan-Asian outlets in 5-star hotels)

* Keywords: “expensive”, “luxury dining”, “gourmet dim sum”

* Outlets: fine dining, luxury hotels, posh malls

* Audience: affluent families, corporates, NRIs

---

# **🔍 Step 4 – How to Use in Tool**

1. API se saare momo-related outlets fetch karo.

2. Har outlet ko upar wale rules ke hisaab se **Slab 1–5** me map karo.

3. Location ka **Competition Pricing Profile** nikalo:

   * Agar 70% outlets Slab 1–2 → area budget sensitive

   * Agar 50% outlets Slab 3 → stable mid-market

   * Agar 30%+ outlets Slab 4–5 → aspirational/posh market

---

# **🔍 Step 5 – Output Example**

* “Is area me 12 momo outlets mile.

  * 6 Slab 1 (street carts),

  * 3 Slab 2 (local cafés),

  * 2 Slab 3 (Wow\! Momo, Biryani Blues),

  * 1 Slab 4 (Chaayos café).  
     → Dominant slab \= 1–2 → location budget heavy, not aspirational.”

**Nearby Businesses/Offices** 

# **1\) Step 1 — Google se kya data uthao (800m radius; 400m & 1200m comparison useful)**

* **Places Nearby/Text Search** for:

  * “office”, “business park”, “IT park”, “technology park”, “SEZ”

  * “coworking”, “co-working”, brand names: WeWork, Awfis, Regus, Smartworks, IndiQube, 91Springboard

  * “corporate office”, “head office”, “regional office”

  * “industrial estate”, “logistics park” (if retail suitability check bhi chahiye)

  * Supporters: **bank**, **atm**, **courier**, **post office**, **consultant**, **chartered accountant**, **law firm**, **service centre**

* **Place Details** fields (har hit par):  
   `name, types, user_ratings_total, rating, opening_hours, business_status, price_level (if present), reviews.text`

*(Optional)*

* **Distance Matrix**: nearest **metro/bus stop** tak walking time (office catchment ko boost).

* **Street View**: office towers, corporate signage, parking (SUV/hatchback mix).

---

# **2\) Step 2 — “Office Presence” ke core proxies**

* **Office node types**: IT parks, business parks, coworking hubs, corporate HQ/RO.

* **Density**: 800m me in nodes ki **count** \+ **floor-area proxy** (park ke multiple listings).

* **Popularity**: nearby lunch cafés/quick service jo **12–3pm** open \= office lunch demand.

* **Service ecosystem**: banks, ATMs, courier, service centres, CA/law firms (jitne zyada, utna office-heavy).

* **Ratings/Reviews**: high `user_ratings_total` on coworking/parks (footfall & occupancy proxy).

* **Accessibility**: metro/bus ≤ 8–10 min walk (Distance Matrix).

* **Operating hours**: places open Mon–Fri day hours (reviews/metadata cue).

---

# **3\) Step 3 — Helpful keyword buckets (Text Search)**

* **Parks & Campuses**: “IT park”, “technology park”, “software park”, “business park”, “SEZ”, “industrial area/estate”

* **Coworking**: “WeWork”, “Awfis”, “Regus”, “Smartworks”, “IndiQube”, “91Springboard”, “CoWrks”, “Innov8”

* **Offices (generic)**: “corporate office”, “head office”, “regional office”, “HO”, “HQ”, “branch office”

* **Support**: “bank”, “branch”, “ATM”, “courier”, “service center”, “consultant”, “chartered accountant”, “law firm”

---

# **4\) Step 4 — Office Presence Index (OPI) banana (conceptually)**

* **Core**: (IT/business parks × high weight) \+ (coworking hubs × mid weight) \+ (corporate/HQ × mid)

* **Support**: (banks/ATMs \+ courier \+ service centres \+ CA/law)

* **Lunch signal**: 12–3pm open cafés/quick serve count near parks (office lunch demand)

* **Access bonus**: nearest metro/bus walk time (≤8 min \= boost)

* **Popularity**: coworking/park listings with **high reviews** (e.g., `URT ≥ 200`)

*(Normalize city-wise 0–100 for fair comparison.)*

---

# **5\) Step 5 — 5-Slab mapping (Nearby Businesses/Offices)**

**Slab 1 — Low/Informal**

* Almost **no offices**, **no coworking**

* Few banks/ATMs, service centres scattered

* Lunch cafés bahut kam; URT low (\<50)

* Metro/bus far (\>12 min walk)

**Slab 2 — Emerging/Small-town office presence**

* 1 small office building **or** 1 minor coworking

* 3–5 banks/ATMs; thoda courier presence

* 2–3 lunch cafés; URT 50–150

* Transit 10–15 min

**Slab 3 — Stable office catchment (mid-market)**

* 1 **business/IT park** **or** 2–3 coworking hubs

* Banks/ATMs 5–8; courier & service centres visible

* 5–8 lunch cafés open 12–3; URT 150–300

* Transit ≤10 min (ek metro/bus stop convenient)

**Slab 4 — Strong office ecosystem (upper-mid)**

* 2+ coworking hubs **and/or** 1 sizable **business/IT park** with multiple tenants

* 8–12 banks/ATMs \+ multiple service centres

* 8–12 lunch cafés; URT 300–600 nodes present

* Transit ≤8 min (good pedestrian access)

**Slab 5 — Prime corporate zone (posh/Grade-A)**

* Large **Grade-A park/campus** **or** multi-tower corporate district; well-known coworking brands (WeWork/Awfis/Regus) 3+

* Full service ecosystem (banks, courier hubs, service centres, CA/law clusters)

* Dense lunch grid (12+ cafés/fast casual), URT 600+ on multiple nodes

* Transit ≤6–8 min; Street View par towers/structured parking clear

---

# **6\) Step 6 — Practical decisions (sirf Google data se)**

* **OPI ≥ 80 → Slab 5** (prime corporate)

* **65–79 → Slab 4** (strong office)

* **50–64 → Slab 3** (mid office)

* **35–49 → Slab 2** (light office)

* **\<35 → Slab 1** (weak office)

**Tie-breakers (Google-only):**

* If **coworking premium brands 2+** (WeWork/Awfis/Regus) → ek slab upar.

* If **nearest metro/bus ≤ 6 min** → small boost.

* If lunch cafés **12–3pm open** count high → boost; agar sirf evening cafés → neutral (office crowd weak).

---

# **7\) Output (agent ko kya bolna)**

* **Office Slab (1–5)** \+ short reason:

  * “2 coworking hubs (WeWork, Awfis), 1 business park, 10 lunch cafés open 12–3, metro 6 min walk → **Slab 4**.”

* **Key counts**: parks, coworking, corporate listings, banks/ATMs, lunch cafés (12–3), courier/service centres

* **Access**: nearest transit walk-time

* **Confidence**: results coverage (kitne POIs pe rating/URT mila) \+ 400m vs 1200m consistency

---

### **Quick checklist (copy-paste for field/agent, Google-only)**

* IT/Business park count: \_\_\_

* Coworking hubs (brand-wise): \_\_\_

* Corporate/HQ listings: \_\_\_

* Banks/ATMs: \_\_\_ | Courier/Service centres: \_\_\_

* Lunch cafés open 12–3: \_\_\_

* Median URT of office-adjacent POIs: \_\_\_

* Nearest metro/bus (walk minutes): \_\_\_

* **Assigned Slab**: 1 / 2 / 3 / 4 / 5

* **Reason in one line**: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

# **1\) Vehicle Mix (Mobility) — Google Maps-only, 7-step detailed playbook**

## **Step 1 — Data Fetch (APIs & radius)**

* **Radius runs:** 400 m (tight), 800 m (core), 1200 m (extended).

* **APIs:**

  * **Places Nearby/TextSearch:** `car_dealer`, `motorcycle_dealer` (aka two\_wheeler\_dealer), `car_repair`, `car_wash`, `parking`, `gas_station`.

  * **Place Details:** `name, types, rating, user_ratings_total, opening_hours, reviews.text, photos`.

  * **Street View Static:** 2–4 viewpoints on closest major road (front, 50 m left/right).

  * **(Optional) Roads API:** nearest road class.

## **Step 2 — What to query (exact intent)**

* **Dealers by segment (brand-matching):**

  * **Two-wheelers (mass):** Hero, Honda, TVS, Bajaj, Suzuki, Yamaha, Royal Enfield (mid).

  * **Mass 4W:** Maruti, Hyundai, Tata, Kia, Toyota.

  * **Premium/Luxury 4W:** Honda Cars premium outlets, Skoda, VW, Jeep, MG; **Luxury:** Mercedes, BMW, Audi, Volvo, Lexus, Jaguar-Land Rover.

* **Support POIs:** `car_repair`, `tyre shop`, `battery shop`, `parking` (multi-storey vs open plot), `gas_station`.

* **Street View cues:** parked vehicle mix (2W vs cars vs SUVs), roadside width, formal parking bays, valet cones.

## **Step 3 — Proxies / Signals (convert raw → measurable)**

* **Dealer Mix Count (last 24 months in Maps):**

  * `D_2W` \= count(two-wheeler dealers)

  * `D_mass4W` \= count(Maruti/Hyundai/Tata/Kia/Toyota dealers)

  * `D_prem4W` \= count(Skoda/VW/Jeep/MG/Honda Cars premium)

  * `D_lux4W` \= count(Mercedes/BMW/Audi/Volvo/Lexus/JLR)

* **Service Density:** `S_car` \= count(car\_repair \+ tyre \+ battery \+ car\_wash); `S_2W` \= count(bike service/repair).

* **Parking Form:** `P_formal` if multilevel/paid parking exists; else `P_informal`.

* **Street View Vehicle Ratio (visual sample):**

  * Sample 3 frames; mark visible vehicles: `V_2W`, `V_car`, `V_SUV` → compute shares.

* **Peak-hour congestion cue (qualitative):** reviews mentioning “parking problem”, “no parking”.

## **Step 4 — Normalize into a 0–100 Vehicle Mix Index (VMI)**

* **Weights (city-agnostic starting point):**

  * `D_2W` (×1), `D_mass4W` (×2), `D_prem4W` (×3), `D_lux4W` (×5)

  * `S_car` (×1), `S_2W` (×1)

  * `P_formal` (+5 bonus)

  * Street View share score \= `10 * (0.2*share_2W + 0.6*share_car + 0.8*share_SUV)`

* **VMI\_raw \= `wsum(dealers+services) + parking_bonus + streetview_score`**

* **City-wise min–max normalize** to **VMI (0–100)** using recent 200–300 evaluated pins in that city.

## **Step 5 — 5-Slab rules (deterministic, numeric)**

* **Slab 1 (Mass/2W-heavy):**

  * `VMI < 30` **AND** `D_lux4W = 0` **AND** `share_2W ≥ 0.75` **AND** `P_formal = false`

* **Slab 2 (Low-mid):**

  * `30 ≤ VMI < 45` **AND** `D_mass4W ≥ 1` **AND** `share_car 0.25–0.45`

* **Slab 3 (Balanced mid):**

  * `45 ≤ VMI < 65` **AND** `D_mass4W ≥ 2` **AND** (`share_car 0.40–0.60`)

* **Slab 4 (Sedan/SUV-leaning premium):**

  * `65 ≤ VMI < 80` **OR** `D_prem4W ≥ 1` **AND** `share_SUV ≥ 0.20` **AND** `P_formal = true`

* **Slab 5 (Affluent/Lux-leaning):**

  * `VMI ≥ 80` **OR** `D_lux4W ≥ 1` **AND** `share_SUV ≥ 0.30` **AND** multi-dealer cluster (≥2 among `prem4W`\+`lux4W`)

**Tie-breakers:**

* If `gas_station` reviews mention “EV charging” or premium c-store → bump \+1 slab (cap at 5).

* If Street View frames disagree (e.g., school zone), use extended radius & daytime variance; pick **median** slab.

## **Step 6 — Integrate in your location score**

* **Weight suggestion:** 10–15% of overall location score.

* **Confidence metric:**

  * Coverage \= % POIs with usable data,

  * Visual sample count (≥3 frames),

  * Radius consistency (|Slab\_400m − Slab\_1200m| ≤ 1).

  * Confidence bands: **High ≥ 80**, **Med 60–79**, **Low \< 60**.

## **Step 7 — Example output (what your agent should say)**

* **Vehicle Mix:** Slab **4** (VMI 72, confidence 84\)

* **Why:** “Hyundai \+ Toyota dealers (2), 1 Skoda, formal multilevel parking, Street View shows \~22% SUVs, gas station with premium store.”

* **Risks:** “Peak-hour parking constraints mentioned in 9 reviews.”

* **Notes:** “If evening sampling shows higher 2W share near coaching lane, recheck daypart mix.”

# **Residential / Society Presence (7-Step Framework)**

## **Step 1 — Data Fetch (APIs & radius)**

* **Radius runs:** 400 m (tight), 800 m (core), 1200 m (extended).

* **APIs:**

  * **Places Nearby / TextSearch** → query: “apartment”, “society”, “residency”, “township”, “condominium”, “residential complex”.

  * **Types:** `premise`, `neighborhood`, `political`.

  * **Place Details:** `name, rating, user_ratings_total, reviews.text, photos`.

  * **Street View Static:** entry gates, building height, compound walls, signage.

---

## **Step 2 — What to Query (intent & brand filters)**

* **Budget/local keywords:** “colony”, “nagar”, “gaon”, “pura”, “basti”.

* **Mid brands:** “Apartments”, “Residency”, “Heights”, “Enclave”.

* **Premium developers:** DLF, Omaxe, Godrej, ATS, Prestige, Unitech, Emaar.

* **Luxury townships:** “Golf course”, “Estate”, “Township”, “Country Club”, “Villa”.

---

## **Step 3 — Proxies / Signals (Google fields → measurable)**

* **Brand Recognition:** developer name \= premium/luxury signal.

* **Building Form (Street View/photos):**

  * Low-rise, no gate → budget

  * Gated 4–8 floor mid-rise → mid

  * High-rise towers with entry gate & guards → premium

* **Amenities (reviews keywords):** “clubhouse”, “swimming pool”, “gym”, “security”, “gated”.

* **Density of Listings:** multiple societies within 800m \= residential hub.

* **Ratings/Reviews:**

  * \<3.5 \= poor maintenance (low-end)

  * 3.5–4.0 \= mid

  * 4.0+ with 100+ reviews \= premium

* **Price proxies (if mentioned in reviews):** “rent”, “expensive flat”, “affordable housing”.

---

## **Step 4 — Interpret / Normalize**

* Assign **weights**:

  * Developer/Brand signal (40%)

  * Amenities keywords (20%)

  * Rating & reviews (20%)

  * Street View form (20%)

* Normalize each society to a **0–100 score**, then average across all societies in radius.

---

## **Step 5 — Slab Assignment Rules**

* **Slab 1 (Informal / Low-end):**

  * Jhuggis, gaon bastis, no branded societies.

  * Ratings \<3.5, reviews sparse.

  * Street View: kaccha lanes, 2–3 floor informal colonies.

* **Slab 2 (Budget colonies):**

  * Local “XYZ Colony/Enclave/Nagar”, builder floors.

  * Ratings 3.5–3.8, few reviews.

  * 3–4 floor walk-ups, minimal gates.

* **Slab 3 (Mid-rise / Organized private):**

  * 4–8 floor societies, small clubs, branded mid developers.

  * Ratings 3.8–4.0 with 50–100 reviews.

  * Gated but basic amenities.

* **Slab 4 (Premium gated communities):**

  * High-rise (10–20 floor towers), branded developers (Omaxe, ATS, Prestige).

  * Amenities: clubhouse, gym, swimming pool, 24x7 security.

  * Ratings 4.0–4.3, 100+ reviews.

* **Slab 5 (Luxury townships / Villas):**

  * Golf course facing, luxury villas, mega townships (DLF, Emaar, Godrej Golf Links).

  * Strong keywords: “luxury”, “clubhouse”, “premium society”.

  * Ratings \>4.3, 200+ reviews.

---

## **Step 6 — Integration into tool**

* **Residential Index** \= weighted average slab across societies.

* **Weight in location score:** 20–25% (big factor for daily steady footfall).

* **Confidence metric:**

  * Coverage \= % of societies with usable details.

  * Radius consistency \= |Slab\_400m − Slab\_1200m| ≤ 1 slab.

  * Reviews richness \= % with ≥50 reviews.

---

## **Step 7 — Example Output**

* **Residential Presence:** Slab **4** (score 72, confidence 81).

* **Why:** “3 branded high-rise societies (Omaxe Heights, ATS Greens), avg rating 4.1 with 120 reviews, Street View shows gated entry \+ clubhouses.”

* **Risks:** “Nearby informal colony within 400m, may pull mixed catchment.”

* **Notes:** “Strong premium family base; aspirational youth moderate.”

# **Shopping Preferences Nearby — 7-Step Framework (Google-only)**

## **Step 1 — Data Fetch (APIs & radius)**

* **Radius runs:** 400 m (tight), 800 m (core), 1200 m (extended).

* **APIs:**

  * **Places Nearby / Text Search** → retail POIs.

  * **Place Details** → `name, types, rating, user_ratings_total, price_level, opening_hours, reviews.text, photos`.

  * *(Optional)* **Street View Static** → storefront/streetscape quality (mall frontage, signage).

* **Persist** raw hits with lat/lng for de-dupe (same brand multiple pins inside a mall).

---

## **Step 2 — What to query (types \+ brand keywords)**

* **Core types:** `shopping_mall`, `clothing_store`, `shoe_store`, `department_store`, `jewelry_store`, `supermarket`, `cosmetics_store`, `furniture_store`, `electronics_store`.

* **Budget brand cues (Slab 1–2):** Vishal Mega Mart, Easybuy, Reliance Trends (entry), Max (entry), local bazaar/market, factory outlets, “wholesale”, “kirana”.

* **Mid brand cues (Slab 3):** Lifestyle, Westside, Pantaloons (main), Levi’s, Wrangler, Lee, Metro Shoes, Mochi, Hush Puppies.

* **Premium/fast fashion cues (Slab 4):** Zara, H\&M, Uniqlo, Marks & Spencer, Nike, Adidas, Puma, Skechers, Apple APR.

* **Luxury cues (Slab 5):** Louis Vuitton, Gucci, Dior, Burberry, Armani, Rolex, Tiffany, Hugo Boss; luxury multibrand boutiques.

---

## **Step 3 — Proxies / Signals (Google fields → measurable)**

* **Brand-tier presence:** map each hit to **tier bucket** (Budget / Mid / Premium / Luxury).

* **Mall anchor strength:** count anchors (Lifestyle, Westside, Pantaloons, Shoppers Stop) and **international anchors** (Zara/H\&M/Uniqlo).

* **Price proxy:** `price_level` median (0–4).

* **Popularity:** `user_ratings_total` (URT) median & count of high-URT nodes (e.g., ≥500).

* **Quality:** average `rating` (and variance).

* **Category breadth:** \#distinct retail categories present (fashion, footwear, jewelry, electronics, supermarket, cosmetics, furniture).

* **Reviews keywords:** “expensive”, “premium”, “luxury”, “cheap”, “sale/discount”, “factory outlet”.

---

## **Step 4 — Interpret / Normalize (build a 0–100 Shopping Index)**

* **Weights (starter mix, adjust after calibration):**

  * Brand-tier composition 35% (Budget→0, Mid→50, Premium→75, Luxury→100; weighted by counts).

  * Mall/anchor strength 20% (anchors × weight; intl fast fashion heavier).

  * Popularity 15% (median URT \+ count of URT≥500 nodes).

  * Price proxy 15% (normalize price\_level 0–4 to 0–100).

  * Category breadth 10% (more breadth ⇒ higher convenience/affluence).

  * Rating 5% (avg rating floors the score if \<3.6).

* **City-wise min–max normalization** using a rolling baseline of recent locations to keep scores comparable.

---

## **Step 5 — Slab Assignment (deterministic rules)**

* **Slab 1 — Bazaar/Budget cluster**

  * Shopping Index **\< 30**, **no anchors**, **no intl brands**, budget/local stores dominate; median `price_level ≤ 1.2`, median URT \< 100\.

* **Slab 2 — Organized budget**

  * **30–44**, anchors **0–1** (e.g., Trends/Max small), few branded mids, **no** Zara/H\&M/Uniqlo.

* **Slab 3 — Mid-market**

  * **45–64**, **2+ anchors** (Lifestyle/Westside/Pantaloons), 3–6 mid brands (Levi’s, Metro Shoes…), price\_level ≈ 2, median URT 150–400.

* **Slab 4 — Premium high street/mall**

  * **65–79**, **intl fast fashion ≥1** (Zara/H\&M/Uniqlo) **or** 6+ premium brands (Nike/Adidas/M\&S/Skechers/Apple APR), median URT ≥ 400, price\_level ≥ 2.5.

* **Slab 5 — Luxury retail node**

  * **≥ 80**, **luxury brands ≥1–2** (LV/Gucci/Rolex… **or** luxury multibrand), intl fast fashion 2+, high-end jewelry/electronics present, median URT ≥ 700, price\_level ≥ 3\.

**Tie-breakers:**  
 • If **intl fast fashion ≥2** and **anchors ≥2** within 800 m → bump to Slab 4 minimum.  
 • If **luxury ≥1** in 1200 m and Shopping Index ≥ 75 → Slab 5\.  
 • If 400 m result differs by ≥2 slabs from 1200 m, take the **800 m** slab and flag **mixed catchment**.

---

## **Step 6 — Integration into your location engine**

* Add **Shopping Index** (weight suggestion **15%** of overall score).

* Store **explainers**: top 5 brands found by tier, \#anchors, intl presence, median price\_level, median URT.

* **Confidence** \= coverage (% hits with rating/URT), dedupe quality (same brand once per mall), radius consistency.

---

## **Step 7 — Example output (what your agent should return)**

* **Shopping Slab:** **4** (Index **72**, confidence **83**)

* **Why:** “Anchors: Lifestyle \+ Westside; Intl: H\&M \+ Uniqlo; Premium: Nike/Adidas/Skechers; median price\_level 2.7; median URT \~520.”

* **Notes:** “No luxury mono-brand yet; 400 m shows fewer anchors (pocket high street) while 1200 m picks the mall cluster → mixed but premium-leaning.”

* **Actionable:** “Premium café positioning ok; luxury-grade pricing not recommended until luxury mono-brand appears.”

# **Fitness / Gym / Walking Culture — 7-Step Framework**

## **Step 1 — Data Fetch (APIs & radius)**

* **Radius runs:** 400 m (tight), 800 m (core), 1200 m (extended).

* **APIs:**

  * **Places Nearby / TextSearch** → `gym`, `fitness_center`, `yoga`, `park`, `stadium`, `spa`, `swimming pool`.

  * **Place Details** → `name, types, rating, user_ratings_total, opening_hours, reviews.text, photos`.

  * **Street View Static** → parks, jogging tracks, open gyms, sidewalks.

---

## **Step 2 — What to Query (deep dive \+ brand examples)**

👉 Tumhe 3 segment target karne hain: **gyms**, **wellness studios**, **outdoor walking/fitness infrastructure**.

### **(A) Gyms & Fitness Centers**

* **Generic Types:** `gym`, `fitness_center`.

* **Branded Gyms (Premium signal):**

  * *National chains:* Gold’s Gym, Cult.Fit, Anytime Fitness, Snap Fitness, Talwalkars, Bodypower, Ozone.

  * *Boutique/premium studios:* CrossFit Box, MMA gyms, Pilates studios, F45, Fitness First.

* **Budget/Local gyms:** “Powerhouse Gym”, “Muscle Factory”, “Bodyline”, “Fitness Zone”.

* **Keywords in TextSearch:** “CrossFit”, “Weight Training”, “24x7 gym”, “Personal Training Studio”.

### **(B) Wellness Studios & Lifestyle Fitness**

* **Yoga & Meditation:** Isha Yoga, Art of Living, Iyengar Yoga, Hot Yoga studios.

* **Dance/Zumba Studios:** Shiamak Davar, Zumba hubs.

* **Pilates:** Reform Pilates, Core Pilates.

* **Spa/Wellness:** VLCC, O2 Spa, Kaya Skin (spa-heavy areas \= affluent).

### **(C) Outdoor & Public Walking Infrastructure**

* **Places Types:** `park`, `stadium`, `track`, `public_garden`.

* **Keywords:** “Jogging Track”, “Open Gym”, “Walking Park”, “Morning Walk Garden”.

* **Examples:** Lodhi Garden (Delhi), Cubbon Park (Bangalore), KBR Park (Hyderabad).

* **Review cues:** “crowded in mornings”, “walkers and joggers”, “clean walking track”, “free yoga sessions”.

---

## **Step 3 — Proxies / Signals**

* **Branded vs Local Gym Ratio** → more branded \= higher affluence.

* **Density** → gyms per 800m; parks per 800m.

* **Opening Hours:** 24x7 gyms → premium working professionals; parks closing by 8 pm → budget family crowd.

* **Ratings & URT:**

  * Local gyms usually 3.5–3.8 avg rating, \<200 URT.

  * Branded gyms/studios \~4.0+, 500+ URT.

* **Keywords in Reviews:**

  * Budget gyms: “cheap fees”, “crowded”, “basic equipment”.

  * Premium: “personal trainer”, “CrossFit”, “state of the art”.

  * Parks: “morning walkers”, “elderly crowd”, “clean walking track”.

---

## **Step 4 — Interpret / Normalize**

* Assign **weights**:

  * Branded Gym presence (30%)

  * Outdoor walking/park density (25%)

  * Wellness studios (yoga/pilates) (20%)

  * Avg rating & URT (15%)

  * Opening hour premium signals (10%)

* Normalize each parameter 0–100 and build **Fitness Index**.

---

## **Step 5 — Slab Assignment Rules**

* **Slab 1 — Weak fitness culture**

  * No branded gyms, only 1–2 local gyms.

  * No jogging parks.

  * Reviews: “basic gym”, “no equipment”, “no walking space”.

* **Slab 2 — Budget/local fitness**

  * 3–5 local gyms, 1 small park.

  * No premium brands.

  * Ratings \<3.8 avg.

* **Slab 3 — Balanced / Mid fitness**

  * 1 branded gym OR multiple organized local gyms.

  * 1–2 parks with jogging track.

  * Avg rating 3.8–4.0.

* **Slab 4 — Strong fitness ecosystem**

  * ≥2 branded gyms (Gold’s, Cult, Anytime Fitness) \+ yoga/pilates studios.

  * Large public park OR stadium.

  * Avg rating 4.0+, URT \>300.

* **Slab 5 — Affluent wellness hub**

  * Premium clusters: CrossFit, F45, boutique yoga/pilates, luxury spas.

  * Multiple branded gyms within 800m.

  * Famous jogging parks (with reviews: “morning 1000+ walkers”).

  * Avg rating ≥4.3, URT ≥600.

---

## **Step 6 — Integration into Location Tool**

* **Weightage:** 10–15% of overall location score.

* **Confidence metric:**

  * Coverage (% of gyms/parks with reviews).

  * Radius consistency (400 vs 1200 m slab difference ≤1).

  * Branded recognition (if only local names, lower confidence).

---

## **Step 7 — Example Output**

* **Fitness Culture Slab:** **4** (Index 71, confidence 85).

* **Why:** “2 branded gyms (Gold’s Gym, Cult), 1 yoga studio, 1 large jogging park; avg rating 4.1, URT median 320.”

* **Risks:** “No boutique Pilates studios; crowd more mainstream than luxury.”

* **Notes:** “Area fit for aspirational youth \+ family walkers; not elite luxury wellness cluster.”

# **Zomato/Swiggy Delivery Density — 7-Step Framework (Google-only)**

## **Step 1 — Data Fetch (APIs, radius, fields)**

* **Radius runs:** 400 m (tight), 800 m (core), 1200 m (extended) — teeno chalao aur compare karo.

* **APIs:**

  * **Places Nearby / TextSearch** with types:

    * `restaurant`, `cafe`, `bakery`, `fast_food`, `meal_takeaway`, `meal_delivery`

  * **Place Details** fields:

    * `name`, `types`, `rating`, `user_ratings_total`, `price_level`, `opening_hours.periods`, `business_status`, `reviews.text`, `photos`

* **Persist**: `place_id` ke saath raw results store karo (later de-dup/brand merge ke liye).

---

## **Step 2 — What to Query (deep keywords \+ brand examples)**

**A) Delivery-first & high-delivery brands (mid/premium signal):**

* Domino’s, Pizza Hut, McDonald’s, KFC, Subway, Wow\! Momo

* Rebel/EatClub brands: Faasos, Behrouz Biryani, Oven Story, Sweet Truth, LunchBox

* Biryani by Kilo, Box8, Mojo Pizza, FreshMenu (city dependent)

**B) Cloud/Dark Kitchen identifiers (strong delivery density signal):**

* TextSearch keywords: `"cloud kitchen"`, `"dark kitchen"`, `"ghost kitchen"`, `"delivery kitchen"`, `"only delivery"`

**C) Review/description keywords (delivery behavior signal):**

* `"delivery"`, `"home delivery"`, `"takeaway"`, `"parcel"`, `"packaging"`, `"Swiggy"`, `"Zomato"`,  
   `"delivery time"`, `"late night delivery"`, `"30 minutes"`, `"delivered hot"`, `"spillage"`, `"rider"`

**D) Late-night & rush-hour suitability:**

* `opening_hours.periods` me **late close** (e.g., 23:00–01:00) ya **early open** (breakfast).

* Text cues: `"open till midnight"`, `"24x7"`, `"night delivery"`.

**E) Cuisine mix (delivery-friendly categories):**

* `"momo"`, `"biryani"`, `"pizza"`, `"burger"`, `"rolls"`, `"shawarma"`, `"thali"`, `"combo"`.

---

## **Step 3 — Proxies / Signals (Google fields → measurable)**

1. **Delivery-capable POI Count (D\_count):**

   * Types me `meal_takeaway`/`meal_delivery` present **OR** reviews me “delivery” frequency high.

2. **Brand Weighting (B\_wt):**

   * High-delivery chains ko higher weight:

     * Domino’s/McD/KFC/Pizza Hut (×3),

     * Wow\! Momo/Subway/Rebel brands (×2),

     * Local restaurants with frequent “delivery” mentions (×1).

3. **Delivery Mentions Density (DM\_rate):**

   * Reviews me `"delivery|Swiggy|Zomato|takeaway|parcel"` term frequency per POI (last \~10–20 reviews).

4. **Popularity/Throughput Proxy:**

   * `user_ratings_total (URT)` median \+ **high-URT nodes** count (e.g., URT ≥ 300), delivery brands ko priority.

5. **Service Quality Proxy:**

   * `rating` median; negative delivery keywords: “cold food”, “late”, “spillage”, “wrong order”.

6. **Daypart Fitness:**

   * **Lunch** (12–15h) & **Dinner** (19–23h) ke liye open outlets ka count — `opening_hours.periods` se derive.

7. **Price/ASP Context:**

   * `price_level` median (0–4). Bahut low price clusters \= mass delivery; high price \= premium pockets.

---

## **Step 4 — Interpret / Normalize (build a 0–100 Delivery Density Index)**

**Suggested weights (start point, later calibrate):**

* Delivery-capable POIs per radius (D\_count) → **30%**

* Brand weighting (B\_wt) → **20%**

* Delivery mentions density (DM\_rate) → **15%**

* Popularity (URT median \+ high-URT nodes) → **15%**

* Daypart fitness (lunch+dinner open counts) → **10%**

* Service quality (rating & negative-keyword penalty) → **5% \+ (-ve 5%)**

* Price context (price\_level) → **5%**

**Normalization tips:**

* City-wise min–max on rolling baseline of evaluated pins.

* 400/800/1200 m indices separately nikalo; **core (800 m)** primary, baaki **consistency** check.

---

## **Step 5 — 5-Slab Assignment (deterministic rules)**

* **Slab 1 — Sparse delivery zone (budget street-heavy):**

  * Delivery Density Index **\< 30**, `D_count < 10` (800 m), **brand weighting low** (B\_wt \< 6),

  * Few “delivery” mentions; URT median \< 120; late-night open outlets ≤ 2\.

* **Slab 2 — Basic delivery availability:**

  * Index **30–44**, `D_count 10–20`, 1–2 national delivery brands present,

  * DM\_rate modest, lunch OR dinner window thoda strong (ek hi).

* **Slab 3 — Healthy delivery ecosystem (mid):**

  * Index **45–64**, `D_count 20–40`, **≥2–3** national brands (Domino’s/Wow\! Momo/Rebel),

  * URT median 180–350, both lunch & dinner windows me outlets kaafi open.

* **Slab 4 — Dense & reliable delivery hub (upper-mid):**

  * Index **65–79**, `D_count 40–60`, **≥4** national brands, **cloud/dark kitchens ≥ 2**,

  * High DM\_rate, URT median ≥ 350, late-night open (≥5 outlets till \~23:00+).

* **Slab 5 — Prime delivery hotspot (posh \+ volume):**

  * Index **≥ 80**, `D_count ≥ 60`, **cloud kitchen clusters ≥ 4**,

  * Multiple high-URT nodes (≥5 with URT≥700), frequent “delivery fast/packaging” positives, dinner+late nights strong.

**Tie-breakers:**

* Agar **Domino’s \+ McD \+ Pizza Hut** teeno 800 m me — minimum **Slab 3**.

* **Cloud-kitchen cluster** detected (≥3 in 400–800 m) — at least **Slab 4**.

* 400 m vs 1200 m me slab gap ≥2 ho — area **mixed catchment** flag karo; 800 m ko base lo.

---

## **Step 6 — Integration into your location engine**

* **Weight suggestion:** 12–18% (agar tum delivery-heavy format ho to \>18% bhi kar sakte ho).

* **De-dup rules:** same brand ke multiple pins (mall, kiosk) → **1 count** hi lo per micro-catchment.

* **Daypart profiles:** lunch vs dinner sub-scores store karo (office vs family suitability).

* **Confidence:** coverage (% POIs with reviews/ratings), keyword yield, radius consistency.

---

## **Step 7 — Example output (agent-style)**

* **Delivery Density Slab:** **4** (Index **71**, confidence **86**)

* **Why:** “800 m me 52 delivery-capable outlets; brands: Domino’s, McD, Wow\! Momo, Faasos, Behrouz, Oven Story (6); cloud kitchens: 3; URT median \~380; dinner window me 41 outlets open till ≥22:30; reviews me ‘delivery’, ‘packaging’ mentions high.”

* **Risks:** “Late-night (post-23:00) limited; 1200 m radius me density aur badh rahi — mixed corridor.”

* **Actionable:** “Delivery-led pricing ok; add late-night pilot Fri–Sun.”

---

## **Practical tips (Google-only hygiene)**

* **Keyword burst** ko last 6–12 months ki reviews par focus karo (old reviews dilute kar dete hai ground truths).

* **Cuisine bias**: pizza/biryani ke zyada outlets delivery index ko skew karte; **category mix** (momo/rolls/thali) ka minimum presence check rakho.

* **“Open now” filter** ko lunch & dinner dayparts par run karo — yahi real demand windows hain.

* **Photos** me packaging cues (branded boxes, tamper-proof seals) premium signal dete hain.

# **Nightlife / Café Presence — 7-Step Framework**

## **Step 1 — Data Fetch (APIs & radius)**

* **Radius runs:** 400 m (tight), 800 m (core), 1200 m (extended).

* **APIs:**

  * **Places Nearby / TextSearch**: `cafe`, `bar`, `night_club`, `restaurant`, `bakery`, `pub`, `meal_takeaway`.

  * **Place Details**: `name`, `types`, `rating`, `user_ratings_total`, `price_level`, `opening_hours`, `reviews.text`, `photos`.

  * **Street View Static**: for café/club façade quality, signage, outdoor seating.

---

## **Step 2 — What to Query (deep \+ brand examples)**

### **A) Cafés (day \+ evening culture)**

* **Premium/aspirational chains:** Starbucks, Blue Tokai, Third Wave, Costa, Gloria Jean’s, CCD, Chaayos.

* **Independent/hipster cafés:** “Art café”, “Book café”, “Brewery café”.

* **Budget cafés:** MBA Chaiwala, Chai Sutta Bar.

* **Keywords:** “coffee roastery”, “latte”, “cold brew”, “specialty coffee”.

### **B) Nightlife / Bars / Lounges**

* **Casual pubs:** Social, The Beer Café, Irish House.

* **Microbreweries:** Toit, Arbor, Bira 91 Taproom, Doolally.

* **Premium bars/clubs:** Hard Rock Café, Soho House, Prive, Kitty Su.

* **Nightclubs:** “DJ”, “Disco”, “Club”, “Dance floor”, “Lounge”.

* **Keywords in reviews:** “DJ night”, “live music”, “karaoke”, “party crowd”.

### **C) 24x7 / Late-night F\&B nodes**

* Domino’s, McDonald’s 24x7, Empire Restaurant (BLR), Karim’s (Delhi late-night).

* **Keywords:** “open till 2 am”, “midnight café”, “late-night food”.

---

## **Step 3 — Proxies / Signals**

* **Café density (C\_count):** \#cafés per radius (esp. branded aspirational ones).

* **Nightlife density (N\_count):** \#bars/pubs/clubs; microbreweries heavier weight.

* **Brand mix:** Premium chains vs budget vs luxury lounges.

* **Opening hours:** Outlets open till ≥11 pm (or marked 24h).

* **Ratings & URT:**

  * Premium cafés/bars usually ≥4.0 with 300+ URT.

* **Reviews keywords:**

  * “ambience”, “DJ”, “crowded weekends”, “party”, “expensive drinks”.

* **Street View cues:** Outdoor seating, neon signage, valet parking.

---

## **Step 4 — Interpret / Normalize**

* **Weights (starter):**

  * Nightlife density (N\_count) → 30%

  * Café density & brand quality → 25%

  * Opening hours late-night → 15%

  * Reviews keywords (party/ambience) → 15%

  * Ratings & URT → 10%

  * Price level median → 5%

* Normalize each metric 0–100 → create **Nightlife/Café Index**.

---

## **Step 5 — Slab Assignment Rules**

* **Slab 1 — No café/nightlife culture:**

  * ≤2 budget cafés (MBA/Chai Sutta), no pubs/bars.

  * Price\_level ≤1.5, URT \<100.

* **Slab 2 — Small-town café presence:**

  * 3–5 local cafés, maybe 1 bar/pub.

  * Mostly tea cafés, no premium coffee chains.

* **Slab 3 — Mid-market café \+ some nightlife:**

  * 1–2 premium cafés (CCD, Chaayos) \+ 2–3 pubs/bars.

  * Open till \~11 pm, URT median 200–300.

* **Slab 4 — Premium café \+ strong nightlife:**

  * ≥3 premium cafés (Starbucks, Blue Tokai, Third Wave) \+ ≥3 bars/pubs.

  * At least 1 microbrewery/live music club.

  * Price\_level ≥2.5, URT ≥400, late-night open till \~1 am.

* **Slab 5 — Posh nightlife hub:**

  * ≥5 premium cafés \+ ≥5 pubs/clubs, incl. luxury brands (Soho House, Hard Rock).

  * Multiple microbreweries.

  * Reviews: “expensive drinks”, “DJ nights”, “party till 3 am”.

  * Street View: neon/night ambience visible.

**Tie-breakers:**

* If **≥2 microbreweries** present, minimum Slab 4\.

* If **luxury club** (Kitty Su/Soho) found, force Slab 5\.

---

## **Step 6 — Integration into Location Engine**

* **Weightage:** 10–12% (higher if targeting aspirational youth / premium format).

* **Daypart split:**

  * Cafés \= morning–evening crowd,

  * Nightlife \= evening–late night aspirational spend.

* **Confidence factors:**

  * Radius consistency (400 vs 1200 m slabs within ±1),

  * Coverage (% with opening\_hours, URT),

  * Brand recognition clarity.

---

## **Step 7 — Example Output**

* **Nightlife/Café Slab:** **4** (Index 74, confidence 88).

* **Why:** “800 m me 3 premium cafés (Starbucks, Blue Tokai, Chaayos), 4 pubs (Beer Café, Social, Irish House, Toit), 1 microbrewery. 38 outlets open till ≥23:00. Reviews: frequent mentions of ‘DJ night’ and ‘expensive drinks’.”

* **Risks:** “400 m core cluster weaker (only 1 café); nightlife stronger at 800 m.”

* **Notes:** “Good aspirational youth \+ weekend party hub → premium format viable.”

# **Local Events / Weekly Bazaars — 7-Step Framework**

## **Step 1 — Data Fetch (APIs & radius)**

* **Radius runs:** 400 m, 800 m, 1200 m.

* **APIs:**

  * **Places Nearby / TextSearch** → keywords: “bazaar”, “market”, “fair”, “mela”, “weekly market”, “haat”, “sabzi mandi”, “Sunday market”, “night market”.

  * **Place Details** → `name`, `types`, `user_ratings_total`, `rating`, `opening_hours`, `reviews.text`, `photos`.

  * **Street View Static** → to check visible market stalls, temporary tents, hawker congestion.

---

## **Step 2 — What to Query (deep dive \+ examples)**

### **A) Traditional Indian bazaars/haats**

* Keywords: “haat”, “mandi”, “sabzi mandi”, “bazaar”, “sunday market”, “weekly bazaar”.

* Examples: INA Market (Delhi), Sarafa Bazaar (Indore, night market), Bapu Bazaar (Jaipur), Hazratganj haat (Lucknow).

### **B) Event/fair spaces**

* Keywords: “ground”, “fair ground”, “maidan”, “exhibition ground”, “mela”.

* Examples: Ramlila Maidan (Delhi), Salt Lake Stadium ground fairs (Kolkata), Exhibition Grounds (Hyderabad).

### **C) Night markets & food bazaars**

* Keywords: “night market”, “street market”, “food street”.

* Examples: Dilli Haat (Delhi), Sarafa Night Bazaar (Indore), FC Road Street Food (Pune).

### **D) Review & photo cues**

* Keywords in reviews: “only on Sundays”, “weekly haat”, “mela”, “temporary stalls”, “crowded evenings”, “festival season market”.

* Photos: street vendors, tents, open grounds with stalls.

---

## **Step 3 — Proxies / Signals**

* **Event frequency:** Reviews mentioning “weekly”, “monthly”, “only on Sunday/Wednesday”.

* **Crowd volume:** `user_ratings_total` \+ reviews: “always crowded”, “footfall high”.

* **Category mix:** Veg/fruit mandis \= budget; handicraft/flea markets \= mid; curated night bazaars \= aspirational.

* **Timing proxy:** `opening_hours` irregular OR closed weekdays but open weekend \= bazaar.

* **Street View signals:** tents, carts, temporary stalls.

---

## **Step 4 — Interpret / Normalize**

* Create **Bazaar Intensity Score (BIS)** \=

  * Bazaar/fair POI count (30%)

  * Event frequency keywords (20%)

  * URT median \+ crowd keywords (20%)

  * Category mix (15%)

  * Timing irregularities (10%)

  * Street View validation (5%)

* Normalize BIS to 0–100.

---

## **Step 5 — Slab Assignment Rules**

* **Slab 1 — No bazaar culture:**

  * 0–1 mentions, no weekly markets, only permanent shops.

* **Slab 2 — Occasional local event:**

  * 1 monthly mela or small sabzi mandi.

  * Reviews mention “once in a while” / “during festival”.

* **Slab 3 — One strong weekly bazaar:**

  * At least 1 recurring haat/bazaar every week, with URT 100–300.

  * Photos show temporary stalls.

* **Slab 4 — Multiple weekly bazaars / famous local market:**

  * ≥2 recurring bazaars, OR 1 high-traffic landmark bazaar (INA Market, Sarafa Bazaar).

  * Reviews: “crowded”, “footfall heavy”.

* **Slab 5 — City-level event hub:**

  * Exhibition grounds/fair spaces with **multiple events yearly \+ weekly bazaars nearby**.

  * Reviews & media often cite “festival mela, exhibitions, cultural bazaars”.

  * URT \> 700 on main market node.

---

## **Step 6 — Integration into Location Engine**

* **Weightage:** 5–8% (smaller than residential or delivery, but high impact on peak footfall days).

* **Use case:**

  * Slab 1–2 → no special uplift in footfall.

  * Slab 3–5 → highlight **“crowd surge potential”** in weekend projections.

* **Confidence metric:**

  * % of POIs where event-frequency keywords found.

  * Street View validation (visible stalls).

  * Radius consistency (400 vs 1200 m).

---

## **Step 7 — Example Output (agent-style)**

* **Bazaar Slab:** **4** (BIS 69, confidence 77\)

* **Why:** “800 m me 2 weekly haats (Sunday Sabzi Mandi \+ Wednesday Flea Market); reviews mention ‘always crowded on weekends’; URT median \~280; Street View shows temporary stalls and carts.”

* **Risks:** “Footfall very high but skewed to budget-segment crowd; permanent weekday demand weaker.”

* **Notes:** “Strong weekend surge zone — good for impulse/snack sales, not premium dining.”

# **Hospitals / Clinics Nearby — 7-Step Framework (Google-only)**

## **Step 1 — Data Fetch (APIs, radius, fields)**

* **Radius runs:** 400 m (tight), 800 m (core), 1200 m (extended).

* **APIs:**

  * **Places Nearby / TextSearch** → healthcare POIs.

  * **Place Details** → `name, types, rating, user_ratings_total, opening_hours, business_status, reviews.text, photos, website`.

  * **Street View Static** → façade size, ER ramps, ambulance bays, pharmacy clusters.

* **Persist:** `place_id`, lat/lng, raw types, brand flag; de-dupe later (same hospital with multiple department pins).

---

## **Step 2 — What to Query (deep \+ brand examples)**

### **A) Core types**

* `hospital`, `clinic`, `doctor`, `medical_clinic`, `dentist`, `physiotherapist`, `pharmacy`, `diagnostic_center` *(diag may appear as `hospital`/`health` in Maps—use keywords too)*.

### **B) Brand/chain keywords (city dependent)**

* **Tertiary/multi-speciality (premium):** Apollo, Fortis, Max, Manipal, Narayana, Medanta, Aster, Columbia Asia, HN Reliance, Sir Ganga Ram (legacy), BLK, Kokilaben, HCG (oncology).

* **Mid private hospitals:** Shalby, Sunshine, Paras, Wockhardt, Ruby Hall, Care, Yashoda, Cloudnine (maternity), Motherhood, Rainbow (children), Sparsh, Kauvery.

* **Budget/Govt:** Civil Hospital, ESI Hospital, District Hospital, CGHS Wellness Centre, PHC/CHC, Urban Health Centre.

### **C) Keyword boosters (TextSearch \+ reviews.text)**

* **Capability:** “ICU”, “emergency”, “ER 24x7”, “OT”, “NICU”, “cardiac”, “oncology”, “dialysis”.

* **Quality/service:** “cashless”, “TPA”, “insurance desk”, “waiting time”, “cleanliness”.

* **Affordability:** “affordable”, “charitable”, “free OPD”, “government”.

---

## **Step 3 — Proxies / Signals (Google fields → measurable)**

1. **Facility tier mix**

   * Tertiary/multi-speciality (big branded) → high weight

   * Specialty clinics (maternity/child/ortho/dental) → medium

   * Single-doctor clinics/PHCs → low

2. **Scale proxies**

   * Photos: multi-storey tower, ER canopy, ambulance bays, multi-entrance → larger scale

   * Street View: hospital frontage, parking structure

3. **Popularity/Trust**

   * `user_ratings_total` (URT) median; high-URT nodes count (e.g., ≥500)

   * `rating` average & variance (lots of 4.0–4.4 with high URT \= stable)

4. **Capability keywords**

   * “ICU/OT/24x7 ER/NICU/dialysis/CT-MRI/cardiac cath lab” → higher capability

5. **Affordability/Payor mix**

   * “cashless/TPA/insurance” → insured/organized crowd (mid/premium)

   * “free OPD/charitable/government” → budget mass

6. **Support ecosystem density**

   * Nearby `pharmacy`, `diagnostic` labs, blood banks, ambulance services

7. **Operating hours**

   * ER 24x7, diagnostics early mornings (fasting tests) → active medical zone

---

## **Step 4 — Interpret / Normalize (build a 0–100 Health Access Index)**

**Suggested weights (tune later by calibration):**

* Facility tier mix (brand & type) → **30%**

* Popularity/Trust (URT, rating) → **20%**

* Capability keywords (ICU/ER/OT etc.) → **20%**

* Support ecosystem (pharmacy/diagnostics) → **15%**

* Scale/infra from photos/Street View → **10%**

* Payor/affordability signals (cashless vs charitable) → **5%** *(use for interpretation; don’t overfit)*

**Normalization tips:**

* City-wise min–max using last \~200 evaluated pins.

* De-dup hospital “department” pins (count once per facility).

* Keep separate scores for **400/800/1200 m**; use **800 m** as base, others for consistency.

---

## **Step 5 — 5-Slab Assignment (deterministic rules)**

* **Slab 1 — Basic/Budget Care Zone**

  * Mostly govt PHC/CHC/single-doctor clinics; **no** branded multi-speciality.

  * Health Access Index **\< 30**, URT median \<100, capabilities minimal, reviews: “basic OPD”.

* **Slab 2 — Entry Private \+ Govt Mix**

  * 1–2 small private hospitals, few clinics; limited diagnostics/pharmacy cluster.

  * Index **30–44**, some “cashless” mentions, but **no** big tertiary brand.

* **Slab 3 — Mid Private Ecosystem**

  * 1 mid multi-speciality **or** 3–5 specialty clinics \+ diagnostics \+ 24x7 pharmacy.

  * Index **45–64**, URT median 150–350, some ER/ICU keywords, ratings 3.8–4.1.

* **Slab 4 — Premium Private Access**

  * ≥1 big branded hospital **or** 2 strong mid multi-speciality within 800 m.

  * Index **65–79**, URT median 350–700, clear “ICU/ER 24x7/OT/TPA” signals; multiple diagnostics & pharmacies.

* **Slab 5 — Top-tier Healthcare Hub**

  * ≥2 branded tertiary hospitals **or** 1 flagship \+ dense specialty network (maternity/children/oncology).

  * Index **≥ 80**, multiple high-URT nodes (≥2 with 700+), strong capability keywords, structured parking/ambulance bays visible.

**Tie-breakers:**

* If **mother-child (Cloudnine/Rainbow) \+ adult tertiary** both present → push to next slab.

* If only govt tertiary (AIIMS-type) but massive URT/capability → allow **Slab 4–5** depending on reviews/crowd.

---

## **Step 6 — Integration into your location engine**

* **Suggested weight:** **5–8%** (health access ≠ direct F\&B demand, but indicates organized, family-heavy, higher-trust catchment).

* **Interpret with Spending Capacity:** premium hospitals nearby → affluent/insured crowd signal; govt-dominant → mass, weekday OPD surges.

* **Confidence metric:** coverage (% POIs with URT/rating), de-dup quality, radius consistency (|Slab\_400−Slab\_1200| ≤ 1).

---

## **Step 7 — Example Output (agent-style)**

* **Healthcare Slab:** **4** (Health Access Index **73**, confidence **82**)

* **Why:** “Fortis multi-speciality \+ Cloudnine maternity within 800 m; 24x7 ER \+ ICU keywords; URT median \~420; 3 diagnostics (NABL keywords) \+ 4 pharmacies (2 are 24x7). Street View shows ER canopy & ambulance bay.”

* **Risks:** “Parking tight at OPD hours; reviews flag waiting time.”

* **Notes:** “Premium family catchment; weekday daytime footfall from attendants—good for quick-serve snacking.”

# **Police / Security Presence — 7-Step Framework**

## **Step 1 — Data Fetch (APIs & radius)**

* **Radius runs:** 400 m, 800 m, 1200 m.

* **APIs:**

  * **Places Nearby / TextSearch** with types:

    * `police`, `security_service`, `fire_station`, `embassy`, `government_office`.

  * **Place Details:** `name`, `types`, `rating`, `user_ratings_total`, `opening_hours`, `business_status`, `reviews.text`, `photos`.

  * **Street View Static:** visible police chowkis, gates, barriers, CCTV cameras, private security guards at societies/malls.

---

## **Step 2 — What to Query (deep \+ examples)**

### **A) Police infrastructure**

* **Keywords:** “police station”, “police chowki”, “thana”, “outpost”, “traffic police post”.

* **Examples:** Connaught Place Police Station (Delhi), Bandra Police Chowki (Mumbai).

### **B) Security services (private/professional)**

* **Keywords:** “security services”, “guard services”, “bouncers”, “PSO”, “security agency”.

* **Examples:** SIS India, G4S Security, Topsgrup, Securitas.

### **C) Safety-enhancing landmarks**

* **Embassies/Consulates:** heavy police presence areas.

* **Malls/High streets:** Phoenix Mall (Mumbai), Select Citywalk (Delhi) — reviews often mention “tight security”, “bag checks”.

* **Reviews keywords:** “safe area”, “police nearby”, “security check”, “patrolling”, “CCTV”.

---

## **Step 3 — Proxies / Signals**

1. **Law enforcement density:** count of police stations, chowkis, traffic posts.

2. **Service strength:** presence of branded private security agencies (SIS, G4S).

3. **Visibility in reviews:** terms like “safe”, “patrolling”, “police presence”, “bag check”.

4. **Public trust metric:** URT & rating of police stations (low ratings & corruption mentions drag score down).

5. **Street View cues:** barricades, police vehicles, CCTV, uniformed guards.

6. **Society/mall gates:** multiple “security service” listings clustered \= premium gated zones.

---

## **Step 4 — Interpret / Normalize**

* **Security Index (0–100)** build karna using weights:

  * Police infrastructure density → **30%**

  * Private security agencies & gated societies → **25%**

  * Reviews & perception signals → **20%**

  * URT/Rating quality of police & services → **10%**

  * Street View visible infra (CCTV, barricades, guards) → **10%**

  * Safety landmark bonus (embassy, mall) → **5%**

* Normalize scores by city baseline (kyunki har city ka police infra alag hota hai).

---

## **Step 5 — Slab Assignment Rules**

* **Slab 1 — Low safety zone**

  * No police chowki/station in 1200 m.

  * Reviews: “unsafe”, “no police presence”.

  * No private security listings.

* **Slab 2 — Basic safety (chowki level)**

  * 1 small police chowki, few mentions in reviews.

  * No branded private security.

  * Avg rating \<3.5 on nearest police infra.

* **Slab 3 — Standard urban safety**

  * 1 full police station or 2+ chowkis in 800 m.

  * 1–2 private security listings.

  * Reviews: “police responsive”, “patrolling sometimes”.

* **Slab 4 — Strong police \+ private security mix**

  * 1 big police station \+ 2 chowkis \+ private security agencies (SIS, G4S).

  * Gated societies/malls with visible guards.

  * Reviews: “safe area”, “tight security”, URT median 200+.

* **Slab 5 — Premium high-security zone**

  * Dense police \+ traffic posts, **embassy/mall landmarks** with constant security.

  * Multiple private security brands \+ societies with “24x7 guards”.

  * Reviews: “very safe”, “police always patrolling”.

  * Street View: CCTV, barricades, guards visible.

**Tie-breakers:**

* Embassy nearby → automatic bump \+1 slab.

* If reviews mention “unsafe at night” repeatedly → drop 1 slab despite infra.

---

## **Step 6 — Integration into Location Engine**

* **Weight suggestion:** 5–7% (safety matters, but not main footfall driver).

* Works as **trust booster** — higher slabs \= better brand fit for family/affluent TG.

* **Confidence metric:** coverage of police POIs, review richness, Street View cues clarity, radius consistency.

---

## **Step 7 — Example Output**

* **Security Slab:** **4** (Security Index 68, confidence 80\)

* **Why:** “800 m me 1 full police station \+ 2 chowkis, 2 branded security agencies (SIS \+ G4S), 3 gated societies with 24x7 guards; reviews mention ‘safe and patrolled area’.”

* **Risks:** “Traffic police presence low, reviews mention night-time eve teasing in nearby lane.”

* **Notes:** “Strong safety profile; fit for family-oriented outlet.”

# **Footpath / Road Width — 7-Step Framework**

## **Step 1 — Data Fetch (APIs & radius)**

* **Radius runs:** sample the **immediate frontage road** of the pinned location \+ next junctions (50–200 m).

* **APIs:**

  * **Roads API / Directions API:** to snap pin to nearest road \+ get road class (highway, arterial, local).

  * **Street View Static API:** capture 3–4 frames at 50 m intervals along the frontage road.

  * **Places Nearby:** `parking`, `bus_stop`, `subway_station`, `shopping_mall` (context for road width).

---

## **Step 2 — What to Query (deep \+ examples)**

### **A) Road hierarchy (Roads API / Directions)**

* **Highway/Expressway** \= wide, fast-moving, less walkable.

* **Arterial/Main Road** \= 4–6 lane, commercial frontage.

* **Collector Road** \= 2–4 lane mixed-use.

* **Local Lane/Galli** \= 1–2 lane, narrow, mostly residential.

### **B) Footpath cues (Street View \+ reviews)**

* **Keywords in reviews:** “no footpath”, “wide pavements”, “pedestrian friendly”, “encroached by vendors”.

* **Examples:**

  * Connaught Place, Delhi \= wide circular footpaths with shops.

  * MG Road, Bangalore \= 6-lane road with usable sidewalks.

  * Old Chandni Chowk lanes \= \<2 m alleys, no footpaths.

### **C) Traffic/parking cues**

* **Reviews/Photos:** “road congested”, “wide road”, “ample parking”, “service lane”.

* **Street View:** parallel parking, cars \+ bikes on pavements.

---

## **Step 3 — Proxies / Signals**

1. **Road width proxy (visual & road class):**

   * 1-lane (3–4 m), 2-lane (6–8 m), 4-lane (12–16 m), 6+ lane (18–25 m).

2. **Footpath presence:** visible paved pedestrian path, curb height, tactile paving.

3. **Encroachment factor:** hawkers, parked bikes on footpath reduce usability.

4. **Traffic intensity:** arterial with constant flow vs galli with mixed vehicles.

5. **Parking availability:** dedicated service lane or on-street parking.

6. **Reviews cues:** “easy to walk”, “pedestrian friendly” \= posh; “encroached footpath”, “no space” \= budget.

---

## **Step 4 — Interpret / Normalize**

* Build **Road-Accessibility Index (RAI)** (0–100) \=

  * Road width class (30%)

  * Footpath presence/quality (30%)

  * Encroachment penalty (15%)

  * Parking availability (10%)

  * Review sentiment (10%)

  * Traffic intensity (5%)

* Normalize city-wise (kyunki Delhi ka 6-lane ≠ Shimla ka 6-lane).

---

## **Step 5 — Slab Assignment Rules**

* **Slab 1 — Narrow lanes / no footpath**

  * Road \<3 m, 1-lane only, no pavements, hawker encroachment, reviews: “no space to walk”.

* **Slab 2 — Small local roads**

  * 2-lane (5–7 m), broken/narrow footpaths, bikes parked on them, reviews mixed.

* **Slab 3 — Standard urban roads**

  * 2–4 lanes (8–12 m), usable footpaths on one/both sides, but partial encroachment.

  * Reviews: “manageable walk”, “traffic heavy but ok”.

* **Slab 4 — Wide arterial/commercial roads**

  * 4–6 lanes (12–20 m), proper pavements, service lanes/parallel parking.

  * Reviews: “pedestrian friendly”, “ample space”.

* **Slab 5 — Premium boulevard/high street**

  * 6+ lane roads (20–25 m) \+ broad pedestrian plazas (≥3 m wide), structured parking, clean sidewalks.

  * Examples: MG Road (BLR), Marine Drive (Mumbai), Golf Course Road (Gurgaon).

**Tie-breakers:**

* If Street View shows **encroached footpath** → drop 1 slab.

* If reviews repeatedly cite “walkable, safe at night” → bump \+1 slab.

---

## **Step 6 — Integration into Location Engine**

* **Weightage:** 8–12% (high impact on branding, accessibility, impulse footfall).

* **Interpretation:**

  * Slab 1–2 \= budget, walk-in footfall low, branding tough.

  * Slab 3 \= average market street.

  * Slab 4–5 \= premium high street/mall frontage, strong outdoor branding scope.

* **Confidence:** Street View sample coverage \+ review density.

---

## **Step 7 — Example Output (agent-style)**

* **Road/Footpath Slab:** **4** (RAI 72, confidence 85).

* **Why:** “Frontage road 18 m (6 lanes), wide paved footpaths both sides, parallel parking lane, Street View shows clean sidewalks; reviews: ‘easy to walk’ and ‘ample space for hoardings’.”

* **Risks:** “Occasional hawker encroachment during evenings.”

* **Notes:** “Excellent branding visibility; supports premium positioning.”

