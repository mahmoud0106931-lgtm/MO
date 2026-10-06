import { Track } from '../types/music';

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'mo-rec-1328',
    title: '1328_260618',
    artist: 'My Recording',
    album: 'تسجيلات MO ميوزك الحية',
    badgeText: 'MO Music Recording',
    category: 'ريمكسات',
    duration: 4395, // 1:13:15
    coverSrc: '/src/assets/images/lark_recording_cover_1791098835773.jpg',
    accentColor: '#f97316', // Orange theme from image
    chapters: [
      {
        id: 'c1',
        title: 'مقدمة إيقاعية (Intro Beats)',
        artist: 'DJ Mix Master',
        startTime: 0,
        endTime: 840,
      },
      {
        id: 'c2',
        title: 'يا غايب عن عيوني',
        artist: 'فلكلور نغم',
        startTime: 840,
        endTime: 1720,
      },
      {
        id: 'c3',
        title: 'سهرانين للصبح (طرب رايق)',
        artist: 'فرقة السهر',
        startTime: 1720,
        endTime: 2650,
      },
      {
        id: 'c4',
        title: 'حلوة البدايات',
        artist: 'ألحان شرقية',
        startTime: 2650,
        endTime: 3510,
      },
      {
        id: 'c5',
        title: 'بنت الناس', // The exact highlighted chapter from user's image
        artist: 'جلسة طرب خاصة',
        startTime: 3510,
        endTime: 4180,
      },
      {
        id: 'c6',
        title: 'خاتمة النغم (Outro)',
        artist: 'MO Soundscape',
        startTime: 4180,
        endTime: 4395,
      },
    ],
    lyrics: [
      { time: 3510, text: 'بنت الناس الأصيلة يا سحر العيون' },
      { time: 3560, text: 'حيرتي قلبي في هواكِ والشوق جنون' },
      { time: 3620, text: 'يا ليل النغم غني لنا لحن الحبايب' },
      { time: 3680, text: 'والقمر شاهد على دمعة الغايب' },
      { time: 3740, text: 'ضحكتك فرحة تروي عطش السنين' },
      { time: 3779, text: 'بنت الناس.. فيكِ الوفا والزين' }, // 1:02:59
      { time: 3840, text: 'لو دار الزمان بعدك مالي حبيب' },
      { time: 3900, text: 'صوتك دوا يداوي القلب ويطيب' },
      { time: 3960, text: 'يا زينة البنات يا روح المكان' },
      { time: 4020, text: 'معاكِ ابتدى أجمل زمان' },
      { time: 4090, text: 'بنت الناس تسوى كل الغوالي' },
      { time: 4150, text: 'اسمك ينور عتمة الليالي' },
    ],
  },
  {
    id: 'arabic-tarab-session',
    title: 'يا مسافر وحدك - طرب أصيل',
    artist: 'محمد عبد الوهاب / فرقة النغم',
    album: 'روائع الطرب الكلاسيكي',
    badgeText: 'Classic Tarab',
    category: 'طرب',
    duration: 380, // 6:20
    coverSrc: '/src/assets/images/arabic_tarab_cover_1791098849071.jpg',
    accentColor: '#fb923c',
    chapters: [
      {
        id: 'tc1',
        title: 'مقدمة العود والقانون',
        artist: 'تخت شرقي أصيل',
        startTime: 0,
        endTime: 75,
      },
      {
        id: 'tc2',
        title: 'يا مسافر وحدك وفايتني',
        artist: 'محمد عبد الوهاب',
        startTime: 75,
        endTime: 210,
      },
      {
        id: 'tc3',
        title: 'تقاسيم كمان منفردة',
        artist: 'صولو كمان',
        startTime: 210,
        endTime: 295,
      },
      {
        id: 'tc4',
        title: 'الكوبليه الأخير والختام',
        artist: 'الكورال الشرقي',
        startTime: 295,
        endTime: 380,
      },
    ],
    lyrics: [
      { time: 0, text: '[تقاسيم عود وقانون استهلالية ساحرة]' },
      { time: 75, text: 'يا مسافر وحدك وفايتني' },
      { time: 105, text: 'ليه تبعد عني وتشغلني' },
      { time: 135, text: 'ودعني من غير ما تسلم' },
      { time: 165, text: 'وكفاية قلبي بيتألم' },
      { time: 210, text: '[صولو كمان شجي ومؤثر]' },
      { time: 295, text: 'خليك يا حبيبي معايا' },
      { time: 330, text: 'دا البعد نهاية هنايا' },
      { time: 360, text: 'يا مسافر وحدك وفايتني..' },
    ],
  },
  {
    id: 'acoustic-night-mix',
    title: 'سهرة عود وكمان - روقان ليلي',
    artist: 'أوتار الشرق',
    album: 'ألحان هادئة للمساء',
    badgeText: 'Acoustic Chill',
    category: 'هادئ',
    duration: 480, // 8:00
    coverSrc: '/src/assets/images/acoustic_night_cover_1791098860031.jpg',
    accentColor: '#38bdf8',
    chapters: [
      {
        id: 'nc1',
        title: 'همس الأوتار الهادئ',
        artist: 'عود نقي',
        startTime: 0,
        endTime: 140,
      },
      {
        id: 'nc2',
        title: 'دفء الناي الليلي',
        artist: 'صولو ناي صوفي',
        startTime: 140,
        endTime: 280,
      },
      {
        id: 'nc3',
        title: 'تناغم العود والبيانو',
        artist: 'مزيج شرقي غربي',
        startTime: 280,
        endTime: 480,
      },
    ],
    lyrics: [
      { time: 0, text: '[أنغام عود هادئة تلامس الوجدان]' },
      { time: 140, text: '[لحن ناي ساحر يحاكي هدوء الليل وسكونه]' },
      { time: 280, text: '[مقطوعة تناغمية تجمع أصالة الشرق بنعومة البيانو]' },
    ],
  },
];
