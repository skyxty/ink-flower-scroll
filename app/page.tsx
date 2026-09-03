"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const FlowerDepthScene = dynamic(() => import("./components/FlowerDepthScene"), { ssr: false });

const flowers = [
  {name:"牡丹",phrase:"国色初开",image:"/art/01-peony.png",title:"赏牡丹",poet:"唐 · 刘禹锡",zh:["唯有牡丹真国色","花开时节动京城"],en:["None but the royal peony is of celestial charm,","It blooms and stirs the capital from farm to farm."],translator:"许渊冲 译"},
  {name:"石榴",phrase:"榴火照眼",image:"/art/02-pomegranate.png",title:"题榴花",poet:"唐 · 韩愈",zh:["五月榴花照眼明","枝间时见子初成"],en:["May's pomegranate blossoms blaze before the eye;","Among the boughs, young fruit appears."],translator:"本页据原诗编译"},
  {name:"芍药",phrase:"柔枝含露",image:"/art/03-paeonia.png",title:"扬州慢",poet:"宋 · 姜夔",zh:["念桥边红药","年年知为谁生"],en:["I think of the red peonies by the bridge—","For whom do they bloom, year after year?"],translator:"本页据原词编译"},
  {name:"菊花",phrase:"东篱秋色",image:"/art/04-chrysanthemum.png",title:"饮酒 · 其五",poet:"晋 · 陶渊明",zh:["采菊东篱下","悠然见南山"],en:["I pluck chrysanthemums under the eastern hedge,","Then gaze long at the distant southern hills."],translator:"据 Burton Watson 译本"},
  {name:"荷花",phrase:"风荷清举",image:"/art/05-lotus.png",title:"晓出净慈寺送林子方",poet:"宋 · 杨万里",zh:["接天莲叶无穷碧","映日荷花别样红"],en:["Green lotus leaves outspread as far as boundless sky;","Pink lotus blossoms take from sunshine a new dye."],translator:"许渊冲、许明 译"},
  {name:"桂花",phrase:"金粟浮香",image:"/art/06-osmanthus.png",title:"鸟鸣涧",poet:"唐 · 王维",zh:["人闲桂花落","夜静春山空"],en:["Man at leisure. Cassia flowers fall.","Quiet night. Spring mountain is empty."],translator:"叶维廉 译"},
  {name:"梅花",phrase:"疏影横斜",image:"/art/07-plum.png",title:"梅花",poet:"宋 · 王安石",zh:["墙角数枝梅","凌寒独自开"],en:["A few plum branches by the corner wall","Bloom all alone, defying the cold."],translator:"本页据原诗编译"},
  {name:"竹子",phrase:"清风入竹",image:"/art/08-bamboo.png",title:"竹石",poet:"清 · 郑燮",zh:["咬定青山不放松","立根原在破岩中"],en:["Upright stands the bamboo amid green mountains steep;","Its root is planted deep in broken rock."],translator:"据许渊冲译本"},
  {name:"兰花",phrase:"幽兰生香",image:"/art/09-orchid.png",title:"古风 · 其三十八",poet:"唐 · 李白",zh:["孤兰生幽园","众草共芜没"],en:["A solitary orchid grows in a secluded garden,","Hidden and overrun among common grasses."],translator:"本页据原诗编译"},
  {name:"月季",phrase:"月月芳华",image:"/art/10-rose.png",title:"月季",poet:"宋 · 苏轼",zh:["花落花开无间断","春来春去不相关"],en:["Flowers fall and bloom without a pause;","Spring may come or go—it heeds it not."],translator:"本页据原诗编译"},
  {name:"杜鹃",phrase:"春山红遍",image:"/art/11-azalea.png",title:"宣城见杜鹃花",poet:"唐 · 李白",zh:["蜀国曾闻子规鸟","宣城还见杜鹃花"],en:["In Shu I once heard the cuckoo's cry;","In Xuancheng now I see azaleas bloom."],translator:"本页据原诗编译"},
  {name:"茶花",phrase:"雪里丹心",image:"/art/12-camellia.png",title:"山茶",poet:"宋 · 陆游",zh:["唯有山茶偏耐久","绿丛又放数枝红"],en:["The camellia alone endures the longest;","From green leaves, scarlet branches bloom anew."],translator:"本页据原诗编译"},
  {name:"水仙",phrase:"凌波微步",image:"/art/13-narcissus.png",title:"王充道送水仙花五十支",poet:"宋 · 黄庭坚",zh:["凌波仙子生尘袜","水上轻盈步微月"],en:["The wave-treading fairy wears dust-fine stockings,","Lightly she steps on water beneath the crescent moon."],translator:"本页据原诗编译"},
  {name:"木芙蓉",phrase:"拒霜照水",image:"/art/14-hibiscus.png",title:"木芙蓉",poet:"宋 · 王安石",zh:["水边无数木芙蓉","露染胭脂色未浓"],en:["Countless hibiscus bloom beside the water;","Dew stains them rouge, their color still pale."],translator:"本页据原诗编译"},
] as const;

const botanicalNames = [
  ["Tree peony", "Paeonia × suffruticosa"],
  ["Pomegranate", "Punica granatum"],
  ["Chinese peony", "Paeonia lactiflora"],
  ["Chrysanthemum", "Chrysanthemum × morifolium"],
  ["Sacred lotus", "Nelumbo nucifera"],
  ["Sweet osmanthus", "Osmanthus fragrans"],
  ["Chinese plum", "Prunus mume"],
  ["Bamboo", "Bambusoideae"],
  ["Chinese cymbidium", "Cymbidium spp."],
  ["Chinese rose", "Rosa chinensis"],
  ["Azalea", "Rhododendron spp."],
  ["Camellia", "Camellia japonica"],
  ["Chinese sacred lily", "Narcissus tazetta var. chinensis"],
  ["Cotton rose", "Hibiscus mutabilis"],
] as const;

type Ripple = { x: number; y: number; id: number };
type ParticleForm = "round" | "narrow" | "slender" | "broad" | "tiny" | "pointed" | "leaf" | "lance";
type Particle = { id: number; x: number; drift: number; land: number; size: number; duration: number; color: string; kind: "petal" | "leaf"; form: ParticleForm; sprite: number; turn: number };
const particleThemes = [
  {kind:"petal",form:"round",min:13,max:24,colors:["#d98286","#e8aaa7","#f2c7be"]},
  {kind:"petal",form:"narrow",min:8,max:15,colors:["#c96861","#e18b77","#dba58c"]},
  {kind:"petal",form:"round",min:12,max:22,colors:["#d8899d","#efb9c5","#f4d3d5"]},
  {kind:"petal",form:"slender",min:8,max:17,colors:["#d3ad55","#e3c87f","#efe1b4"]},
  {kind:"petal",form:"broad",min:17,max:29,colors:["#dfa0a6","#efc2c1","#f3dbd3"]},
  {kind:"petal",form:"tiny",min:4,max:8,colors:["#d2a344","#e6c66d","#f0d994"]},
  {kind:"petal",form:"round",min:7,max:13,colors:["#d88f92","#edbdba","#f3d8d0"]},
  {kind:"leaf",form:"leaf",min:11,max:21,colors:["#30443a","#51665a","#758379"]},
  {kind:"leaf",form:"lance",min:12,max:24,colors:["#637767","#839283","#a5ad9a"]},
  {kind:"petal",form:"round",min:11,max:20,colors:["#ce777d","#e59ba1","#efc0be"]},
  {kind:"petal",form:"pointed",min:9,max:17,colors:["#bb7189","#d994a8","#e6bcc6"]},
  {kind:"petal",form:"round",min:13,max:23,colors:["#a9433f","#d17968","#eee1cf"]},
  {kind:"petal",form:"narrow",min:7,max:13,colors:["#ece8da","#f3efe3","#d6c87d"]},
  {kind:"petal",form:"broad",min:16,max:28,colors:["#d8909d","#eab5ba","#f2d3d0"]},
] as const;

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollFrame = useRef<number | null>(null);
  const rippleId = useRef(0);
  const particleId = useRef(0);
  const [active, setActive] = useState(0);
  const [bloomed, setBloomed] = useState<Set<number>>(new Set([0]));
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      if (scrollFrame.current !== null) return;
      scrollFrame.current = window.requestAnimationFrame(() => {
        setActive(Math.max(0, Math.min(flowers.length - 1, Math.round(el.scrollTop / el.clientHeight))));
        scrollFrame.current = null;
      });
    };
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      el.removeEventListener("scroll", update);
      if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let stopped = false;
    const addParticle = () => {
      if (stopped || document.hidden) return;
      const theme = particleThemes[active];
      setParticles((current) => {
        const particleLimit = window.matchMedia("(max-width: 700px)").matches ? 28 : 54;
        if (current.length >= particleLimit) return current;
        const color = theme.colors[Math.floor(Math.random() * theme.colors.length)];
        return [...current, {
          id: ++particleId.current, x: 4 + Math.random() * 92,
          drift: -70 + Math.random() * 140, land: 7 + Math.random() * 42,
          size: theme.min + Math.random() * (theme.max - theme.min), duration: 5.8 + Math.random() * 5.4,
          color, kind:theme.kind, form:theme.form, sprite:active, turn: 240 + Math.random() * 760,
        }];
      });
    };
    addParticle();
    const interval = window.matchMedia("(max-width: 700px)").matches ? 920 : 680;
    const timer = window.setInterval(addParticle, interval);
    return () => { stopped = true; window.clearInterval(timer); };
  }, [active]);

  const bloom = (index: number, event: React.PointerEvent<HTMLElement>) => {
    setBloomed((current) => new Set(current).add(index));
    const rect = event.currentTarget.getBoundingClientRect();
    const ripple = { x: event.clientX - rect.left, y: event.clientY - rect.top, id: ++rippleId.current };
    setRipples((items) => [...items.slice(-4), ripple]);
    window.setTimeout(() => setRipples((items) => items.filter((r) => r.id !== ripple.id)), 1800);
  };
  const scrollToFlower = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: index * el.clientHeight, behavior: "smooth" });
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setBloomed((current) => new Set(current).add(index));
    } else if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      scrollToFlower(Math.min(flowers.length - 1, index + 1));
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      scrollToFlower(Math.max(0, index - 1));
    }
  };
  const tilt = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - .5;
    const ny = (event.clientY - rect.top) / rect.height - .5;
    const stage = event.currentTarget.querySelector<HTMLElement>(".perspective-stage");
    stage?.style.setProperty("--ry", `${nx * 1.3}deg`);
    stage?.style.setProperty("--rx", `${ny * -1.05}deg`);
    stage?.style.setProperty("--px", `${nx * -4}px`);
    stage?.style.setProperty("--py", `${ny * -3}px`);
    stage?.style.setProperty("--mx", `${(nx + .5) * 100}%`);
    stage?.style.setProperty("--my", `${(ny + .5) * 100}%`);
  };
  const resetTilt = (event: React.PointerEvent<HTMLElement>) => {
    const stage = event.currentTarget.querySelector<HTMLElement>(".perspective-stage");
    ["--ry", "--rx", "--px", "--py", "--mx", "--my"].forEach((key) => stage?.style.removeProperty(key));
  };

  return (
    <main className="ink-app">
      <header className="topbar">
        <div className="seal" aria-hidden="true">花</div>
        <div><h1>花信水墨长卷</h1><p>中英花名 · 古诗英译 · 墨色渐生</p></div>
        <div className="counter"><span>{String(active + 1).padStart(2, "0")}</span> / {flowers.length}</div>
      </header>
      <div className="scroll" ref={scrollRef} aria-label="花信水墨长卷">
        {flowers.map((flower, index) => {
          const {name, phrase, image} = flower;
          return (
          <section className={`panel ${active===index ? "current" : ""} ${bloomed.has(index) ? "bloomed" : ""}`} key={name} onPointerDown={(e) => bloom(index, e)} onPointerMove={tilt} onPointerLeave={resetTilt} onKeyDown={(e) => handleKeyDown(e, index)} tabIndex={active === index ? 0 : -1} role="button" aria-label={`${name}，按回车让花开，方向键切换花木`}>
            <div className="perspective-stage">
              <div className="scroll-paper">
                <img className="backdrop" src={image} alt="" aria-hidden="true" draggable={false} loading={index < 2 ? "eager" : "lazy"} decoding="async" />
                <img className="line-art line-left" src={image} alt="" aria-hidden="true" draggable={false} loading="lazy" decoding="async" />
                <img className="line-art line-right" src={image} alt="" aria-hidden="true" draggable={false} loading="lazy" decoding="async" />
                <img className="artwork" src={image} alt={`${name}水墨画`} draggable={false} loading={index < 2 ? "eager" : "lazy"} decoding="async" />
                <div className="wash" aria-hidden="true" />
                <div className="light-field" aria-hidden="true" />
              </div>
              {Math.abs(active - index) <= 1 && <FlowerDepthScene image={image} active={active === index} bloomed={bloomed.has(index)} />}
              <img className="breakout-art" src={image} alt="" aria-hidden="true" draggable={false} loading="lazy" decoding="async" />
            </div>
            {ripples.map((r) => <i className="ink-ripple" key={r.id} style={{ left:r.x, top:r.y }} aria-hidden="true" />)}
            <div className="caption">
              <span className="index">{String(index + 1).padStart(2, "0")}</span><h2>{name}</h2><p>{phrase}</p>
              <div className="botanical-name"><strong>{botanicalNames[index][0]}</strong><em>{botanicalNames[index][1]}</em></div>
            </div>
            <aside className="poem-slip" aria-label={`${name}题诗`}>
              <div className="poem-heading"><span>{flower.title}</span><small>{flower.poet}</small></div>
              <p className="verse-zh">{flower.zh.map((line) => <span key={line}>{line}</span>)}</p>
              <p className="verse-en" lang="en">{flower.en.map((line) => <span key={line}>{line}</span>)}</p>
              <small className="translator">{flower.translator}</small>
            </aside>
            {!bloomed.has(index) && <div className="hint">轻触花木 · 墨色渐生</div>}
          </section>
          );
        })}
      </div>
      <div className="particle-layer" aria-hidden="true">
        {particles.map((p) => (
          <i className="particle sprite-particle" key={p.id} onAnimationEnd={() => setParticles((items) => items.filter((item) => item.id !== p.id))} style={{
            left:`${p.x}%`, width:p.size * 2.5, height:p.size * 2.5,
            backgroundImage:"url('/particles/petal-atlas.png')",
            backgroundPosition:`${p.sprite % 2 ? 100 : 0}% ${(Math.floor(p.sprite / 2) / 6) * 100}%`,
            color:p.color, "--drift":`${p.drift}px`, "--land":`${p.land}px`,
            "--turn":`${p.turn}deg`, "--duration":`${p.duration}s`,
          } as React.CSSProperties & Record<string,string | number>} />
        ))}
      </div>
      <nav className="flower-rail" aria-label="十四种花木导航">
        {flowers.map((flower, index) => <button key={flower.name} type="button" className={active === index ? "active" : ""} onClick={() => scrollToFlower(index)} aria-label={`前往第 ${index + 1} 幅：${flower.name}`} aria-current={active === index ? "step" : undefined}><span /></button>)}
      </nav>
      <div className="vertical-progress" aria-hidden="true"><span style={{ height:`${((active + 1) / flowers.length) * 100}%` }} /></div>
      <div className="gesture">上下滑动 · 轻触花开</div>
    </main>
  );
}
