/* C1 Climb — listening passages. Spoken-style English with contractions so linking and reduction occur in TTS. */
window.C1_LISTEN = [
  {
    id: 'l01', title: 'A Word About Your Report', topic: '仕事', level: 'C1', lv: 'C1',
    sentences: [
      "I've been meaning to bring this up for a while.",
      "The report itself wasn't bad, but it didn't really answer the question the client was asking.",
      "If I were you, I'd have opened with the recommendation and left the background for later.",
      "It's not a big deal, but it's the kind of thing that'll matter more as you take on bigger accounts."
    ],
    ja: '前から話そうと思っていたんだけど。報告書そのものは悪くなかったけれど、クライアントが尋ねていた問いにはあまり答えていなかった。私だったら、まず提案を冒頭に置いて、背景は後に回したと思う。大した問題ではないけれど、もっと大きな顧客を担当するようになると、こういう点がより重要になってくるよ。',
    notes: [
      { phrase: "I've been meaning to ...", ja: '前から〜しようと思っていた' },
      { phrase: 'bring something up', ja: '（話題を）持ち出す' },
      { phrase: 'take on bigger accounts', ja: 'より大きな顧客を引き受ける' }
    ],
    q: {
      question: "What is the speaker's main criticism of the report?",
      options: [
        'It was too long and badly written.',
        "It didn't address what the client actually wanted to know.",
        'It was handed in after the deadline.',
        'It left out the background information.'
      ],
      answer: 1,
      why: '「クライアントが尋ねていた問いに答えていなかった」が核心です。背景は「後に回すべき」と言っているだけで、欠けていたわけではありません。'
    }
  },
  {
    id: 'l02', title: 'Turning Off Notifications', topic: 'テクノロジー', level: 'B2+', lv: 'C1',
    sentences: [
      "I finally turned off almost all of my notifications last month, and honestly, I should've done it years ago.",
      "It's not that I was getting anything urgent.",
      "It's that every little buzz pulled me out of whatever I was doing.",
      "What surprised me was how long it took to stop reaching for my phone anyway."
    ],
    ja: '先月ようやく通知をほとんど全部オフにしたのですが、正直、何年も前にやっておくべきでした。緊急の連絡が来ていたわけではないんです。小さな振動のたびに、そのときやっていたことから引き離されていたのが問題でした。驚いたのは、それでもスマホに手を伸ばす癖が抜けるまでにずいぶん時間がかかったことです。',
    notes: [
      { phrase: "I should've done it years ago", ja: '何年も前にやっておくべきだった' },
      { phrase: "It's not that ... It's that ...", ja: '〜というわけではなく、〜なのだ' },
      { phrase: 'reach for my phone', ja: 'スマホに手を伸ばす' }
    ],
    q: {
      question: 'What does the speaker imply in the last sentence?',
      options: [
        'The habit of checking the phone continued even without notifications.',
        'Turning notifications off took a long time to set up.',
        'They turned the notifications back on after a while.',
        'They missed several urgent messages.'
      ],
      answer: 0,
      why: '「anyway（それでも）」がポイント。通知が鳴らなくなっても、手を伸ばす習慣はしばらく残ったという含みです。'
    }
  },
  {
    id: 'l03', title: 'Leaving the City?', topic: '社会', level: 'C1', lv: 'C1',
    sentences: [
      "There's been a lot of talk about people leaving big cities now that they can work from anywhere.",
      "But when you look at the numbers, most of them haven't gone very far.",
      "They've moved out to the suburbs, not to some cabin in the mountains.",
      "So it's less of an escape from the city and more of a stretching of it."
    ],
    ja: 'どこからでも働けるようになって、人々が大都市を離れているという話をよく聞きます。しかし数字を見てみると、ほとんどの人はそれほど遠くへは行っていません。移った先は郊外であって、山奥の小屋などではないのです。つまり、都市からの脱出というより、都市が外へ引き伸ばされていると言ったほうが近いでしょう。',
    notes: [
      { phrase: "There's been a lot of talk about ...", ja: '〜がよく話題になっている' },
      { phrase: 'now that ...', ja: '今や〜なので' },
      { phrase: 'less of A and more of B', ja: 'AというよりむしろB' }
    ],
    q: {
      question: "What is the speaker's main point?",
      options: [
        'Remote work has emptied the big cities.',
        'People are moving to the mountains in large numbers.',
        'People have mostly moved just outside cities, so cities are spreading rather than shrinking.',
        'The statistics about remote work cannot be trusted.'
      ],
      answer: 2,
      why: '最後の文「escape ではなく stretching」が結論。郊外への移動は都市圏の拡大だという主張です。'
    }
  },
  {
    id: 'l04', title: 'What Sleep Does', topic: '科学', level: 'C1', lv: 'C1',
    sentences: [
      "We used to think of sleep as the brain simply switching off for the night.",
      "It turns out that's about as far from the truth as you can get.",
      "While you're asleep, your brain is busy sorting through the day, deciding what to keep and what to throw out.",
      "So when you stay up all night before an exam, you're actually getting in the way of the very process you need."
    ],
    ja: '以前は、睡眠とは脳が夜のあいだ単にスイッチを切ることだと考えられていました。ところが、それは真実からこれ以上ないほどかけ離れていることがわかっています。眠っているあいだ、脳は一日の出来事を整理し、何を残して何を捨てるかを決めるのに忙しく働いています。ですから試験前に徹夜をすると、まさに必要としているその過程を自分で邪魔していることになるのです。',
    notes: [
      { phrase: 'It turns out (that) ...', ja: '実は〜だとわかっている' },
      { phrase: 'about as far from the truth as you can get', ja: '真実から最もかけ離れている' },
      { phrase: 'get in the way of ...', ja: '〜の邪魔をする' }
    ],
    q: {
      question: 'Why does the speaker mention staying up before an exam?',
      options: [
        'To recommend studying late at night.',
        'To show that students need less sleep than adults.',
        'To explain why exams should be held in the afternoon.',
        'To show that skipping sleep blocks the memory sorting that learning depends on.'
      ],
      answer: 3,
      why: '睡眠中に記憶が整理されるので、徹夜は「必要な過程そのもの」を妨げるという例として挙げています。'
    }
  },
  {
    id: 'l05', title: 'Subtitles or Dubbing', topic: '文化', level: 'B2+', lv: 'C1',
    sentences: [
      "I used to be a bit of a snob about subtitles, to be honest.",
      "I thought watching a dubbed film was kind of cheating.",
      "Then a friend of mine pointed out that when you're reading, you're not really looking at the actors' faces.",
      "Now I'm not so sure there's a right way to do it at all."
    ],
    ja: '正直に言うと、以前の私は字幕についてちょっと気取った考えを持っていました。吹き替えで映画を観るのは、どこかずるいことのように思っていたんです。ところが友人に、字幕を読んでいるあいだは俳優の顔をあまり見ていないよね、と指摘されました。今では、そもそも正しい観方などあるのかどうか、あまり自信がありません。',
    notes: [
      { phrase: 'a bit of a snob about ...', ja: '〜についてちょっと気取っている' },
      { phrase: 'point out (that) ...', ja: '〜だと指摘する' },
      { phrase: "I'm not so sure ...", ja: '〜かどうかあまり確信がない' }
    ],
    q: {
      question: "How has the speaker's view changed?",
      options: [
        'They now believe dubbing is clearly better.',
        'They no longer think subtitles are the only proper way to watch.',
        'They have stopped watching foreign films.',
        'They think their friend was wrong.'
      ],
      answer: 1,
      why: '「正しい観方があるのか自信がない」＝字幕が唯一の正解だという以前の考えを手放した、ということです。吹き替えが上だとは言っていません。'
    }
  },
  {
    id: 'l06', title: 'The Cost of Cooking', topic: '日常の意見', level: 'B2+', lv: 'C1',
    sentences: [
      "People keep telling me that cooking at home saves you a fortune, and I'm sure it does if you know what you're doing.",
      "The trouble is, I end up buying a dozen ingredients for one recipe and then letting half of them go off in the fridge.",
      "By the time I've added it all up, I might as well have eaten out."
    ],
    ja: '自炊すればものすごく節約になると、みんなが私に言います。やり方がわかっている人なら、きっとそうなのでしょう。困ったことに、私の場合は一つのレシピのために材料を十いくつも買って、その半分を冷蔵庫でだめにしてしまうんです。全部合計してみると、外食したのと変わらなかったということになります。',
    notes: [
      { phrase: 'save (you) a fortune', ja: '大きな節約になる' },
      { phrase: 'go off', ja: '（食べ物が）傷む・腐る' },
      { phrase: 'might as well have + 過去分詞', ja: '〜したのと同じだった' }
    ],
    q: {
      question: 'What does the speaker mean by "I might as well have eaten out"?',
      options: [
        'Eating out is always cheaper than cooking.',
        'They plan to eat out more often from now on.',
        'Because of the waste, cooking ends up costing them about as much as a restaurant.',
        'They regret not learning how to cook.'
      ],
      answer: 2,
      why: 'might as well have ... は「〜したも同然だった」。材料を無駄にするので、結局外食と同じくらいかかるという意味です。'
    }
  },
  {
    id: 'l07', title: 'The Concert Ticket', topic: '講義', level: 'C1', lv: 'C1',
    sentences: [
      "Let's say you've paid for a concert ticket, and on the night it's pouring with rain and you're exhausted.",
      "Most people will drag themselves there anyway, because they don't want the money to go to waste.",
      "But the money's gone whether you turn up or not.",
      "What we're looking at here is called the sunk cost fallacy, and once you've spotted it, you'll start seeing it everywhere."
    ],
    ja: 'たとえばコンサートのチケット代をすでに払っていて、当日の夜は土砂降りで、しかもあなたは疲れ切っているとしましょう。たいていの人は、お金を無駄にしたくないので、それでも無理をして出かけます。しかし、行っても行かなくても、お金はもう戻ってきません。ここで見ているのは「サンクコストの誤謬」と呼ばれるもので、一度気づくと、あらゆるところで目につくようになります。',
    notes: [
      { phrase: 'drag oneself (there)', ja: '重い体を引きずって行く' },
      { phrase: 'go to waste', ja: '無駄になる' },
      { phrase: 'turn up', ja: '姿を見せる・来る' }
    ],
    q: {
      question: 'According to the lecturer, why is going to the concert anyway a mistake in reasoning?',
      options: [
        'The money is already spent, so it should not affect the decision.',
        'Concerts are rarely worth the price.',
        'Bad weather makes concerts dangerous.',
        'Tickets can usually be refunded.'
      ],
      answer: 0,
      why: '「行っても行かなくてもお金は戻らない」。すでに払った費用は今後の判断材料にすべきでない、というのがサンクコストの誤謬の要点です。'
    }
  },
  {
    id: 'l08', title: 'Why Plans Fall Apart', topic: 'ポッドキャスト', level: 'C1', lv: 'C1',
    sentences: [
      "So today I want to talk about why most of our big plans fall apart by February.",
      "And I don't think it's got much to do with willpower, actually.",
      "What tends to happen is that we set the bar so high that missing a single day feels like failure.",
      "If you'd started with five minutes a day, you'd probably still be at it."
    ],
    ja: 'さて今日は、私たちの大きな計画のほとんどが、なぜ二月までに崩れてしまうのかについてお話ししたいと思います。実のところ、意志の力とはあまり関係がないと私は考えています。よく起こるのは、ハードルを高く設定しすぎて、たった一日できなかっただけで失敗したように感じてしまうことです。もし一日五分から始めていたら、おそらく今も続いていたでしょう。',
    notes: [
      { phrase: 'fall apart', ja: '崩れる・だめになる' },
      { phrase: "it's got much to do with ...", ja: '〜と大いに関係がある' },
      { phrase: 'set the bar high', ja: 'ハードルを高く設定する' }
    ],
    q: {
      question: 'What does the speaker see as the real reason plans fail?',
      options: [
        'People are lazy and lack willpower.',
        'February is the busiest month of the year.',
        'Five minutes a day is not enough to change anything.',
        'The goals are so ambitious that one slip feels like total failure.'
      ],
      answer: 3,
      why: '意志力の問題ではないと明言し、「ハードルが高すぎて一日の失敗が挫折に感じられる」ことを原因として挙げています。'
    }
  },
  {
    id: 'l09', title: 'About the Timeline', topic: '会議', level: 'C1', lv: 'C1',
    sentences: [
      "Can I just jump in here for a second?",
      "I'm not against the new timeline as such, but I think we're underestimating how long the testing is going to take.",
      "Last time we cut it short, we ended up spending twice as long fixing things after the launch.",
      "I'd rather we were honest about that now than have to explain it to the client later."
    ],
    ja: 'ちょっとだけ口を挟んでもいいですか。新しいスケジュールそのものに反対しているわけではないのですが、テストにかかる時間を甘く見積もっていると思います。前回テストを切り詰めたときは、リリース後の修正に結局二倍の時間がかかりました。あとでクライアントに説明する羽目になるより、今の時点で正直に認めておきたいのです。',
    notes: [
      { phrase: 'jump in', ja: '（会話に）割って入る' },
      { phrase: 'not ... as such', ja: '〜そのものが…というわけではない' },
      { phrase: "I'd rather we + 過去形", ja: '（私たちが）〜するほうがいいと思う' }
    ],
    q: {
      question: 'What is the speaker really asking the team to do?',
      options: [
        'Cancel the project altogether.',
        'Build realistic testing time into the schedule now.',
        'Skip testing in order to meet the deadline.',
        'Let the client decide the timeline.'
      ],
      answer: 1,
      why: 'スケジュール自体には反対せず、テスト期間の見積もりが甘い点を今のうちに正直に見直そうと提案しています。'
    }
  },
  {
    id: 'l10', title: 'Handing In My Notice', topic: '仕事', level: 'C1', lv: 'C1',
    sentences: [
      "I'd been at the same company for twelve years when I decided to hand in my notice.",
      "Everyone thought I'd lost my mind, and to be fair, there were days when I thought so too.",
      "But I'd got to the point where I could do the job in my sleep, and that scared me more than starting over."
    ],
    ja: '退職届を出そうと決めたとき、私は同じ会社に十二年勤めていました。誰もが私はどうかしてしまったと思いましたし、公平に言えば、自分でもそう思う日がありました。けれども、眠っていてもできるくらい仕事に慣れきってしまっていて、そのことのほうが、一からやり直すことよりも怖かったのです。',
    notes: [
      { phrase: 'hand in my notice', ja: '退職届を出す' },
      { phrase: 'to be fair', ja: '公平に言えば・正直なところ' },
      { phrase: 'could do it in my sleep', ja: '眠っていてもできる（ほど慣れている）' }
    ],
    q: {
      question: 'Why did the speaker leave the job?',
      options: [
        'They were asked to leave by the company.',
        'They were exhausted from overwork.',
        'The job had become so easy that the lack of challenge frightened them.',
        'They had found a better-paid position.'
      ],
      answer: 2,
      why: '「in my sleep でできる」＝刺激も成長もない状態。それがやり直すことより怖かった、というのが理由です。'
    }
  },
  {
    id: 'l11', title: 'Explaining It Out Loud', topic: 'テクノロジー', level: 'C1', lv: 'C1',
    sentences: [
      "A lot of my students are using AI to help them write, and I've stopped pretending I can do anything about it.",
      "What I've started doing instead is asking them to explain their essays out loud.",
      "You can tell within about a minute whether they've actually thought it through.",
      "Funnily enough, the ones who use it well tend to be the ones who didn't need it in the first place."
    ],
    ja: '私の学生の多くは、文章を書くのにAIを使っています。それをどうにかできるふりをするのは、もうやめました。代わりに始めたのは、自分の小論文を口頭で説明してもらうことです。本当に考え抜いたかどうかは、一分ほどでわかります。面白いことに、AIをうまく使う学生は、そもそもAIを必要としていなかった学生であることが多いのです。',
    notes: [
      { phrase: 'think something through', ja: '〜を最後まで考え抜く' },
      { phrase: 'funnily enough', ja: '面白いことに・妙な話だが' },
      { phrase: 'in the first place', ja: 'そもそも' }
    ],
    q: {
      question: 'What does the last sentence suggest?',
      options: [
        'Students who already think and write well get the most out of AI.',
        'AI makes weak students into strong writers.',
        'Good students refuse to use AI.',
        'The teacher wants to ban AI in class.'
      ],
      answer: 0,
      why: '「うまく使うのは、もともと必要なかった学生」＝すでに力のある学生ほどAIを活かせる、という皮肉な観察です。'
    }
  },
  {
    id: 'l12', title: 'The Last Bookshop', topic: '社会', level: 'C1', lv: 'C1',
    sentences: [
      "When the last bookshop in our town closed down, nobody was all that surprised.",
      "We'd all been ordering online for years, after all.",
      "What we hadn't thought about was that it was one of the few places where you'd bump into people without having planned to.",
      "You can't really put a price on that, and you certainly can't get it delivered."
    ],
    ja: '町で最後の本屋が閉店したとき、それほど驚いた人はいませんでした。なにしろ、みんな何年も前からネットで注文していたのですから。私たちが考えていなかったのは、そこが、約束もなしに人とばったり会える数少ない場所の一つだったということです。そういうものに値段はつけられませんし、もちろん配達してもらうこともできません。',
    notes: [
      { phrase: 'not all that surprised', ja: 'それほど驚いていない' },
      { phrase: 'bump into someone', ja: '（人に）ばったり会う' },
      { phrase: "can't put a price on ...", ja: '〜には値段をつけられない' }
    ],
    q: {
      question: 'What did the town lose, according to the speaker?',
      options: [
        'The only place to buy books cheaply.',
        'A major local employer.',
        'A popular tourist attraction.',
        'A place for unplanned, everyday contact between people.'
      ],
      answer: 3,
      why: '本そのものはネットで買えるが、「偶然人に会える場」は配達できない、というのが話の核心です。'
    }
  },
  {
    id: 'l13', title: 'Honest Placebos', topic: '科学', level: 'C1', lv: 'C1',
    sentences: [
      "One of the odd things about placebos is that they can work even when people know they're taking one.",
      "You'd think that would defeat the whole point, wouldn't you?",
      "But in a number of studies, patients who were told outright that the pills had nothing in them still reported feeling better.",
      "It suggests that the ritual of being treated might matter as much as what's in the treatment."
    ],
    ja: 'プラセボの不思議な点の一つは、本人がプラセボだと知っていても効くことがある、ということです。それでは意味がなくなってしまうと思いますよね。ところがいくつもの研究で、錠剤には何も入っていないとはっきり告げられた患者が、それでも体調がよくなったと報告しています。これは、治療を受けるという儀式そのものが、治療の中身と同じくらい重要かもしれないことを示唆しています。',
    notes: [
      { phrase: 'defeat the whole point', ja: '本来の意味を台無しにする' },
      { phrase: 'be told outright', ja: 'はっきりと告げられる' },
      { phrase: 'matter as much as ...', ja: '〜と同じくらい重要である' }
    ],
    q: {
      question: 'What conclusion does the speaker draw from the studies?',
      options: [
        'Placebos only work when patients are deceived.',
        'The experience of receiving care may itself help people feel better.',
        'Doctors should stop prescribing real medicine.',
        'The patients in the studies were not telling the truth.'
      ],
      answer: 1,
      why: '最後の文の「治療を受けるという儀式が中身と同じくらい重要かもしれない」が結論です。'
    }
  },
  {
    id: 'l14', title: 'Phones in the Gallery', topic: '文化', level: 'C1', lv: 'C1',
    sentences: [
      "I was at a gallery the other day, and I couldn't help noticing how many people were looking at the paintings through their phones.",
      "My first reaction was to roll my eyes, I'll admit.",
      "But then I thought, well, who am I to say how someone else ought to enjoy a picture?",
      "If anything, it's the ones who walk straight past that we should be worried about."
    ],
    ja: '先日美術館に行ったのですが、スマホ越しに絵を見ている人があまりに多いことに、どうしても目が行ってしまいました。正直、最初はあきれて目を回しそうになりました。でもそのあとで思ったんです。他人が絵をどう楽しむべきかなんて、私が口を出すことだろうか、と。むしろ心配すべきなのは、足も止めずに素通りしていく人たちのほうでしょう。',
    notes: [
      { phrase: "couldn't help noticing", ja: '気づかずにはいられなかった' },
      { phrase: 'roll my eyes', ja: '（あきれて）目を回す' },
      { phrase: 'who am I to say ...?', ja: '私が〜と言える立場だろうか' }
    ],
    q: {
      question: "What is the speaker's final attitude towards people photographing the paintings?",
      options: [
        'They should be banned from galleries.',
        'They are ruining the experience for everyone else.',
        'They are at least engaging with the art, which is better than ignoring it.',
        'They understand art better than other visitors.'
      ],
      answer: 2,
      why: '最初はあきれたが考え直し、「素通りする人のほうが問題」と述べています。写真を撮る人は少なくとも絵に関心を向けている、という含みです。'
    }
  },
  {
    id: 'l15', title: 'Busy as a Badge', topic: '日常の意見', level: 'C1', lv: 'C1',
    sentences: [
      "Have you noticed how being busy has turned into a kind of status symbol?",
      "You ask someone how they're doing and they tell you they're swamped, almost as if they're proud of it.",
      "I've caught myself doing it too, even in weeks when there wasn't that much going on.",
      "I suspect what we're really saying is that we want to feel needed."
    ],
    ja: '忙しいことが一種のステータスシンボルになっているのに気づいていますか。調子はどうかと尋ねると、相手は仕事に追われていると答えます。まるでそれを誇りに思っているかのようです。私自身も、それほど予定のなかった週でさえ、同じことをしているのに気づくことがあります。私たちが本当に言いたいのは、自分は必要とされていると感じたい、ということなのではないでしょうか。',
    notes: [
      { phrase: 'be swamped', ja: '（仕事などに）追われている' },
      { phrase: 'catch myself doing', ja: '自分が〜しているのにふと気づく' },
      { phrase: "there wasn't that much going on", ja: 'それほど用事があったわけではない' }
    ],
    q: {
      question: 'According to the speaker, what are people really expressing when they say they are busy?',
      options: [
        'A wish to feel important to others.',
        'A request for help with their work.',
        'A complaint about their employer.',
        'A plan to take time off.'
      ],
      answer: 0,
      why: '「必要とされていると感じたい」という欲求の表れだ、と最後の文で推測しています。'
    }
  },
  {
    id: 'l16', title: 'Ruining the Language', topic: '講義', level: 'C1', lv: 'C1',
    sentences: [
      "Every generation seems to be convinced that young people are ruining the language.",
      "If you go back a couple of hundred years, you'll find writers complaining about words we now think of as perfectly respectable.",
      "Languages don't decay, they just change, and they always have done.",
      "So the next time a new expression gets on your nerves, bear in mind that your grandchildren will probably consider it old-fashioned."
    ],
    ja: 'どの世代も、若者が言葉をだめにしていると信じ込んでいるようです。二百年ほどさかのぼると、今ではまったくまともだと考えられている単語について、作家たちが苦情を述べているのが見つかります。言語は衰えるのではなく、ただ変化するのであり、昔からずっとそうでした。ですから、次に新しい表現が気に障ったときは、あなたの孫の世代はおそらくそれを古くさいと思うだろう、ということを心に留めておいてください。',
    notes: [
      { phrase: 'be convinced that ...', ja: '〜だと思い込んでいる' },
      { phrase: 'get on your nerves', ja: '気に障る・いらいらさせる' },
      { phrase: 'bear in mind (that) ...', ja: '〜を心に留めておく' }
    ],
    q: {
      question: "What is the lecturer's main argument?",
      options: [
        'Young people today speak worse than earlier generations.',
        'Writers should protect the language from new words.',
        'Old-fashioned expressions deserve to be brought back.',
        'Complaints about new usage are as old as language, and change is normal.'
      ],
      answer: 3,
      why: '「言語は衰えず、変化するだけ」。新しい表現への不満はいつの時代にもあった、というのが主張です。'
    }
  },
  {
    id: 'l17', title: 'Money and Happiness', topic: 'ポッドキャスト', level: 'B2+', lv: 'C1',
    sentences: [
      "Last week we were talking about whether money can buy happiness, and a lot of you wrote in to say that of course it can.",
      "I'd agree up to a point.",
      "It's pretty hard to be happy when you're lying awake wondering how you're going to pay the rent.",
      "But beyond that, it seems to depend much more on what you spend it on than on how much you've got."
    ],
    ja: '先週は、お金で幸せは買えるのかという話をしましたが、もちろん買えるというお便りをたくさんいただきました。ある程度までは私も同感です。家賃をどう払おうかと考えて眠れずにいるときに、幸せでいるのはかなり難しいですから。しかしそこから先は、いくら持っているかよりも、何に使うかのほうにずっと大きく左右されるようです。',
    notes: [
      { phrase: 'write in', ja: '（番組などに）投書する' },
      { phrase: 'up to a point', ja: 'ある程度までは' },
      { phrase: 'lie awake wondering ...', ja: '〜を考えて眠れずにいる' }
    ],
    q: {
      question: "What is the speaker's position?",
      options: [
        'Money has nothing to do with happiness.',
        'Money matters for basic security, but after that how you use it matters more.',
        'The more money you have, the happier you become.',
        'The listeners who wrote in were completely wrong.'
      ],
      answer: 1,
      why: '「up to a point（ある程度までは）」賛成し、その先は金額より使い道が重要だ、という二段構えの立場です。'
    }
  },
  {
    id: 'l18', title: 'Who Is Complaining?', topic: '会議', level: 'C1', lv: 'C1',
    sentences: [
      "Before we move on, I'd like to go back to something Maria said earlier.",
      "She mentioned that most of the complaints are coming from customers who've been with us the longest.",
      "If that's the case, then offering discounts to new sign-ups isn't going to solve anything.",
      "We ought to be finding out what's changed for the people who used to be happy."
    ],
    ja: '次に進む前に、先ほどマリアさんが言ったことに戻らせてください。苦情の大半は、最も長く利用してくれているお客様から来ている、という話でした。もしそうだとすれば、新規登録者に割引を提供しても何の解決にもなりません。以前は満足していた人たちにとって何が変わったのかを、私たちは突き止めるべきです。',
    notes: [
      { phrase: "I'd like to go back to ...", ja: '〜の話に戻りたいのですが' },
      { phrase: "If that's the case, ...", ja: 'もしそうだとすれば' },
      { phrase: 'ought to be doing', ja: '〜しているべきだ' }
    ],
    q: {
      question: 'What is the speaker implying about the discount plan?',
      options: [
        'It should be extended to more new customers.',
        'It is too expensive for the company.',
        'It targets the wrong group, because the unhappy customers are the long-standing ones.',
        'It was originally Maria’s idea.'
      ],
      answer: 2,
      why: '不満を抱えているのは長年の顧客なので、新規向け割引は的外れだという含みです。'
    }
  },
  {
    id: 'l19', title: 'A Third of My Week', topic: '仕事', level: 'B2+', lv: 'C1',
    sentences: [
      "I worked out the other day that I spend about a third of my week in meetings.",
      "Some of them are useful, don't get me wrong.",
      "But quite a few could've been dealt with in a two-line email, and I think everyone in the room knows it.",
      "Nobody wants to be the one to say so, though, so we all just keep turning up."
    ],
    ja: '先日計算してみたら、一週間のおよそ三分の一を会議に費やしていることがわかりました。誤解しないでほしいのですが、役に立つ会議もあります。でも、二行のメールで済んだはずのものもかなりあって、その場にいる全員がそれをわかっていると思います。それでも、言い出す役にはだれもなりたくないので、みんなただ出席し続けているのです。',
    notes: [
      { phrase: 'work out (that) ...', ja: '計算して〜だとわかる' },
      { phrase: "don't get me wrong", ja: '誤解しないでほしいのですが' },
      { phrase: "could've been dealt with", ja: '処理できたはずだ' }
    ],
    q: {
      question: 'Why do the unnecessary meetings continue, according to the speaker?',
      options: [
        'Nobody is willing to say openly that they are pointless.',
        'The manager insists on holding them.',
        'People enjoy the chance to chat.',
        'Emails are often ignored.'
      ],
      answer: 0,
      why: '全員が無駄だとわかっていても、「それを口にする役」を誰も引き受けたくないから続いている、と述べています。'
    }
  },
  {
    id: 'l20', title: 'The Smart House', topic: 'テクノロジー', level: 'B2+', lv: 'C1',
    sentences: [
      "My brother-in-law has wired up his entire house so he can control it all from his phone.",
      "It's all very impressive until the internet goes down, at which point he can't switch anything on.",
      "I'm all for making life easier, but I do wonder whether we're solving problems we never actually had."
    ],
    ja: '義理の兄は、家じゅうを配線して、すべてをスマホから操作できるようにしました。確かにすごいのですが、それもネットが落ちるまでの話で、そうなると彼は何ひとつスイッチを入れられません。生活を便利にすることには大賛成ですが、私たちはそもそも存在しなかった問題を解決しているのではないか、とつい考えてしまいます。',
    notes: [
      { phrase: 'at which point ...', ja: 'その時点で〜' },
      { phrase: "I'm all for ...", ja: '〜には大賛成だ' },
      { phrase: 'I do wonder whether ...', ja: '〜ではないかと本当に思う' }
    ],
    q: {
      question: "What is the speaker's attitude towards the smart home?",
      options: [
        'Enthusiastic and keen to install one.',
        'Angry at the brother-in-law for wasting money.',
        'Worried mainly about privacy.',
        'Doubtful that it meets any real need.'
      ],
      answer: 3,
      why: '「もともとなかった問題を解決しているのでは」という懐疑的な態度です。便利さ自体は否定していません。'
    }
  },
  {
    id: 'l21', title: 'Giving Up the Daily News', topic: '社会', level: 'B2+', lv: 'C1',
    sentences: [
      "I've more or less given up on following the news every day.",
      "It's not that I don't care what's going on in the world.",
      "It's just that most of what I was reading left me feeling anxious without making me any better informed.",
      "These days I catch up once a week, and I can't say I've missed anything that really mattered."
    ],
    ja: '毎日ニュースを追うのは、ほぼやめてしまいました。世の中で何が起きているかに関心がないわけではありません。ただ、読んでいたものの大半は、私を不安にさせるだけで、知識を少しも増やしてくれなかったのです。最近は週に一度まとめて目を通していますが、本当に重要なことを見逃したとは思いません。',
    notes: [
      { phrase: 'more or less', ja: 'ほぼ・だいたい' },
      { phrase: 'leave someone feeling ...', ja: '（人を）〜な気持ちにさせる' },
      { phrase: 'catch up', ja: '遅れを取り戻す・まとめて追いつく' }
    ],
    q: {
      question: 'Why did the speaker stop following the news daily?',
      options: [
        'They lost interest in world events.',
        'It caused worry without adding real understanding.',
        'They no longer trust journalists.',
        'They are too busy at work.'
      ],
      answer: 1,
      why: '関心を失ったのではなく、「不安になるだけで理解は深まらなかった」ことが理由だと述べています。'
    }
  },
  {
    id: 'l22', title: 'Thirty Percent Chance of Rain', topic: '科学', level: 'C1', lv: 'C1',
    sentences: [
      "When the forecast says there's a thirty percent chance of rain, most of us aren't quite sure what that means.",
      "It doesn't mean it'll rain for a third of the day, or over a third of the area.",
      "What it's telling you is that on days like this one, it rained roughly three times out of ten.",
      "So if you get wet, the forecast wasn't wrong, you were just unlucky."
    ],
    ja: '予報で降水確率が三十パーセントだと言われても、それが何を意味するのか、ほとんどの人はよくわかっていません。一日の三分の一のあいだ雨が降るという意味でも、地域の三分の一で降るという意味でもありません。今日のような条件の日には、十回のうちおよそ三回雨が降った、ということを伝えているのです。ですから、もし濡れたとしても、予報が外れたのではなく、あなたの運が悪かっただけです。',
    notes: [
      { phrase: "aren't quite sure", ja: 'あまりよくわかっていない' },
      { phrase: 'three times out of ten', ja: '十回のうち三回' },
      { phrase: 'get wet', ja: '（雨に）濡れる' }
    ],
    q: {
      question: 'What does a thirty percent chance of rain mean, according to the speaker?',
      options: [
        'It will rain for about a third of the day.',
        'Rain will fall on about a third of the region.',
        'In similar conditions, it has rained about three days in ten.',
        'The forecast is correct only thirty percent of the time.'
      ],
      answer: 2,
      why: '「今日のような日には十回中およそ三回降った」という頻度の意味です。時間や面積の割合ではないと明確に否定しています。'
    }
  },
  {
    id: 'l23', title: 'When Trips Go Wrong', topic: '文化', level: 'C1', lv: 'C1',
    sentences: [
      "I've come to think that the best trips are the ones where something goes slightly wrong.",
      "Nobody ever tells stories about the hotel that was exactly as advertised.",
      "It's the missed train, or the restaurant you stumbled into because everywhere else was shut, that you end up remembering.",
      "That's not to say you shouldn't plan, only that you should leave room for things to fall through."
    ],
    ja: '最高の旅とは、何かが少しだけうまくいかなかった旅だと思うようになりました。広告どおりだったホテルの話をする人など、だれもいません。結局記憶に残るのは、乗り遅れた電車や、ほかがどこも閉まっていたのでたまたま入ったレストランのほうなのです。計画を立てるなと言っているのではありません。ただ、予定が流れる余地を残しておくべきだ、ということです。',
    notes: [
      { phrase: "I've come to think (that) ...", ja: '〜だと思うようになった' },
      { phrase: 'stumble into ...', ja: '〜に偶然入り込む' },
      { phrase: "That's not to say ...", ja: '〜と言っているわけではない' }
    ],
    q: {
      question: 'What advice is the speaker giving about travel?',
      options: [
        'Do not bother planning at all.',
        'Always book the hotel with the best reviews.',
        'Avoid trains whenever possible.',
        'Plan, but leave space for the unexpected.'
      ],
      answer: 3,
      why: '最後の文で「計画するなという意味ではなく、予定が崩れる余地を残せ」と明確に述べています。'
    }
  },
  {
    id: 'l24', title: 'The Point of Small Talk', topic: '日常の意見', level: 'C1', lv: 'C1',
    sentences: [
      "I used to dread small talk, and I'd do almost anything to get out of it.",
      "Then it dawned on me that it isn't really about the weather or the weekend at all.",
      "It's a way of letting the other person know you're not a threat and you've got time for them.",
      "Once I'd figured that out, it stopped feeling quite so pointless."
    ],
    ja: '以前の私は世間話が苦痛で、それを避けるためならほとんど何でもしたものです。あるとき、世間話は実は天気や週末の話などではまったくないのだと、ふと気づきました。それは、自分が脅威ではなく、相手のために時間を割く気があることを伝える手段なのです。それがわかってからは、以前ほど無意味だとは感じなくなりました。',
    notes: [
      { phrase: 'dread (doing) something', ja: '〜をひどく嫌がる・恐れる' },
      { phrase: 'it dawned on me that ...', ja: '〜だとふと気づいた' },
      { phrase: 'figure something out', ja: '〜を理解する・解き明かす' }
    ],
    q: {
      question: 'What did the speaker realise about small talk?',
      options: [
        'Its purpose is to signal goodwill, not to exchange information.',
        'It is a waste of time that should be avoided.',
        'It works best when the topic is the weather.',
        'It is mainly a way to practise speaking.'
      ],
      answer: 0,
      why: '内容（天気や週末）ではなく、「脅威ではない・あなたに時間を割く」という好意の合図が目的だと気づいた、という話です。'
    }
  },
  /* ---------- lv:'B2' — stage 1 (B1 → B2): shorter sentences, everyday and work topics ---------- */
  {
    id: 'lb01', title: 'A Message from the Dentist', topic: '留守電', level: 'B1+', lv: 'B2',
    sentences: [
      "Hi, this is Karen from Bright Smile Dental, calling about your appointment on Thursday.",
      "I'm afraid Dr. Lee is sick that day, so we need to move it.",
      "We've got a free slot on Friday at ten, or next Monday afternoon.",
      "Could you call us back and let us know which one works for you?"
    ],
    ja: 'もしもし、ブライトスマイル歯科のカレンです。木曜日のご予約の件でお電話しました。あいにくその日はリー先生が体調不良のため、ご予約を変更させていただく必要があります。金曜日の10時か、来週月曜日の午後に空きがあります。折り返しお電話いただき、どちらがご都合よいか教えていただけますか。',
    notes: [
      { phrase: "I'm afraid ...", ja: 'あいにく〜です（悪い知らせを丁寧に伝える）' },
      { phrase: 'a free slot', ja: '空いている時間枠' },
      { phrase: 'call someone back', ja: '折り返し電話する' }
    ],
    q: {
      question: 'Why is Karen calling?',
      options: [
        'To remind you to come on Thursday.',
        'To change the time of your appointment.',
        'To say the dentist has moved to a new office.',
        'To ask you to pay a bill.'
      ],
      answer: 1,
      why: 'リー先生が木曜日に休むので、予約を金曜か月曜に移したいという電話です。move it は「予約を動かす」という意味です。'
    }
  },
  {
    id: 'lb02', title: 'Lost Luggage', topic: '旅行', level: 'B2', lv: 'B2',
    sentences: [
      "So I landed in Lisbon this morning, but my suitcase didn't.",
      "The airline says it's still in Frankfurt and should arrive tomorrow.",
      "They gave me a small bag with a toothbrush and a T-shirt, which is something, I guess.",
      "Luckily, I packed my laptop and charger in my hand luggage."
    ],
    ja: 'それで今朝リスボンに着いたんだけど、スーツケースは着かなかったんだ。航空会社によると、まだフランクフルトにあって、明日届くはずだって。歯ブラシとTシャツが入った小さなバッグをくれたから、まあ、ないよりはましかな。幸い、ノートパソコンと充電器は機内持ち込みの荷物に入れておいたんだ。',
    notes: [
      { phrase: 'which is something, I guess', ja: 'まあ、ないよりはましかな' },
      { phrase: 'hand luggage', ja: '機内持ち込みの手荷物' },
      { phrase: 'should arrive', ja: '届くはずだ（予想）' }
    ],
    q: {
      question: "What is the speaker's situation?",
      options: [
        'Their flight to Lisbon was cancelled.',
        'They left their laptop at the airport.',
        'They have arrived, but their suitcase is delayed.',
        'They have to fly back to Frankfurt tomorrow.'
      ],
      answer: 2,
      why: "but my suitcase didn't（でもスーツケースは着かなかった）がポイントです。荷物はまだフランクフルトにあり、明日届く予定です。"
    }
  },
  {
    id: 'lb03', title: 'My Morning Walk', topic: '習慣', level: 'B1+', lv: 'B2',
    sentences: [
      "Every morning before work, I go for a twenty-minute walk around my neighbourhood.",
      "I don't listen to music or podcasts; I just walk and look around.",
      "It sounds boring, but it really helps me clear my head.",
      "On days when I skip it, I feel tired and a bit stressed by lunchtime."
    ],
    ja: '毎朝仕事の前に、近所を20分ほど散歩しています。音楽もポッドキャストも聞かず、ただ歩いて周りを眺めるだけです。退屈そうに聞こえますが、頭をすっきりさせるのに本当に役立ちます。散歩をしない日は、お昼ごろには疲れて少しストレスを感じます。',
    notes: [
      { phrase: 'go for a walk', ja: '散歩に出かける' },
      { phrase: 'clear my head', ja: '頭をすっきりさせる' },
      { phrase: 'skip something', ja: '〜を抜かす・休む' }
    ],
    q: {
      question: 'Why does the speaker go for a walk every morning?',
      options: [
        'It helps them think clearly and feel better.',
        'They need to walk to get to work.',
        'It gives them time to listen to podcasts.',
        'Their doctor told them to get more exercise.'
      ],
      answer: 0,
      why: 'clear my head（頭をすっきりさせる）と言い、歩かない日は疲れてストレスを感じるとも言っています。音楽やポッドキャストは聞いていません。'
    }
  },
  {
    id: 'lb04', title: 'Moving the Meeting', topic: '仕事', level: 'B1+', lv: 'B2',
    sentences: [
      "Hi everyone, just a quick update about tomorrow's team meeting.",
      "We're moving it from nine to eleven, because the client call has been pushed back.",
      "It'll still be in Room 4, and it shouldn't take more than half an hour.",
      "If you can't make the new time, just let me know today."
    ],
    ja: 'みなさん、明日のチームミーティングについて簡単なお知らせです。クライアントとの電話が後ろにずれたので、9時から11時に変更します。場所は引き続き4番会議室で、30分以上はかからないはずです。新しい時間に参加できない場合は、今日中に知らせてください。',
    notes: [
      { phrase: 'push something back', ja: '（予定を）遅らせる・後ろにずらす' },
      { phrase: "can't make the time", ja: 'その時間に都合がつかない' },
      { phrase: 'just a quick update', ja: 'ちょっとしたお知らせです' }
    ],
    q: {
      question: 'What has changed about the meeting?',
      options: [
        'It will be in a different room.',
        'It has moved to another day.',
        'It will be much longer than usual.',
        'It will start later than planned.'
      ],
      answer: 3,
      why: '9時から11時に変わったので、開始が遅くなりました。部屋は Room 4 のままで、30分以内に終わる予定です。'
    }
  },
  {
    id: 'lb05', title: 'Working from Home', topic: '意見', level: 'B2', lv: 'B2',
    sentences: [
      "Personally, I think working from home two or three days a week is the right balance.",
      "At home I can focus on things that need quiet, like writing reports.",
      "But I'd miss my colleagues if I never went in.",
      "Some problems are just easier to solve when you're in the same room."
    ],
    ja: '個人的には、週に2〜3日在宅勤務するのがちょうどいいバランスだと思います。家では、報告書を書くような静かさが必要な作業に集中できます。でも、まったく出社しなかったら同僚に会えなくて寂しくなるでしょう。同じ部屋にいるほうが解決しやすい問題もありますから。',
    notes: [
      { phrase: 'the right balance', ja: 'ちょうどよいバランス' },
      { phrase: 'go in', ja: '出社する（職場に行く）' },
      { phrase: "I'd miss ...", ja: '〜がいないと寂しく思うだろう' }
    ],
    q: {
      question: "What is the speaker's opinion?",
      options: [
        'Everyone should work from home every day.',
        'Working at the office is always more productive.',
        'A mix of home and office work is best.',
        'Writing reports is easier at the office.'
      ],
      answer: 2,
      why: '週に2〜3日の在宅が「ちょうどいいバランス」だという意見です。家では集中でき、職場では同僚と問題を解決しやすい、と両方の利点を挙げています。'
    }
  },
  {
    id: 'lb06', title: 'New Bike Lanes', topic: 'ニュース', level: 'B2', lv: 'B2',
    sentences: [
      "The city council has announced plans to add twelve kilometres of new bike lanes next year.",
      "Most of them will be on busy roads in the city centre.",
      "Supporters say it'll make cycling safer and cut traffic.",
      "However, some shop owners are worried that losing parking spaces will hurt their business."
    ],
    ja: '市議会は、来年12キロの自転車専用レーンを新たに整備する計画を発表しました。その大半は、市の中心部の交通量が多い道路に設けられます。賛成派は、自転車がより安全になり、交通量も減ると言っています。しかし一部の店主は、駐車スペースがなくなると商売に打撃が出ると心配しています。',
    notes: [
      { phrase: 'announce plans to ...', ja: '〜する計画を発表する' },
      { phrase: 'cut traffic', ja: '交通量を減らす' },
      { phrase: 'hurt their business', ja: '商売に打撃を与える' }
    ],
    q: {
      question: 'Why are some shop owners unhappy about the plan?',
      options: [
        'They think there will be fewer places for customers to park.',
        'They think the new bike lanes are too short.',
        'They think cycling in the city is already safe.',
        'They think the plan will cost too much money.'
      ],
      answer: 0,
      why: 'losing parking spaces will hurt their business（駐車スペースが減ると商売に悪影響が出る）と心配しています。'
    }
  },
  {
    id: 'lb07', title: 'The New Coffee Machine', topic: '説明', level: 'B1+', lv: 'B2',
    sentences: [
      "OK, so the new coffee machine's pretty easy to use.",
      "First, put your cup under the spout and choose your drink on the screen.",
      "Then tap your staff card on the reader, and it'll start straight away.",
      "Oh, and when the red light comes on, it means the water tank's empty, so please refill it."
    ],
    ja: 'さて、新しいコーヒーマシンは使い方がかなり簡単です。まず、注ぎ口の下にカップを置いて、画面で飲み物を選びます。次に社員証を読み取り機にかざすと、すぐに始まります。あ、それと、赤いランプがついたら水のタンクが空という意味なので、補充をお願いします。',
    notes: [
      { phrase: 'straight away', ja: 'すぐに' },
      { phrase: 'come on', ja: '（ランプなどが）つく' },
      { phrase: 'refill', ja: '補充する・詰め替える' }
    ],
    q: {
      question: 'What does the red light mean?',
      options: [
        'Your coffee is ready.',
        'Your staff card does not work.',
        'The machine needs cleaning.',
        'The machine needs more water.'
      ],
      answer: 3,
      why: "赤いランプは the water tank's empty（水のタンクが空）という意味です。そのときは水を補充してほしいと言っています。"
    }
  },
  {
    id: 'lb08', title: 'Missed the Train', topic: '留守電', level: 'B2', lv: 'B2',
    sentences: [
      "Hey, it's me, and I'm really sorry, but I've just missed my train.",
      "There was an accident on the motorway, and the bus took ages to get to the station.",
      "The next one leaves at six forty, so I won't be there until about nine.",
      "Don't wait for me for dinner; I'll grab something on the way."
    ],
    ja: 'もしもし、私だけど、本当にごめん、電車に乗り遅れちゃった。高速道路で事故があって、バスが駅に着くまでにすごく時間がかかったの。次の電車は6時40分発だから、そっちに着くのは9時ごろになりそう。夕食は待たないでね。途中で何か買って食べるから。',
    notes: [
      { phrase: 'take ages', ja: 'すごく時間がかかる' },
      { phrase: "won't be there until ...", ja: '〜まで着かない（〜ごろ着く）' },
      { phrase: 'grab something', ja: '（食べ物を）さっと買う・食べる' }
    ],
    q: {
      question: 'What does the speaker ask the listener to do?',
      options: [
        'Pick them up at the station.',
        'Eat dinner without them.',
        'Book a later train for them.',
        'Call them back before six forty.'
      ],
      answer: 1,
      why: "Don't wait for me for dinner（夕食は待たないで）と頼んでいます。自分は途中で何か買って食べるつもりです。"
    }
  },
  {
    id: 'lb09', title: 'Learning to Cook', topic: '習慣', level: 'B1+', lv: 'B2',
    sentences: [
      "I didn't really cook at all until I was about thirty.",
      "Then a friend taught me five simple dishes, and I just made them again and again.",
      "After a few months, I started changing them a bit and trying new things.",
      "Now I cook most nights, and I actually find it relaxing after work."
    ],
    ja: '30歳ごろまで、料理はほとんどしていませんでした。その後、友人が簡単な料理を5つ教えてくれて、それを何度も何度も作りました。数か月たつと、少しアレンジしたり新しいものに挑戦したりするようになりました。今ではほとんど毎晩料理をしていて、仕事の後のいい息抜きになっています。',
    notes: [
      { phrase: "didn't ... until ~", ja: '〜になるまで…しなかった' },
      { phrase: 'again and again', ja: '何度も繰り返し' },
      { phrase: 'find it relaxing', ja: 'それをくつろげると感じる' }
    ],
    q: {
      question: 'How did the speaker learn to cook?',
      options: [
        'By making a few simple dishes many times.',
        'By taking a cooking class at work.',
        'By watching cooking videos online.',
        'By helping their parents in the kitchen as a child.'
      ],
      answer: 0,
      why: '友人に教わった5つの簡単な料理を何度も作った（again and again）ことがきっかけです。'
    }
  },
  {
    id: 'lb10', title: 'A Problem with the Room', topic: '旅行', level: 'B2', lv: 'B2',
    sentences: [
      "Hi, I'm in room 312, and I'm afraid the air conditioning isn't working.",
      "I've tried the remote, but nothing happens, and it's really hot in here.",
      "Would it be possible to send someone up to look at it?",
      "If it can't be fixed tonight, I'd be happy to move to another room."
    ],
    ja: 'もしもし、312号室の者ですが、あいにくエアコンが動かないんです。リモコンを試してみたのですが何も反応がなく、部屋がとても暑いです。どなたか見に来ていただくことはできますか。今夜直せないようでしたら、別の部屋に移ってもかまいません。',
    notes: [
      { phrase: 'Would it be possible to ...?', ja: '〜していただくことは可能ですか（丁寧な依頼）' },
      { phrase: 'send someone up', ja: '（上の階へ）人をよこす' },
      { phrase: "I'd be happy to ...", ja: '〜してもかまいません・喜んで〜します' }
    ],
    q: {
      question: 'What does the guest want?',
      options: [
        'A cheaper room for tonight.',
        'A new remote control.',
        'Someone to fix the air conditioning, or a different room.',
        'To stay an extra night at the hotel.'
      ],
      answer: 2,
      why: 'エアコンを見に来てほしい、今夜直らないなら別の部屋に移ってもよい、と言っています。'
    }
  },
  {
    id: 'lb11', title: 'Website Project Update', topic: '仕事', level: 'B2', lv: 'B2',
    sentences: [
      "Quick update on the website project: we're about two weeks behind schedule.",
      "The design's finished, but our developer was off sick for most of last week.",
      "We've asked another developer to help, so we should catch up by the end of the month.",
      "I'll send everyone a new timeline on Friday."
    ],
    ja: 'ウェブサイトのプロジェクトについて簡単な報告です。予定より2週間ほど遅れています。デザインは完成していますが、開発担当者が先週のほとんどを病気で休んでいました。別の開発者に手伝いを頼んだので、月末までには遅れを取り戻せるはずです。金曜日に新しいスケジュールを全員に送ります。',
    notes: [
      { phrase: 'behind schedule', ja: '予定より遅れて' },
      { phrase: 'off sick', ja: '病気で休んで' },
      { phrase: 'catch up', ja: '遅れを取り戻す' }
    ],
    q: {
      question: 'Why is the project late?',
      options: [
        'The client changed the design.',
        'The new developer made mistakes.',
        'The team started two weeks late.',
        'The developer was ill for several days.'
      ],
      answer: 3,
      why: 'our developer was off sick（開発担当者が病気で休んでいた）のが遅れの原因です。デザインはすでに完成しています。'
    }
  },
  {
    id: 'lb12', title: 'Why I Take the Train', topic: '意見', level: 'B1+', lv: 'B2',
    sentences: [
      "If I can choose, I'll always take the train instead of flying.",
      "It's usually a bit slower, but you don't have to get to the airport two hours early.",
      "You can walk around, get some work done, or just watch the view.",
      "And you arrive right in the middle of the city, which saves a lot of time."
    ],
    ja: '選べるなら、私はいつも飛行機ではなく電車を使います。たいてい少し時間はかかりますが、2時間前に空港に着いている必要がありません。歩き回ったり、仕事を片付けたり、ただ景色を眺めたりできます。それに街のど真ん中に着くので、かなりの時間の節約になります。',
    notes: [
      { phrase: 'instead of ...ing', ja: '〜する代わりに' },
      { phrase: 'get some work done', ja: '仕事を少し片付ける' },
      { phrase: 'right in the middle of', ja: '〜のど真ん中に' }
    ],
    q: {
      question: 'Why does the speaker prefer trains to planes?',
      options: [
        'Trains are always faster than planes.',
        'Trains are more comfortable and convenient overall.',
        'Train tickets are much cheaper.',
        'They are afraid of flying.'
      ],
      answer: 1,
      why: '電車は少し遅いと認めたうえで、早く空港に行かなくてよい、車内で自由に過ごせる、街の中心に着く、という快適さと便利さを挙げています。'
    }
  },
  {
    id: 'lb13', title: 'Library Opening Hours', topic: 'ニュース', level: 'B1+', lv: 'B2',
    sentences: [
      "From next Monday, the central library will stay open until nine in the evening on weekdays.",
      "At the moment, it closes at six.",
      "The library says many people wanted to visit after work but couldn't.",
      "Weekend hours won't change, and the café on the ground floor will also stay open later."
    ],
    ja: '来週月曜日から、中央図書館は平日夜9時まで開館します。現在は6時に閉館しています。図書館によると、仕事の後に来館したくても来られない人が多かったということです。週末の開館時間は変わらず、1階のカフェも閉店時間を遅くします。',
    notes: [
      { phrase: 'stay open until ...', ja: '〜まで開いている' },
      { phrase: 'at the moment', ja: '現在は' },
      { phrase: 'ground floor', ja: '1階（イギリス英語）' }
    ],
    q: {
      question: 'Why is the library changing its opening hours?',
      options: [
        'It wants to save money on staff.',
        'The café needs more customers.',
        'Many people could only come after work.',
        'It will be closed at weekends.'
      ],
      answer: 2,
      why: '仕事の後に行きたくても行けなかった人が多かったからです。週末の時間は変わりません。'
    }
  },
  {
    id: 'lb14', title: 'Using the Projector', topic: '説明', level: 'B2', lv: 'B2',
    sentences: [
      "Before we start, let me show you how to connect your laptop.",
      "Plug this cable into your laptop, then press the input button until your screen appears.",
      "If the picture looks stretched, check your display settings.",
      "And if nothing works, there's a number for IT support on the wall by the door."
    ],
    ja: '始める前に、ノートパソコンのつなぎ方を説明しますね。このケーブルをパソコンに差し込んでから、自分の画面が映るまで入力ボタンを押してください。画像が横に引き伸ばされて見えたら、ディスプレイの設定を確認してください。それでもうまくいかなければ、ドアの横の壁にITサポートの番号が貼ってあります。',
    notes: [
      { phrase: 'plug ... into ~', ja: '…を〜に差し込む' },
      { phrase: 'until your screen appears', ja: '画面が映るまで' },
      { phrase: 'stretched', ja: '引き伸ばされた' }
    ],
    q: {
      question: 'What is the first thing you should do?',
      options: [
        'Connect the cable to your laptop.',
        'Call IT support.',
        'Change your display settings.',
        'Turn off the projector.'
      ],
      answer: 0,
      why: '最初の手順は Plug this cable into your laptop（ケーブルをつなぐ）です。表示設定やITサポートは、うまくいかないときの対処です。'
    }
  },
  {
    id: 'lb15', title: 'A Hiking Invitation', topic: '留守電', level: 'B1+', lv: 'B2',
    sentences: [
      "Hi Sam, it's Mia, just checking if you're still free on Saturday.",
      "A few of us are going hiking near the lake, and we thought you might like to come.",
      "We're meeting at the station at eight, so it's an early start, I'm afraid.",
      "Text me tonight if you're in, and I'll send you the details."
    ],
    ja: 'もしもしサム、ミアだよ。土曜日はまだ空いてるかなと思って。何人かで湖の近くにハイキングに行くんだけど、あなたも来たいんじゃないかと思って。駅に8時集合だから、悪いけど朝は早いよ。来るなら今夜メッセージちょうだい。詳細を送るから。',
    notes: [
      { phrase: 'we thought you might like to ...', ja: '〜したいかなと思って（誘い）' },
      { phrase: 'an early start', ja: '朝早い出発' },
      { phrase: "if you're in", ja: '参加するなら' }
    ],
    q: {
      question: 'Why is Mia calling Sam?',
      options: [
        'To cancel their weekend plans.',
        'To invite him on a hiking trip.',
        'To ask him the way to the lake.',
        'To tell him the train is late.'
      ],
      answer: 1,
      why: '何人かで湖の近くへハイキングに行くので、サムも来ないかと誘っています。'
    }
  },
  {
    id: 'lb16', title: 'Saving Money on Lunch', topic: '習慣', level: 'B2', lv: 'B2',
    sentences: [
      "A few months ago, I worked out I was spending almost two hundred pounds a month on lunch.",
      "So now I cook extra food for dinner and take the rest to work the next day.",
      "It only takes a few minutes, and it's often better than what I used to buy.",
      "I'm saving money, and I'm eating more vegetables, too."
    ],
    ja: '数か月前、昼食に月200ポンド近く使っていることに気づきました。それで今は夕食を多めに作って、残りを翌日職場に持っていっています。数分しかかからないし、たいてい以前買っていたものよりおいしいです。お金も節約できて、野菜も前より多く食べています。',
    notes: [
      { phrase: 'work out (that) ...', ja: '（計算して）〜とわかる' },
      { phrase: 'the rest', ja: '残り' },
      { phrase: 'what I used to buy', ja: '以前買っていたもの' }
    ],
    q: {
      question: 'What does the speaker do now?',
      options: [
        'Buys a cheaper lunch near the office.',
        'Skips lunch to save money.',
        'Eats dinner at work.',
        'Takes leftovers from dinner to work.'
      ],
      answer: 3,
      why: '夕食を多めに作り、残りを翌日職場に持っていく（take the rest to work）ようにしています。'
    }
  },
  {
    id: 'lb17', title: 'Feedback on Your Slides', topic: '仕事', level: 'B2', lv: 'B2',
    sentences: [
      "I had a look at your slides for Thursday, and they're looking good.",
      "The main message is clear, and I really like the charts.",
      "My only suggestion is to cut a few of the slides with lots of text, because people won't read them while you're talking.",
      "Maybe turn them into notes instead?"
    ],
    ja: '木曜日用のスライドを見たけど、いい感じだね。主なメッセージがはっきりしているし、グラフもすごくいいと思う。唯一の提案は、文字の多いスライドをいくつか削ること。あなたが話している間、みんなそれを読まないからね。代わりに手元のメモにしたらどうかな。',
    notes: [
      { phrase: 'have a look at', ja: '〜に目を通す' },
      { phrase: 'My only suggestion is to ...', ja: '唯一の提案は〜することです' },
      { phrase: 'turn A into B', ja: 'AをBに変える' }
    ],
    q: {
      question: 'What does the speaker suggest?',
      options: [
        'Removing some slides with a lot of text.',
        'Adding more charts to the slides.',
        'Making the main message clearer.',
        'Giving the presentation on a different day.'
      ],
      answer: 0,
      why: 'cut a few of the slides with lots of text（文字の多いスライドをいくつか削る）が唯一の提案です。メッセージとグラフはほめています。'
    }
  },
  {
    id: 'lb18', title: 'Delays on the North Line', topic: 'ニュース', level: 'B1+', lv: 'B2',
    sentences: [
      "Passengers on the north line are facing delays this morning after a train broke down near Park Street.",
      "Trains are still running, but they're about twenty minutes late.",
      "The company says the problem should be fixed by midday.",
      "People are being advised to leave extra time or take the bus if they can."
    ],
    ja: '今朝、パーク・ストリート付近で列車が故障したため、北線の乗客に遅れが出ています。運行は続いていますが、列車は約20分遅れています。鉄道会社によると、問題は正午までに解消される見込みです。時間に余裕を持つか、可能ならバスを利用するよう呼びかけられています。',
    notes: [
      { phrase: 'break down', ja: '故障する' },
      { phrase: 'be advised to ...', ja: '〜するよう勧められている' },
      { phrase: 'leave extra time', ja: '時間に余裕をもつ' }
    ],
    q: {
      question: 'What are passengers advised to do?',
      options: [
        'Stay at home until midday.',
        'Ask for their money back.',
        'Allow more time for their journey or use the bus.',
        'Change trains at Park Street.'
      ],
      answer: 2,
      why: 'leave extra time or take the bus（時間に余裕を持つか、バスを使う）よう勧められています。'
    }
  },
  {
    id: 'lb19', title: 'Returning a Jacket', topic: '買い物', level: 'B1+', lv: 'B2',
    sentences: [
      "Hi, I bought this jacket here last week, but it's a bit too small for me.",
      "I've still got the receipt, and I haven't worn it outside.",
      "Do you have it in a medium?",
      "If not, could I just get my money back?"
    ],
    ja: 'すみません、先週ここでこのジャケットを買ったのですが、私には少し小さすぎました。レシートはまだありますし、外では着ていません。Mサイズはありますか。なければ、返金していただけますか。',
    notes: [
      { phrase: 'Do you have it in ...?', ja: '〜（サイズ・色）はありますか' },
      { phrase: 'get my money back', ja: '返金してもらう' },
      { phrase: "I've still got ...", ja: '〜はまだ持っています' }
    ],
    q: {
      question: 'What does the customer want?',
      options: [
        'The same jacket in a different colour.',
        'A discount on the jacket.',
        'To buy a second jacket.',
        'A bigger size or a refund.'
      ],
      answer: 3,
      why: 'Mサイズはあるか、なければ返金してほしい（get my money back）と言っています。'
    }
  },
  {
    id: 'lb20', title: 'Learning with Podcasts', topic: '習慣', level: 'B2', lv: 'B2',
    sentences: [
      "Most days, I listen to an English podcast on my way to work.",
      "At first I only understood about half of it, which was pretty frustrating.",
      "But I kept going, and I started listening to each episode twice.",
      "Now I can follow most of it, and I've picked up loads of useful phrases."
    ],
    ja: 'ほぼ毎日、通勤中に英語のポッドキャストを聞いています。最初は半分くらいしかわからなくて、かなりもどかしかったです。でもやめずに続けて、各エピソードを2回ずつ聞くようにしました。今ではほとんど理解できるようになり、役立つ表現もたくさん身につきました。',
    notes: [
      { phrase: 'keep going', ja: '続ける・やめない' },
      { phrase: 'follow', ja: '（話に）ついていく・理解する' },
      { phrase: 'pick up', ja: '（自然に）身につける' }
    ],
    q: {
      question: 'What helped the speaker understand more?',
      options: [
        'Reading the script before listening.',
        'Listening to each episode two times.',
        'Choosing an easier podcast.',
        'Listening at a slower speed.'
      ],
      answer: 1,
      why: 'listening to each episode twice（各エピソードを2回聞く）を続けた結果、ほとんど理解できるようになりました。'
    }
  },
  {
    id: 'lb21', title: 'No Phones at Dinner', topic: '意見', level: 'B1+', lv: 'B2',
    sentences: [
      "In my family, we've got one simple rule: no phones at the dinner table.",
      "My kids complained at first, but now they don't really mind.",
      "We actually talk about our day, and dinner doesn't feel so rushed.",
      "I think it's one of the best changes we've made."
    ],
    ja: 'うちの家族には、ひとつシンプルなルールがあります。食卓ではスマホ禁止です。子どもたちは最初こそ文句を言いましたが、今はあまり気にしていません。実際にその日の出来事を話すようになり、夕食も以前ほど慌ただしく感じません。これまでで一番よかった変化のひとつだと思います。',
    notes: [
      { phrase: "don't mind", ja: '気にしない・嫌がらない' },
      { phrase: 'rushed', ja: '慌ただしい' },
      { phrase: "one of the best changes we've made", ja: 'これまでで最もよかった変化のひとつ' }
    ],
    q: {
      question: 'What does the speaker think about the rule?',
      options: [
        'It has had a good effect on the family.',
        'It was too difficult, so they stopped it.',
        "Their children still don't like it.",
        "It's only useful for young children."
      ],
      answer: 0,
      why: '一日の話をするようになり、夕食も慌ただしくなくなったので「最高の変化のひとつ」と言っています。子どもは最初こそ不満でしたが、今は気にしていません。'
    }
  },
  {
    id: 'lb22', title: 'Office Closed on Friday', topic: '仕事', level: 'B1+', lv: 'B2',
    sentences: [
      "Just a reminder that the office will be closed next Friday for some electrical work.",
      "Please take your laptops home on Thursday evening, because you'll be working from home that day.",
      "Also, make sure you switch off your monitors and any heaters before you leave.",
      "Everything should be back to normal on Monday."
    ],
    ja: '念のためのお知らせですが、来週金曜日は電気工事のためオフィスが閉まります。その日は在宅勤務になるので、木曜日の夜にノートパソコンを持ち帰ってください。また、帰る前にモニターと暖房器具の電源を必ず切ってください。月曜日には通常どおりに戻る予定です。',
    notes: [
      { phrase: 'Just a reminder that ...', ja: '念のためお知らせですが〜' },
      { phrase: 'make sure you ...', ja: '必ず〜してください' },
      { phrase: 'back to normal', ja: '通常どおりに戻って' }
    ],
    q: {
      question: 'What should staff do on Thursday evening?',
      options: [
        'Stay late to finish their work.',
        'Help with the electrical work.',
        'Leave their laptops at the office.',
        'Take their laptops home with them.'
      ],
      answer: 3,
      why: '金曜日は在宅勤務になるので、木曜の夜にノートパソコンを持ち帰る（take your laptops home）よう求めています。'
    }
  }
];
