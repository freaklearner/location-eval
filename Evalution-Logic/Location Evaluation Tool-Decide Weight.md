# **Weightage Decide Karne Ka Base Logic**

Weightage hamesha 3 cheezon pe depend karega:

1. **Direct Revenue Driver**

   * Jo cheez directly sales ko impact kare (Footfall, Delivery Density, Spending Capacity).

   * Inko sabse zyada weight dena.

2. **Format Dependency**

   * Agar tum Cart khol rahe ho toh Footfall aur Student Mix high priority.

   * Agar Cloud Kitchen hai toh Delivery Density aur Spending Capacity high priority.

   * Agar Café format hai toh Nightlife/Café Presence aur Shopping Preferences important ho jaate hain.

3. **Supportive / Contextual Factors**

   * Jo indirectly support dete hain (Petrol Pump, Outdoor Branding Scope, Police Presence).

   * Inko low–mid weightage do (5–8%).

---

# **🔎 Step 2 — Sample Weight Distribution (The Momos Mafia, current DNA \= hygiene-upgrade street QSR \+ delivery)**

| Parameter | Weight % | Reason |
| ----- | ----- | ----- |
| **Footfall** | **18%** | Tumhare carts aur kiosks ke liye seedha walk-in driver. |
| **Zomato/Swiggy Delivery Density** | **15%** | Cloud kitchen aur delivery sales ke liye backbone. |
| **Spending Capacity** | **12%** | Decide karta hai ticket size (₹120 vs ₹250 ASP). |
| **Target Audience Fit** | **10%** | Agar audience mismatch hai toh sale drop karega even with footfall. |
| **Competition Pricing (Momo)** | **8%** | Market saturation aur price sensitivity samajhne ke liye. |
| **Residential/Society Presence** | **7%** | Repeat customers ke liye important, esp. families. |
| **Nearby Businesses/Offices** | **7%** | Lunch crowd aur regular repeat sales. |
| **Food Brand Presence** | **5%** | Catchment ka F\&B maturity signal. |
| **Clothing Brand Presence** | **3%** | Lifestyle proxy — spending \+ aspirational crowd. |
| **Footwear Brand Presence** | **2%** | Same as above, supportive proxy. |
| **Shopping Preferences Nearby** | **3%** | Consumerism indicator, premium or budget. |
| **Vehicle Mix (Mobility)** | **3%** | Catchment affluence \+ accessibility signal. |
| **Fitness/Gym/Walking Culture** | **2%** | Niche aspirational segment (bonus crowd). |
| **Student vs Office Crowd Mix** | **5%** | Format decide karta hai (student \= snack, office \= lunch). |
| **Nightlife/Café Presence** | **4%** | Café-style outlets aur aspirational positioning ke liye. |
| **Local Events/Weekly Bazaars** | **2%** | Weekend spikes only. |
| **Hospitals/Clinics Nearby** | **2%** | Daytime footfall driver (attendants/visitors). |
| **Police/Security Presence** | **2%** | Safety/trust proxy, not direct revenue. |
| **Outdoor Branding Scope** | **3%** | Visibility \+ recall, secondary driver. |
| **Footpath/Road Width** | **2%** | Accessibility, branding placement. |
| **Petrol Pump Nearby** | **1%** | Very weak proxy, only bonus driver. |

**Total \= 120% → Normalize to 100% (sab weights proportionally cut kar denge).**

---

# **🔎 Step 3 — Format-specific Adjustments**

* **Cart Format (Tier 2/3 focus):**

  * Footfall ↑ 25%

  * Student Mix ↑ 10%

  * Delivery Density ↓ 8%

* **Cloud Kitchen:**

  * Delivery Density ↑ 25%

  * Spending Capacity ↑ 15%

  * Footfall ↓ 5%

* **Café / Premium Outlet:**

  * Nightlife/Café ↑ 12%

  * Shopping Preferences ↑ 8%

  * Footfall \~15%

---

# **✅ Step 4 — Data-Driven Calibration (Best Part)**

tumhare paas already **40 outlets** hain → matlab tum ye kar sakte ho:

1. Har parameter ka slab → score convert karo.

2. Actual sales ke saath correlation run karo.

3. Jis parameter ka sales ke saath **highest correlation** nikle, usko higher weightage do.

   * Example: Agar tumhe pata chala ki “Residential Presence” ka sales correlation 0.6 hai aur “Petrol Pump” ka 0.1, toh Residential ko 10% aur Petrol Pump ko 2% se zyada nahi doge.

Ye step tumhare tool ko **brand-specific aur data-backed** bana dega.

