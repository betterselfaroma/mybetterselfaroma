import type { Lang } from "@/lib/i18n";

export interface NavLink {
  id: string;
  label: string;
}

export interface InfoCard {
  title: string;
  body: string;
  image: string;
  imageAlt: string;
}

export interface ProcessStep {
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
  image: string;
  imageAlt: string;
}

export interface WhatsAppContactCopy {
  name: string;
  phone: string;
  href: string;
  actionLabel: string;
  footerLine: string;
}

export interface HomeCopy {
  brand: { zh: string; en: string; markAlt: string };
  topBar: { text: string; cta: string };
  nav: {
    links: NavLink[];
    home: string;
    login: string;
    register: string;
    memberCenter: string;
    admin: string;
    logout: string;
    whatsapp: string;
    referralRewards: string;
  };
  hero: {
    eyebrow: string;
    titleLines: string[];
    subtitle: string;
    body: string;
    safety: string;
    primaryCta: string;
    secondaryCta: string;
    imageAlt: string;
  };
  valueStrip: string[];
  discover: { title: string; cards: InfoCard[] };
  oilLibrary: {
    title: string;
    eyebrow: string;
    body: string;
    points: string[];
    imageAlt: string;
  };
  process: {
    title: string;
    body: string;
    steps: ProcessStep[];
    imageAlt: string;
  };
  packages: {
    title: string;
    includesLabel: string;
    recommended: string;
    rm60: PackageCopy;
    rm150: PackageCopy;
  };
  upgrade: { text: string; formula: string };
  lower: {
    pain: { title: string; items: string[]; imageAlt: string };
    safety: { title: string; items: string[] };
    referral: {
      title: string;
      body: string;
      cta: string;
      rewardAmount: string;
      rewardType: string;
      rewardBonus: string;
      imageAlt: string;
    };
  };
  faq: {
    title: string;
    items: { q: string; a: string }[];
  };
  finalCta: {
    lines: string[];
    primary: string;
    secondary: string;
    imageAlt: string;
  };
  whatsapp: {
    menuLabel: string;
    floatingLabel: string;
    contacts: WhatsAppContactCopy[];
  };
  footer: {
    whatsapp: string;
    badges: string[];
    copyright: string;
    explore: string;
    member: string;
    referralRewards: string;
    backHome: string;
  };
  langSwitch: { label: string; zh: string; en: string };
}

const ASSETS = "/scent-knows-you-assets";

export const homeCopy: Record<Lang, HomeCopy> = {
  zh: {
    brand: {
      zh: "香气读懂你的心",
      en: "SCENT KNOWS YOU",
      markAlt: "香气读懂你的心 Scent Knows You 标志",
    },
    topBar: {
      text: "推荐朋友，获得 RM10 TNG PIN + 会员积分",
      cta: "了解更多",
    },
    nav: {
      links: [
        { id: "concept", label: "核心理念" },
        { id: "oil-library", label: "28 种精油库" },
        { id: "packages", label: "体验方案" },
        { id: "process", label: "体验流程" },
        { id: "faq", label: "常见问题" },
      ],
      home: "首页",
      login: "登录",
      register: "注册会员",
      memberCenter: "会员中心",
      admin: "后台管理",
      logout: "登出",
      whatsapp: "WhatsApp 预约",
      referralRewards: "推荐奖励",
    },
    hero: {
      eyebrow: "一场 10–30 分钟的温柔体验",
      titleLines: ["测出你内心真正的渴望，", "看见困住你的烦恼。"],
      subtitle: "解析潜意识最深渴望，引导你找到跨越困境的解方。",
      body: "通过摸香测试，读懂你当下的内心需求、生活状态与情绪卡点，再为你整理专属香气方向。你可以选择只做 RM60 测试，也可以升级 RM150 专属调配精油。",
      safety: "不是算命，不是医疗诊断，而是一场温柔、真实的香气觉察体验。",
      primaryCta: "预约 RM60 摸香测试",
      secondaryCta: "了解 RM150 专属调配",
      imageAlt: "一位女生在温暖自然光中进行摸香测试，桌上有香气卡、笔记本和滚珠精油",
    },
    valueStrip: [
      "28 种精油专业香气库",
      "1 对 1 状态解读与引导",
      "专属香气方向与建议",
      "安全温和专业无压力",
    ],
    discover: {
      title: "你会看见什么？",
      cards: [
        {
          title: "内心真正的渴望",
          body: "有时候你以为自己只是累，其实内心一直有一个没有被听见的渴望。",
          image: `${ASSETS}/02_inner_desire_card_720x460.png`,
          imageAlt: "手拿香气测试纸，象征内心真正的渴望",
        },
        {
          title: "现在困住你的烦恼",
          body: "通过香气反应，看见你当下最明显的情绪卡点、压力来源或生活状态。",
          image: `${ASSETS}/03_current_worry_card_720x460.png`,
          imageAlt: "女生在笔记本前安静觉察当下烦恼",
        },
        {
          title: "适合你的香气方向",
          body: "根据你的测试结果，整理更贴近你当下状态的香气方向，可选择升级专属精油调配。",
          image: `${ASSETS}/04_scent_direction_card_720x460.png`,
          imageAlt: "专属滚珠精油与自然花材，象征香气方向",
        },
      ],
    },
    oilLibrary: {
      title: "28 种精油专业香气库",
      eyebrow: "28-Oil Library",
      body: "摸香测试会从不同香气反应里，看见你此刻更需要安定、清晰、勇气、放松，还是重新连接自己。28 种精油让直觉有更完整的选择，也让专属香气方向更贴近真实状态。",
      points: ["香气卡与测试材料", "天然精油香气库", "专业 1 对 1 引导", "可升级专属调配"],
      imageAlt: "香气测试卡、材料与精油组成的 28 种精油库",
    },
    process: {
      title: "什么是摸香测试？",
      body: "不是你选择香气，而是香气反映你存在的状态。你会从不同香气中凭直觉选择喜欢、排斥或有感觉的味道。每一种反应都会透露你当下的内在需求、生活状态和情绪方向。",
      steps: [
        { n: "1", title: "闻香", body: "直觉感受 3–5 款香气" },
        { n: "2", title: "选择", body: "记录喜欢、抗拒、无感的香气反应" },
        { n: "3", title: "解读", body: "看见内心渴望与情绪卡点" },
        { n: "4", title: "整理方向", body: "得到专属香气方向，可升级调配精油" },
      ],
      imageAlt: "桌面上的精油、香气测试材料、色轮与笔记本",
    },
    packages: {
      title: "选择适合你的体验方案",
      includesLabel: "包含：",
      recommended: "推荐",
      rm60: {
        title: "摸香状态测试体验",
        price: "RM60",
        desc: "适合想了解自己当下内心状态、真正渴望与烦恼卡点的人。",
        includes: ["摸香测试", "香气直觉反应解读", "内心渴望方向", "当前情绪卡点", "一句正念提醒"],
        cta: "预约 RM60 测试体验",
        image: `${ASSETS}/01_scent_testing_package_visual.png`,
        imageAlt: "RM60 摸香状态测试体验视觉",
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
        image: `${ASSETS}/02_custom_ritual_package_visual.png`,
        imageAlt: "RM150 专属特调精油产品视觉",
      },
    },
    upgrade: {
      text: "已体验 RM60 摸香测试，当天加 RM90，即可获得专属特调精油方案。",
      formula: "RM60 + RM90 = RM150",
    },
    lower: {
      pain: {
        title: "如果你最近有这些感觉，这场测试适合你。",
        items: [
          "总觉得累，但说不清为什么",
          "明明生活正常，却觉得心里卡住",
          "有很多想法，但不知道真正想要什么",
          "想改变，却不知道从哪里开始",
          "想找一个温柔方式重新认识自己",
        ],
        imageAlt: "女生闭眼感受香气，象征重新认识自己",
      },
      safety: {
        title: "安全、温和、专业的体验",
        items: [
          "非医疗行为，不替代诊断或专业医疗建议",
          "专业调香师 1 对 1 引导",
          "天然精油，安全温和",
          "尊重隐私，安心分享",
        ],
      },
      referral: {
        title: "会员专属推荐奖励",
        body: "注册会员后，你会获得专属推荐码。朋友使用你的推荐码并完成首次 RM60 或 RM150 体验后，你将获得 RM10 TNG PIN 与会员积分奖励。",
        cta: "注册会员，立即获取推荐码",
        rewardAmount: "RM10",
        rewardType: "TNG PIN",
        rewardBonus: "+ 会员积分奖励",
        imageAlt: "RM10 TNG PIN 推荐奖励信封",
      },
    },
    faq: {
      title: "常见问题",
      items: [
        { q: "这是算命或医疗诊断吗？", a: "不是。它是一场温柔、真实的香气觉察体验，帮助你整理当下状态与香气方向。" },
        { q: "RM60 和 RM150 有什么不同？", a: "RM60 是摸香状态测试体验；RM150 包含 RM60 测试 + RM90 专属精油调配，并包含专属香气仪式指南。" },
        { q: "需要提前懂精油吗？", a: "不需要。你只要凭直觉感受喜欢、抗拒或无感的香气，调香师会 1 对 1 引导你完成。" },
      ],
    },
    finalCta: {
      lines: ["你现在真正需要的，也许不是一瓶精油，", "而是一次看见自己的机会。"],
      primary: "预约 RM60 摸香测试",
      secondary: "WhatsApp 咨询我们",
      imageAlt: "深绿色最终预约横幅中的蜡烛、花材和滚珠精油",
    },
    whatsapp: {
      menuLabel: "选择 WhatsApp 联系人",
      floatingLabel: "WhatsApp",
      contacts: [
        {
          name: "雅凝",
          phone: "0124761919",
          href: "https://wa.me/60124761919",
          actionLabel: "联系雅凝",
          footerLine: "雅凝：0124761919",
        },
        {
          name: "文珊",
          phone: "0177898668",
          href: "https://wa.me/60177898668",
          actionLabel: "联系文珊",
          footerLine: "文珊：0177898668",
        },
      ],
    },
    footer: {
      whatsapp: "WhatsApp 预约 / 咨询",
      badges: ["安全支付", "隐私保护", "专业服务", "安心体验"],
      copyright: "© 2024 香气读懂你的心 Scent Knows You. All rights reserved.",
      explore: "会员服务",
      member: "会员中心",
      referralRewards: "推荐奖励",
      backHome: "返回主页",
    },
    langSwitch: { label: "语言", zh: "中文", en: "EN" },
  },
  en: {
    brand: {
      zh: "香气读懂你的心",
      en: "SCENT KNOWS YOU",
      markAlt: "Scent Knows You logo",
    },
    topBar: {
      text: "Refer a friend and receive RM10 TNG PIN + member points",
      cta: "Learn More",
    },
    nav: {
      links: [
        { id: "concept", label: "Core Concept" },
        { id: "oil-library", label: "28-Oil Library" },
        { id: "packages", label: "Packages" },
        { id: "process", label: "Process" },
        { id: "faq", label: "FAQ" },
      ],
      home: "Home",
      login: "Login",
      register: "Join Member",
      memberCenter: "Member Center",
      admin: "Admin",
      logout: "Logout",
      whatsapp: "WhatsApp Booking",
      referralRewards: "Referral Rewards",
    },
    hero: {
      eyebrow: "A gentle 10–30 minute scent experience",
      titleLines: ["Discover your true inner desire,", "and see what has been holding you back."],
      subtitle: "Reveal the deeper desire beneath your subconscious and find a direction to move through what feels difficult.",
      body: "Through a scent intuition test, we help you understand your current inner needs, life state, and emotional blocks, then organize a personalized scent direction for you. You may choose the RM60 test only, or upgrade to the RM150 personalized essential oil blend.",
      safety: "This is not fortune-telling or a medical diagnosis. It is a gentle and honest scent-awareness experience.",
      primaryCta: "Book RM60 Scent Test",
      secondaryCta: "Explore RM150 Personal Blend",
      imageAlt: "A woman taking a scent intuition test in warm natural light with test cards, a notebook and roller oils",
    },
    valueStrip: [
      "28-oil professional scent library",
      "1-to-1 state reading and guidance",
      "Personalized scent direction and suggestions",
      "Gentle, safe, and pressure-free experience",
    ],
    discover: {
      title: "What Will You Discover?",
      cards: [
        {
          title: "Your True Inner Desire",
          body: "Sometimes you think you are simply tired, but there may be a deeper desire inside that has not been heard.",
          image: `${ASSETS}/02_inner_desire_card_720x460.png`,
          imageAlt: "A hand holding a scent strip, representing inner desire",
        },
        {
          title: "What Is Holding You Back",
          body: "Through your scent reactions, you can see the emotional blocks, pressure points, or life patterns that feel most present now.",
          image: `${ASSETS}/03_current_worry_card_720x460.png`,
          imageAlt: "A thoughtful journaling scene representing emotional blocks",
        },
        {
          title: "Your Scent Direction",
          body: "Based on your test result, we organize a scent direction that fits your current state. You may also upgrade to a personalized blend.",
          image: `${ASSETS}/04_scent_direction_card_720x460.png`,
          imageAlt: "Personal roller oil bottles representing a scent direction",
        },
      ],
    },
    oilLibrary: {
      title: "28-Oil Professional Scent Library",
      eyebrow: "28-Oil Library",
      body: "The scent intuition test uses different aroma reactions to notice whether you may need grounding, clarity, courage, softness, or reconnection. A 28-oil library gives your intuition a fuller range to respond to.",
      points: ["Scent cards and materials", "Natural oil library", "Professional 1-to-1 guidance", "Optional personalized blend"],
      imageAlt: "Scent cards, materials and oils forming a 28-oil library",
    },
    process: {
      title: "What Is a Scent Intuition Test?",
      body: "It is not about choosing a scent. It is about how scent reflects your current state. You will intuitively respond to different scents by noticing what you like, resist, or feel drawn to. Each reaction can reveal your inner needs, current life state, and emotional direction.",
      steps: [
        { n: "1", title: "Smell", body: "Intuitively experience 3–5 scents" },
        { n: "2", title: "Choose", body: "Record scents you like, resist, or feel neutral toward" },
        { n: "3", title: "Read", body: "Understand your inner desire and emotional blocks" },
        { n: "4", title: "Direction", body: "Receive a personalized scent direction, with the option to upgrade to a custom blend" },
      ],
      imageAlt: "Essential oils, scent test materials, a color wheel and a notebook on a desk",
    },
    packages: {
      title: "Choose the Experience That Fits You",
      includesLabel: "Includes:",
      recommended: "Recommended",
      rm60: {
        title: "Scent State Reading Experience",
        price: "RM60",
        desc: "For those who want to understand their current inner state, true desire, and emotional blocks.",
        includes: ["Scent intuition test", "Scent reaction reading", "Inner desire direction", "Current emotional blocks", "One mindful reminder"],
        cta: "Book RM60 Test",
        image: `${ASSETS}/01_scent_testing_package_visual.png`,
        imageAlt: "RM60 scent state reading experience visual",
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
        image: `${ASSETS}/02_custom_ritual_package_visual.png`,
        imageAlt: "RM150 personalized essential oil product visual",
      },
    },
    upgrade: {
      text: "Already completed the RM60 scent test? Add RM90 on the same day to receive your personalized essential oil blend.",
      formula: "RM60 + RM90 = RM150",
    },
    lower: {
      pain: {
        title: "This experience may be for you if you have been feeling...",
        items: [
          "Tired, but unable to explain why",
          "Life seems normal, yet something feels stuck inside",
          "Many thoughts, but no clarity on what you truly want",
          "Wanting change, but not knowing where to begin",
          "Looking for a gentle way to understand yourself again",
        ],
        imageAlt: "A woman pausing with scent, representing gentle self-understanding",
      },
      safety: {
        title: "A Safe, Gentle, Professional Experience",
        items: [
          "Not a medical service and does not replace diagnosis or professional care",
          "1-to-1 guidance by a professional scent practitioner",
          "Natural essential oils, gentle and safe",
          "Privacy respected, sharing is always optional",
        ],
      },
      referral: {
        title: "Member Referral Rewards",
        body: "After registering as a member, you will receive your personal referral code. When your friend uses your code and completes their first RM60 or RM150 experience, you will receive RM10 TNG PIN and member points.",
        cta: "Join Member and Get Your Code",
        rewardAmount: "RM10",
        rewardType: "TNG PIN",
        rewardBonus: "+ Member Points",
        imageAlt: "RM10 TNG PIN referral reward envelope",
      },
    },
    faq: {
      title: "FAQ",
      items: [
        { q: "Is this fortune-telling or medical diagnosis?", a: "No. It is a gentle scent-awareness experience that helps organize your current state and scent direction." },
        { q: "What is the difference between RM60 and RM150?", a: "RM60 is the scent state reading experience. RM150 includes the RM60 test + RM90 personalized oil blend, with a Personal Scent Ritual Guide." },
        { q: "Do I need to know essential oils first?", a: "No. Simply notice which scents you like, resist, or feel neutral toward. A scent practitioner will guide you 1-to-1." },
      ],
    },
    finalCta: {
      lines: ["What you truly need right now may not be just a bottle of oil,", "but a chance to see yourself more clearly."],
      primary: "Book RM60 Scent Test",
      secondary: "Chat With Us on WhatsApp",
      imageAlt: "A deep green final booking banner with candle, botanicals and roller oils",
    },
    whatsapp: {
      menuLabel: "Choose a WhatsApp contact",
      floatingLabel: "WhatsApp",
      contacts: [
        {
          name: "Yaning",
          phone: "0124761919",
          href: "https://wa.me/60124761919",
          actionLabel: "Contact Yaning",
          footerLine: "Yaning: 0124761919",
        },
        {
          name: "Wenshan",
          phone: "0177898668",
          href: "https://wa.me/60177898668",
          actionLabel: "Contact Wenshan",
          footerLine: "Wenshan: 0177898668",
        },
      ],
    },
    footer: {
      whatsapp: "WhatsApp Booking / Inquiry",
      badges: ["Secure Payment", "Privacy Protection", "Professional Service", "Peaceful Experience"],
      copyright: "© 2024 香气读懂你的心 Scent Knows You. All rights reserved.",
      explore: "Member Services",
      member: "Member Center",
      referralRewards: "Referral Rewards",
      backHome: "Back to Home",
    },
    langSwitch: { label: "Language", zh: "中文", en: "EN" },
  },
};
