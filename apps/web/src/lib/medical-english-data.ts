import type { MedicalTerm, StageVocabulary } from "./medical-english";

// Draft educational translations. Only preview callers import this module.
// Sources support terminology/mechanisms, not clinical approval of this translation.
const heart = { id: "med-heart", title: "NHLBI · Heart anatomy", url: "https://www.nhlbi.nih.gov/health/heart/anatomy" };
const flow = { id: "med-flow", title: "NHLBI · Blood flow", url: "https://www.nhlbi.nih.gov/health/heart/blood-flow" };
const attack = { id: "med-attack", title: "NHLBI · Heart attack causes", url: "https://www.nhlbi.nih.gov/health/heart-attack/causes" };
const coronary = { id: "med-coronary", title: "NHLBI · Coronary heart disease", url: "https://www.nhlbi.nih.gov/health/coronary-heart-disease/causes" };
const spasm = { id: "med-spasm", title: "NHLBI · Angina types", url: "https://www.nhlbi.nih.gov/health/angina/types" };
const lungs = { id: "med-lungs", title: "NHLBI · Respiratory system", url: "https://www.nhlbi.nih.gov/health/lungs/respiratory-system" };

const branches = { id: "med-branches", title: "Johns Hopkins · Coronary arteries", url: "https://www.hopkinsmedicine.org/health/conditions-and-diseases/anatomy-and-function-of-the-coronary-arteries" };
const thorax = { id: "med-thorax", title: "NCI · Thorax", url: "https://www.cancer.gov/publications/dictionaries/cancer-terms/def/thorax" };

const greatVessels = { id: "med-aorta", title: "Cleveland Clinic · Ascending aorta", url: "https://my.clevelandclinic.org/health/body/21951-ascending-aorta" };
const pulmonary = { id: "med-pulmonary", title: "Elsevier · Pulmonary trunk", url: "https://www.elsevier.com/resources/anatomy/cardiovascular-system/heart-pericardium/pulmonary-trunk/22709" };

export const medicalTerms: readonly MedicalTerm[] = [
  { id: "heart", structureId: "FMA7088", english: "Heart", vietnamese: "Tim", meaning: "Cơ quan bơm máu trong hệ tuần hoàn.", example: "The heart pumps blood.", translation: "Tim bơm máu.", source: heart },
  { id: "thorax", structureId: "FMA7480", english: "Thorax", vietnamese: "Lồng ngực", meaning: "Vùng ngực. Trong mẫu này, tên gọi chỉ nhóm cấu trúc lồng ngực được gộp lại.", example: "The heart lies in the chest.", translation: "Tim nằm trong lồng ngực.", source: thorax },
  { id: "right-lung-group", structureId: "FMA7309", english: "Right pulmonary vessels and bronchi", vietnamese: "Mạch và phế quản phổi phải", meaning: "Nhóm mạch và đường dẫn khí bên phải; mẫu không có bề mặt phổi.", example: "Bronchi carry air; blood vessels carry blood.", translation: "Phế quản dẫn khí; mạch máu dẫn máu.", source: lungs },
  { id: "left-lung-group", structureId: "FMA7310", english: "Left pulmonary vessels and bronchi", vietnamese: "Mạch và phế quản phổi trái", meaning: "Nhóm mạch và đường dẫn khí bên trái; mẫu không có bề mặt phổi.", example: "The left lung is beside the heart.", translation: "Phổi trái nằm cạnh tim.", source: lungs },
  { id: "coronary-artery", english: "Coronary artery", vietnamese: "Động mạch vành", meaning: "Mạch đưa máu tới cơ tim; khác với đường máu đi qua buồng tim.", example: "Coronary arteries supply the heart muscle.", translation: "Các động mạch vành cấp máu cho cơ tim.", source: flow },
  { id: "blood-flow", english: "Blood flow", vietnamese: "Dòng máu", meaning: "Sự di chuyển của máu. Hạt trên hình chỉ minh họa chiều dòng, không đo lưu lượng.", example: "Follow the blood flow along the artery.", translation: "Theo dõi dòng máu dọc theo động mạch.", source: flow },
  { id: "plaque", english: "Plaque", vietnamese: "Mảng xơ vữa", meaning: "Mảng tích tụ trong thành động mạch, có thể làm hẹp lòng mạch.", example: "Plaque can narrow an artery.", translation: "Mảng xơ vữa có thể làm hẹp động mạch.", source: coronary },
  { id: "stenosis", english: "Stenosis", vietnamese: "Hẹp", meaning: "Trong bài này: lòng động mạch bị thu hẹp, không đồng nghĩa tắc hoàn toàn.", example: "The narrowed artery still allows some blood through in this scene.", translation: "Động mạch hẹp vẫn cho một phần máu đi qua trong cảnh này.", source: coronary },
  { id: "thrombus", english: "Thrombus", vietnamese: "Huyết khối", meaning: "Cục máu đông hình thành trong mạch; khác với mảng xơ vữa.", example: "A thrombus can block the artery.", translation: "Huyết khối có thể làm tắc động mạch.", source: attack },
  { id: "occlusion", english: "Occlusion", vietnamese: "Tắc", meaning: "Trong cảnh này: đường dòng máu bị chặn tại đoạn động mạch được đánh dấu.", example: "The blockage interrupts blood flow in this branch.", translation: "Chỗ tắc làm gián đoạn dòng máu ở nhánh này.", source: attack },
  { id: "infarction", english: "Myocardial infarction", vietnamese: "Nhồi máu cơ tim", meaning: "Một phần cơ tim chết do thiếu máu nuôi kéo dài. Không đồng nghĩa với ngừng tim.", example: "Prolonged loss of blood supply can damage heart muscle.", translation: "Mất nguồn máu nuôi kéo dài có thể làm tổn thương cơ tim.", source: attack },
  { id: "spasm", english: "Coronary artery spasm", vietnamese: "Co thắt động mạch vành", meaning: "Thành động mạch co lại, có thể làm giảm hoặc chặn dòng máu tạm thời.", example: "A spasm can temporarily restrict blood flow.", translation: "Co thắt có thể tạm thời hạn chế dòng máu.", source: spasm },
  { id: "ventricular-wall", structureId: "ventricle", english: "Ventricular wall", vietnamese: "Thành tâm thất", meaning: "Phần thành của các buồng tim phía dưới; mẫu này chọn chung thành tâm thất.", example: "Ventricles are the lower chambers of the heart.", translation: "Tâm thất là các buồng phía dưới của tim.", source: heart },
  { id: "left-atrial-wall", structureId: "left-atrium", english: "Left atrial wall", vietnamese: "Thành nhĩ trái", meaning: "Phần thành bao quanh buồng nhĩ trái.", example: "The left atrium receives blood from the lungs.", translation: "Nhĩ trái nhận máu từ phổi.", source: flow },
  { id: "right-atrial-wall", structureId: "right-atrium", english: "Right atrial wall", vietnamese: "Thành nhĩ phải", meaning: "Phần thành bao quanh buồng nhĩ phải.", example: "The right atrium receives blood returning from the body.", translation: "Nhĩ phải nhận máu từ cơ thể trở về.", source: flow },
  { id: "lad", structureId: "lad", english: "Left anterior descending artery (LAD)", vietnamese: "Nhánh gian thất trước (LAD)", meaning: "Một nhánh của động mạch vành trái. Đây là nhánh được đánh dấu tổn thương giả định trong bài.", example: "The LAD is a branch of the left coronary artery.", translation: "LAD là một nhánh của động mạch vành trái.", source: branches },
  { id: "lcx", structureId: "lcx", english: "Left circumflex artery (LCx)", vietnamese: "Nhánh mũ (LCx)", meaning: "Nhánh của động mạch vành trái đi vòng quanh tim.", example: "The circumflex artery curves around the heart.", translation: "Nhánh mũ đi vòng quanh tim.", source: branches },
  { id: "rca", structureId: "rca", english: "Right coronary artery (RCA)", vietnamese: "Động mạch vành phải (RCA)", meaning: "Một trong hai động mạch vành chính.", example: "The right coronary artery supplies part of the heart muscle.", translation: "Động mạch vành phải cấp máu cho một phần cơ tim.", source: branches },
  { id: "left-main", structureId: "left-main", english: "Left main coronary artery", vietnamese: "Thân chung mạch vành trái", meaning: "Đoạn mạch vành trái trước khi chia thành các nhánh chính.", example: "The left main artery divides into the LAD and circumflex branches.", translation: "Thân chung mạch vành trái chia thành nhánh LAD và nhánh mũ.", source: branches },
  { id: "pulmonary", structureId: "pulmonary", english: "Pulmonary trunk", vietnamese: "Thân động mạch phổi", meaning: "Đoạn mạch từ tâm thất phải trước khi chia tới hai phổi.", example: "Blood travels from the right ventricle toward the lungs.", translation: "Máu đi từ tâm thất phải về phía phổi.", source: pulmonary },
  { id: "aortic-arch", structureId: "aortic-arch", english: "Aortic arch", vietnamese: "Cung động mạch chủ", meaning: "Đoạn cong của động mạch chủ.", example: "The aortic arch is a curved part of the aorta.", translation: "Cung động mạch chủ là đoạn cong của động mạch chủ.", source: greatVessels },
  { id: "aorta", structureId: "aorta", english: "Ascending aorta", vietnamese: "Động mạch chủ lên", meaning: "Đoạn động mạch chủ đi lên từ tim.", example: "Blood leaves the left ventricle through the aorta.", translation: "Máu rời tâm thất trái qua động mạch chủ.", source: greatVessels },
];

export const coronaryVocabulary: StageVocabulary = {
  "myocardial-infarction": { baseline: ["coronary-artery", "blood-flow"], plaque: ["plaque", "stenosis"], occlusion: ["thrombus", "occlusion"], injury: ["infarction", "occlusion"] },
  "coronary-atherosclerosis": { baseline: ["coronary-artery", "blood-flow"], plaque: ["plaque", "stenosis"], "limited-flow": ["stenosis", "blood-flow"] },
  "coronary-spasm": { baseline: ["coronary-artery", "blood-flow"], spasm: ["spasm", "occlusion"], recovery: ["blood-flow", "coronary-artery"] },
};
