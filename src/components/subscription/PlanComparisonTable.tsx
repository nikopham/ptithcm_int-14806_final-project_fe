export const PlanComparisonTable = () => (
  <section className="mx-auto max-w-7xl px-4 pb-24">
    {/* heading */}
    <h2 className="mb-2 text-3xl font-extrabold text-white md:text-4xl">
      So Sánh Các Gói Và Tìm Gói Phù Hợp Với Bạn
    </h2>
    <p className="mb-10 max-w-2xl text-sm leading-relaxed text-zinc-400">
      StreamVibe cung cấp ba gói khác nhau để phù hợp với nhu cầu của bạn: Cơ Bản,
      Tiêu Chuẩn, và Cao Cấp. So sánh các tính năng của từng gói và chọn
      gói phù hợp với bạn.
    </p>

    {/* comparison table */}
    <div className="overflow-x-auto rounded-lg bg-zinc-900">
      <table className="min-w-full text-left text-sm text-zinc-300">
        <thead>
          <tr className="border-b border-zinc-700 text-white">
            <th className="w-48 px-6 py-4 font-semibold">Tính Năng</th>
            <th className="px-6 py-4 font-semibold">Cơ Bản</th>
            <th className="px-6 py-4 font-semibold">
              <div className="flex items-center gap-2">
                Tiêu Chuẩn
                <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase leading-none text-white">
                  Phổ Biến
                </span>
              </div>
            </th>
            <th className="px-6 py-4 font-semibold">Cao Cấp</th>
          </tr>
        </thead>

        <tbody>
          {[
            ["Giá", "$9.99/Tháng", "$12.99/Tháng", "$14.99/Tháng"],
            [
              "Nội Dung",
              "Truy cập vào bộ sưu tập phim và chương trình đa dạng, bao gồm một số phim mới phát hành.",
              "Truy cập vào bộ sưu tập phim và chương trình rộng hơn, bao gồm hầu hết các phim mới phát hành và nội dung độc quyền",
              "Truy cập vào bộ sưu tập phim và chương trình rộng nhất, bao gồm tất cả các phim mới phát hành và Xem Ngoại Tuyến",
            ],
            [
              "Thiết Bị",
              "Xem trên một thiết bị đồng thời",
              "Xem trên hai thiết bị đồng thời",
              "Xem trên bốn thiết bị đồng thời",
            ],
            ["Dùng Thử Miễn Phí", "7 Ngày", "7 Ngày", "7 Ngày"],
            ["Hủy Bất Cứ Lúc Nào", "Có", "Có", "Có"],
            ["HDR", "Không", "Có", "Có"],
            ["Dolby Atmos", "Không", "Có", "Có"],
            ["Không Quảng Cáo", "Không", "Có", "Có"],
            [
              "Xem Ngoại Tuyến",
              "Không",
              "Có, cho một số tiêu đề được chọn.",
              "Có, cho tất cả các tiêu đề.",
            ],
            [
              "Chia Sẻ Gia Đình",
              "Không",
              "Có, tối đa 5 thành viên gia đình.",
              "Có, tối đa 6 thành viên gia đình.",
            ],
          ].map((row, rIdx) => (
            <tr
              key={row[0]}
              className={rIdx % 2 ? "bg-zinc-800/40" : undefined}
            >
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className="whitespace-pre-line px-6 py-4 align-top"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
