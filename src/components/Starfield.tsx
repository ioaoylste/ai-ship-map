/**
 * 动态星空背景层 — 固定全屏, z-index: -10, 绝不覆盖飞船
 * 两层 box-shadow 星点 + keyframe 漂移 + 淡色星云渐变
 */
export function Starfield() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -10, background: "#000" }}
    >
      {/* 星云：极低透明度径向渐变 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 120% 80% at 50% 50%, rgba(30,58,138,0.10) 0%, transparent 50%)",
            "radial-gradient(ellipse 80% 60% at 25% 20%, rgba(88,28,135,0.08) 0%, transparent 40%)",
            "radial-gradient(ellipse 60% 80% at 75% 80%, rgba(6,95,70,0.05) 0%, transparent 35%)",
          ].join(","),
        }}
      />

      {/* 第一层星点：小而密，缓慢向上漂移 */}
      <div
        className="absolute inset-0"
        style={{
          background: "transparent",
          boxShadow: [
            " 12px  45px 0 0 rgba(255,255,255,0.8)",
            "142px 120px 0 0 rgba(255,255,255,0.6)",
            "280px  18px 0 0 rgba(255,255,255,0.7)",
            "390px 200px 0 0 rgba(255,255,255,0.5)",
            "520px  80px 0 0 rgba(255,255,255,0.9)",
            "650px 310px 0 0 rgba(255,255,255,0.4)",
            "780px  55px 0 0 rgba(255,255,255,0.6)",
            "900px 260px 0 0 rgba(255,255,255,0.8)",
            "1040px 140px 0 0 rgba(255,255,255,0.5)",
            "1180px 350px 0 0 rgba(255,255,255,0.7)",
            "1300px  30px 0 0 rgba(255,255,255,0.6)",
            "1450px 220px 0 0 rgba(255,255,255,0.4)",
            " 60px 420px 0 0 rgba(255,255,255,0.5)",
            "200px 530px 0 0 rgba(255,255,255,0.7)",
            "340px 480px 0 0 rgba(255,255,255,0.6)",
            "470px 600px 0 0 rgba(255,255,255,0.8)",
            "610px 440px 0 0 rgba(255,255,255,0.5)",
            "750px 560px 0 0 rgba(255,255,255,0.9)",
            "880px 490px 0 0 rgba(255,255,255,0.4)",
            "1020px 610px 0 0 rgba(255,255,255,0.6)",
            "1150px 450px 0 0 rgba(255,255,255,0.7)",
            "1280px 580px 0 0 rgba(255,255,255,0.5)",
            "1410px 400px 0 0 rgba(255,255,255,0.8)",
            " 90px 700px 0 0 rgba(255,255,255,0.6)",
            "240px 780px 0 0 rgba(255,255,255,0.5)",
            "400px 720px 0 0 rgba(255,255,255,0.7)",
            "550px 810px 0 0 rgba(255,255,255,0.4)",
            "700px 750px 0 0 rgba(255,255,255,0.8)",
          ].join(","),
          animation: "starDrift 80s linear infinite",
        }}
      />

      {/* 第二层星点：稍大略蓝，反向漂移 */}
      <div
        className="absolute inset-0"
        style={{
          background: "transparent",
          boxShadow: [
            " 30px  90px 1px 0 rgba(180,200,255,0.7)",
            "185px 250px 1px 0 rgba(180,200,255,0.5)",
            "360px 160px 1px 0 rgba(200,220,255,0.8)",
            "510px 380px 1px 0 rgba(180,200,255,0.4)",
            "720px 100px 1px 0 rgba(200,220,255,0.6)",
            "850px 300px 1px 0 rgba(180,200,255,0.9)",
            "1000px 200px 1px 0 rgba(200,220,255,0.5)",
            "1200px 420px 1px 0 rgba(180,200,255,0.7)",
            "1380px 150px 1px 0 rgba(200,220,255,0.6)",
            " 80px 550px 1px 0 rgba(200,220,255,0.5)",
            "250px 680px 1px 0 rgba(180,200,255,0.8)",
            "450px 590px 1px 0 rgba(200,220,255,0.4)",
            "630px 720px 1px 0 rgba(180,200,255,0.7)",
            "820px 640px 1px 0 rgba(200,220,255,0.6)",
            "1050px 780px 1px 0 rgba(180,200,255,0.5)",
            "1250px 650px 1px 0 rgba(200,220,255,0.8)",
          ].join(","),
          animation: "starDrift 120s linear infinite reverse",
        }}
      />
    </div>
  );
}
