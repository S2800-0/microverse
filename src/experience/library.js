// Land places use the curated land food web with distinct scenery. Reef has a separate teaching activity.
// Only the original garden has recorded SAM masks. Other photos use manual review.
export const PLACE_LIBRARY = Object.freeze([
  {id:'garden',name:'The garden',hint:'A pond, plants and little hiding places.',src:'/assets/garden.png',width:288,height:384,kind:'sample',credit:'Jon Sullivan · public domain',source:'https://commons.wikimedia.org/wiki/File:Garden_pond_in_park.jpg',license:'Public domain',position:'50% 50%'},

  {id:'woodland',name:'The woodland edge',hint:'Trees, shade and a clearing to explore.',src:'/assets/library-woodland.webp',width:850,height:1280,kind:'library',credit:'Derek Harper · CC BY-SA 2.0',source:'https://commons.wikimedia.org/wiki/File:Woodland_edge_by_A382_-_geograph.org.uk_-_7945943.jpg',license:'https://creativecommons.org/licenses/by-sa/2.0/',position:'50% 55%'},
  {id:'reef',habitat:'reef',name:'The island reef',hint:'Corals, clear water and a different kind of connection.',src:'/assets/library-moorea-reef.webp',width:1200,height:800,kind:'library',credit:'Borut Furlan · CC BY-SA 4.0',source:'https://commons.wikimedia.org/wiki/File:Blacktip_reef_sharks_at_Moorea_2025.jpg',license:'https://creativecommons.org/licenses/by-sa/4.0/',position:'50% 50%'},
]);
