import type { BodyCatalog } from '@hs/anatomy-viewer/scene-history';
import { selectionIds } from '@hs/anatomy-viewer/scene-history';
export type AnatomyFunction = {
 id:string; title:string; structures:string[];
 general:string; medical:string; specialist:string; limitation:string;
 source:{title:string;url:string}; checkedAt:string; representation:'guided-anatomy';
};
/** Source-checked educational guides; no claim of simulated mechanics or expert review. */
export const anatomyFunctions: readonly AnatomyFunction[] = [
 {
  id:'circulation',title:'Máu đi qua tim',structures:['FMA7088'],
  general:'Tim đưa máu tới phổi để nhận oxy, rồi đưa máu trở lại cơ thể.',
  medical:'Máu từ cơ thể đi vào nhĩ phải, thất phải rồi tới phổi. Máu trở về nhĩ trái, qua thất trái và đi vào động mạch chủ. Van giúp hạn chế dòng ngược.',
  specialist:'Phân biệt tuần hoàn qua buồng tim với tưới máu cơ tim: động mạch vành xuất phát từ động mạch chủ. Xem nguồn để đối chiếu các nhánh cấp máu.',
  limitation:'Atlas tĩnh chưa mô phỏng co bóp, chuyển động van hay áp lực. Bài mạch vành minh họa riêng một phần tưới máu cơ tim.',
  source:{title:'NHLBI · Dòng máu qua tim',url:'https://www.nhlbi.nih.gov/health/heart/blood-flow'},checkedAt:'2026-10-02',representation:'guided-anatomy',
 },
 {
  id:'breathing',title:'Hô hấp và trao đổi khí',structures:['FMA7394','FMA7309','FMA7310'],
  general:'Không khí đi vào phổi. Oxy chuyển vào máu; carbon dioxide chuyển từ máu ra phổi để được thở ra.',
  medical:'Khí quản, phổi, cơ hoành và cơ thành ngực cùng tham gia hô hấp. Não điều chỉnh nhịp thở theo nhu cầu của cơ thể.',
  specialist:'Phân biệt chuyển động không khí với trao đổi khí giữa phổi và máu. Atlas này chỉ cung cấp vị trí giải phẫu, không tính thông khí hay vận chuyển khí.',
  limitation:'Chưa có mô hình phế nang vi thể hoặc chuyển động hô hấp được kiểm chứng.',
  source:{title:'NHLBI · Phổi hoạt động thế nào',url:'https://www.nhlbi.nih.gov/health/lungs'},checkedAt:'2026-10-02',representation:'guided-anatomy',
 },
 {
  id:'urine',title:'Tạo và dẫn nước tiểu',structures:['FMA7204','FMA7205','FMA15571','FMA15572','FMA15900'],
  general:'Thận loại bỏ chất thải và nước dư. Nước tiểu đi qua niệu quản tới bàng quang để được chứa lại.',
  medical:'Trong nephron, cầu thận lọc dịch từ máu; ống thận đưa các chất cần thiết trở lại máu và tham gia loại bỏ chất thải.',
  specialist:'Phân biệt lọc ở cầu thận với vận chuyển ở ống thận. Atlas cơ quan không thể hiện hàng rào lọc hoặc các đoạn nephron riêng.',
  limitation:'Không mô phỏng mức lọc, điện giải hay chức năng thận của một người cụ thể.',
  source:{title:'NIDDK · Thận và chức năng',url:'https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work'},checkedAt:'2026-10-02',representation:'guided-anatomy',
 },
 {
  id:'digestion',title:'Vận chuyển và tiêu hóa thức ăn',structures:['FMA7131','FMA7148','FMA7200','FMA7201'],
  general:'Thức ăn đi từ thực quản qua dạ dày và ruột. Tiêu hóa giúp cơ thể hấp thu các chất dinh dưỡng.',
  medical:'Nhu động đẩy và trộn thức ăn. Dịch tiêu hóa phân giải thức ăn; ruột non hấp thu chất dinh dưỡng, ruột già hấp thu nước.',
  specialist:'Phân biệt vận chuyển cơ học, phân giải hóa học và hấp thu. Gan, tụy và túi mật cũng tham gia; đường đi đang chọn chỉ gồm một phần ống tiêu hóa.',
  limitation:'Chưa mô phỏng nhu động, enzym hoặc tốc độ hấp thu; không dùng để suy ra chức năng tiêu hóa cá nhân.',
  source:{title:'NIDDK · Hệ tiêu hóa hoạt động thế nào',url:'https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works'},checkedAt:'2026-10-02',representation:'guided-anatomy',
 },
 {
  id:'nervous',title:'Tiếp nhận và xử lý tín hiệu',structures:['FMA50801','FMA7647','FMA65132'],
  general:'Hệ thần kinh nhận thông tin từ cơ thể và môi trường, xử lý rồi điều khiển đáp ứng.',
  medical:'Ba chức năng liên quan là cảm giác, tích hợp thông tin và vận động. Não, tủy sống và dây thần kinh cùng tham gia.',
  specialist:'Đầu ra thần kinh có thể tác động lên cơ hoặc tuyến. Atlas không thể hiện mạng neuron, synapse hay đường dẫn truyền chức năng riêng.',
  limitation:'Không mô phỏng điện thế hoạt động hoặc suy ra chức năng của từng vùng não.',
  source:{title:'NCI SEER · Hệ thần kinh',url:'https://training.seer.cancer.gov/anatomy/nervous/'},checkedAt:'2026-10-02',representation:'guided-anatomy',
 },
 {
  id:'skeletal',title:'Nâng đỡ và bảo vệ cơ thể',structures:['FMA23881'],
  general:'Bộ xương nâng đỡ cơ thể, bảo vệ các cơ quan và phối hợp với cơ để tạo vận động.',
  medical:'Xương là mô sống, có cấp máu và tái cấu trúc. Xương còn dự trữ khoáng; tủy đỏ tham gia tạo tế bào máu.',
  specialist:'Phân biệt vai trò cơ học của xương với chuyển hóa khoáng và tạo máu. Hình dạng bề mặt không cho biết mật độ hoặc độ bền xương.',
  limitation:'Chưa có mô phỏng chịu lực, tái cấu trúc hay tủy xương vi thể.',
  source:{title:'NCI SEER · Hệ xương',url:'https://training.seer.cancer.gov/anatomy/skeletal/'},checkedAt:'2026-10-02',representation:'guided-anatomy',
 },
 {
  id:'muscle',title:'Co cơ và vận động',structures:['FMA5022'],
  general:'Cơ co để tạo chuyển động, giữ tư thế và góp phần sinh nhiệt.',
  medical:'Cơ xương phối hợp với xương và khớp để vận động. Sự co cơ cũng giúp ổn định khớp và duy trì tư thế.',
  specialist:'Vị trí cơ trên atlas không đủ để suy ra lực, mức hoạt hóa hay biên độ vận động. Cần dữ liệu cơ học riêng cho từng động tác.',
  limitation:'Mô hình cơ hiện tại là hình học tĩnh; chưa biến dạng theo co cơ.',
  source:{title:'NCI SEER · Hệ cơ',url:'https://training.seer.cancer.gov/anatomy/muscular/'},checkedAt:'2026-10-02',representation:'guided-anatomy',
 },
 {
  id:'endocrine',title:'Điều hòa bằng hormone',structures:['FMA9668','FMA7198'],
  general:'Hormone là tín hiệu hóa học giúp điều hòa nhiều hoạt động của cơ thể.',
  medical:'Tuyến nội tiết tiết hormone vào máu. Hormone tác động lên tế bào có thụ thể phù hợp; tuyến ngoại tiết đưa sản phẩm qua ống dẫn.',
  specialist:'Phân biệt cơ quan nội tiết, hormone và mô đích. Atlas không thể hiện thụ thể hoặc vòng phản hồi, nên không mô phỏng nồng độ hormone.',
  limitation:'Chỉ giới thiệu nguyên lý điều hòa; chưa có mô hình động học nội tiết.',
  source:{title:'NCI SEER · Hệ nội tiết',url:'https://training.seer.cancer.gov/anatomy/endocrine/'},checkedAt:'2026-10-02',representation:'guided-anatomy',
 },
 {
  id:'lymphatic',title:'Bạch huyết và bảo vệ cơ thể',structures:['FMA7196','FMA9607'],
  general:'Hệ bạch huyết giúp đưa dịch dư trở lại máu và tham gia bảo vệ cơ thể.',
  medical:'Hệ này còn vận chuyển chất béo được hấp thu từ ruột. Các cơ quan lympho tham gia đáp ứng miễn dịch.',
  specialist:'Phân biệt hồi lưu dịch, vận chuyển lipid và chức năng miễn dịch. Lách và tuyến ức chỉ là các cấu trúc tham chiếu đang có; không đại diện toàn bộ hệ.',
  limitation:'Chưa có mạng mạch bạch huyết đầy đủ hoặc mô phỏng hoạt động tế bào miễn dịch.',
  source:{title:'NCI SEER · Hệ bạch huyết',url:'https://training.seer.cancer.gov/anatomy/lymphatic/'},checkedAt:'2026-10-02',representation:'guided-anatomy',
 },
 {
  id:'reproductive',title:'Tế bào sinh dục và hormone',structures:['FMA7211','FMA7212'],
  general:'Hệ sinh sản tạo tế bào sinh dục và hormone, đồng thời hỗ trợ các quá trình sinh sản.',
  medical:'Tinh hoàn tạo tinh trùng; buồng trứng tạo tế bào trứng. Các cơ quan sinh dục phụ hỗ trợ vận chuyển và duy trì tế bào sinh dục.',
  specialist:'Phân biệt tạo giao tử với chức năng nội tiết của tuyến sinh dục. Atlas hiện có không mô tả đầy đủ sinh lý sinh sản hoặc các biến thể cơ thể.',
  limitation:'Chưa có bộ mô hình nữ tương ứng; không mô phỏng chu kỳ, thụ tinh hoặc thai kỳ.',
  source:{title:'NCI SEER · Hệ sinh sản',url:'https://training.seer.cancer.gov/anatomy/reproductive/'},checkedAt:'2026-10-02',representation:'guided-anatomy',
 },
 {
  id:'skin',title:'Hàng rào bảo vệ và cảm giác',structures:['FMA7163'],
  general:'Da bảo vệ cơ thể, hạn chế mất nước, giúp điều hòa nhiệt và cảm nhận tiếp xúc.',
  medical:'Biểu bì nằm ngoài; lớp bì chứa mạch máu, đầu tận thần kinh và các tuyến. Tiết mồ hôi góp phần làm mát cơ thể.',
  specialist:'Phân biệt bề mặt da với các lớp mô bên dưới. Phóng to atlas bề mặt không cho thấy tế bào, nang lông hoặc các lớp vi thể.',
  limitation:'Chưa mô phỏng hàng rào da, lành thương hay điều hòa nhiệt.',
  source:{title:'NIAMS · Tìm hiểu về da',url:'https://www.niams.nih.gov/health-topics/educational-resources/health-lesson-learning-about-skin'},checkedAt:'2026-10-02',representation:'guided-anatomy',
 },
];
export function functionsForStructure(catalog:BodyCatalog,id:string|null):AnatomyFunction[] {
 const selected=new Set(selectionIds(catalog,id));
 if(!selected.size)return [];
 return anatomyFunctions.filter(item=>item.structures.some(part=>selectionIds(catalog,part).some(source=>selected.has(source))));
}
