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

let levelSize, tileLayer, cursor, necromancer, hudHeight;
let summonButton, explosionButton, spreadDecay, regenManaButton;
let summons, enemies, graves;

function startGame() {
    necromancer = new Necromancer(vec2(levelSize.x / 2, 20));
    cursor = new Cursor(vec2(levelSize.x / 2, levelSize.y / 2))

    explosionButton = new CorpseBombButton(vec2(levelSize.x - 20, 4))
    summonButton = new RaiseDeadButton(vec2(levelSize.x - 8, 10))
    spreadDecay = new SpreadDecayButton(vec2(levelSize.x - 20, 10))
    regenManaButton = new RegenManaButton(vec2(levelSize.x - 8, 4))

    graves = [];
    enemies = [];
    summons = [];

    for(let i = -15; i < 17; i += 6) {
        enemies.push(new Peasant(vec2(cameraPos.x + i, cameraPos.y + 34)))
    }

    for(let i = -15; i < 17; i += 6) {
        for(let j = -15; j < 17; j += 6) {
            graves.push(new Grave(vec2(cameraPos.x + i, cameraPos.y + j + 8)))
        }
    }
}


function makeTileLayers(size) {
    initTileCollision(size)

    tileLayer = new TileLayer(vec2(0, 0), size, vec2(16), vec2(3));
    tileLayer.renderOrder = 2;

    let pos = vec2(0, 21);
    while(pos.x < (levelSize.x / 3)) {
        if (!(pos.x >= 5 && pos.x <= 8)) {
            setTileCollisionData(pos.scale(3), 1);
            tileLayer.setData(pos, new TileLayerData(16));
        }
        pos.x++
    }

    pos = vec2(0, 21);
    while(pos.y-- > 5) {
        setTileCollisionData(pos.scale(3), 1);
        tileLayer.setData(pos, new TileLayerData(17));
    }

    pos = vec2(13, 21);
    while(pos.y-- > 5) {
        setTileCollisionData(pos.scale(3), 1);
        tileLayer.setData(pos, new TileLayerData(17));
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
    cameraScale = 16

    //makeTileLayers(levelSize);
    //
    // initTileCollision(vec2(16, 16));
    // const tileLayer = new TileLayer(vec2(), levelSize, tileSizeDefault);
    //
    //
    // console.log(tileCollisionSize)
    // const pos = vec2(0, tileCollisionSize.y - 8);
    //
    // const data = new TileLayerData(16);
    // tileLayer.setData(vec2(15,20), data);
    //
    //
    // for (pos.x = tileCollisionSize.x; pos.x--;) {
    //         setTileCollisionData(pos, 1);
    //         const data = new TileLayerData(16);
    //         tileLayer.setData(pos, data);
    // }
    // tileLayer.redraw();

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
    drawRect( cameraPos,  levelSize, new Color(0, .1, .1), 0, false);

    drawRect(vec2(22, 7), vec2(levelSize.x, 15), new Color(.4, .4, .4), 0, false);
    drawRect(vec2(22, 7), vec2(levelSize.x - 3, 12), 2, new Color(1, 1, 1), false);

    const healthY = 9;
    font.drawText("Health", vec2(2, 12), 0.2);
    drawLine(vec2(2, 9), vec2(10 * 1.5 + 0.5, healthY), 2, new Color(0.5, 0.5, 0.5));
    if (necromancer.health) {
        drawLine(vec2(2.5, healthY), vec2(necromancer.health * 1.5 / 10, healthY), 1, new Color(1, 0, 0));
    }

    const manaY = 3;
    font.drawText("Mana", vec2(2, 6), 0.2);
    drawLine(vec2(2, manaY), vec2(10 * 1.5 + 0.5, manaY), 2, new Color(0.5, 0.5, 0.5));
    if (necromancer.mana) {
        drawLine(vec2(2.5, manaY), vec2(necromancer.mana * 1.5, manaY), 1, new Color(0, 0, 1));
    }
}

/// ////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
    const font = new FontImage();
    if (necromancer.health === 0) {
        drawRect(cameraPos, vec2(35, 25), new Color(0, 0, 0), 0, true);

        font.drawText("YOU HAVE\nDIED\n\nClick to\nrestart", vec2(cameraPos.x, cameraPos.y + 8), 0.4, true);
    }
}

/// ////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, 'tiles.png');
