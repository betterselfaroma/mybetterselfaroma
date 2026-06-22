/**
 * Local bilingual dictionary for "香气读懂你的心 / Scent Knows You".
 *
 * Positioning: a scent-intuition test (摸香测试) reads your current mental and
 * life state, then we blend a custom essential oil for you. All copy lives here
 * in Chinese (zh) and English (en) — no external translation service.
 */

export interface NavLink {
  id: string;
  label: string;
}

export interface ValueItem {
  title: string;
  desc: string;
}

export interface WhyCard {
  num: string;
  title: string;
  desc: string;
  image: string;
  imageAlt: string;
}

export interface RitualGuide {
  label: string;
  title: string;
  intro: string;
  ritualTitle: string;
  steps: string[];
  momentsTitle: string;
  moments: string[];
  brandLine: string;
}

export interface PackageContent {
  badge?: string;
  name: string;
  price: string;
  suitableLabel: string;
  suitable: string;
  includesLabel: string;
  includes: string[];
  ritualGuide?: RitualGuide;
  button: string;
  highlight?: boolean;
  image: string;
  imageAlt: string;
}

export interface Step {
  num: string;
  title: string;
  desc: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface WhatsAppContact {
  name: string;
  role: string;
  number: string;
  display: string;
}

export interface Content {
  meta: { title: string; description: string };
  nav: { brand: string; links: NavLink[]; cta: string; login: string; register: string };
  langSwitch: { label: string; zh: string; en: string };
  announcement: string;
  hero: {
    eyebrow: string;
    title: string;
    slogan: string;
    subtitle: string;
    note: string;
    trustPoints: string[];
    ctaPrimary: string;
    ctaSecondary: string;
    upgradeReminder: string;
    image: string;
    imageAlt: string;
  };
  trust: { items: ValueItem[] };
  whatYouSee: { title: string; cards: ValueItem[] };
  feelings: { title: string; items: string[] };
  assurance: { title: string; items: string[] };
  why: { title: string; subtitle: string; cards: WhyCard[] };
  library: {
    badge: string;
    title: string;
    subtitle: string;
    content: string;
    features: string[];
    cta: string;
    image: string;
    imageAlt: string;
  };
  packages: {
    title: string;
    intro: string;
    a: PackageContent;
    b: PackageContent;
    trust: string[];
  };
  upgrade: { label: string; text: string; sub: string };
  process: { title: string; intro: string; steps: Step[] };
  ritual: {
    title: string;
    content: string;
    points: string[];
    image: string;
    imageAlt: string;
  };
  faq: { title: string; intro: string; items: FaqItem[] };
  whatsapp: {
    chooseTitle: string;
    chooseHint: string;
    contacts: WhatsAppContact[];
  };
  referral: {
    badge: string;
    title: string;
    body: string;
    steps: { num: string; title: string }[];
    finePrint: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  finalCta: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    image: string;
    imageAlt: string;
  };
  footer: {
    brand: string;
    subtitle: string;
    exploreLabel: string;
    contactLabel: string;
    contacts: { label: string; value: string }[];
    badges: string[];
    disclaimerLabel: string;
    disclaimer: string;
    rights: string;
  };
  whatsappMessage: string;
}

const IMG = {
  hero: "/images/hero-aroma-selfcare.webp",
  flatlay: "/images/package-rm49-aroma-check.webp",
  custom: "/images/package-rm129-custom-oil.webp",
  ritual: "/images/ritual-evening-journal.webp",
  library: "/images/aroma-library-28-oils.png",
};

const zh: Content = {
  meta: {
    title: "香气读懂你的心 | 摸香测试 × 专属精油 × 自我觉察",
    description:
      "用摸香测试看见你当下的精神状态与生活状态，再从 28 种精油中为你调配一瓶专属香气。RM60 摸香测试，RM150 专属特调。",
  },
  nav: {
    brand: "香气读懂你的心",
    links: [
      { id: "why", label: "核心理念" },
      { id: "process", label: "体验流程" },
      { id: "packages", label: "体验方案" },
      { id: "referral", label: "会员推荐" },
      { id: "faq", label: "常见问题" },
    ],
    cta: "WhatsApp 预约",
    login: "登录",
    register: "注册会员",
  },
  langSwitch: { label: "语言", zh: "中文", en: "EN" },
  announcement: "推荐朋友，获得 RM10 TNG PIN + 会员积分",
  hero: {
    eyebrow: "一场 10–30 分钟的温柔体验",
    title: "测出你内心真正的渴望，看见困住你的烦恼。",
    slogan: "解析潜意识最深渴望，引导你找到跨越困境的解方。",
    subtitle:
      "通过摸香测试，读懂你当下的内心需求、生活状态与情绪卡点，再为你整理专属香气方向。你可以选择只做 RM60 测试，也可以升级 RM150 专属调配精油。",
    note: "不是算命，不是医疗诊断，而是一场温柔、真实的香气觉察体验。",
    trustPoints: ["28 种精油专业香气库", "1 对 1 状态引导", "专属配方贴近当下"],
    ctaPrimary: "预约 RM60 摸香测试",
    ctaSecondary: "了解 RM150 专属调配",
    upgradeReminder: "已体验 RM60 摸香测试，当天加 RM90，即可获得专属特调精油方案。",
    image: IMG.hero,
    imageAlt: "女性在自然光下闻香测试，桌上有香气卡、笔记与滚珠精油",
  },
  trust: {
    items: [
      { title: "28 种精油专业香气库", desc: "丰富香气，读懂你的反应" },
      { title: "1 对 1 状态解读与引导", desc: "专业陪伴，温柔引导" },
      { title: "专属香气方向与建议", desc: "贴近你当下的状态" },
      { title: "安全温和、专业无压力", desc: "天然精油，安心体验" },
    ],
  },
  whatYouSee: {
    title: "你会看见什么？",
    cards: [
      { title: "内心真正的渴望", desc: "有时候你以为自己只是累，其实内心一直有一个没有被听见的需要。" },
      { title: "现在困住你的烦恼", desc: "通过香气反应，看见你当下最明显的情绪卡点、压力来源或生活状态。" },
      { title: "适合你的香气方向", desc: "根据你的测试结果，整理更贴近你当下状态的香气方向，可选择升级专属精油调配。" },
    ],
  },
  feelings: {
    title: "如果你最近有这些感觉，这场测试适合你。",
    items: [
      "总觉得累，但说不清为什么",
      "明明生活正常，却觉得心里卡住",
      "有很多想法，但不知道真正想要什么",
      "想改变，却不知道从哪里开始",
      "想找一个温柔方式重新认识自己",
    ],
  },
  assurance: {
    title: "安全、温和、专业的体验",
    items: [
      "非医疗行为，不替代诊断或治疗",
      "专业调配师 1 对 1 引导",
      "天然精油，安全温和",
      "尊重隐私，安心分享",
    ],
  },
  why: {
    title: "为什么不是普通卖精油？",
    subtitle:
      "不是普通卖一瓶精油，而是通过摸香反应看见你现在的状态，再从 28 种精油中为你调配更贴近当下需要的香气。",
    cards: [
      {
        num: "01",
        title: "摸香测试",
        desc: "通过 3–5 款精油的直觉反应，看见你当下最真实的状态。",
        image: IMG.custom,
        imageAlt: "手边一支磨砂玻璃滚珠精油，准备摸香测试",
      },
      {
        num: "02",
        title: "看见状态",
        desc: "香气 × 情绪 × 身体感受，帮助你理解当前的精神和生活状态。",
        image: IMG.hero,
        imageAlt: "女性在笔记本上书写，觉察当下状态",
      },
      {
        num: "03",
        title: "专属调配",
        desc: "从 28 种精油中，为你组合更贴近当下需要的香气。",
        image: IMG.flatlay,
        imageAlt: "多支滚珠精油与植物卡平铺，准备调配",
      },
      {
        num: "04",
        title: "每日仪式",
        desc: "让这瓶香气成为每天回到自己的提醒。",
        image: IMG.ritual,
        imageAlt: "夜晚床边使用滚珠精油，进行每日香气仪式",
      },
    ],
  },
  library: {
    badge: "28 种精油",
    title: "28 种精油香气库",
    subtitle: "用更丰富的香气素材，读懂你当下的气味反应。",
    content:
      "我们准备了 28 种精油香气素材，通过你在摸香时的喜欢、排斥、身体感受和直觉反应，帮助判断你现在更需要安定、专注、放下、自爱、清醒，还是重新开始。",
    features: ["28 种精油选择", "专业香气判断", "安全温和配方", "根据状态调配"],
    cta: "探索 28 种精油香气库",
    image: IMG.library,
    imageAlt: "多支磨砂玻璃滚珠精油与植物香气卡的高级平铺图",
  },
  packages: {
    title: "选择适合你的体验方案",
    intro: "从一次摸香测试开始，或升级专属调配精油，把香气带回日常。",
    a: {
      name: "摸香状态测试体验",
      price: "RM60",
      suitableLabel: "适合",
      suitable: "想了解自己当下内心状态、真正渴望与烦恼卡点的人",
      includesLabel: "包含",
      includes: [
        "摸香测试",
        "香气直觉反应解读",
        "内心渴望方向",
        "当前烦恼卡点",
        "一句正念提醒",
      ],
      button: "预约 RM60 测试体验",
      image: IMG.flatlay,
      imageAlt: "摸香状态测试中的香气卡、笔记与滚珠精油",
    },
    b: {
      badge: "最受推荐",
      name: "专属特调精油方案",
      price: "RM150",
      suitableLabel: "适合",
      suitable: "想把测试结果带回日常，用专属香气持续陪伴自己的人（包含 RM60 摸香测试 + RM90 专属精油调配）",
      includesLabel: "包含",
      includes: [
        "RM60 摸香状态测试",
        "内心渴望与烦恼卡点解读",
        "RM90 专属精油调配",
        "专属香气方向",
        "专属状态名称",
        "专属香气仪式指南",
        "一句正念提醒",
      ],
      ritualGuide: {
        label: "展开专属香气仪式指南",
        title: "专属香气仪式指南",
        intro:
          "每天只需几分钟，让专属香气陪伴你安定情绪、觉察当下，慢慢回到内在平衡。这不是短期任务，而是一份可以持续使用的日常香气仪式。",
        ritualTitle: "每日香气仪式",
        steps: [
          "将滚珠精油轻抹于手腕、耳后或胸前。",
          "双手轻轻搓热，靠近鼻尖。",
          "深呼吸 5 次。",
          "闭上眼睛 1 分钟，感受此刻的自己。",
          "带着一句正念提醒，开始或结束一天。",
        ],
        momentsTitle: "适合使用的时刻",
        moments: [
          "早晨开始一天前",
          "工作或学习压力大时",
          "睡前放松时",
          "情绪混乱、需要停下来时",
          "想重新连接自己时",
        ],
        brandLine: "相信直觉，让香气与你的内心对话。",
      },
      button: "选择 RM150 完整方案",
      highlight: true,
      image: IMG.custom,
      imageAlt: "一支专属滚珠精油立在石质托盘上，旁边有牛皮纸盒与花叶",
    },
    trust: ["100% 安全稀释配方", "专业调配师调制", "无医疗功效承诺"],
  },
  upgrade: {
    label: "升级",
    text: "已体验 RM60 摸香测试，当天加 RM90，即可获得专属特调精油方案。",
    sub: "当天升级，立即获得专属调配精油与 专属香气仪式指南。",
  },
  process: {
    title: "什么是摸香测试？",
    intro:
      "不是你选择香气，而是香气反映你现在的状态。你会从不同香气中凭直觉选择喜欢、排斥或有感觉的味道。每一种反应都会透露你当下的内在需求、生活状态和情绪方向。",
    steps: [
      { num: "01", title: "闻香", desc: "直觉感受 3–5 款香气。" },
      { num: "02", title: "选择", desc: "记录喜欢、抗拒、无感的香气反应。" },
      { num: "03", title: "解读", desc: "看见内心渴望与烦恼卡点。" },
      { num: "04", title: "整理方向", desc: "得到专属香气方向，可升级调配精油。" },
    ],
  },
  ritual: {
    title: "让香气，陪你回到自己",
    content:
      "每天给自己 1–2 分钟的香气时光，让这瓶精油成为你稳定情绪、整理思绪、重新专注和照顾自己的提醒。",
    points: ["安定情绪", "提升专注", "自我照顾", "建立仪式感"],
    image: IMG.ritual,
    imageAlt: "女性夜晚在床边使用滚珠精油，进行每日香气仪式",
  },
  faq: {
    title: "常见问题",
    intro: "在预约之前，这些也许是你想知道的。",
    items: [
      {
        q: "摸香测试是什么？",
        a: "通过你对不同精油香气的直觉反应，看见当下的精神状态与生活状态。这是一种自我觉察方式，不是占卜，也不是医疗诊断。",
      },
      {
        q: "RM60 和 RM150 有什么不同？",
        a: "RM60 是摸香状态测试。RM150 包含测试，并为你现场调配一瓶专属精油，附上 专属香气仪式指南和个人精神提醒卡。",
      },
      {
        q: "没有任何精油经验，也可以参加吗？",
        a: "可以。摸香测试不需要任何经验，凭直觉感受香气即可，我们会陪你一起完成。",
      },
      {
        q: "一次摸香测试需要多久？",
        a: "大约 10–30 分钟，取决于你选择的方案。",
      },
      {
        q: "专属精油多久可以拿到？",
        a: "RM150 方案当天现场调配，你可以当天就带走。",
      },
      {
        q: "精油成分安全吗？",
        a: "我们使用专业级精油，并安全稀释。如有特殊状况（例如怀孕或过敏），请提前告知。",
      },
    ],
  },
  whatsapp: {
    chooseTitle: "选择预约对象",
    chooseHint: "点击任一位，即可通过 WhatsApp 预约你的摸香体验。",
    contacts: [
      { name: "雅凝", role: "预约 · 咨询", number: "60124761919", display: "012-476 1919" },
      { name: "文珊", role: "预约 · 咨询", number: "60177898668", display: "017-789 8668" },
    ],
  },
  referral: {
    badge: "会员推荐 · RM10 TNG PIN + 积分",
    title: "会员专属推荐奖励",
    body: "注册会员后，你会获得专属推荐码。朋友使用你的推荐码并完成首次 RM60 或 RM150 体验后，你将获得 RM10 TNG PIN 与会员积分奖励。",
    steps: [
      { num: "01", title: "分享你的专属推荐码" },
      { num: "02", title: "朋友完成首次 RM60 / RM150 体验" },
      { num: "03", title: "你获得 RM10 TNG PIN + 会员积分" },
    ],
    finePrint:
      "奖励将在朋友完成体验并通过后台确认后发放。每位新顾客只限使用一次推荐码。不可自我推荐。积分不可提现。",
    ctaPrimary: "注册会员，立即获取推荐码",
    ctaSecondary: "登录查看我的推荐码",
  },
  finalCta: {
    title: "你现在真正需要的，也许不是一瓶精油，而是一次看见自己的机会。",
    subtitle: "从一场摸香测试开始，温柔地重新认识现在的自己。",
    ctaPrimary: "预约 RM60 摸香测试",
    ctaSecondary: "WhatsApp 咨询我们",
    image: IMG.custom,
    imageAlt: "一支专属调配滚珠精油立在石质托盘上",
  },
  footer: {
    brand: "香气读懂你的心",
    subtitle: "用摸香，看见现在的自己。",
    exploreLabel: "快速导航",
    contactLabel: "联系方式",
    contacts: [
      { label: "Email", value: "betterselfaroma@gmail.com" },
      { label: "Instagram", value: "@betterselfaroma" },
    ],
    badges: ["安全支付", "隐私保护", "专业服务", "安心体验"],
    disclaimerLabel: "免责声明",
    disclaimer:
      "本服务不提供医疗诊断、治疗或心理咨询，精油仅作为生活方式与自我觉察的辅助工具。",
    rights: "2024 香气读懂你的心 · Scent Knows You",
  },
  whatsappMessage:
    "你好，我想预约“香气读懂你的心”的摸香状态测试。我想了解 RM60 和 RM150 方案，请问还有空档吗？",
};

const en: Content = {
  meta: {
    title: "Scent Knows You | Scent Intuition Test × Custom Essential Oil",
    description:
      "A scent intuition test reveals your current mental and life state, then we blend one of 28 essential oils into a custom aroma. RM60 scent test, RM150 custom blend.",
  },
  nav: {
    brand: "Scent Knows You",
    links: [
      { id: "why", label: "Concept" },
      { id: "process", label: "Process" },
      { id: "packages", label: "Packages" },
      { id: "referral", label: "Referral" },
      { id: "faq", label: "FAQ" },
    ],
    cta: "WhatsApp Booking",
    login: "Login",
    register: "Register",
  },
  langSwitch: { label: "Language", zh: "中文", en: "EN" },
  announcement: "Refer a friend & earn RM10 TNG PIN + member points",
  hero: {
    eyebrow: "A gentle 10–30 minute scent experience",
    title: "Discover your inner desire, and see the worries holding you back.",
    slogan: "Decode your deepest subconscious longing and find the way through.",
    subtitle:
      "Through a scent intuition test, read your current inner needs, life state and emotional blocks — then receive a personal scent direction. Choose the RM60 test only, or upgrade to the RM150 custom oil blend.",
    note: "This is not fortune telling or medical diagnosis. It is a gentle self-awareness experience through scent.",
    trustPoints: [
      "28-oil professional scent library",
      "1-to-1 state guidance",
      "A custom blend aligned with you",
    ],
    ctaPrimary: "Book RM60 Scent Test",
    ctaSecondary: "Explore RM150 Custom Blend",
    upgradeReminder: "Already tried the RM60 scent test? Add RM90 on the same day to receive your custom essential oil blend experience.",
    image: IMG.hero,
    imageAlt: "A woman smelling a scent strip while testing aromas, with scent cards, notes and roll-on oils on the table",
  },
  trust: {
    items: [
      { title: "28-oil professional library", desc: "Rich aromas that read your responses" },
      { title: "1-to-1 state reading & guidance", desc: "Professional, gentle companionship" },
      { title: "A personal scent direction", desc: "Aligned with where you are now" },
      { title: "Safe, gentle & pressure-free", desc: "Natural oils, a calm experience" },
    ],
  },
  whatYouSee: {
    title: "What will you see?",
    cards: [
      { title: "Your true inner desire", desc: "Sometimes you think you're just tired — but a need inside you has gone unheard." },
      { title: "What's troubling you now", desc: "Through your scent responses, see your clearest emotional blocks, stressors or life state." },
      { title: "A scent direction for you", desc: "Based on your results, we shape a scent direction closer to where you are — with an optional custom oil upgrade." },
    ],
  },
  feelings: {
    title: "If you've been feeling any of these, this test is for you.",
    items: [
      "Always tired, but can't say why",
      "Life looks fine, yet something feels stuck",
      "Full of thoughts, unsure what you really want",
      "Wanting to change, but not knowing where to start",
      "Looking for a gentle way to know yourself again",
    ],
  },
  assurance: {
    title: "A safe, gentle and professional experience",
    items: [
      "Not a medical act — not a substitute for diagnosis or treatment",
      "1-to-1 guidance from a professional blender",
      "Natural essential oils, safe and gentle",
      "Your privacy is respected — share with ease",
    ],
  },
  why: {
    title: "Why this is not just essential oil",
    subtitle:
      "This is not about selling one bottle of oil. Through your scent responses we see your current state, then blend — from 28 oils — an aroma closer to what you need now.",
    cards: [
      {
        num: "01",
        title: "Scent Intuition Test",
        desc: "Through your instinctive response to 3–5 oils, see your most honest current state.",
        image: IMG.custom,
        imageAlt: "A frosted-glass roll-on essential oil ready for the scent test",
      },
      {
        num: "02",
        title: "Understand Your State",
        desc: "Scent × emotion × body sensation help you understand your current mental and life state.",
        image: IMG.hero,
        imageAlt: "A woman journaling, becoming aware of her current state",
      },
      {
        num: "03",
        title: "Custom Blend",
        desc: "From 28 essential oils, we combine an aroma closer to what you need right now.",
        image: IMG.flatlay,
        imageAlt: "Roll-on oils and botanical cards laid out, ready to blend",
      },
      {
        num: "04",
        title: "Daily Ritual",
        desc: "Let this scent become a daily reminder to return to yourself.",
        image: IMG.ritual,
        imageAlt: "Applying roll-on oil at night as a daily scent ritual",
      },
    ],
  },
  library: {
    badge: "28 Oils",
    title: "28-Essential-Oil Aroma Library",
    subtitle: "A richer palette of scents to read your reactions in the moment.",
    content:
      "We work with 28 essential oil scents. Through what you like, resist, feel and sense during the test, we help tell whether you need more calm, focus, release, self-love, clarity — or a fresh restart.",
    features: ["28 oil choices", "Professional scent reading", "Safe & gentle blends", "Blended to your state"],
    cta: "Explore the 28-Oil Aroma Library",
    image: IMG.library,
    imageAlt: "A premium flat lay of frosted-glass roll-on oils and botanical scent cards",
  },
  packages: {
    title: "Choose the experience that fits you",
    intro:
      "Begin with a scent intuition test, or upgrade to a custom oil blend to bring your scent into daily life.",
    a: {
      name: "Scent Intuition Test Experience",
      price: "RM60",
      suitableLabel: "Suitable for",
      suitable: "Those who want to understand their current inner state, true desire and emotional blocks",
      includesLabel: "Includes",
      includes: [
        "Scent intuition test",
        "Reading of your scent responses",
        "Your inner desire direction",
        "What's troubling you now",
        "One mindful reminder",
      ],
      button: "Book RM60 Test Experience",
      image: IMG.flatlay,
      imageAlt: "Scent cards, notes and roll-on oils for the scent intuition test",
    },
    b: {
      badge: "Most Recommended",
      name: "Custom Essential Oil Blend Experience",
      price: "RM150",
      suitableLabel: "Suitable for",
      suitable: "Those who want to bring their results into daily life with a personal scent (includes RM60 scent test + RM90 custom oil blend)",
      includesLabel: "Includes",
      includes: [
        "RM60 scent intuition test",
        "Reading of your inner desire & blocks",
        "RM90 custom essential oil blend",
        "A personal scent direction",
        "A personal state name",
        "Personal Scent Ritual Guide",
        "One mindful reminder",
      ],
      ritualGuide: {
        label: "View the Personal Scent Ritual Guide",
        title: "Personal Scent Ritual Guide",
        intro:
          "Take a few mindful minutes each day to let your personal scent support calm, awareness, and inner balance. This is not a short-term task, but a daily scent ritual you can return to anytime.",
        ritualTitle: "Daily Scent Ritual",
        steps: [
          "Roll the essential oil onto your wrists, behind your ears, or over your chest.",
          "Gently rub your hands together to warm it, then bring them near your nose.",
          "Take 5 deep breaths.",
          "Close your eyes for 1 minute and feel how you are right now.",
          "Begin or end your day with a mindful reminder.",
        ],
        momentsTitle: "When to use it",
        moments: [
          "Before you start your morning",
          "When work or study feels stressful",
          "To unwind before sleep",
          "When emotions feel tangled and you need to pause",
          "When you want to reconnect with yourself",
        ],
        brandLine: "Trust your intuition. Let scent speak to your heart.",
      },
      button: "Choose the RM150 Full Plan",
      highlight: true,
      image: IMG.custom,
      imageAlt: "A custom roll-on oil on a stone tray beside a kraft box and botanicals",
    },
    trust: ["100% Safely Diluted", "Blended by a Pro", "No Medical Claims"],
  },
  upgrade: {
    label: "Upgrade",
    text: "Already tried the RM60 scent test? Add RM90 on the same day to receive your custom essential oil blend experience.",
    sub: "Upgrade the same day to receive your custom blend and Personal Scent Ritual Guide.",
  },
  process: {
    title: "What is a scent intuition test?",
    intro:
      "You don't choose the scent — the scent reflects your current state. From different aromas you instinctively choose what you like, resist or feel something toward. Each response reveals your inner needs, life state and emotional direction.",
    steps: [
      { num: "01", title: "Smell", desc: "Respond to 3–5 aromas by instinct." },
      { num: "02", title: "Choose", desc: "Note what you like, resist or feel neutral toward." },
      { num: "03", title: "Read", desc: "See your inner desire and where you feel stuck." },
      { num: "04", title: "Direction", desc: "Receive a personal scent direction — upgrade to a custom oil if you wish." },
    ],
  },
  ritual: {
    title: "Let Scent Bring You Back to Yourself",
    content:
      "Give yourself 1–2 minutes of scent each day, and let this oil become a reminder to steady your emotions, clear your mind, refocus and care for yourself.",
    points: ["Steady Emotions", "Sharper Focus", "Self-Care", "A Sense of Ritual"],
    image: IMG.ritual,
    imageAlt: "A woman applying roll-on essential oil at night as a daily scent ritual",
  },
  faq: {
    title: "Frequently Asked Questions",
    intro: "A few things you may want to know before you book.",
    items: [
      {
        q: "What is a scent intuition test?",
        a: "It reads your instinctive responses to different essential oil aromas to reveal your current mental and life state. It is a form of self-awareness — not fortune telling, and not a medical diagnosis.",
      },
      {
        q: "What is the difference between RM60 and RM150?",
        a: "RM60 is the scent intuition test. RM150 includes the test plus a custom essential oil blended for you on the spot, with a Personal Scent Ritual Guide and a personal reminder card.",
      },
      {
        q: "Can I join without any experience with essential oils?",
        a: "Yes. No experience is needed — simply respond to the aromas with your intuition, and we guide you through the rest.",
      },
      {
        q: "How long does the test take?",
        a: "Around 10–30 minutes, depending on the plan you choose.",
      },
      {
        q: "How soon do I get my custom blend?",
        a: "With the RM150 plan your blend is created on the same day, so you can take it home with you.",
      },
      {
        q: "Are the essential oils safe?",
        a: "We use professional-grade essential oils, safely diluted. Please let us know in advance of any conditions such as pregnancy or allergies.",
      },
    ],
  },
  whatsapp: {
    chooseTitle: "Choose who to contact",
    chooseHint: "Tap either contact to book your scent experience on WhatsApp.",
    contacts: [
      { name: "雅凝 (Ya Ning)", role: "Booking & enquiries", number: "60124761919", display: "+60 12-476 1919" },
      { name: "文珊 (Wen Shan)", role: "Booking & enquiries", number: "60177898668", display: "+60 17-789 8668" },
    ],
  },
  referral: {
    badge: "Member Referral · RM10 TNG PIN + Points",
    title: "Members-only referral reward",
    body: "Register as a member and receive your personal referral code. When a friend uses your code and completes their first RM60 or RM150 experience, you'll earn an RM10 TNG PIN plus member points.",
    steps: [
      { num: "01", title: "Share your personal referral code" },
      { num: "02", title: "Your friend completes their first RM60 / RM150 experience" },
      { num: "03", title: "You earn an RM10 TNG PIN + member points" },
    ],
    finePrint:
      "Rewards are issued after the friend completes the experience and the booking is verified by our team. Each new customer may use one referral code only. Self-referrals are not allowed. Points are not cash and cannot be withdrawn.",
    ctaPrimary: "Register & get your code",
    ctaSecondary: "Log in to view my code",
  },
  finalCta: {
    title: "What you really need now may not be a bottle of oil — but a chance to see yourself.",
    subtitle: "Start with a scent intuition test and gently get to know who you are now.",
    ctaPrimary: "Book RM60 Scent Test",
    ctaSecondary: "Chat with us on WhatsApp",
    image: IMG.custom,
    imageAlt: "A custom-blended roll-on oil on a stone tray",
  },
  footer: {
    brand: "Scent Knows You",
    subtitle: "Discover your current state through scent.",
    exploreLabel: "Explore",
    contactLabel: "Contact",
    contacts: [
      { label: "Email", value: "betterselfaroma@gmail.com" },
      { label: "Instagram", value: "@betterselfaroma" },
    ],
    badges: ["Secure payment", "Privacy protected", "Professional service", "Worry-free"],
    disclaimerLabel: "Disclaimer",
    disclaimer:
      "This service does not provide medical diagnosis, treatment, or psychological counselling. Essential oils are used only as lifestyle and self-awareness support tools.",
    rights: "2024 Scent Knows You · All rights reserved",
  },
  whatsappMessage:
    "Hi, I'd like to book the Scent Knows You scent intuition test. I'm interested in the RM60 and RM150 plans — may I know the available slots?",
};

export const content: Record<"zh" | "en", Content> = { zh, en };
