/**
 * Local bilingual dictionary for "香气读懂你的心 / Let Scent Understand Your Heart".
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

export interface PackageContent {
  badge?: string;
  name: string;
  price: string;
  suitableLabel: string;
  suitable: string;
  includesLabel: string;
  includes: string[];
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
  hero: {
    eyebrow: string;
    title: string;
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
      "用摸香测试看见你当下的精神状态与生活状态，再从 28 种精油中为你调配一瓶专属香气。RM49 摸香测试，RM129 专属特调。",
  },
  nav: {
    brand: "香气读懂你的心",
    links: [
      { id: "why", label: "核心理念" },
      { id: "library", label: "28 种精油库" },
      { id: "packages", label: "体验方案" },
      { id: "process", label: "体验流程" },
      { id: "faq", label: "常见问题" },
    ],
    cta: "WhatsApp 预约",
    login: "登录",
    register: "注册会员",
  },
  langSwitch: { label: "语言", zh: "中文", en: "EN" },
  hero: {
    eyebrow: "一场 10–30 分钟的温柔体验",
    title: "解析潜意识最深渴望，引导你找到跨越困境的解方。",
    subtitle:
      "通过摸香测试，了解你当下的精神状态、生活状态与内心需要，再为你调配一瓶真正贴近自己的专属精油。",
    note: "不是算命，不是医疗诊断，而是一场温柔、真实的香气觉察体验。",
    trustPoints: ["28 种精油专业香气库", "1 对 1 状态引导", "专属配方贴近当下"],
    ctaPrimary: "预约 RM49 摸香测试",
    ctaSecondary: "了解 RM129 专属特调",
    upgradeReminder: "已体验 RM49，当天升级 RM129，只需补 RM80。",
    image: IMG.hero,
    imageAlt: "女性在自然光下闻香并记录状态，桌上有滚珠精油、笔记本和植物",
  },
  trust: {
    items: [
      { title: "温柔无压力", desc: "靠直觉感受，不强迫分析" },
      { title: "安全温和", desc: "专业稀释配方，安心使用" },
      { title: "专属陪伴", desc: "一瓶香气，每天支持你" },
      { title: "非医疗承诺", desc: "不替代诊断或治疗" },
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
    title: "体验方案",
    intro: "从一次摸香测试开始，或把专属香气带回家，每天回到自己。",
    a: {
      name: "摸香状态测试体验",
      price: "RM49",
      suitableLabel: "适合",
      suitable: "想了解自己当下状态的人",
      includesLabel: "包含",
      includes: [
        "10–15 分钟摸香测试",
        "3–5 款精选精油香气测试",
        "当前状态解读",
        "简单提升方向建议",
        "一句正念提醒",
      ],
      button: "预约 RM49 摸香测试",
      image: IMG.flatlay,
      imageAlt: "摸香状态测试中的滚珠精油、笔记本与植物卡",
    },
    b: {
      badge: "最受推荐",
      name: "专属特调精油方案",
      price: "RM129",
      suitableLabel: "适合",
      suitable: "想把专属香气带回家，每天练习回到自己的人",
      includesLabel: "包含",
      includes: [
        "包含 RM49 摸香测试",
        "专属精油调配一瓶",
        "专属状态名称",
        "专属香气仪式指南",
        "个人精神提醒卡",
      ],
      button: "探索 RM129 专属特调",
      highlight: true,
      image: IMG.custom,
      imageAlt: "一支专属滚珠精油立在石质托盘上，旁边有牛皮纸盒与花叶",
    },
    trust: ["100% 安全稀释配方", "专业调配师调制", "无医疗功效承诺"],
  },
  upgrade: {
    label: "升级",
    text: "已体验 RM49，当天升级 RM129，只需补 RM80。",
    sub: "当天升级，立即获得专属调配精油与 专属香气仪式指南。",
  },
  process: {
    title: "体验流程 · 简单 4 步",
    intro: "整个过程轻松、无压力，跟着直觉走就好。",
    steps: [
      { num: "01", title: "预约到店", desc: "通过 WhatsApp 选择适合你的时间。" },
      { num: "02", title: "摸香测试", desc: "闻 3–5 款精油，凭直觉感受反应。" },
      { num: "03", title: "状态解读", desc: "我们一起看见你当下的状态与方向。" },
      { num: "04", title: "调配专属精油", desc: "现场为你调配，带走专属香气。" },
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
        q: "RM49 和 RM129 有什么不同？",
        a: "RM49 是摸香状态测试。RM129 包含测试，并为你现场调配一瓶专属精油，附上 专属香气仪式指南和个人精神提醒卡。",
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
        a: "RM129 方案当天现场调配，你可以当天就带走。",
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
    title: "推荐朋友，获得 RM10 TNG PIN + 会员积分",
    body: "注册成为 Let Scent Understand Your Heart 会员后，你会获得专属推荐码。分享给朋友，当朋友使用你的推荐码并完成首次 RM49 或 RM129 体验后，你将获得 RM10 TNG PIN 与会员积分奖励。",
    steps: [
      { num: "01", title: "分享你的专属推荐码" },
      { num: "02", title: "朋友完成首次 RM49 / RM129 体验" },
      { num: "03", title: "你获得 RM10 TNG PIN + 会员积分" },
    ],
    finePrint:
      "奖励将在朋友完成体验并通过后台确认后发放。每位新顾客只限使用一次推荐码。不可自我推荐。积分不可提现。",
    ctaPrimary: "注册成为会员",
    ctaSecondary: "登录查看我的推荐码",
  },
  finalCta: {
    title: "给自己一次看见与改变的机会",
    subtitle: "从一场摸香测试开始，看看现在的你，真正需要什么。",
    ctaPrimary: "预约 RM49 摸香测试",
    ctaSecondary: "探索 RM129 专属特调",
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
    disclaimerLabel: "免责声明",
    disclaimer:
      "本服务不提供医疗诊断、治疗或心理咨询，精油仅作为生活方式与自我觉察的辅助工具。",
    rights: "香气读懂你的心 · 版权所有",
  },
  whatsappMessage:
    "你好，我想预约“香气读懂你的心”的摸香状态测试。我想了解 RM49 和 RM129 方案，请问还有空档吗？",
};

const en: Content = {
  meta: {
    title: "Let Scent Understand Your Heart | Scent Intuition Test × Custom Essential Oil",
    description:
      "A scent intuition test reveals your current mental and life state, then we blend one of 28 essential oils into a custom aroma. RM49 scent test, RM129 custom blend.",
  },
  nav: {
    brand: "Let Scent Understand Your Heart",
    links: [
      { id: "why", label: "Concept" },
      { id: "library", label: "28 Oils" },
      { id: "packages", label: "Packages" },
      { id: "process", label: "Process" },
      { id: "faq", label: "FAQ" },
    ],
    cta: "WhatsApp Booking",
    login: "Login",
    register: "Register",
  },
  langSwitch: { label: "Language", zh: "中文", en: "EN" },
  hero: {
    eyebrow: "A gentle 10–30 minute scent experience",
    title: "Decode Your Deepest Subconscious Longing and Find the Way Through.",
    subtitle:
      "Through a scent intuition test, discover your current emotional and life state, then receive a custom essential oil blend made just for you.",
    note: "This is not fortune telling or medical diagnosis. It is a gentle self-awareness experience through scent.",
    trustPoints: [
      "28-oil professional scent library",
      "1-to-1 state guidance",
      "A custom blend aligned with you",
    ],
    ctaPrimary: "Book RM49 Scent Test",
    ctaSecondary: "Explore RM129 Custom Blend",
    upgradeReminder: "Already tried RM49? Upgrade to RM129 the same day for only RM80.",
    image: IMG.hero,
    imageAlt: "A woman smelling a roll-on essential oil and journaling in soft natural light",
  },
  trust: {
    items: [
      { title: "Gentle & pressure-free", desc: "Led by intuition, never forced analysis" },
      { title: "Safe & gentle", desc: "Professionally diluted and easy to use" },
      { title: "Personal daily support", desc: "One scent that supports you each day" },
      { title: "Not medical treatment", desc: "Not a substitute for diagnosis or therapy" },
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
    title: "Our Packages",
    intro:
      "Begin with a scent intuition test, or bring your custom aroma home to return to yourself every day.",
    a: {
      name: "Scent Intuition State Test",
      price: "RM49",
      suitableLabel: "Suitable for",
      suitable: "Those who want to understand their current state",
      includesLabel: "Includes",
      includes: [
        "10–15 minute scent intuition test",
        "3–5 selected essential oil aromas",
        "A reading of your current state",
        "A simple direction for growth",
        "One mindful reminder",
      ],
      button: "Book RM49 Scent Test",
      image: IMG.flatlay,
      imageAlt: "Roll-on oils, journal and botanical cards for the scent intuition test",
    },
    b: {
      badge: "Most Recommended",
      name: "Custom Essential Oil Blend Plan",
      price: "RM129",
      suitableLabel: "Suitable for",
      suitable: "Those who want to bring their custom aroma home and practise daily",
      includesLabel: "Includes",
      includes: [
        "Includes the RM49 scent test",
        "One custom-blended essential oil",
        "A personal state name",
        "Personal Scent Ritual Guide",
        "A personal reminder card",
      ],
      button: "Explore RM129 Custom Blend",
      highlight: true,
      image: IMG.custom,
      imageAlt: "A custom roll-on oil on a stone tray beside a kraft box and botanicals",
    },
    trust: ["100% Safely Diluted", "Blended by a Pro", "No Medical Claims"],
  },
  upgrade: {
    label: "Upgrade",
    text: "Already tried RM49? Upgrade to RM129 the same day for only RM80.",
    sub: "Upgrade the same day to receive your custom blend and Personal Scent Ritual Guide.",
  },
  process: {
    title: "Your Journey · 4 Simple Steps",
    intro: "The whole process is relaxed and pressure-free — just follow your intuition.",
    steps: [
      { num: "01", title: "Book a Visit", desc: "Pick a time that suits you via WhatsApp." },
      { num: "02", title: "Scent Intuition Test", desc: "Smell 3–5 oils and respond by instinct." },
      { num: "03", title: "State Reading", desc: "Together we see your current state and direction." },
      { num: "04", title: "Custom Blend", desc: "We blend your oil on the spot to take home." },
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
        q: "What is the difference between RM49 and RM129?",
        a: "RM49 is the scent intuition test. RM129 includes the test plus a custom essential oil blended for you on the spot, with a Personal Scent Ritual Guide and a personal reminder card.",
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
        a: "With the RM129 plan your blend is created on the same day, so you can take it home with you.",
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
    title: "Refer a Friend & Earn RM10 TNG PIN + Member Points",
    body: "Join as a Let Scent Understand Your Heart member and receive your personal referral code. Share it with a friend, and when they complete their first RM49 or RM129 experience, you will earn an RM10 TNG PIN plus member points.",
    steps: [
      { num: "01", title: "Share your personal referral code" },
      { num: "02", title: "Your friend completes their first RM49 / RM129 experience" },
      { num: "03", title: "You earn an RM10 TNG PIN + member points" },
    ],
    finePrint:
      "Rewards are issued after the friend completes the experience and the booking is verified by our team. Each new customer may use one referral code only. Self-referrals are not allowed. Points are not cash and cannot be withdrawn.",
    ctaPrimary: "Register as a member",
    ctaSecondary: "Log in to view my code",
  },
  finalCta: {
    title: "Give yourself a chance to see and change",
    subtitle: "Start with a scent intuition test and discover what you truly need right now.",
    ctaPrimary: "Book RM49 Scent Test",
    ctaSecondary: "Explore RM129 Custom Blend",
    image: IMG.custom,
    imageAlt: "A custom-blended roll-on oil on a stone tray",
  },
  footer: {
    brand: "Let Scent Understand Your Heart",
    subtitle: "Discover your current state through scent.",
    exploreLabel: "Explore",
    contactLabel: "Contact",
    contacts: [
      { label: "Email", value: "betterselfaroma@gmail.com" },
      { label: "Instagram", value: "@betterselfaroma" },
    ],
    disclaimerLabel: "Disclaimer",
    disclaimer:
      "This service does not provide medical diagnosis, treatment, or psychological counselling. Essential oils are used only as lifestyle and self-awareness support tools.",
    rights: "Let Scent Understand Your Heart · All rights reserved",
  },
  whatsappMessage:
    "Hi, I'd like to book the Let Scent Understand Your Heart scent intuition test. I'm interested in the RM49 and RM129 plans — may I know the available slots?",
};

export const content: Record<"zh" | "en", Content> = { zh, en };
