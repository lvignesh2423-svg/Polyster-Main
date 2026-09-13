import { NextRequest } from "next/server";
import type {
  InterviewQuestion,
  WeaknessReport,
  StrengthHighlight,
  GitHubProfile,
} from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { format, profile, questions, weaknesses, strengths } = body as {
    format: "markdown" | "pdf";
    profile: GitHubProfile;
    questions: InterviewQuestion[];
    weaknesses: WeaknessReport[];
    strengths: StrengthHighlight[];
  };

  if (format === "markdown") {
    const html = generateHTML(profile, questions, weaknesses, strengths);
    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="interview-prep-${profile.login}.html"`,
      },
    });
  }

  return Response.json({ error: "Unsupported format" }, { status: 400 });
}

function generateHTML(
  profile: GitHubProfile,
  questions: InterviewQuestion[],
  weaknesses: WeaknessReport[],
  strengths: StrengthHighlight[]
): string {
  const strengthsHTML = strengths.length
    ? `<section class="section"><h2><span class="icon green">&#10003;</span> Strengths</h2><div class="grid">${strengths
        .map(
          (s) => `<div class="card strength"><div class="dot green"></div><div><p class="msg">${esc(s.message)}</p><span class="tag">${esc(s.repo)}</span> <span class="sub">${esc(s.category)}</span></div></div>`
        )
        .join("")}</div></section>`
    : "";

  const weaknessesHTML = weaknesses.length
    ? `<section class="section"><h2><span class="icon warning">&#9888;</span> Areas to Improve</h2>${weaknesses
        .map(
          (w) => `<div class="card weakness"><div class="card-header"><div class="dot warning"></div><h3>${esc(w.repo)}</h3><span class="score">Score: ${w.score}/100</span></div><div class="issues">${w.issues
            .map(
              (i) => `<div class="issue"><span class="severity ${i.severity}">${i.severity}</span><p>${esc(i.message)}</p></div>`
            )
            .join("")}</div></div>`
        )
        .join("")}</section>`
    : "";

  const questionsHTML = questions.length
    ? `<section class="section"><h2><span class="icon blue">&#128172;</span> Interview Questions</h2><div class="questions">${questions
        .map(
          (q, idx) => `<div class="card question"><div class="q-header"><span class="q-num">${idx + 1}</span><span class="badge">${esc(q.category)}</span></div><h3>${esc(q.question)}</h3><p class="repo">Repository: ${esc(q.relatedRepo)}${q.relatedFile ? ` &middot; ${esc(q.relatedFile)}` : ""}</p><div class="answer"><h4>Model Answer</h4><p>${esc(q.modelAnswer)}</p></div><div class="kp"><h4>Key Points</h4><ul>${q.keyPoints.map((k) => `<li>${esc(k)}</li>`).join("")}</ul></div><div class="cm"><h4>Common Mistakes</h4><ul>${q.commonMistakes.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div><p class="followup"><strong>Follow-up:</strong> ${esc(q.followUp)}</p></div>`
        )
        .join("")}</div></section>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Interview Prep — ${esc(profile.login)}</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0a0a0a;color:#F1F5F9;font-family:'Outfit',sans-serif;font-weight:300;line-height:1.6;min-height:100vh;overflow-x:hidden}

/* Spider-Man Web Background */
canvas{position:fixed;inset:0;z-index:0;pointer-events:none}
.overlay{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,rgba(220,38,38,0.04) 0%,transparent 60%)}

.container{position:relative;z-index:1;max-width:900px;margin:0 auto;padding:40px 24px 80px}

/* Header */
.header{text-align:center;padding:60px 0 40px;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:48px}
.header h1{font-family:'Syne',sans-serif;font-size:2.2rem;font-weight:800;letter-spacing:-0.02em}
.header h1 .red{color:#DC2626;text-shadow:0 0 20px rgba(220,38,38,0.4)}
.header h1 .blue{color:#3B82F6;text-shadow:0 0 20px rgba(59,130,246,0.3)}
.header .sub{color:#94A3B8;font-size:0.85rem;margin-top:8px;font-weight:300}
.header .meta{display:flex;justify-content:center;gap:24px;margin-top:20px;flex-wrap:wrap}
.header .meta span{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);padding:6px 16px;border-radius:10px;font-size:0.8rem;color:#94A3B8}

/* Section */
.section{margin-bottom:48px}
.section h2{font-family:'Syne',sans-serif;font-size:1.15rem;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:10px}
.icon{width:32px;height:32px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font-size:14px}
.icon.green{background:rgba(57,255,20,0.1);border:1px solid rgba(57,255,20,0.15)}
.icon.warning{background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.15)}
.icon.blue{background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.15)}

/* Cards */
.card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:20px;margin-bottom:14px;backdrop-filter:blur(10px)}
.card:hover{border-color:rgba(220,38,38,0.12);box-shadow:0 4px 20px rgba(0,0,0,0.3)}

.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(380px,1fr));gap:14px}
.strength{display:flex;gap:12px;align-items:flex-start}
.dot{width:8px;height:8px;border-radius:50%;margin-top:6px;flex-shrink:0}
.dot.green{background:#39FF14;box-shadow:0 0 8px rgba(57,255,20,0.4)}
.dot.warning{background:#FBBF24;box-shadow:0 0 8px rgba(251,191,36,0.4)}
.msg{font-size:0.9rem;font-weight:400;margin-bottom:6px}
.tag{background:rgba(57,255,20,0.1);color:#39FF14;border:1px solid rgba(57,255,20,0.15);padding:2px 8px;border-radius:6px;font-size:0.7rem;font-weight:500}
.sub{color:#94A3B8;font-size:0.75rem}

/* Weakness */
.card-header{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.card-header h3{font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:600}
.score{margin-left:auto;color:#94A3B8;font-size:0.75rem}
.issues{display:flex;flex-direction:column;gap:8px}
.issue{display:flex;align-items:flex-start;gap:8px;padding-left:4px}
.severity{font-size:0.65rem;padding:2px 8px;border-radius:5px;font-weight:600;text-transform:uppercase;flex-shrink:0;margin-top:2px}
.severity.high{background:rgba(239,68,68,0.1);color:#EF4444;border:1px solid rgba(239,68,68,0.15)}
.severity.medium{background:rgba(251,191,36,0.1);color:#FBBF24;border:1px solid rgba(251,191,36,0.15)}
.severity.low{background:rgba(59,130,246,0.1);color:#3B82F6;border:1px solid rgba(59,130,246,0.15)}
.issue p{font-size:0.85rem;font-weight:300;color:#CBD5E1}

/* Questions */
.questions .card{border-left:3px solid rgba(220,38,38,0.3)}
.q-header{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.q-num{width:28px;height:28px;border-radius:8px;background:rgba(220,38,38,0.12);color:#EF4444;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:600}
.badge{background:rgba(59,130,246,0.1);color:#3B82F6;border:1px solid rgba(59,130,246,0.15);padding:3px 10px;border-radius:6px;font-size:0.7rem;font-weight:500}
.card h3{font-size:0.95rem;font-weight:500;margin-bottom:6px;line-height:1.5}
.repo{color:#94A3B8;font-size:0.75rem;margin-bottom:14px}
.answer{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:10px;padding:14px;margin-bottom:12px}
.answer h4,.kp h4,.cm h4{font-family:'Syne',sans-serif;font-size:0.75rem;font-weight:600;color:#DC2626;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em}
.answer p{font-size:0.85rem;font-weight:300;line-height:1.7}
.kp ul,.cm ul{list-style:none;padding:0}
.kp li,.cm li{font-size:0.82rem;font-weight:300;padding:3px 0;padding-left:14px;position:relative;color:#CBD5E1}
.kp li::before,.cm li::before{content:'';position:absolute;left:0;top:10px;width:5px;height:5px;border-radius:50%}
.kp li::before{background:rgba(57,255,20,0.5)}
.cm li::before{background:rgba(251,191,36,0.5)}
.followup{font-size:0.82rem;color:#94A3B8;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.04)}
.followup strong{color:#F1F5F9}

/* Footer */
.footer{text-align:center;padding:40px 0;border-top:1px solid rgba(255,255,255,0.04);margin-top:40px;color:#94A3B8;font-size:0.8rem}
</style>
</head>
<body>
<canvas id="web"></canvas>
<div class="overlay"></div>
<div class="container">
  <div class="header">
    <h1><span class="red">Repo</span><span class="blue">Interview</span> AI</h1>
    <p class="sub">Interview Preparation Report</p>
    <div class="meta">
      <span>${esc(profile.name || profile.login)}</span>
      <span>@${esc(profile.login)}</span>
      <span>${profile.public_repos} Repos</span>
      <span>${profile.followers} Followers</span>
    </div>
  </div>
  ${strengthsHTML}
  ${weaknessesHTML}
  ${questionsHTML}
  <div class="footer">Generated by RepoInterview AI</div>
</div>
<script>
(function(){
  var c=document.getElementById('web'),x=c.getContext('2d'),t=0;
  function resize(){c.width=innerWidth;c.height=innerHeight}
  resize();addEventListener('resize',resize);
  function web(cx,cy,r,rot,op,col){
    var s=18,rn=10;x.save();x.translate(cx,cy);x.rotate(rot);x.globalAlpha=op;
    for(var i=0;i<s;i++){var a=i/s*Math.PI*2;x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a)*r,Math.sin(a)*r);x.strokeStyle=col;x.lineWidth=0.7;x.stroke()}
    for(var j=1;j<=rn;j++){var rr=j/rn*r;x.beginPath();for(var i=0;i<=s;i++){var a=i/s*Math.PI*2;var w=Math.sin(a*4+t*0.8+j*0.5)*(rr*0.04);var px=Math.cos(a)*(rr+w);var py=Math.sin(a)*(rr+w);i===0?x.moveTo(px,py):x.lineTo(px,py)}x.strokeStyle=col;x.lineWidth=0.4;x.stroke()}
    x.restore();
  }
  function draw(){t+=0.006;x.clearRect(0,0,c.width,c.height);
    var cx=c.width/2,cy=c.height/2,mr=Math.max(c.width,c.height)*0.75;
    web(cx,cy,mr,t*0.08,0.5,'rgba(220,38,38,0.18)');
    web(cx+Math.sin(t*0.3)*40,cy+Math.cos(t*0.2)*30,mr*0.55,-t*0.12,0.3,'rgba(185,28,28,0.14)');
    web(cx+Math.cos(t*0.4)*25,cy+Math.sin(t*0.35)*20,mr*0.35,t*0.18,0.15,'rgba(59,130,246,0.1)');
    var pr=120+Math.sin(t*1.5)*30;var g=x.createRadialGradient(cx,cy,0,cx,cy,pr);g.addColorStop(0,'rgba(220,38,38,0.12)');g.addColorStop(1,'transparent');x.fillStyle=g;x.fillRect(0,0,c.width,c.height);
    for(var i=0;i<16;i++){var a=i/16*Math.PI*2+t*0.15;var d=120+Math.sin(t*0.7+i*1.2)*100;var nx=cx+Math.cos(a)*d;var ny=cy+Math.sin(a)*d;var nr=1.5+Math.sin(t*2+i)*0.8;x.beginPath();x.arc(nx,ny,nr,0,Math.PI*2);x.fillStyle='rgba(239,68,68,'+(0.4+Math.sin(t+i)*0.2)+')';x.fill()}
    requestAnimationFrame(draw);
  }
  draw();
})();
</script>
</body>
</html>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
