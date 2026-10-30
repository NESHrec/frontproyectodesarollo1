export const permanentRows = [
  [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28],
  [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38],
] as const;
export const primaryRows = [[55,54,53,52,51,61,62,63,64,65],[85,84,83,82,81,71,72,73,74,75]] as const;
export const surfaces = ["MESIAL","DISTAL","VESTIBULAR","LINGUAL","PALATINA","OCLUSAL","INCISAL"] as const;
export type DentalSurface = typeof surfaces[number];
export const surfaceLabels: Record<DentalSurface,string> = {MESIAL:"Mesial",DISTAL:"Distal",VESTIBULAR:"Vestibular",LINGUAL:"Lingual",PALATINA:"Palatina",OCLUSAL:"Oclusal",INCISAL:"Incisal"};
