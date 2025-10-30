// // DynamicWorldLayer.ts
// import TileLayer from "ol/layer/Tile.js";
// import XYZ from "ol/source/XYZ.js";
// import { Projection, get as getProjection } from "ol/proj";
// import { DEFAULT_OL_PROJECTION_CODE } from "@/utils/constants";

// const defaultProjection = getProjection(DEFAULT_OL_PROJECTION_CODE);

// export default class DynamicWorldLayer {
//   layer: TileLayer<XYZ>;
//   projection: Projection;

//   constructor(zIndex?: number) {
//     this.projection = defaultProjection!;

//     // 🌍 Dynamic World RGB visualization tiles (public endpoint)
//     // replace this URL with your own GEE map ID if needed
//     this.layer = new TileLayer({
//       source: new XYZ({
//         url: "https://storage.googleapis.com/earthenginepartners-hansen/DynamicWorld/v1.0/visualization/{z}/{x}/{y}.png",
//         crossOrigin: "anonymous",
//       }),
//     });

//     this.layer.setZIndex(zIndex ?? 0);
//     this.layer.set("name", "dynamicWorldLayer");
//   }
// }
