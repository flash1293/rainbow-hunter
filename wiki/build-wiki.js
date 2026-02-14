/**
 * Wiki Build Script
 * 
 * Generates static HTML from entities.json and generates images.
 * Run with: node build-wiki.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WIKI_DIR = __dirname;
const ENTITIES_FILE = path.join(WIKI_DIR, 'entities.json');
const INDEX_FILE = path.join(WIKI_DIR, 'index.html');

function getImagePath(category, id) {
    return `images/${category}-${id}.png`;
}

function getDangerClass(tag) {
    const dangerous = ['Nahkampf', 'Fernkampf', 'Schnell', 'Bomben', 'Kanonen', 'Fläche', 'Feuerspur', 'Feuerball'];
    const special = ['Boss', 'Elite', 'Magie'];
    if (dangerous.includes(tag)) return 'danger';
    if (special.includes(tag)) return 'special';
    return '';
}

function generateMobsHTML(mobs) {
    return mobs.map(mob => {
        const statsHtml = mob.health ? `<p style="color:var(--accent-gold);font-size:0.9em;margin-bottom:10px;">❤️ ${mob.health} HP • ⚔️ ${mob.damage || 1} DMG</p>` : '';
        const tagsHtml = mob.tags.map(t => `<span class="tag ${getDangerClass(t)}">${t}</span>`).join('');
        
        return `                <div class="entity-card">
                    <div class="entity-image">
                        <img src="${getImagePath('mobs', mob.id)}" alt="${mob.name}">
                    </div>
                    <div class="entity-info">
                        <h4 class="entity-name">${mob.name}</h4>
                        ${statsHtml}
                        <p class="entity-desc">${mob.description}</p>
                        <div class="entity-tags">
                            ${tagsHtml}
                        </div>
                    </div>
                </div>`;
    }).join('\n');
}

function generateItemsHTML(items) {
    const categories = {
        pickup: { title: 'Sammelgegenstände', items: [] },
        special: { title: 'Spezielle Gegenstände', items: [] },
        deployable: { title: 'Platzierbare', items: [] },
        structure: { title: 'Strukturen', items: [] }
    };
    
    items.forEach(item => {
        if (categories[item.category]) {
            categories[item.category].items.push(item);
        }
    });

    const sections = [];
    Object.entries(categories).forEach(([key, cat]) => {
        if (cat.items.length === 0) return;
        
        const cards = cat.items.map(item => `                    <div class="entity-card">
                        <div class="entity-image">
                            <img src="${getImagePath('items', item.id)}" alt="${item.name}">
                        </div>
                        <div class="entity-info">
                            <h4 class="entity-name">${item.name}</h4>
                            <p class="entity-desc">${item.description}</p>
                        </div>
                    </div>`).join('\n');
        
        sections.push(`            <h3>${cat.title}</h3>
            <div class="entity-grid">
${cards}
            </div>`);
    });

    return sections.join('\n\n');
}

function generateHazardsHTML(hazards) {
    const rows = hazards.map(h => `                    <tr>
                        <td><img src="${getImagePath('hazards', h.id)}" alt="${h.name}" style="width:60px;height:60px;object-fit:contain;"></td>
                        <td><strong>${h.name}</strong></td>
                        <td>Level ${h.level}</td>
                        <td>${h.description}</td>
                        <td>${h.counter}</td>
                    </tr>`).join('\n');

    return `            <table>
                <thead>
                    <tr>
                        <th style="width:80px">Bild</th>
                        <th>Gefahr</th>
                        <th>Level</th>
                        <th>Effekt</th>
                        <th>Gegenmaßnahme</th>
                    </tr>
                </thead>
                <tbody>
${rows}
                </tbody>
            </table>`;
}

function generateEnvironmentHTML(environment) {
    return environment.map(env => `                <div class="entity-card">
                    <div class="entity-image">
                        <img src="${getImagePath('environment', env.id)}" alt="${env.name}">
                    </div>
                    <div class="entity-info">
                        <h4 class="entity-name">${env.name}</h4>
                        <p class="entity-desc">${env.description}</p>
                    </div>
                </div>`).join('\n');
}

async function build() {
    console.log('🔨 Wiki wird erstellt...\n');

    // Load entities
    const entities = JSON.parse(fs.readFileSync(ENTITIES_FILE, 'utf8'));
    
    // Generate HTML for each section
    const mobsHTML = generateMobsHTML(entities.mobs);
    const itemsHTML = generateItemsHTML(entities.items);
    const hazardsHTML = generateHazardsHTML(entities.hazards);
    const environmentHTML = generateEnvironmentHTML(entities.environment);

    const html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>🚴 Fahrrad-Abenteuer Spiel-Wiki</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        :root {
            --bg-primary: #1a1a2e;
            --bg-secondary: #2d2d44;
            --bg-card: #252540;
            --bg-dark: #0f0f1a;
            --text-primary: #f5f5f5;
            --text-secondary: #b0b0c0;
            --accent-gold: #FFD700;
            --accent-silver: #C0C0C0;
            --accent-bronze: #CD7F32;
            --accent-ice: #87CEEB;
            --accent-sand: #e8c36a;
            --accent-lava: #ff4422;
            --accent-ocean: #1E90FF;
            --accent-forest: #228B22;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: var(--bg-dark);
            background-image: 
                linear-gradient(90deg, rgba(255,215,0,0.02) 1px, transparent 1px),
                linear-gradient(rgba(192,192,192,0.02) 1px, transparent 1px);
            background-size: 20px 20px;
            color: var(--text-primary);
            line-height: 1.6;
        }
        
        header {
            background: var(--bg-primary);
            padding: 50px 20px;
            text-align: center;
            border-bottom: 6px solid var(--accent-gold);
            position: relative;
            clip-path: polygon(0 0, 100% 0, 100% calc(100% - 20px), 50% 100%, 0 calc(100% - 20px));
        }
        
        header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.02) 10px,
                rgba(255,255,255,0.02) 20px
            );
        }
        
        header h1 {
            font-family: 'Press Start 2P', cursive;
            font-size: 2em;
            margin-bottom: 15px;
            color: var(--accent-gold);
            text-shadow: 4px 4px 0 var(--accent-bronze), 6px 6px 0 rgba(0,0,0,0.3);
            letter-spacing: 2px;
        }
        
        header p { 
            color: var(--text-secondary); 
            font-size: 1.1em;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        
        nav {
            background: var(--bg-secondary);
            padding: 15px;
            position: sticky;
            top: 0;
            z-index: 100;
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
            border-bottom: 4px solid var(--bg-dark);
            box-shadow: 0 4px 0 var(--accent-bronze);
        }
        
        nav a {
            color: var(--text-primary);
            text-decoration: none;
            padding: 12px 20px;
            background: var(--bg-card);
            border: 3px solid var(--bg-dark);
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.85em;
            letter-spacing: 1px;
            transition: all 0.15s ease;
            clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
        }
        
        nav a:hover { 
            background: var(--accent-gold); 
            color: var(--bg-dark);
            transform: translateY(-3px);
            box-shadow: 0 4px 0 var(--accent-bronze);
        }
        nav a.active { background: var(--accent-gold); color: var(--bg-dark); }
        
        main { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
        section { margin-bottom: 60px; }
        
        h2 {
            font-family: 'Press Start 2P', cursive;
            font-size: 1.4em;
            margin-bottom: 30px;
            padding: 15px 20px;
            background: var(--bg-primary);
            border-left: 6px solid var(--accent-gold);
            color: var(--accent-gold);
            text-shadow: 2px 2px 0 var(--bg-dark);
            clip-path: polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%);
        }
        
        h3 { 
            color: var(--accent-sand); 
            margin: 30px 0 20px; 
            font-size: 1.3em;
            border-bottom: 3px solid var(--accent-wood);
            padding-bottom: 8px;
            display: inline-block;
        }
        
        .entity-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
        }
        
        .entity-card {
            background: var(--bg-card);
            border: 4px solid var(--bg-dark);
            overflow: hidden;
            transition: all 0.15s ease;
            clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
        }
        
        .entity-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 0 var(--accent-bronze);
            border-color: var(--accent-gold);
        }
        
        .entity-image {
            background: var(--bg-primary);
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 4px solid var(--bg-dark);
            position: relative;
        }
        
        .entity-image::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                linear-gradient(45deg, transparent 49%, rgba(255,255,255,0.02) 49%, rgba(255,255,255,0.02) 51%, transparent 51%),
                linear-gradient(-45deg, transparent 49%, rgba(255,255,255,0.02) 49%, rgba(255,255,255,0.02) 51%, transparent 51%);
            background-size: 20px 20px;
        }
        
        .entity-image img {
            max-width: 180px;
            max-height: 180px;
            object-fit: contain;
            image-rendering: pixelated;
        }
        
        .entity-info { padding: 20px; }
        .entity-name { 
            font-size: 1.2em; 
            color: var(--accent-gold); 
            margin-bottom: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .entity-desc { color: var(--text-secondary); font-size: 0.95em; margin-bottom: 15px; }
        .entity-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        
        .tag {
            padding: 5px 12px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
            background: var(--bg-primary);
            color: var(--accent-ice);
            border: 2px solid var(--accent-ice);
            clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
        }
        
        .tag.danger { 
            background: rgba(255,68,34,0.2); 
            color: var(--accent-lava); 
            border-color: var(--accent-lava);
        }
        .tag.reward { 
            background: rgba(255,170,0,0.2); 
            color: var(--accent-gold);
            border-color: var(--accent-gold);
        }
        .tag.special { 
            background: rgba(192,192,192,0.2); 
            color: var(--accent-silver);
            border-color: var(--accent-silver);
        }
        
        .level-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
            gap: 25px;
        }
        
        .level-card {
            background: var(--bg-card);
            border: 4px solid var(--bg-dark);
            overflow: hidden;
            box-shadow: 6px 6px 0 var(--bg-dark);
            clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
        }
        
        .level-header { 
            padding: 25px; 
            position: relative;
            border-bottom: 4px solid var(--bg-dark);
        }
        .level-number { 
            position: absolute; 
            top: 15px; 
            right: 15px; 
            background: var(--bg-dark); 
            padding: 6px 14px; 
            font-size: 0.85em;
            font-weight: bold;
            border: 2px solid currentColor;
        }
        .level-title { 
            font-family: 'Press Start 2P', cursive;
            font-size: 1em; 
            margin-bottom: 8px;
            text-shadow: 2px 2px 0 rgba(0,0,0,0.5);
        }
        .level-subtitle { color: var(--text-secondary); font-style: italic; }
        .level-content { padding: 0 25px 25px; }
        
        .level-1 .level-header { background: var(--accent-silver); }
        .level-2 .level-header { background: #4a7a9a; }
        .level-3 .level-header { background: #c4a35a; }
        .level-4 .level-header { background: #8a3a2a; }
        .level-5 .level-header { background: #2a5a7a; }
        .level-6 .level-header { background: #e75480; }
        .level-7 .level-header { background: #4a4a5a; }
        .level-8 .level-header { background: #7a6a5a; }
        .level-9 .level-header { background: #00aaaa; }
        
        .feature-list { margin: 20px 0; list-style: none; }
        .feature-list li { padding: 8px 0; display: flex; align-items: center; gap: 10px; }
        .feature-list li::before { content: "▶"; color: var(--accent-gold); font-size: 0.7em; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: var(--bg-card);
            border: 4px solid var(--bg-dark);
            box-shadow: 4px 4px 0 var(--bg-dark);
        }
        
        th, td { 
            padding: 15px; 
            text-align: left; 
            border-bottom: 3px solid var(--bg-dark);
            border-right: 3px solid var(--bg-dark);
        }
        th { 
            background: var(--bg-primary); 
            color: var(--accent-gold); 
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.9em;
        }
        tr:hover { background: rgba(255,215,0,0.1); }
        
        .info-box {
            background: var(--bg-card);
            border: 4px solid var(--accent-silver);
            border-left: 8px solid var(--accent-gold);
            padding: 20px;
            margin: 20px 0;
            clip-path: polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%);
        }
        
        footer {
            background: var(--bg-primary);
            padding: 40px 20px;
            text-align: center;
            margin-top: 60px;
            border-top: 6px solid var(--accent-gold);
            clip-path: polygon(0 20px, 50% 0, 100% 20px, 100% 100%, 0 100%);
        }
        
        footer p { color: var(--text-secondary); }
        footer code { 
            background: var(--bg-dark); 
            padding: 4px 10px; 
            border: 2px solid var(--accent-silver);
            font-family: monospace;
        }
        
        @media (max-width: 768px) {
            header h1 { font-size: 1.2em; }
            h2 { font-size: 1em; padding: 12px 15px; }
            .level-grid { grid-template-columns: 1fr; }
            .level-title { font-size: 0.85em; }
            nav { gap: 8px; padding: 10px; }
            nav a { padding: 10px 14px; font-size: 0.75em; }
            .entity-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <header>
        <h1>🚴 Fahrrad-Abenteuer</h1>
        <p>Komplettes Spiel-Wiki - Level, Gegner, Gegenstände & mehr</p>
    </header>
    
    <nav>
        <a href="#levels">🗺️ Level</a>
        <a href="#mobs">👾 Gegner</a>
        <a href="#items">🎒 Gegenstände</a>
        <a href="#hazards">⚠️ Gefahren</a>
        <a href="#environment">🌳 Umgebung</a>
        <a href="#mechanics">⚙️ Spielmechanik</a>
    </nav>
    
    <main>
        <!-- LEVELS -->
        <section id="levels">
            <h2>🗺️ Spiel-Level</h2>
            <div class="level-grid">
                <div class="level-card level-1">
                    <div class="level-header">
                        <span class="level-number">Level 1</span>
                        <h3 class="level-title">Drachenhorst</h3>
                        <p class="level-subtitle">Der Zauberwald</p>
                    </div>
                    <div class="level-content">
                        <p>Beginne dein Abenteuer in einem mystischen Wald, bewacht von einem furchterregenden Drachen.</p>
                        <ul class="feature-list">
                            <li>Dichtes Waldgelände mit magischen Bäumen</li>
                            <li>Goblins und Riesen patrouillieren die Pfade</li>
                            <li>Drachen-Boss verspüht tödliche Feuerbälle</li>
                        </ul>
                    </div>
                </div>
                
                <div class="level-card level-2">
                    <div class="level-header">
                        <span class="level-number">Level 2</span>
                        <h3 class="level-title">Die Eiswüste</h3>
                        <p class="level-subtitle">Arktische Wildnis</p>
                    </div>
                    <div class="level-content">
                        <p>Trotze der tückischen gefrorenen Tundra mit Zauberern und gefrorenen Seen.</p>
                        <ul class="feature-list">
                            <li>Rutschiges Eisgelände beeinflusst Bewegung</li>
                            <li>Eis-Zauberer wirken magische Projektile</li>
                            <li>Finde Eisberge verstreut in der Tundra</li>
                        </ul>
                    </div>
                </div>
                
                <div class="level-card level-3">
                    <div class="level-header">
                        <span class="level-number">Level 3</span>
                        <h3 class="level-title">Der glühende Sand</h3>
                        <p class="level-subtitle">Uralte Wüste</p>
                    </div>
                    <div class="level-content">
                        <p>Überquere die endlose Wüste, wo Mumien uralte Pyramiden bewachen.</p>
                        <ul class="feature-list">
                            <li>Sandiges Gelände mit aufragenden Pyramiden</li>
                            <li>Mumien erheben sich aus dem Sand</li>
                            <li>Vögel werfen Bomben von oben</li>
                        </ul>
                    </div>
                </div>
                
                <div class="level-card level-4">
                    <div class="level-header">
                        <span class="level-number">Level 4</span>
                        <h3 class="level-title">Die Lavahöhlen</h3>
                        <p class="level-subtitle">Vulkanische Tiefen</p>
                    </div>
                    <div class="level-content">
                        <p>Steige hinab in feurige Tiefen mit Lava-Monstern und Teufeln.</p>
                        <ul class="feature-list">
                            <li>Gefährliche Lava-Becken und -Ströme</li>
                            <li>Teufel und Große Teufel greifen an</li>
                            <li>Baue Brücken über Schluchten</li>
                        </ul>
                    </div>
                </div>
                
                <div class="level-card level-5">
                    <div class="level-header">
                        <span class="level-number">Level 5</span>
                        <h3 class="level-title">Die Tiefe See</h3>
                        <p class="level-subtitle">Ozean-Abgrund</p>
                    </div>
                    <div class="level-content">
                        <p>Navigiere durch tückische Gewässer mit Haien und Piratenschiffen.</p>
                        <ul class="feature-list">
                            <li>Gefährliche Strudel und Wasserhosen</li>
                            <li>Haie und Oktopusse greifen an</li>
                            <li>Piratenschiffe feuern Kanonenkugeln</li>
                        </ul>
                    </div>
                </div>
                
                <div class="level-card level-6">
                    <div class="level-header">
                        <span class="level-number">Level 6</span>
                        <h3 class="level-title">Das Zuckerland</h3>
                        <p class="level-subtitle">Candy Kingdom</p>
                    </div>
                    <div class="level-content">
                        <p>Betrete ein süßes Wunderland voller bunter Süßigkeiten und gefährlicher Naschkatzen.</p>
                        <ul class="feature-list">
                            <li>Bunte Lutscher und Zuckerstangen</li>
                            <li>Gummibären und Lebkuchenmänner</li>
                            <li>Marshmallow-Monster und Zuckerwatte-Zauberer</li>
                        </ul>
                    </div>
                </div>
                
                <div class="level-card level-7">
                    <div class="level-header">
                        <span class="level-number">Level 7</span>
                        <h3 class="level-title">Der Friedhof</h3>
                        <p class="level-subtitle">Spukende Gräber</p>
                    </div>
                    <div class="level-content">
                        <p>Wage dich in die dunkle Nacht, wo die Toten erwachen und der Sensenmann wartet.</p>
                        <ul class="feature-list">
                            <li>Zombies und Skelette erheben sich</li>
                            <li>Geister und Hexen lauern im Nebel</li>
                            <li>Der Sensenmann als tödlicher Boss</li>
                        </ul>
                    </div>
                </div>
                
                <div class="level-card level-8">
                    <div class="level-header">
                        <span class="level-number">Level 8</span>
                        <h3 class="level-title">Die Alten Ruinen</h3>
                        <p class="level-subtitle">Vergessene Burg</p>
                    </div>
                    <div class="level-content">
                        <p>Erkunde verfallene Burgmauern bei Tageslicht, bewacht von Rittern und uralten Drachen.</p>
                        <ul class="feature-list">
                            <li>Zerfallene Mauern und Türme</li>
                            <li>Ritter, Geisterritter und Riesenspinnen</li>
                            <li>Steinerne Drachen bewachen den Schatz</li>
                        </ul>
                    </div>
                </div>
                
                <div class="level-card level-9">
                    <div class="level-header">
                        <span class="level-number">Level 9</span>
                        <h3 class="level-title">System Core</h3>
                        <p class="level-subtitle">Digitaler Cyberspace</p>
                    </div>
                    <div class="level-content">
                        <p>Tauche ein in die digitale Welt, wo Viren, Firewalls und korrupte Programme lauern.</p>
                        <ul class="feature-list">
                            <li>Lag-Events und Systemausfälle stören das Spiel</li>
                            <li>Bugs, Hacker und Überwachungsdrohnen</li>
                            <li>Der Trojaner-Drache als finaler Boss</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- MOBS -->
        <section id="mobs">
            <h2>👾 Gegner</h2>
            <div class="info-box" style="margin-bottom:25px;">
                <p><strong>Hinweis:</strong> Gegner-Texturen werden prozedural generiert und variieren je nach Level-Thema. Die gezeigten Bilder sind repräsentative Darstellungen.</p>
            </div>
            <div class="entity-grid">
${mobsHTML}
            </div>
        </section>
        
        <!-- ITEMS -->
        <section id="items">
            <h2>🎒 Gegenstände & Sammelobjekte</h2>
${itemsHTML}
        </section>
        
        <!-- HAZARDS -->
        <section id="hazards">
            <h2>⚠️ Umweltgefahren</h2>
${hazardsHTML}
        </section>
        
        <!-- ENVIRONMENT -->
        <section id="environment">
            <h2>🌳 Umgebung & Strukturen</h2>
            <div class="entity-grid">
${environmentHTML}
            </div>
        </section>
        
        <!-- MECHANICS -->
        <section id="mechanics">
            <h2>⚙️ Spielmechanik</h2>
            
            <div class="info-box">
                <h3 style="margin-top: 0;">🎮 Steuerung</h3>
                <p><strong>Bewegung:</strong> WASD / Pfeiltasten</p>
                <p><strong>Schießen:</strong> Linksklick / Leertaste</p>
                <p><strong>Bombe platzieren:</strong> Rechtsklick / B</p>
                <p><strong>Brücke bauen:</strong> E (mit Materialien)</p>
            </div>
            
            <h3>❤️ Gesundheitssystem</h3>
            <p>Spieler starten mit 3 Herzen. Schaden entfernt Herzen. Sammle Gesundheitsherzen, um Gesundheit wiederherzustellen. Wenn alle Herzen verloren sind, endet das Spiel.</p>
            
            <h3>🔫 Kampf</h3>
            <p>Schieße auf Gegner, um sie zu besiegen. Jeder Gegner benötigt je nach Gesundheit unterschiedlich viele Treffer. Sammle Munitionskisten, um Munition aufzufüllen.</p>
            
            <h3>💣 Bomben</h3>
            <p>Platziere Bomben, um Flächenschaden zu verursachen. Bomben explodieren nach kurzer Verzögerung. Ideal für Gegnergruppen oder zum Zerstören von Hindernissen.</p>
            
            <h3>🌉 Brückenbau</h3>
            <p>Sammle Brückenmaterial, um Brücken über Schluchten und Lava zu bauen. Drücke E in der Nähe einer Lücke, um eine Brücke zu bauen (erfordert Materialien).</p>
            
            <h3>🎯 Ziel</h3>
            <p>Erreiche den Regenbogen am Ende jedes Levels, um es abzuschließen. Weiche Gegnern aus, sammle Gegenstände und überlebe, um alle 9 Level zu durchqueren.</p>
            
            <h3>🏆 Schwierigkeitsmodi</h3>
            <table>
                <thead><tr><th>Modus</th><th>Gegner</th><th>Spezielle Feinde</th><th>Empfohlen für</th></tr></thead>
                <tbody>
                    <tr><td>Leicht</td><td>Weniger</td><td>Keine</td><td>Neue Spieler</td></tr>
                    <tr><td>Schwer</td><td>Viele</td><td>Riesen, Zauberer, Bosse</td><td>Erfahrene Spieler</td></tr>
                </tbody>
            </table>
            
            <h3>⚔️ Schadensreferenz</h3>
            <table>
                <thead><tr><th>Quelle</th><th>Schaden</th><th>Typ</th><th>Hinweise</th></tr></thead>
                <tbody>
                    <tr><td>Einfacher Gegner</td><td>1 Herz</td><td>Kontakt</td><td>Berührungsschaden</td></tr>
                    <tr><td>Projektil</td><td>1 Herz</td><td>Fernkampf</td><td>Feuerbälle, Pfeile</td></tr>
                    <tr><td>Lava</td><td>1 Herz</td><td>Gefahr</td><td>Kontinuierlich bei Berührung</td></tr>
                    <tr><td>Falle</td><td>1 Herz</td><td>Gefahr</td><td>Stachelfallen</td></tr>
                    <tr><td>Spieler-Schuss</td><td>1 LP</td><td>Angriff</td><td>Dein Basisangriff</td></tr>
                    <tr><td>Bombe</td><td>3 LP</td><td>Fläche</td><td>Flächenschaden</td></tr>
                    <tr><td>💕 Herz-Man</td><td>2 LP/Schuss</td><td>Mittel</td><td>Auto-zielen Geschütz</td></tr>
                </tbody>
            </table>
        </section>
    </main>
    
    <footer>
        <p>🚴 Fahrrad-Abenteuer Spiel-Wiki</p>
        <p>Führe <code>node build-wiki.js</code> aus, um neu zu generieren</p>
    </footer>

    <script>
        // Smooth scroll
        document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
            });
        });
    </script>
</body>
</html>`;

    // Write the complete HTML file
    fs.writeFileSync(INDEX_FILE, html);
    console.log('✅ Statisches HTML in index.html generiert\n');

    // Generate images
    console.log('🎨 Bilder werden generiert...\n');
    try {
        execSync('node generate-images.js', { cwd: WIKI_DIR, stdio: 'inherit' });
    } catch (err) {
        console.error('⚠️  Bildgenerierung fehlgeschlagen. Führe "node generate-images.js" manuell aus.');
    }

    console.log('\n✅ Wiki-Erstellung abgeschlossen!');
}

build();
