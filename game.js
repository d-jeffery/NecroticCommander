/*
    NecroticCommander

    TODO:
    Fix cursor targeting
    Attack animations
    Add waves of enemies
    Add Knights to embolden the peasants
    Introduction to set the scene
    Polish UI
*/

'use strict';

// popup errors if there are any (help diagnose issues on mobile devices)
// onerror = (...parameters)=> alert(parameters);

showWatermark = 0;

let levelSize, tileLayer, cursor, necromancer;
let summonButton, explosionButton, netherBoltButton, drainSoulButton;
let summons, enemies, graves;
let hudHeight, endTime, screenShake;

const Scene = {
    Intro: 'Intro',
    Game: 'Game'
}

let currentScreen = Scene.Intro;

function startGame() {
    necromancer = new Necromancer(vec2(levelSize.x / 2, 22));
    cursor = new Cursor(vec2(levelSize.x / 2, levelSize.y / 2));

    hudHeight = 15;
    endTime = 1;
    screenShake = 0;

    explosionButton = new CorpseBombButton(vec2(levelSize.x - 19.5, 4));
    summonButton = new RaiseDeadButton(vec2(levelSize.x - 7.5, 10));
    netherBoltButton = new NetherBoltButton(vec2(levelSize.x - 19.5, 10));
    drainSoulButton = new DrainSoulButton(vec2(levelSize.x - 7.5, 4));

    graves = [];
    enemies = [];
    summons = [];

    for(let i = -15; i < 17; i += 6) {
        enemies.push(new Peasant(vec2(cameraPos.x + i, cameraPos.y + 34)))
    }

    for(let i = -18; i < 20; i += 6) {
        for(let j = -18; j < 20; j += 6) {
            if (i === 0) continue;
            graves.push(new Grave(vec2(cameraPos.x + i, cameraPos.y + j + 8)))
        }
    }
}

function makeTileLayers(size) {
    initTileCollision(size)

    tileLayer = new TileLayer(vec2(0, 0), size, vec2(16), vec2(4));
    tileLayer.renderOrder = 10;

    for(let pos = vec2(5, hudHeight); pos.y < size.y; pos.y++) {
        tileLayer.setData(pos, new TileLayerData(16));
    }

    tileLayer.redraw();
}

function tearDown() {
    graves.forEach((g) => g.destroy());
    enemies.forEach((e) => e.destroy());
    summons.forEach((s) => s.destroy());
}

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
    canvasFixedSize = vec2(720, 1280); // 720p
    levelSize = vec2(44, 80);
    cameraPos = levelSize.scale(0.5);
    cameraScale = 16;

    makeTileLayers(levelSize);

    startGame();
}

/// ////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
    if (currentScreen === Scene.Intro) {
        //paused = true;
    }
}

/// ////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {
    graves = graves.filter((g) => !g.destroyed);
    enemies = enemies.filter((e) => !e.destroyed);
    summons = summons.filter((s) => !s.destroyed);

    if (screenShake > 0) {
        cameraPos.x += rand(-1, 1);
        screenShake -= timeDelta;
    } else {
        cameraPos = levelSize.scale(0.5);
    }

    if (necromancer.health <= 0) {
        endTime -= timeDelta;
        necromancer.health = 0;
        necromancer.destroy()
        if (endTime <= 0) {
            paused = true;
        }
        if (paused && (mouseIsDown(0) || gamepadIsDown(0))) {
            paused = false;
            tearDown();
            gameInit();
        }
    }
}

/// ////////////////////////////////////////////////////////////////////////////
function gameRender() {
    if (currentScreen === Scene.Intro) {
        if (mouseIsDown(0) || gamepadIsDown(0)) {
            currentScreen = Scene.Game;
            //paused = false;
        }
        return;
    }


    const font = new FontImage();
    drawRect( cameraPos,  levelSize, new Color(0, .1, .1), 0, false);

    drawRect(vec2(22, 7), vec2(levelSize.x, 15), new Color(.4, .4, .4), 0, false);
    drawRect(vec2(22, 7), vec2(levelSize.x - 3, 12), 2, new Color(1, 1, 1), false);

    const healthY = 9;
    const healthX = necromancer.health * 0.14;

    font.drawText(`Health (${necromancer.health})`, vec2(10, 12), 0.18, true);
    drawLine(vec2(2, healthY), vec2(18, healthY), 2, new Color(0.5, 0.5, 0.5))
    if (necromancer.health > 0) {
        drawLine(vec2(3, healthY), vec2( 3 + healthX, healthY), 1, new Color(1, 0, 0))
    }

    const manaY = 3;
    const manaX = Math.floor(necromancer.mana * 0.14);

    font.drawText(`Mana (${Math.floor(necromancer.mana)})`, vec2(10, 6), 0.18, true);
    drawLine(vec2(2, manaY), vec2(18, manaY), 2, new Color(0.5, 0.5, 0.5))
    if (necromancer.mana > 0) {
        drawLine(vec2(3, manaY), vec2(3 + manaX, manaY), 1, new Color(0, 0, 1))
    }
}

/// ////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
    const font = new FontImage();
    if (currentScreen === Scene.Intro) {
        drawRect( cameraPos,  levelSize, new Color(0, 0, 0), 0, true);
        font.drawText("Necrotic\nCommander", vec2(cameraPos.x, cameraPos.y + 24), 0.6, true);
        font.drawText("Click to Begin", vec2(cameraPos.x, cameraPos.y), 0.4, true);
        drawTile(vec2(cameraPos.x, cameraPos.y + 8 + Math.sin(timeReal)), vec2(8), 18, tileSizeDefault, new Color(1,1,1), 0, 0, new Color(0,0,0,0), true);
        return;
    }

    if (necromancer.health === 0 && endTime <= 0) {
        drawRect(vec2(cameraPos.x, cameraPos.y + 10), vec2(35, 25), new Color(0, 0, 0), 0, true);
        font.drawText("YOUR REIGN\nHAS ENDED\n\nClick to\nretry", vec2(cameraPos.x, cameraPos.y + 18), 0.4, true);
    }
}

/// ////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, 'tiles.png');
