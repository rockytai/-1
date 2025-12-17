
import { World, Word, Achievement, Player } from './types';

export const WORLDS: World[] = [
  { 
    id: 1, 
    name: "哥布林森林", 
    enemy: "哥布林王", 
    hp: 40, 
    img: "👺", 
    theme: "bg-green-700", 
    bgPattern: "bg-green-600", 
    desc: "掠夺资源!",
    textColor: "text-green-100"
  },
  { 
    id: 2, 
    name: "骷髅塔", 
    enemy: "炸弹人", 
    hp: 80, 
    img: "💣", 
    theme: "bg-stone-700", 
    bgPattern: "bg-stone-600", 
    desc: "小心爆炸!",
    textColor: "text-stone-100"
  },
  { 
    id: 3, 
    name: "法师山谷", 
    enemy: "法师", 
    hp: 120, 
    img: "🧙‍♂️", 
    theme: "bg-purple-800", 
    bgPattern: "bg-purple-700", 
    desc: "魔法对决!",
    textColor: "text-purple-100"
  },
  { 
    id: 4, 
    name: "飞龙悬崖", 
    enemy: "喷火龙", 
    hp: 160, 
    img: "🐉", 
    theme: "bg-red-800", 
    bgPattern: "bg-red-700", 
    desc: "空中霸主!",
    textColor: "text-red-100"
  }
];

export const AVATARS = [
    "⚔️", "🏹", "👊", "👺", "💀", "🎈", "🧙‍♂️", "🧚‍♀️", "🐲", "🤖", 
    "🤴", "👸", "👴", "⛏️", "🐗", "🦇", "❄️", "⚡", "🪓", "🌋"
];

export const LEVELS_PER_WORLD = 10;
export const TOTAL_LEVELS = 40;

// --- RPG Logic ---
// Progressive XP Curve: 1000, 1500, 2000, 2500...
export const getXpForNextLevel = (level: number) => {
    return 500 + (level * 500);
};

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 1,
        title: "初出茅庐",
        desc: "赢得第1场战斗胜利",
        icon: "🗡️",
        condition: (p: Player) => Object.keys(p.stars).length >= 1
    },
    {
        id: 2,
        title: "连击大师",
        desc: "在单局中达到10连击 (Check during battle)",
        icon: "🔥",
        condition: (p: Player) => false // Handled manually in battle logic
    },
    {
        id: 3,
        title: "学富五车",
        desc: "总分达到 10,000 分",
        icon: "📚",
        condition: (p: Player) => p.totalScore >= 10000
    },
    {
        id: 4,
        title: "完美主义",
        desc: "在任意关卡获得3颗星",
        icon: "⭐",
        condition: (p: Player) => Object.values(p.stars).some(s => s === 3)
    },
    {
        id: 5,
        title: "久经沙场",
        desc: "玩家等级达到 5 级",
        icon: "🏅",
        condition: (p: Player) => p.level >= 5
    },
    {
        id: 6,
        title: "地图征服者",
        desc: "解锁第 2 个世界 (Level 11)",
        icon: "🗺️",
        condition: (p: Player) => p.maxUnlockedLevel >= 11
    }
];


const generateWordList = (): Word[] => {
    // Format: "Character|Pinyin (English/Meaning)"
    const rawData = [
        // 1-50: Basics
        "我|wǒ (我/Me)", "你|nǐ (你/You)", "他|tā (他/He)", "她|tā (她/She)", "它|tā (它/It)",
        "我们|wǒ men (我们/Us)", "你们|nǐ men (你们/You all)", "他们|tā men (他们/Them)", "这|zhè (这/This)", "那|nà (那/That)",
        "哪|nǎ (哪/Which)", "是|shì (是/Is/Am/Are)", "有|yǒu (有/Have)", "没有|méi yǒu (没有/Don't have)", "会|huì (会/Can/Will)",
        "要|yào (要/Want)", "可以|kě yǐ (可以/Can)", "好|hǎo (好/Good)", "不好|bù hǎo (不好/Bad)", "很|hěn (很/Very)",
        "不|bù (不/No)", "吗|ma (吗/?)", "也|yě (也/Also)", "和|hé (和/And)", "在|zài (在/At/In)",
        "来|lái (来/Come)", "去|qù (去/Go)", "给|gěi (给/Give)", "做|zuò (做/Do)", "看|kàn (看/Look/See)",
        "吃|chī (吃/Eat)", "喝|hē (喝/Drink)", "玩|wán (玩/Play)", "说|shuō (说/Speak)", "听|tīng (听/Listen)",
        "走|zǒu (走/Walk)", "坐|zuò (坐/Sit)", "站|zhàn (站/Stand)", "大|dà (大/Big)", "小|xiǎo (小/Small)",
        "多|duō (多/Many)", "少|shǎo (少/Few)", "快|kuài (快/Fast)", "慢|màn (慢/Slow)", "上|shàng (上/Up)",
        "下|xià (下/Down)", "里|lǐ (里/Inside)", "外|wài (外/Outside)", "家|jiā (家/Home)", "人|rén (人/Person)",

        // 51-100: Life
        "爸爸|bà ba (爸爸/Dad)", "妈妈|mā ma (妈妈/Mom)", "老师|lǎo shī (老师/Teacher)", "学生|xué shēng (学生/Student)", "朋友|péng you (朋友/Friend)",
        "同学|tóng xué (同学/Classmate)", "书|shū (书/Book)", "桌子|zhuō zi (桌子/Table)", "椅子|yǐ zi (椅子/Chair)", "包|bāo (包/Bag)",
        "水|shuǐ (水/Water)", "饭|fàn (饭/Rice/Meal)", "衣服|yī fu (衣服/Clothes)", "鞋子|xié zi (鞋子/Shoes)", "房间|fáng jiān (房间/Room)",
        "厕所|cè suǒ (厕所/Toilet)", "学校|xué xiào (学校/School)", "课室|kè shì (课室/Classroom)", "操场|cāo chǎng (操场/Playground)", "商店|shāng diàn (商店/Shop)",
        "动物|dòng wù (动物/Animal)", "车|chē (车/Car)", "路|lù (路/Road)", "天空|tiān kōng (天空/Sky)", "太阳|tài yáng (太阳/Sun)",
        "月亮|yuè liang (月亮/Moon)", "雨|yǔ (雨/Rain)", "风|fēng (风/Wind)", "花|huā (花/Flower)", "树|shù (树/Tree)",
        "草|cǎo (草/Grass)", "山|shān (山/Mountain)", "河|hé (河/River)", "海|hǎi (海/Sea)", "热|rè (热/Hot)",
        "冷|lěng (冷/Cold)", "高|gāo (高/High/Tall)", "矮|ǎi (矮/Short)", "胖|pàng (胖/Fat)", "瘦|shòu (瘦/Thin)",
        "红|hóng (红/Red)", "蓝|lán (蓝/Blue)", "白|bái (白/White)", "黑|hēi (黑/Black)", "黄|huáng (黄/Yellow)",
        "绿|lǜ (绿/Green)", "写|xiě (写/Write)", "读|dú (读/Read)", "画|huà (画/Draw)", "学|xué (学/Learn)",

        // 101-150: Actions & Descriptions
        "打开|dǎ kāi (打开/Open)", "关闭|guān bì (关闭/Close)", "拿|ná (拿/Take/Hold)", "放|fàng (放/Put)", "帮助|bāng zhù (帮助/Help)",
        "学习|xué xí (学习/Study)", "休息|xiū xi (休息/Rest)", "运动|yùn dòng (运动/Exercise)", "游戏|yóu xì (游戏/Game)", "洗|xǐ (洗/Wash)",
        "穿|chuān (穿/Wear)", "等|děng (等/Wait)", "送|sòng (送/Send/Give)", "买|mǎi (买/Buy)", "卖|mài (卖/Sell)",
        "问|wèn (问/Ask)", "回答|huí dá (回答/Answer)", "开始|kāi shǐ (开始/Start)", "结束|jié shù (结束/End)", "决定|jué dìng (决定/Decide)",
        "喜欢|xǐ huan (喜欢/Like)", "不喜欢|bù xǐ huan (不喜欢/Dislike)", "害怕|hài pà (害怕/Scared)", "生气|shēng qì (生气/Angry)", "伤心|shāng xīn (伤心/Sad)",
        "开心|kāi xīn (开心/Happy)", "累|lèi (累/Tired)", "忙|máng (忙/Busy)", "空|kōng (空/Empty)", "满|mǎn (满/Full)",
        "轻|qīng (轻/Light)", "重|zhòng (重/Heavy)", "明亮|míng liàng (明亮/Bright)", "黑暗|hēi àn (黑暗/Dark)", "安静|ān jìng (安静/Quiet)",
        "吵闹|chǎo nào (吵闹/Noisy)", "干净|gān jìng (干净/Clean)", "肮脏|āng zāng (肮脏/Dirty)", "方便|fāng biàn (方便/Convenient)", "困难|kùn nán (困难/Difficult)",
        "简单|jiǎn dān (简单/Simple)", "重要|zhòng yào (重要/Important)", "特别|tè bié (特别/Special)", "相同|xiāng tóng (相同/Same)", "不同|bù tóng (不同/Different)",
        "继续|jì xù (继续/Continue)", "停止|tíng zhǐ (停止/Stop)", "准备|zhǔn bèi (准备/Prepare)", "记得|jì de (记得/Remember)", "忘记|wàng jì (忘记/Forget)",

        // 151-200: Abstract
        "理解|lǐ jiě (理解/Understand)", "发现|fā xiàn (发现/Discover)", "选择|xuǎn zé (选择/Choose)", "讨论|tǎo lùn (讨论/Discuss)", "表示|biǎo shì (表示/Express)",
        "说明|shuō míng (说明/Explain)", "变化|biàn huà (变化/Change)", "原因|yuán yīn (原因/Reason)", "结果|jié guǒ (结果/Result)", "方法|fāng fǎ (方法/Method)",
        "计划|jì huà (计划/Plan)", "经验|jīng yàn (经验/Experience)", "能力|néng lì (能力/Ability)", "机会|jī huì (机会/Opportunity)", "条件|tiáo jiàn (条件/Condition)",
        "影响|yǐng xiǎng (影响/Influence)", "习惯|xí guàn (习惯/Habit)", "方向|fāng xiàng (方向/Direction)", "感觉|gǎn jué (感觉/Feeling)", "情况|qíng kuàng (情况/Situation)",
        "问题|wèn tí (问题/Question)", "答案|dá àn (答案/Answer)", "内容|nèi róng (内容/Content)", "标准|biāo zhǔn (标准/Standard)", "要求|yāo qiú (要求/Requirement)",
        "意见|yì jiàn (意见/Opinion)", "表现|biǎo xiàn (表现/Performance)", "态度|tài du (态度/Attitude)", "行为|xíng wéi (行为/Behavior)", "目标|mù biāo (目标/Target)",
        "程度|chéng dù (程度/Degree)", "范围|fàn wéi (范围/Range)", "速度|sù dù (速度/Speed)", "水平|shuǐ píng (水平/Level)", "成功|chéng gōng (成功/Success)",
        "失败|shī bài (失败/Failure)", "方式|fāng shì (方式/Way)", "形式|xíng shì (形式/Form)", "结构|jié gòu (结构/Structure)",
        "特点|tè diǎn (特点/Characteristic)", "区别|qū bié (区别/Difference)", "优点|yōu diǎn (优点/Advantage)", "缺点|quē diǎn (缺点/Disadvantage)", "原则|yuán zé (原则/Principle)",
        "规律|guī lǜ (规律/Law/Pattern)", "功能|gōng néng (功能/Function)", "状态|zhuàng tài (状态/Status)", "性质|xìng zhì (性质/Nature)", "稳定|wěn dìng (稳定/Stable)",

        // 201-250: Society & Nature
        "国家|guó jiā (国家/Country)", "城市|chéng shì (城市/City)", "文化|wén huà (文化/Culture)", "历史|lì shǐ (历史/History)", "科学|kē xué (科学/Science)",
        "数学|shù xué (数学/Math)", "技术|jì shù (技术/Tech)", "艺术|yì shù (艺术/Art)", "音乐|yīn yuè (音乐/Music)", "体育|tǐ yù (体育/Sports)",
        "资料|zī liào (资料/Data/Info)", "研究|yán jiū (研究/Research)", "能源|néng yuán (能源/Energy)", "环境|huán jìng (环境/Environment)", "自然|zì rán (自然/Nature)",
        "植物|zhí wù (植物/Plant)", "动物|dòng wù (动物/Animal)", "生长|shēng zhǎng (生长/Grow)", "气候|qì hòu (气候/Climate)", "温度|wēn dù (温度/Temperature)",
        "地区|dì qū (地区/Region)", "资源|zī yuán (资源/Resource)", "保护|bǎo hù (保护/Protect)", "医学|yī xué (医学/Medicine)", "健康|jiàn kāng (健康/Health)",
        "社会|shè huì (社会/Society)", "经济|jīng jì (经济/Economy)", "交通|jiāo tōng (交通/Traffic)", "教育|jiào yù (教育/Education)", "法律|fǎ lǜ (法律/Law)",
        "安全|ān quán (安全/Safety)", "责任|zé rèn (责任/Responsibility)", "权利|quán lì (权利/Right)", "义务|yì wù (义务/Duty)", "制度|zhì dù (制度/System)",
        "管理|guǎn lǐ (管理/Management)", "组织|zǔ zhī (组织/Organization)", "机构|jī gòu (机构/Institution)", "团体|tuán tǐ (团体/Group)", "活动|huó dòng (活动/Activity)",
        "过程|guò chéng (过程/Process)", "调查|diào chá (调查/Survey)", "分析|fēn xī (分析/Analysis)", "判断|pàn duàn (判断/Judge)", "探索|tàn suǒ (探索/Explore)",
        "建议|jiàn yì (建议/Suggestion)", "结论|jié lùn (结论/Conclusion)", "改善|gǎi shàn (改善/Improve)", "效率|xiào lǜ (效率/Efficiency)",
        
        // 251-300: Mapped to higher levels
        "体系|tǐ xì (体系/System)", "机制|jī zhì (机制/Mechanism)", "模式|mó shì (模式/Mode)", "理论|lǐ lùn (理论/Theory)", "假设|jiǎ shè (假设/Hypothesis)",
        "逻辑|luó ji (逻辑/Logic)", "概念|gài niàn (概念/Concept)", "要素|yào sù (要素/Element)", "构成|gòu chéng (构成/Constitute)", "公式|gōng shì (公式/Formula)",
        "数据|shù jù (数据/Data)", "参数|cān shù (参数/Parameter)", "变量|biàn liàng (变量/Variable)", "稳定性|wěn dìng xìng (稳定性/Stability)", "精准|jīng zhǔn (精准/Precise)",
        "复杂|fù zá (复杂/Complex)", "简化|jiǎn huà (简化/Simplify)", "预测|yù cè (预测/Predict)", "统计|tǒng jì (统计/Statistics)", "比例|bǐ lì (比例/Proportion)",
        "趋势|qū shì (趋势/Trend)", "效果|xiào guǒ (效果/Effect)", "质量|zhì liàng (质量/Quality)", "配置|pèi zhì (配置/Config)", "优化|yōu huà (优化/Optimize)",
        "稳态|wěn tài (稳态/Steady State)", "综合|zōng hé (综合/Comprehensive)", "分类|fēn lèi (分类/Classify)", "生成|shēng chéng (生成/Generate)", "分布|fēn bù (分布/Distribute)",
        "功率|gōng lǜ (功率/Power)", "强度|qiáng dù (强度/Strength)", "频率|pín lǜ (频率/Frequency)", "系数|xì shù (系数/Coefficient)", "阶段|jiē duàn (阶段/Stage)",
        "维度|wéi dù (维度/Dimension)", "结构性|jié gòu xìng (结构性/Structural)", "创新|chuàng xīn (创新/Innovation)", "执行|zhí xíng (执行/Execute)", "开发|kāi fā (开发/Develop)",
        "构想|gòu xiǎng (构想/Conceive)", "框架|kuāng jià (框架/Framework)", "标识|biāo zhì (标识/Mark)", "对称|duì chèn (对称/Symmetry)", "层次|céng cì (层次/Level)",
        "模拟|mó nǐ (模拟/Simulate)", "反馈|fǎn kuì (反馈/Feedback)", "迭代|dié dài (迭代/Iterate)", "稳固|wěn gù (稳固/Firm)", "系列|xì liè (系列/Series)",
    ];

    const list: Word[] = [];
    const questionsPerLevel = 10;
    
    for(let level = 1; level <= 40; level++) {
        const startIdx = (level - 1) * questionsPerLevel;
        for(let q = 0; q < questionsPerLevel; q++) {
            const rawIndex = (startIdx + q) % rawData.length; 
            const item = rawData[rawIndex];
            
            // NEW LOGIC: Split and keep the meaning part
            const [word, rest] = item.split('|');
            const meaning = rest || ""; 

            list.push({
                id: (level * 100) + q,
                word, 
                meaning,
                level: level
            });
        }
    }
    return list;
};

export const FULL_WORD_LIST = generateWordList();

export const getWordsForLevel = (level: number) => FULL_WORD_LIST.filter(w => w.level === level);

export const getRandomWords = (count: number, rangeStart = 1, rangeEnd = 40) => {
    const pool = FULL_WORD_LIST.filter(w => w.level >= rangeStart && w.level <= rangeEnd);
    return pool.sort(() => 0.5 - Math.random()).slice(0, count);
};

export const generateOptions = (targetWord: Word) => {
    const confusingGroup = ['他', '她', '它'];
    
    // 1. If target is in the group, exclude others in the group from distractors (prevent same-sound answers)
    let restrictedWords: string[] = [];
    if (confusingGroup.includes(targetWord.word)) {
        restrictedWords = confusingGroup.filter(w => w !== targetWord.word);
    }

    // 2. Get initial pool of candidates
    // Try to stay within level first
    let candidates = FULL_WORD_LIST.filter(w => 
        w.id !== targetWord.id && 
        w.level === targetWord.level &&
        !restrictedWords.includes(w.word)
    );

    // If the pool is small, expand to all words
    if(candidates.length < 3) {
       candidates = FULL_WORD_LIST.filter(w => 
           w.id !== targetWord.id &&
           !restrictedWords.includes(w.word)
       );
    }
    
    // Shuffle candidates
    candidates.sort(() => 0.5 - Math.random());
    
    const distractors: Word[] = [];
    let groupCountInDistractors = 0;

    for (const w of candidates) {
        if (distractors.length >= 3) break;

        // If the target wasn't in the group (so options might include group members),
        // we strictly limit how many group members appear in distractors to avoid "Three appearing together".
        // Limiting to 1 ensures diversity and avoids the specific user complaint.
        if (!confusingGroup.includes(targetWord.word) && confusingGroup.includes(w.word)) {
             if (groupCountInDistractors >= 1) continue;
             groupCountInDistractors++;
        }

        distractors.push(w);
    }

    return [...distractors, targetWord].sort(() => 0.5 - Math.random());
};
