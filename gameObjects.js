class Necromancer extends EngineObject {
    constructor(pos) {
        super(pos, vec2(4), 0);

        // set to collide
        this.setCollision(0, 0);
        this.mass = 0;
    }
}

///////////////////////////////////////////////////////////////////////////////
class Cursor extends EngineObject {
  constructor(pos) {
    super(pos, vec2(2), 1, tileSizeDefault, 0);

    // set to collide
    this.setCollision(0, 0);
    this.mass = 0;
    this.addChild(new ParticleEmitter(
        vec2(0, 0), 0, objectDefaultSize, 0, 2, 0,  // pos, angle, emitSize, emitTime, emitRate, emiteCone
        0, tileSizeDefault,                              // tileIndex, tileSize
        new Color(1,0,0),   new Color(0,0,0),   // colorStartA, colorStartB
        new Color(1,0,0,0), new Color(0,0,0,0), // colorEndA, colorEndB
        2, .2, .2, .1, .05,  // particleTime, sizeStart, sizeEnd, particleSpeed, particleAngleSpeed
        .99, 1, 1, PI, .05,  // damping, angleDamping, gravityScale, particleCone, fadeRate,
        .5, 0                // randomness, collide, additive, randomColorLinear, renderOrder
    ), vec2(0,-0.5), PI);
  }

  update() {
    if (isUsingGamepad) {
      // control with gamepad
      this.pos.x += gamepadStick(0).x;
      this.pos.y += gamepadStick(0).y;
    } else {
      // move to mouse
      this.pos.x = mousePos.x;
      this.pos.y = mousePos.y;
    }
    this.pos.x = clamp(this.pos.x, this.size.x / 2, levelSize.x - this.size.x / 2);
    this.pos.y = clamp(this.pos.y, this.size.y / 2, levelSize.y - this.size.y / 2);
  }
}
