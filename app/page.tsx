/* eslint-disable @next/next/no-img-element */
//
// Exact sliced homepage.
//
// The approved visual (FINAL_EXACT_HOMEPAGE_REFERENCE.png, 853 × 1843) is
// rendered as the original sliced section PNGs, stacked top-to-bottom with no
// gaps. Interactivity is layered on with transparent absolutely-positioned
// links so we never repaint a single pixel of the approved design.
//
// Source assets: public/scent-knows-you-homepage/*.png
// Slice geometry: scent_knows_you pack -> crop-manifest.json

const WHATSAPP = "https://wa.me/60124761919";

// Width of the approved reference. Capping the column here keeps every slice
// at (or below) its native resolution so the artwork stays crisp.
const MAX_WIDTH = 853;

// Cream sampled from the slice edges so the page background blends seamlessly
// with the artwork on either side of the centred column.
const CREAM = "#faf6f0";

type Overlay = {
  label: string;
  href: string;
  /** percentages of the slice, e.g. "12%" */
  left: string;
  top: string;
  width: string;
  height: string;
};

type Section = {
  src: string;
  alt: string;
  /** native pixel size of the slice, for intrinsic aspect ratio */
  w: number;
  h: number;
  /** anchor ids placed at the top of this slice */
  anchors?: string[];
  overlays?: Overlay[];
};

const sections: Section[] = [
  {
    src: "01_top_referral_bar.png",
    alt: "",
    w: 853,
    h: 31,
  },
  {
    src: "02_header_nav.png",
    alt: "香气读懂你的心 · Scent Knows You",
    w: 853,
    h: 72,
    overlays: [
      { label: "首页", href: "/", left: "2.3%", top: "0%", width: "22%", height: "100%" },
      { label: "核心理念", href: "#core", left: "27.2%", top: "15%", width: "6.5%", height: "70%" },
      { label: "28 种精油库", href: "#library", left: "34%", top: "15%", width: "7.3%", height: "70%" },
      { label: "体验方案", href: "#packages", left: "42%", top: "15%", width: "7%", height: "70%" },
      { label: "体验流程", href: "#process", left: "49.5%", top: "15%", width: "6.2%", height: "70%" },
      { label: "常见问题", href: "#faq", left: "56%", top: "15%", width: "5.7%", height: "70%" },
      { label: "登录", href: "/login", left: "72%", top: "15%", width: "6%", height: "70%" },
      { label: "注册会员", href: "/register", left: "78%", top: "15%", width: "7.3%", height: "70%" },
      { label: "WhatsApp 预约", href: WHATSAPP, left: "87%", top: "15%", width: "12%", height: "70%" },
    ],
  },
  {
    src: "03_hero_main.png",
    alt: "测出你内心真正的渴望，看见困住你的烦恼",
    w: 853,
    h: 411,
    overlays: [
      { label: "预约 RM60 摸香测试", href: WHATSAPP, left: "5.9%", top: "73.5%", width: "18.4%", height: "11%" },
      { label: "了解 RM150 专属调配", href: "#packages", left: "27.3%", top: "73.5%", width: "19.6%", height: "11%" },
    ],
  },
  {
    src: "04_hero_value_strip.png",
    alt: "",
    w: 853,
    h: 75,
  },
  {
    src: "05_you_will_see_section.png",
    alt: "你会看到什么？",
    w: 853,
    h: 253,
    anchors: ["core"],
  },
  {
    src: "06_what_is_scent_test_section.png",
    alt: "什么是摸香测试？",
    w: 853,
    h: 260,
    anchors: ["process", "library"],
  },
  {
    src: "07_packages_section.png",
    alt: "选择适合你的体验方案",
    w: 853,
    h: 318,
    anchors: ["packages"],
    overlays: [
      { label: "预约 RM60 测试体验", href: WHATSAPP, left: "18.4%", top: "79.5%", width: "25.6%", height: "11%" },
      { label: "选择 RM150 完整方案", href: WHATSAPP, left: "55.9%", top: "79.5%", width: "26.7%", height: "11%" },
    ],
  },
  {
    src: "08_lower_trust_referral_cards.png",
    alt: "会员专属推荐奖励",
    w: 853,
    h: 258,
    anchors: ["faq"],
    overlays: [
      { label: "注册会员，立即获取推荐码", href: "/register", left: "62%", top: "63.5%", width: "17%", height: "17%" },
    ],
  },
  {
    src: "09_final_cta_footer.png",
    alt: "现在就开始，看见真实的自己",
    w: 853,
    h: 165,
    overlays: [
      { label: "预约 RM60 摸香测试", href: WHATSAPP, left: "31%", top: "34.5%", width: "16.3%", height: "20%" },
      { label: "WhatsApp 咨询我们", href: WHATSAPP, left: "48%", top: "34.5%", width: "22.7%", height: "20%" },
      { label: "WhatsApp 预约 / 咨询", href: WHATSAPP, left: "3.5%", top: "73.5%", width: "23.5%", height: "24%" },
    ],
  },
];

function isExternal(href: string) {
  return href.startsWith("http");
}

export default function Home() {
  return (
    <main style={{ backgroundColor: CREAM }}>
      <div
        style={{
          maxWidth: MAX_WIDTH,
          margin: "0 auto",
          width: "100%",
          fontSize: 0, // collapse any inline whitespace between slices
        }}
      >
        {sections.map((section) => (
          <section
            key={section.src}
            style={{ position: "relative", lineHeight: 0 }}
          >
            {section.anchors?.map((id) => (
              // zero-height scroll target at the top of the slice
              <span
                key={id}
                id={id}
                style={{ position: "absolute", top: 0, left: 0 }}
                aria-hidden
              />
            ))}

            <img
              src={`/scent-knows-you-homepage/${section.src}`}
              alt={section.alt}
              width={section.w}
              height={section.h}
              draggable={false}
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                userSelect: "none",
              }}
            />

            {section.overlays?.map((o) => (
              <a
                key={o.label + o.left}
                href={o.href}
                aria-label={o.label}
                {...(isExternal(o.href)
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                style={{
                  position: "absolute",
                  left: o.left,
                  top: o.top,
                  width: o.width,
                  height: o.height,
                  display: "block",
                  // transparent hit-area: no repaint of the artwork
                  background: "transparent",
                }}
              />
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
