import {
  Activity,
  Anchor,
  Bell,
  ChevronDown,
  CircleDot,
  Clock3,
  Globe2,
  MapPinned,
  Menu,
  Search,
  ShieldAlert,
  Ship,
  TrendingUp,
} from "lucide-react";

const feed = [
  {
    time: "10:42",
    type: "Maritime",
    title: "Commercial vessel reports incident near Bab al-Mandab",
    source: "Maritime source",
    level: "high",
  },
  {
    time: "09:18",
    type: "Security",
    title: "Reports of overnight air activity in western Yemen",
    source: "Open sources",
    level: "medium",
  },
  {
    time: "08:51",
    type: "Politics",
    title: "New statement issued on regional negotiations",
    source: "Official statement",
    level: "low",
  },
  {
    time: "07:30",
    type: "Economy",
    title: "Exchange-rate pressure continues in government-held areas",
    source: "Local reporting",
    level: "medium",
  },
];

const trends = [
  ["Red Sea Shipping", "+28%"],
  ["Ceasefire Talks", "+17%"],
  ["Economic Crisis", "+9%"],
  ["Humanitarian Access", "+13%"],
];

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <div className="brandWrap">
          <div className="logoMark">BR</div>

          <div className="brandDivider" />

          <div>
            <div className="productName">Yemen Monitor</div>
            <div className="productSub">Basha Report Intelligence</div>
          </div>
        </div>

        <div className="topActions">
          <button className="iconButton" aria-label="Search">
            <Search size={18} />
          </button>

          <button className="iconButton" aria-label="Notifications">
            <Bell size={18} />
          </button>

          <button className="langButton">
            EN
            <ChevronDown size={14} />
          </button>
        </div>
      </header>

      <nav className="navRow">
        <button className="menuButton">
          <Menu size={18} />
        </button>

        {[
          "Overview",
          "Live Feed",
          "Map",
          "Maritime",
          "Politics",
          "Humanitarian",
          "Economy",
          "Sources",
          "Briefings",
        ].map((item, i) => (
          <a
            className={i === 0 ? "activeNav" : ""}
            key={item}
            href="#"
          >
            {item}
          </a>
        ))}
      </nav>

      <section className="statusStrip">
        <div className="live">
          <span className="liveDot" />
          LIVE MONITORING
        </div>

        <div className="statusItem">
          <Clock3 size={14} />
          Updated 2 minutes ago
        </div>

        <div className="statusItem">
          <Globe2 size={14} />
          Yemen + Red Sea
        </div>

        <div className="statusItem">
          <CircleDot size={14} />
          126 sources active
        </div>
      </section>

      <section className="hero">
        <div>
          <div className="eyebrow">SITUATION OVERVIEW</div>

          <h1>Yemen Monitor</h1>

          <p>
            Independent monitoring and analysis of developments in Yemen and the
            Red Sea.
          </p>
        </div>

        <div className="heroControls">
          <button className="filterButton">
            Last 24 hours
            <ChevronDown size={15} />
          </button>

          <button className="primaryButton">Open full briefing</button>
        </div>
      </section>

      <section className="metricsGrid">
        <Metric
          icon={<ShieldAlert size={18} />}
          label="Critical events"
          value="7"
          detail="2 new since midnight"
        />

        <Metric
          icon={<Activity size={18} />}
          label="News volume"
          value="1,284"
          detail="+18% vs yesterday"
        />

        <Metric
          icon={<Ship size={18} />}
          label="Maritime alerts"
          value="11"
          detail="Bab al-Mandab focus"
        />

        <Metric
          icon={<MapPinned size={18} />}
          label="Governorates active"
          value="14"
          detail="Reports in last 24h"
        />
      </section>

      <section className="dashboardGrid">
        <div className="card briefingCard">
          <div className="cardHeader">
            <div>
              <div className="eyebrow">DAILY BRIEF</div>
              <h2>What changed in the last 24 hours</h2>
            </div>

            <span className="goldPill">Updated 10:45</span>
          </div>

          <p className="briefText">
            Maritime reporting remains elevated around the southern Red Sea.
            Political messaging is focused on negotiations and regional
            security. Economic pressure continues across major population
            centers, while humanitarian agencies report access concerns in
            several areas.
          </p>

          <div className="briefLinks">
            <span>4 key developments</span>
            <span>18 supporting sources</span>
            <span>Confidence 82%</span>
          </div>
        </div>

        <div className="card mapCard">
          <div className="cardHeader">
            <div>
              <div className="eyebrow">LIVE MAP</div>
              <h2>Yemen activity</h2>
            </div>

            <Anchor size={18} />
          </div>

          <div className="mapMock">
            <div className="mapLabel sanaa">Sana&apos;a</div>
            <div className="mapLabel hodeidah">Hudaydah</div>
            <div className="mapLabel aden">Aden</div>
            <div className="mapLabel marib">Marib</div>

            <span className="marker m1" />
            <span className="marker m2" />
            <span className="marker m3" />
            <span className="marker m4" />
            <span className="marker m5" />

            <div className="watermark">YEMEN</div>
          </div>
        </div>

        <div className="card feedCard">
          <div className="cardHeader">
            <div>
              <div className="eyebrow">LATEST DEVELOPMENTS</div>
              <h2>Intelligence feed</h2>
            </div>
          </div>

          <div className="feedList">
            {feed.map((item) => (
              <article className="feedItem" key={item.time + item.title}>
                <div className="timeCol">{item.time}</div>

                <div className={`severity ${item.level}`} />

                <div>
                  <div className="feedMeta">
                    {item.type} · {item.source}
                  </div>

                  <div className="feedTitle">{item.title}</div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="card trendsCard">
          <div className="cardHeader">
            <div>
              <div className="eyebrow">MEDIA INTELLIGENCE</div>
              <h2>Trending narratives</h2>
            </div>

            <TrendingUp size={18} />
          </div>

          <div className="trendsList">
            {trends.map(([name, delta], i) => (
              <div className="trendRow" key={name}>
                <span>{name}</span>

                <div className="spark">
                  <span
                    style={{
                      width: `${62 + i * 7}%`,
                    }}
                  />
                </div>

                <strong>{delta}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <div>Basha Report · Yemen Monitor</div>
        <div>Independent monitoring and analysis</div>
      </footer>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="metricCard">
      <div className="metricIcon">{icon}</div>

      <div>
        <div className="metricLabel">{label}</div>
        <div className="metricValue">{value}</div>
        <div className="metricDetail">{detail}</div>
      </div>
    </div>
  );
}
