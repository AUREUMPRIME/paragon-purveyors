# Phase 5 Connected Catalog Audit

## Status

This is a read-only audit for Phase 5: Section 3 ↔ Section 4 Connected Catalog System.

## Files inspected

- src/main.js
- src/selectedCutsModal.js
- src/forwardDepth.js
- src/styles.css

## Current high-level findings

- Section 3 is currently producer-first and rendered manually in src/main.js.
- Section 4 is currently cut-first and rendered manually in src/main.js.
- Producer modals/product lists are currently driven by data inside src/main.js.
- Selected cut modal behavior is currently separated in src/selectedCutsModal.js.
- Phase 5 should avoid large visual changes at first and focus on one shared data model.

## Producer card classes found

```text
black-opal
campo-grande
logo-led
mayura-station
robbins-island
wanderer
```

## Visible / accessible producer h3 entries found

```text
Black Opal
Campo Grande
Mayura Station
Robbins Island
Wanderer
```

## Product-list triggers found

```text
All Cuts
```

## Selected-cut triggers found

```text
Rump Cap
```

## Current cut card names found in Section 4

```text
All Cuts
Picanha
Presa
Ribeye
Secreto
Short Rib
Striploin
Tenderloin
Tomahawk
```

## Section 3 current markup excerpt

```html
<section id="producers" class="scene scene-portfolio" aria-labelledby="portfolio-title" data-section-name="Producers">
      <div class="scene-glow scene-glow-soft"></div>

      <div class="panel panel-portfolio">
        <div class="portfolio-head">
          <p class="eyebrow">Producer Portfolio</p>
          <h2 id="portfolio-title" class="portfolio-title">
            <span class="portfolio-title-line">Selected producers,</span>
            <span class="portfolio-title-line">in one portfolio.</span>
          </h2>
          <p class="body-copy portfolio-intro">
            A concise introduction to the producers behind the Paragon Purveyors offering.
          </p>
        </div>

        <div class="brand-grid">
                    <article class="brand-card brand-card--black-opal brand-card--logo-led" aria-label="Open Black Opal producer details">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/black-opal_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">F1 Australian Wagyu</span>
            <h3 class="brand-card__sr-name">Black Opal</h3>
            <p>Australian Wagyu chosen for rich marbling and a refined eating profile.</p>
          </article>

                    <article class="brand-card brand-card--mayura-station brand-card--logo-led" aria-label="Open Mayura Station producer details">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/mayura-station_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Full-Blood Australian Wagyu</span>
            <h3 class="brand-card__sr-name">Mayura Station</h3>
            <p>Distinctive Wagyu selected for depth, consistency, and character.</p>
          </article>

                    <article class="brand-card brand-card--campo-grande brand-card--logo-led" aria-label="Open Campo Grande producer details">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/campo-grande_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Spanish Ibérico Pork</span>
            <h3 class="brand-card__sr-name">Campo Grande</h3>
            <p>Premium Ibérico pork known for depth of flavor and remarkable texture.</p>
          </article>

                    <article class="brand-card brand-card--robbins-island brand-card--logo-led" aria-label="Open Robbins Island producer details">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/robbins-island_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Pure Blood Tasmanian Wagyu</span>
            <h3 class="brand-card__sr-name">Robbins Island</h3>
            <p>Tasmanian Wagyu selected for provenance, marbling, and balance.</p>
          </article>

                    <article class="brand-card brand-card--wanderer brand-card--logo-led" aria-label="Open Wanderer producer details">
            <img
              class="brand-card-icon"
              src="${assetPath("assets/provider-icons/wanderer_card_logo_512x192.png")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="brand-kicker">Free-Range Barley-Fed Beef</span>
            <h3 class="brand-card__sr-name">Wanderer</h3>
            <p>Barley-fed beef chosen for versatility, consistency, and dependable quality.</p>
          </article>
        </div>
      </div>
    </section>
```

## Section 4 current markup excerpt

```html
<section id="cuts" class="scene scene-cuts" aria-labelledby="cuts-title" data-section-name="Selected Cuts">
      <div class="scene-glow scene-glow-soft"></div>

      <div class="panel panel-cuts">
        <div class="cuts-head">
          <p class="eyebrow">Selected Cuts</p>
          <h2 id="cuts-title" class="cuts-title">
            <span class="cuts-title-line">Exceptional cuts,</span>
            <span class="cuts-title-line">selected with purpose.</span>
          </h2>
          <p class="body-copy cuts-intro">
            A focused overview of selected cuts across beef, Wagyu, and Ibérico pork.
          </p>
        </div>

        <div class="cuts-grid">
          <article class="cut-card cut-card--ribeye">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/ribeye.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="cut-card-shade" aria-hidden="true"></span>
            <span class="cut-kicker">Beef</span>
            <h3>Ribeye</h3>
          </article>

          <article class="cut-card cut-card--tenderloin">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/tenderloin.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="cut-card-shade" aria-hidden="true"></span>
            <span class="cut-kicker">Beef</span>
            <h3>Tenderloin</h3>
          </article>

          <article class="cut-card cut-card--striploin">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/striploin.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="cut-card-shade" aria-hidden="true"></span>
            <span class="cut-kicker">Beef</span>
            <h3>Striploin</h3>
          </article>

          <article class="cut-card cut-card--tomahawk">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/tomahawk.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="cut-card-shade" aria-hidden="true"></span>
            <span class="cut-kicker">Beef</span>
            <h3>Tomahawk</h3>
          </article>

          <article class="cut-card cut-card--presa">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/presa.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="cut-card-shade" aria-hidden="true"></span>
            <span class="cut-kicker">Pork</span>
            <h3>Presa</h3>
          </article>

          <article class="cut-card cut-card--secreto">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/secreto.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="cut-card-shade" aria-hidden="true"></span>
            <span class="cut-kicker">Pork</span>
            <h3>Secreto</h3>
          </article>

          <article class="cut-card cut-card--rump-cap" data-selected-cut-trigger="Rump Cap">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/rump-cap.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="cut-card-shade" aria-hidden="true"></span>
            <span class="cut-kicker">Beef</span>
            <h3>Picanha</h3>
          </article>

          <article class="cut-card cut-card--short-rib">
            <img
              class="cut-card-image"
              src="${assetPath("assets/cuts/short-rib.jpg")}"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <span class="cut-card-shade" aria-hidden="true"></span>
            <span class="cut-kicker">Wagyu</span>
            <h3>Short Rib</h3>
          </article>
          <article class="cut-card cut-card--all-cuts" data-product-list-trigger="All Cuts">
            <span class="cut-card-shade" aria-hidden="true"></span>
            <h3>All Cuts</h3>
            <p class="cut-card-description">View the complete visual cut reference.</p>
          </article>
        </div>
      </div>
    </section>
```

## Product-list / producer data area excerpt from src/main.js

```js
const productLists = {
    "Black Opal": {
      eyebrow: "Australian Wagyu",
      title: "Black Opal",
      // PROVIDER_INTRO_BLACK_OPAL_START
      providerIntro: {
        logo: assetPath("assets/provider-logos/modal/black-opal_modal_logo.png"),
        logoAlt: "Black Opal logo",
        bannerImage: assetPath("assets/provider-banners/black-opal-banner.png"),
        bannerLabel: "Consistency · Quality · Supply",
        copy: "Black Opal is selected for consistency: refined Australian Wagyu with generous marbling, a balanced eating profile, and dependable year-round supply. Raised through a disciplined long-term program in Victoria and Tasmania, it gives Paragon a reliable foundation for premium Wagyu across a range of marble scores.",
        tags: ["Australian Wagyu", "380+ Days Grain Fed", "Consistent Supply"],
        websiteCopy: "For additional information on Black Opal Wagyu, visit the producer's official brand page.",
        websiteLabel: "Visit Black Opal",
        websiteUrl: "https://www.haafco.com/black-opal-wagyu",
      },
      // PROVIDER_INTRO_BLACK_OPAL_END
      description: "",
      pdf: assetPath("assets/product-lists/PP_australian_wagyu.pdf"),
      sections: [
        {
          title: "Marbling Score 4-9+",
          rows: [
            ["4166", "Outside Skirt", "10/2# AVG. ~ 21# CS"],
            ["4167", "Hanging Tender", "10/2.6# AVG. ~ 26# CS"],
            ["4168", "Tail", "8/2.75# AVG. ~ 22# CS"],
          ],
        },
        {
          title: "Marbling Score 4-5",
          rows: [
            ["14101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
            ["14125", "Brisket", "2/15# AVG. ~ 30# CS"],
            ["14117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
            ["14135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
            ["14142", "Chuck Tail Flap", "3/13# AVG. ~ 40# CS"],
            ["14116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
            ["14104", "Striploin", "3/13# AVG. ~ 40# CS"],
            ["14107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
          ],
        },
        {
          title: "Marbling Score 6-7",
          rows: [
            ["24101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
            ["24102", "Export Rib", "2/9# AVG. ~ 18# CS"],
            ["24104", "Striploin", "3/13# AVG. ~ 40# CS"],
            ["24105", "Shortloin", "1/28# AVG. ~ 28# CS"],
            ["24107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
            ["24116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
            ["24117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
            ["24124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
            ["24129", "Chuck Eye Roll", "2/20# AVG. ~ 40# CS"],
            ["24131", "Bolar Blade", "2/11# AVG. ~ 22# CS"],
            ["24135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
            ["24142", "Chuck Tail Flap", "12/2.5# AVG. ~ 30# CS"],
            ["24125", "Brisket", "2/15# AVG. ~ 30# CS"],
            ["24120", "Top Round", "2/15# AVG. ~ 30# CS"],
            ["24123", "Top Sirloin", "4/8# AVG. ~ 32# CS"],
            ["24130", "Inside Skirt", "8/3.5# AVG. ~ 28# CS"],
            ["24160", "Eye Round", "6/5# AVG. ~ 30# CS"],
            ["24115", "Flank", "16/2.25# AVG. ~ 36# CS"],
          ],
        },
        {
          title: "Marbling Score 8-9",
          rows: [
            ["34142", "Chuck Tail Flap", "12/2.5# AVG. ~ 30# CS"],
            ["34101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
            ["34104", "Striploin", "3/13# AVG. ~ 40# CS"],
            ["34107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
            ["34116", "Tri Tip", "16/2.25# AVG. ~ 36# CS"],
            ["34117", "Flap Meat", "8/4.5# AVG. ~ 36# CS"],
            ["34123", "Top Sirloin", "4/8# AVG. ~ 32# CS"],
            ["34124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
            ["34125", "Brisket", "2/15# AVG. ~ 30# CS"],
            ["34129", "Chuck Roll", "2/20# AVG. ~ 40# CS"],
            ["34135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
            ["34160", "Eye Round", "6/5# AVG. ~ 30# CS"],
            ["34150", "Ribeye Cap (Lifter)", "32/0.9# AVG. ~ 30# CS"],
          ],
        },
      ],
    },
    "Mayura Station": {
      eyebrow: "Full-Blood Wagyu",
      title: "Mayura Station",
      // PROVIDER_INTRO_MAYURA_STATION_START
      providerIntro: {
        logo: assetPath("assets/provider-logos/modal/mayura-station_modal_logo.png"),
        logoAlt: "Mayura Station logo",
        bannerImage: assetPath("assets/provider-banners/mayura-station-banner.png"),
        bannerLabel: "Depth · Control · Character",
        copy: "Mayura Station is selected for depth, control, and unmistakable full-blood Wagyu character. Raised on a family-owned station in South Australia's Limestone Coast, its cattle are managed through a highly controlled program designed for richness, consistency, and a distinctive luxury eating profile.",
        tags: ["Full-Blood Wagyu", "Limestone Coast", "Signature Feeding Program"],
        websiteCopy: "For additional information on Mayura Station Wagyu, visit the producer's official brand page.",
        websiteLabel: "Visit Mayura Station",
        websiteUrl: "https://www.mayurastation.com",
      },
      // PROVIDER_INTRO_MAYURA_STATION_END
      description: "",
      pdf: assetPath("assets/product-lists/PP_full_blood_wagyu.pdf"),
      sections: [
        {
          title: "Marbling Score 8-9",
          rows: [
            ["27925", "Brisket Pedo", "3/13# AVG. ~ 39# CS"],
            ["27972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
          ],
        },
        {
          title: "Marbling Score 9+",
          rows: [
            ["37904", "Striploin", "2/19# AVG. ~ 37# CS"],
            ["37905", "Tenderloin", "4/7# AVG. ~ 30# CS"],
            ["37907", "Ribeye", "4/9# AVG. ~ 38# CS"],
            ["37972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
            ["37974", "Bone-In Striploin", "1/40# AVG. ~ 40# CS"],
            ["37925", "Brisket Pedo", "3/13# AVG. ~ 39# CS"],
            ["37932", "Oyster Blade", "8/6# AVG. ~ 49# CS"],
            ["37942", "Chuck Tail Flap", "12/3# AVG. ~ 35# CS"],
            ["37924", "Rump Cap (Culotte)", "8/4# AVG. ~ 34# CS"],
            ["37916", "Tri Tip", "12/3# AVG. ~ 33# CS"],
            ["37917", "Flap Meat", "8/4# AVG. ~ 35# CS"],
            ["37973", "3 Rib Export", "2/13# AVG. ~ 26# CS"],
            ["37975", "Shortloin", "1/22# AVG. ~ 22# CS"],
          ],
        },
      ],
    },
    "Campo Grande": {
      eyebrow: "Ibérico Pork",
      title: "Campo Grande",
      // PROVIDER_INTRO_CAMPO_GRANDE_START
      providerIntro: {
        logo: assetPath("assets/provider-logos/modal/campo-grande_modal_logo.png"),
        logoAlt: "Campo Grande logo",
        bannerImage: assetPath("assets/provider-banners/campo-grande-banner.png"),
        bannerLabel: "Heritage · Marbling · Flavor",
        copy: "Campo Grande is selected for its expressive Spanish Ibérico character: heirloom pigs, deep marbling, and a rich, savory eating profile that gives chefs a pork program with the presence of a luxury steak. Raised through family-owned farms in southern and western Spain, it brings heritage, flavor, and distinction to the Paragon portfolio.",
        tags: ["Spanish Ibérico", "Family-Owned Farms", "Heirloom Breed"],
        websiteCopy: "For additional information on Campo Grande Ibérico pork, visit the producer's official brand page.",
        websiteLabel: "Visit Campo Grande",
        websiteUrl: "https://eatcampogrande.com/",
      },
      // PROVIDER_INTRO_CAMPO_GRANDE_END
      description: "",
      pdf: assetPath("assets/product-lists/PP_iberico_pork.pdf"),
      sections: [
        {
          title: "Fresh Ibérico Pork Cuts",
          rows: [
            ["FP01", "Secreto", "16/1.1# AVG. ~ 17.5# CS"],
            ["FP02", "Presa", "12/1.54# AVG. ~ 18.5# CS"],
            ["FP03", "Albanico", "18/1.1# AVG. ~ 19.8# CS"],
            ["FP04", "Pluma", "12/1.5# AVG. ~ 18.5# CS"],
            ["FP05", "4-Rib Rack", "6/2.1# AVG. ~ 13# CS"],
            ["FP06", "Belly", "12/1.25# AVG. ~ 15# CS"],
            ["FP07", "Loin Roast", "12/1.25# AVG. ~ 15# CS"],
            ["FP08", "Coppa", "8/2.3# AVG. ~ 18# CS"],
            ["FP09", "St. Louis Rib", "6/1.8# AVG. ~ 11# CS"],
            ["FP10", "Flank Steak", "18/1.2# AVG. ~ 21# CS"],
            ["FP14", "Skirt Steak", "18/1.1# AVG. ~ 20# CS"],
            ["FP15", "Jowl Secreto", "16/0.5# AVG. ~ 8# CS"],
            ["FP16", "Belly Secreto", "14/1.3# AVG. ~ 18# CS"],
            ["FP18", "Tenderloin", "24/0.8# AVG. ~ 19.2# CS"],
            ["FP21", "Picnic Shoulder", "2/16# AVG. ~ 32# CS"],
            ["FP12", "Trim 70-80VL", "3/6# AVG. ~ 21# CS"],
          ],
        },
        {
          title: "Cured Retail List",
          rows: [
            ["CPL01", "Paleta Shoulder Ham 2PC (Chilled) B/I Whole", "2/12# AVG. ~ 24# CS"],
            ["CPS01", "Salchichon Sliced 2OZ", "12/2 OZ AVG. ~ 1.5# CS"],
            ["CPS02", "Chorizo Sliced 2OZ", "12/2 OZ AVG. ~ 1.5# CS"],
            ["CPS03", "Coppa Sliced 2OZ", "12/2 OZ AVG. ~ 1.5# CS"],
            ["CPSO5", "Paleta Sliced 2OZ", "12/2 OZ AVG. ~ 1.4# CS"],
            ["CPS06", "Bacon Sliced 12OZ", "12/12 OZ AVG. ~ 9# CS"],
            ["GPB01", "Ibérico & Wagyu Ground 4OZ", "24/14 OZ AVG. ~ 121# CS"],
            ["CPB05", "Paleta Sliced 1# Tray", "8/1# AVG. ~ 8# CS"],
          ],
        },
      ],
    },
    "Robbins Island": {
      eyebrow: "Tasmanian Wagyu",
      title: "Robbins Island",
      // PROVIDER_INTRO_ROBBINS_ISLAND_START
      providerIntro: {
        logo: assetPath("assets/provider-logos/modal/robbins-island_modal_logo.png"),
        logoAlt: "Robbins Island logo",
        bannerImage: assetPath("assets/provider-banners/robbins-island-banner.png"),
        bannerLabel: "Island · Terroir · Rarity",
        copy: "Robbins Island is selected for rarity, terroir, and unmistakable Tasmanian Wagyu character. Set off Tasmania's northwest coast, its cattle graze through saltwater channels in a pristine island environment before a long grain finish, creating a distinctive balance of clean origin, elite genetics, and high-marbling depth.",
        tags: ["Tasmanian Fullblood Wagyu", "18 Months on Pasture", "450+ Day Grain Finish"],
        websiteCopy: "For additional information on Robbins Island Wagyu, visit the producer's official brand page.",
        websiteLabel: "Visit Robbins Island",
        websiteUrl: "https://www.robbinsislandwagyu.com.au/",
      },
      // PROVIDER_INTRO_ROBBINS_ISLAND_END
      description: "",
      pdf: assetPath("assets/product-lists/PP_tasmanian_wagyu.pdf"),
      sections: [
        {
          title: "Marble Score 7-8+",
          rows: [
            ["22061W", "Flap Meat", "6/5# AVG. ~ 30# CS"],
            ["16022W", "OP Ribs", "2/12# AVG. ~ 24# CS"],
            ["1602TW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
            ["21102W", "Top Sirloin", "3/16# AVG. ~ 48# CS"],
            ["21602W", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
            ["22101W", "Flank", "9/3# AVG. ~ 36# CS"],
            ["22402W", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
            ["2266GS", "Chuck Tail Flap", "5/7# AVG. ~ 35# CS"],
            ["23032W", "Top Blade", "6/5# AVG. ~ 30# CS"],
            ["21311W", "Tri Tip", "12/3# AVG. ~ 36# CS"],
            ["21402W", "Striploin", "2/15# AVG. ~ 30# CS"],
            ["23501W", "Pedo Brisket", "3/16# AVG. ~ 48# CS"],
          ],
        },
        {
          title: "Marble Score 9+",
          rows: [
            ["16025W", "OP Ribs", "2/12# AVG. ~ 24# CS"],
            ["1602RW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
            ["20009T", "Topside", "4/12# AVG. ~ 36# CS"],
            ["20409T", "Eye Round", "6.8/5# AVG. ~ 38# CS"],
            ["20919T", "Top Sirloin Rump Cap On", "6/3# AVG. ~ 18# CS"],
            ["21409T", "Striploin", "2/15# AVG. ~ 30# CS"],
            ["22409T", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
            ["23029T", "Clod Heart", "5/7# AVG. ~ 35# CS"],
            ["23509T", "Pedo Brisket", "3/16# AVG. ~ 48# CS"],
            ["20709T", "Knuckle", "3/14# AVG. ~ 44# CS"],
            ["21109T", "Rost Biff CC Sirloin", "5/7# AVG. ~ 35# CS"],
            ["21609T", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
          ],
        },
      ],
    },
    // ALL_CUTS_PRODUCT_LIST_START
    "All Cuts": {
      eyebrow: "",
      title: "All Cuts",
      description: "A refined visual guide of cuts, with clear references, specifications, and preparation notes for each selection.",
      layout: "page-gallery",
      defaultGuideKey: "wagyu",
      guides: [
        {
          key: "wagyu",
          label: "Wagyu",
          pdf: assetPath("assets/product-lists/PP_all_cuts_guide.pdf"),
          layout: "page-gallery",
          pages: [
            { title: "Bolar Blade", src: assetPath("assets/all-cuts/pages/all-cuts-01.webp") },
            { title: "Chuck Eye Roll", src: assetPath("assets/all-cuts/pages/all-cuts-02.webp") },
            { title: "Chuck Tail Flap", src: assetPath("assets/all-cuts/pages/all-cuts-03.webp") },
            { title: "D-Rump", src: assetPath("assets/all-cuts/pages/all-cuts-04.webp") },
            { title: "Eye Round", src: assetPath("assets/all-cuts/pages/all-cuts-05.webp") },
            { title: "Flank Steak", src: assetPath("assets/all-cuts/pages/all-cuts-06.webp") },
            { title: "Flap Meat", src: assetPath("assets/all-cuts/pages/all-cuts-07.webp") },
            { title: "Inside Skirt", src: assetPath("assets/all-cuts/pages/all-cuts-08.webp") },
            { title: "Intercostals Long", src: assetPath("assets/all-cuts/pages/all-cuts-09.webp") },
            { title: "Navel End Brisket", src: assetPath("assets/all-cuts/pages/all-cuts-10.webp") },
            { title: "OP Ribs", src: assetPath("assets/all-cuts/pages/all-cuts-11.webp") },
            { title: "Oyster Blade", src: assetPath("assets/all-cuts/pages/all-cuts-12.webp") },
            { title: "Rib Eye Cap", src: assetPath("assets/all-cuts/pages/all-cuts-13.webp") },
            { title: "Rostbiff", src: assetPath("assets/all-cuts/pages/all-cuts-14.webp") },
            { title: "Rump Cap", src: assetPath("assets/all-cuts/pages/all-cuts-15.webp") },
            { title: "Short Loin", src: assetPath("assets/all-cuts/pages/all-cuts-16.webp") },
            { title: "Striploin", src: assetPath("assets/all-cuts/pages/all-cuts-17.webp") },
            { title: "Tenderloin Side Strap Off", src: assetPath("assets/all-cuts/pages/all-cuts-18.webp") },
            { title: "Tomahawk", src: assetPath("assets/all-cuts/pages/all-cuts-19.webp") },
            { title: "Topside Cap Off", src: assetPath("assets/all-cuts/pages/all-cuts-20.webp") },
            { title: "Tri Tip", src: assetPath("assets/all-cuts/pages/all-cuts-21.webp") },
            { title: "Thick Skirt", src: assetPath("assets/all-cuts/pages/all-cuts-22.webp") },
            { title: "Thin Skirt", src: assetPath("assets/all-cuts/pages/all-cuts-23.webp") },
            { title: "Cheek", src: assetPath("assets/all-cuts/pages/all-cuts-24.webp") },
            { title: "Tail", src: assetPath("assets/all-cuts/pages/all-cuts-25.webp") },
            { title: "Tongue", src: assetPath("assets/all-cuts/pages/all-cuts-26.webp") },
          ],
        },
        {
          key: "pork",
          label: "Pork",
          pdf: assetPath("assets/product-lists/PP_pork_cuts_guide.pdf"),
          layout: "page-gallery",
          pages: [
            { title: "Iberico Secreto", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-01.webp") },
            { title: "Iberico Presa", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-02.webp") },
            { title: "Iberico Abanico", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-03.webp") },
            { title: "Iberico Pluma", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-04.webp") },
            { title: "Iberico 4 Rib-Rack", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-05.webp") },
            { title: "Iberico Loin Roast", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-06.webp") },
            { title: "Iberico Coppa", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-07.webp") },
            { title: "Iberico St. Louis Ribs", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-08.webp") },
            { title: "Iberico Flank Steak", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-09.webp") },
            { title: "Iberico Skirt Steak", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-10.webp") },
            { title: "Iberico Jowl Secreto", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-11.webp") },
            { title: "Iberico Pork Belly Secreto", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-12.webp") },
            { title: "Iberico Pork Belly", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-13.webp") },
            { title: "Iberico Solomillo Tenderloin", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-14.webp") },
            { title: "Iberico Shoulder Picnic", src: assetPath("assets/all-cuts/pork/pages/pork-cuts-15.webp") },
          ],
        },
      ],
    },
    // ALL_CUTS_PRODUCT_LIST_END
    Wanderer: {
      eyebrow: "Free Range Barley Fed Beef",
      title: "Wanderer",
      // PROVIDER_INTRO_WANDERER_START
      providerIntro: {
        logo: assetPath("assets/provider-logos/modal/wanderer_modal_logo.png"),
        logoAlt: "Wanderer logo",
        bannerImage: assetPath("assets/provider-banners/wanderer-banner.png"),
        bannerLabel: "Free-Range · Barley-Fed · Dependable",
        copy: "Wanderer is selected for a distinct
```

## Selected cuts data area excerpt from src/selectedCutsModal.js

```js
const selectedCuts = {
  Ribeye: {
    eyebrow: "Selected Cut",
    title: "Ribeye",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/ribeye.jpg"),
    description:
      "A richly marbled center-plate cut selected for depth, tenderness, and a refined eating profile.",
    service:
      "Best for high-heat searing, grilling, and premium steak service.",
    rows: [
      ["14107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
      ["24107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
      ["34107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
      ["37907", "Ribeye", "4/9# AVG. ~ 38# CS"],
      ["22402W", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
      ["22409T", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
      ["2240XA", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
      ["2240XB", "Rib Eye Roll Lip Off 7LB+", "3/10# AVG. ~ 30# CS"],
    ],
  },
  Tenderloin: {
    eyebrow: "Selected Cut",
    title: "Tenderloin",
    category: "Beef / Wagyu / Pork",
    image: assetPath("assets/cuts/tenderloin.jpg"),
    description:
      "A refined, tender cut selected for clean presentation, delicate texture, and elegant service.",
    service:
      "Best for fine-dining portions, pan searing, roasting, and composed plates.",
    rows: [
      ["14135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
      ["24135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
      ["34135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
      ["37905", "Tenderloin", "4/7# AVG. ~ 30# CS"],
      ["FP18", "Tenderloin", "24/0.8# AVG. ~ 19.2# CS"],
      ["21602W", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
      ["21609T", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
      ["2160XA", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
      ["2160XB", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
    ],
  },
  Striploin: {
    eyebrow: "Selected Cut",
    title: "Striploin",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/striploin.jpg"),
    description:
      "A classic premium steak cut selected for balance, marbling, and a confident center-plate profile.",
    service:
      "Best for steaks, portioning, grilling, and refined steakhouse service.",
    rows: [
      ["14104", "Striploin", "3/13# AVG. ~ 40# CS"],
      ["24104", "Striploin", "3/13# AVG. ~ 40# CS"],
      ["34104", "Striploin", "3/13# AVG. ~ 40# CS"],
      ["37904", "Striploin", "2/19# AVG. ~ 37# CS"],
      ["37974", "Bone-In Striploin", "1/40# AVG. ~ 40# CS"],
      ["21402W", "Striploin", "2/15# AVG. ~ 30# CS"],
      ["21409T", "Striploin", "2/15# AVG. ~ 30# CS"],
      ["2140XA", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
      ["1562XA", "B/In Striploin Vac", "3/12# AVG. ~ 36# CS"],
      ["2140XB", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
      ["1562XB", "Striploin B/I", "2/16# AVG. ~ 32# CS"],
    ],
  },
  Tomahawk: {
    eyebrow: "Selected Cut",
    title: "Tomahawk",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/tomahawk.jpg"),
    description:
      "A dramatic bone-in cut selected for visual impact, rich flavor, and celebratory presentation.",
    service:
      "Best for sharing portions, grilling, roasting, and high-impact menu features.",
    rows: [
      ["14101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
      ["24101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
      ["34101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
      ["27972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
      ["37972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
      ["1602TW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
      ["1602RW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
    ],
  },
  Presa: {
    eyebrow: "Selected Cut",
    title: "Presa",
    category: "Ibérico Pork",
    image: assetPath("assets/cuts/presa.jpg"),
    description:
      "A highly regarded Ibérico cut selected for deep flavor, tenderness, and generous marbling.",
    service:
      "Best for grilling, searing, slicing, and Spanish-inspired center-plate service.",
    rows: [["FP02", "Presa", "12/1.54# AVG. ~ 18.5# CS"]],
  },
  Secreto: {
    eyebrow: "Selected Cut",
    title: "Secreto",
    category: "Ibérico Pork",
    image: assetPath("assets/cuts/secreto.jpg"),
    description:
      "A richly marbled Ibérico cut selected for expressive flavor, quick cooking, and delicate texture.",
    service:
      "Best for hot searing, charcoal grilling, slicing, and small-plate service.",
    rows: [
      ["FP01", "Secreto", "16/1.1# AVG. ~ 17.5# CS"],
      ["FP15", "Jowl Secreto", "16/0.5# AVG. ~ 8# CS"],
      ["FP16", "Belly Secreto", "14/1.3# AVG. ~ 18# CS"],
    ],
  },
  "Rump Cap": {
    eyebrow: "Selected Cut",
    title: "Picanha",
    category: "Beef / Wagyu",
    image: assetPath("assets/cuts/rump-cap.jpg"),
    description:
      "A flavorful cap cut selected for its fat cover, rich character, and versatile presentation.",
    service:
      "Best for roasting, grilling, slicing, and picanha-style service.",
    rows: [
      ["24124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
      ["34124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
      ["37924", "Rump Cap (Culotte)", "8/4# AVG. ~ 34# CS"],
      ["2091XA", "Rump Cap", "6/5# AVG. ~ 30# CS"],
      ["2091XB", "Rump Cap", "6/5# AVG. ~ 30# CS"],
    ],
  },
  "Short Rib": {
    eyebrow: "Selected Cut",
    title: "Short Rib",
    category: "Beef",
    image: assetPath("assets/cuts/short-rib.jpg"),
    description:
      "A richly flavored cut selected for depth, structure, and satisfying slow-cooked or grilled preparations.",
    service:
      "Best for braising, smoking, grilling, and Korean-style short rib service.",
    rows: [
      ["1688XA", "Short Rib 3-Rib", "12/4# AVG. ~ 48# CS"],
      ["1688XB", "Short Rib 3-Rib", "8/3# AVG. ~ 48# CS"],
    ],
  },
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const createRows = (rows) =>
  rows
    .map(
      ([code, product, specification]) => `
        <tr>
          <td>${escapeHtml(code)}</td>
          <td>${escapeHtml(product)}</td>
          <td>${escapeHtml(specification)}</td>
        </tr>
      `,
    )
    .join("");
```

## Relevant src/main.js lines

```text
165:                     <article class="brand-card brand-card--black-opal brand-card--logo-led" aria-label="Open Black Opal producer details">
167:               class="brand-card-icon"
174:             <h3 class="brand-card__sr-name">Black Opal</h3>
178:                     <article class="brand-card brand-card--mayura-station brand-card--logo-led" aria-label="Open Mayura Station producer details">
180:               class="brand-card-icon"
187:             <h3 class="brand-card__sr-name">Mayura Station</h3>
191:                     <article class="brand-card brand-card--campo-grande brand-card--logo-led" aria-label="Open Campo Grande producer details">
193:               class="brand-card-icon"
200:             <h3 class="brand-card__sr-name">Campo Grande</h3>
204:                     <article class="brand-card brand-card--robbins-island brand-card--logo-led" aria-label="Open Robbins Island producer details">
206:               class="brand-card-icon"
213:             <h3 class="brand-card__sr-name">Robbins Island</h3>
217:                     <article class="brand-card brand-card--wanderer brand-card--logo-led" aria-label="Open Wanderer producer details">
219:               class="brand-card-icon"
226:             <h3 class="brand-card__sr-name">Wanderer</h3>
326:           <article class="cut-card cut-card--rump-cap" data-selected-cut-trigger="Rump Cap">
351:           <article class="cut-card cut-card--all-cuts" data-product-list-trigger="All Cuts">
667:   const productLists = {
668:     "Black Opal": {
670:       title: "Black Opal",
672:       providerIntro: {
674:         logoAlt: "Black Opal logo",
677:         copy: "Black Opal is selected for consistency: refined Australian Wagyu with generous marbling, a balanced eating profile, and dependable year-round supply. Raised through a disciplined long-term program in Victoria and Tasmania, it gives Paragon a reliable foundation for premium Wagyu across a range of marble scores.",
679:         websiteCopy: "For additional information on Black Opal Wagyu, visit the producer's official brand page.",
680:         websiteLabel: "Visit Black Opal",
681:         websiteUrl: "https://www.haafco.com/black-opal-wagyu",
685:       pdf: assetPath("assets/product-lists/PP_australian_wagyu.pdf"),
686:       sections: [
751:     "Mayura Station": {
753:       title: "Mayura Station",
755:       providerIntro: {
757:         logoAlt: "Mayura Station logo",
760:         copy: "Mayura Station is selected for depth, control, and unmistakable full-blood Wagyu character. Raised on a family-owned station in South Australia's Limestone Coast, its cattle are managed through a highly controlled program designed for richness, consistency, and a distinctive luxury eating profile.",
762:         websiteCopy: "For additional information on Mayura Station Wagyu, visit the producer's official brand page.",
763:         websiteLabel: "Visit Mayura Station",
764:         websiteUrl: "https://www.mayurastation.com",
768:       pdf: assetPath("assets/product-lists/PP_full_blood_wagyu.pdf"),
769:       sections: [
797:     "Campo Grande": {
799:       title: "Campo Grande",
801:       providerIntro: {
803:         logoAlt: "Campo Grande logo",
806:         copy: "Campo Grande is selected for its expressive Spanish Ibérico character: heirloom pigs, deep marbling, and a rich, savory eating profile that gives chefs a pork program with the presence of a luxury steak. Raised through family-owned farms in southern and western Spain, it brings heritage, flavor, and distinction to the Paragon portfolio.",
808:         websiteCopy: "For additional information on Campo Grande Ibérico pork, visit the producer's official brand page.",
809:         websiteLabel: "Visit Campo Grande",
810:         websiteUrl: "https://eatcampogrande.com/",
814:       pdf: assetPath("assets/product-lists/PP_iberico_pork.pdf"),
815:       sections: [
852:     "Robbins Island": {
854:       title: "Robbins Island",
856:       providerIntro: {
858:         logoAlt: "Robbins Island logo",
861:         copy: "Robbins Island is selected for rarity, terroir, and unmistakable Tasmanian Wagyu character. Set off Tasmania's northwest coast, its cattle graze through saltwater channels in a pristine island environment before a long grain finish, creating a distinctive balance of clean origin, elite genetics, and high-marbling depth.",
863:         websiteCopy: "For additional information on Robbins Island Wagyu, visit the producer's official brand page.",
864:         websiteLabel: "Visit Robbins Island",
865:         websiteUrl: "https://www.robbinsislandwagyu.com.au/",
869:       pdf: assetPath("assets/product-lists/PP_tasmanian_wagyu.pdf"),
870:       sections: [
918:           pdf: assetPath("assets/product-lists/PP_all_cuts_guide.pdf"),
952:           pdf: assetPath("assets/product-lists/PP_pork_cuts_guide.pdf"),
975:     Wanderer: {
977:       title: "Wanderer",
979:       providerIntro: {
981:         logoAlt: "Wanderer logo",
984:         copy: "Wanderer is selected for a distinctive balance of free-range husbandry and barley-fed consistency. Its cattle roam open paddocks while accessing barley through an innovative mobile feeding system, giving chefs the richness, tenderness, and dependable quality of barley-fed beef without the use of intensive feedlots.",
986:         websiteCopy: "For additional information on Wanderer Beef, visit the producer's official brand page.",
987:         websiteLabel: "Visit Wanderer",
988:         websiteUrl: "https://www.wandererbeef.com.au/",
992:       pdf: assetPath("assets/product-lists/PP_free_range_barley_beef.pdf"),
993:       sections: [
1049:   const createProviderBrandLip = (providerIntro) => {
1050:     if (!providerIntro?.bannerLabel && !providerIntro?.bannerImage) {
1057:           providerIntro.bannerImage
1058:             ? `<img class="provider-modal-brand-lip__image" src="${escapeHtml(providerIntro.bannerImage)}" alt="" loading="eager" decoding="async" />`
1061:         <span>${escapeHtml(providerIntro.bannerLabel || "")}</span>
1066:   const createProviderOfficialLink = (providerIntro) => {
1067:     if (!providerIntro?.websiteUrl) {
1073:         <p>${escapeHtml(providerIntro.websiteCopy || "For additional information, visit the producer's official brand page.")}</p>
1074:         <a href="${escapeHtml(providerIntro.websiteUrl)}" target="_blank" rel="noopener noreferrer">
1081:   const createProviderIntro = (providerIntro) => {
1082:     if (!providerIntro) {
1086:     const tags = Array.isArray(providerIntro.tags) ? providerIntro.tags : [];
1089:       ${createProviderOfficialLink(providerIntro)}
1090:       ${createProviderBrandLip(providerIntro)}
1092:         <p>${escapeHtml(providerIntro.copy)}</p>
1110:     const providerIntro = productList.providerIntro;
1111:     const hasLogo = Boolean(providerIntro?.logo);
1131:         src="${escapeHtml(providerIntro.logo)}"
1132:         alt="${escapeHtml(providerIntro.logoAlt || `${productList.title} logo`)}"
1252:     const intro = createProviderIntro(productList.providerIntro);
1276:     const footer = createProviderFooter(productList.providerIntro);
1323:     const productList = productLists[providerName];
1401:       const productList = productLists[activeProductListTitle];
1411:   document.querySelectorAll(".brand-card, [data-product-list-trigger]").forEach((card) => {
1414:     if (!title || !productLists[title]) {
```

## Relevant src/selectedCutsModal.js lines

```text
2: const selectedCuts = {
3:   Ribeye: {
4:     eyebrow: "Selected Cut",
5:     title: "Ribeye",
7:     image: assetPath("assets/cuts/ribeye.jpg"),
9:       "A richly marbled center-plate cut selected for depth, tenderness, and a refined eating profile.",
13:       ["14107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
14:       ["24107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
15:       ["34107", "Ribeye", "3/12.5# AVG. ~ 38# CS"],
16:       ["37907", "Ribeye", "4/9# AVG. ~ 38# CS"],
17:       ["22402W", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
18:       ["22409T", "Ribeye Lip Off", "2/14# AVG. ~ 28# CS"],
23:   Tenderloin: {
24:     eyebrow: "Selected Cut",
25:     title: "Tenderloin",
27:     image: assetPath("assets/cuts/tenderloin.jpg"),
29:       "A refined, tender cut selected for clean presentation, delicate texture, and elegant service.",
33:       ["14135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
34:       ["24135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
35:       ["34135", "Tenderloin", "4/5.5# AVG. ~ 22# CS"],
36:       ["37905", "Tenderloin", "4/7# AVG. ~ 30# CS"],
37:       ["FP18", "Tenderloin", "24/0.8# AVG. ~ 19.2# CS"],
38:       ["21602W", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
39:       ["21609T", "Tenderloin SS Off", "6/5# AVG. ~ 30# CS"],
40:       ["2160XA", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
41:       ["2160XB", "Tenderloin SS Off 4LB+", "6/4# AVG. ~ 24# CS"],
44:   Striploin: {
45:     eyebrow: "Selected Cut",
46:     title: "Striploin",
48:     image: assetPath("assets/cuts/striploin.jpg"),
50:       "A classic premium steak cut selected for balance, marbling, and a confident center-plate profile.",
54:       ["14104", "Striploin", "3/13# AVG. ~ 40# CS"],
55:       ["24104", "Striploin", "3/13# AVG. ~ 40# CS"],
56:       ["34104", "Striploin", "3/13# AVG. ~ 40# CS"],
57:       ["37904", "Striploin", "2/19# AVG. ~ 37# CS"],
58:       ["37974", "Bone-In Striploin", "1/40# AVG. ~ 40# CS"],
59:       ["21402W", "Striploin", "2/15# AVG. ~ 30# CS"],
60:       ["21409T", "Striploin", "2/15# AVG. ~ 30# CS"],
61:       ["2140XA", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
62:       ["1562XA", "B/In Striploin Vac", "3/12# AVG. ~ 36# CS"],
63:       ["2140XB", "Striploin 11LB+", "3/12# AVG. ~ 36# CS"],
64:       ["1562XB", "Striploin B/I", "2/16# AVG. ~ 32# CS"],
67:   Tomahawk: {
68:     eyebrow: "Selected Cut",
69:     title: "Tomahawk",
71:     image: assetPath("assets/cuts/tomahawk.jpg"),
73:       "A dramatic bone-in cut selected for visual impact, rich flavor, and celebratory presentation.",
77:       ["14101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
78:       ["24101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
79:       ["34101", "Tomahawk", "2/11# AVG. ~ 22# CS"],
80:       ["27972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
81:       ["37972", "Tomahawk", "1/22# AVG. ~ 22# CS"],
82:       ["1602TW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
83:       ["1602RW", "Tomahawk", "2/12# AVG. ~ 24# CS"],
86:   Presa: {
87:     eyebrow: "Selected Cut",
88:     title: "Presa",
90:     image: assetPath("assets/cuts/presa.jpg"),
92:       "A highly regarded Ibérico cut selected for deep flavor, tenderness, and generous marbling.",
95:     rows: [["FP02", "Presa", "12/1.54# AVG. ~ 18.5# CS"]],
97:   Secreto: {
98:     eyebrow: "Selected Cut",
99:     title: "Secreto",
101:     image: assetPath("assets/cuts/secreto.jpg"),
103:       "A richly marbled Ibérico cut selected for expressive flavor, quick cooking, and delicate texture.",
107:       ["FP01", "Secreto", "16/1.1# AVG. ~ 17.5# CS"],
108:       ["FP15", "Jowl Secreto", "16/0.5# AVG. ~ 8# CS"],
109:       ["FP16", "Belly Secreto", "14/1.3# AVG. ~ 18# CS"],
112:   "Rump Cap": {
113:     eyebrow: "Selected Cut",
116:     image: assetPath("assets/cuts/rump-cap.jpg"),
118:       "A flavorful cap cut selected for its fat cover, rich character, and versatile presentation.",
122:       ["24124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
123:       ["34124", "Rump Cap", "8/3.5# AVG. ~ 28# CS"],
124:       ["37924", "Rump Cap (Culotte)", "8/4# AVG. ~ 34# CS"],
125:       ["2091XA", "Rump Cap", "6/5# AVG. ~ 30# CS"],
126:       ["2091XB", "Rump Cap", "6/5# AVG. ~ 30# CS"],
129:   "Short Rib": {
130:     eyebrow: "Selected Cut",
131:     title: "Short Rib",
133:     image: assetPath("assets/cuts/short-rib.jpg"),
135:       "A richly flavored cut selected for depth, structure, and satisfying slow-cooked or grilled preparations.",
139:       ["1688XA", "Short Rib 3-Rib", "12/4# AVG. ~ 48# CS"],
140:       ["1688XB", "Short Rib 3-Rib", "8/3# AVG. ~ 48# CS"],
156:       ([code, product, specification]) => `
158:           <td>${escapeHtml(code)}</td>
159:           <td>${escapeHtml(product)}</td>
160:           <td>${escapeHtml(specification)}</td>
166: export function initSelectedCutsModal() {
168:     <div class="selected-cut-modal__panel">
169:       <button class="selected-cut-modal__close" type="button" aria-label="Close selected cut details" data-selected-cut-close>
173:       <div class="selected-cut-modal__body">
174:         <figure class="selected-cut-modal__media">
175:           <img data-selected-cut-image src="" alt="" loading="lazy" />
176:           <figcaption data-selected-cut-fallback>Selected Cut</figcaption>
179:         <section class="selected-cut-modal__content">
180:           <p class="selected-cut-modal__eyebrow" data-selected-cut-eyebrow>Selected Cut</p>
181:           <h2 id="selected-cut-modal-title" data-selected-cut-title>Selected Cut</h2>
182:           <p class="selected-cut-modal__category" data-selected-cut-category></p>
183:           <p class="selected-cut-modal__description" data-selected-cut-description></p>
185:           <div class="selected-cut-modal__note">
187:             <p data-selected-cut-service></p>
190:           <div class="selected-cut-modal__table-wrap">
191:             <table class="selected-cut-modal__table">
194:                   <th scope="col">Code</th>
195:                   <th scope="col">Cut / Product</th>
196:                   <th scope="col">Specification</th>
199:               <tbody data-selected-cut-rows></tbody>
208:   let modal = document.getElementById("selected-cut-modal");
212:     modal.id = "selected-cut-modal";
216:   modal.className = "selected-cut-modal";
217:   modal.setAttribute("aria-labelledby", "selected-cut-modal-title");
220:   const panel = modal.querySelector(".selected-cut-modal__panel");
221:   const closeButton = modal.querySelector("[data-selected-cut-close]");
222:   const eyebrowNode = modal.querySelector("[data-selected-cut-eyebrow]");
223:   const titleNode = modal.querySelector("[data-selected-cut-title]");
224:   const categoryNode = modal.querySelector("[data-selected-cut-category]");
225:   const descriptionNode = modal.querySelector("[data-selected-cut-description]");
226:   const serviceNode = modal.querySelector("[data-selected-cut-service]");
227:   const rowsNode = modal.querySelector("[data-selected-cut-rows]");
228:   const imageNode = modal.querySelector("[data-selected-cut-image]");
229:   const fallbackNode = modal.querySelector("[data-selected-cut-fallback]");
231:   const openSelectedCut = (cutName, trigger) => {
232:     const cut = selectedCuts[cutName];
234:     if (!cut) {
240:     eyebrowNode.textContent = cut.eyebrow;
241:     titleNode.textContent = cut.title;
242:     categoryNode.textContent = cut.category;
243:     descriptionNode.textContent = cut.description;
244:     serviceNode.textContent = cut.service;
245:     rowsNode.innerHTML = createRows(cut.rows);
246:     fallbackNode.textContent = cut.title;
251:     imageNode.src = cut.image;
258:     document.body.classList.add("selected-cut-modal-open");
268:   const closeSelectedCut = () => {
269:     document.body.classList.remove("selected-cut-modal-open");
285:   document.querySelectorAll(".cut-card").forEach((card) => {
286:     const title = card.dataset.selectedCutTrigger || card.querySelector("h3")?.textContent?.trim();
288:     if (!title || !selectedCuts[title]) {
292:     card.dataset.selectedCutTrigger = title;
295:     const cutLabel = selectedCuts[title].title || title;
296:     card.setAttribute("aria-label", `Open ${cutLabel} details`);
299:       openSelectedCut(title, card);
305:         openSelectedCut(title, card);
310:   closeButton?.addEventListener("click", closeSelectedCut);
314:       closeSelectedCut();
319:     document.body.classList.remove("selected-cut-modal-open");
326:       closeSelectedCut();
```

## Relevant src/forwardDepth.js lines

```text
48: function getTargetSceneIndex(scenes, target) {
56:     producers: "#producers, .scene-portfolio",
57:     portfolio: "#producers, .scene-portfolio",
58:     cuts: "#cuts, .scene-cuts",
59:     selectedcuts: "#cuts, .scene-cuts",
74:   document.querySelectorAll(".section-index [data-section-target], .global-contact-cta[data-section-target]").forEach((control) => {
75:     const targetIndex = getTargetSceneIndex(scenes, control.dataset.sectionTarget);
188: function wireHeroButtons(scenes, goToSpot, cleanupCallbacks) {
191:     producers: "producers",
192:     portfolio: "producers",
193:     cuts: "cuts",
197:     Producers: "producers",
198:     "View Portfolio": "producers",
199:     "Selected Cuts": "cuts",
208:     const targetIndex = getTargetSceneIndex(scenes, sectionTarget);
225:       goToSpot(targetIndex, "hero-cta");
233: function wireSectionNavigation(scenes, goToSpot, cleanupCallbacks) {
234:   document.querySelectorAll(".section-index [data-section-target]").forEach((control) => {
235:     const targetIndex = getTargetSceneIndex(scenes, control.dataset.sectionTarget);
246:       goToSpot(targetIndex, "section-index");
297:   function goToSpot(targetIndex, source = "input") {
449:     goToSpot(nextIndex, "wheel");
454:     goToSpot(previousIndex, "wheel");
530:       goToSpot(0, "keyboard");
535:       goToSpot(scenes.length - 1, "keyboard");
551:   wireHeroButtons(scenes, goToSpot, cleanupCallbacks);
552:   wireSectionNavigation(scenes, goToSpot, cleanupCallbacks);
565:     goTo: (index) => goToSpot(index, "console"),
```

## Relevant src/styles.css lines

```text
194: .brand-card p {
295: .brand-card {
303: .brand-card:nth-child(4),
304: .brand-card:nth-child(5) {
308: .brand-card p {
326:   .brand-card,
327:   .brand-card:nth-child(4),
328:   .brand-card:nth-child(5) {
444: .cut-card {
452: .cut-card h3 {
1081: .brand-card {
1088: .brand-card > :not(.brand-card-icon) {
1093: .brand-card-icon {
1110: .brand-card--black-opal .brand-card-icon {
1115: .brand-card--mayura-station .brand-card-icon {
1120: .brand-card--campo-grande .brand-card-icon {
1125: .brand-card--robbins-island .brand-card-icon {
1130: .brand-card--wanderer .brand-card-icon {
1135: .brand-card--robbins-island,
1136: .brand-card--wanderer {
1141:   .brand-card {
1146:   .brand-card-icon,
1147:   .brand-card--black-opal .brand-card-icon,
1148:   .brand-card--mayura-station .brand-card-icon,
1149:   .brand-card--campo-grande .brand-card-icon,
1150:   .brand-card--robbins-island .brand-card-icon,
1151:   .brand-card--wanderer .brand-card-icon {
1160:   .brand-card {
1165:   .brand-card-icon,
1166:   .brand-card--black-opal .brand-card-icon,
1167:   .brand-card--mayura-station .brand-card-icon,
1168:   .brand-card--campo-grande .brand-card-icon,
1169:   .brand-card--robbins-island .brand-card-icon,
1170:   .brand-card--wanderer .brand-card-icon {
1181: .product-list-modal.product-list-modal--provider-intro {
1185: .product-list-modal__description:empty {
1190: .product-list-modal.product-list-modal--provider-intro .product-list-modal__header {
1196: .provider-modal-logo {
1209: .provider-modal-logo img {
1217: .provider-modal-brand-lip {
1226: .provider-modal-brand-lip__image {
1239: .provider-modal-brand-lip::before {
1248: .provider-modal-brand-lip::after {
1259: .provider-modal-brand-lip span {
1276: .provider-modal-intro {
1285: .provider-modal-intro p {
1293: .provider-modal-intro__tags {
1302: .provider-modal-intro__tags li {
1313: .provider-modal-intro + .product-list-section {
1321: .provider-modal-linkout {
1332: .provider-modal-linkout p {
1340: .provider-modal-linkout a {
1360: .provider-modal-linkout a:hover,
1361: .provider-modal-linkout a:focus-visible {
1369:   .product-list-modal.product-list-modal--provider-intro .product-list-modal__header {
1374:   .provider-modal-logo {
1382:   .provider-modal-logo img {
1386:   .provider-modal-brand-lip {
1391:   .provider-modal-brand-lip span {
1399:   .provider-modal-intro {
1404:   .provider-modal-intro p {
1409:   .provider-modal-intro__tags {
1413:   .provider-modal-intro__tags li {
1418:   .provider-modal-linkout {
1423:   .provider-modal-linkout a {
1430: .product-list-modal {
1449: .product-list-modal::backdrop {
1457: .product-list-modal__panel {
1467: .product-list-modal__close {
1487: .product-list-modal__close:hover,
1488: .product-list-modal__close:focus-visible {
1494: .product-list-modal__close:active {
1498: .product-list-modal__close span {
1505: .product-list-modal__header {
1510: .product-list-modal__eyebrow {
1520: .product-list-modal__header h2 {
1530: .product-list-modal__header p:last-child {
1538: .product-list-modal__body {
1546: .product-list-modal__body::-webkit-scrollbar {
1550: .product-list-modal__body::-webkit-scrollbar-track {
1555: .product-list-modal__body::-webkit-scrollbar-thumb {
1641: .product-list-modal__external {
1655: .product-list-modal__external:hover,
1656: .product-list-modal__external:focus-visible {
1671: body.product-list-modal-open {
1676:   .product-list-modal {
1682:   .product-list-modal__panel {
1687:   .product-list-modal__header {
1691:   .product-list-modal__header h2 {
1695:   .product-list-modal__header p:last-child {
1710:   .product-list-modal__panel {
1714:   .product-list-modal__header {
1718:   .product-list-modal__header p:last-child {
1722:   .product-list-modal__body {
1739:   .product-list-modal__external {
1748: .product-list-modal[open],
1750: .product-list-modal__panel,
1751: .product-list-modal__body {
1755: .product-list-modal__body {
1761: body.product-list-modal-open {
1767: .cut-card--all-cuts {
1782: .cut-card--all-cuts .cut-card-shade {
1788: .cut-card--all-cuts h3 {
1793: .cut-card-description {
1803: .product-list-modal.product-list-modal--page-gallery {
1807: .product-list-modal__header--with-tabs {
1886: .product-list-modal.product-list-modal--page-gallery {
1924:   .cut-card--all-cuts {
1930:   .cut-card--all-cuts h3 {
1934:   .product-list-modal.product-list-modal--page-gallery {
1942:   .cut-card--all-cuts {
1947:   .cut-card-description {
1973: .selected-cut-modal {
1992: .selected-cut-modal::backdrop {
2000: .selected-cut-modal__panel {
2007: .selected-cut-modal__close {
2027: .selected-cut-modal__close:hover,
2028: .selected-cut-modal__close:focus-visible {
2034: .selected-cut-modal__close:active {
2038: .selected-cut-modal__close span {
2045: .selected-cut-modal__body {
2055: .selected-cut-modal__body::-webkit-scrollbar {
2059: .selected-cut-modal__body::-webkit-scrollbar-track {
2064: .selected-cut-modal__body::-webkit-scrollbar-thumb {
2069: .selected-cut-modal__media {
2083: .selected-cut-modal__media img {
2095: .selected-cut-modal__media figcaption {
2103: .selected-cut-modal__content {
2108: .selected-cut-modal__eyebrow {
2117: .selected-cut-modal__content h2 {
2127: .selected-cut-modal__category {
2136: .selected-cut-modal__description {
2143: .selected-cut-modal__note {
2151: .selected-cut-modal__note span {
2161: .selected-cut-modal__note p {
2168: .selected-cut-modal__table-wrap {
2175: .selected-cut-modal__table {
2183: .selected-cut-modal__table th,
2184: .selected-cut-modal__table td {
2191: .selected-cut-modal__table tr:last-child td {
2195: .selected-cut-modal__table th:last-child,
2196: .selected-cut-modal__table td:last-child {
2200: .selected-cut-modal__table th {
2208: .selected-cut-modal__table td:first-child,
2209: .selected-cut-modal__table td:nth-child(2) {
2214: .selected-cut-modal__table td:first-child {
2219: .selected-cut-modal__table td:nth-child(2) {
2224: .selected-cut-modal__table td:nth-child(3) {
2230: body.selected-cut-modal-open {
2235:   .selected-cut-modal {
2241:   .selected-cut-modal__media {
2245:   .selected-cut-modal__media img {
2250:   .selected-cut-modal__content {
2254:   .selected-cut-modal__content h2 {
2260:   .selected-cut-modal__media {
2264:   .selected-cut-modal__media img {
2269:   .selected-cut-modal__content {
2273:   .selected-cut-modal__description {
2277:   .selected-cut-modal__table {
2281:   .selected-cut-modal__table th,
2282:   .selected-cut-modal__table td {
2286:   .selected-cut-modal__table th {
2293: .cut-card {
2300: .cut-card > :not(.cut-card-image):not(.cut-card-shade) {
2305: .cut-card-image {
2325: .cut-card-shade {
2335: .cut-card:hover .cut-card-image,
2336: .cut-card:focus-visible .cut-card-image {
2342: .cut-card--tomahawk .cut-card-image,
2343: .cut-card--short-rib .cut-card-image {
2348: .cut-card--tenderloin .cut-card-image,
2349: .cut-card--secreto .cut-card-image {
2355:   .cut-card {
2359:   .cut-card-image {
2364:   .cut-card--tomahawk .cut-card-image,
2365:   .cut-card--short-rib .cut-card-image {
2371:   .cut-card {
2375:   .cut-card-image {
2380:   .cut-card-shade {
2388:   .cut-card-image {
2392:   .cut-card:hover .cut-card-image,
2393:   .cut-card:focus-visible .cut-card-image {
2452:   .brand-card,
2453:   .brand-card:nth-child(4),
2454:   .brand-card:nth-child(5) {
2468:   .brand-card h3 {
2473:   .brand-card p {
2484:   .brand-card-icon {
2499:   .cut-card {
2513:   .cut-card h3 {
2519:   .cut-card-image {
2524:   .cut-card--tomahawk .cut-card-image,
2525:   .cut-card--short-rib .cut-card-image {
2529:   .cut-card--tenderloin .cut-card-image,
2530:   .cut-card--secreto .cut-card-image {
2534:   .cut-card-shade {
2568:   .brand-card {
2574:   .brand-card h3 {
2578:   .brand-card p {
2584:   .brand-card-icon {
2591:   .cut-card {
2597:   .cut-card h3 {
2601:   .cut-card-image {
2605:   .cut-card--tomahawk .cut-card-image,
2606:   .cut-card--short-rib .cut-card-image {
2989:   .cut-card-image {
2994:   .cut-card-shade {
3039:   .cut-card-image {
3044:   .cut-card-shade {
3277:   .panel-portfolio .brand-card {
3283:   .panel-portfolio .brand-card h3 {
3288:   .panel-portfolio .brand-card p {
3323:   .panel-portfolio .brand-card {
3329:   .panel-portfolio .brand-card h3 {
3333:   .panel-portfolio .brand-card p {
3342: .product-list-modal__eyebrow:empty {
3347: .cut-card--all-cuts {
3351: .cut-card--all-cuts h3,
3352: .cut-card--all-cuts .cut-card-description {
3382:   .panel-cuts .cut-card {
3386:   .panel-cuts .cut-card h3 {
3395:   .panel-cuts .cut-card--all-cuts {
3400:   .panel-cuts .cut-card--all-cuts h3 {
3404:   .panel-cuts .cut-card-description {
3410:   .cut-card--all-cuts {
3416:   .cut-card--all-cuts h3,
3417:   .cut-card--all-cuts .cut-card-description {
3425: .product-list-modal.product-list-modal--provider-intro .product-list-modal__header {
3429: .provider-modal-logo {
3436: .provider-modal-logo img {
3444:   .product-list-modal.product-list-modal--provider-intro .product-list-modal__header {
3448:   .provider-modal-logo {
3454:   .provider-modal-logo img {
3461: .provider-modal-logo img[src*="robbins-island_modal_logo.png"] {
3469:   .provider-modal-logo img[src*="robbins-island_modal_logo.png"] {
3624: body.product-list-modal-open .section-index,
3625: body.selected-cut-modal-open .section-index {
3934: body.product-list-modal-open .global-contact-cta,
3935: body.selected-cut-modal-open .global-contact-cta {
4315: .brand-card--logo-led {
4326: .brand-card--logo-led .brand-kicker {
4335: .brand-card--logo-led .brand-card-icon {
4348: .brand-card--logo-led p {
4358: .brand-card__sr-name {
4370: .brand-card--black-opal.brand-card--logo-led .brand-card-icon {
4374: .brand-card--mayura-station.brand-card--logo-led .brand-card-icon {
4378: .brand-card--campo-grande.brand-card--logo-led .brand-card-icon {
4382: .brand-card--robbins-island.brand-card--logo-led .brand-card-icon {
4386: .brand-card--wanderer.brand-card--logo-led .brand-card-icon {
4391:   .brand-card--logo-led {
4396:   .brand-card--logo-led .brand-card-icon {
4400:   .brand-card--logo-led p {
4407:   .brand-card--logo-led {
4412:   .brand-card--logo-led .brand-kicker {
4416:   .brand-card--logo-led p {
4457: .panel-portfolio .brand-card--logo-led {
4470: .panel-portfolio .brand-card--logo-led .brand-kicker,
4471: .panel-portfolio .brand-card--logo-led .brand-card-icon,
4472: .panel-portfolio .brand-card--logo-led p {
4481: .panel-portfolio .brand-card--logo-led .brand-kicker {
4491: .panel-portfolio .brand-card--logo-led .brand-card-icon {
4501: .panel-portfolio .brand-card--black-opal.brand-card--logo-led .brand-card-icon {
4505: .panel-portfolio .brand-card--mayura-station.brand-card--logo-led .brand-card-icon {
4509: .panel-portfolio .brand-card--campo-grande.brand-card--logo-led .brand-card-icon {
4513: .panel-portfolio .brand-card--robbins-island.brand-card--logo-led .brand-card-icon {
4517: .panel-portfolio .brand-card--wanderer.brand-card--logo-led .brand-card-icon {
4521: .panel-portfolio .brand-card--logo-led p {
4553:   .panel-portfolio .brand-card--logo-led {
4559:   .panel-portfolio .brand-card--logo-led .brand-card-icon {
4563:   .panel-portfolio .brand-card--logo-led p {
4575:   .panel-portfolio .brand-card--logo-led {
4585:   .panel-portfolio .brand-card--logo-led {
4590:   .panel-portfolio .brand-card--logo-led .brand-card-icon {
4614: .panel-portfolio .brand-card--logo-led {
4620: .panel-portfolio .brand-card--logo-led .brand-kicker {
4625: .panel-portfolio .brand-card--logo-led .brand-card-icon {
4629: .panel-portfolio .brand-card--black-opal.brand-card--logo-led .brand-card-icon {
4633: .panel-portfolio .brand-card--mayura-station.brand-card--logo-led .brand-card-icon {
4637: .panel-portfolio .brand-card--campo-grande.brand-card--logo-led .brand-card-icon {
4641: .panel-portfolio .brand-card--robbins-island.brand-card--logo-led .brand-card-icon {
4645: .panel-portfolio .brand-card--wanderer.brand-card--logo-led .brand-card-icon {
4649: .panel-portfolio .brand-card--logo-led p {
4669:   .panel-portfolio .brand-card--logo-led {
4675:   .panel-portfolio .brand-card--logo-led .brand-kicker {
4679:   .panel-portfolio .brand-card--logo-led .brand-card-icon {
4683:   .panel-portfolio .brand-card--logo-led p {
4695:   .panel-portfolio .brand-card--logo-led {
4701:   .panel-portfolio .brand-card--logo-led {
4705:   .panel-portfolio .brand-card--logo-led .brand-card-icon {
4729: .panel-portfolio .brand-card--logo-led {
4742: .panel-portfolio .brand-card--logo-led .brand-kicker {
4747: .panel-portfolio .brand-card--logo-led .brand-card-icon {
4755: .panel-portfolio .brand-card--black-opal.brand-card--logo-led .brand-card-icon {
4759: .panel-portfolio .brand-card--mayura-station.brand-card--logo-led .brand-card-icon {
4763: .panel-portfolio .brand-card--campo-grande.brand-card--logo-led .brand-card-icon {
4767: .panel-portfolio .brand-card--robbins-island.brand-card--logo-led .brand-card-icon {
4771: .panel-portfolio .brand-card--wanderer.brand-card--logo-led .brand-card-icon {
4775: .panel-portfolio .brand-card--logo-led p {
4781: .panel-portfolio .brand-card--logo-led:hover,
4782: .panel-portfolio .brand-card--logo-led:focus-visible {
4793: .panel-portfolio .brand-card--logo-led:hover .brand-card-icon,
4794: .panel-portfolio .brand-card--logo-led:focus-visible .brand-card-icon {
4802: .panel-portfolio .brand-card--logo-led:active {
4817:   .panel-portfolio .brand-card--logo-led {
4823:   .panel-portfolio .brand-card--logo-led .brand-kicker {
4827:   .panel-portfolio .brand-card--logo-led .brand-card-icon {
4831:   .panel-portfolio .brand-card--logo-led p {
4843:   .panel-portfolio .brand-card--logo-led {
4849:   .panel-portfolio .brand-card--logo-led {
4853:   .panel-portfolio .brand-card--logo-led .brand-card-icon {
4864: .provider-modal-official {
4874: .provider-modal-official p {
4884: .provider-modal-official a {
4901: .provider-modal-official a:hover,
4902: .provider-modal-official a:focus-visible {
4908: .product-list-modal.product-list-modal--provider-intro .provider-modal-brand-lip {
4912: .product-list-modal.product-list-modal--provider-intro .provider-modal-linkout,
4914: .product-list-modal__official-top {
4919:   .provider-modal-official {
4925:   .provider-modal-official a {
4932: .product-list-modal.product-list-modal--provider-intro .provider-modal-official {
4940: .product-list-modal.product-list-modal--provider-intro .provider-modal-official p {
4944: .product-list-modal.product-list-modal--provider-intro .provider-modal-official a {
4950:   .product-list-modal.product-list-modal--provider-intro .provider-modal-official {
4955:   .product-list-modal.product-list-modal--provider-intro .provider-modal-official a {
4963: .product-list-modal.product-list-modal--provider-intro .product-list-modal__header {
4974: .product-list-modal.product-list-modal--provider-intro .product-list-modal__eyebrow {
4990: .product-list-modal.product-list-modal--provider-intro [data-product-list-title] {
5002: .product-list-modal.product-list-modal--provider-intro .product-list-modal__description {
5006: .product-list-modal.product-list-modal--provider-intro .provider-modal-logo,
5007: .product-list-modal.product-list-modal--provider-intro [data-provider-modal-logo] {
5025: .product-list-modal.product-list-modal--provider-intro .provider-modal-logo img,
5026: .product-list-modal.product-list-modal--provider-intro [data-provider-modal-logo] img {
5038: .product-list-modal.product-list-modal--provider-intro .provider-modal-logo img[src*="black-opal_modal_logo.png"] {
5043: .product-list-modal.product-list-modal--provider-intro .provider-modal-logo img[src*="mayura-station_modal_logo.png"] {
5048: .product-list-modal.product-list-modal--provider-intro .provider-modal-logo img[src*="campo-grande_modal_logo.png"] {
5053: .product-list-modal.product-list-modal--provider-intro .provider-modal-logo img[src*="robbins-island_modal_logo.png"] {
5058: .product-list-modal.product-list-modal--provider-intro .provider-modal-logo img[src*="wanderer_modal_logo.png"] {
5063: .product-list-modal.product-list-modal--provider-intro .provider-modal-official {
5067: .product-list-modal.product-list-modal--provider-intro .provider-modal-brand-lip {
5072:   .product-list-modal.product-list-modal--provider-intro .product-list-modal__header {
5080:   .product-list-modal.product-list-modal--provider-intro .product-list-modal__eyebrow,
5081:   .product-list-modal.product-list-modal--provider-intro .provider-modal-logo,
5082:   .product-list-modal.product-list-modal--provider-intro [data-provider-modal-logo] {
5086:   .product-list-modal.product-list-modal--provider-intro .product-list-modal__eyebrow {
5093:   .product-list-modal.product-list-modal--provider-intro .provider-modal-logo,
5094:   .product-list-modal.product-list-modal--provider-intro [data-provider-modal-logo] {
```

## Recommended Phase 5 implementation order

1. Do not refactor all catalog logic at once.
2. Create a small shared catalog bridge first.
3. Define stable IDs for producers:
   - black-opal
   - mayura-station
   - campo-grande
   - robbins-island
   - wanderer
4. Define stable IDs for visible cut groups.
5. Add cross-link metadata without changing the visual layout first.
6. Add producer modal → cut modal navigation.
7. Add cut modal → producer modal navigation.
8. Only after the bridge works, expand all supplier cuts.

## Risks

- src/main.js currently contains many responsibilities and should not receive a large risky rewrite in one step.
- src/selectedCutsModal.js is separate and must be connected carefully.
- Producer modals and selected cut modals use different rendering paths.
- Product list names and cut card names may not match exactly, so normalization will be required.
