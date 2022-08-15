/*
    NecroticCommander
*/

'use strict';

// popup errors if there are any (help diagnose issues on mobile devices)
// onerror = (...parameters)=> alert(parameters);

let levelSize, cursor, necromancer;

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  canvasFixedSize = vec2(720, 1280); // 720p
  levelSize = vec2(40, 72);
  cameraPos = levelSize.scale(.5);
  cursor = new Cursor(vec2(levelSize.x/2, levelSize.y/2))
  necromancer = new Necromancer(vec2(levelSize.x/2,2));
}

/// ////////////////////////////////////////////////////////////////////////////
function gameUpdate() {

}

/// ////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {

}

/// ////////////////////////////////////////////////////////////////////////////
function gameRender() {
  drawRect(cameraPos, levelSize.scale(2), new Color(.4,.4,.4));
  drawRect(cameraPos, levelSize, new Color(.1,.1,.1));
}

/// ////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {

}

/// ////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, 'tiles.png');
