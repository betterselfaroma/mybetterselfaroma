import type { Lang } from "@/lib/i18n";

/**
 * Homepage copy dictionary — the single source of truth for every visible
 * string on `/`. Keep all wording here (never hard-coded in JSX) so the
 * Chinese / English toggle stays consistent and nothing renders half-and-half.
 *
 * Intentionally NOT translated (brand / fixed tokens):
 *   香气读懂你的心 · SCENT KNOWS YOU · INNER DESIRE · RM60 / RM150 ·
 *   WhatsApp · TNG PIN · phone numbers.
 */

export interface NavLink {
  id: string;
  label: string;
}

export interface InfoCard {
  title: string;
  body: string;
}

export interface Step {
  n: string;
  title: string;
  body: string;
}

export interface PackageCopy {
  title: string;
  price: string;
  desc: string;
  includes: string[];
  cta: string;
}

export interface HomeCopy {
  brand: { zh: string; en: string };
  kicker: string;
  referralBar: { text: string; cta: string };
  nav: {
    links: NavLink[];
    login: string;
    register: string;
    whatsapp: string;
  };
  hero: {
    eyebrow: string;
    titleLines: string[];
    goldSubtitle: string;
    body: string;
    safety: string;
    primaryCta: string;
    secondaryCta: string;
    imageAlt: string;
  };
  valueStrip: string[];
  concept: { title: string; cards: InfoCard[] };
  process: { title: string; intro: string[]; steps: Step[] };
  oilLibrary: { title: string; body: string; imageAlt: string };
  packages: {
    title: string;
    recommended: string;
    includesLabel: string;
    rm60: PackageCopy;
    rm150: PackageCopy;
  };
  ritualGuide: {
    toggleLabel: string;
    title: string;
    intro: string;
    ritualTitle: string;
    steps: string[];
    momentsTitle: string;
    moments: string[];
    brandEn: string;
    brandZh: string;
  };
  upgrade: { text: string; formula: string };
  faq: { title: string; items: { q: string; a: string }[] };
  lower: {
    feelings: { title: string; items: string[] };
    safety: { title: string; items: string[] };
    referral: { title: string; body: string; cta: string };
  };
  finalCta: { lines: string[]; primary: string; secondary: string };
  footer: {
    whatsapp: string;
    phones: string;
    badges: string[];
    copyright: string;
  };
  langSwitch: { zh: string; en: string };
}

export const homeCopy: Record<Lang, HomeCopy> = {
  zh: {
    brand: { zh: "香气读懂你的心", en: "SCENT KNOWS YOU" },
    kicker: "INNER DESIRE · 内心渴望",
    referralBar: {
      text: "推荐朋友，获得 RM10 TNG PIN + 会员积分",
      cta: "了解更多",
    },
    nav: {
      links: [
        { id: "concept", label: "核心理念" },
        { id: "packages", label: "体验方案" },
        { id: "process", label: "体验流程" },
        { id: "faq", label: "常见问题" },
      ],
      login: "登录",
      register: "注册会员",
      whatsapp: "WhatsApp 预约",
    },
    hero: {
      eyebrow: "一场 10–30 分钟的温柔体验",
      titleLines: ["测出你内心真正的渴望，", "看见困住你的烦恼。"],
      goldSubtitle: "解析潜意识最深渴望，引导你找到跨越困境的解方。",
      body: "通过摸香测试，读懂你当下的内心需求、生活状态与情绪卡点，再为你整理专属香气方向。你可以选择只做 RM60 测试，也可以升级 RM150 专属调配精油。",
      safety: "不是算命，不是医疗诊断，而是一场温柔、真实的香气觉察体验。",
      primaryCta: "预约 RM60 摸香测试",
      secondaryCta: "了解 RM150 专属调配",
      imageAlt: "一位女生正在安静地闻香气测试，桌上放着测试纸、笔记本与香槟金滚珠精油瓶",
    },
    valueStrip: [
      "28 种精油专业香气库",
      "1 对 1 状态解读与引导",
      "专属香气方向与建议",
      "安全温和专业无压力",
    ],
    concept: {
      title: "你会看见什么？",
      cards: [
        {
          title: "内心真正的渴望",
          body: "有时候你以为自己只是累，其实内心一直有一个没有被听见的渴望。",
        },
        {
          title: "现在困住你的烦恼",
          body: "通过香气反应，看见你当下最明显的情绪卡点、压力来源或生活状态。",
        },
        {
          title: "适合你的香气方向",
          body: "根据你的测试结果，整理更贴近你当下状态的香气方向，可选择升级专属精油调配。",
        },
      ],
    },
    process: {
      title: "什么是摸香测试？",
      intro: [
        "不是你选择香气，而是香气反映你存在的状态。",
        "你会从不同香气中凭直觉选择喜欢、排斥或有感觉的味道。",
        "每一种反应都会透露你当下的内在需求、生活状态和情绪方向。",
      ],
      steps: [
        { n: "1", title: "闻香", body: "直觉感受 3–5 款香气" },
        { n: "2", title: "选择", body: "记录喜欢、抗拒、无感的香气反应" },
        { n: "3", title: "解读", body: "看见内心渴望与情绪卡点" },
        { n: "4", title: "整理方向", body: "得到专属香气方向，可升级调配精油" },
      ],
    },
    oilLibrary: {
      title: "28 种精油专业香气库",
      body: "我们以 28 种天然精油构成完整的香气光谱，让你的直觉在测试中有丰富而真实的选择。",
      imageAlt: "整齐排列的天然精油，构成 28 种香气库",
    },
    packages: {
      title: "选择适合你的体验方案",
      recommended: "推荐",
      includesLabel: "包含：",
      rm60: {
        title: "摸香状态测试体验",
        price: "RM60",
        desc: "适合想了解自己当下内心状态、真正渴望与烦恼卡点的人。",
        includes: [
          "摸香测试",
          "香气直觉反应解读",
          "内心渴望方向",
          "当前情绪卡点",
          "一句正念提醒",
        ],
        cta: "预约 RM60 测试体验",
      },
      rm150: {
        title: "专属特调精油方案",
        price: "RM150",
        desc: "包含 RM60 摸香测试 + RM90 专属精油调配。适合想把测试结果带回日常，用专属香气持续陪伴自己的人。",
        includes: [
          "RM60 摸香状态测试",
          "内心渴望与情绪卡点解读",
          "RM90 专属精油调配",
          "专属状态名称",
          "专属香气仪式指南",
          "一句正念提醒",
        ],
        cta: "选择 RM150 完整方案",
      },
    },
    ritualGuide: {
      toggleLabel: "展开专属香气仪式指南",
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
      brandEn: "Trust your intuition. Let scent speak to your heart.",
      brandZh: "相信直觉，让香气与你的内心对话。",
    },
    upgrade: {
      text: "已体验 RM60 摸香测试，当天加 RM90，即可获得专属特调精油方案。",
      formula: "RM60 + RM90 = RM150",
    },
    faq: {
      title: "常见问题",
      items: [
        {
          q: "这是算命或医疗吗？",
          a: "不是。这不是算命，也不是医疗诊断，而是一场温柔、真实的香气觉察体验。",
        },
        {
          q: "整个体验需要多长时间？",
          a: "一场摸香测试大约 10–30 分钟，节奏温柔，不需要任何准备。",
        },
        {
          q: "RM60 和 RM150 有什么不同？",
          a: "RM60 是摸香状态测试体验；RM150 包含 RM60 测试加 RM90 专属精油调配，把你的测试结果带回日常。",
        },
        {
          q: "会员推荐奖励怎么获得？",
          a: "注册会员后你会获得专属推荐码，朋友使用并完成首次 RM60 或 RM150 体验后，你将获得 RM10 TNG PIN 与会员积分。",
        },
      ],
    },
    lower: {
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
      safety: {
        title: "安全、温和、专业的体验",
        items: [
          "非医疗行为，不替代诊断或治疗",
          "专业调香师 1 对 1 引导",
          "天然精油，安全温和",
          "尊重隐私，安心分享",
        ],
      },
      referral: {
        title: "会员专属推荐奖励",
        body: "注册会员后，你会获得专属推荐码。朋友使用你的推荐码并完成首次 RM60 或 RM150 体验后，你将获得 RM10 TNG PIN 与会员积分奖励。",
        cta: "注册会员，立即获取推荐码",
      },
    },
    finalCta: {
      lines: ["你现在真正需要的，也许不是一瓶精油，", "而是一次看见自己的机会。"],
      primary: "预约 RM60 摸香测试",
      secondary: "WhatsApp 咨询我们",
    },
    footer: {
      whatsapp: "WhatsApp 预约 / 咨询",
      phones: "0124761919 / 60124761919",
      badges: ["安全支付", "隐私保护", "专业服务", "安心体验"],
      copyright: "© 2024 香气读懂你的心 Scent Knows You. All rights reserved.",
    },
    langSwitch: { zh: "中文", en: "EN" },
  },

  en: {
    brand: { zh: "香气读懂你的心", en: "SCENT KNOWS YOU" },
    kicker: "INNER DESIRE",
    referralBar: {
      text: "Refer a friend and receive RM10 TNG PIN + member points",
      cta: "Learn More",
    },
    nav: {
      links: [
        { id: "concept", label: "Core Concept" },
        { id: "packages", label: "Packages" },
        { id: "process", label: "Process" },
        { id: "faq", label: "FAQ" },
      ],
      login: "Login",
      register: "Join Member",
      whatsapp: "WhatsApp Booking",
    },
    hero: {
      eyebrow: "A gentle 10–30 minute scent experience",
      titleLines: [
        "Discover your true inner desire,",
        "and see what has been holding you back.",
      ],
      goldSubtitle:
        "Reveal the deeper desire beneath your subconscious and find a direction to move through what feels difficult.",
      body: "Through a scent intuition test, we help you understand your current inner needs, life state, and emotional blocks, then organize a personalized scent direction for you. You may choose the RM60 test only, or upgrade to the RM150 personalized essential oil blend.",
      safety:
        "This is not fortune-telling or a medical diagnosis. It is a gentle and honest scent-awareness experience.",
      primaryCta: "Book RM60 Scent Test",
      secondaryCta: "Explore RM150 Personal Blend",
      imageAlt:
        "A woman quietly smelling a scent test, with test strips, a notebook and champagne-gold roller bottles on the table",
    },
    valueStrip: [
      "28-oil professional scent library",
      "1-to-1 state reading and guidance",
      "Personalized scent direction and suggestions",
      "Gentle, safe, and pressure-free experience",
    ],
    concept: {
      title: "What Will You Discover?",
      cards: [
        {
          title: "Your True Inner Desire",
          body: "Sometimes you think you are simply tired, but there may be a deeper desire inside that has not been heard.",
        },
        {
          title: "What Is Holding You Back",
          body: "Through your scent reactions, you can see the emotional blocks, pressure points, or life patterns that feel most present now.",
        },
        {
          title: "Your Scent Direction",
          body: "Based on your test result, we organize a scent direction that fits your current state. You may also upgrade to a personalized blend.",
        },
      ],
    },
    process: {
      title: "What Is a Scent Intuition Test?",
      intro: [
        "It is not about choosing a scent. It is about how scent reflects your current state.",
        "You will intuitively respond to different scents by noticing what you like, resist, or feel drawn to.",
        "Each reaction can reveal your inner needs, current life state, and emotional direction.",
      ],
      steps: [
        { n: "1", title: "Smell", body: "Intuitively experience 3–5 scents" },
        {
          n: "2",
          title: "Choose",
          body: "Record scents you like, resist, or feel neutral toward",
        },
        {
          n: "3",
          title: "Read",
          body: "Understand your inner desire and emotional blocks",
        },
        {
          n: "4",
          title: "Direction",
          body: "Receive a personalized scent direction, with the option to upgrade to a custom blend",
        },
      ],
    },
    oilLibrary: {
      title: "28-Oil Professional Scent Library",
      body: "Our library of 28 natural essential oils forms a complete scent spectrum, giving your intuition a rich and honest range to respond to during the test.",
      imageAlt: "Natural essential oils arranged as a library of 28 scents",
    },
    packages: {
      title: "Choose the Experience That Fits You",
      recommended: "Recommended",
      includesLabel: "Includes:",
      rm60: {
        title: "Scent State Reading Experience",
        price: "RM60",
        desc: "For those who want to understand their current inner state, true desire, and emotional blocks.",
        includes: [
          "Scent intuition test",
          "Scent reaction reading",
          "Inner desire direction",
          "Current emotional blocks",
          "One mindful reminder",
        ],
        cta: "Book RM60 Test",
      },
      rm150: {
        title: "Personalized Essential Oil Blend",
        price: "RM150",
        desc: "Includes the RM60 scent test + RM90 personalized oil blend. For those who want to bring their reading into daily life through a personal scent companion.",
        includes: [
          "RM60 Scent State Reading",
          "Inner desire and emotional block reading",
          "RM90 Personalized Essential Oil Blend",
          "Personal State Name",
          "Personal Scent Ritual Guide",
          "One Mindful Reminder",
        ],
        cta: "Choose RM150 Full Package",
      },
    },
    ritualGuide: {
      toggleLabel: "View the Personal Scent Ritual Guide",
      title: "Personal Scent Ritual Guide",
      intro:
        "Take a few mindful minutes each day to let your personal scent support calm, awareness, and inner balance. This is not a short-term task, but a daily scent ritual you can return to anytime.",
      ritualTitle: "Daily Scent Ritual",
      steps: [
        "Gently apply the roller oil to your wrist, behind your ears, or near your chest.",
        "Rub your hands softly to warm the scent.",
        "Take five deep breaths.",
        "Close your eyes for one minute and notice how you feel.",
        "Begin or end your day with one mindful reminder.",
      ],
      momentsTitle: "Best moments to use it",
      moments: [
        "Before starting your morning",
        "During work or study stress",
        "Before sleep",
        "When emotions feel messy and you need to pause",
        "When you want to reconnect with yourself",
      ],
      brandEn: "Trust your intuition. Let scent speak to your heart.",
      brandZh: "相信直觉，让香气与你的内心对话。",
    },
    upgrade: {
      text: "Already completed the RM60 scent test? Add RM90 on the same day to receive your personalized essential oil blend.",
      formula: "RM60 + RM90 = RM150",
    },
    faq: {
      title: "FAQ",
      items: [
        {
          q: "Is this fortune-telling or medical?",
          a: "No. This is not fortune-telling or a medical diagnosis. It is a gentle and honest scent-awareness experience.",
        },
        {
          q: "How long does the experience take?",
          a: "A scent test takes about 10–30 minutes, at a gentle pace, with nothing to prepare.",
        },
        {
          q: "What is the difference between RM60 and RM150?",
          a: "RM60 is the scent state reading experience. RM150 includes the RM60 test plus the RM90 personalized oil blend, bringing your reading into daily life.",
        },
        {
          q: "How do member referral rewards work?",
          a: "After registering you receive a personal referral code. When a friend uses it and completes their first RM60 or RM150 experience, you receive RM10 TNG PIN and member points.",
        },
      ],
    },
    lower: {
      feelings: {
        title: "This experience may be for you if you have been feeling...",
        items: [
          "Tired, but unable to explain why",
          "Life seems normal, yet something feels stuck inside",
          "Many thoughts, but no clarity on what you truly want",
          "Wanting change, but not knowing where to begin",
          "Looking for a gentle way to understand yourself again",
        ],
      },
      safety: {
        title: "A Safe, Gentle, Professional Experience",
        items: [
          "Not a medical service and does not replace diagnosis or treatment",
          "1-to-1 guidance by a professional scent practitioner",
          "Natural essential oils, gentle and safe",
          "Privacy respected, sharing is always optional",
        ],
      },
      referral: {
        title: "Member Referral Rewards",
        body: "After registering as a member, you will receive your personal referral code. When your friend uses your code and completes their first RM60 or RM150 experience, you will receive RM10 TNG PIN and member points.",
        cta: "Join Member and Get Your Code",
      },
    },
    finalCta: {
      lines: [
        "What you truly need right now may not be just a bottle of oil,",
        "but a chance to see yourself more clearly.",
      ],
      primary: "Book RM60 Scent Test",
      secondary: "Chat With Us on WhatsApp",
    },
    footer: {
      whatsapp: "WhatsApp Booking / Inquiry",
      phones: "0124761919 / 60124761919",
      badges: [
        "Secure Payment",
        "Privacy Protection",
        "Professional Service",
        "Peaceful Experience",
      ],
      copyright: "© 2024 香气读懂你的心 Scent Knows You. All rights reserved.",
    },
    langSwitch: { zh: "中文", en: "EN" },
  },
};
