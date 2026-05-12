export const producers = [
  {
    id: "black-opal",
    productListTitle: "Black Opal",
    publicLabel: "F1 Australian Wagyu",
    sectionTarget: "producers",
  },
  {
    id: "mayura-station",
    productListTitle: "Mayura Station",
    publicLabel: "Full-Blood Australian Wagyu",
    sectionTarget: "producers",
  },
  {
    id: "campo-grande",
    productListTitle: "Campo Grande",
    publicLabel: "Spanish Ibérico Pork",
    sectionTarget: "producers",
  },
  {
    id: "robbins-island",
    productListTitle: "Robbins Island",
    publicLabel: "Pure Blood Tasmanian Wagyu",
    sectionTarget: "producers",
  },
  {
    id: "wanderer",
    productListTitle: "Wanderer",
    publicLabel: "Free-Range Barley-Fed Beef",
    sectionTarget: "producers",
  },
];

export const cuts = [
  {
    id: "ribeye",
    selectedCutTitle: "Ribeye",
    publicLabel: "Ribeye",
    sectionTarget: "cuts",
  },
  {
    id: "tenderloin",
    selectedCutTitle: "Tenderloin",
    publicLabel: "Tenderloin",
    sectionTarget: "cuts",
  },
  {
    id: "striploin",
    selectedCutTitle: "Striploin",
    publicLabel: "Striploin",
    sectionTarget: "cuts",
  },
  {
    id: "tomahawk",
    selectedCutTitle: "Tomahawk",
    publicLabel: "Tomahawk",
    sectionTarget: "cuts",
  },
  {
    id: "presa",
    selectedCutTitle: "Presa",
    publicLabel: "Presa",
    sectionTarget: "cuts",
  },
  {
    id: "secreto",
    selectedCutTitle: "Secreto",
    publicLabel: "Secreto",
    sectionTarget: "cuts",
  },
  {
    id: "rump-cap",
    selectedCutTitle: "Rump Cap",
    publicLabel: "Picanha",
    sectionTarget: "cuts",
  },
  {
    id: "short-rib",
    selectedCutTitle: "Short Rib",
    publicLabel: "Short Rib",
    sectionTarget: "cuts",
  },
];

export const producerCutLinks = {
  "black-opal": ["ribeye", "tenderloin", "striploin", "tomahawk", "rump-cap"],
  "mayura-station": ["ribeye", "tenderloin", "striploin", "tomahawk", "rump-cap"],
  "campo-grande": ["presa", "secreto", "tenderloin"],
  "robbins-island": ["ribeye", "tenderloin", "striploin", "tomahawk"],
  wanderer: ["ribeye", "tenderloin", "striploin", "rump-cap", "short-rib"],
};

export const getProducerByProductListTitle = (title) =>
  producers.find((producer) => producer.productListTitle === title) || null;

export const getCutById = (id) => cuts.find((cut) => cut.id === id) || null;

export const catalogIds = {
  producers,
  cuts,
  producerCutLinks,
};
