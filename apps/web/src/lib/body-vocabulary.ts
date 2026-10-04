/** Navigation translations for exact atlas concepts, not clinical review of the meshes. */
export const bodyVocabulary: Record<string, { english: string; vietnamese: string; aliases?: string[] }> = {
  FMA7088: { english: 'heart', vietnamese: 'Tim' },
  FMA50801: { english: 'brain', vietnamese: 'Não', aliases: ['não bộ'] },
  FMA46565: { english: 'skull', vietnamese: 'Hộp sọ', aliases: ['sọ'] },
  FMA7197: { english: 'liver', vietnamese: 'Gan' },
  FMA7198: { english: 'pancreas', vietnamese: 'Tụy', aliases: ['tuỵ'] },
  FMA7309: { english: 'right lung', vietnamese: 'Phổi phải', aliases: ['lungs'] },
  FMA7310: { english: 'left lung', vietnamese: 'Phổi trái', aliases: ['lungs'] },
  FMA7394: { english: 'trachea', vietnamese: 'Khí quản' },
  FMA7131: { english: 'esophagus', vietnamese: 'Thực quản', aliases: ['oesophagus'] },
  FMA7148: { english: 'stomach', vietnamese: 'Dạ dày', aliases: ['bao tử'] },
  FMA7201: { english: 'large intestine', vietnamese: 'Ruột già' },
  FMA7200: { english: 'small intestine', vietnamese: 'Ruột non' },
  FMA7204: { english: 'right kidney', vietnamese: 'Thận phải', aliases: ['kidneys'] },
  FMA7205: { english: 'left kidney', vietnamese: 'Thận trái', aliases: ['kidneys'] },
  FMA15900: { english: 'urinary bladder', vietnamese: 'Bàng quang' },
  FMA13478: { english: 'vertebral column', vietnamese: 'Cột sống', aliases: ['spine', 'backbone'] },
};
