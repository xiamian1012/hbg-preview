/* ============================================================
 * demo-data.js — 共享数据：演示对话、图表配置、Skill 元数据
 * Hero 演示与 Interactive 演示共用同一份数据，避免重复维护
 * ============================================================ */

const INSTALL_SKILLS = [
  ['direct', '直销', 'hbg-direct'],
  ['company', '公司', 'hbg-company'],
  ['channel', '渠道', 'hbg-channel'],
  ['mdc', 'MDC', 'hbg-mdc'],
  ['max', 'MAX', 'hbg-max'],
  ['xinghuo', '星火', 'hbg-xinghuo']
];

const SKILLS = {
  direct: {
    name: '直销', code: 'hbg-direct', st: 'on', stt: '已上线', en: 'HBG · 城市级直销',
    desc: '基于智能看板底层数据，业务专题自然语言查询，覆盖二租商业务，支持组织架构多层级下钻，从城市一路拆到销售。',
    uses: ['房产业绩 / 达成率 / 续费率等专业口径', '全国 → 大区 → 城市 → 团队 → 部门 → 销售 逐级下钻', '资源大盘、流量线索、竞争格局专题', '自动归因定位业绩缺口到具体群体'],
    ex: '「分析下上海今年的业绩数据，达成情况」',
    cmd: 'curl -fsSL https://raw.githubusercontent.com/58hbg/wenshu-hbg/main/skills/install.sh | bash -s -- direct'
  },
  company: {
    name: '公司', code: 'hbg-company', st: 'on', stt: '已上线', en: 'HBG · 公司级',
    desc: '全量经纪公司数据，公司级指标覆盖业绩/会员/连接/资源/套餐/增值等业务专题，支持跨公司横向对比与榜单，可与直销联动分析，为客户定制分析报告。',
    uses: ['公司业绩 / 新签拉回 / 现金流 / 房源生态', '跨公司横向对比与 Top / Bottom 榜单', '公司为最细粒度，crm_company_id 维度', '与直销城市口径联动分析'],
    ex: '「对比上海 3 家经纪公司本月的业绩结构」',
    cmd: 'curl -fsSL https://raw.githubusercontent.com/58hbg/wenshu-hbg/main/skills/install.sh | bash -s -- company'
  },
  channel: {
    name: '渠道', code: 'hbg-channel', st: 'dev', stt: '开发中', en: 'HBG · 渠道',
    desc: '使用渠道特定组织架构（渠道-大区-高经-渠经-主城-城市），可一路拆分；面向渠道业务的数据接入与统一查询，补齐直销/公司后的「渠道侧」视图，开发中。',
    uses: ['渠道业绩 / 渠道拓展专题', '渠道数据源统一接入（规划中）', '与直销、公司同一条查询链路'],
    ex: '「我想看渠道业务这个月的数据」',
    cmd: 'curl -fsSL https://raw.githubusercontent.com/58hbg/wenshu-hbg/main/skills/install.sh | bash -s -- channel'
  },
  mdc: {
    name: 'MDC', code: 'hbg-mdc', st: 'inner', stt: '内部平台', en: 'HBG · 语义查询',
    desc: '覆盖 180+ API（直销/渠道/代理/经纪/爱房/巧房/HBG），自然语言查询业绩、端口、续费、透支、商圈等 MDC 看板，与 HBG 数据源同一链路。',
    uses: ['语义查询 MDC 平台业务数据', '统一口径路由与过滤', '与 HBG 数据源链路衔接复用'],
    ex: '「调取 MDC 平台近 30 天关键业务数据」',
    cmd: 'curl -fsSL https://raw.githubusercontent.com/58hbg/wenshu-hbg/main/skills/install.sh | bash -s -- mdc'
  },
  max: {
    name: 'MAX', code: 'hbg-max', st: 'inner', stt: '内部平台', en: 'HBG · 数据保存',
    desc: 'MAX 明细报表查询与导出：按报表/日期/筛选器灵活查询，异步导出大文件，保存到工作区供分析复用。',
    uses: ['按需拉取 MAX 平台数据文件', '统一保存到工作区', '供后续分析 / 报告复用'],
    ex: '「下载 MAX 《全网通经纪人明细》报表id=3870,城市=上海，最新的数据并保存到工作区」',
    cmd: 'curl -fsSL https://raw.githubusercontent.com/58hbg/wenshu-hbg/main/skills/install.sh | bash -s -- max'
  },
  xinghuo: {
    name: '星火', code: 'hbg-xinghuo', st: 'on', stt: '已上线', en: 'HBG · 报表直查',
    desc: '直连星火平台，按报表/日期/筛选器查询有权限的报表数据，支持自然语言取数、下载原始数据并归并到工作区供二次分析与可视化。',
    uses: ['查询星火有权限的报表数据', '按需下载数据文件', '对下载数据二次分析与可视化'],
    ex: '「查询星火平台上我有权限的月度报表并下载分析」',
    cmd: 'curl -fsSL https://raw.githubusercontent.com/58hbg/wenshu-hbg/main/skills/install.sh | bash -s -- xinghuo'
  }
};

const DEMO = {
  ask: `<div class="msg me"><div class="bub">分析下云州市 26 年每个月的业绩数据</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">已路由 hbg-direct · 城市级直销数据源，按你的权限范围取数</div>
          <div class="ln">意图解析 <span class="ind">城市=云州</span> <span class="ind">粒度=月度</span> <span class="ind">年份=2026</span> ✓</div>
          <div class="ln">指标匹配 <span class="ind">房产业绩</span> ✓ · 语义取数 · 8 期数据<span class="db"><i></i></span></div>
          <div class="dbox">
            <div class="dh">云州市 · 2026 各月业绩分析</div>
            <table>
              <thead><tr><th>指标</th><th>1月</th><th>2月</th><th>3月</th><th>4月</th><th>5月</th><th>6月</th><th>7月</th><th>8月</th></tr></thead>
              <tbody>
                <tr><td class="muted">业绩(万)</td><td>812</td><td>886</td><td>955</td><td>903</td><td>1,031</td><td>1,129</td><td>1,096</td><td>1,285</td></tr>
                <tr><td class="muted">环比</td><td class="muted">—</td><td class="up">↑9.1%</td><td class="up">↑7.8%</td><td class="dn">↓5.4%</td><td class="up">↑14.2%</td><td class="up">↑9.5%</td><td class="dn">↓2.9%</td><td class="up">↑17.2%</td></tr>
                <tr><td class="muted">达成率</td><td>102%</td><td>105%</td><td>98%</td><td>94%</td><td>101%</td><td>96%</td><td>92%</td><td>108%</td></tr>
                <tr><td class="muted">任务缺口</td><td class="up">超额16万</td><td class="up">超额22万</td><td class="dn">缺口8万</td><td class="dn">缺口21万</td><td class="up">超额12万</td><td class="dn">缺口18万</td><td class="dn">缺口35万</td><td class="up">超额47万</td></tr>
              </tbody>
            </table>
          </div>
          <div class="ln done">→ 关键洞察：8月环比暴增17.2%创年内新高，住宅线新签放量是主力</div>
          <div class="ln done">→ 全年核心结构更替：1-2月增值主导 → 5-8月新签放量接棒</div>
          <div class="ln done">→ 数据问询建议：团队下钻 / 同环比图表 / 会员三率 / 发送报告</div>
        </div></div>
        <div class="msg me"><div class="bub">为啥8月份涨了那么多</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">增量归因分析</div>
          <div class="ln">8月单月 1,285 万，环比 +17.2%（+189 万），占 1-8 月累计 24.6%<span class="db"><i></i></span></div>
          <div class="ln">核心动因：住宅线新签放量（+12.6%）+ 核心商圈带动（+5.8%）</div>
          <div class="dbox">
            <div class="dh">增量来源拆解</div>
            <table>
              <thead><tr><th>维度</th><th>贡献</th></tr></thead>
              <tbody>
                <tr><td class="muted">住宅线新签放量</td><td class="up">+12.6%</td></tr>
                <tr><td class="muted">核心商圈带动</td><td class="up">+5.8%</td></tr>
                <tr><td class="muted">增值线</td><td class="up">+1.2%</td></tr>
                <tr><td class="muted">商业线 / 公寓线</td><td class="muted">持平 / 小幅回落</td></tr>
              </tbody>
            </table>
          </div>
          <div class="ln done">→ 增长由新签与核心商圈双轮驱动，增值线亦有正向贡献</div>
        </div></div>
        <div class="msg me"><div class="bub">拆到部门看下，哪个部门贡献的多，业绩涨的最多</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">组织下钻 · 城市 → 部门级</div>
          <div class="ln">按 8 月业绩与环比排序<span class="db"><i></i></span></div>
          <div class="dbox">
            <div class="dh">部门贡献排行</div>
            <table>
              <thead><tr><th>部门</th><th>8月业绩(万)</th><th>环比</th><th>增量贡献</th></tr></thead>
              <tbody>
                <tr><td class="muted">云州·城南一部</td><td>312</td><td class="up">+32.4%</td><td class="up">+76万</td></tr>
                <tr><td class="muted">云州·城西二部</td><td>274</td><td class="up">+17.1%</td><td class="up">+41万</td></tr>
                <tr><td class="muted">云州·塘北三部</td><td>196</td><td class="up">+12.6%</td><td class="up">+29万</td></tr>
                <tr><td class="muted">其余12个部门</td><td>503</td><td class="up">+7.4%</td><td>+43万</td></tr>
              </tbody>
            </table>
          </div>
          <div class="ln done">→ 城南一部贡献最大（+76万），环比 +32.4% 领涨全市</div>
          <div class="ln done">→ 增量集中前3个部门，合计贡献 77% 的当月增长</div>
        </div></div>
        <div class="msg me"><div class="bub">好的，把结论整理下，发送给李三</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">报告生成 · 美事发送</div>
          <div class="ln done">✓ HTML 报告已生成：核心KPI + 月度走势 + 8月归因 + 部门贡献排行</div>
          <div class="ln done">✓ Excel 数据文件一并落盘</div>
          <div class="ln done">✓ 已发送给 李三（附文档概要）</div>
          <div class="ln done">→ 报告已在线化，可转发到任意群/对接人，点开即看</div>
        </div></div>`,
  forecast: `<div class="msg me"><div class="bub">基于 1-8 月实绩，帮我预测云州市 9-12 月的业绩</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">已路由 hbg-direct · 预测计算 · 基于 2026H1 实绩 + 2025 全年基线</div>
          <div class="ln"><b>预测方法</b>：三个核心假设交叉验证</div>
          <div class="ln">1. 增速外推：26H1 vs 25H1 基本持平，增速应用于 H2</div>
          <div class="ln">2. 季节性分解：保留 25 年各月权重（8-9月为旺季峰值，10月回落）</div>
          <div class="ln">3. 12月修正：结合8月新签放量兑现节奏，年末有翘尾<span class="db"><i></i></span></div>
          <div class="dbox">
            <div class="dh">云州市 · 2026 年 9-12 月业绩预测（万元）</div>
            <div class="chart" data-chart="forecastLine"></div>
            <table>
              <thead><tr><th>月份</th><th>预测(万)</th><th>2025同期</th><th>预期同比</th></tr></thead>
              <tbody>
                <tr><td class="muted">9月</td><td>1,180</td><td class="muted">1,052</td><td class="up">+12.2%</td></tr>
                <tr><td class="muted">10月</td><td>1,090</td><td class="muted">998</td><td class="up">+9.2%</td></tr>
                <tr><td class="muted">11月</td><td>1,145</td><td class="muted">1,067</td><td class="up">+7.3%</td></tr>
                <tr><td class="muted">12月</td><td>1,210</td><td class="muted">1,158</td><td class="up">+4.5%</td></tr>
              </tbody>
            </table>
          </div>
          <div class="ln done">→ 全年预计合计 13,045 万，季度累计同比 +8.9%</div>
          <div class="ln done">→ 9月为旺季峰值，10月季节性回落，年末翘尾</div>
        </div></div>
        <div class="msg me"><div class="bub">9月份为啥能涨到12.2%？准确性如何</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">9月高增速归因 + 置信度评估</div>
          <div class="ln done">→ 9月高增速归因：8月新签放量的续费/转化在9月集中兑现，叠加去年9月基数偏低</div>
          <div class="ln done">→ 准确性：已有 15 天实际数据做基准校准，置信度较高（误差 ±3%）</div>
          <div class="ln done">→ 风险提示：若城西团队续费流失未止住，9月可能下探至 1,120 万</div>
          <div class="ln done">✓ 预测报告已生成 · 可设为定时跟踪，每月初自动更新</div>
          <div class="ln done">→ 可下钻：把预测拆到团队，看哪些团队可能拖后腿</div>
        </div></div>`,
  online: `<div class="msg me"><div class="bub">用刚才的数据生成一份全面的分析报告 html</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">报告生成</div>
          <div class="ln">正在生成全面分析报告：核心KPI + 月度/季度趋势 + 归因拆解 + 部门贡献 + 预测展望<span class="db"><i></i></span></div>
          <div class="dbox">
            <div class="dh">报告结构预览</div>
            <div class="dr"><span class="k">1. 经营总览</span><span class="v">核心 KPI + 达成情况</span></div>
            <div class="dr"><span class="k">2. 趋势分析</span><span class="v">月度走势 + 同比/环比</span></div>
            <div class="dr"><span class="k">3. 归因拆解</span><span class="v">8月增长贡献 + 部门排行</span></div>
            <div class="dr"><span class="k">4. 预测展望</span><span class="v">9-12月预测曲线</span></div>
            <div class="dr"><span class="k">5. 风险提示</span><span class="v">应用建议</span></div>
          </div>
          <div class="ln done">✓ HTML 报告已生成 · 数据/图表/结论一体</div>
        </div></div>
        <div class="msg me"><div class="bub">把这个报告在线化下</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">在线化发布</div>
          <div class="ln">正在发布为可分享在线站点<span class="db"><i></i></span></div>
          <div class="dbox">
            <div class="dh">在线化结果</div>
            <div class="dr"><span class="k">链接</span><span class="v" style="color:#7da8ff">https://200-sites.meishiagents.com/report/8f3a2c9e</span></div>
            <div class="dr"><span class="k">访问范围</span><span class="v">需 58 Passport 登录，手机/电脑均可查看</span></div>
            <div class="dr"><span class="k">概要</span><span class="v">已自动提取，附带预览卡片</span></div>
            <div class="dr"><span class="k">更新策略</span><span class="v">数据重跑后内容自动刷新，链接不变</span></div>
          </div>
          <div class="ln done">✓ 在线化完成 · 内网 Passport 登录即可查看</div>
        </div></div>
        <div class="msg me"><div class="bub">把链接发送到 数据应用部的群</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">美事群发送</div>
          <div class="ln">正在推送到「数据应用部」群，附带文档概要<span class="db"><i></i></span></div>
          <div class="ln done">✓ 已发送：链接已推送到「数据应用部」群，附文档概要和预览卡片</div>
          <div class="ln done">→ 群里点开即看，无需另发文件</div>
          <div class="ln done">✓ 支持群内阅读回执查询，谁看了报告一目了然</div>
          <div class="ln done">✓ 权限隔离：数据范围跟随访问者行级权限</div>
          <div class="ln done">→ 数据更新后重新生成即可，链接内容自动刷新</div>
          <div class="ln done">→ 可设定时任务，每天早上自动生成并推到群里</div>
        </div></div>`,
  cron: `<div class="msg me"><div class="bub" style="max-width:520px">帮我把这个日报模板固化下来，做一个自动化任务：每天早上 9 点更新数据，然后更新在线化后的html，发送 报告小结内容以及报表链接给数据应用部</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">模板参数化 · 定时任务创建</div>
          <div class="ln"><b>1. 分析模板已固化（参数化）</b></div>
          <div class="ln"><span class="ind">gen_city_report.py</span> — city-reports 风格生成器已参数化</div>
          <div class="ln">→ 输入：<span class="ind">SUFFIX</span> <span class="ind">WORKSPACE</span> <span class="ind">TASK</span>（可选）</div>
          <div class="ln">→ 自动识别最新日/前日/当前月份，时间进度按真实月天数计算</div>
          <div class="ln">→ 输出固定名 云州城市日报.html（便于发送命令稳定引用）</div>
          <div class="dbox">
            <div class="dh">2. 自动化任务已配置为复合流程</div>
            <table>
              <thead><tr><th>字段</th><th>内容</th></tr></thead>
              <tbody>
                <tr><td class="muted">任务</td><td>云州城市日报 · 每日 9:00 更新并推送</td></tr>
                <tr><td class="muted">执行时间</td><td>每天 9:00（FREQ=DAILY;BYHOUR=9;BYMINUTE=0）</td></tr>
                <tr><td class="muted">流程</td><td>更新数据 → 生成日报 → 刷新在线化 html → 发送小结+链接</td></tr>
                <tr><td class="muted">发送对象</td><td>数据应用部群</td></tr>
                <tr><td class="muted">输出文件</td><td>云州城市日报.html（固定文件名，在线化链接不变）</td></tr>
                <tr><td class="muted">状态</td><td class="up">已启用 · 明早 9:00 首跑</td></tr>
              </tbody>
            </table>
          </div>
          <div class="ln done">✓ 定时任务已创建 · 可随时暂停/改接收人/改时间</div>
          <div class="ln done">→ 明早 9:00 起自动完成：取数→日报→刷新在线化→发小结+链接到群</div>
          <div class="ln done">✓ 在线化链接保持不变，数据更新后内容自动刷新</div>
          <div class="ln done">✓ 失败自动重试 · 权限过期自动刷新后重跑，全程无人值守</div>
          <div class="ln done">✓ 日报/周报/月报可各建一套，互不影响</div>
        </div></div>`,
  cmp: `<div class="msg me"><div class="bub" style="max-width:520px">为我们的大客户 未来科技公司 定制一份分析html报告</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">已路由 hbg-company · 公司级定制分析</div>
          <div class="ln">已定位 <span class="ind">未来科技公司</span> crm_company_id ✓ · 提取近 12 个月全量数据<span class="db"><i></i></span></div>
          <div class="ln">正在生成定制报告：月度趋势 · 会员三率 · 业绩走势 · 环比对比</div>
          <div class="ln done">✓ HTML 报告已生成：核心指标卡片 + 趋势图表 + 重点维度拆解</div>
          <div class="ln done">→ 数据会自动更新，最新数据每天都会自动同步</div>
        </div></div>
        <div class="msg me"><div class="bub">报告里面重点分析下业绩和会员数据</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">重新排版 · 重点放大业绩与会员板块</div>
          <div class="dbox">
            <div class="dh">未来科技公司 · 业绩与会员季度摘要</div>
            <table>
              <thead><tr><th>指标</th><th>本季度</th><th>上季度</th><th>环比</th></tr></thead>
              <tbody>
                <tr><td class="muted">房产业绩(万)</td><td>2,486</td><td>2,152</td><td class="up">+15.5%</td></tr>
                <tr><td class="muted">会员业绩(万)</td><td>1,320</td><td>1,158</td><td class="up">+14.0%</td></tr>
                <tr><td class="muted">留存会员数</td><td>1,862</td><td>1,741</td><td class="up">+6.9%</td></tr>
                <tr><td class="muted">会员续费率</td><td>89.6%</td><td>86.2%</td><td class="up">+3.4pp</td></tr>
              </tbody>
            </table>
          </div>
          <div class="ln done">→ 结论：本季度业绩与会员双增长，会员续费率持续提升</div>
          <div class="ln done">→ 已在报告头部增加业绩与会员摘要卡片，放在第一页</div>
        </div></div>
        <div class="msg me"><div class="bub">和 地球发展 公司的的数据进行下对比</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">已加入「地球发展」公司横向对比板块</div>
          <div class="dbox">
            <div class="dh">未来科技 vs 地球发展 · 业绩与会员对比</div>
            <table>
              <thead><tr><th>指标</th><th>未来科技</th><th>地球发展</th><th>差值</th></tr></thead>
              <tbody>
                <tr><td class="muted">房产业绩(万)</td><td>2,486</td><td>2,058</td><td class="up">+428</td></tr>
                <tr><td class="muted">会员业绩(万)</td><td>1,320</td><td>986</td><td class="up">+334</td></tr>
                <tr><td class="muted">留存会员数</td><td>1,862</td><td>1,547</td><td class="up">+315</td></tr>
                <tr><td class="muted">会员续费率</td><td>89.6%</td><td>84.3%</td><td class="up">+5.3pp</td></tr>
              </tbody>
            </table>
          </div>
          <div class="ln done">→ 结论：未来科技公司业绩与会员规模全面领先</div>
          <div class="ln done">✓ 对比板块已添加到报告，同时保留业绩与会员原始分析</div>
        </div></div>
        <div class="msg me"><div class="bub">好了，现在的版本比较满意了</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="ln done">✓ 定制报告已锁定版本：未来科技公司-获客分析-2026Q3-v2.html</div>
          <div class="ln done">✓ 已在线化发布，链接已保存 · 随时可转发</div>
          <div class="ln done">→ 后续可设置每周/每月自动更新，自动推送给对接人</div>
          <div class="ln done">→ 需要调整重点或追加对比其他公司，随时说一声即可</div>
        </div></div>`,
  max: `<div class="msg me"><div class="bub">帮我导出 MAX报表：全网通经纪人明细,id=9999，城市=上海，日期=2026-7-28</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">已路由 hbg-max · MAX 明细报表</div>
          <div class="ln">已定位报表：<span class="ind">全网通经纪人明细</span>（max报表 ID=9999）</div>
          <div class="ln">鉴权 <span class="ind">meishi auth</span> · 筛选 <span class="ind">city=上海</span> <span class="ind">date=2026-07-28</span></div>
          <div class="ln">走 <span class="ind">export_async</span> → <span class="ind">download_file</span> 异步导出<span class="db"><i></i></span></div>
          <div class="dbox">
            <div class="dh">导出结果</div>
            <div class="dr"><span class="k">报表名称</span><span class="v">全网通经纪人明细（max报表ID=9999）</span></div>
            <div class="dr"><span class="k">筛选范围</span><span class="v">城市=上海 · 日期=2026-07-28</span></div>
            <div class="dr"><span class="k">文件路径</span><span class="v" style="color:#7da8ff">D:\\WorkBuddy\\全网通经纪人明细-上海-20260728.csv</span></div>
            <div class="dr"><span class="k">数据量</span><span class="v up">17,658 条 · 24 个字段 · 2.9 MB</span></div>
            <div class="dr"><span class="k">编码</span><span class="v">GB18030 ✅（Excel 直接打开不乱码）</span></div>
            <div class="dr"><span class="k">校验</span><span class="v up">全部为上海数据 ✅ · 日期匹配 ✅</span></div>
          </div>
          <div class="ln done">✓ 明细已落盘 · 可直接用于本地深度分析</div>
          <div class="ln done">→ 支持按城市/日期/公司维度批量导出</div>
          <div class="ln done">→ 10w+ 行大结果集同样支持，按需延长超时即可</div>
        </div></div>
        <div class="msg me"><div class="bub">帮我每天9点定时执行</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">定时任务创建</div>
          <div class="dbox">
            <div class="dh">自动化任务配置</div>
            <table>
              <thead><tr><th>字段</th><th>内容</th></tr></thead>
              <tbody>
                <tr><td class="muted">任务</td><td>全网通经纪人明细 · 每日导出</td></tr>
                <tr><td class="muted">执行时间</td><td>每天 9:00（FREQ=DAILY;BYHOUR=9;BYMINUTE=0）</td></tr>
                <tr><td class="muted">报表</td><td>全网通经纪人明细（id=9999）</td></tr>
                <tr><td class="muted">维度</td><td>城市=上海 · 日期=最新一天</td></tr>
                <tr><td class="muted">输出</td><td>D:\\WorkBuddy\\全网通经纪人明细-上海-&lt;日期&gt;.csv</td></tr>
                <tr><td class="muted">状态</td><td class="up">已启用 · 明早 9:00 首跑</td></tr>
              </tbody>
            </table>
          </div>
          <div class="ln done">✓ 定时任务已创建 · 可随时暂停/改接收人/改时间</div>
          <div class="ln done">→ 明早 9:00 起自动导出当日明细，落盘到工作区</div>
          <div class="ln done">✓ 失败自动重试 · 权限过期自动刷新后重跑，全程无人值守</div>
        </div></div>`,
  xa: `<div class="msg me"><div class="bub">看下目前的云州的业绩和会员数据</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">已路由 hbg-direct · 城市级直销数据源，按你的权限范围取数</div>
          <div class="dbox">
            <div class="dh">云州市 · 业绩与会员概览</div>
            <table>
              <thead><tr><th>指标</th><th>本月</th><th>上月</th><th>环比</th></tr></thead>
              <tbody>
                <tr><td class="muted">总业绩(万)</td><td>1,285</td><td>1,096</td><td class="up">+17.2%</td></tr>
                <tr><td class="muted">房产业绩(万)</td><td>1,123</td><td>962</td><td class="up">+16.7%</td></tr>
                <tr><td class="muted">会员业绩(万)</td><td>162</td><td>134</td><td class="up">+20.9%</td></tr>
                <tr><td class="muted">新增会员</td><td>2,356</td><td>2,148</td><td class="up">+9.7%</td></tr>
                <tr><td class="muted">续费会员</td><td>1,841</td><td>1,760</td><td class="up">+4.6%</td></tr>
              </tbody>
            </table>
          </div>
          <div class="ln done">→ 本月业绩与会员双增长，房产与会员线齐升</div>
          <div class="ln done">→ 会员转化向好：新增与续费同步上扬</div>
        </div></div>
        <div class="msg me"><div class="bub">查下是哪些公司降的多</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">已路由 hbg-company · 公司数据源（全量经纪公司）</div>
          <div class="ln">按业绩环比降幅排序，取本月贡献最大的下滑公司<span class="db"><i></i></span></div>
          <div class="dbox">
            <div class="dh">云州市 · 业绩下滑公司 Top（环比）</div>
            <table>
              <thead><tr><th>公司</th><th>本月业绩(万)</th><th>上月</th><th>环比</th></tr></thead>
              <tbody>
                <tr><td class="muted">未来科技公司</td><td>512</td><td>604</td><td class="dn">-15.2%</td></tr>
                <tr><td class="muted">地球发展</td><td>486</td><td>561</td><td class="dn">-13.4%</td></tr>
                <tr><td class="muted">天龙网络</td><td>402</td><td>460</td><td class="dn">-12.6%</td></tr>
                <tr><td class="muted">宏图科技</td><td>356</td><td>401</td><td class="dn">-11.2%</td></tr>
              </tbody>
            </table>
          </div>
          <div class="ln done">→ 上述 4 家公司合计拖累本月业绩约 -220 万</div>
          <div class="ln done">→ 下滑集中在头部大客户，需重点跟进</div>
        </div></div>
        <div class="msg me"><div class="bub">定位下这些公司的经纪人数据</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">联动 hbg-max · 明细下载</div>
          <div class="ln">已定位报表：<span class="ind">全网通经纪人明细</span>（max报表 ID=9999）<span class="db"><i></i></span></div>
          <div class="dbox">
            <div class="dh">明细导出</div>
            <div class="dr"><span class="k">报表名称</span><span class="v">全网通经纪人明细（max报表ID=9999）</span></div>
            <div class="dr"><span class="k">筛选范围</span><span class="v">城市=云州 · 公司=未来科技/地球发展/天龙网络/宏图科技</span></div>
            <div class="dr"><span class="k">数据量</span><span class="v up">8,214 条 · 24 个字段 · 1.6 MB</span></div>
            <div class="dr"><span class="k">编码</span><span class="v">GB18030 ✅ · 校验全部为对应公司 ✅</span></div>
          </div>
          <div class="ln done">✓ 明细已落盘：D:\\WorkBuddy\\全网通经纪人明细-云州-4公司.csv</div>
          <div class="ln done">→ 覆盖 4 家下滑公司全部在册经纪人，可直接做进一步归因</div>
        </div></div>
        <div class="msg me"><div class="bub">看下最近对这些经纪人的行动量数据</div></div>
        <div class="msg ai"><div class="av ai">AI</div><div class="bub">
          <div class="nl">行动量交叉分析</div>
          <div class="dbox">
            <div class="dh">近期行动量 · 4 家公司经纪人（近 30 天）</div>
            <table>
              <thead><tr><th>行动</th><th>次数</th><th>覆盖率</th><th>同比</th></tr></thead>
              <tbody>
                <tr><td class="muted">有效拜访</td><td>5,904</td><td>68%</td><td class="dn">↓8.2%</td></tr>
                <tr><td class="muted">邀约到店</td><td>1,204</td><td>14%</td><td class="up">↑3.5%</td></tr>
                <tr><td class="muted">通话跟进</td><td>12,447</td><td>76%</td><td class="dn">↓4.1%</td></tr>
                <tr><td class="muted">发布房源</td><td>3,812</td><td>43%</td><td class="dn">↓6.4%</td></tr>
              </tbody>
            </table>
          </div>
          <div class="ln done">→ 重点公司经纪人行动量整体偏弱：有效拜访与通话跟进同比双降</div>
          <div class="ln done">→ 有效拜访覆盖率仅 68%，是经纪人产出下滑的先行信号</div>
          <div class="ln done">→ 建议：对下滑公司经纪人加大拜访与跟进频次，设专项运营干预</div>
          <div class="ln done">✓ 已生成交叉分析报告 · 可在线化发出或设定时跟踪</div>
        </div></div>`
};

const ORDER = ['ask', 'forecast', 'online', 'cron', 'cmp', 'max', 'xa'];
const LABELS = { ask: '问数查询', forecast: '数据预测', online: '发布报告', cron: '定时任务', cmp: '定制报告', max: '明细下载', xa: '交叉分析' };
const DESC = { ask: '语义取数 + 归因 + 下钻', forecast: '预测 + 趋势 + 基线', online: '生成 + 在线化 + 发送', cron: '固化模板 + 每日跑数 + 推送', cmp: '分析 + 对比 + 交付', max: '筛选取数 + 异步导出 + 定时下载', xa: '城市 + 公司 + 经纪人' };

const CHART_OPTS = {
  forecastLine() {
    return {
      grid: { top: 6, left: 4, right: 4, bottom: 4, containLabel: false },
      xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], show: false, boundaryGap: false },
      yAxis: { type: 'value', show: false, min: 0 },
      series: [
        { type: 'line', name: '实际', data: [812, 886, 955, 903, 1031, 1129, 1096, 1285], smooth: true, symbol: 'none',
          lineStyle: { width: 2.5, color: '#2563eb' },
          areaStyle: { color: typeof echarts !== 'undefined' ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(37,99,235,.26)' }, { offset: 1, color: 'rgba(37,99,235,0)' }]) : undefined } },
        { type: 'line', name: '预测', data: [null, null, null, null, null, null, null, 1285, 1180, 1090, 1145, 1210], smooth: false, symbol: 'circle', symbolSize: 5,
          lineStyle: { width: 2.5, color: '#2563eb', type: 'dashed' },
          itemStyle: { color: '#2563eb' } }
      ],
      animationDuration: 800,
      animationEasing: 'cubicOut'
    };
  }
};
