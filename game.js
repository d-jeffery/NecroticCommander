/*
    NecroticCommander

    TODO:
    Attack animations & health bars
    Add waves of enemies
    Add Knights to embolden the peasants
    Actually decide what it does, and implement, "Corpse explosion"
    Sprite for the necromancer, sitting in his tower
    Introduction to set the scene
    Polish UI
*/

'use strict';

// popup errors if there are any (help diagnose issues on mobile devices)
// onerror = (...parameters)=> alert(parameters);

let levelSize, cursor, necromancer, hudHeight;
let summonButton, explosionButton, causeFear, drainSoul;
let summons, enemies, graves;

let hudY = 13;


function startGame() {
    necromancer = new Necromancer(vec2(levelSize.x / 2, 20));
    cursor = new Cursor(vec2(levelSize.x / 2, levelSize.y / 2))
    explosionButton = new CorpseBombButton(vec2(levelSize.x - 6, 3))
    summonButton = new RaiseDeadButton(vec2(levelSize.x - 6, 9))
    causeFear = new CauseFearButton(vec2(levelSize.x - 18, 3))
    drainSoul = new DrainSoulButton(vec2(levelSize.x - 18, 9))

    graves = [];
    enemies = [];
    summons = [];

    for(let i = -15; i < 17; i += 6) {
        enemies.push(new Peasant(vec2(cameraPos.x + i, cameraPos.y + 32)))
    }

    for(let i = -15; i < 17; i += 6) {
        for(let j = -15; j < 17; j += 6) {
            graves.push(new Grave(vec2(cameraPos.x + i, cameraPos.y + j + 8)))
        }
    }
}

function tearDown() {
    graves.forEach((g) => g.destroy());
    enemies.forEach((e) => e.destroy());
    summons.forEach((s) => s.destroy());
}

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
    canvasFixedSize = vec2(720, 1280); // 720p
    levelSize = vec2(40, 72);
    hudHeight = 15;
    cameraPos = levelSize.scale(.5);

    startGame();
}

/// ////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
    // if (skeletonButton.selected && cursor.pos.y > hudHeight) {
    //     if (mouseIsDown(0) || gamepadIsDown(0)) {
    //         units.push(new Skeleton(cursor.pos))
    //     }
    // }


}

/// ////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {
    graves = graves.filter((g) => !g.destroyed);
    enemies = enemies.filter((e) => !e.destroyed);
    summons = summons.filter((s) => !s.destroyed);

    if (necromancer.health <= 0) {
        necromancer.health = 0;
        necromancer.destroy()
        paused = true;
        if (mouseIsDown(0) || gamepadIsDown(0)) {
            paused = false;
            tearDown();
            gameInit();
        }
    }
}

/// ////////////////////////////////////////////////////////////////////////////
function gameRender() {
    const font = new FontImage();
    drawRect(cameraPos, levelSize.scale(2), new Color(.4, .4, .4), 0, false);
    drawRect(cameraPos, levelSize, new Color(0, .1, .1), 0, false);

    drawLine(vec2(0, 13.5), vec2(40, 13.5), 2, new Color(.4, .4, .4));
    drawRect(vec2(20, 6), vec2(40, 13.5), 2, new Color(1, 1, 1), false);

    font.drawText("Health", vec2(1, 11), 0.2);
    drawLine(vec2(0.5, 7.5), vec2(10 * 1.5 + 0.5, 7.5), 2, new Color(0.5, 0.5, 0.5));
    if (necromancer.health) {
        drawLine(vec2(1, 7.5), vec2(necromancer.health * 1.5 / 10, 7.5), 1, new Color(1, 0, 0));
    }

    font.drawText("Mana", vec2(1, 5.5), 0.2);
    drawLine(vec2(0.5, 2), vec2(10 * 1.5 + 0.5, 2), 2, new Color(0.5, 0.5, 0.5));
    if (necromancer.mana) {
        drawLine(vec2(1, 2), vec2(necromancer.mana * 1.5, 2), 1, new Color(0, 0, 1));
    }
}

/// ////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
    const font = new FontImage();
    if (necromancer.health === 0) {
        drawRect(vec2(20, 39), vec2(35, 25), new Color(0, 0, 0), 0, true);

        font.drawText("YOU HAVE\nDIED\n\nClick to\nrestart", vec2(20, 40 + hudY/2), 0.4, true);
    }
}

/// ////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, 'tiles.png');
