import Link from "next/link";
export const metadata = { title: "Về HumanScope" };
export default function About() {
  return (
    <>
      
      <main id="main" className="article-layout">
        <p className="eyebrow">HUMANSCOPE BY HUNPEOLABS</p>
        <h1>Một không gian để hiểu cơ thể.</h1>
        <p className="lead">
          Khám phá từng lớp giải phẫu, ghi lại điều đã học và chuẩn bị bài giảng
          trong cùng một không gian.
        </p>
        <div className="content-grid">
          <section className="content-card">
            <h2>01 · Khám phá</h2>
            <p>
              Chọn cấu trúc từ danh sách hoặc mô hình. Bật tắt lớp và thay đổi
              góc nhìn để quan sát.
            </p>
          </section>
          <section className="content-card">
            <h2>02 · Học tập</h2>
            <p>
              Đọc nội dung được xuất bản và lưu ghi chú riêng khi đăng nhập.
            </p>
          </section>
          <section className="content-card">
            <h2>03 · Giảng dạy</h2>
            <p>
              Tạo bài riêng tư. Cảnh giải phẫu cần gắn với một mô hình trong thư viện
              trước khi lưu.
            </p>
          </section>
        </div>
        <div className="reading">
          <h2>Mô hình 4D là gì?</h2>
          <p>
            Đó là mô hình 3D có hoạt động theo thời gian. Nút phát chỉ mở khi có
            clip phù hợp, được gắn với đúng cấu trúc. Hiện
            thư viện chưa có bộ mô hình và clip đạt các điều kiện này.
          </p>
          <h2>Nội dung và nguồn</h2>
          <p>
            Nguồn tham khảo đi cùng nội dung để bạn tìm hiểu thêm và đối chiếu thông tin.
          </p>
          <h2 id="quyen-rieng-tu">Quyền riêng tư</h2>
          <p>
            Ghi chú thuộc tài khoản của bạn. Chế độ học và giảng dạy không tự
            chia sẻ ghi chú. Không nhập hồ sơ bệnh án, thông tin bệnh nhân hoặc
            dữ liệu nhạy cảm vào ghi chú.
          </p>
          <p>
            Chức năng tài khoản chỉ được mở khi cấu hình xác thực sẵn sàng.
          </p>
          <Link href="/">Quay lại không gian khám phá →</Link>
        </div>
      </main>
    </>
  );
}
