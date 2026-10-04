/** Sourced educational associations; never a referral, diagnosis or branch service claim. */
export const diseaseDirectoryRelations = [
 {id:'heart-failure',name:'Suy tim',specialtyIds:['cardiology'],source:'https://bachmai.gov.vn/bai-viet/nhan-biet-dieu-tri-va-cham-soc-nguoi-benh-suy-tim?id=f55f8d26-9341-41d6-a243-00f543335069'},
 {id:'hypertension',name:'Tăng huyết áp',specialtyIds:['cardiology'],source:'https://bachmai.gov.vn/bai-viet/chien-luoc-quan-ly-tang-huyet-ap-khong-chi-la-con-so-ma-la-cuoc-chien-dai-han-vi-trai-tim?id=fa9e9a38-1aa0-4921-8077-7ab1b4dd72ff'},
 {id:'asthma',name:'Hen phế quản',specialtyIds:['respiratory'],source:'https://bachmai.gov.vn/bai-viet/giup-phat-hien-som-benh-phoi-tac-nghen-man-tinh-va-hen-phe-quan?id=48def6f3-2828-9c76-8ba1-487c161b1b0f'},
 {id:'copd',name:'Bệnh phổi tắc nghẽn mạn tính',specialtyIds:['respiratory'],source:'https://bachmai.gov.vn/bai-viet/giup-phat-hien-som-benh-phoi-tac-nghen-man-tinh-va-hen-phe-quan?id=48def6f3-2828-9c76-8ba1-487c161b1b0f'},
 ...[{id:'type-1-diabetes',name:'Đái tháo đường típ 1'},{id:'type-2-diabetes',name:'Đái tháo đường típ 2'},{id:'hyperthyroidism',name:'Cường giáp'},{id:'hypothyroidism',name:'Suy giáp'}].map(d=>({...d,specialtyIds:['endocrinology'],source:'https://bachmai.gov.vn/don-vi/khoa-noi-tiet-dai-thao-duong/c070ef4b-cc24-5425-fced-85425b2be8d9'})),
].map(relation=>({...relation,checkedAt:'2026-10-03',scope:'educational-association' as const}));
export function relationForDisease(id:string){return diseaseDirectoryRelations.find(d=>d.id===id)??null;}
