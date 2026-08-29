export type Street = {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
};

export type Area = {
  id: string;
  label: string;
  streets: Street[];
};

export type NigeriaState = {
  id: string;
  label: string;
  capital: string;
  center: { lat: number; lng: number };
  areas: Area[];
};

function street(
  id: string,
  label: string,
  area: string,
  state: string,
  lat: number,
  lng: number
): Street {
  return {
    id,
    label,
    address: `${label}, ${area}, ${state}`,
    lat,
    lng,
  };
}

function area(
  id: string,
  label: string,
  state: string,
  points: [string, string, number, number][]
): Area {
  return {
    id,
    label,
    streets: points.map(([sid, sLabel, lat, lng]) =>
      street(sid, sLabel, label, state, lat, lng)
    ),
  };
}

/** All 36 Nigerian states + FCT, each with areas and streets for booking. */
export const NIGERIA_STATES: NigeriaState[] = [
  {
    id: "abia",
    label: "Abia",
    capital: "Umuahia",
    center: { lat: 5.4527, lng: 7.5248 },
    areas: [
      area("abia-umuahia", "Umuahia", "Abia", [
        ["abia-umu-1", "Bank Road", 5.5263, 7.4896],
        ["abia-umu-2", "Mission Hill", 5.5341, 7.4952],
      ]),
      area("abia-aba", "Aba", "Abia", [
        ["abia-aba-1", "Azikiwe Road", 5.1127, 7.3667],
        ["abia-aba-2", "Faulks Road", 5.1065, 7.3598],
      ]),
    ],
  },
  {
    id: "adamawa",
    label: "Adamawa",
    capital: "Yola",
    center: { lat: 9.3265, lng: 12.3984 },
    areas: [
      area("ad-yola", "Yola", "Adamawa", [
        ["ad-yo-1", "Jimeta Main Market Rd", 9.279, 12.458],
        ["ad-yo-2", "Numan Road", 9.265, 12.45],
      ]),
      area("ad-mubi", "Mubi", "Adamawa", [
        ["ad-mu-1", "Mubi Central", 10.268, 13.264],
        ["ad-mu-2", "Sabon Layi", 10.275, 13.27],
      ]),
    ],
  },
  {
    id: "akwa-ibom",
    label: "Akwa Ibom",
    capital: "Uyo",
    center: { lat: 5.0377, lng: 7.9128 },
    areas: [
      area("ak-uyo", "Uyo", "Akwa Ibom", [
        ["ak-uyo-1", "Abak Road", 5.038, 7.909],
        ["ak-uyo-2", "Oron Road", 5.02, 7.93],
      ]),
      area("ak-eket", "Eket", "Akwa Ibom", [
        ["ak-ek-1", "Marina Road", 4.642, 7.924],
        ["ak-ek-2", "Grace Bill Road", 4.65, 7.93],
      ]),
    ],
  },
  {
    id: "anambra",
    label: "Anambra",
    capital: "Awka",
    center: { lat: 6.2101, lng: 7.074 },
    areas: [
      area("an-awka", "Awka", "Anambra", [
        ["an-aw-1", "Zik Avenue", 6.2105, 7.072],
        ["an-aw-2", "Unizik Temporary Site Rd", 6.245, 7.12],
      ]),
      area("an-onitsha", "Onitsha", "Anambra", [
        ["an-on-1", "Port Harcourt Rd", 6.145, 6.785],
        ["an-on-2", "New Market Road", 6.15, 6.79],
      ]),
    ],
  },
  {
    id: "bauchi",
    label: "Bauchi",
    capital: "Bauchi",
    center: { lat: 10.3103, lng: 9.8439 },
    areas: [
      area("ba-bauchi", "Bauchi City", "Bauchi", [
        ["ba-1", "Ran Road", 10.315, 9.844],
        ["ba-2", "Yelwa Road", 10.3, 9.85],
      ]),
      area("ba-azare", "Azare", "Bauchi", [
        ["ba-az-1", "Azare Central", 11.678, 10.191],
        ["ba-az-2", "Misau Road", 11.67, 10.2],
      ]),
    ],
  },
  {
    id: "bayelsa",
    label: "Bayelsa",
    capital: "Yenagoa",
    center: { lat: 4.9267, lng: 6.2676 },
    areas: [
      area("by-yenagoa", "Yenagoa", "Bayelsa", [
        ["by-ye-1", "Mbiama Road", 4.927, 6.268],
        ["by-ye-2", "Imgbi Road", 4.94, 6.28],
      ]),
      area("by-brass", "Brass", "Bayelsa", [
        ["by-br-1", "Brass Waterfront", 4.312, 6.242],
        ["by-br-2", "Twon Brass", 4.32, 6.25],
      ]),
    ],
  },
  {
    id: "benue",
    label: "Benue",
    capital: "Makurdi",
    center: { lat: 7.7322, lng: 8.5391 },
    areas: [
      area("be-makurdi", "Makurdi", "Benue", [
        ["be-ma-1", "Wurukum Roundabout", 7.733, 8.54],
        ["be-ma-2", "Modern Market Rd", 7.72, 8.53],
      ]),
      area("be-gboko", "Gboko", "Benue", [
        ["be-gb-1", "Gboko Central", 7.325, 9.005],
        ["be-gb-2", "Yandev Road", 7.33, 9.01],
      ]),
    ],
  },
  {
    id: "borno",
    label: "Borno",
    capital: "Maiduguri",
    center: { lat: 11.8333, lng: 13.15 },
    areas: [
      area("bo-maiduguri", "Maiduguri", "Borno", [
        ["bo-mai-1", "Baga Road", 11.845, 13.16],
        ["bo-mai-2", "Custom Area", 11.83, 13.14],
      ]),
      area("bo-biu", "Biu", "Borno", [
        ["bo-bi-1", "Biu Central", 10.612, 12.19],
        ["bo-bi-2", "Garkida Road", 10.62, 12.2],
      ]),
    ],
  },
  {
    id: "cross-river",
    label: "Cross River",
    capital: "Calabar",
    center: { lat: 4.9757, lng: 8.3417 },
    areas: [
      area("cr-calabar", "Calabar", "Cross River", [
        ["cr-ca-1", "Marian Road", 4.976, 8.342],
        ["cr-ca-2", "Murtala Mohammed Hwy", 4.99, 8.33],
      ]),
      area("cr-igu", "Ikom", "Cross River", [
        ["cr-ik-1", "Ikom Market Rd", 5.966, 8.706],
        ["cr-ik-2", "Okuni Road", 5.97, 8.71],
      ]),
    ],
  },
  {
    id: "delta",
    label: "Delta",
    capital: "Asaba",
    center: { lat: 6.2059, lng: 6.6959 },
    areas: [
      area("de-asaba", "Asaba", "Delta", [
        ["de-as-1", "Nnebisi Road", 6.206, 6.696],
        ["de-as-2", "Summit Road", 6.22, 6.7],
      ]),
      area("de-warri", "Warri", "Delta", [
        ["de-wa-1", "Effurun Roundabout", 5.556, 5.78],
        ["de-wa-2", "Airport Road", 5.57, 5.79],
      ]),
    ],
  },
  {
    id: "ebonyi",
    label: "Ebonyi",
    capital: "Abakaliki",
    center: { lat: 6.3249, lng: 8.1135 },
    areas: [
      area("eb-abakaliki", "Abakaliki", "Ebonyi", [
        ["eb-ab-1", "Ogoja Road", 6.325, 8.114],
        ["eb-ab-2", "Water Works Rd", 6.33, 8.12],
      ]),
      area("eb-afikpo", "Afikpo", "Ebonyi", [
        ["eb-af-1", "Afikpo Main", 5.893, 7.935],
        ["eb-af-2", "Amasiri Road", 5.9, 7.94],
      ]),
    ],
  },
  {
    id: "edo",
    label: "Edo",
    capital: "Benin City",
    center: { lat: 6.335, lng: 5.6037 },
    areas: [
      area("ed-benin", "Benin City", "Edo", [
        ["ed-be-1", "Ring Road", 6.335, 5.621],
        ["ed-be-2", "Akpakpava Street", 6.34, 5.63],
      ]),
      area("ed-auch", "Auchi", "Edo", [
        ["ed-au-1", "Auchi Polytechnic Rd", 7.067, 6.267],
        ["ed-au-2", "Jattu Road", 7.07, 6.27],
      ]),
    ],
  },
  {
    id: "ekiti",
    label: "Ekiti",
    capital: "Ado-Ekiti",
    center: { lat: 7.6233, lng: 5.221 },
    areas: [
      area("ek-ado", "Ado-Ekiti", "Ekiti", [
        ["ek-ad-1", "Ijigbo Street", 7.623, 5.221],
        ["ek-ad-2", "Fajuyi Road", 7.63, 5.23],
      ]),
      area("ek-ikere", "Ikere", "Ekiti", [
        ["ek-ik-1", "Ikere Central", 7.5, 5.23],
        ["ek-ik-2", "Ise Road", 7.505, 5.235],
      ]),
    ],
  },
  {
    id: "enugu",
    label: "Enugu",
    capital: "Enugu",
    center: { lat: 6.4584, lng: 7.5464 },
    areas: [
      area("en-enugu", "Enugu City", "Enugu", [
        ["en-en-1", "Ogui Road", 6.45, 7.51],
        ["en-en-2", "Abakaliki Road", 6.46, 7.53],
      ]),
      area("en-nsukka", "Nsukka", "Enugu", [
        ["en-ns-1", "University Road", 6.856, 7.396],
        ["en-ns-2", "Obollo Road", 6.86, 7.4],
      ]),
    ],
  },
  {
    id: "fct",
    label: "FCT (Abuja)",
    capital: "Abuja",
    center: { lat: 9.0765, lng: 7.3986 },
    areas: [
      area("fct-maitama", "Maitama", "FCT", [
        ["fct-ma-1", "Aguiyi Ironsi Street", 9.0882, 7.4922],
        ["fct-ma-2", "Ahmadu Bello Way", 9.08, 7.48],
      ]),
      area("fct-wuse", "Wuse 2", "FCT", [
        ["fct-wu-1", "Aminu Kano Crescent", 9.065, 7.4648],
        ["fct-wu-2", "Adetokunbo Ademola Cres", 9.07, 7.47],
      ]),
      area("fct-garki", "Garki", "FCT", [
        ["fct-ga-1", "Area 11", 9.035, 7.485],
        ["fct-ga-2", "Moshood Abiola Way", 9.04, 7.49],
      ]),
      area("fct-asokoro", "Asokoro", "FCT", [
        ["fct-as-1", "Yakubu Gowon Crescent", 9.0431, 7.5142],
        ["fct-as-2", "Naples Street", 9.05, 7.52],
      ]),
    ],
  },
  {
    id: "gombe",
    label: "Gombe",
    capital: "Gombe",
    center: { lat: 10.2897, lng: 11.171 },
    areas: [
      area("go-gombe", "Gombe City", "Gombe", [
        ["go-1", "Biu Road", 10.29, 11.17],
        ["go-2", "Pantami Road", 10.28, 11.18],
      ]),
      area("go-kumo", "Kumo", "Gombe", [
        ["go-ku-1", "Kumo Central", 10.045, 11.21],
        ["go-ku-2", "Billiri Road", 10.05, 11.22],
      ]),
    ],
  },
  {
    id: "imo",
    label: "Imo",
    capital: "Owerri",
    center: { lat: 5.484, lng: 7.0351 },
    areas: [
      area("im-owerri", "Owerri", "Imo", [
        ["im-ow-1", "Douglas Road", 5.485, 7.035],
        ["im-ow-2", "Wetheral Road", 5.49, 7.04],
      ]),
      area("im-orlu", "Orlu", "Imo", [
        ["im-or-1", "Orlu Main Market", 5.796, 7.033],
        ["im-or-2", "Amaifeke Road", 5.8, 7.04],
      ]),
    ],
  },
  {
    id: "jigawa",
    label: "Jigawa",
    capital: "Dutse",
    center: { lat: 11.7564, lng: 9.338 },
    areas: [
      area("ji-dutse", "Dutse", "Jigawa", [
        ["ji-du-1", "Sani Abacha Way", 11.756, 9.338],
        ["ji-du-2", "Kiyawa Road", 11.76, 9.34],
      ]),
      area("ji-hadejia", "Hadejia", "Jigawa", [
        ["ji-ha-1", "Hadejia Central", 12.45, 10.04],
        ["ji-ha-2", "Nguru Road", 12.46, 10.05],
      ]),
    ],
  },
  {
    id: "kaduna",
    label: "Kaduna",
    capital: "Kaduna",
    center: { lat: 10.5105, lng: 7.4165 },
    areas: [
      area("kd-kaduna", "Kaduna City", "Kaduna", [
        ["kd-ka-1", "Ahmadu Bello Way", 10.52, 7.44],
        ["kd-ka-2", "Independence Way", 10.51, 7.43],
      ]),
      area("kd-zaria", "Zaria", "Kaduna", [
        ["kd-za-1", "Samaru Road", 11.085, 7.72],
        ["kd-za-2", "PZ Road", 11.08, 7.71],
      ]),
    ],
  },
  {
    id: "kano",
    label: "Kano",
    capital: "Kano",
    center: { lat: 12.0022, lng: 8.592 },
    areas: [
      area("kn-kano", "Kano City", "Kano", [
        ["kn-ka-1", "Zoo Road", 11.98, 8.55],
        ["kn-ka-2", "Murtala Mohammed Way", 12.0, 8.53],
      ]),
      area("kn-nassarawa", "Nassarawa GRA", "Kano", [
        ["kn-na-1", "Audu Bako Way", 12.01, 8.57],
        ["kn-na-2", "Hotoro Road", 12.0, 8.58],
      ]),
    ],
  },
  {
    id: "katsina",
    label: "Katsina",
    capital: "Katsina",
    center: { lat: 12.9908, lng: 7.6018 },
    areas: [
      area("kt-katsina", "Katsina City", "Katsina", [
        ["kt-1", "IBB Way", 12.99, 7.6],
        ["kt-2", "Kofar Bai Road", 13.0, 7.61],
      ]),
      area("kt-daura", "Daura", "Katsina", [
        ["kt-da-1", "Daura Central", 13.033, 8.318],
        ["kt-da-2", "Kongolom Road", 13.04, 8.32],
      ]),
    ],
  },
  {
    id: "kebbi",
    label: "Kebbi",
    capital: "Birnin Kebbi",
    center: { lat: 12.4539, lng: 4.1975 },
    areas: [
      area("ke-birnin", "Birnin Kebbi", "Kebbi", [
        ["ke-bi-1", "Emir Road", 12.454, 4.198],
        ["ke-bi-2", "Jega Road", 12.46, 4.2],
      ]),
      area("ke-argungu", "Argungu", "Kebbi", [
        ["ke-ar-1", "Argungu Festival Rd", 12.745, 4.525],
        ["ke-ar-2", "Sokoto Road", 12.75, 4.53],
      ]),
    ],
  },
  {
    id: "kogi",
    label: "Kogi",
    capital: "Lokoja",
    center: { lat: 7.8023, lng: 6.734 },
    areas: [
      area("ko-lokoja", "Lokoja", "Kogi", [
        ["ko-lo-1", "Murtala Mohammed Rd", 7.802, 6.734],
        ["ko-lo-2", "Ganaja Road", 7.79, 6.74],
      ]),
      area("ko-okene", "Okene", "Kogi", [
        ["ko-ok-1", "Okene Central", 7.56, 6.24],
        ["ko-ok-2", "Ajaokuta Road", 7.55, 6.25],
      ]),
    ],
  },
  {
    id: "kwara",
    label: "Kwara",
    capital: "Ilorin",
    center: { lat: 8.4799, lng: 4.5418 },
    areas: [
      area("kw-ilorin", "Ilorin", "Kwara", [
        ["kw-il-1", "Taiwo Road", 8.48, 4.55],
        ["kw-il-2", "Unity Road", 8.49, 4.54],
      ]),
      area("kw-offa", "Offa", "Kwara", [
        ["kw-of-1", "Offa Garage", 8.15, 4.72],
        ["kw-of-2", "Igosun Road", 8.16, 4.73],
      ]),
    ],
  },
  {
    id: "lagos",
    label: "Lagos",
    capital: "Ikeja",
    center: { lat: 6.5244, lng: 3.3792 },
    areas: [
      area("la-vi", "Victoria Island", "Lagos", [
        ["la-vi-1", "Adeola Odeku Street", 6.4281, 3.4219],
        ["la-vi-2", "Akin Adesola Street", 6.43, 3.42],
      ]),
      area("la-lekki", "Lekki Phase 1", "Lagos", [
        ["la-le-1", "Admiralty Way", 6.4474, 3.4721],
        ["la-le-2", "Freedom Way", 6.45, 3.48],
      ]),
      area("la-ikeja", "Ikeja GRA", "Lagos", [
        ["la-ik-1", "Isaac John Street", 6.6018, 3.3515],
        ["la-ik-2", "Obafemi Awolowo Way", 6.59, 3.35],
      ]),
      area("la-yaba", "Yaba", "Lagos", [
        ["la-ya-1", "Herbert Macaulay Way", 6.5095, 3.3711],
        ["la-ya-2", "Commercial Avenue", 6.51, 3.37],
      ]),
      area("la-surulere", "Surulere", "Lagos", [
        ["la-su-1", "Adeniran Ogunsanya", 6.4969, 3.3568],
        ["la-su-2", "Bode Thomas Street", 6.5, 3.36],
      ]),
    ],
  },
  {
    id: "nasarawa",
    label: "Nasarawa",
    capital: "Lafia",
    center: { lat: 8.493, lng: 8.52 },
    areas: [
      area("na-lafia", "Lafia", "Nasarawa", [
        ["na-la-1", "Shendam Road", 8.493, 8.52],
        ["na-la-2", "Makurdi Road", 8.5, 8.53],
      ]),
      area("na-karu", "Karu", "Nasarawa", [
        ["na-ka-1", "Mararaba", 9.026, 7.58],
        ["na-ka-2", "New Nyanya", 9.02, 7.59],
      ]),
    ],
  },
  {
    id: "niger",
    label: "Niger",
    capital: "Minna",
    center: { lat: 9.6152, lng: 6.5476 },
    areas: [
      area("ni-minna", "Minna", "Niger", [
        ["ni-mi-1", "Bosso Road", 9.615, 6.548],
        ["ni-mi-2", "Paiko Road", 9.6, 6.55],
      ]),
      area("ni-suleja", "Suleja", "Niger", [
        ["ni-su-1", "Suleja Central", 9.18, 7.18],
        ["ni-su-2", "Abuja-Kaduna Express", 9.19, 7.19],
      ]),
    ],
  },
  {
    id: "ogun",
    label: "Ogun",
    capital: "Abeokuta",
    center: { lat: 7.1475, lng: 3.3619 },
    areas: [
      area("og-abeokuta", "Abeokuta", "Ogun", [
        ["og-ab-1", "Ibadan Road", 7.148, 3.362],
        ["og-ab-2", "Lafenwa Road", 7.16, 3.35],
      ]),
      area("og-arepo", "Arepo / Magboro", "Ogun", [
        ["og-ar-1", "Arepo Estate Rd", 6.66, 3.41],
        ["og-ar-2", "Magboro Junction", 6.68, 3.4],
      ]),
    ],
  },
  {
    id: "ondo",
    label: "Ondo",
    capital: "Akure",
    center: { lat: 7.2526, lng: 5.21 },
    areas: [
      area("on-akure", "Akure", "Ondo", [
        ["on-ak-1", "Oyemekun Road", 7.253, 5.21],
        ["on-ak-2", "Oba Adesida Road", 7.26, 5.2],
      ]),
      area("on-ondo", "Ondo Town", "Ondo", [
        ["on-on-1", "Yaba Road", 7.1, 4.84],
        ["on-on-2", "Ondo-Ore Road", 7.09, 4.83],
      ]),
    ],
  },
  {
    id: "osun",
    label: "Osun",
    capital: "Osogbo",
    center: { lat: 7.7827, lng: 4.5418 },
    areas: [
      area("os-osogbo", "Osogbo", "Osun", [
        ["os-os-1", "Gbongan Road", 7.783, 4.542],
        ["os-os-2", "Station Road", 7.79, 4.55],
      ]),
      area("os-ile", "Ile-Ife", "Osun", [
        ["os-ife-1", "Mayfair", 7.49, 4.55],
        ["os-ife-2", "Lagere Road", 7.48, 4.56],
      ]),
    ],
  },
  {
    id: "oyo",
    label: "Oyo",
    capital: "Ibadan",
    center: { lat: 7.3775, lng: 3.947 },
    areas: [
      area("oy-ibadan", "Ibadan", "Oyo", [
        ["oy-ib-1", "Ring Road", 7.377, 3.9],
        ["oy-ib-2", "UI Road", 7.44, 3.9],
      ]),
      area("oy-ogbomoso", "Ogbomoso", "Oyo", [
        ["oy-og-1", "Takie Roundabout", 8.14, 4.25],
        ["oy-og-2", "LAUTECH Road", 8.13, 4.26],
      ]),
    ],
  },
  {
    id: "plateau",
    label: "Plateau",
    capital: "Jos",
    center: { lat: 9.8965, lng: 8.8583 },
    areas: [
      area("pl-jos", "Jos", "Plateau", [
        ["pl-jo-1", "Ahmadu Bello Way", 9.9, 8.86],
        ["pl-jo-2", "Terminus Road", 9.92, 8.89],
      ]),
      area("pl-bukuru", "Bukuru", "Plateau", [
        ["pl-bu-1", "Bukuru Market", 9.8, 8.86],
        ["pl-bu-2", "Rayfield Road", 9.82, 8.87],
      ]),
    ],
  },
  {
    id: "rivers",
    label: "Rivers",
    capital: "Port Harcourt",
    center: { lat: 4.8156, lng: 7.0498 },
    areas: [
      area("ri-gra", "PH GRA", "Rivers", [
        ["ri-gr-1", "Tombia Street", 4.829, 7.013],
        ["ri-gr-2", "Force Avenue", 4.7875, 7.0139],
      ]),
      area("ri-trans", "Trans Amadi", "Rivers", [
        ["ri-tr-1", "Trans Amadi Road", 4.8065, 7.0338],
        ["ri-tr-2", "Slaughter Road", 4.81, 7.04],
      ]),
      area("ri-rumuola", "Rumuola", "Rivers", [
        ["ri-ru-1", "Rumuola Road", 4.8472, 7.0126],
        ["ri-ru-2", "Ikwerre Road", 4.85, 7.01],
      ]),
    ],
  },
  {
    id: "sokoto",
    label: "Sokoto",
    capital: "Sokoto",
    center: { lat: 13.053, lng: 5.232 },
    areas: [
      area("so-sokoto", "Sokoto City", "Sokoto", [
        ["so-1", "Abdullahi Fodio Rd", 13.053, 5.232],
        ["so-2", "Maiduguri Road", 13.06, 5.24],
      ]),
      area("so-wamakko", "Wamakko", "Sokoto", [
        ["so-wa-1", "Wamakko Central", 13.04, 5.2],
        ["so-wa-2", "Gidan Madi Rd", 13.045, 5.21],
      ]),
    ],
  },
  {
    id: "taraba",
    label: "Taraba",
    capital: "Jalingo",
    center: { lat: 8.8937, lng: 11.3604 },
    areas: [
      area("ta-jalingo", "Jalingo", "Taraba", [
        ["ta-ja-1", "Hammaruwa Way", 8.894, 11.36],
        ["ta-ja-2", "Barde Road", 8.9, 11.37],
      ]),
      area("ta-wukari", "Wukari", "Taraba", [
        ["ta-wu-1", "Wukari Central", 7.87, 9.78],
        ["ta-wu-2", "Takum Road", 7.88, 9.79],
      ]),
    ],
  },
  {
    id: "yobe",
    label: "Yobe",
    capital: "Damaturu",
    center: { lat: 11.747, lng: 11.9608 },
    areas: [
      area("yo-damaturu", "Damaturu", "Yobe", [
        ["yo-da-1", "Maiduguri Road", 11.747, 11.961],
        ["yo-da-2", "Potiskum Road", 11.75, 11.95],
      ]),
      area("yo-potiskum", "Potiskum", "Yobe", [
        ["yo-po-1", "Potiskum Market", 11.71, 11.08],
        ["yo-po-2", "Gashua Road", 11.72, 11.09],
      ]),
    ],
  },
  {
    id: "zamfara",
    label: "Zamfara",
    capital: "Gusau",
    center: { lat: 12.1704, lng: 6.6641 },
    areas: [
      area("za-gusau", "Gusau", "Zamfara", [
        ["za-gu-1", "Sani Abacha Way", 12.17, 6.664],
        ["za-gu-2", "Sokoto Road", 12.18, 6.67],
      ]),
      area("za-kaura", "Kaura Namoda", "Zamfara", [
        ["za-ka-1", "Kaura Central", 12.59, 6.58],
        ["za-ka-2", "Gusau Road", 12.6, 6.59],
      ]),
    ],
  },
];

export function getStateById(id: string): NigeriaState {
  return NIGERIA_STATES.find((s) => s.id === id) ?? NIGERIA_STATES.find((s) => s.id === "lagos")!;
}

export function getStateByLabel(label: string): NigeriaState {
  const normalized = label.toLowerCase();
  return (
    NIGERIA_STATES.find(
      (s) =>
        s.label.toLowerCase() === normalized ||
        s.id === normalized ||
        (normalized.includes("abuja") && s.id === "fct") ||
        (normalized.includes("port harcourt") && s.id === "rivers")
    ) ?? getStateById("lagos")
  );
}

export function allStreetsInState(state: NigeriaState): Street[] {
  return state.areas.flatMap((a) => a.streets);
}
