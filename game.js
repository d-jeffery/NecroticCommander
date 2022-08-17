/*
    NecroticCommander
*/

'use strict';

// popup errors if there are any (help diagnose issues on mobile devices)
// onerror = (...parameters)=> alert(parameters);

let levelSize, cursor, necromancer, hudHeight;
let skeletonButton, explosionButton;
let units, graves;

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
    canvasFixedSize = vec2(720, 1280); // 720p
    levelSize = vec2(40, 72);
    hudHeight = 15;
    cameraPos = levelSize.scale(.5);
    necromancer = new Necromancer(vec2(levelSize.x / 2, 20));
    cursor = new Cursor(vec2(levelSize.x / 2, levelSize.y / 2))
    explosionButton = new ExplosionButton(vec2(levelSize.x - 8, 3))
    skeletonButton = new SkeletonButton(vec2(levelSize.x - 8, 9))
    units = [];

    graves = [];
    for(let i = -15; i < 17; i += 6) {
        for(let j = -15; j < 17; j += 6) {
            graves.push(new Grave(vec2(cameraPos.x + i, cameraPos.y + j + 8)))
        }
    }
}

/// ////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
    if (skeletonButton.selected && cursor.pos.y > hudHeight) {
        if (mouseIsDown(0) || gamepadIsDown(0)) {
            units.push(new Skeleton(cursor.pos))
        }
    }
}

/// ////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {

}

/// ////////////////////////////////////////////////////////////////////////////
function gameRender() {

}

/// ////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
    drawRect(cameraPos, levelSize.scale(2), new Color(.4, .4, .4), 0, false);
    drawRect(cameraPos, levelSize, new Color(0, .1, .1), 0, false);

    drawLine(vec2(0, 13), vec2(40, 13), 2, new Color(.4, .4, .4));

    const font = new FontImage();

    font.drawText("Health", vec2(1, 5).scale(2), 0.2);
    drawLine(vec2(1, 3.5).scale(2), vec2(necromancer.health + 1, 3.5).scale(2), 1, new Color(1, 0, 0));

    font.drawText("Mana", vec2(1, 2.5).scale(2), 0.2);
    drawLine(vec2(1, 1).scale(2), vec2(necromancer.mana + 1, 1).scale(2), 1, new Color(0, 0, 1));
}

/// ////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, 'tiles.png');
