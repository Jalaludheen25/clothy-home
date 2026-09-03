/**
 * Image manifest.
 *
 * Every photograph is served from a single CDN that accepts width / crop hints
 * on the query string, so the app can ask for exactly the pixels a slot needs
 * instead of shipping one oversized file everywhere. Swapping hosts later means
 * changing `src()` below and nothing else.
 */

const IMG = {
  sareeMaroonDrape: "https://images.pexels.com/photos/11629757/pexels-photo-11629757.jpeg",
  sareeIvoryRed: "https://images.pexels.com/photos/14205210/pexels-photo-14205210.jpeg",
  editorialMist: "https://images.pexels.com/photos/27719401/pexels-photo-27719401.jpeg",
  sareeAmethyst: "https://images.pexels.com/photos/28135787/pexels-photo-28135787.jpeg",
  sareeNoir: "https://images.pexels.com/photos/33276621/pexels-photo-33276621.jpeg",
  sareeCreamGold: "https://images.pexels.com/photos/37054318/pexels-photo-37054318.jpeg",
  sareeBanarasiGold: "https://images.pexels.com/photos/37054322/pexels-photo-37054322.jpeg",
  sareeCrimsonZari: "https://images.pexels.com/photos/38796458/pexels-photo-38796458.jpeg",
  sareeMagentaWall: "https://images.pexels.com/photos/7326221/pexels-photo-7326221.jpeg",
  detailBangleFabric: "https://images.pexels.com/photos/27918892/pexels-photo-27918892.jpeg",
  fabricCreamFold: "https://images.pexels.com/photos/28513849/pexels-photo-28513849.jpeg",
  sareeCopperSilk: "https://images.pexels.com/photos/28943495/pexels-photo-28943495.jpeg",
  sareeMossVeil: "https://images.pexels.com/photos/28943602/pexels-photo-28943602.jpeg",
  editorialRouge: "https://images.pexels.com/photos/28943676/pexels-photo-28943676.jpeg",
  sareeTissuePearl: "https://images.pexels.com/photos/35108820/pexels-photo-35108820.jpeg",
  detailZardozi: "https://images.pexels.com/photos/12426868/pexels-photo-12426868.jpeg",
  jewelBridalChampagne: "https://images.pexels.com/photos/30780337/pexels-photo-30780337.jpeg",
  sareeApricot: "https://images.pexels.com/photos/7037124/pexels-photo-7037124.jpeg",
  editorialLightRay: "https://images.pexels.com/photos/32170148/pexels-photo-32170148.jpeg",
  jewelNath: "https://images.pexels.com/photos/35963259/pexels-photo-35963259.jpeg",
  jewelJhumkaPortrait: "https://images.pexels.com/photos/36519701/pexels-photo-36519701.jpeg",
  jewelGoldMacro: "https://images.pexels.com/photos/38633696/pexels-photo-38633696.jpeg",
  suitTeal: "https://images.pexels.com/photos/20382095/pexels-photo-20382095.jpeg",
  suitSage: "https://images.pexels.com/photos/20407198/pexels-photo-20407198.jpeg",
  suitChikanCream: "https://images.pexels.com/photos/20407233/pexels-photo-20407233.jpeg",
  suitIvoryEmbroider: "https://images.pexels.com/photos/20690539/pexels-photo-20690539.jpeg",
  suitTerracotta: "https://images.pexels.com/photos/20777176/pexels-photo-20777176.jpeg",
  suitOliveVelvet: "https://images.pexels.com/photos/22064201/pexels-photo-22064201.jpeg",
  suitRoseVelvet: "https://images.pexels.com/photos/22064216/pexels-photo-22064216.jpeg",
  suitMustard: "https://images.pexels.com/photos/30196701/pexels-photo-30196701.jpeg",
  suitMocha: "https://images.pexels.com/photos/34933671/pexels-photo-34933671.jpeg",
  suitLavender: "https://images.pexels.com/photos/36634909/pexels-photo-36634909.jpeg",
  gownBlush: "https://images.pexels.com/photos/14108017/pexels-photo-14108017.jpeg",
  dressIvoryGarden: "https://images.pexels.com/photos/20544951/pexels-photo-20544951.jpeg",
  fabricBrocadePlum: "https://images.pexels.com/photos/10317113/pexels-photo-10317113.jpeg",
  fabricBrocadeStack: "https://images.pexels.com/photos/10317127/pexels-photo-10317127.jpeg",
  fabricBandhaniRed: "https://images.pexels.com/photos/37975932/pexels-photo-37975932.jpeg",
  fabricChikankari: "https://images.pexels.com/photos/7498815/pexels-photo-7498815.jpeg",
  fabricZariBorder: "https://images.pexels.com/photos/8886950/pexels-photo-8886950.jpeg",
  fabricNavyDrape: "https://images.pexels.com/photos/1487809/pexels-photo-1487809.jpeg",
  fabricIvoryFold: "https://images.pexels.com/photos/14935628/pexels-photo-14935628.jpeg",
  fabricRoseSilk: "https://images.pexels.com/photos/14944284/pexels-photo-14944284.jpeg",
  fabricNoirSilk: "https://images.pexels.com/photos/21926656/pexels-photo-21926656.jpeg",
  fabricWovenGold: "https://images.pexels.com/photos/36346049/pexels-photo-36346049.jpeg",
  jewelSilverChoker: "https://images.pexels.com/photos/19820885/pexels-photo-19820885.jpeg",
  neckGoldPendant: "https://images.pexels.com/photos/32780784/pexels-photo-32780784.jpeg",
  earOnyxGold: "https://images.pexels.com/photos/39080948/pexels-photo-39080948.jpeg",
  accPearlBracelet: "https://images.pexels.com/photos/7743044/pexels-photo-7743044.jpeg",
  neckPearlBerry: "https://images.pexels.com/photos/7743086/pexels-photo-7743086.jpeg",
  jewelTikkaBridal: "https://images.pexels.com/photos/33023960/pexels-photo-33023960.jpeg",
  neckKundanPortrait: "https://images.pexels.com/photos/11503286/pexels-photo-11503286.jpeg",
  neckKasavuGold: "https://images.pexels.com/photos/1162983/pexels-photo-1162983.jpeg",
  earJhumkaJasmine: "https://images.pexels.com/photos/13786772/pexels-photo-13786772.jpeg",
  earJhumkaLong: "https://images.pexels.com/photos/2733490/pexels-photo-2733490.jpeg",
  earKundanPearl: "https://images.pexels.com/photos/33154633/pexels-photo-33154633.jpeg",
  neckGoldChain: "https://images.pexels.com/photos/33222148/pexels-photo-33222148.jpeg",
  jewelSetFlatlay: "https://images.pexels.com/photos/37485302/pexels-photo-37485302.jpeg",
  neckPearlCase: "https://images.pexels.com/photos/8750015/pexels-photo-8750015.jpeg",
  earGoldHoopSet: "https://images.pexels.com/photos/28933799/pexels-photo-28933799.jpeg",
  accGoldCuffPlinth: "https://images.pexels.com/photos/28933800/pexels-photo-28933800.jpeg",
  accGoldBanglePlinth: "https://images.pexels.com/photos/28933801/pexels-photo-28933801.jpeg",
  earJhumkaGold: "https://images.pexels.com/photos/37601639/pexels-photo-37601639.jpeg",
  neckGoldMarble: "https://images.pexels.com/photos/4735888/pexels-photo-4735888.jpeg",
  jewelGoldPlate: "https://images.pexels.com/photos/8105129/pexels-photo-8105129.jpeg",
  neckPearlBook: "https://images.pexels.com/photos/29033684/pexels-photo-29033684.jpeg",
  earGoldHoopMini: "https://images.pexels.com/photos/15785528/pexels-photo-15785528.jpeg",
  earGoldHoopRibbon: "https://images.pexels.com/photos/16055228/pexels-photo-16055228.jpeg",
  neckPearlSoft: "https://images.pexels.com/photos/10061399/pexels-photo-10061399.jpeg",
  neckFineChain: "https://images.pexels.com/photos/21787515/pexels-photo-21787515.jpeg",
  neckDiamondDrop: "https://images.pexels.com/photos/29080968/pexels-photo-29080968.jpeg",
  neckGoldDisplay: "https://images.pexels.com/photos/29043373/pexels-photo-29043373.jpeg",
  accKundanBanglePair: "https://images.pexels.com/photos/32988531/pexels-photo-32988531.jpeg",
  accKundanBangleDuo: "https://images.pexels.com/photos/32988535/pexels-photo-32988535.jpeg",
  accGoldBangleMacro: "https://images.pexels.com/photos/37485307/pexels-photo-37485307.jpeg",
  accGoldBangleWhite: "https://images.pexels.com/photos/38827895/pexels-photo-38827895.jpeg",
  accGoldCuffMinimal: "https://images.pexels.com/photos/11476471/pexels-photo-11476471.jpeg",
  accGoldBangleSilk: "https://images.pexels.com/photos/12168880/pexels-photo-12168880.jpeg",
  accGoldBangleCream: "https://images.pexels.com/photos/12194316/pexels-photo-12194316.jpeg",
  craftLinenSleeve: "https://images.pexels.com/photos/6694760/pexels-photo-6694760.jpeg",
  craftPlinth: "https://images.pexels.com/photos/8167118/pexels-photo-8167118.jpeg",
  craftHandFabric: "https://images.pexels.com/photos/8581033/pexels-photo-8581033.jpeg",

  /* --- second edit: richer traditional frames and a deeper texture set --- */
  heroArchKanjivaram: "https://images.pexels.com/photos/29049398/pexels-photo-29049398.jpeg",
  sareeRoseCopperWall: "https://images.pexels.com/photos/29049336/pexels-photo-29049336.jpeg",
  sareeGreenGoldPortrait: "https://images.pexels.com/photos/28943590/pexels-photo-28943590.jpeg",
  sareeOrangeBanarasiPortrait: "https://images.pexels.com/photos/28943499/pexels-photo-28943499.jpeg",
  sareePinkMintTissue: "https://images.pexels.com/photos/35108770/pexels-photo-35108770.jpeg",
  sareeBlueDoorway: "https://images.pexels.com/photos/8684181/pexels-photo-8684181.jpeg",
  sareeBlushPortrait: "https://images.pexels.com/photos/24786278/pexels-photo-24786278.jpeg",
  lehengaMaroonBrocade: "https://images.pexels.com/photos/29819597/pexels-photo-29819597.jpeg",
  sareeTealKanjivaram: "https://images.pexels.com/photos/6842474/pexels-photo-6842474.jpeg",
  sareeOchreCheck: "https://images.pexels.com/photos/2723623/pexels-photo-2723623.jpeg",
  sareeOliveGoldWall: "https://images.pexels.com/photos/35108774/pexels-photo-35108774.jpeg",
  sareeMagentaRedBackdrop: "https://images.pexels.com/photos/38998847/pexels-photo-38998847.jpeg",
  jewelTempleSetMaroon: "https://images.pexels.com/photos/28347073/pexels-photo-28347073.jpeg",
  jewelGoldHeadpieceProfile: "https://images.pexels.com/photos/36947949/pexels-photo-36947949.jpeg",
  jewelBridalMaroonGold: "https://images.pexels.com/photos/15455512/pexels-photo-15455512.jpeg",
  jewelNathRedVeil: "https://images.pexels.com/photos/32081723/pexels-photo-32081723.jpeg",
  neckGoldKasavuWhite: "https://images.pexels.com/photos/36806826/pexels-photo-36806826.jpeg",
  neckKundanTeal: "https://images.pexels.com/photos/11784752/pexels-photo-11784752.jpeg",
  neckEmeraldKundanCream: "https://images.pexels.com/photos/29351977/pexels-photo-29351977.jpeg",
  neckGoldMarigoldTeal: "https://images.pexels.com/photos/36114639/pexels-photo-36114639.jpeg",
  neckPearlStillDark: "https://images.pexels.com/photos/10556215/pexels-photo-10556215.jpeg",
  neckPearlShell: "https://images.pexels.com/photos/10915187/pexels-photo-10915187.jpeg",
  accEmeraldRoseGoldBangle: "https://images.pexels.com/photos/32988529/pexels-photo-32988529.jpeg",
  accPearlWarmBokeh: "https://images.pexels.com/photos/37467312/pexels-photo-37467312.jpeg",
  silkOrangeGlow: "https://images.pexels.com/photos/10508017/pexels-photo-10508017.jpeg",
  velvetRedCurtain: "https://images.pexels.com/photos/4722577/pexels-photo-4722577.jpeg",
  silkRoseDrape: "https://images.pexels.com/photos/4814050/pexels-photo-4814050.jpeg",
  silkSageDrape: "https://images.pexels.com/photos/4862901/pexels-photo-4862901.jpeg",
  silkAmberDrape: "https://images.pexels.com/photos/7232404/pexels-photo-7232404.jpeg",
  silkChampagneFold: "https://images.pexels.com/photos/8426345/pexels-photo-8426345.jpeg",
  silkIvoryFold: "https://images.pexels.com/photos/8465951/pexels-photo-8465951.jpeg",
  velvetEmerald: "https://images.pexels.com/photos/35974685/pexels-photo-35974685.jpeg",
  silkCrimson: "https://images.pexels.com/photos/36305726/pexels-photo-36305726.jpeg",
  velvetWinePleat: "https://images.pexels.com/photos/4112799/pexels-photo-4112799.jpeg",
  velvetRoseCopper: "https://images.pexels.com/photos/6843276/pexels-photo-6843276.jpeg",
  velvetNoir: "https://images.pexels.com/photos/7717487/pexels-photo-7717487.jpeg",
  velvetDarkTeal: "https://images.pexels.com/photos/7717505/pexels-photo-7717505.jpeg",
  bridalIvoryNight: "https://images.pexels.com/photos/31750757/pexels-photo-31750757.jpeg",
  jewelEmeraldVelvet: "https://images.pexels.com/photos/32988530/pexels-photo-32988530.jpeg",
};

/**
 * Build a sized, cropped URL for a manifest entry.
 * @param {string} url base image url
 * @param {number} w intrinsic width to request
 * @param {number} [ratio] height / width — omit to keep the source ratio
 */
export function src(url, w = 900, ratio) {
  const q = ['auto=compress', 'cs=tinysrgb', `w=${Math.round(w)}`];
  if (ratio) q.push(`h=${Math.round(w * ratio)}`, 'fit=crop');
  return `${url}?${q.join('&')}`;
}

/** srcset across the widths the layouts actually request. */
export function srcSet(url, ratio, widths = [420, 640, 900, 1280, 1800]) {
  return widths.map((w) => `${src(url, w, ratio)} ${w}w`).join(', ');
}

export default IMG;
