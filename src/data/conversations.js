// Daily conversation scenes.
// sceneImage / speaker portrait are resolved from the offline manifest at render time
// (see src/utils/image-manifest.js). No network deps here.
const S = { emoji: '👦', key: 'boy' };
const G = { emoji: '👧', key: 'girl' };
const M = { emoji: '👩', key: 'mom' };
const D = { emoji: '👨', key: 'dad' };

export const conversations = [
  {
    id: 'greetings', name: 'Greetings', emoji: '👋',
    color: 'from-yellow-400 to-orange-500', bgColor: 'bg-yellow-100',
    dialogues: [
      { en: 'Hello!', translation: '你好！', speaker: S },
      { en: 'Hi there!', translation: '嗨！', speaker: G },
      { en: 'Good morning!', translation: '早上好！', speaker: S },
      { en: 'Good night!', translation: '晚安！', speaker: G },
      { en: 'How are you?', translation: '你好吗？', speaker: S },
      { en: "I'm fine, thank you!", translation: '我很好，谢谢！', speaker: G },
      { en: "What's your name?", translation: '你叫什么名字？', speaker: S },
      { en: 'My name is Tom.', translation: '我叫Tom。', speaker: G },
      { en: 'Nice to meet you!', translation: '很高兴认识你！', speaker: S },
      { en: 'Goodbye!', translation: '再见！', speaker: G },
    ],
  },
  {
    id: 'table', name: 'At the Table', emoji: '🍽️',
    color: 'from-orange-400 to-red-500', bgColor: 'bg-orange-100',
    dialogues: [
      { en: "I'm hungry.", translation: '我饿了。', speaker: S },
      { en: "Let's eat!", translation: '我们吃饭吧！', speaker: M },
      { en: 'I want some water.', translation: '我想要一些水。', speaker: G },
      { en: 'Here you are.', translation: '给你。', speaker: M },
      { en: 'Thank you!', translation: '谢谢你！', speaker: G },
      { en: 'Yummy!', translation: '好吃！', speaker: S },
      { en: "I don't like carrots.", translation: '我不喜欢胡萝卜。', speaker: S },
      { en: 'Eat your vegetables.', translation: '吃你的蔬菜。', speaker: D },
      { en: 'Can I have more?', translation: '我能再来点吗？', speaker: G },
      { en: "I'm full.", translation: '我吃饱了。', speaker: S },
    ],
  },
  {
    id: 'going-out', name: 'Going Out', emoji: '🎒',
    color: 'from-blue-400 to-cyan-500', bgColor: 'bg-blue-100',
    dialogues: [
      { en: 'Let me help you!', translation: '让我帮你！', speaker: S },
      { en: 'Put on your coat.', translation: '穿上你的外套。', speaker: M },
      { en: 'It is sunny today.', translation: '今天是晴天。', speaker: G },
      { en: 'Take your hat.', translation: '戴上你的帽子。', speaker: D },
      { en: "Let's go to the park!", translation: '我们去公园吧！', speaker: M },
      { en: 'Hooray! I love the park!', translation: '太棒了！我喜欢公园！', speaker: S },
      { en: 'Watch out for cars!', translation: '小心汽车！', speaker: D },
      { en: 'Hold my hand.', translation: '牵我的手。', speaker: M },
      { en: 'Can we play on the swings?', translation: '我们能玩秋千吗？', speaker: G },
      { en: 'Time to go home.', translation: '该回家了。', speaker: D },
    ],
  },
  {
    id: 'bedtime', name: 'Bedtime', emoji: '🌙',
    color: 'from-indigo-400 to-purple-500', bgColor: 'bg-indigo-100',
    dialogues: [
      { en: "It's time for bed.", translation: '该睡觉了。', speaker: M },
      { en: "I'm not sleepy.", translation: '我不困。', speaker: S },
      { en: 'Brush your teeth.', translation: '刷你的牙齿。', speaker: M },
      { en: 'Wash your face.', translation: '洗你的脸。', speaker: M },
      { en: 'Put on your pajamas.', translation: '穿上你的睡衣。', speaker: D },
      { en: 'Can you read me a story?', translation: '你能给我读个故事吗？', speaker: G },
      { en: 'Once upon a time...', translation: '从前...', speaker: D },
      { en: 'Good night, sweetie.', translation: '晚安，亲爱的。', speaker: M },
      { en: 'Sweet dreams!', translation: '做个好梦！', speaker: D },
      { en: 'Zzz...', translation: 'ZZZZ...', speaker: S },
    ],
  },
  {
    id: 'playtime', name: 'Playtime', emoji: '🎮',
    color: 'from-green-400 to-emerald-500', bgColor: 'bg-green-100',
    dialogues: [
      { en: "Let's play!", translation: '我们玩吧！', speaker: S },
      { en: 'What do you want to play?', translation: '你想玩什么？', speaker: G },
      { en: "Let's build blocks!", translation: '我们搭积木吧！', speaker: S },
      { en: 'I want to play with dolls.', translation: '我想玩娃娃。', speaker: G },
      { en: 'Can I play with you?', translation: '我能和你一起玩吗？', speaker: S },
      { en: "Sure! Let's share.", translation: '当然！我们一起分享。', speaker: G },
      { en: "It's my turn.", translation: '轮到我了。', speaker: S },
      { en: 'You win! Great job!', translation: '你赢了！太棒了！', speaker: G },
      { en: 'That was fun!', translation: '真好玩！', speaker: S },
      { en: "Let's play again!", translation: '我们再玩一次吧！', speaker: G },
    ],
  },
  {
    id: 'bathroom', name: 'Bathroom', emoji: '🛁',
    color: 'from-cyan-400 to-teal-500', bgColor: 'bg-cyan-100',
    dialogues: [
      { en: 'I need to go pee.', translation: '我要小便。', speaker: S },
      { en: 'Wash your hands.', translation: '洗你的手。', speaker: M },
      { en: 'Use the soap.', translation: '用肥皂。', speaker: M },
      { en: 'Wash behind your ears.', translation: '洗耳朵后面。', speaker: D },
      { en: 'Time for a bath!', translation: '该洗澡了！', speaker: M },
      { en: 'The water is warm.', translation: '水是温的。', speaker: G },
      { en: "Let's play with bubbles!", translation: '我们玩泡泡吧！', speaker: S },
      { en: "Don't splash water.", translation: '不要溅水。', speaker: D },
      { en: 'Dry yourself with the towel.', translation: '用毛巾擦干自己。', speaker: M },
      { en: 'All clean and fresh!', translation: '干干净净的！', speaker: G },
    ],
  },
  {
    id: 'feelings', name: 'Feelings', emoji: '😊',
    color: 'from-pink-400 to-rose-500', bgColor: 'bg-pink-100',
    dialogues: [
      { en: "I'm happy!", translation: '我很开心！', speaker: G },
      { en: "I'm sad.", translation: '我很伤心。', speaker: S },
      { en: "I'm angry!", translation: '我生气了！', speaker: S },
      { en: "I'm scared.", translation: '我害怕。', speaker: G },
      { en: "I'm tired.", translation: '我累了。', speaker: S },
      { en: "I'm excited!", translation: '我很兴奋！', speaker: G },
      { en: "Don't cry. It's okay.", translation: '不要哭。没事的。', speaker: M },
      { en: 'Are you okay?', translation: '你还好吗？', speaker: G },
      { en: 'Give me a hug.', translation: '给我一个拥抱。', speaker: S },
      { en: 'I love you!', translation: '我爱你！', speaker: M },
    ],
  },
];
