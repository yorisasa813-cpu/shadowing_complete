/* C1 Climb — grammar content. window.C1_GRAMMAR = {units, items}. Item ids are unit id + running number per unit: keep the order stable and append new items at the end of a unit.
   Units: group 'core' (lv B2, B1→B2 basics), 'accuracy' (lv B2), 'range' (lv C1). Each item carries lv = its unit's lv. */
(function () {
  'use strict';
  const units = [
    /* ---------- core (B1 → B2) ---------- */
    {
      id: 'perf', lv: 'B2', name: 'Present perfect vs past simple', ja: '現在完了と過去形', group: 'core',
      explain: '現在完了(have + 過去分詞)は、過去の出来事を「今」と結びつけて話すときに使います。経験(Have you ever …?)、今に残る結果(I\'ve lost my keys)、今まで続いている状態(for / since)が代表的な使い方です。いつ起きたかをはっきり言うとき(yesterday, two years ago, in 2019, when I was a child)は過去形を使います。今まで続いている「動作」で、その長さを強調したいときは現在完了進行形(have been + -ing)を使います。',
      patterns: [
        { form: 'have + 過去分詞(経験・結果・状態の継続)', ex: 'I\'ve lived here since 2021.' },
        { form: '過去形 + 終わった時を示す語句(ago / yesterday / in 2019)', ex: 'We moved here two years ago.' },
        { form: 'have been + -ing + for / since(動作の継続)', ex: 'She\'s been waiting for over an hour.' },
      ],
      pitfalls: '日本語の「〜した」はどちらにも訳せるため、yesterday や ago と一緒に現在完了を使う誤り(I have seen him yesterday)と、「5年間住んでいる」を現在形で言う誤り(I live here for five years)が典型です。',
    },
    {
      id: 'ifs', lv: 'B2', name: 'Conditionals & wish', ja: '条件文(第1〜第3)と wish', group: 'core',
      explain: '第1条件文(If + 現在形, will + 原形)は、実際に起こりうる未来の条件を表します。第2条件文(If + 過去形, would + 原形)は、今の事実と違うことや起こりそうにないことを想像するときに使います。第3条件文(If + had + 過去分詞, would have + 過去分詞)は、過去の事実と違うことを想像して、後悔や反省を言うときに使います。wish も同じ考え方で、今の願望は wish + 過去形、過去の後悔は wish + had + 過去分詞 で表します。',
      patterns: [
        { form: 'If + 現在形, will + 原形(実際にありうる条件)', ex: 'If it rains tomorrow, we\'ll stay at home.' },
        { form: 'If + 過去形, would + 原形(今の事実と違う想像)', ex: 'If I had more time, I would learn to cook.' },
        { form: 'If + had + 過去分詞, would have + 過去分詞(過去の事実と違う想像)', ex: 'If we had left earlier, we wouldn\'t have missed the train.' },
      ],
      pitfalls: 'if 節の中に will や would を入れる誤り(If it will rain / If I would have more time)と、「〜できたらいいのに」を I wish I can … と現在形で言う誤りが典型です。',
    },
    {
      id: 'pasv', lv: 'B2', name: 'The passive', ja: '受動態', group: 'core',
      explain: '受動態(be + 過去分詞)は、「だれがしたか」よりも「何がされたか」に注目したいときに使います。行為者がわからない・重要でない・言うまでもないときによく使い、伝える必要があるときだけ by + 人 を加えます。時制は be 動詞の形で表します(is made / was made / has been made / will be made / is being made)。ニュース、説明書、レポートなどで特によく使われる形です。',
      patterns: [
        { form: 'be + 過去分詞(+ by + 行為者)', ex: 'This bridge was built in 1932.' },
        { form: 'has been + 過去分詞 / is being + 過去分詞', ex: 'The road is being repaired this week.' },
        { form: '助動詞 + be + 過去分詞', ex: 'The form must be signed by both parties.' },
      ],
      pitfalls: 'happen / arrive などの自動詞を受動態にする誤り(It was happened)と、be 動詞を落としてしまう誤り(I born in 1995 / The results will announce)が典型です。',
    },
    {
      id: 'rel', lv: 'B2', name: 'Relative clauses', ja: '関係詞節', group: 'core',
      explain: '関係詞節は、名詞のすぐ後ろに置いて「どんな人・もの」かを説明する節です。人には who、ものには which、どちらにも that を使い、所有は whose、場所は where で表します。関係詞が節の中で目的語になるときは省略できます(the book (that) I bought)。カンマで区切る非制限用法は追加の情報を表し、that は使えず、関係詞を省略することもできません。',
      patterns: [
        { form: '名詞 + who / which / that + 動詞(主語の働き)', ex: 'The woman who lives next door is a nurse.' },
        { form: '名詞 + (that / which) + 主語 + 動詞(目的語の働き・省略可)', ex: 'This is the book I told you about.' },
        { form: '名詞, who / which …(非制限用法:追加の情報)', ex: 'My brother, who lives in Canada, is visiting next week.' },
      ],
      pitfalls: '関係詞節の中に代名詞を残してしまう誤り(the book that I bought it)と、カンマ付きの非制限用法で that を使う誤り(My father, that works …)が典型です。',
    },
    {
      id: 'rep', lv: 'B2', name: 'Reported speech', ja: '間接話法', group: 'core',
      explain: '人が言ったことを伝えるときは、said / told / asked の後ろで時制を1つ過去にずらすのが基本です(is → was、will → would、過去形 → 過去完了)。代名詞や時を表す語句も、伝える人の立場に合わせて変えます(I → he、tomorrow → the next day)。tell は必ず「人」を目的語にとり、say は人を直接とりません。疑問文は ask + if / whether / 疑問詞 + 主語 + 動詞 の語順に、命令や依頼は tell / ask + 人 + to 不定詞 にします。',
      patterns: [
        { form: 'say (that) / tell + 人 + (that) + 時制を1つ過去に', ex: 'She told me (that) she was tired.' },
        { form: 'ask + 人 + if / whether / 疑問詞 + 主語 + 動詞', ex: 'He asked me where I lived.' },
        { form: 'tell / ask + 人 + (not) to 不定詞(命令・依頼)', ex: 'The doctor told me not to lift anything heavy.' },
      ],
      pitfalls: 'said me / told to me のように say と tell の型を混同する誤りと、伝える疑問文を疑問文の語順のままにする誤り(He asked me where did I live)が典型です。',
    },
    {
      id: 'mod', lv: 'B2', name: 'Modals: deduction & obligation', ja: '助動詞(推量と義務)', group: 'core',
      explain: 'must / might / can\'t + 原形 は、今のことについての推量を確信の度合いで言い分けます。must は「〜に違いない」、might / may / could は「〜かもしれない」、can\'t は「〜のはずがない」です。義務は must や have to で表し、助言は should で表します。否定にすると意味が大きく変わり、mustn\'t は「〜してはいけない」(禁止)、don\'t have to / needn\'t は「〜しなくてよい」(不要)です。',
      patterns: [
        { form: 'must / might / can\'t + 原形(今の推量)', ex: 'He isn\'t answering — he must be asleep.' },
        { form: 'must / have to + 原形(義務)、should + 原形(助言)', ex: 'You should see a doctor about that cough.' },
        { form: 'mustn\'t(禁止)/ don\'t have to(不要)', ex: 'You don\'t have to come, but you mustn\'t tell anyone.' },
      ],
      pitfalls: '「〜のはずがない」を mustn\'t で言う誤り(正しくは can\'t)と、「〜しなくてよい」を mustn\'t で言う誤り(正しくは don\'t have to)、must to do のように to を付ける誤りが典型です。',
    },
    /* ---------- range (C1) & accuracy ---------- */
    {
      id: 'inv', lv: 'C1', name: 'Inversion', ja: '倒置', group: 'range',
      explain: '否定・制限の副詞句(Never, Rarely, Not until, Only after, Under no circumstances など)を文頭に出すと、その後ろは疑問文と同じ語順(助動詞+主語)になります。C1の話者は、スピーチやフォーマルな文章で驚きや強調を表したいときにこの形を使います。So + 形容詞 + be動詞 + 主語 + that … の形も同じ仲間です。Not until / Only after の場合、倒置するのは主節のほうで、until / after の節の中は普通の語順のままです。',
      patterns: [
        { form: 'Never / Rarely / Seldom + 助動詞 + 主語 + 動詞', ex: 'Rarely have I read such a convincing report.' },
        { form: 'No sooner had + 主語 + 過去分詞 + than … / Hardly … when …', ex: 'No sooner had we sat down than the lights went out.' },
        { form: 'Not until / Only after + 節・句, 助動詞 + 主語 + 動詞', ex: 'Only after the merger did the problems become apparent.' },
      ],
      pitfalls: '副詞句を文頭に出しただけで語順を変えない(Never I have …)誤りと、No sooner に when、Hardly に than を組み合わせてしまう誤りが典型です。',
    },
    {
      id: 'cleft', lv: 'C1', name: 'Clefts & emphasis', ja: '分裂文と強調', group: 'range',
      explain: '分裂文は、1つの文を2つに割って伝えたい情報に焦点を当てる形です。It is/was X that … は「ほかでもないXが」と対比を示し、What … is/was X は聞き手の注意を文末のXに集めます。All I did was + 原形、The thing that … is … も同じ働きをします。C1では、議論で論点をはっきりさせたり、誤解を訂正したりするときに自然に使えることが求められます。肯定文に do / does / did を加える強調(I do appreciate it)も合わせて使えるようにしましょう。',
      patterns: [
        { form: 'It is / was + 強調する語句 + that (who) …', ex: 'It was the pricing, not the product, that put customers off.' },
        { form: 'What + 節 + is / was + 名詞・原形', ex: 'What we need is a clear timetable.' },
        { form: 'All (that) + 主語 + do + is / was + 原形', ex: 'All she did was ask a simple question.' },
      ],
      pitfalls: 'It was in Kyoto where … のように that の代わりに where / when を使う誤りと、the thing what … のように what を関係代名詞として使う誤りが多く見られます。',
    },
    {
      id: 'cond', lv: 'C1', name: 'Mixed & inverted conditionals', ja: '混合仮定法と if の省略', group: 'range',
      explain: '混合仮定法は、条件と結果の「時」がずれる形です。過去の条件が現在の結果につながるなら If + 過去完了, would + 原形、変わらない性質が過去の結果につながるなら If + 過去形, would have + 過去分詞 を使います。フォーマルな文では if を省いて Had / Were / Should を文頭に出す倒置形が好まれます。But for + 名詞(〜がなければ)も C1 らしい言い換えです。',
      patterns: [
        { form: 'If + 過去完了, would + 原形(過去→現在)', ex: 'If I had saved more, I would be less anxious now.' },
        { form: 'Had / Were / Should + 主語 …(if の省略)', ex: 'Had we been told earlier, we could have adjusted the schedule.' },
        { form: 'But for + 名詞, would (have) …', ex: 'But for her intervention, the deal would have collapsed.' },
      ],
      pitfalls: 'if 節の中に would を入れる(If I would have known)誤りと、unless の後ろをさらに否定にしてしまう誤りが典型です。',
    },
    {
      id: 'part', lv: 'C1', name: 'Participle clauses', ja: '分詞構文', group: 'range',
      explain: '分詞構文は、接続詞と主語を省いて情報を短くまとめる形です。主語が動作をする側なら現在分詞(-ing)、される側なら過去分詞、主節より前に終わったことなら Having + 過去分詞 を使います。C1の書き言葉では、because / after / if の節をくり返す代わりにこの形で文を引き締めます。分詞の意味上の主語は、原則として主節の主語と同じでなければなりません。',
      patterns: [
        { form: '-ing …, 主語 + 動詞(能動・同時/理由)', ex: 'Not wishing to interrupt, I waited outside.' },
        { form: '過去分詞 …, 主語 + 動詞(受動)', ex: 'Founded in 1920, the firm is still family-owned.' },
        { form: 'Having (been) + 過去分詞 …(主節より前)', ex: 'Having reviewed the data, we revised our forecast.' },
      ],
      pitfalls: '受動の意味なのに -ing を使う(Comparing with last year)誤りと、分詞の主語が主節の主語と合っていない誤りが典型です。',
    },
    {
      id: 'subj', lv: 'C1', name: 'Subjunctive & unreal past', ja: '仮定法現在と非現実の過去', group: 'range',
      explain: 'suggest, recommend, insist, demand や It is essential / vital that の後ろでは、主語が何であっても動詞の原形(または should + 原形)を使います。これが仮定法現在で、フォーマルな文書や会議でよく使われます。一方、wish, if only, would rather, It\'s (high) time, as if の後ろでは、現在の事実と違うことを過去形で、過去の事実と違うことを過去完了で表します。どちらも「時」ではなく「現実との距離」を表す形です。',
      patterns: [
        { form: 'suggest / insist / It is vital + that + 主語 + 原形', ex: 'They demanded that the report be published in full.' },
        { form: 'wish / If only + 過去形(現在) / 過去完了(過去)', ex: 'I wish I had spoken up at the time.' },
        { form: 'would rather + 主語 + 過去形 / It\'s (high) time + 主語 + 過去形', ex: 'I\'d rather you kept this to yourself.' },
      ],
      pitfalls: 'I wish I can … や It\'s time we leave のように現在形を使ってしまう誤りと、insisted that he attends のように三単現の s を付けてしまう誤りが多く見られます。',
    },
    {
      id: 'modal', lv: 'C1', name: 'Advanced modals', ja: '助動詞の発展用法', group: 'range',
      explain: '助動詞 + have + 過去分詞 は、過去のことについての推量や評価を表します。must have は確信、may / might / could have は可能性、can\'t have は「〜したはずがない」です。should have は「すべきだったのにしなかった」、needn\'t have は「する必要がなかったのにした」という振り返りを表します。C1では、断定を避けて確信の度合いを細かく言い分けるためにこれらを使います。',
      patterns: [
        { form: 'must / can\'t / may / might + have + 過去分詞(過去の推量)', ex: 'She can\'t have seen the email yet.' },
        { form: 'should / ought to + have + 過去分詞(後悔・批判)', ex: 'We should have consulted the legal team first.' },
        { form: 'needn\'t have + 過去分詞(不要だったのにした)', ex: 'You needn\'t have printed it; I had a copy.' },
      ],
      pitfalls: '過去に一度だけ「できた」ことに could を使う誤り(正しくは was able to / managed to)と、must had のように have を過去形にしてしまう誤りが典型です。',
    },
    {
      id: 'pass', lv: 'C1', name: 'Passive reporting & causatives', ja: '伝聞の受動態と使役', group: 'range',
      explain: 'say, believe, think, report, expect などの動詞は、It is said that … と 主語 + is said to + 不定詞 の2通りの受動態で使えます。伝聞の内容が今のことなら to do / to be doing、それより前のことなら to have + 過去分詞 を使います。ニュースや論文で、情報源をぼかして客観的に述べるための形です。have + 目的語 + 過去分詞 は「(人に)〜してもらう」「〜される」を表します。',
      patterns: [
        { form: '主語 + is said / believed / thought + to 不定詞', ex: 'The firm is said to be considering a takeover.' },
        { form: '主語 + is reported + to have + 過去分詞(以前のこと)', ex: 'Two people are reported to have been injured.' },
        { form: 'have / get + 目的語 + 過去分詞', ex: 'We had the contract checked by a lawyer.' },
      ],
      pitfalls: '日本語の「〜を盗まれた」をそのまま I was stolen my wallet としてしまう誤りと、happen などの自動詞を受動態にしてしまう誤りが典型です。',
    },
    {
      id: 'nom', lv: 'C1', name: 'Nominal clauses', ja: '名詞節', group: 'range',
      explain: '名詞節は、that / whether / what / how / why などで始まり、文の主語・目的語・補語になる節です。C1では What matters is … や Whether it works remains to be seen のように、節そのものを主語にして情報を整理します。名詞節の中は疑問文の語順ではなく、平叙文の語順(主語+動詞)になります。前置詞の後ろや文頭では if ではなく whether を使い、that 節を前置詞の後ろに置くときは the fact that を使います。',
      patterns: [
        { form: 'What / Why / How + 主語 + 動詞 + is …(主語になる節)', ex: 'How the data was collected is not explained.' },
        { form: 'Whether + 節 + 動詞 / whether to + 原形', ex: 'Whether we expand depends on next quarter\'s results.' },
        { form: 'The fact that + 節 / despite the fact that + 節', ex: 'The fact that nobody complained does not mean everyone agreed.' },
      ],
      pitfalls: '間接疑問を疑問文の語順のままにする(I don\'t know where is it)誤りと、despite の後ろに節を直接続ける誤りが典型です。',
    },
    {
      id: 'ellip', lv: 'C1', name: 'Ellipsis & substitution', ja: '省略と代用', group: 'range',
      explain: '英語では同じ語句のくり返しを避けるために、省略や代用語を使います。so / not は節の代わり(I hope so / I\'m afraid not)、do so は動詞句の代わり、one / ones は可算名詞の代わりになります。to 不定詞は to だけを残して後ろを省略できます(if you want to)。So do I / Neither have I のような倒置の応答も含め、これらを使えると話し方も書き方も引き締まります。',
      patterns: [
        { form: 'so / neither / nor + 助動詞 + 主語', ex: 'The first trial failed, and so did the second.' },
        { form: 'think / hope / expect + so、hope / be afraid + not', ex: 'Is it going to be delayed? — I\'m afraid so.' },
        { form: 'do so / to(動詞句の代用・省略)', ex: 'Members who wish to vote must do so by noon.' },
      ],
      pitfalls: '否定文に too を付ける(〜 doesn\'t too)誤りと、I think it / I hope not so のように so / not を正しく使えない誤りが多く見られます。',
    },
    {
      id: 'art', lv: 'B2', name: 'Articles & countability', ja: '冠詞と可算・不可算', group: 'accuracy',
      explain: '冠詞は「聞き手がどれのことか特定できるか」で決まります。特定できれば the、できない単数の可算名詞には a / an、一般論を述べる複数形や不可算名詞には冠詞を付けません。advice, information, equipment, furniture, research, evidence, feedback などは不可算名詞なので、a を付けたり複数形にしたりできません。few / little は「ほとんどない」、a few / a little は「少しある」という意味の違いにも注意が必要です。',
      patterns: [
        { form: '一般論:無冠詞の複数形・不可算名詞', ex: 'Life in big cities can be isolating.' },
        { form: '不可算名詞:some / a piece of / much + 名詞', ex: 'She gave me a useful piece of advice.' },
        { form: '職業・役割:as + a / an + 名詞', ex: 'He works as an interpreter.' },
      ],
      pitfalls: '不可算名詞に a を付けたり複数形にしたりする(an advice, informations)誤りと、一般論に the を付ける(the life in Tokyo)誤りが典型です。',
    },
    {
      id: 'prep', lv: 'B2', name: 'Dependent prepositions', ja: '前置詞の選択', group: 'accuracy',
      explain: '動詞・形容詞・名詞には、決まった前置詞と結びつくものが多くあります(depend on, capable of, an increase in など)。これらは意味から推測しにくいので、かたまりで覚えるのが近道です。discuss, marry, enter, reach, approach などは他動詞なので前置詞を付けません。前置詞の後ろに動詞を置くときは必ず -ing 形にします。',
      patterns: [
        { form: '動詞 + 前置詞:depend on / result in / apologise for', ex: 'The shortage resulted in higher prices.' },
        { form: '形容詞 + 前置詞:capable of / responsible for / aware of', ex: 'He is fully aware of the risks.' },
        { form: 'by + 期限 / until + 継続の終点', ex: 'Submit it by Friday; the office is open until six.' },
      ],
      pitfalls: '日本語の「〜について議論する」「〜と結婚する」に引きずられて discuss about / marry with とする誤りと、期限の by を until にする誤りが典型です。',
    },
    {
      id: 'tense', lv: 'B2', name: 'Tense & aspect', ja: '時制と相', group: 'accuracy',
      explain: '現在完了は「今とつながっている過去」を表すので、last year や in 2020 のような終わった時を示す語句とは一緒に使えません。過去のある時点より前のことは過去完了、未来のある時点までに終わることは未来完了(will have + 過去分詞)で表します。when, as soon as, if などの時・条件の節の中では、未来のことでも現在形を使います。know, belong, understand などの状態動詞は進行形にしません。',
      patterns: [
        { form: 'have + 過去分詞 + since / for(今まで続いている)', ex: 'I have known her since we were students.' },
        { form: 'By the time + 現在形, will have + 過去分詞', ex: 'By the time you land, I will have finished the draft.' },
        { form: 'This is the first time + 現在完了', ex: 'This is the first time I have chaired a meeting.' },
      ],
      pitfalls: '「去年行ったことがある」を I have visited … last year とする誤りと、if / when の節の中で will を使う誤りが典型です。',
    },
    {
      id: 'vpat', lv: 'B2', name: 'Verb patterns', ja: '動詞の型(動名詞と不定詞)', group: 'accuracy',
      explain: '動詞の後ろに -ing が来るか to 不定詞が来るかは、動詞ごとに決まっています。suggest, avoid, deny, consider, risk は -ing、decide, manage, afford, refuse は to 不定詞をとります。remember, regret, stop, try は、どちらをとるかで意味が変わります。make / let + 目的語 + 原形、be used to + -ing のように、to の有無や品詞をまちがえやすい型も確実にしておきましょう。',
      patterns: [
        { form: 'suggest / avoid / deny + -ing', ex: 'He denied having seen the memo.' },
        { form: 'remember / regret / stop + -ing(すでにしたこと)/ to 不定詞(これからすること・目的)', ex: 'I regret to say that the event is cancelled.' },
        { form: 'make / let + 目的語 + 原形、allow / enable + 目的語 + to 不定詞', ex: 'The grant enabled us to hire two researchers.' },
      ],
      pitfalls: 'suggest to do、made me to do、I\'m used to work のように、to 不定詞をどこにでも使ってしまう誤りが典型です。',
    },
    {
      id: 'order', lv: 'B2', name: 'Word order & agreement', ja: '副詞の語順と主語・動詞の一致', group: 'accuracy',
      explain: '頻度や確信度を表す副詞(always, probably, hardly など)は、be 動詞・助動詞の後ろ、一般動詞の前に置きます。動詞と目的語の間には、原則として副詞を入れません。主語が長いときは、動詞を主語の中心になる名詞に一致させます(The list of items is …)。the number of + 複数名詞 は単数扱い、a number of + 複数名詞 は複数扱い、each / everyone は単数扱いです。',
      patterns: [
        { form: '主語 + be / 助動詞 + 副詞 + …、主語 + 副詞 + 一般動詞', ex: 'She has probably already left.' },
        { form: '動詞 + 目的語 + 副詞句(間に入れない)', ex: 'I enjoyed the lecture very much.' },
        { form: 'The number of + 複数名詞 + 単数動詞 / A number of + 複数名詞 + 複数動詞', ex: 'The number of complaints has fallen.' },
      ],
      pitfalls: 'I like very much coffee のように動詞と目的語の間に副詞を入れる誤りと、動詞を直前の複数名詞に一致させてしまう(The quality of the products are …)誤りが典型です。',
    },
  ];

  const items = [];
  const counter = {};
  function nextId(unit) { counter[unit] = (counter[unit] || 0) + 1; return unit + '-' + counter[unit]; }
  const LV = {};
  units.forEach((u) => { LV[u.id] = u.lv; });
  function mc(unit, q, options, answer, why) { items.push({ id: nextId(unit), unit, lv: LV[unit], kind: 'mc', q, options, answer, why }); }
  function tr(unit, q, cue, answers, why) { items.push({ id: nextId(unit), unit, lv: LV[unit], kind: 'transform', q, cue, answers, why }); }
  function fx(unit, q, answers, why) { items.push({ id: nextId(unit), unit, lv: LV[unit], kind: 'fix', q, answers, why }); }

  /* ---------- inv ---------- */
  mc('inv', "Not until the audit was complete ___ the scale of the losses.", ["did the board realise", "the board realised", "had the board realise", "the board did realise"], 0, 'Not until … が文頭に来ると、主節が倒置されます(did + 主語 + 原形)。until 節の中は普通の語順のままです。');
  mc('inv', "Under no circumstances ___ be shared with third parties.", ["customer data should", "should customer data", "customer data must not", "does customer data"], 1, 'Under no circumstances は否定の副詞句なので、後ろは助動詞 + 主語の語順になります。すでに否定を含むので not は重ねません。');
  mc('inv', "So persuasive ___ that even the sceptics voted in favour.", ["her argument was", "did her argument", "her argument did", "was her argument"], 3, 'So + 形容詞 を文頭に出すと be 動詞 + 主語 の語順になります。');
  mc('inv', "Only after several failed attempts ___ to secure funding.", ["they managed", "managed they", "did they manage", "they did managed"], 2, 'Only after + 名詞句 が文頭に来ると、did + 主語 + 原形 の倒置になります。');
  tr('inv', "I have rarely seen such a well-argued proposal.", "Rarely", ["Rarely have I seen such a well-argued proposal."], 'Rarely を文頭に出すと、have + 主語 + 過去分詞 の語順になります。');
  tr('inv', "The meeting had only just started when the fire alarm went off.", "No sooner", ["No sooner had the meeting started than the fire alarm went off."], 'No sooner had + 主語 + 過去分詞 + than … の形です。than を when にしないよう注意しましょう。');
  tr('inv', "We did not realise how serious the problem was until we saw the data.", "Not until", ["Not until we saw the data did we realise how serious the problem was.", "Not until we had seen the data did we realise how serious the problem was."], 'Not until の節は普通の語順、主節だけを did we realise と倒置します。');
  tr('inv', "She had no idea that the decision would change her career.", "Little", ["Little did she know that the decision would change her career.", "Little did she know the decision would change her career.", "Little did she realise that the decision would change her career.", "Little did she realise the decision would change her career."], 'Little did + 主語 + know / realise は「まったく知らなかった」という決まった言い方です。');
  fx('inv', "Never I have encountered such a complex case.", ["Never have I encountered such a complex case.", "I have never encountered such a complex case."], 'Never を文頭に置くなら have I と倒置します。倒置しない場合は I have never … の語順です。');
  fx('inv', "Hardly had we arrived than the presentation began.", ["Hardly had we arrived when the presentation began.", "Hardly had we arrived before the presentation began.", "No sooner had we arrived than the presentation began."], 'Hardly / Scarcely は when(または before)、No sooner は than と組み合わせます。');
  fx('inv', "Not only the plan was expensive, but it was also impractical.", ["Not only was the plan expensive, but it was also impractical.", "Not only was the plan expensive, it was also impractical.", "The plan was not only expensive but also impractical."], 'Not only を文頭に置くと、直後の節は was the plan と倒置します。');

  /* ---------- cleft ---------- */
  mc('cleft', "___ worries me most is the lack of a contingency plan.", ["That", "What", "Which", "It"], 1, 'What + 動詞 … is X の分裂文です。What は「〜するもの・こと」を表し、節全体が主語になります。');
  mc('cleft', "It was not until 2019 ___ the company turned a profit.", ["when", "then", "that", "which"], 2, 'It is / was … that の強調構文では、強調する部分が時を表す語句でも that を使います。');
  mc('cleft', "All I did ___ a minor change to the wording.", ["was suggest", "was suggested", "did suggest", "suggesting"], 0, 'All I did was + 原形 の形です。「私がしたのは〜だけだ」という意味になります。');
  mc('cleft', "It is the long-term consequences, not the immediate costs, ___ us.", ["what concern", "that concerns", "which is concerning", "that concern"], 3, '強調構文の that の後ろの動詞は、強調されている名詞(consequences=複数)に一致させます。');
  mc('cleft', "I ___ appreciate your patience during the delay.", ["am", "do", "very", "so much"], 1, '肯定文の動詞の前に do / does / did を置くと、「本当に〜」という強調になります。');
  tr('cleft', "The lack of transparency annoyed the staff.", "What", ["What annoyed the staff was the lack of transparency."], 'What + 動詞 + was + 強調したい名詞 の形にします。');
  tr('cleft', "Her mentor persuaded her to apply.", "It was", ["It was her mentor who persuaded her to apply.", "It was her mentor that persuaded her to apply."], '人を強調するときは It was + 人 + who / that … とします。');
  tr('cleft', "I only want a straight answer.", "All", ["All I want is a straight answer.", "All that I want is a straight answer."], 'All (that) I want is … で「私が求めているのは〜だけだ」という意味になります。');
  tr('cleft', "They rewrote the whole report.", "What they did", ["What they did was rewrite the whole report.", "What they did was to rewrite the whole report."], '動作を強調するときは What + 主語 + did + was + 原形(または to + 原形)とします。');
  fx('cleft', "It was in Kyoto where I first met him.", ["It was in Kyoto that I first met him."], '強調構文では、場所を表す前置詞句を強調するときも where ではなく that を使います。');
  fx('cleft', "The thing what impressed me most was her composure.", ["The thing that impressed me most was her composure.", "The thing which impressed me most was her composure.", "What impressed me most was her composure."], 'what は先行詞を含む語なので、the thing の後ろには置けません。that / which を使うか、What だけで始めます。');
  fx('cleft', "It is the managers who is responsible for the delay.", ["It is the managers who are responsible for the delay.", "It is the managers that are responsible for the delay."], 'who の後ろの動詞は、強調されている the managers(複数)に一致させます。');

  /* ---------- cond ---------- */
  mc('cond', "If she had taken the job in Singapore, she ___ there now.", ["would be living", "would have lived", "will be living", "had been living"], 0, '過去の条件(had taken)が現在の結果(now)につながる混合仮定法です。結果の節は would + 原形 になります。');
  mc('cond', "If I ___ afraid of flying, I would have joined you on the trip last month.", ["am not", "wouldn't be", "weren't", "haven't been"], 2, '今も変わらない性質を条件にするので、if 節は過去形(weren\'t)、結果は過去のことなので would have + 過去分詞 です。');
  mc('cond', "___ you require any further information, please do not hesitate to contact us.", ["Would", "Had", "Were", "Should"], 3, 'If you should require … の if を省いた形です。フォーマルな手紙やメールでよく使われます。');
  mc('cond', "___ for the generosity of our donors, the clinic would have closed years ago.", ["If it would not be", "Had it not been", "Was it not", "Should it not have"], 1, 'If it had not been for … の倒置形 Had it not been for … で「〜がなかったら」を表します。');
  tr('cond', "If we had known about the delay, we would have rebooked.", "Had", ["Had we known about the delay, we would have rebooked."], 'if を省くと Had + 主語 + 過去分詞 の語順になります。');
  tr('cond', "If the negotiations were to fail, both sides would lose.", "Were", ["Were the negotiations to fail, both sides would lose."], 'If + 主語 + were to … は Were + 主語 + to … と倒置できます。');
  tr('cond', "I didn't study medicine, so I'm not a doctor now.", "If", ["If I had studied medicine, I would be a doctor now.", "If I had studied medicine, I would now be a doctor."], '過去の事実と違う条件は過去完了、現在の事実と違う結果は would + 原形 で表します。');
  tr('cond', "If you should change your mind, let me know.", "Should", ["Should you change your mind, let me know.", "Should you change your mind, please let me know."], 'If you should … は Should you … と倒置できます。');
  tr('cond', "We only finished on time because of your help.", "But for", ["But for your help, we would not have finished on time.", "But for your help, we could not have finished on time."], 'But for + 名詞 は「〜がなければ」という意味で、主節は仮定法(would have + 過去分詞)にします。');
  fx('cond', "If I would have known, I would have told you.", ["If I had known, I would have told you.", "Had I known, I would have told you."], 'if 節の中では would を使いません。過去の事実と違う条件は If + 過去完了 で表します。');
  fx('cond', "Unless you don't submit the form by Friday, your application will be rejected.", ["Unless you submit the form by Friday, your application will be rejected.", "If you don't submit the form by Friday, your application will be rejected."], 'unless は if … not の意味をすでに含むので、後ろを否定にすると意味が逆になります。');
  fx('cond', "If he didn't miss the flight yesterday, he would be here with us now.", ["If he hadn't missed the flight yesterday, he would be here with us now."], 'yesterday のことなので、条件の節は過去完了(hadn\'t missed)にします。結果は現在なので would be のままです。');

  /* ---------- part ---------- */
  mc('part', "___ in plain language, the guide is accessible to non-specialists.", ["Writing", "Having written", "Written", "To write"], 2, 'the guide は「書かれる」側なので、過去分詞 Written を使います。');
  mc('part', "___ the report, she emailed it to the board.", ["Finished", "Having finished", "Being finished", "To have finished"], 1, '主節より前に終わった動作は Having + 過去分詞 で表します。she が「終えた」ので能動です。');
  mc('part', "Not ___ what to say, he remained silent.", ["knowing", "known", "having been known", "to know"], 0, '分詞構文の否定は not を分詞の前に置きます。he が「知らない」ので現在分詞です。');
  mc('part', "The issues ___ at yesterday's meeting will be followed up in writing.", ["raising", "having raised", "were raised", "raised"], 3, 'issues は「提起された」ものなので、過去分詞 raised が後ろから名詞を修飾します。');
  tr('part', "Because she had lived in Berlin for years, she spoke fluent German.", "Having", ["Having lived in Berlin for years, she spoke fluent German."], '理由を表す過去完了の節は Having + 過去分詞 にまとめられます。');
  tr('part', "As he didn't want to cause offence, he chose his words carefully.", "Not wanting", ["Not wanting to cause offence, he chose his words carefully."], '否定の理由は Not + -ing で表します。');
  tr('part', "If it is used correctly, the software can save hours of work.", "Used", ["Used correctly, the software can save hours of work."], '受動の条件節は過去分詞だけで表せます。分詞の主語は the software です。');
  tr('part', "After he had been warned about the risks, he decided to proceed anyway.", "Having been", ["Having been warned about the risks, he decided to proceed anyway."], '主節より前の受動の動作は Having been + 過去分詞 で表します。');
  fx('part', "Comparing with last year, sales have risen sharply.", ["Compared with last year, sales have risen sharply.", "Compared to last year, sales have risen sharply."], 'sales は「比べられる」側なので、過去分詞 Compared を使います。');
  fx('part', "Being finished the project, the team took a week off.", ["Having finished the project, the team took a week off.", "Having completed the project, the team took a week off.", "After finishing the project, the team took a week off."], 'チームが「終えた」(能動・完了)ので Having finished とします。');
  fx('part', "The people lived near the airport complained about the noise.", ["The people living near the airport complained about the noise.", "The people who lived near the airport complained about the noise.", "The people who were living near the airport complained about the noise."], '1つの節に動詞が2つ並んでいます。名詞を後ろから修飾するには、現在分詞 living か関係代名詞を使います。');

  /* ---------- subj ---------- */
  mc('subj', "The committee recommended that the policy ___ reviewed annually.", ["is being", "be", "would be", "to be"], 1, 'recommend that の後ろは、主語に関係なく動詞の原形(仮定法現在)を使います。');
  mc('subj', "It's high time the government ___ this issue seriously.", ["takes", "will take", "has taken", "took"], 3, 'It\'s (high) time + 主語 + 過去形 で「もう〜していてよいころだ」を表します。');
  mc('subj', "I'd rather you ___ anyone about this until it's official.", ["didn't tell", "don't tell", "won't tell", "not tell"], 0, 'would rather + 別の主語 の後ろは過去形にします。現在や未来のことでも過去形です。');
  mc('subj', "He described the summit as though he ___ there himself, but he had only read about it.", ["was being", "has been", "had been", "would be"], 2, 'as though の後ろで、過去の事実と違うことは過去完了で表します。');
  tr('subj', "I regret not accepting the offer.", "wish", ["I wish I had accepted the offer."], '過去についての後悔は wish + 過去完了 で表します。');
  tr('subj', "It is essential for every applicant to submit two references.", "that", ["It is essential that every applicant submit two references.", "It is essential that every applicant should submit two references."], 'It is essential that の後ろは原形(または should + 原形)です。三単現の s は付けません。');
  tr('subj', "I would prefer you not to mention it to the client.", "rather", ["I would rather you didn't mention it to the client."], 'would rather + 主語 + 過去形 で、相手にしてほしいこと・してほしくないことを表します。');
  tr('subj', "It's a pity we don't have more time.", "If only", ["If only we had more time."], '現在の事実と違う願望は If only + 過去形 で表します。');
  fx('subj', "I wish I can attend the conference next week.", ["I wish I could attend the conference next week."], 'wish の後ろでは現在形を使わず、can は could にします。');
  fx('subj', "The manager insisted that he attends the training.", ["The manager insisted that he attend the training.", "The manager insisted that he should attend the training."], '要求を表す insist that の後ろは原形(または should + 原形)です。');
  fx('subj', "It's time we leave for the airport.", ["It's time we left for the airport.", "It's time for us to leave for the airport.", "It's time to leave for the airport."], 'It\'s time + 主語 の後ろは過去形にします。for us to leave でも表せます。');

  /* ---------- modal ---------- */
  mc('modal', "The lights are off and the car is gone; they ___ already.", ["must leave", "should leave", "must have left", "can have left"], 2, '過去のことについての確信のある推量は must have + 過去分詞 で表します。');
  mc('modal', "You ___ me earlier — I could have rearranged my schedule.", ["must have told", "should have told", "would tell", "needn't have told"], 1, 'should have + 過去分詞 は「〜すべきだったのに(しなかった)」という意味です。');
  mc('modal', "I ___ so hard on the slides — the meeting was cancelled at the last minute.", ["needn't have worked", "mustn't have worked", "can't have worked", "shouldn't work"], 0, 'needn\'t have + 過去分詞 は「する必要がなかったのにしてしまった」ことを表します。');
  mc('modal', "She ___ the email — she was in the operating theatre all morning without her phone.", ["needn't have sent", "should have sent", "must have sent", "can't have sent"], 3, '「〜したはずがない」は can\'t have + 過去分詞 で表します。');
  tr('modal', "I'm sure he forgot about the deadline.", "must", ["He must have forgotten about the deadline."], '過去のことへの確信は must have + 過去分詞 にします。');
  tr('modal', "It was a mistake for you to sign without reading the terms.", "shouldn't", ["You shouldn't have signed without reading the terms."], 'shouldn\'t have + 過去分詞 は「〜すべきではなかったのに(した)」です。');
  tr('modal', "It's possible that the parcel was delivered to the wrong address.", "may", ["The parcel may have been delivered to the wrong address."], '過去の可能性は may have + 過去分詞、受動なら may have been + 過去分詞 です。');
  tr('modal', "It wasn't necessary for us to book a table, but we did.", "needn't", ["We needn't have booked a table.", "We needn't have booked a table, but we did."], '実際にはしたが不要だったことは needn\'t have + 過去分詞 で表します。');
  fx('modal', "He must had misunderstood the instructions.", ["He must have misunderstood the instructions."], '助動詞の後ろは必ず原形なので、must have + 過去分詞 になります。');
  fx('modal', "I could finally solve the problem after three hours of trying.", ["I was finally able to solve the problem after three hours of trying.", "I finally managed to solve the problem after three hours of trying.", "I was able to finally solve the problem after three hours of trying.", "I managed to finally solve the problem after three hours of trying.", "I finally solved the problem after three hours of trying."], '過去に一度だけ実際に「できた」ことには could ではなく was able to / managed to を使います。');
  fx('modal', "She might forgot to attach the file.", ["She might have forgotten to attach the file."], '過去についての推量は might have + 過去分詞 です。');

  /* ---------- pass ---------- */
  mc('pass', "The suspect is believed ___ the country last week.", ["to leave", "to have left", "having left", "that he left"], 1, '「信じられている」時点より前のことなので、to have + 過去分詞 を使います。');
  mc('pass', "The CEO is expected ___ her resignation tomorrow.", ["to announce", "to have announced", "announcing", "that announces"], 0, 'これからのことなので、is expected to + 原形 です。');
  mc('pass', "We ___ by an independent firm every year.", ["have audited our accounts", "are audited our accounts", "have our accounts audited", "have our accounts audit"], 2, 'have + 目的語 + 過去分詞 で「(専門家に)〜してもらう」を表します。');
  mc('pass', "It ___ that the merger will be completed by June.", ["is understanding", "understands", "has understood", "is understood"], 3, 'It is understood that … は「〜と理解されている/見られている」という伝聞の受動態です。');
  tr('pass', "People say that the company is losing money.", "is said", ["The company is said to be losing money.", "It is said that the company is losing money."], '今進行中のことは is said to be + -ing で表します。');
  tr('pass', "Experts think that the painting was stolen in the 1990s.", "is thought", ["The painting is thought to have been stolen in the 1990s.", "It is thought that the painting was stolen in the 1990s."], '以前のこと、かつ受動なので to have been + 過去分詞 にします。');
  tr('pass', "Reports say that the minister has resigned.", "is reported", ["The minister is reported to have resigned.", "It is reported that the minister has resigned."], 'すでに起きたことは is reported to have + 過去分詞 で表します。');
  tr('pass', "A technician repaired our server yesterday.", "had", ["We had our server repaired yesterday.", "We had our server repaired by a technician yesterday.", "Yesterday we had our server repaired.", "We had our server repaired yesterday by a technician.", "Yesterday we had our server repaired by a technician."], 'have + 目的語 + 過去分詞 で「〜してもらった」を表します。');
  fx('pass', "I was stolen my wallet on the train.", ["I had my wallet stolen on the train.", "My wallet was stolen on the train."], '盗まれたのは財布なので、I を主語にするなら have + 目的語 + 過去分詞 を使います。');
  fx('pass', "He is said that he is the best surgeon in the country.", ["He is said to be the best surgeon in the country.", "It is said that he is the best surgeon in the country."], '人を主語にするなら is said to + 原形、that 節を使うなら主語は It にします。');
  fx('pass', "The accident was happened late at night.", ["The accident happened late at night."], 'happen は自動詞なので受動態にできません。');

  /* ---------- nom ---------- */
  mc('nom', "___ the project succeeds depends largely on funding.", ["If", "Whether", "That", "What"], 1, '文の主語になる「〜かどうか」の節には、if ではなく whether を使います。');
  mc('nom', "___ he resigned so abruptly came as a shock to everyone.", ["What", "Which", "That", "Whether"], 2, '「彼が辞任したということ」という事実を主語にするので、接続詞 That で始めます。');
  mc('nom', "We need to discuss the question of ___ to outsource production.", ["whether", "if", "that", "what"], 0, '前置詞の後ろや to 不定詞の前では、if ではなく whether を使います。');
  mc('nom', "I was struck by ___ quickly the team adapted.", ["what", "that", "which", "how"], 3, 'how + 副詞 + 主語 + 動詞 で「どれほど速く〜したか」という名詞節になります。');
  tr('nom', "He was late again. This annoyed his colleagues.", "The fact that", ["The fact that he was late again annoyed his colleagues."], 'The fact that + 節 を主語にして、2つの文を1つにまとめます。');
  tr('nom', "Why did she turn down the promotion? It remains a mystery.", "Why", ["Why she turned down the promotion remains a mystery."], '名詞節の中は平叙文の語順(she turned down)にします。did は不要です。');
  tr('nom', "It is unclear whether the law will be passed.", "Whether", ["Whether the law will be passed is unclear."], 'whether 節をそのまま主語にできます。動詞は単数(is)です。');
  tr('nom', "The thing that matters is how you respond.", "What", ["What matters is how you respond."], 'The thing that は What 1語で言い換えられます。');
  fx('nom', "I don't know where is the conference room.", ["I don't know where the conference room is."], '間接疑問の中は 主語 + 動詞 の語順にします。');
  fx('nom', "Despite he was exhausted, he finished the report.", ["Despite being exhausted, he finished the report.", "Despite the fact that he was exhausted, he finished the report.", "Although he was exhausted, he finished the report.", "Though he was exhausted, he finished the report.", "Even though he was exhausted, he finished the report.", "Despite his exhaustion, he finished the report."], 'despite は前置詞なので、後ろに節を直接置けません。-ing、the fact that、または although を使います。');
  fx('nom', "Could you tell me what does this term mean?", ["Could you tell me what this term means?"], '間接疑問では does を使わず、what this term means の語順にします。');

  /* ---------- ellip ---------- */
  mc('ellip', "\"Will the deadline be extended?\" \"I hope ___.\"", ["it", "so", "that", "yes"], 1, 'hope / think / expect の後ろで、前の節全体の代わりに so を使います。');
  mc('ellip', "She was asked to step down, but she refused ___.", ["to", "it", "so", "do"], 0, 'refuse to step down のくり返しを避け、to だけを残します。');
  mc('ellip', "I've never worked abroad, and ___ my colleagues.", ["so have", "neither do", "neither have", "nor haven't"], 2, '否定文を受けて「〜もそうではない」は neither + 助動詞 + 主語。助動詞は前の文(have)に合わせます。');
  mc('ellip', "Anyone wishing to cancel should ___ at least 48 hours in advance.", ["do it so", "make so", "do such", "do so"], 3, 'do so は前に出た動詞句(cancel)の代わりをする、ややフォーマルな言い方です。');
  tr('ellip', "He doesn't enjoy networking events, and his partner doesn't enjoy them either.", "neither", ["He doesn't enjoy networking events, and neither does his partner.", "He doesn't enjoy networking events, neither does his partner."], 'neither + does + 主語 の語順で、同じ内容のくり返しを省きます。');
  tr('ellip', "The first draft was weak, but the second draft was excellent.", "one", ["The first draft was weak, but the second one was excellent."], '可算名詞のくり返しは one で置き換えます。');
  tr('ellip', "She speaks Mandarin, and her brother speaks Mandarin too.", "so", ["She speaks Mandarin, and so does her brother."], '肯定文を受けて「〜もそうだ」は so + 助動詞 + 主語 です。');
  tr('ellip', "You can leave early if you want to leave early.", "to", ["You can leave early if you want to."], 'to 不定詞のくり返しは、to だけを残して省略します。');
  fx('ellip', "I don't like spicy food, and my wife doesn't too.", ["I don't like spicy food, and my wife doesn't either.", "I don't like spicy food, and neither does my wife.", "I don't like spicy food, and nor does my wife.", "I don't like spicy food, nor does my wife."], '否定文で「〜も」は too ではなく either を使います。');
  fx('ellip', "She can speak three languages, and so her sister can.", ["She can speak three languages, and so can her sister."], '「〜もそうだ」の so の後ろは 助動詞 + 主語 の語順です。');
  fx('ellip', "Will it rain tomorrow? I hope not so.", ["Will it rain tomorrow? I hope not."], '否定の内容を受けるときは I hope not と言い、so は付けません。');

  /* ---------- art ---------- */
  mc('art', "She gave me ___ on how to negotiate a salary.", ["a good advice", "some good advice", "good advices", "the good advices"], 1, 'advice は不可算名詞なので、a を付けたり複数形にしたりできません。');
  mc('art', "___ is changing the way we work.", ["The technology", "A technology", "Technology", "The technologies"], 2, '技術一般について述べているので、無冠詞の不可算名詞を使います。');
  mc('art', "He is ___ only person who understands the legacy system.", ["the", "a", "an", "(冠詞なし)"], 0, 'only で1人に特定されるので the を使います。');
  mc('art', "The team conducted ___ into consumer behaviour.", ["a research", "researches", "an extensive research", "extensive research"], 3, 'research は不可算名詞です。形容詞が付いても a / an は付けません。');
  tr('art', "She gave me several useful suggestions.", "advice", ["She gave me some useful advice.", "She gave me useful advice.", "She gave me several pieces of useful advice.", "She gave me a lot of useful advice.", "She gave me several useful pieces of advice."], 'advice は数えられないので、some や pieces of を使って量を表します。');
  tr('art', "We don't have many chairs and tables in the new office.", "furniture", ["We don't have much furniture in the new office.", "We don't have a lot of furniture in the new office."], 'furniture は不可算名詞なので、many ではなく much を使います。');
  tr('art', "There were only a few pieces of evidence against him.", "little", ["There was little evidence against him.", "There was only a little evidence against him.", "There was very little evidence against him."], 'evidence は不可算名詞なので、動詞は was、量は little で表します。');
  tr('art', "Not many people attended the lecture.", "Few", ["Few people attended the lecture.", "Very few people attended the lecture."], 'a の付かない few は「ほとんど〜ない」という否定的な意味になります。');
  fx('art', "I need to buy a new equipment for the lab.", ["I need to buy new equipment for the lab.", "I need to buy some new equipment for the lab.", "I need to buy a new piece of equipment for the lab."], 'equipment は不可算名詞なので a を付けられません。');
  fx('art', "The life in Tokyo is very expensive.", ["Life in Tokyo is very expensive."], '「東京での生活」は一般的な話なので、life に the は付けません。');
  fx('art', "She works as engineer at a car manufacturer.", ["She works as an engineer at a car manufacturer."], '職業を表す単数の可算名詞には a / an が必要です。');
  fx('art', "Most of people in my office commute by train.", ["Most people in my office commute by train.", "Most of the people in my office commute by train."], 'most + 名詞、または most of the + 名詞 の形にします。most of people とは言いません。');

  /* ---------- prep ---------- */
  mc('prep', "The success of the launch depends ___ the weather.", ["on", "of", "from", "by"], 0, 'depend on で「〜しだいである」です。');
  mc('prep', "We need to discuss ___ before the client arrives.", ["about the budget", "on the budget", "the budget", "for the budget"], 2, 'discuss は他動詞なので、前置詞なしで目的語を続けます。');
  mc('prep', "She is highly capable ___ under pressure.", ["to work", "of working", "for working", "in working"], 1, 'capable of + -ing の形です。able to + 原形 と混同しないようにしましょう。');
  mc('prep', "Please submit the form ___ Friday at the latest.", ["until", "till", "within", "by"], 3, '期限(〜までに)は by で表します。until は「〜までずっと」という継続を表します。');
  mc('prep', "There has been a sharp increase ___ demand for remote roles.", ["of", "in", "on", "at"], 1, '「〜の増加」は an increase in + 名詞 です。');
  tr('prep', "A software fault caused the delay.", "resulted", ["A software fault resulted in the delay.", "The delay resulted from a software fault."], 'result in + 結果、result from + 原因 を使い分けます。');
  tr('prep', "She manages the marketing team.", "charge", ["She is in charge of the marketing team."], 'be in charge of で「〜を担当・統括している」です。');
  tr('prep', "He said sorry because he had missed the meeting.", "apologised", ["He apologised for missing the meeting.", "He apologised for having missed the meeting."], 'apologise for + -ing で「〜したことを謝る」です。');
  tr('prep', "They said the manager was responsible for the error.", "blamed", ["They blamed the manager for the error.", "They blamed the error on the manager."], 'blame + 人 + for + 事、または blame + 事 + on + 人 の形です。');
  fx('prep', "We arrived to the airport two hours early.", ["We arrived at the airport two hours early."], 'arrive は to ではなく at(地点)/ in(都市・国)をとります。');
  fx('prep', "I'm looking forward to see you next week.", ["I'm looking forward to seeing you next week."], 'look forward to の to は前置詞なので、後ろは -ing 形です。');
  fx('prep', "She married with a colleague from the Osaka office.", ["She married a colleague from the Osaka office.", "She got married to a colleague from the Osaka office."], 'marry は他動詞です。get married なら to を使います。');
  fx('prep', "He explained me the procedure in detail.", ["He explained the procedure to me in detail.", "He explained the procedure in detail to me.", "He explained to me the procedure in detail."], 'explain は 人 を直接目的語にとれません。explain + 事 + to + 人 の形にします。');

  /* ---------- tense ---------- */
  mc('tense', "By the time the auditors arrive next month, we ___ all the records.", ["will update", "will have updated", "have updated", "are updating"], 1, '未来のある時点までに完了していることは will have + 過去分詞 で表します。');
  mc('tense', "I ___ for this company since 2015, and I still enjoy it.", ["work", "am working", "had worked", "have been working"], 3, 'since + 過去の時点 で今まで続いていることは、現在完了(進行形)で表します。');
  mc('tense', "When I got to the station, the train ___.", ["already left", "has already left", "had already left", "would already leave"], 2, '「駅に着いた」時点より前に出発していたので、過去完了を使います。');
  mc('tense', "This is the first time I ___ a presentation in English.", ["have given", "give", "am giving", "had given"], 0, 'This is the first time の後ろは現在完了にします。');
  mc('tense', "I'll call you as soon as the results ___.", ["will come in", "come in", "would come in", "will have come in"], 1, 'as soon as など時を表す節の中では、未来のことでも現在形を使います。');
  tr('tense', "I started learning English ten years ago and I'm still learning it.", "have been", ["I have been learning English for ten years.", "I have been learning English for the past ten years.", "I have been learning English for the last ten years."], '過去に始めて今も続いている動作は have been + -ing + for + 期間 で表します。');
  tr('tense', "The last time I saw her was in 2020.", "since", ["I haven't seen her since 2020."], '「〜以来会っていない」は 現在完了の否定 + since + 過去の時点 です。');
  tr('tense', "It's three years since we last met.", "for", ["We haven't met for three years."], '期間を表すときは for を使い、動詞は現在完了にします。');
  tr('tense', "We arrived after the film had started.", "By the time", ["By the time we arrived, the film had started.", "By the time we arrived, the film had already started."], 'By the time + 過去形, 過去完了 で、到着より前に始まっていたことを表します。');
  fx('tense', "I have visited Kyoto last year.", ["I visited Kyoto last year."], 'last year のように終わった時を示す語句があるときは、過去形を使います。');
  fx('tense', "I am knowing him since we were at university.", ["I have known him since we were at university."], 'know は状態動詞なので進行形にしません。since があるので現在完了にします。');
  fx('tense', "If it will rain tomorrow, the event will be postponed.", ["If it rains tomorrow, the event will be postponed."], '条件を表す if 節の中では、未来のことでも現在形を使います。');

  /* ---------- vpat ---------- */
  mc('vpat', "I regret ___ you that your application has been unsuccessful.", ["informing", "to inform", "inform", "to informing"], 1, 'regret to + 原形 は「残念ながら(これから)〜する」。regret + -ing は「〜したことを後悔する」です。');
  mc('vpat', "She suggested ___ the launch until spring.", ["to postpone", "us to postpone", "postponing", "postpone to"], 2, 'suggest は -ing または that 節をとり、to 不定詞はとりません。');
  mc('vpat', "He stopped ___ a coffee on the way to work, so he was ten minutes late.", ["to buy", "buying", "buy", "having bought"], 0, 'stop to + 原形 は「〜するために立ち止まる」。stop + -ing は「〜するのをやめる」です。');
  mc('vpat', "The new system enables staff ___ remotely.", ["working", "work", "for working", "to work"], 3, 'enable + 目的語 + to 不定詞 の形です。');
  mc('vpat', "I remember ___ the door, but it was open when I came back.", ["to lock", "locking", "lock", "to be locked"], 1, 'remember + -ing は「〜したことを覚えている」。remember to + 原形 は「忘れずに〜する」です。');
  tr('vpat', "'Why don't we hire a consultant?' said Maria.", "suggested", ["Maria suggested hiring a consultant.", "Maria suggested that we hire a consultant.", "Maria suggested we hire a consultant.", "Maria suggested that we should hire a consultant.", "Maria suggested we should hire a consultant.", "Maria suggested that they hire a consultant.", "Maria suggested that they should hire a consultant."], 'suggest + -ing、または suggest (that) + 主語 + (should) + 原形 の形にします。');
  tr('vpat', "There's no point in complaining about it.", "worth", ["It's not worth complaining about it.", "It's not worth complaining about.", "It isn't worth complaining about it.", "It isn't worth complaining about."], 'be worth + -ing で「〜する価値がある」です。to 不定詞は使いません。');
  tr('vpat', "They didn't let us use the main entrance.", "allowed", ["We weren't allowed to use the main entrance."], 'let + 目的語 + 原形 に対して、allow は 目的語 + to 不定詞 をとります。');
  tr('vpat', "'I didn't leak the document,' he said.", "denied", ["He denied leaking the document.", "He denied having leaked the document.", "He denied that he had leaked the document.", "He denied he had leaked the document."], 'deny + -ing(または having + 過去分詞)で「〜したことを否定する」です。');
  fx('vpat', "I'm used to work late on Fridays.", ["I'm used to working late on Fridays."], 'be used to(〜に慣れている)の to は前置詞なので、後ろは -ing 形です。');
  fx('vpat', "My boss made me to rewrite the proposal.", ["My boss made me rewrite the proposal."], '使役の make は 目的語 + 原形 をとり、to は付けません。');
  fx('vpat', "She avoided to answer the question directly.", ["She avoided answering the question directly."], 'avoid は -ing をとる動詞です。');

  /* ---------- order ---------- */
  mc('order', "He ___ late for meetings.", ["is always", "always is", "is being always", "always be"], 0, '頻度の副詞は be 動詞の後ろに置きます。');
  mc('order', "The number of applicants ___ risen sharply this year.", ["have", "are", "has", "were"], 2, 'the number of + 複数名詞 は「〜の数」で、単数扱いです。');
  mc('order', "A number of employees ___ expressed concern about the changes.", ["has", "have", "is", "was"], 1, 'a number of + 複数名詞 は「いくつかの〜」で、複数扱いです。');
  mc('order', "I ___ the instructions.", ["understood hardly", "understood hard", "hard understood", "hardly understood"], 3, 'hardly(ほとんど〜ない)は一般動詞の前に置きます。hard とは意味が違います。');
  mc('order', "Each of the proposals ___ to be assessed on its own merits.", ["need", "needs", "are needing", "have"], 1, 'each of + 複数名詞 は単数扱いです。');
  mc('order', "The list of items discussed at the meetings ___ attached.", ["are", "have been", "is", "were"], 2, '主語の中心は The list(単数)なので、動詞は is です。直前の meetings に引きずられないようにしましょう。');
  tr('order', "All the departments have their own budget.", "Each", ["Each department has its own budget.", "Each of the departments has its own budget."], 'each は単数扱いなので、has / its に変えます。');
  tr('order', "It is probable that she will accept the offer.", "probably", ["She will probably accept the offer."], 'probably は助動詞 will の後ろ、動詞の前に置きます。');
  tr('order', "Many people have criticised the plan.", "A number of", ["A number of people have criticised the plan."], 'a number of + 複数名詞 は複数扱いなので、have のままです。');
  tr('order', "There is no doubt that he is the best candidate.", "definitely", ["He is definitely the best candidate."], 'definitely は be 動詞の後ろに置きます。');
  fx('order', "I like very much Italian food.", ["I like Italian food very much.", "I very much like Italian food.", "I really like Italian food."], '動詞と目的語の間に very much は入れられません。');
  fx('order', "Everyone in the three departments have agreed to the plan.", ["Everyone in the three departments has agreed to the plan."], 'everyone は単数扱いです。途中の departments に動詞を合わせません。');
  fx('order', "The quality of these products are excellent.", ["The quality of these products is excellent."], '主語の中心は The quality(単数)なので、動詞は is です。');
  fx('order', "He always is complaining about the workload.", ["He is always complaining about the workload."], 'always は be 動詞の後ろ、-ing の前に置きます。');

  /* ---------- perf (core) ---------- */
  mc('perf', "We ___ to Osaka three years ago.", ["have moved", "moved", "have been moving", "had moved"], 1, 'three years ago のように終わった時を示す語句があるので、過去形を使います。現在完了は ago と一緒に使えません。');
  mc('perf', "Have you ever ___ sushi?", ["eat", "ate", "eaten", "eating"], 2, '経験をたずねる Have you ever の後ろは過去分詞です。');
  mc('perf', "She ___ for this company since she graduated.", ["works", "is working", "has worked", "worked"], 2, 'since + 過去の時点 で今まで続いていることは、現在完了で表します。現在形や現在進行形は使えません。');
  mc('perf', "When ___ the news?", ["have you heard", "did you hear", "have you been hearing", "you heard"], 1, 'When は「いつ」と過去の時点をたずねるので、現在完了ではなく過去形の疑問文にします。');
  mc('perf', "It ___ since this morning, so the roads are very wet.", ["rained", "is raining", "has been raining", "rains"], 2, '朝から今まで続いている動作なので、現在完了進行形(has been + -ing)を使います。');
  mc('perf', "\"How long ___ English?\" \"Since I was twelve, and I'm still taking classes.\"", ["do you learn", "are you learning", "have you been learning", "did you learn"], 2, '過去に始めて今も続いている動作の長さをたずねるので、How long have you been + -ing にします。');
  tr('perf', "I started working here three years ago.", "for", ["I have worked here for three years.", "I have been working here for three years."], '今も続いていることは 現在完了(進行形) + for + 期間 で表します。');
  tr('perf', "The last time I ate meat was in 2022.", "since", ["I haven't eaten meat since 2022.", "I have not had meat since 2022."], '「〜以来していない」は 現在完了の否定 + since + 過去の時点 です。');
  tr('perf', "This is my first visit to Hokkaido.", "never", ["I have never been to Hokkaido before.", "I have never been to Hokkaido.", "I have never visited Hokkaido before.", "I have never visited Hokkaido."], '経験がないことは have never + 過去分詞 で表します。「行ったことがある」は have been to がよく使われます。');
  tr('perf', "She started waiting for the bus forty minutes ago, and she is still waiting.", "been", ["She has been waiting for the bus for forty minutes.", "She has been waiting for forty minutes for the bus."], '過去に始まり今も続く動作は has been + -ing + for + 期間 で表します。');
  fx('perf', "I have seen him at the station yesterday.", ["I saw him at the station yesterday."], 'yesterday は終わった時を示すので、現在完了ではなく過去形にします。');
  fx('perf', "I live in this flat for five years.", ["I have lived in this flat for five years.", "I have been living in this flat for five years."], '「5年間住んでいる」は今まで続いている状態なので、現在形ではなく現在完了にします。');
  fx('perf', "When have you arrived in Japan?", ["When did you arrive in Japan?"], 'When で始まる疑問文には現在完了を使わず、過去形にします。');
  fx('perf', "I am waiting here since ten o'clock.", ["I have been waiting here since ten o'clock.", "I have waited here since ten o'clock."], 'since + 時点 があるので、現在進行形ではなく現在完了進行形にします。');

  /* ---------- ifs (core) ---------- */
  mc('ifs', "If you heat ice, it ___.", ["melts", "would melt", "melted", "will have melted"], 0, 'いつも成り立つ事実(一般的な法則)は If + 現在形, 現在形 で表します(第0条件文)。');
  mc('ifs', "If it ___ tomorrow, we'll cancel the picnic.", ["will rain", "rains", "rained", "would rain"], 1, '第1条件文では、未来のことでも if 節の中は現在形です。will は主節にだけ使います。');
  mc('ifs', "If I ___ you, I would talk to your manager.", ["am", "will be", "were", "have been"], 2, '「もし私があなたなら」は事実と違う想像なので、If I were you, I would … の形にします。');
  mc('ifs', "If we ___ the map, we wouldn't have got lost.", ["checked", "had checked", "would check", "have checked"], 1, '過去の事実と違う想像(第3条件文)なので、if 節は had + 過去分詞 です。');
  mc('ifs', "I wish I ___ a car. Taking the bus every day is so tiring.", ["have", "had", "will have", "would have had"], 1, '今の事実と違う願望は wish + 過去形 で表します。');
  mc('ifs', "If she had studied harder, she ___ the exam.", ["would pass", "will pass", "would have passed", "passed"], 2, 'if 節が had + 過去分詞 の第3条件文なので、主節は would have + 過去分詞 です。');
  tr('ifs', "I don't have enough money, so I can't buy a new laptop.", "If", ["If I had enough money, I could buy a new laptop.", "If I had enough money, I would buy a new laptop.", "If I had more money, I could buy a new laptop.", "If I had more money, I would buy a new laptop."], '今の事実と違う想像なので、If + 過去形, could / would + 原形 にします。');
  tr('ifs', "We didn't book a table, so we couldn't get in.", "If", ["If we had booked a table, we could have got in.", "If we had booked a table, we would have got in.", "If we had booked a table, we could have gotten in.", "If we had booked a table, we would have gotten in.", "If we had booked a table, we would have been able to get in."], '過去の事実と違う想像なので、If + had + 過去分詞, could / would have + 過去分詞 にします。');
  tr('ifs', "I'm sorry I didn't say goodbye to her.", "wish", ["I wish I had said goodbye to her."], '過去についての後悔は wish + had + 過去分詞 で表します。');
  tr('ifs', "You must leave now, or you will miss the last train.", "Unless", ["Unless you leave now, you will miss the last train."], 'unless は「〜しない限り」(if … not)の意味です。unless 節の中も、未来のことを現在形で表します。');
  fx('ifs', "If it will be sunny tomorrow, we'll go to the beach.", ["If it is sunny tomorrow, we'll go to the beach."], '条件を表す if 節の中では、未来のことでも will を使わず現在形にします。');
  fx('ifs', "If I would have more time, I would join a gym.", ["If I had more time, I would join a gym."], 'if 節の中には would を入れません。今の事実と違う条件は If + 過去形 で表します。');
  fx('ifs', "I wish I can speak French.", ["I wish I could speak French."], 'wish の後ろでは現在形を使わず、can は could にします。');
  fx('ifs', "If I had known about the party, I would come.", ["If I had known about the party, I would have come."], '過去のパーティーについての想像(第3条件文)なので、主節は would have + 過去分詞 にします。');

  /* ---------- pasv (core) ---------- */
  mc('pasv', "English ___ in many countries around the world.", ["speaks", "is speaking", "is spoken", "has spoken"], 2, '英語は「話される」側なので、受動態 is spoken を使います。');
  mc('pasv', "The Eiffel Tower ___ in 1889.", ["was completed", "completed", "has been completed", "is completed"], 0, '塔は「完成させられた」側で、1889年という過去の時点があるので was + 過去分詞 です。');
  mc('pasv', "The road is closed because it ___ at the moment.", ["repairs", "is repairing", "is being repaired", "has repaired"], 2, '「今、修理されているところ」は進行形の受動態 is being + 過去分詞 で表します。');
  mc('pasv', "Your order ___ tomorrow morning.", ["will deliver", "will be delivered", "is delivering", "delivers"], 1, '注文品は「配達される」側なので、未来の受動態 will be + 過去分詞 にします。');
  mc('pasv', "The meeting room must ___ before the guests arrive.", ["clean", "be cleaning", "be cleaned", "have cleaned"], 2, '部屋は「掃除される」側なので、助動詞 + be + 過去分詞 にします。');
  mc('pasv', "I ___ in Kobe, but I grew up in Tokyo.", ["born", "was born", "have born", "am born"], 1, '「生まれた」は英語では受動態 was born で表します。be 動詞を落とさないようにしましょう。');
  tr('pasv', "Someone stole my bike last night.", "was stolen", ["My bike was stolen last night."], '行為者(someone)がわからないときは、受動態にして by … は付けません。');
  tr('pasv', "They are building a new hospital in our town.", "is being", ["A new hospital is being built in our town."], '進行形の受動態は is being + 過去分詞 です。');
  tr('pasv', "Somebody has cancelled the meeting.", "has been", ["The meeting has been cancelled.", "The meeting has been canceled."], '現在完了の受動態は has been + 過去分詞 です。');
  tr('pasv', "You must wear a helmet on the building site.", "must be", ["A helmet must be worn on the building site.", "Helmets must be worn on the building site."], '助動詞の受動態は must be + 過去分詞 です。wear の過去分詞は worn です。');
  fx('pasv', "The package was arrived this morning.", ["The package arrived this morning."], 'arrive は目的語をとらない自動詞なので、受動態にできません。');
  fx('pasv', "This book wrote by a famous Japanese author.", ["This book was written by a famous Japanese author."], '本は「書かれた」側なので、was + 過去分詞(written)にします。');
  fx('pasv', "The results will announce next week.", ["The results will be announced next week."], '結果は「発表される」側なので、will be + 過去分詞 にします。');
  fx('pasv', "My car is repairing at the garage now.", ["My car is being repaired at the garage now."], '車は「修理される」側なので、is being + 過去分詞 にします。');

  /* ---------- rel (core) ---------- */
  mc('rel', "The man ___ car was stolen called the police.", ["who", "whose", "which", "that"], 1, '「その人の車」という所有の関係なので whose を使います。');
  mc('rel', "This is the hotel ___ we stayed last summer.", ["which", "where", "what", "who"], 1, '節の中に場所を表す語がない(we stayed で終わる)ので、場所の関係副詞 where を使います。which なら stayed at が必要です。');
  mc('rel', "My grandmother, ___ is 90, still goes swimming every week.", ["that", "which", "who", "whose"], 2, 'カンマ付きの非制限用法で人を説明するときは who を使います。that は使えません。');
  mc('rel', "I lost the umbrella ___ you lent me.", ["who", "whose", "what", "which"], 3, '先行詞 the umbrella(もの)を説明するので which を使います。what は先行詞を含むので名詞の後ろには置けません。');
  mc('rel', "She passed the exam, ___ surprised everyone.", ["that", "which", "what", "who"], 1, '前の文全体(試験に合格したこと)を受けるときは、カンマ + which を使います。');
  tr('rel', "I met a woman. She speaks five languages.", "who", ["I met a woman who speaks five languages."], '人を説明する関係代名詞 who で2つの文をつなぎます。She は消します。');
  tr('rel', "This is the restaurant. We had our first date there.", "where", ["This is the restaurant where we had our first date."], '場所を説明するときは where を使い、there は消します。');
  tr('rel', "I have a friend. His father is a famous actor.", "whose", ["I have a friend whose father is a famous actor."], '所有を表す his を whose に置き換えてつなぎます。');
  tr('rel', "Tokyo is the capital of Japan. It has a population of about 14 million.", "which", ["Tokyo, which is the capital of Japan, has a population of about 14 million.", "Tokyo, which has a population of about 14 million, is the capital of Japan."], '固有名詞に追加情報を加えるときは、カンマで区切った非制限用法の which を使います。');
  fx('rel', "The book that I bought it yesterday is very interesting.", ["The book that I bought yesterday is very interesting.", "The book which I bought yesterday is very interesting.", "The book I bought yesterday is very interesting."], '関係代名詞 that が bought の目的語の役割をしているので、it を残してはいけません。');
  fx('rel', "My father, that works in a bank, is retiring next year.", ["My father, who works in a bank, is retiring next year."], 'カンマ付きの非制限用法では that を使えません。人なので who にします。');
  fx('rel', "The people which live upstairs are very noisy.", ["The people who live upstairs are very noisy.", "The people that live upstairs are very noisy."], '人を説明するときは which ではなく who(または that)を使います。');
  fx('rel', "Kyoto is the city where I was born in.", ["Kyoto is the city where I was born.", "Kyoto is the city that I was born in.", "Kyoto is the city which I was born in.", "Kyoto is the city I was born in.", "Kyoto is the city in which I was born."], 'where には in の意味が含まれているので、最後の in は不要です。in を残すなら that / which を使います。');

  /* ---------- rep (core) ---------- */
  mc('rep', "She ___ me that she would be late.", ["said", "told", "asked", "spoke"], 1, '「人」を直接目的語にとるのは tell です。say なら said (to me) that … となります。');
  mc('rep', "He asked me where ___.", ["did I work", "I worked", "do I work", "was I working"], 1, '伝える疑問文の中は、疑問文の語順ではなく 主語 + 動詞 の語順にします。');
  mc('rep', "Last night Tom said, \"I'm really tired.\" → Last night Tom said that he ___ really tired.", ["is", "was", "has been", "will be"], 1, '昨夜の発言を伝えるので、am を1つ過去にずらして was にします。');
  mc('rep', "The teacher told us ___ our phones during the test.", ["not use", "to not using", "not to use", "don't use"], 2, '否定の命令は tell + 人 + not to + 原形 で伝えます。');
  mc('rep', "She asked me ___ I had ever been to Korea.", ["that", "if", "what", "did"], 1, 'Yes / No でたずねる疑問文を伝えるときは、ask + 人 + if / whether を使います。');
  mc('rep', "A week ago he said, \"I'll call you tomorrow.\" → A week ago he said he would call me ___.", ["tomorrow", "the next day", "yesterday", "the day before"], 1, '1週間前の発言なので、tomorrow は「その翌日」 the next day に変えます。');
  tr('rep', "\"I am working from home,\" Anna said.", "said", ["Anna said that she was working from home.", "Anna said she was working from home."], 'said の後ろでは am working を was working にずらし、I を she に変えます。');
  tr('rep', "\"Do you like sushi?\" Ken asked me.", "asked", ["Ken asked me if I liked sushi.", "Ken asked me whether I liked sushi.", "Ken asked if I liked sushi.", "Ken asked whether I liked sushi."], 'Yes / No 疑問文は asked (me) if / whether + 主語 + 動詞 にし、時制を過去にずらします。');
  tr('rep', "\"Please close the window,\" she said to me.", "asked", ["She asked me to close the window."], '依頼は ask + 人 + to 不定詞 で伝えます。');
  tr('rep', "\"Where did you buy that jacket?\" he asked her.", "asked", ["He asked her where she had bought that jacket.", "He asked her where she had bought the jacket.", "He asked her where she bought that jacket.", "He asked her where she bought the jacket."], '疑問詞 + 主語 + 動詞 の語順にし、did you buy は had bought(または bought)にします。');
  fx('rep', "He said me that he was busy.", ["He told me that he was busy.", "He told me he was busy.", "He said that he was busy.", "He said he was busy.", "He said to me that he was busy."], 'say は「人」を直接目的語にとれません。told me にするか、said (to me) にします。');
  fx('rep', "She asked me what time was it.", ["She asked me what time it was."], '伝える疑問文の中は 主語 + 動詞 の語順(it was)にします。');
  fx('rep', "My boss told to me to finish the report by Friday.", ["My boss told me to finish the report by Friday."], 'tell は前置詞なしで「人」を目的語にとります。told me to + 原形 の形です。');
  fx('rep', "She asked me if did I need any help.", ["She asked me if I needed any help.", "She asked me whether I needed any help.", "She asked me if I need any help.", "She asked me whether I need any help."], 'if の後ろは疑問文の語順にせず、主語 + 動詞 にします。did は不要です。');

  /* ---------- mod (core) ---------- */
  mc('mod', "She's been working for twelve hours. She ___ be exhausted.", ["must", "can't", "mustn't", "doesn't have to"], 0, '状況から確信をもって推量するときは must + 原形 を使います。');
  mc('mod', "That ___ be Tom at the door — he's in London this week.", ["must", "can't", "mustn't", "has to"], 1, '「〜のはずがない」という否定の推量は can\'t です。mustn\'t は禁止の意味になります。');
  mc('mod', "You ___ smoke inside the hospital. It's against the rules.", ["don't have to", "mustn't", "needn't", "might not"], 1, '規則で禁止されていることは mustn\'t で表します。don\'t have to / needn\'t は「しなくてよい」です。');
  mc('mod', "Tomorrow is a holiday, so I ___ get up early.", ["mustn't", "can't", "don't have to", "shouldn't"], 2, '「早起きする必要がない」は don\'t have to です。mustn\'t だと「早起きしてはいけない」になります。');
  mc('mod', "I'm not sure where Mika is. She ___ be in the library.", ["must", "might", "can't", "has to"], 1, '確信がないときの推量は might / may / could を使います。');
  mc('mod', "You look ill. You ___ go home and rest.", ["should", "mustn't", "can't", "needn't"], 0, '相手への助言は should + 原形 で表します。');
  tr('mod', "I'm sure he is at home — his car is outside.", "must", ["He must be at home — his car is outside.", "He must be at home because his car is outside.", "His car is outside, so he must be at home.", "He must be at home."], '今のことについての確信は must + 原形 で表します。');
  tr('mod', "It's not necessary for you to bring any food.", "have to", ["You don't have to bring any food."], '「〜する必要はない」は don\'t have to + 原形 です。');
  tr('mod', "I'm sure this isn't the right address.", "can't", ["This can't be the right address."], '「〜のはずがない」は can\'t + 原形 で表します。');
  tr('mod', "It is against the rules to use your phone during the exam.", "mustn't", ["You mustn't use your phone during the exam.", "You mustn't use your phone in the exam."], '規則による禁止は mustn\'t + 原形 で表します。');
  tr('mod', "Perhaps she is stuck in traffic.", "might", ["She might be stuck in traffic."], '「〜かもしれない」は might + 原形 です。');
  fx('mod', "He mustn't be the manager — he only started here last week.", ["He can't be the manager — he only started here last week."], '「〜のはずがない」は can\'t で表します。mustn\'t は「〜してはいけない」という禁止です。');
  fx('mod', "You must to wear a seat belt.", ["You must wear a seat belt.", "You have to wear a seat belt."], 'must の後ろは to を付けずに原形を置きます。');
  fx('mod', "We mustn't hurry — the film doesn't start until eight.", ["We don't have to hurry — the film doesn't start until eight.", "We needn't hurry — the film doesn't start until eight.", "We don't need to hurry — the film doesn't start until eight."], '「急ぐ必要はない」は don\'t have to / needn\'t で表します。mustn\'t だと「急いではいけない」になります。');
  fx('mod', "I have to finished this by tonight.", ["I have to finish this by tonight."], 'have to の後ろは動詞の原形です。');

  window.C1_GRAMMAR = { units, items };
})();
