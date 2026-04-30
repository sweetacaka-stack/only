// src/app/config.ts
// 个人数字名片配置文件 - 修改此文件即可更新网站内容

export const personalInfo = {
  // 姓名
  firstName: "Bin . Bin",
  lastName: "zhang",

  // 联系方式
  phone: "15098039595",
  email: "2922717190@qq.com",
  wechat: "2922717190@qq.com",
  
  // 微信二维码图片（放在 public 目录下）
  wechatQRCode: "/wechat-qrcode.jpg",

  // 职业信息
  title: "品牌&视觉设计师",
  titleEn: "BRAND VISION",

  // 左侧菜单导航
  menuItems: [
    { id: '01', label: '品牌', sublabel: 'BRAND' },
    { id: '02', label: '包装', sublabel: 'PACKING' },
    { id: '03', label: '标志字体', sublabel: 'LOGO&FONT' },
    { id: '04', label: '版式视觉', sublabel: 'FORMAT' },
  ],

  // Coze智能体配置
  cozeBotId: "7628802117205606446",
  cozeApiKey: "pat_ikmYxImr7JjuXoXoSogAYIVVs4ImVvzRTJHCMu0ggEGZasPpsWhEKKN1YGPHmFvS",
};

// 作品集配置
export const works = [
  {
    id: 1,
    title: "MONOGRAPH",
    category: "Brand Identity",
    image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2Fb2c17deea19eb100c6291198bb9c92c69235b8092dbe59ccf23c693987dc3e85.png&nonce=e6cdf224-c486-40f0-91c9-bbc87cb4feee&project_id=7628526330237288488&sign=5765c39e540e757ad689716ee1e01a67ed3f8a437cbd3c774a2d18d79734a1b8"
  },
  {
    id: 2,
    title: "AURA",
    category: "Visual Design",
    image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F0a582b534cae1df4174469b487e2c56667967c20fafeea97abc00a586baee02a.png&nonce=0111348a-bb7a-47bf-a5b4-e8e722f19205&project_id=7628526330237288488&sign=514041380476eab1bb10da905f415fa3a349bf0e55b78766c05badd8534d2b04"
  },
  {
    id: 3,
    title: "VOID",
    category: "Art Direction",
    image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F0fc3ec76c63e9c9019bbbafd74fe55acf75d5fa1428fd911391a856c9a707f4b.png&nonce=b289ae8d-88ed-4cc0-8ca9-eb6feeabfe2e&project_id=7628526330237288488&sign=2e8ee79250d9c94eb1d1286469cf68f076a8e89fbd169a89b9befe326e6b8af6"
  },
  {
    id: 4,
    title: "ETHEREAL",
    category: "Photography",
    image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F3f3bea175ebb1d23a37de7c4805d9d998f5659cd1a272e4601e2ec740b78a904.png&nonce=d6769453-a409-4ba4-bfe0-7d0f65e4ad01&project_id=7628526330237288488&sign=1a2b34db9d831af35a99a7c95ff5602259fa5d394646eed6794a218f46d5cbc0"
  },
  {
    id: 5,
    title: "METRIC",
    category: "Data Visualization",
    image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F4cbf9d2d2d36c6f2c2c702885afd68f8ecd66b61884f1c935083d05334cf8b62.png&nonce=ac78c54c-8d7a-4924-9f24-2d6af074ea4d&project_id=7628526330237288488&sign=733958909a9dbe6b6f1d243684c2389bd6bb6337e15da5c768f88055b363e8e7"
  },
  {
    id: 6,
    title: "LUMEN",
    category: "Installation",
    image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2Fsp260415_151645.png&nonce=2b8adfc5-c944-4174-9e22-a1c97de1000e&project_id=7628526330237288488&sign=615824e13095af5cf418d8c43e4961888e0c0467f81453775e97b815dec6bd20"
  },
];

// 图片画廊配置
export const gallery = [
  {
    id: 1,
    title: "作品 01",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 2,
    title: "作品 02",
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 3,
    title: "作品 03",
    url: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 4,
    title: "作品 04",
    url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 5,
    title: "作品 05",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 6,
    title: "作品 06",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 7,
    title: "作品 07",
    url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 8,
    title: "作品 08",
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 9,
    title: "作品 09",
    url: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 10,
    title: "作品 10",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 11,
    title: "作品 11",
    url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 12,
    title: "作品 12",
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80"
  }
];

// 产品视频配置
export const videos = [
  {
    id: 1,
    title: "产品视频 01",
    subtitle: "PRODUCT VIDEO 01",
    thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80",
    url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    id: 2,
    title: "产品视频 02",
    subtitle: "PRODUCT VIDEO 02",
    thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e63?auto=format&fit=crop&w=800&q=80",
    url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
  {
    id: 3,
    title: "产品视频 03",
    subtitle: "PRODUCT VIDEO 03",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
    url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
  },
];
